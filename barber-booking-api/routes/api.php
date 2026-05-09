<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\MasterController;
use App\Http\Controllers\Admin\SettingController;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password/request', [\App\Http\Controllers\Auth\ForgotPasswordController::class, 'requestReset']);
Route::post('/forgot-password/verify', [\App\Http\Controllers\Auth\ForgotPasswordController::class, 'verifyCode']);
Route::post('/forgot-password/reset', [\App\Http\Controllers\Auth\ForgotPasswordController::class, 'resetPassword']);

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
Route::get('/campaigns', [\App\Http\Controllers\CampaignController::class, 'index']);

// Endpoint untuk Booking Flow Dinamis
Route::get('/slots/availability', [BookingController::class, 'getAvailableSlots']);
Route::get('/barbers/available', [BookingController::class, 'getAvailableBarbers']);

// --- PROTECTED ROUTES
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // API KHUSUS MEMBER
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/member/bookings', [BookingController::class, 'storeMember']);
    Route::get('/member/history', [BookingController::class, 'memberHistory']);
    Route::patch('/member/bookings/{id}/cancel', [BookingController::class, 'cancelBooking']);

    // API KHUSUS ADMIN
    Route::get('/admin/dashboard/stats', [\App\Http\Controllers\Admin\DashboardController::class, 'stats']);
    Route::get('/admin/bookings/today', [\App\Http\Controllers\Admin\BookingController::class, 'today']);
    Route::get('/admin/bookings/all', [\App\Http\Controllers\Admin\BookingController::class, 'index']);
    Route::patch('/admin/bookings/{id}/status', [\App\Http\Controllers\Admin\BookingController::class, 'updateStatus']);
    Route::get('/admin/schedule', [\App\Http\Controllers\Admin\ScheduleController::class, 'index']);
    Route::get('/admin/members', [\App\Http\Controllers\Admin\MemberController::class, 'index']);
    Route::patch('/admin/barbers/{id}/status', [\App\Http\Controllers\Admin\ScheduleController::class, 'updateBarberStatus']);
    Route::apiResource('/admin/services', \App\Http\Controllers\Admin\ServiceController::class);
    Route::apiResource('/admin/barbers', \App\Http\Controllers\Admin\BarberController::class);

    Route::get('/admin/campaigns', [\App\Http\Controllers\CampaignController::class, 'adminIndex']);
    Route::post('/admin/campaigns', [\App\Http\Controllers\CampaignController::class, 'store']);
    Route::put('/admin/campaigns/{id}', [\App\Http\Controllers\CampaignController::class, 'update']);
    Route::delete('/admin/campaigns/{id}', [\App\Http\Controllers\CampaignController::class, 'destroy']);
    Route::get('/admin/settings', [SettingController::class, 'show']);
    Route::put('/admin/settings', [SettingController::class, 'update']);

    // LAPORAN
    Route::get('/admin/laporan/stats',             [\App\Http\Controllers\Admin\LaporanController::class, 'stats']);
    Route::get('/admin/laporan/revenue-chart',     [\App\Http\Controllers\Admin\LaporanController::class, 'revenueChart']);
    Route::get('/admin/laporan/popular-services',  [\App\Http\Controllers\Admin\LaporanController::class, 'popularServices']);
    Route::get('/admin/laporan/barber-performance',[\App\Http\Controllers\Admin\LaporanController::class, 'barberPerformance']);
    Route::get('/admin/laporan/bookings',          [\App\Http\Controllers\Admin\LaporanController::class, 'bookingList']);

    // API PAYMENT (butuh auth token)
    Route::post('/bookings/{id}/payment', [BookingController::class, 'createPayment']);
});

// Midtrans Notification Webhook (PUBLIC - dipanggil dari server Midtrans, bukan user)
Route::post('/midtrans/notification', [BookingController::class, 'handleMidtransNotification']);

Route::post('/bookings/{id}/send-whatsapp', [BookingController::class, 'sendWhatsapp']);

// Route::get('/test-kirim-gambar', function() {
//     $phone = '083122662986'; // ⚠️ GANTI dengan nomor WA kamu!
    
//     // ⚠️ MASUKKAN TOKEN FONNTE-MU DI SINI (Jangan biarkan kosong)
//     $fonnteToken = 'vPbobTiD5sD3ahs6NThE'; 

//     // 1. Ambil gambar dari laptop
//     $folderPath = storage_path('/public/storage/tickets');
//     $files = glob($folderPath . '/*.png');
//     if (empty($files)) {
//         return response()->json(['message' => 'Wah, belum ada gambar di folder tickets!']);
//     }
    
//     // Ambil file yang pertama ketemu
//     $filePath = $files[0]; 

//     // 2. Kirim LANGSUNG file fisiknya ke Fonnte (Tanpa ImgBB/API lain!)
//     $curl = curl_init();
//     curl_setopt_array($curl, array(
//         CURLOPT_URL => 'https://api.fonnte.com/send',
//         CURLOPT_RETURNTRANSFER => true,
//         CURLOPT_ENCODING => '',
//         CURLOPT_MAXREDIRS => 10,
//         CURLOPT_TIMEOUT => 0,
//         CURLOPT_FOLLOWLOCATION => true,
//         CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
//         CURLOPT_CUSTOMREQUEST => 'POST',
//         CURLOPT_POSTFIELDS => array(
//             'target' => $phone,
//             'message' => "Halo! Ini testing kirim GAMBAR langsung pakai file dari laptop.",
//             // Kunci suksesnya: Kita upload file fisiknya langsung, jadi Fonnte nggak perlu download dari URL
//             'file' => new \CURLFile($filePath) 
//         ),
//         CURLOPT_HTTPHEADER => array(
//             'Authorization: ' . $fonnteToken // Menggunakan token yang sudah dipastikan jalan
//         ),
//     ));

//     $response = curl_exec($curl);
//     curl_close($curl);

//     return response()->json([
//         'gambar_dikirim' => $filePath,
//         'hasil_dari_fonnte' => json_decode($response, true)
//     ]);
// });