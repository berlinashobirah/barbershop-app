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
    Route::get('/admin/bookings/today', [BookingController::class, 'adminTodayQueue']);
    Route::patch('/admin/bookings/{id}/status', [BookingController::class, 'updateStatus']);
});