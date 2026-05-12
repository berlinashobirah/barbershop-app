<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-expire booking yang tanggalnya sudah lewat dan belum dibayar
Schedule::command('bookings:expire')->dailyAt('00:00');

// Auto-cancel booking terlambat 1 jam & Pengingat 1 jam sebelumnya
Schedule::command('booking:auto-cancel')->everyMinute();

