<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\MasterController;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// endpoint booking untuk Guest ditaruh di luar middleware auth
Route::post('/guest/bookings', [BookingController::class, 'storeGuest']);
Route::post('/bookings/{id}/payment/guest', [BookingController::class, 'createPayment']); // Guest payment (tanpa token)

// Endpoint verifikasi status pembayaran dari Midtrans (dipanggil frontend setelah onSuccess/onPending)
// Public karena guest juga perlu update payment_status
Route::post('/bookings/{id}/verify-payment', [BookingController::class, 'verifyAndUpdatePayment']);

// Endpoint untuk Dropdown Frontend (ambil layanan & kapster aktif)
Route::get('/services', [MasterController::class, 'getServices']);
Route::get('/barbers', [MasterController::class, 'getActiveBarbers']);

// Endpoint untuk Booking Flow Dinamis
Route::get('/slots/availability', [BookingController::class, 'getAvailableSlots']);
Route::get('/barbers/available', [BookingController::class, 'getAvailableBarbers']);

// --- PROTECTED ROUTES
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) { return $request->user(); });

    // API KHUSUS MEMBER
    Route::post('/member/bookings', [BookingController::class, 'storeMember']);
    Route::get('/member/history', [BookingController::class, 'memberHistory']);

    // API KHUSUS ADMIN
    Route::get('/admin/dashboard/stats', [\App\Http\Controllers\Admin\DashboardController::class, 'stats']);
    Route::get('/admin/bookings/today', [\App\Http\Controllers\Admin\BookingController::class, 'today']);
    Route::get('/admin/bookings/all', [\App\Http\Controllers\Admin\BookingController::class, 'index']);
    Route::patch('/admin/bookings/{id}/status', [\App\Http\Controllers\Admin\BookingController::class, 'updateStatus']);
    Route::get('/admin/schedule', [\App\Http\Controllers\Admin\ScheduleController::class, 'index']);
    Route::get('/admin/members', [\App\Http\Controllers\Admin\MemberController::class, 'index']);
    Route::patch('/admin/barbers/{id}/status', [\App\Http\Controllers\Admin\ScheduleController::class, 'updateBarberStatus']);

    // API PAYMENT (butuh auth token)
    Route::post('/bookings/{id}/payment', [BookingController::class, 'createPayment']);
});

// Midtrans Notification Webhook (PUBLIC - dipanggil dari server Midtrans, bukan user)
Route::post('/midtrans/notification', [BookingController::class, 'handleMidtransNotification']);