<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Barber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Access denied. You are not an Admin.'], 403);
        }

        // Gunakan tanggal today jika tidak dikirim
        $date = $request->get('date', now()->toDateString());

        // All slot jam operasional
        $allSlots = [
            '09:00', '10:00', '11:00', '12:00', '13:00',
            '14:00', '15:00', '16:00', '17:00', '18:00',
            '19:00', '20:00',
        ];

        // Ambil semua barber of DB
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

            $serviceName = DB::table('booking_details')
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
        $oldStatus = $barber->status;
        $barber->status = $request->status;
        $barber->save();

        if ($request->status === 'Absent' && $oldStatus !== 'Absent') {
            $pendingBookings = Booking::where('barber_id', $barber->id)
                ->where('status', 'pending')
                ->get();
            
            foreach ($pendingBookings as $booking) {
                $booking->requires_reschedule = true;
                $booking->save();
                $this->sendRescheduleNotification($booking, $barber->name);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Status kapster berhasil diupdate.',
            'data' => $barber
        ]);
    }

    private function sendRescheduleNotification($booking, $barberName)
    {
        $booking->load(['user']);
        $phone = $booking->guest_phone ?? ($booking->user?->phone ?? null);
        $name = $booking->guest_name ?? ($booking->user?->name ?? 'Kak');

        if (!$phone) return;
        if (substr($phone, 0, 1) === '0') $phone = '62' . substr($phone, 1);

        $frontendUrl = config('app.frontend_url') ?? 'http://localhost:5173';
        $rescheduleLink = rtrim($frontendUrl, '/') . "/reschedule/" . $booking->unique_code;

        $message = "Hello *{$name}*!\n\n";
        $message .= "We apologize, but our barber *{$barberName}* that you selected for booking *{$booking->unique_code}* is currently unavailable to attend.\n\n";
        $message .= "Please reschedule your appointment or select another barber for FREE via the following link:\n\n";
        $message .= "{$rescheduleLink}\n\n";
        $message .= "Thank you for your understanding. 🙏";

        $fonnteToken = config('services.fonnte.token');
        if (!$fonnteToken) return;

        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://api.fonnte.com/send',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => array('target' => $phone, 'message' => $message),
            CURLOPT_HTTPHEADER => array('Authorization: ' . $fonnteToken),
        ));
        curl_exec($curl);
        curl_close($curl);
    }
}
