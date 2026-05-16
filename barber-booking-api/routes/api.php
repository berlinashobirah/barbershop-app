<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\MasterController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\BarberController;
use App\Http\Controllers\Admin\LaporanController;
use App\Models\Booking;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password/request', [ForgotPasswordController::class, 'requestReset']);
Route::post('/forgot-password/verify', [ForgotPasswordController::class, 'verifyCode']);
Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword']);

// Public settings (for landing page)
Route::get('/settings', [SettingController::class, 'publicShow']);

// Endpoint PING Pemicu Otomatis Eksternal (Bisa ditembak pakai cron-job.org / UptimeRobot secara GRATIS!)
Route::get('/cron-ping', function() {
    try {
        Artisan::call('booking:auto-cancel');
        $output = Artisan::output(); // Ambil log detail output
        
        return response()->json([
            'status' => 'success', 
            'message' => 'Scheduler successfully executed via Web Ping!',
            'details' => trim($output) ?: 'No target bookings found in this run.', // Log aktivitas
            'time' => now()->toDateTimeString()
        ]);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// ENDPOINT DIAGNOSTIK DETIL UNTUK MENCARI TAHU KENAPA SCHEDULER TIDAK BEKERJA
Route::get('/cron-debug', function() {
    try {
        $now = now();
        $timezone = config('app.timezone');
        
        $bookingsToday = Booking::where('booking_date', $now->toDateString())
            ->where('status', 'pending')
            ->get();
            
        $diag = [];
        foreach ($bookingsToday as $booking) {
            $bookingTime = Carbon::parse($now->toDateString() . ' ' . $booking->booking_time);
            $diffInMinutes = $now->diffInMinutes($bookingTime, false);
            
            $matched = 'NONE';
            if ($diffInMinutes >= 55 && $diffInMinutes <= 65) {
                $matched = 'REMINDER_1H (Match!)';
            } elseif ($diffInMinutes <= -30 && $diffInMinutes >= -45) {
                $matched = 'RESCHEDULE_30M (Match!)';
            } elseif ($diffInMinutes <= -60) {
                $matched = 'CANCEL_1H (Match!)';
            }
            
            $diag[] = [
                'id' => $booking->id,
                'code' => $booking->unique_code,
                'booking_time' => $booking->booking_time,
                'diff_minutes' => $diffInMinutes,
                'status' => $booking->status,
                'matched_condition' => $matched,
                'reminder_sent_cache' => Cache::has("reminder_1h_" . $booking->id) ? 'YES' : 'NO'
            ];
        }
        
        // DUMP 5 BOOKING TERBARU SECARA KESELURUHAN UNTUK CEK APAKAH BERLINA SALAH SET TANGGAL
        $latestBookings = \App\Models\Booking::latest()->take(5)->get(['id', 'unique_code', 'booking_date', 'booking_time', 'status']);
        
        return response()->json([
            'server_now' => $now->toDateTimeString(),
            'timezone_config' => $timezone,
            'today_date_scanned' => $now->toDateString(),
            'total_pending_bookings_today' => $bookingsToday->count(),
            'analysis_details' => $diag,
            'latest_5_bookings_overall' => $latestBookings
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()]);
    }
});


// endpoint booking untuk Guest ditaruh di luar middleware auth
Route::post('/guest/bookings', [BookingController::class, 'storeGuest']);
Route::post('/bookings/{unique_code}/payment/guest', [BookingController::class, 'createPayment']); // Guest payment (tanpa token)

// Endpoint verifikasi status pembayaran dari Midtrans (dipanggil frontend setelah onSuccess/onPending)
// Public karena guest juga perlu update payment_status
Route::post('/bookings/{unique_code}/verify-payment', [BookingController::class, 'verifyAndUpdatePayment']);
Route::post('/bookings/{unique_code}/send-whatsapp', [BookingController::class, 'sendWhatsapp']);
Route::post('/bookings/{unique_code}/send-ticket-email', [BookingController::class, 'sendTicketEmail']);
// Route GET tambahan untuk mempermudah debug langsung via URL Browser
Route::get('/bookings/{unique_code}/test-ticket-email', [BookingController::class, 'sendTicketEmail']);

// DEBUGGER KHUSUS UNTUK MENGECEK STATUS KONEKSI FONNTE WA DI HOSTING
Route::get('/test-wa-debug', function() {
    $fonnteToken = config('services.fonnte.token');
    
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.fonnte.com/send',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => array(
            'target' => '085123456789', // Angka testing acak
            'message' => 'Test Koneksi Server Ke Fonnte'
        ),
        CURLOPT_HTTPHEADER => array(
            'Authorization: ' . $fonnteToken
        ),
    ));
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    
    return response()->json([
        'token_yang_terbaca' => substr($fonnteToken, 0, 5) . '******',
        'response_dari_fonnte' => json_decode($response, true) ?: $response,
        'error_koneksi' => $err
    ]);
});

