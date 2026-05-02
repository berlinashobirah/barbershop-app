<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function today(Request $request)
    {
        // 1. Cek apakah yang akses ini benar-benar Admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak. Anda bukan Admin.'], 403);
        }

        // 2. Ambil tanggal hari ini secara dinamis (format: YYYY-MM-DD)
        $today = now()->toDateString();

        // 3. Tarik data antrean khusus hari ini beserta layanan
        $todayBookings = Booking::with(['user', 'barber'])
            ->where('booking_date', $today)
            ->orderBy('booking_time', 'asc')
            ->get()
            ->map(function ($booking) {
                // Ambil nama layanan dari booking_details
                $serviceName = \Illuminate\Support\Facades\DB::table('booking_details')
                    ->join('services', 'booking_details.service_id', '=', 'services.id')
                    ->where('booking_details.booking_id', $booking->id)
                    ->value('services.name') ?? '-';

                return [
                    'id'           => $booking->id,
                    'unique_code'  => $booking->unique_code,
                    'customer_name'=> $booking->guest_name ?? ($booking->user?->name ?? 'N/A'),
                    'customer_phone'=> $booking->guest_phone ?? ($booking->user?->phone ?? '-'),
                    'customer_type'=> $booking->user_id ? 'Member' : 'Guest',
                    'barber_name'  => $booking->barber?->name ?? 'Belum ditentukan',
                    'service_name' => $serviceName,
                    'booking_date' => $booking->booking_date,
                    'booking_time' => $booking->booking_time,
                    'status'       => $booking->status,
                    'payment_status'=> $booking->payment_status,
                    'total_amount' => $booking->total_amount,
                ];
            });

        return response()->json([
            'status' => 'success',
            'message' => 'Data antrean hari ini berhasil diambil',
            'data' => $todayBookings
        ]);
    }

    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak. Anda bukan Admin.'], 403);
        }

        $query = Booking::with(['user', 'barber']);

        // Filter berdasarkan status jika ada
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter hanya hari ini jika diminta
        if ($request->has('today') && $request->today == 'true') {
            $query->where('booking_date', now()->toDateString());
        }

        // Urutkan dari terbaru
        $query->orderBy('booking_date', 'desc')->orderBy('booking_time', 'desc');

        // Pagination: 15 per halaman
        $paginated = $query->paginate(15);

        $items = collect($paginated->items())->map(function ($booking) {
            $serviceName = \Illuminate\Support\Facades\DB::table('booking_details')
                ->join('services', 'booking_details.service_id', '=', 'services.id')
                ->where('booking_details.booking_id', $booking->id)
                ->value('services.name') ?? '-';

            return [
                'id'            => $booking->id,
                'unique_code'   => $booking->unique_code,
                'customer_name' => $booking->guest_name ?? ($booking->user?->name ?? 'N/A'),
                'customer_phone'=> $booking->guest_phone ?? ($booking->user?->phone ?? '-'),
                'customer_type' => $booking->user_id ? 'Member' : 'Guest',
                'barber_name'   => $booking->barber?->name ?? 'Belum ditentukan',
                'service_name'  => $serviceName,
                'booking_date'  => $booking->booking_date,
                'booking_time'  => $booking->booking_time,
                'status'        => $booking->status,
                'payment_status'=> $booking->payment_status,
                'total_amount'  => $booking->total_amount,
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

    public function updateStatus(Request $request, $id)
    {
        // Cek apakah yang akses ini benar-benar Admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak. Anda bukan Admin.'], 403);
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
