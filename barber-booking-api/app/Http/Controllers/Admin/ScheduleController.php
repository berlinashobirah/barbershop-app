<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Barber;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak. Anda bukan Admin.'], 403);
        }

        // Gunakan tanggal hari ini jika tidak dikirim
        $date = $request->get('date', now()->toDateString());

        // Semua slot jam operasional
        $allSlots = [
            '09:00', '10:00', '11:00', '12:00', '13:00',
            '14:00', '15:00', '16:00', '17:00', '18:00',
            '19:00', '20:00',
        ];

        // Ambil semua barber dari DB
        $barbers = Barber::all();

        // Ambil semua booking pada tanggal tersebut (exclude cancelled & completed)
        $bookings = Booking::with(['user'])
            ->where('booking_date', $date)
            ->whereIn('status', ['pending', 'arrived', 'processing'])
            ->get();

        // Buat map: barber_id -> [ 'HH:MM' -> booking_data ]
        $scheduleMap = [];
        foreach ($bookings as $booking) {
            if (!$booking->barber_id) continue;

            $timeKey = substr($booking->booking_time, 0, 5); // ambil HH:MM

            $serviceName = \Illuminate\Support\Facades\DB::table('booking_details')
                ->join('services', 'booking_details.service_id', '=', 'services.id')
                ->where('booking_details.booking_id', $booking->id)
                ->value('services.name') ?? '-';

            $scheduleMap[$booking->barber_id][$timeKey] = [
                'booking_id'    => $booking->id,
                'unique_code'   => $booking->unique_code,
                'customer_name' => $booking->guest_name ?? ($booking->user?->name ?? 'N/A'),
                'service_name'  => $serviceName,
                'status'        => $booking->status,
            ];
        }

        // Susun respons: per barber, per slot
        $result = $barbers->map(function ($barber) use ($allSlots, $scheduleMap) {
            $slots = [];
            foreach ($allSlots as $time) {
                $slots[$time] = $scheduleMap[$barber->id][$time] ?? null; // null = kosong
            }
            return [
                'id'        => $barber->id,
                'name'      => $barber->name,
                'specialty' => $barber->specialty ?? '-',
                'status'    => $barber->status ?? 'active',
                'slots'     => $slots,
            ];
        })->values();

        // Hitung statistik ringkasan
        $totalBookingsToday = Booking::where('booking_date', $date)
            ->whereNotIn('status', ['cancelled'])->count();
        $completedToday = Booking::where('booking_date', $date)
            ->where('status', 'completed')->count();

        return response()->json([
            'status' => 'success',
            'date'   => $date,
            'slots'  => $allSlots,
            'barbers'=> $result,
            'summary' => [
                'total_bookings' => $totalBookingsToday,
                'completed'      => $completedToday,
                'total_barbers'  => $barbers->count(),
            ],
        ]);
    }

    public function updateBarberStatus(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'status' => 'required|string'
        ]);

        $barber = Barber::findOrFail($id);
        $barber->status = $request->status;
        $barber->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Status kapster berhasil diupdate.',
            'data' => $barber
        ]);
    }
}