// RUTE PINTAS MEMBERSIHKAN CACHE HOSTING SECARA MENYELURUH
Route::get('/clear-all-caches', function() {
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    \Illuminate\Support\Facades\Artisan::call('route:clear');
    return response()->json([
        'message' => 'Semua Cache Hosting Berhasil Dihapus Bersih!',
        'tips' => 'Silakan coba lakukan booking baru sekarang, semoga WA langsung masuk!'
    ]);
});

Route::post('/bookings/{unique_code}/reschedule', [BookingController::class, 'rescheduleBooking']);

// Endpoint untuk Dropdown Frontend (ambil layanan & kapster aktif)
Route::get('/services', [MasterController::class, 'getServices']);
Route::get('/barbers', [MasterController::class, 'getActiveBarbers']);
Route::get('/campaigns', [CampaignController::class, 'index']);

// Endpoint untuk Booking Flow Dinamis
Route::get('/slots/availability', [BookingController::class, 'getAvailableSlots']);
Route::get('/barbers/available', [BookingController::class, 'getAvailableBarbers']);

// --- PROTECTED ROUTES
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        $user->has_booking = Booking::where('user_id', $user->id)->exists();
        return $user;
    });

    // API KHUSUS MEMBER
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/member/bookings', [BookingController::class, 'storeMember']);
    Route::get('/member/history', [BookingController::class, 'memberHistory']);
    Route::patch('/member/bookings/{id}/cancel', [BookingController::class, 'cancelBooking']);

    // API KHUSUS ADMIN
    Route::get('/admin/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/admin/bookings/today', [AdminBookingController::class, 'today']);
    Route::get('/admin/bookings/all', [AdminBookingController::class, 'index']);
    Route::patch('/admin/bookings/{id}/status', [AdminBookingController::class, 'updateStatus']);
    Route::get('/admin/schedule', [ScheduleController::class, 'index']);
    Route::get('/admin/members', [MemberController::class, 'index']);
    Route::patch('/admin/barbers/{id}/status', [ScheduleController::class, 'updateBarberStatus']);
    Route::apiResource('/admin/services', ServiceController::class);
    Route::apiResource('/admin/barbers', BarberController::class);

    Route::get('/admin/campaigns', [CampaignController::class, 'adminIndex']);
    Route::post('/admin/campaigns', [CampaignController::class, 'store']);
    Route::put('/admin/campaigns/{id}', [CampaignController::class, 'update']);
    Route::delete('/admin/campaigns/{id}', [CampaignController::class, 'destroy']);
    Route::get('/admin/settings', [SettingController::class, 'show']);
    Route::put('/admin/settings', [SettingController::class, 'update']);

    // LAPORAN
    Route::get('/admin/laporan/stats',             [LaporanController::class, 'stats']);
    Route::get('/admin/laporan/revenue-chart',     [LaporanController::class, 'revenueChart']);
    Route::get('/admin/laporan/popular-services',  [LaporanController::class, 'popularServices']);
    Route::get('/admin/laporan/barber-performance',[LaporanController::class, 'barberPerformance']);
    Route::get('/admin/laporan/bookings',          [LaporanController::class, 'bookingList']);

    // API PAYMENT (butuh auth token)
    Route::post('/bookings/{unique_code}/payment', [BookingController::class, 'createPayment']);
});

// Midtrans Notification Webhook (PUBLIC - dipanggil dari server Midtrans, bukan user)
Route::post('/midtrans/notification', [BookingController::class, 'handleMidtransNotification']);

Route::post('/bookings/{unique_code}/send-whatsapp', [BookingController::class, 'sendWhatsapp']);
