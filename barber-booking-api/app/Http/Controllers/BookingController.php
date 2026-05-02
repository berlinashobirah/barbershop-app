<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Barber;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    // === NEW ENDPOINTS FOR DYNAMIC BOOKING FLOW ===

    // 1. Get Available Slots for a given date
    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'date' => 'required|date'
        ]);

        $date = $request->date;
        
        // Define all possible time slots for the shop (e.g. 10:00 to 20:00 every hour)
        $allSlots = [
            '10:00', '11:00', '13:00', '14:00', 
            '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
        ];

        // Total available barbers overall (excluding Absent)
        // Let's assume all barbers in DB could potentially work, minus those marked Absent
        $totalBarbers = Barber::where('status', '!=', 'Absent')->count();

        $slotsData = [];

        foreach ($allSlots as $time) {
            // How many bookings exist at this date and time that are not completed/cancelled?
            $existingBookingsCount = Booking::where('booking_date', $date)
                ->where('booking_time', $time . ':00') // append seconds to match DB time format
                ->whereIn('status', ['pending', 'arrived', 'processing'])
                ->count();

            $availableCount = $totalBarbers - $existingBookingsCount;

            $slotsData[] = [
                'time' => $time,
                'available_barbers' => max(0, $availableCount),
                'is_full' => $availableCount <= 0
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $slotsData
        ]);
    }

    // 2. Get Available Barbers for a given date and time
    public function getAvailableBarbers(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'time' => 'required'
        ]);

        $date = $request->date;
        // Make sure time format matches DB (add :00 if missing)
        $time = strlen($request->time) == 5 ? $request->time . ':00' : $request->time;

        // Find barber IDs that ARE booked at this date and time
        $bookedBarberIds = Booking::where('booking_date', $date)
            ->where('booking_time', $time)
            ->whereIn('status', ['pending', 'arrived', 'processing'])
            ->whereNotNull('barber_id')
            ->pluck('barber_id')
            ->toArray();

        // Get barbers that are NOT in the bookedBarberIds array and are not Absent
        $availableBarbers = Barber::whereNotIn('id', $bookedBarberIds)
                                  ->where('status', '!=', 'Absent')
                                  ->get();

        return response()->json([
            'status' => 'success',
            'data' => $availableBarbers
        ]);
    }

    // === EXISTING ENDPOINTS ===

    public function storeGuest(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'required|numeric', 
            'booking_date' => 'required|date',
            'booking_time' => 'required',
            'barber_id' => 'nullable|exists:barbers,id',
            'service_id' => 'required|exists:services,id' // NEW
        ]);

        // 2. CEK KUOTA (LOGIKA UTAMA)
        // Hitung berapa kapster yang tersedia
        $totalBarbersCount = Barber::count();

        // Hitung ada berapa orang yang sudah booking di tanggal dan jam yang sama
        $timeFormat = strlen($request->booking_time) == 5 ? $request->booking_time . ':00' : $request->booking_time;
        
        $existingBookingsCount = Booking::where('booking_date', $request->booking_date)
            ->where('booking_time', $timeFormat)
            ->whereIn('status', ['pending', 'arrived', 'processing'])
            ->count();

        // Jika jumlah antrean sudah sama atau lebih dari jumlah kapster, TOLAK!
        if ($existingBookingsCount >= $totalBarbersCount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Maaf, slot pada jam tersebut sudah penuh. Silakan pilih jam lain.'
            ], 400); // 400 Bad Request
        }
        
        // Cek jika spesifik barber dipilih, apakah dia available?
        if ($request->barber_id) {
            $isBarberBooked = Booking::where('booking_date', $request->booking_date)
                ->where('booking_time', $timeFormat)
                ->where('barber_id', $request->barber_id)
                ->whereIn('status', ['pending', 'arrived', 'processing'])
                ->exists();
                
            if ($isBarberBooked) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Maaf, kapster tersebut sudah di-booking pada jam tersebut. Silakan pilih jam atau kapster lain.'
                ], 400);
            }
        }

        // 3. AUTO-ASSIGN BARBER ACAK jika tidak memilih kapster spesifik
        $assignedBarberId = $request->barber_id;
        if (!$assignedBarberId) {
            $bookedBarberIds = Booking::where('booking_date', $request->booking_date)
                ->where('booking_time', $timeFormat)
                ->whereIn('status', ['pending', 'arrived', 'processing'])
                ->whereNotNull('barber_id')
                ->pluck('barber_id')
                ->toArray();
            $randomBarber = Barber::whereNotIn('id', $bookedBarberIds)
                ->where('status', '!=', 'Absent')
                ->inRandomOrder()->first();
            $assignedBarberId = $randomBarber?->id;
        }

        // 4. GENERATE KODE UNIK
        $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        while (Booking::where('unique_code', $uniqueCode)->exists()) {
            $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        }

        // 5. SIMPAN KE DATABASE
        $service = \App\Models\Service::find($request->service_id);

        $booking = Booking::create([
            'unique_code' => $uniqueCode,
            'user_id' => null, // KOSONG KARENA INI GUEST
            'guest_name' => $request->guest_name,
            'guest_phone' => $request->guest_phone,
            'barber_id' => $assignedBarberId,
            'booking_date' => $request->booking_date,
            'booking_time' => $timeFormat,
            'status' => 'pending',
            'total_amount' => (int) $service->price
        ]);

        // Simpan Booking Details
        \Illuminate\Support\Facades\DB::table('booking_details')->insert([
            'booking_id' => $booking->id,
            'service_id' => $service->id,
            'price_snapshot' => $service->price,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 5. KEMBALIKAN RESPONS SUKSES KE FRONTEND (dengan data lengkap)
        $booking->load('barber');
        return response()->json([
            'status' => 'success',
            'message' => 'Booking berhasil!',
            'data' => [
                'id' => $booking->id,
                'unique_code' => $booking->unique_code,
                'booking_date' => $booking->booking_date,
                'booking_time' => $booking->booking_time,
                'status' => $booking->status,
                'payment_status' => $booking->payment_status,
                'total_amount' => $booking->total_amount,
                'service_name' => $service->name,
                'barber_name' => $booking->barber?->name ?? 'Kapster Mana Saja',
                'guest_name' => $booking->guest_name,
                'guest_phone' => $booking->guest_phone,
            ]
        ], 201);
    }

    public function storeMember(Request $request)
    {
        // 1. Validasi Input (Tidak perlu nama & HP, karena diambil dari user yg login)
        $request->validate([
            'booking_date' => 'required|date',
            'booking_time' => 'required',
            'barber_id' => 'nullable|exists:barbers,id',
            'service_id' => 'required|exists:services,id' // NEW
        ]);

        // 2. CEK KUOTA (Sama seperti Guest)
        $totalBarbersCount = Barber::count();
        $timeFormat = strlen($request->booking_time) == 5 ? $request->booking_time . ':00' : $request->booking_time;

        $existingBookingsCount = Booking::where('booking_date', $request->booking_date)
            ->where('booking_time', $timeFormat)
            ->whereIn('status', ['pending', 'arrived', 'processing'])
            ->count();

        if ($existingBookingsCount >= $totalBarbersCount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Maaf, slot pada jam tersebut sudah penuh.'
            ], 400);
        }
        
        // Cek jika spesifik barber dipilih, apakah dia available?
        if ($request->barber_id) {
            $isBarberBooked = Booking::where('booking_date', $request->booking_date)
                ->where('booking_time', $timeFormat)
                ->where('barber_id', $request->barber_id)
                ->whereIn('status', ['pending', 'arrived', 'processing'])
                ->exists();
                
            if ($isBarberBooked) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Maaf, kapster tersebut sudah di-booking pada jam tersebut.'
                ], 400);
            }
        }

        // 3. AUTO-ASSIGN BARBER ACAK jika tidak memilih kapster spesifik
        $assignedBarberId = $request->barber_id;
        if (!$assignedBarberId) {
            $bookedBarberIds = Booking::where('booking_date', $request->booking_date)
                ->where('booking_time', $timeFormat)
                ->whereIn('status', ['pending', 'arrived', 'processing'])
                ->whereNotNull('barber_id')
                ->pluck('barber_id')
                ->toArray();
            $randomBarber = Barber::whereNotIn('id', $bookedBarberIds)
                ->where('status', '!=', 'Absent')
                ->inRandomOrder()->first();
            $assignedBarberId = $randomBarber?->id;
        }

        // 4. GENERATE KODE UNIK
        $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        while (Booking::where('unique_code', $uniqueCode)->exists()) {
            $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        }

        // 5. SIMPAN KE DATABASE (Ambil ID User dari Token)
        $service = \App\Models\Service::find($request->service_id);

        $booking = Booking::create([
            'unique_code' => $uniqueCode,
            'user_id' => $request->user()->id, // <-- INI BEDANYA DENGAN GUEST
            'guest_name' => null,
            'guest_phone' => null,
            'barber_id' => $assignedBarberId,
            'booking_date' => $request->booking_date,
            'booking_time' => $timeFormat,
            'status' => 'pending',
            'total_amount' => (int) $service->price
        ]);

        // Simpan Booking Details
        \Illuminate\Support\Facades\DB::table('booking_details')->insert([
            'booking_id' => $booking->id,
            'service_id' => $service->id,
            'price_snapshot' => $service->price,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Simpan Booking Details

        // 5. KEMBALIKAN RESPONS SUKSES KE FRONTEND (dengan data lengkap)
        $booking->load(['barber', 'user']);
        return response()->json([
            'status' => 'success',
            'message' => 'Booking Member berhasil!',
            'data' => [
                'id' => $booking->id,
                'unique_code' => $booking->unique_code,
                'booking_date' => $booking->booking_date,
                'booking_time' => $booking->booking_time,
                'status' => $booking->status,
                'payment_status' => $booking->payment_status,
                'total_amount' => $booking->total_amount,
                'service_name' => $service->name,
                'barber_name' => $booking->barber?->name ?? 'Kapster Mana Saja',
                'member_name' => $booking->user?->name,
            ]
        ], 201);
    }

    public function memberHistory(Request $request)
    {
        // Tarik data booking khusus milik user yang sedang login
        $history = Booking::where('user_id', $request->user()->id)
            ->orderBy('booking_date', 'desc')
            ->orderBy('booking_time', 'desc')
            ->get();

        return response()->json(['data' => $history]);
    }



    public function createPayment(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->payment_status === 'paid') {
            return response()->json(['status' => 'error', 'message' => 'Booking ini sudah dibayar.'], 400);
        }

        // ============================================================
        // MIDTRANS CONFIGURATION — dibaca dari .env via config/services.php
        // ============================================================
        \Midtrans\Config::$serverKey    = config('services.midtrans.server_key');
        \Midtrans\Config::$isProduction = config('services.midtrans.is_production', false);
        \Midtrans\Config::$isSanitized  = true;
        \Midtrans\Config::$is3ds        = true;

        $orderId = 'ORDER-' . $booking->unique_code . '-' . time();
        $booking->midtrans_order_id = $orderId;
        $booking->save();

        // Ambil nama & kontak customer (guest atau member)
        $customerName  = $booking->guest_name  ?? ($booking->user?->name  ?? 'Customer');
        $customerPhone = $booking->guest_phone ?? ($booking->user?->phone ?? '');
        $customerEmail = $booking->user?->email ?? 'customer@themodernartisan.com';

        // Ambil nama layanan dari booking_details
        $serviceName = \Illuminate\Support\Facades\DB::table('booking_details')
            ->join('services', 'booking_details.service_id', '=', 'services.id')
            ->where('booking_details.booking_id', $booking->id)
            ->value('services.name') ?? 'Layanan Barbershop';

        $params = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => (int) $booking->total_amount,
            ],
            'customer_details' => [
                'first_name' => $customerName,
                'phone'      => $customerPhone,
                'email'      => $customerEmail,
            ],
            'item_details' => [
                [
                    'id'       => 'BOOKING-' . $booking->id,
                    'price'    => (int) $booking->total_amount,
                    'quantity' => 1,
                    'name'     => $serviceName,
                ]
            ],
            // Metode pembayaran yang diaktifkan
            'enabled_payments' => [
                'qris',
                'bca_va',
                'bni_va',
                'bri_va',
                'permata_va',
                'gopay',
                'shopeepay',
                'indomaret',
                'alfamart',
            ],
        ];

        $snapToken = \Midtrans\Snap::getSnapToken($params);

        return response()->json([
            'status'     => 'success',
            'snap_token' => $snapToken,
            'order_id'   => $orderId,
        ]);
    }

    public function handleMidtransNotification(Request $request)
    {
        \Midtrans\Config::$serverKey    = config('services.midtrans.server_key');
        \Midtrans\Config::$isProduction = config('services.midtrans.is_production', false);

        $notification = new \Midtrans\Notification();

        $orderId           = $notification->order_id;
        $transactionStatus = $notification->transaction_status;
        $transactionId     = $notification->transaction_id;
        $fraudStatus       = $notification->fraud_status;

        $booking = Booking::where('midtrans_order_id', $orderId)->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        $booking->midtrans_transaction_id = $transactionId;

        if ($transactionStatus == 'capture') {
            // Kartu kredit — cek fraud status
            $booking->payment_status = ($fraudStatus == 'accept') ? 'paid' : 'failed';
        } elseif ($transactionStatus == 'settlement') {
            // Pembayaran berhasil dikonfirmasi
            $booking->payment_status = 'paid';
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'failure'])) {
            // Pembayaran dibatalkan / ditolak
            $booking->payment_status = 'failed';
        } elseif ($transactionStatus == 'expire') {
            // Timer di popup Snap habis → failed (bukan expired, expired = hari lewat)
            $booking->payment_status = 'failed';
        } elseif ($transactionStatus == 'pending') {
            // Menunggu konfirmasi (mis. transfer bank manual)
            $booking->payment_status = 'unpaid';
        }

        $booking->save();

        return response()->json(['message' => 'Notification handled successfully']);
    }

    /**
     * Verifikasi & update status pembayaran langsung ke Midtrans API.
     * Dipanggil dari frontend onSuccess sebagai backup webhook (saat localhost).
     */
    public function verifyAndUpdatePayment(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        \Midtrans\Config::$serverKey    = config('services.midtrans.server_key');
        \Midtrans\Config::$isProduction = config('services.midtrans.is_production', false);
        \Midtrans\Config::$isSanitized  = true;

        // Jika tidak ada order_id Midtrans, langsung tolak
        if (!$booking->midtrans_order_id) {
            return response()->json(['status' => 'error', 'message' => 'Belum ada transaksi Midtrans untuk booking ini.'], 400);
        }

        try {
            // Query status transaksi langsung ke Midtrans
            $status = \Midtrans\Transaction::status($booking->midtrans_order_id);

            $transactionStatus = $status->transaction_status;
            $fraudStatus       = $status->fraud_status ?? null;

            if ($transactionStatus == 'capture') {
                $booking->payment_status = ($fraudStatus == 'accept') ? 'paid' : 'failed';
            } elseif ($transactionStatus == 'settlement') {
                $booking->payment_status = 'paid';
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'failure'])) {
                $booking->payment_status = 'failed';
            } elseif ($transactionStatus == 'expire') {
                $booking->payment_status = 'failed';
            } elseif ($transactionStatus == 'pending') {
                $booking->payment_status = 'unpaid';
            }

            if (isset($status->transaction_id)) {
                $booking->midtrans_transaction_id = $status->transaction_id;
            }

            $booking->save();

            return response()->json([
                'status'         => 'success',
                'payment_status' => $booking->payment_status,
                'message'        => 'Status pembayaran berhasil diperbarui.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
