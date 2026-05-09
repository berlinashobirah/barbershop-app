<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('booking:auto-cancel')]
#[Description('Auto cancel bookings that are 1 hour late and send reminder 1 hour before')]
class AutoCancelBookings extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = now();
        
        // 1. Send Reminder 1 hour before
        $oneHourLater = $now->copy()->addHour();
        $reminders = \App\Models\Booking::where('booking_date', $oneHourLater->toDateString())
            ->where('booking_time', '>=', $oneHourLater->format('H:i:00'))
            ->where('booking_time', '<=', $oneHourLater->copy()->addMinutes(5)->format('H:i:00'))
            ->whereIn('status', ['pending'])
            ->get();

        foreach ($reminders as $booking) {
            $this->sendReminder($booking);
            $this->info("Reminder sent for booking {$booking->unique_code}");
        }

        // 2. Auto Cancel if 1 hour late
        $oneHourAgo = $now->copy()->subHour();
        
        $lateBookings = \App\Models\Booking::where('booking_date', $now->toDateString())
            ->where('booking_time', '<=', $oneHourAgo->format('H:i:00'))
            ->whereIn('status', ['pending'])
            ->get();

        foreach ($lateBookings as $booking) {
            $booking->status = 'cancelled';
            $booking->save();
            $this->info("Cancelled late booking {$booking->unique_code}");
            $this->sendCancellation($booking);
        }
    }

    private function sendReminder($booking)
    {
        $booking->load(['user']);
        $phone = $booking->guest_phone ?? ($booking->user?->phone ?? null);
        $name = $booking->guest_name ?? ($booking->user?->name ?? 'Kak');

        if (!$phone) return;
        if (substr($phone, 0, 1) === '0') $phone = '62' . substr($phone, 1);

        $message = "Halo *{$name}*!\n\n";
        $message .= "Ini adalah pengingat bahwa jadwal cukur Anda di *The Modern Artisan* sisa *1 Jam lagi*.\n\n";
        $message .= "Kode: *{$booking->unique_code}*\n";
        $message .= "Jam: *" . substr($booking->booking_time, 0, 5) . " WIB*\n\n";
        $message .= "Mohon datang tepat waktu ya. Jika terlambat lebih dari 1 jam, pesanan akan dibatalkan otomatis. Terima kasih! ✂️";

        $this->sendWa($phone, $message);
    }

    private function sendCancellation($booking)
    {
        $booking->load(['user']);
        $phone = $booking->guest_phone ?? ($booking->user?->phone ?? null);
        $name = $booking->guest_name ?? ($booking->user?->name ?? 'Kak');

        if (!$phone) return;
        if (substr($phone, 0, 1) === '0') $phone = '62' . substr($phone, 1);

        $message = "Halo *{$name}*!\n\n";
        $message .= "Mohon maaf, karena Anda sudah terlambat lebih dari 1 jam dari jadwal booking *{$booking->unique_code}*, maka pesanan ini kami batalkan secara otomatis.\n\n";
        $message .= "Silakan lakukan pemesanan ulang jika masih ingin cukur. Terima kasih! 🙏";

        $this->sendWa($phone, $message);
    }

    private function sendWa($phone, $message) {
        $fonnteToken = env('FONNTE_TOKEN') ?? config('services.fonnte.token');
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
