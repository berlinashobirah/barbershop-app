<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Barber;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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

        $allSlots = [
            '10:00',
            '11:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00',
            '17:00',
            '18:00',
            '19:00',
            '20:00'
        ];

        $totalBarbers = Barber::where('status', '!=', 'Absent')->count();
        $slotsData = [];

        foreach ($allSlots as $time) {
            $existingBookingsCount = Booking::where('booking_date', $date)
                ->where('booking_time', $time . ':00')
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
        $time = strlen($request->time) == 5 ? $request->time . ':00' : $request->time;

        $bookedBarberIds = Booking::where('booking_date', $date)
            ->where('booking_time', $time)
            ->whereIn('status', ['pending', 'arrived', 'processing'])
            ->whereNotNull('barber_id')
            ->pluck('barber_id')
            ->toArray();

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
        $request->validate([
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'required|numeric',
            'booking_date' => 'required|date',
            'booking_time' => 'required',
            'barber_id' => 'nullable|exists:barbers,id',
            'service_id' => 'required|exists:services,id',
            'addon_ids' => 'nullable|array',
            'addon_ids.*' => 'exists:services,id'
        ]);

        $totalBarbersCount = Barber::count();
        $timeFormat = strlen($request->booking_time) == 5 ? $request->booking_time . ':00' : $request->booking_time;

        $existingBookingsCount = Booking::where('booking_date', $request->booking_date)
            ->where('booking_time', $timeFormat)
            ->whereIn('status', ['pending', 'arrived', 'processing'])
            ->count();

        if ($existingBookingsCount >= $totalBarbersCount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Maaf, slot pada jam tersebut sudah penuh. Silakan pilih jam lain.'
            ], 400);
        }

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

        $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        while (Booking::where('unique_code', $uniqueCode)->exists()) {
            $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        }

        $service = \App\Models\Service::find($request->service_id);
        $totalAmount = (int) $service->price;

        $addons = [];
        if ($request->addon_ids && is_array($request->addon_ids)) {
            $addons = \App\Models\Service::whereIn('id', $request->addon_ids)->get();
            foreach($addons as $addon) {
                $totalAmount += (int) $addon->price;
            }
        }

        $booking = Booking::create([
            'unique_code' => $uniqueCode,
            'user_id' => null,
            'guest_name' => $request->guest_name,
            'guest_phone' => $request->guest_phone,
            'barber_id' => $assignedBarberId,
            'booking_date' => $request->booking_date,
            'booking_time' => $timeFormat,
            'status' => 'pending',
            'total_amount' => $totalAmount,
            'addon_ids' => $request->addon_ids
        ]);

        DB::table('booking_details')->insert([
            'booking_id' => $booking->id,
            'service_id' => $service->id,
            'price_snapshot' => $service->price,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($addons as $addon) {
            DB::table('booking_details')->insert([
                'booking_id' => $booking->id,
                'service_id' => $addon->id,
                'price_snapshot' => $addon->price,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

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
        $request->validate([
            'booking_date' => 'required|date',
            'booking_time' => 'required',
            'barber_id' => 'nullable|exists:barbers,id',
            'service_id' => 'required|exists:services,id',
            'addon_ids' => 'nullable|array',
            'addon_ids.*' => 'exists:services,id',
            'campaign_id' => 'nullable|exists:campaigns,id'
        ]);

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

        $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        while (Booking::where('unique_code', $uniqueCode)->exists()) {
            $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        }

        $service = \App\Models\Service::find($request->service_id);
        $mainAmount = (int) $service->price;
        $addonsAmount = 0;

        $addons = [];
        if ($request->addon_ids && is_array($request->addon_ids)) {
            $addons = \App\Models\Service::whereIn('id', $request->addon_ids)->get();
            foreach($addons as $addon) {
                $addonsAmount += (int) $addon->price;
            }
        }

        $discountAmount = 0;
        $user = $request->user();

        // LOGIKA KAMPANYE DISKON
        if ($request->campaign_id) {
            $campaign = \App\Models\Campaign::find($request->campaign_id);
            if ($campaign && $campaign->is_active) {
                $isValid = true;

                // Cek tanggal
                $todayDate = now()->timezone('Asia/Jakarta')->toDateString();
                if ($campaign->start_date && $todayDate < substr($campaign->start_date, 0, 10)) {
                    $isValid = false;
                }
                if ($campaign->end_date && $todayDate > substr($campaign->end_date, 0, 10)) {
                    $isValid = false;
                }

                // Cek specific service
                if ($campaign->discount_type === 'specific_service' && $campaign->service_id !== $service->id) {
                    $isValid = false;
                }

                // Cek point
                if ($campaign->discount_type === 'points_based') {
                    if ($user->points < $campaign->required_points) {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Poin Anda tidak mencukupi untuk menggunakan promo ini.'
                        ], 400);
                    }
                    if ($isValid) {
                        // Potong point user
                        $user->points -= $campaign->required_points;
                        $user->save();
                    }
                }

                if ($isValid) {
                    $discountAmount = (int) $campaign->discount_amount;
                    $mainAmount = max(0, $mainAmount - $discountAmount);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Promo tidak berlaku untuk layanan ini atau sudah kedaluwarsa.'
                    ], 400);
                }
            }
        }

        $totalAmount = $mainAmount + $addonsAmount;

        $booking = Booking::create([
            'unique_code' => $uniqueCode,
            'user_id' => $user->id,
            'guest_name' => null,
            'guest_phone' => null,
            'barber_id' => $assignedBarberId,
            'booking_date' => $request->booking_date,
            'booking_time' => $timeFormat,
            'status' => 'pending',
            'total_amount' => $totalAmount,
            'campaign_id' => $request->campaign_id ?? null,
            'discount_amount' => $discountAmount,
            'addon_ids' => $request->addon_ids,
        ]);

        DB::table('booking_details')->insert([
            'booking_id' => $booking->id,
            'service_id' => $service->id,
            'price_snapshot' => $service->price,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($addons as $addon) {
            DB::table('booking_details')->insert([
                'booking_id' => $booking->id,
                'service_id' => $addon->id,
                'price_snapshot' => $addon->price,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $booking->load(['barber', 'user', 'campaign']);
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
                'campaign_title' => $booking->campaign?->title,
                'discount_amount' => $booking->discount_amount,
                'points_deducted' => $booking->campaign?->discount_type === 'points_based' ? $booking->campaign->required_points : 0,
            ]
        ], 201);
    }

    public function memberHistory(Request $request)
    {
        $history = Booking::with(['barber', 'services'])
            ->where('user_id', $request->user()->id)
            ->orderBy('booking_date', 'desc')
            ->orderBy('booking_time', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'unique_code' => $booking->unique_code,
                    'booking_date' => $booking->booking_date,
                    'booking_time' => $booking->booking_time,
                    'status' => $booking->status,
                    'payment_status' => $booking->payment_status,
                    'total_amount' => $booking->total_amount,
                    'service_name' => $booking->services->first()?->name ?? 'Layanan Barbershop',
                    'barber_name' => $booking->barber?->name ?? 'Kapster Siapa Saja',
                    'requires_reschedule' => $booking->requires_reschedule,
                    'campaign_title' => $booking->campaign?->title,
                    'discount_amount' => $booking->discount_amount,
                ];
            });

        return response()->json(['data' => $history]);
    }

    public function cancelBooking(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        
        // Hanya bisa batalkan jika status pending dan belum dibayar
        if ($booking->status !== 'pending' && $booking->status !== 'arrived') {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak dapat dibatalkan.'], 400);
        }

        if ($booking->payment_status === 'paid') {
            return response()->json(['status' => 'error', 'message' => 'Booking yang sudah dibayar tidak dapat dibatalkan di sini. Silakan hubungi admin.'], 400);
        }

        $booking->status = 'cancelled';
        $booking->save();

        return response()->json(['status' => 'success', 'message' => 'Booking berhasil dibatalkan.']);
    }

    public function createPayment(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->payment_status === 'paid') {
            return response()->json(['status' => 'error', 'message' => 'Booking ini sudah dibayar.'], 400);
        }

        if ((int) $booking->total_amount <= 0) {
            $booking->payment_status = 'paid';
            $booking->save();
            return response()->json([
                'status' => 'success',
                'snap_token' => 'FREE',
                'order_id' => 'ORDER-' . $booking->unique_code . '-FREE',
            ]);
        }

        \Midtrans\Config::$serverKey    = config('services.midtrans.server_key');
        \Midtrans\Config::$isProduction = config('services.midtrans.is_production', false);
        \Midtrans\Config::$isSanitized  = true;
        \Midtrans\Config::$is3ds        = true;

        $orderId = 'ORDER-' . $booking->unique_code . '-' . time();
        $booking->midtrans_order_id = $orderId;
        $booking->save();

        $customerName  = $booking->guest_name  ?? ($booking->user?->name  ?? 'Customer');
        $customerPhone = $booking->guest_phone ?? ($booking->user?->phone ?? '');
        $customerEmail = $booking->user?->email ?? 'customer@themodernartisan.com';

        $serviceName = DB::table('booking_details')
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

        // KUNCI ANTI DOUBLE: Catat status lama sebelum diupdate
        $oldPaymentStatus = $booking->payment_status;

        $booking->midtrans_transaction_id = $transactionId;

        if ($transactionStatus == 'capture') {
            $booking->payment_status = ($fraudStatus == 'accept') ? 'paid' : 'failed';
        } elseif ($transactionStatus == 'settlement') {
            $booking->payment_status = 'paid';
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'failure'])) {
            $booking->payment_status = 'failed';
            $booking->status = 'cancelled';
        } elseif ($transactionStatus == 'expire') {
            $booking->payment_status = 'failed';
            $booking->status = 'cancelled';
        } elseif ($transactionStatus == 'pending') {
            $booking->payment_status = 'unpaid';
        }

        $booking->save();

        // LOGIKA PINTAR: Cuma kirim kalau statusnya BARU SAJA berubah jadi 'paid'
        if ($oldPaymentStatus !== 'paid' && $booking->payment_status === 'paid') {
            $this->sendBookingConfirmationWhatsapp($booking);
        }

        return response()->json(['message' => 'Notification handled successfully']);
    }

    public function verifyAndUpdatePayment(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        \Midtrans\Config::$serverKey    = config('services.midtrans.server_key');
        \Midtrans\Config::$isProduction = config('services.midtrans.is_production', false);
        \Midtrans\Config::$isSanitized  = true;

        if (!$booking->midtrans_order_id) {
            return response()->json(['status' => 'error', 'message' => 'Belum ada transaksi Midtrans untuk booking ini.'], 400);
        }

        try {
            $status = \Midtrans\Transaction::status($booking->midtrans_order_id);

            $transactionStatus = $status->transaction_status;
            $fraudStatus       = $status->fraud_status ?? null;

            // KUNCI ANTI DOUBLE
            $oldPaymentStatus = $booking->payment_status;

            if ($transactionStatus == 'capture') {
                $booking->payment_status = ($fraudStatus == 'accept') ? 'paid' : 'failed';
            } elseif ($transactionStatus == 'settlement') {
                $booking->payment_status = 'paid';
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'failure'])) {
                $booking->payment_status = 'failed';
                $booking->status = 'cancelled';
            } elseif ($transactionStatus == 'expire') {
                $booking->payment_status = 'failed';
                $booking->status = 'cancelled';
            } elseif ($transactionStatus == 'pending') {
                $booking->payment_status = 'unpaid';
            }

            if (isset($status->transaction_id)) {
                $booking->midtrans_transaction_id = $status->transaction_id;
            }

            $booking->save();

            // LOGIKA PINTAR: Cuma kirim kalau statusnya BARU SAJA berubah jadi 'paid'
            if ($oldPaymentStatus !== 'paid' && $booking->payment_status === 'paid') {
                $this->sendBookingConfirmationWhatsapp($booking);
            }

            return response()->json([
                'status'         => 'success',
                'payment_status' => $booking->payment_status,
                'message'        => 'Status pembayaran berhasil diperbarui.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    private function sendBookingConfirmationEmail($booking, $filePath)
    {
        $booking->load(['user']);
        $recipientEmail = $booking->guest_email ?? ($booking->user?->email ?? null);

        if (!$recipientEmail) return;

        try {
            \Illuminate\Support\Facades\Mail::to($recipientEmail)->send(
                new \App\Mail\BookingTicketMail($booking, $filePath)
            );
            \Illuminate\Support\Facades\Log::info("Email tiket dikirim ke {$recipientEmail}");
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Gagal kirim email tiket: " . $e->getMessage());
        }
    }

    // --- MESIN UTAMA PENGIRIM WHATSAPP (DRY PRINCIPLE) ---
    private function sendBookingConfirmationWhatsapp($booking)
    {
        $booking->load(['barber', 'services', 'user']);

        $phone = $booking->guest_phone ?? ($booking->user?->phone ?? null);
        $name = $booking->guest_name ?? ($booking->user?->name ?? 'Kak');

        if (!$phone) {
            Log::warning("Tidak ada nomor WhatsApp untuk booking {$booking->id}. WhatsApp tidak dikirim.");
            return;
        }

        if (substr($phone, 0, 1) === '0') {
            $phone = '62' . substr($phone, 1);
        }

        $serviceName = $booking->services->first()?->name ?? 'Layanan Barbershop';
        $barberName = $booking->barber?->name ?? 'Kapster Mana Saja';

        $message = "Halo *{$name}*!\n\n";
        $message .= "Pembayaran kamu untuk booking di *The Modern Artisan* telah berhasil dikonfirmasi. ✅\n\n";
        $message .= "*Detail Booking:*\n";
        $message .= "Kode Booking: *{$booking->unique_code}*\n";
        $message .= "Layanan: *{$serviceName}*\n";
        $message .= "Kapster: *{$barberName}*\n";
        $message .= "Tanggal: *" . date('d M Y', strtotime($booking->booking_date)) . "*\n";
        $message .= "Jam: *" . substr($booking->booking_time, 0, 5) . " WIB*\n\n";

        // Logika Pintar: Member vs Guest
        if ($booking->user_id) {
            $message .= "Silakan cek *Email* kamu untuk melihat e-ticket resmi. Tunjukkan e-ticket tersebut atau kode booking di atas ke kapster saat kedatangan.\n\n";
        } else {
            $message .= "E-ticket kamu sudah tercatat aman di sistem kami. Silakan tunjukkan langsung kode booking di atas ke kapster saat kedatangan.\n\n";
        }

        $message .= "Terima kasih dan sampai jumpa di barbershop kami! ✂️";

        $fonnteToken = env('FONNTE_TOKEN') ?? config('services.fonnte.token');

        if (!$fonnteToken) {
            Log::warning("Fonnte token tidak dikonfigurasi. WhatsApp tidak dikirim untuk booking {$booking->unique_code}");
            return;
        }

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
            CURLOPT_POSTFIELDS => array(
                'target' => $phone,
                'message' => $message,
            ),
            CURLOPT_HTTPHEADER => array(
                'Authorization: ' . $fonnteToken
            ),
        ));

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        $responseData = json_decode($response, true);

        if ($httpCode == 200 && isset($responseData['status']) && $responseData['status'] == 'success') {
            Log::info("WhatsApp konfirmasi berhasil dikirim ke {$phone} untuk booking {$booking->unique_code}");
        } else {
            Log::error("WhatsApp gagal dikirim ke {$phone} untuk booking {$booking->unique_code}. Response: " . $response);
        }
    }

    public function sendWhatsapp(Request $request, $id)
    {
        $request->validate([
            'ticket_image' => 'required|string',
        ]);

        $booking = Booking::with(['user', 'services', 'barber'])->findOrFail($id);

        // 1. Simpan Gambar Keren Buatan React Kamu!
        $image_parts = explode(";base64,", $request->ticket_image);
        if (count($image_parts) == 2) {
            $image_base64 = base64_decode($image_parts[1]);
            $fileName = 'ticket_' . $booking->unique_code . '_' . time() . '.png';
            $folderPath = storage_path('app/public/tickets');

            if (!\Illuminate\Support\Facades\File::exists($folderPath)) {
                \Illuminate\Support\Facades\File::makeDirectory($folderPath, 0755, true);
            }

            $filePath = $folderPath . '/' . $fileName;
            \Illuminate\Support\Facades\File::put($filePath, $image_base64);

            // 2. Kirim Email pakai gambar yang BARUSAN AJA disimpan!
            $this->sendBookingConfirmationEmail($booking, $filePath);
        }

        // NOTE: Perintah kirim WA dihapus dari sini! 
        // WA murni hanya dikirim 1x saat status Midtrans berubah jadi 'paid'.

        return response()->json([
            'status' => 'success',
            'message' => 'Tiket estetik berhasil disimpan dan dikirim via Email!',
        ]);
    }

    public function rescheduleBooking(Request $request, $uniqueCode)
    {
        $request->validate([
            'booking_date' => 'required|date',
            'booking_time' => 'required',
            'barber_id' => 'nullable|exists:barbers,id',
        ]);

        $booking = Booking::where('unique_code', $uniqueCode)->first();
        
        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking tidak ditemukan.'], 404);
        }

        $timeFormat = strlen($request->booking_time) == 5 ? $request->booking_time . ':00' : $request->booking_time;

        // Check if slot is full (excluding the current booking itself)
        $totalBarbersCount = Barber::count();
        $existingBookingsCount = Booking::where('booking_date', $request->booking_date)
            ->where('booking_time', $timeFormat)
            ->where('id', '!=', $booking->id)
            ->whereIn('status', ['pending', 'arrived', 'processing'])
            ->count();

        if ($existingBookingsCount >= $totalBarbersCount) {
            return response()->json(['status' => 'error', 'message' => 'Slot pada jam tersebut sudah penuh.'], 400);
        }

        if ($request->barber_id) {
            $isBarberBooked = Booking::where('booking_date', $request->booking_date)
                ->where('booking_time', $timeFormat)
                ->where('id', '!=', $booking->id)
                ->where('barber_id', $request->barber_id)
                ->whereIn('status', ['pending', 'arrived', 'processing'])
                ->exists();

            if ($isBarberBooked) {
                return response()->json(['status' => 'error', 'message' => 'Kapster tersebut sudah di-booking pada jam tersebut.'], 400);
            }
        }

        $assignedBarberId = $request->barber_id;
        if (!$assignedBarberId) {
            $bookedBarberIds = Booking::where('booking_date', $request->booking_date)
                ->where('booking_time', $timeFormat)
                ->where('id', '!=', $booking->id)
                ->whereIn('status', ['pending', 'arrived', 'processing'])
                ->whereNotNull('barber_id')
                ->pluck('barber_id')
                ->toArray();
            $randomBarber = Barber::whereNotIn('id', $bookedBarberIds)
                ->where('status', '!=', 'Absent')
                ->inRandomOrder()->first();
            $assignedBarberId = $randomBarber?->id;
        }

        $booking->booking_date = $request->booking_date;
        $booking->booking_time = $timeFormat;
        $booking->barber_id = $assignedBarberId;
        $booking->requires_reschedule = false;
        $booking->reschedule_count += 1;
        $booking->save();

        return response()->json(['status' => 'success', 'message' => 'Jadwal berhasil diubah (Reschedule)!', 'data' => $booking]);
    }
}
