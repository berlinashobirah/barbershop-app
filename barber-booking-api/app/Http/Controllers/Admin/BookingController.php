<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    private function autoCancelExpiredBookings()
    {
        $nowDate = now()->toDateString();
        // Cancelkan jika sudah lewat 1 jam setelah jam booking
        $oneHourAgoTime = now()->subHour()->toTimeString();

        Booking::where('status', 'pending')
            ->where(function ($query) use ($nowDate, $oneHourAgoTime) {
                // Kondisi 1: Cancelkan jika tanggal booking sudah lewat (kemarin, dst)
                $query->where('booking_date', '<', $nowDate)
                    // Kondisi 2: Cancelkan jika tanggal today, TAPI sudah lewat 1 jam lebih of jam booking
                    ->orWhere(function ($q) use ($nowDate, $oneHourAgoTime) {
                        $q->where('booking_date', $nowDate)
                            ->where('booking_time', '<', $oneHourAgoTime);
                    });
            })
            ->update(['status' => 'cancelled']);
    }

    public function today(Request $request)
    {
        // 1. Cek apakah yang akses ini benar-benar Admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Access denied. You are not an Admin.'], 403);
        }

        $this->autoCancelExpiredBookings();

        // 2. Ambil tanggal today secara dinamis (format: YYYY-MM-DD)
        $today = now()->toDateString();

        // 3. Tarik data antrean khusus today beserta layanan
        $todayBookings = Booking::with(['user', 'barber'])
            ->where('booking_date', $today)
            ->orderBy('booking_time', 'asc')
            ->get()
            ->map(function ($booking) {
                // Ambil nama layanan of booking_details
                $serviceName = DB::table('booking_details')
                    ->join('services', 'booking_details.service_id', '=', 'services.id')
                    ->where('booking_details.booking_id', $booking->id)
                    ->value('services.name') ?? '-';

                return [
                    'id'           => $booking->id,
                    'unique_code'  => $booking->unique_code,
                    'customer_name' => $booking->guest_name ?? ($booking->user?->name ?? 'N/A'),
                    'customer_phone' => $booking->guest_phone ?? ($booking->user?->phone ?? '-'),
                    'customer_type' => $booking->user_id ? 'Member' : 'Guest',
                    'barber_name'  => $booking->barber?->name ?? 'Unassigned',
                    'service_name' => $serviceName,
                    'booking_date' => $booking->booking_date,
                    'booking_time' => $booking->booking_time,
                    'status'       => $booking->status,
                    'payment_status' => $booking->payment_status,
                    'total_amount' => $booking->total_amount,
                ];
            });

        return response()->json([
            'status' => 'success',
            'message' => 'Data antrean today berhasil diambil',
            'data' => $todayBookings
        ]);
    }

    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Access denied. You are not an Admin.'], 403);
        }

        $this->autoCancelExpiredBookings();

        $query = Booking::with(['user', 'barber']);

        // Filter berdasarkan status jika ada
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter hanya today jika diminta
        if ($request->has('today') && $request->today == 'true') {
            $query->where('booking_date', now()->toDateString());
        }

        // Filter berdasarkan tanggal jika ada
        if ($request->has('date') && !empty($request->date)) {
            $query->where('booking_date', $request->date);
        }

        // Pencarian berdasarkan nama customer atau kode unik
        if ($request->has('search') && !empty($request->search)) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(unique_code) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(guest_name) LIKE ?', ["%{$search}%"])
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]);
                    });
            });
        }

        // Urutkan of terbaru
        $query->orderBy('booking_date', 'desc')->orderBy('booking_time', 'desc');

        // Pagination: 10 per halaman, unless limit=all is requested for printing
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
            $paged = $query->paginate(10);
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
                'id'            => $booking->id,
                'unique_code'   => $booking->unique_code,
                'customer_name' => $booking->guest_name ?? ($booking->user?->name ?? 'N/A'),
                'customer_phone' => $booking->guest_phone ?? ($booking->user?->phone ?? '-'),
                'customer_type' => $booking->user_id ? 'Member' : 'Guest',
                'barber_name'   => $booking->barber?->name ?? 'Unassigned',
                'service_name'  => $serviceName,
                'booking_date'  => $booking->booking_date,
                'booking_time'  => $booking->booking_time,
                'status'        => $booking->status,
                'payment_status' => $booking->payment_status,
                'total_amount'  => $booking->total_amount,
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

    public function updateStatus(Request $request, $id)
    {
        // Cek apakah yang akses ini benar-benar Admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Access denied. You are not an Admin.'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,arrived,processing,completed,cancelled'
        ]);

        $booking = Booking::with(['user', 'services'])->findOrFail($id);
        $booking->status = $request->status;

        // Berikan poin jika status berubah jadi completed dan belum diberikan
        if ($booking->status === 'completed' && !$booking->points_awarded && $booking->user_id) {
            $totalPoints = 0;
            foreach ($booking->services as $service) {
                $totalPoints += $service->points_reward;
            }

            $user = $booking->user;
            $user->points += $totalPoints;
            $user->save();

            $booking->points_awarded = true;
        }

        $booking->save();

        return response()->json([
            'message' => 'Status antrean berhasil diupdate menjadi ' . $booking->status,
            'data' => $booking
        ]);
    }
}
