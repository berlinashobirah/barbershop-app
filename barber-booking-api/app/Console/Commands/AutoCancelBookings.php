<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Booking;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReminderMail;
use Illuminate\Support\Facades\Log;
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
        $now = now();
        
        // 1. Send Reminder 1 hour before
        $oneHourLater = $now->copy()->addHour();
        $reminders = Booking::where('booking_date', $oneHourLater->toDateString())
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
        
        $lateBookings = Booking::where('booking_date', $now->toDateString())
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
        if (substr($phone, 0, 1) === '0') $phone = '62' . substr($phone, 1);

        $message = "Hello *{$name}*!\n\n";
        $message .= "This is a reminder that your grooming schedule at *The Modern Artisan* is *1 Hour away*.\n\n";
        $message .= "Code: *{$booking->unique_code}*\n";
        $message .= "Time: *" . substr($booking->booking_time, 0, 5) . " WIB*\n\n";
        $message .= "Please arrive on time. If you are more than 1 hour late, the booking will be automatically cancelled. Thank you! ✂️";

        $this->sendWa($phone, $message);
    }

    private function sendCancellation($booking)
    {
        $booking->load(['user']);
        $phone = $booking->guest_phone ?? ($booking->user?->phone ?? null);
        $name = $booking->guest_name ?? ($booking->user?->name ?? 'Customer');

        if (!$phone) return;
        if (substr($phone, 0, 1) === '0') $phone = '62' . substr($phone, 1);

        $message = "Hello *{$name}*!\n\n";
        $message .= "We are sorry, but since you are more than 1 hour late from the scheduled booking *{$booking->unique_code}*, we have automatically cancelled this order.\n\n";
        $message .= "Please make a new booking if you still wish to visit us. Thank you! 🙏";

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
