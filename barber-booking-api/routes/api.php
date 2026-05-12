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

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password/request', [ForgotPasswordController::class, 'requestReset']);
Route::post('/forgot-password/verify', [ForgotPasswordController::class, 'verifyCode']);
Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword']);

// Public settings (for landing page)
Route::get('/settings', [SettingController::class, 'publicShow']);


// endpoint booking untuk Guest ditaruh di luar middleware auth
Route::post('/guest/bookings', [BookingController::class, 'storeGuest']);
Route::post('/bookings/{id}/payment/guest', [BookingController::class, 'createPayment']); // Guest payment (tanpa token)

// Endpoint verifikasi status pembayaran dari Midtrans (dipanggil frontend setelah onSuccess/onPending)
// Public karena guest juga perlu update payment_status
Route::post('/bookings/{id}/verify-payment', [BookingController::class, 'verifyAndUpdatePayment']);
Route::post('/bookings/{id}/send-whatsapp', [BookingController::class, 'sendWhatsapp']);
Route::post('/bookings/{id}/reschedule', [BookingController::class, 'rescheduleBooking']);

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
    Route::post('/bookings/{id}/payment', [BookingController::class, 'createPayment']);
});

// Midtrans Notification Webhook (PUBLIC - dipanggil dari server Midtrans, bukan user)
Route::post('/midtrans/notification', [BookingController::class, 'handleMidtransNotification']);

Route::post('/bookings/{id}/send-whatsapp', [BookingController::class, 'sendWhatsapp']);
