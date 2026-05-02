<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireOldBookings extends Command
{
    /**
     * Nama perintah artisan.
     * Jalankan manual: php artisan bookings:expire
     */
    protected $signature = 'bookings:expire';

    protected $description = 'Tandai booking yang tanggalnya sudah lewat dan belum dibayar menjadi expired';

    public function handle(): void
    {
        $today = now()->toDateString(); // format: YYYY-MM-DD

        // Booking yang:
        // 1. Tanggalnya SEBELUM hari ini
        // 2. payment_status masih 'unpaid' (belum dibayar)
        $count = Booking::where('booking_date', '<', $today)
            ->where('payment_status', 'unpaid')
            ->update(['payment_status' => 'expired']);

        $this->info("Berhasil menandai {$count} booking sebagai expired.");
        Log::info("[bookings:expire] {$count} booking diubah ke status expired pada {$today}");
    }
}
