<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use App\Mail\BookingTicketMail;
use Exception;

class TestEmailCommand extends Command
{
    protected $signature = 'test:email {booking_id?}';
    protected $description = 'Test send email for a booking';

    public function handle()
    {
        $bookingId = $this->argument('booking_id') ?? 45;
        
        $this->info("🔍 Mencari booking dengan ID: {$bookingId}...");
        
        $booking = Booking::with(['user', 'services', 'barber'])->find($bookingId);
        
        if (!$booking) {
            $this->error("❌ Booking dengan ID {$bookingId} tidak ditemukan!");
            return;
        }

        $this->line("");
        $this->info("✅ Booking ditemukan:");
        $this->table(
            ['Field', 'Value'],
            [
                ['Booking ID', $booking->id],
                ['Unique Code', $booking->unique_code],
                ['User Email', $booking->user?->email ?? $booking->guest_email ?? 'N/A'],
                ['Payment Status', $booking->payment_status],
                ['Status', $booking->status],
            ]
        );

        $email = $booking->user?->email ?? $booking->guest_email;
        
        if (!$email) {
            $this->error("❌ Tidak ada email untuk booking ini!");
            return;
        }

        $this->line("");
        $this->info("📧 Mengirim email ke: {$email}");

        try {
            // Generate ticket image
            $ticketsDir = storage_path('app/public/tickets');
            if (!File::exists($ticketsDir)) {
                File::makeDirectory($ticketsDir, 0755, true);
            }

            $fileName = 'ticket_' . $booking->unique_code . '_' . time() . '.png';
            $filePath = $ticketsDir . '/' . $fileName;

            // Create simple ticket image
            $this->generateTicketImage($booking, $filePath);
            $this->info("✓ Tiket image berhasil dibuat: {$fileName}");

            // Send email
            Mail::to($email)->send(new BookingTicketMail($booking, $filePath));
            
            $this->line("");
            $this->info("✅ Email berhasil dikirim ke {$email}!");
            Log::info("TEST: Email berhasil dikirim ke {$email} untuk booking {$booking->unique_code}");
            
        } catch (Exception $e) {
            $this->line("");
            $this->error("❌ Gagal mengirim email!");
            $this->error("Error: " . $e->getMessage());
            Log::error("TEST: Gagal kirim email untuk booking {$booking->unique_code}: " . $e->getMessage());
        }
    }

    private function generateTicketImage($booking, $filePath)
    {
        $width = 600;
        $height = 400;

        $image = imagecreatetruecolor($width, $height);
        $white = imagecolorallocate($image, 255, 255, 255);
        $purple = imagecolorallocate($image, 102, 126, 234);
        $black = imagecolorallocate($image, 0, 0, 0);

        imagefilledrectangle($image, 0, 0, $width, $height, $white);
        imagefilledrectangle($image, 0, 0, $width, 100, $purple);
        imagestring($image, 5, 150, 40, "E-TICKET", $white);
        imagestring($image, 3, 180, 70, "The Modern Artisan", $white);
        imageline($image, 20, 120, $width - 20, 120, $black);

        $y = 150;
        $lineHeight = 30;
        $details = [
            'Kode: ' . $booking->unique_code,
            'Tanggal: ' . $booking->booking_date,
            'Jam: ' . substr($booking->booking_time, 0, 5),
            'Kapster: ' . ($booking->barber?->name ?? 'TBD'),
            'Layanan: ' . ($booking->services->first()?->name ?? 'Layanan'),
        ];

        foreach ($details as $detail) {
            imagestring($image, 2, 40, $y, $detail, $black);
            $y += $lineHeight;
        }

        imagepng($image, $filePath);
        imagedestroy($image);
    }
}
