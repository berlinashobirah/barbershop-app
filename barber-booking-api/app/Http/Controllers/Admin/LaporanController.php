<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LaporanController extends Controller
{
    private function checkAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak. Anda bukan Admin.'], 403);
        }
        return null;
    }

    /** Apply optional month filter to a query. No month = all time. */
    private function applyMonth($query, ?string $month, string $dateCol = 'booking_date')
    {
        if ($month) {
            $parts = explode('-', $month);
            if (count($parts) === 2) {
                $query->whereYear($dateCol, $parts[0])
                      ->whereMonth($dateCol, $parts[1]);
            }
        }
        // If no month given → no date restriction (show all time)
        return $query;
    }

    /**
     * GET /admin/laporan/stats
     */
    public function stats(Request $request)
    {
        $denied = $this->checkAdmin($request);
        if ($denied) return $denied;

        $month = $request->query('month');

        $query = Booking::query()->where('status', '!=', 'cancelled');
        $this->applyMonth($query, $month);

        $totalBooking = (clone $query)->count();
        $completed    = (clone $query)->where('status', 'completed')->count();
        $revenue      = (clone $query)->where('status', 'completed')->sum('total_amount');
        $totalMembers = \App\Models\User::where('role', 'member')->count();

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

        $month = $request->query('month');

        if ($month) {
            // Daily chart for the selected month
            $parts = explode('-', $month);
            $year  = (int)($parts[0] ?? now()->year);
            $mon   = (int)($parts[1] ?? now()->month);

            $rows = DB::table('bookings')
                ->selectRaw('EXTRACT(DAY FROM booking_date)::int AS day, SUM(total_amount) AS revenue, COUNT(*) AS bookings')
                ->whereYear('booking_date', $year)
                ->whereMonth('booking_date', $mon)
                ->where('status', 'completed')
                ->groupByRaw('EXTRACT(DAY FROM booking_date)')
                ->orderByRaw('EXTRACT(DAY FROM booking_date)')
                ->get();

            $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $mon, $year);
            $chart = [];
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $chart[$d] = ['day' => $d, 'label' => (string)$d, 'revenue' => 0, 'bookings' => 0];
            }
            foreach ($rows as $row) {
                $chart[(int)$row->day] = [
                    'day'      => (int) $row->day,
                    'label'    => (string)(int) $row->day,
                    'revenue'  => (int) $row->revenue,
                    'bookings' => (int) $row->bookings,
                ];
            }

            return response()->json(['status' => 'success', 'data' => array_values($chart), 'mode' => 'daily']);
        } else {
            // Monthly chart for all time (group by year-month)
            $rows = DB::table('bookings')
                ->selectRaw(
                    "EXTRACT(YEAR FROM booking_date)::int AS yr, " .
                    "EXTRACT(MONTH FROM booking_date)::int AS mon, " .
                    "SUM(total_amount) AS revenue, COUNT(*) AS bookings"
                )
                ->where('status', 'completed')
                ->groupByRaw('EXTRACT(YEAR FROM booking_date), EXTRACT(MONTH FROM booking_date)')
                ->orderByRaw('EXTRACT(YEAR FROM booking_date), EXTRACT(MONTH FROM booking_date)')
                ->get();

            $monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
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

        $month = $request->query('month');

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

        if ($month) {
            $parts = explode('-', $month);
            if (count($parts) === 2) {
                $query->whereYear('bookings.booking_date', $parts[0])
                      ->whereMonth('bookings.booking_date', $parts[1]);
            }
        }

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

        $month = $request->query('month');

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

        if ($month) {
            $parts = explode('-', $month);
            if (count($parts) === 2) {
                $query->whereYear('bookings.booking_date', $parts[0])
                      ->whereMonth('bookings.booking_date', $parts[1]);
            }
        }

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

        $month  = $request->query('month');
        $status = $request->query('status', 'all');

        $query = Booking::with(['user', 'barber']);

        if ($month) {
            $parts = explode('-', $month);
            if (count($parts) === 2) {
                $query->whereYear('booking_date', $parts[0])
                      ->whereMonth('booking_date', $parts[1]);
            }
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $query->orderBy('booking_date', 'desc')->orderBy('booking_time', 'desc');
        $paginated = $query->paginate(15);

        $items = collect($paginated->items())->map(function ($booking) {
            $serviceName = DB::table('booking_details')
                ->join('services', 'booking_details.service_id', '=', 'services.id')
                ->where('booking_details.booking_id', $booking->id)
                ->value('services.name') ?? '-';

            return [
                'id'             => $booking->id,
                'unique_code'    => $booking->unique_code,
                'customer_name'  => $booking->guest_name ?? ($booking->user?->name ?? 'N/A'),
                'customer_type'  => $booking->user_id ? 'Member' : 'Guest',
                'barber_name'    => $booking->barber?->name ?? 'Belum ditentukan',
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
            'total'        => $paginated->total(),
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
        ]);
    }
}
