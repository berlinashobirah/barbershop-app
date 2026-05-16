<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Booking;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReminderMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use Exception;

#[Signature('booking:auto-cancel')]
#[Description('Auto cancel bookings that are 1 hour late and send reminder 1 hour before')]
class AutoCancelBookings extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = now(); // Sesuai timezone Asia/Jakarta dari config
        
        // Ambil semua booking AKTIF (pending) hari ini
        $bookingsToday = Booking::where('booking_date', $now->toDateString())
            ->where('status', 'pending')
            ->get();
            
        foreach ($bookingsToday as $booking) {
            // Parse waktu booking
            $bookingTime = Carbon::parse($now->toDateString() . ' ' . $booking->booking_time);
            
            // diffInMinutes(..., false) -> mengembalikan selisih ber-tanda (positif jika di masa depan, negatif jika di masa lalu)
            $diffInMinutes = $now->diffInMinutes($bookingTime, false);
            
            // 1. PENGINGAT 1 JAM SEBELUMNYA (Antara 55 - 65 menit ke depan)
            if ($diffInMinutes >= 55 && $diffInMinutes <= 65) {
                $cacheKey = "reminder_1h_" . $booking->id;
                if (!Cache::has($cacheKey)) {
                    $this->sendReminder($booking);
                    Cache::put($cacheKey, true, now()->addDays(1));
                    $this->info("Reminder 1 hour before sent for booking {$booking->unique_code}");
                }
            }
            
            // 2. LEWAT 30 MENIT -> TAWARAN RESCHEDULE (Antara 30 - 45 menit yang lalu / negatif)
            if ($diffInMinutes <= -30 && $diffInMinutes >= -45) {
                $cacheKey = "reschedule_30m_" . $booking->id;
                if (!Cache::has($cacheKey)) {
                    $this->sendRescheduleSuggestion($booking);
                    Cache::put($cacheKey, true, now()->addDays(1));
                    $this->info("Reschedule suggestion sent for booking {$booking->unique_code}");
                }
            }
            
            // 3. LEWAT 1 JAM -> AUTO CANCEL & NOTIFIKASI GAGAL (Lebih dari 60 menit yang lalu)
            if ($diffInMinutes <= -60) {
                $booking->status = 'cancelled';
                $booking->save();
                $this->info("Cancelled late booking {$booking->unique_code}");
                
                // Kirim notifikasi pembatalan otomatis
                $this->sendCancellation($booking);
            }
        }
    }

    private function sendReminder($booking)
    {
        $booking->load(['user', 'barber']);
        $phone = $booking->guest_phone ?? ($booking->user?->phone ?? null);
        $name = $booking->guest_name ?? ($booking->user?->name ?? 'Customer');

        // 1. Send Email if User (Member) has email
        if ($booking->user?->email) {
            try {
                Mail::to($booking->user->email)->send(new ReminderMail($booking));
                $this->info("Email reminder sent to {$booking->user->email}");
            } catch (Exception $e) {
                Log::error("Failed to send reminder email to booking {$booking->unique_code}: " . $e->getMessage());
                $this->error("Failed to send email reminder.");
            }
        }

        // 2. Send WhatsApp
        if (!$phone) return;
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($phone, 0, 1) === '0') $phone = '62' . substr($phone, 1);

        $message = "Hello *{$name}*!\n\n";
        $message .= "This is a reminder that your grooming schedule at *The Modern Artisan* is *1 Hour away*.\n\n";
        $message .= "Code: *{$booking->unique_code}*\n";
        $message .= "Time: *" . substr($booking->booking_time, 0, 5) . " WIB*\n\n";
        $message .= "Please arrive on time. If you are more than 1 hour late, the booking will be automatically cancelled. Thank you! ✂️";

        $this->sendWa($phone, $message);
    }

    private function sendRescheduleSuggestion($booking)
    {
        $booking->load(['user']);
        $phone = $booking->guest_phone ?? ($booking->user?->phone ?? null);
        $name = $booking->guest_name ?? ($booking->user?->name ?? 'Customer');

        if (!$phone) return;
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($phone, 0, 1) === '0') $phone = '62' . substr($phone, 1);

        $frontendUrl = config('app.frontend_url') ?? 'https://modernartisan-barbershop.my.id';
        $rescheduleLink = rtrim($frontendUrl, '/') . "/reschedule/" . $booking->unique_code;

        $message = "Hello *{$name}*!\n\n";
        $message .= "We noticed that you are *30 minutes late* for your grooming appointment *{$booking->unique_code}* scheduled at *" . substr($booking->booking_time, 0, 5) . " WIB*.\n\n";
        $message .= "Would you like to reschedule? You can select a new time for FREE by clicking the direct link below:\n\n";
        $message .= "🔗 {$rescheduleLink}\n\n";
        $message .= "Please note: if you are more than 1 hour late, your booking will be automatically cancelled. Thank you! 🙏";

        $this->sendWa($phone, $message);
    }

    private function sendCancellation($booking)
    {
        $booking->load(['user']);
        $phone = $booking->guest_phone ?? ($booking->user?->phone ?? null);
        $name = $booking->guest_name ?? ($booking->user?->name ?? 'Customer');

        if (!$phone) return;
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($phone, 0, 1) === '0') $phone = '62' . substr($phone, 1);

        $message = "Hello *{$name}*!\n\n";
        $message .= "We are sorry, but since you are more than 1 hour late from the scheduled booking *{$booking->unique_code}*, we have automatically cancelled this order.\n\n";
        $message .= "Please make a new booking if you still wish to visit us. Thank you! 🙏";

        $this->sendWa($phone, $message);
    }

    private function sendWa($phone, $message) {
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
