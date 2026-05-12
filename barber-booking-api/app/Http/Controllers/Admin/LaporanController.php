<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LaporanController extends Controller
{
    private function checkAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Access denied. You are not an Admin.'], 403);
        }
        return null;
    }

    /** Apply date filters: Supports explicit range or legacy monthly string. */
    private function applyDateRange(Request $request, $query, string $dateCol = 'booking_date')
    {
        $start = $request->query('start_date');
        $end   = $request->query('end_date');
        $month = $request->query('month');

        if ($start && $end) {
            $query->whereBetween($dateCol, [$start, $end]);
        } elseif ($month) {
            $parts = explode('-', $month);
            if (count($parts) === 2) {
                $query->whereYear($dateCol, $parts[0])
                      ->whereMonth($dateCol, $parts[1]);
            }
        }
        return $query;
    }

    /**
     * GET /admin/laporan/stats
     */
    public function stats(Request $request)
    {
        $denied = $this->checkAdmin($request);
        if ($denied) return $denied;

        $query = Booking::query()->where('status', '!=', 'cancelled');
        $this->applyDateRange($request, $query);

        $totalBooking = (clone $query)->count();
        $completed    = (clone $query)->where('status', 'completed')->count();
        $revenue      = (clone $query)->where('status', 'completed')->sum('total_amount');
        $totalMembers = User::where('role', 'member')->count();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'total_booking' => $totalBooking,
                'completed'     => $completed,
                'revenue'       => (int) $revenue,
                'total_members' => $totalMembers,
            ]
        ]);
    }

    /**
     * GET /admin/laporan/revenue-chart
     * When month given → show daily bars for that month.
     * When no month   → show monthly bars for current year.
     */
    public function revenueChart(Request $request)
    {
        $denied = $this->checkAdmin($request);
        if ($denied) return $denied;

        $start = $request->query('start_date');
        $end   = $request->query('end_date');
        $month = $request->query('month');

        // CASE 1: Explicit Date Range OR Month specified -> Plot DAILY aggregates
        if (($start && $end) || $month) {
            $query = DB::table('bookings')
                ->selectRaw("booking_date, SUM(total_amount) AS revenue, COUNT(*) AS bookings")
                ->where('status', 'completed');

            if ($start && $end) {
                $query->whereBetween('booking_date', [$start, $end]);
            } else {
                $parts = explode('-', $month);
                $query->whereYear('booking_date', $parts[0])->whereMonth('booking_date', $parts[1]);
            }

            $rows = $query->groupBy('booking_date')->orderBy('booking_date')->get();

            $chart = $rows->map(fn($r) => [
                'day'      => $r->booking_date,
                'label'    => date('d M', strtotime($r->booking_date)),
                'revenue'  => (int)$r->revenue,
                'bookings' => (int)$r->bookings,
            ]);

            return response()->json(['status' => 'success', 'data' => $chart, 'mode' => 'daily']);
        } 
        
        // CASE 2: Default All-Time -> Plot MONTHLY aggregates
        else {
            $driver = DB::getDriverName();
            
            if ($driver === 'pgsql') {
                $rows = DB::table('bookings')
                    ->selectRaw(
                        "EXTRACT(YEAR FROM booking_date) AS yr, " .
                        "EXTRACT(MONTH FROM booking_date) AS mon, " .
                        "SUM(total_amount) AS revenue, COUNT(*) AS bookings"
                    )
                    ->where('status', 'completed')
                    ->groupByRaw("EXTRACT(YEAR FROM booking_date), EXTRACT(MONTH FROM booking_date)")
                    ->orderByRaw("EXTRACT(YEAR FROM booking_date) ASC, EXTRACT(MONTH FROM booking_date) ASC")
                    ->get();
            } else {
                $rows = DB::table('bookings')
                    ->selectRaw(
                        "YEAR(booking_date) AS yr, " .
                        "MONTH(booking_date) AS mon, " .
                        "SUM(total_amount) AS revenue, COUNT(*) AS bookings"
                    )
                    ->where('status', 'completed')
                    ->groupByRaw('YEAR(booking_date), MONTH(booking_date)')
                    ->orderByRaw('YEAR(booking_date) ASC, MONTH(booking_date) ASC')
                    ->get();
            }

            $monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            $chart = $rows->map(fn($r) => [
                'day'      => (int)$r->mon,
                'label'    => $monthNames[(int)$r->mon - 1] . ' ' . $r->yr,
                'revenue'  => (int)$r->revenue,
                'bookings' => (int)$r->bookings,
            ])->values()->toArray();

            return response()->json(['status' => 'success', 'data' => $chart, 'mode' => 'monthly']);
        }
    }

    /**
     * GET /admin/laporan/popular-services
     */
    public function popularServices(Request $request)
    {
        $denied = $this->checkAdmin($request);
        if ($denied) return $denied;

        $query = DB::table('booking_details')
            ->join('services', 'booking_details.service_id', '=', 'services.id')
            ->join('bookings', 'booking_details.booking_id', '=', 'bookings.id')
            ->where('bookings.status', 'completed')
            ->select(
                'services.id',
                'services.name',
                DB::raw('COUNT(booking_details.id) AS total_booked'),
                DB::raw('SUM(booking_details.price_snapshot) AS total_revenue')
            );

        $this->applyDateRange($request, $query, 'bookings.booking_date');

        $services = $query
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('total_booked')
            ->limit(6)
            ->get();

        $total  = $services->sum('total_booked');
        $result = $services->map(function ($s) use ($total) {
            return [
                'id'            => $s->id,
                'name'          => $s->name,
                'total_booked'  => (int) $s->total_booked,
                'total_revenue' => (int) $s->total_revenue,
                'percentage'    => $total > 0 ? round(($s->total_booked / $total) * 100, 1) : 0,
            ];
        });

        return response()->json(['status' => 'success', 'data' => $result]);
    }

    /**
     * GET /admin/laporan/barber-performance
     */
    public function barberPerformance(Request $request)
    {
        $denied = $this->checkAdmin($request);
        if ($denied) return $denied;

        $query = DB::table('bookings')
            ->join('barbers', 'bookings.barber_id', '=', 'barbers.id')
            ->where('bookings.status', 'completed')
            ->select(
                'barbers.id',
                'barbers.name',
                'barbers.image',
                DB::raw('COUNT(bookings.id) AS total_sessions'),
                DB::raw('SUM(bookings.total_amount) AS total_revenue')
            );

        $this->applyDateRange($request, $query, 'bookings.booking_date');

        $barbers = $query
            ->groupBy('barbers.id', 'barbers.name', 'barbers.image')
            ->orderByDesc('total_sessions')
            ->get();

        $result = $barbers->map(function ($b) {
            return [
                'id'             => $b->id,
                'name'           => $b->name,
                'image'          => $b->image ? url('storage/' . $b->image) : null,
                'total_sessions' => (int) $b->total_sessions,
                'total_revenue'  => (int) $b->total_revenue,
            ];
        });

        return response()->json(['status' => 'success', 'data' => $result]);
    }

    /**
     * GET /admin/laporan/bookings
     */
    public function bookingList(Request $request)
    {
        $denied = $this->checkAdmin($request);
        if ($denied) return $denied;

        $status = $request->query('status', 'all');

        $query = Booking::with(['user', 'barber']);
        $this->applyDateRange($request, $query);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $query->orderBy('booking_date', 'desc')->orderBy('booking_time', 'desc');
        
        // Support full non-paginated dump for printing
        if ($request->query('limit') === 'all') {
            $results = $query->get();
            $paginated = (object) [
                'total' => $results->count(),
                'currentPage' => 1,
                'lastPage' => 1,
                'items' => $results
            ];
            $iterableItems = $results;
        } else {
            $paged = $query->paginate(15);
            $paginated = (object) [
                'total' => $paged->total(),
                'currentPage' => $paged->currentPage(),
                'lastPage' => $paged->lastPage(),
                'items' => collect($paged->items())
            ];
            $iterableItems = $paginated->items;
        }

        $items = $iterableItems->map(function ($booking) {
            $serviceName = DB::table('booking_details')
                ->join('services', 'booking_details.service_id', '=', 'services.id')
                ->where('booking_details.booking_id', $booking->id)
                ->value('services.name') ?? '-';

            return [
                'id'             => $booking->id,
                'unique_code'    => $booking->unique_code,
                'customer_name'  => $booking->guest_name ?? ($booking->user?->name ?? 'N/A'),
                'customer_type'  => $booking->user_id ? 'Member' : 'Guest',
                'barber_name'    => $booking->barber?->name ?? 'Unassigned',
                'service_name'   => $serviceName,
                'booking_date'   => $booking->booking_date,
                'booking_time'   => $booking->booking_time,
                'status'         => $booking->status,
                'payment_status' => $booking->payment_status,
                'total_amount'   => $booking->total_amount,
            ];
        });

        return response()->json([
            'status'       => 'success',
            'data'         => $items,
            'total'        => $paginated->total,
            'current_page' => $paginated->currentPage,
            'last_page'    => $paginated->lastPage,
        ]);
    }
}
