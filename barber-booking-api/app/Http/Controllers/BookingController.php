<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Barber;
use App\Models\Service;
use App\Models\Campaign;
use App\Mail\BookingTicketMail;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;
use Midtrans\Transaction;
use Exception;

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
                'message' => 'Sorry, the time slot is full. Please choose another time.'
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
                    'message' => 'Sorry, the barber is already booked for that time. Please choose another time or barber.'
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

        $service = Service::find($request->service_id);
        $totalAmount = (int) $service->price;

        $addons = [];
        if ($request->addon_ids && is_array($request->addon_ids)) {
            $addons = Service::whereIn('id', $request->addon_ids)->get();
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
            'message' => 'Booking successful!',
            'data' => [
                'id' => $booking->id,
                'unique_code' => $booking->unique_code,
                'booking_date' => $booking->booking_date,
                'booking_time' => $booking->booking_time,
                'status' => $booking->status,
                'payment_status' => $booking->payment_status,
                'total_amount' => $booking->total_amount,
                'service_name' => $service->name,
                'barber_name' => $booking->barber?->name ?? 'Any Barber',
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
                'message' => 'Sorry, the time slot is full.'
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
                    'message' => 'Sorry, the barber is already booked for that time.'
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

        $service = Service::find($request->service_id);
        $mainAmount = (int) $service->price;
        $addonsAmount = 0;

        $addons = [];
        if ($request->addon_ids && is_array($request->addon_ids)) {
            $addons = Service::whereIn('id', $request->addon_ids)->get();
            foreach($addons as $addon) {
                $addonsAmount += (int) $addon->price;
            }
        }

        $discountAmount = 0;
        $user = $request->user();
        $subtotal = $mainAmount + $addonsAmount;

        // LOGIKA KAMPANYE DISKON
        if ($request->campaign_id) {
            $campaign = Campaign::find($request->campaign_id);
            if ($campaign && $campaign->is_active) {
                $isValid = true;

                // 1. Cek Masa Berlaku
                $todayDate = now()->timezone('Asia/Jakarta')->toDateString();
                if ($campaign->start_date && $todayDate < $campaign->start_date->toDateString()) {
                    $isValid = false;
                }
                if ($campaign->end_date && $todayDate > $campaign->end_date->toDateString()) {
                    $isValid = false;
                }

                if (!$isValid) {
                    return response()->json(['status' => 'error', 'message' => 'This promo is no longer active or has expired.'], 400);
                }

                // 2. Cek Specific Service
                if ($campaign->discount_type === 'specific_service' && $campaign->service_id !== $service->id) {
                    return response()->json(['status' => 'error', 'message' => 'Promo is only applicable for specific services.'], 400);
                }

                // 3. Cek Syarat Minimum Transaksi
                if ($campaign->min_transaction > 0 && $subtotal < $campaign->min_transaction) {
                    $minDisplay = number_format($campaign->min_transaction, 0, ',', '.');
                    return response()->json(['status' => 'error', 'message' => "This promo requires a minimum transaction of Rp {$minDisplay}."], 400);
                }

                // 4. Cek Khusus New Member (Belum pernah booking sama sekali)
                if ($campaign->is_new_member_only) {
                    $existingOrders = Booking::where('user_id', $user->id)->exists();
                    if ($existingOrders) {
                        return response()->json(['status' => 'error', 'message' => 'Sorry, this promo is exclusively for your first booking as a new member.'], 400);
                    }
                }

                // 5. Cek point (khusus tipe points_based)
                if ($campaign->discount_type === 'points_based') {
                    if ($user->points < $campaign->required_points) {
                        return response()->json(['status' => 'error', 'message' => 'Your points are not sufficient to redeem this promo.'], 400);
                    }
                }

                // HITUNG DISKON BERDASARKAN TIPE UNIT
                if ($campaign->discount_unit === 'percentage') {
                    $calculated = ($subtotal * $campaign->discount_amount) / 100;
                    if ($campaign->max_discount > 0 && $calculated > $campaign->max_discount) {
                        $calculated = $campaign->max_discount;
                    }
                    $discountAmount = (int) $calculated;
                } else {
                    $discountAmount = (int) $campaign->discount_amount;
                }

                // POTONG POIN JIKA SAH DAN BERBASIS POIN
                if ($campaign->discount_type === 'points_based') {
                    $user->points -= $campaign->required_points;
                    $user->save();
                }
            }
        }

        $totalAmount = max(0, $subtotal - $discountAmount);

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
            'message' => 'Member booking successful!',
            'data' => [
                'id' => $booking->id,
                'unique_code' => $booking->unique_code,
                'booking_date' => $booking->booking_date,
                'booking_time' => $booking->booking_time,
                'status' => $booking->status,
                'payment_status' => $booking->payment_status,
                'total_amount' => $booking->total_amount,
                'service_name' => $service->name,
                'barber_name' => $booking->barber?->name ?? 'Any Barber',
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
                    'service_name' => $booking->services->first()?->name ?? 'Service Barbershop',
                    'barber_name' => $booking->barber?->name ?? 'Barber Anyone',
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
        
        // Hanya bisa cancelledkan jika status pending dan belum dibayar
        if ($booking->status !== 'pending' && $booking->status !== 'arrived') {
            return response()->json(['status' => 'error', 'message' => 'Booking cannot be cancelled.'], 400);
        }

        if ($booking->payment_status === 'paid') {
            return response()->json(['status' => 'error', 'message' => 'Paid bookings cannot be cancelled here. Please contact the admin.'], 400);
        }

        $booking->status = 'cancelled';
        $booking->save();

        return response()->json(['status' => 'success', 'message' => 'Booking successfully cancelled.']);
    }

    public function createPayment(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->payment_status === 'paid') {
            return response()->json(['status' => 'error', 'message' => 'This booking has already been paid for.'], 400);
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

        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized  = true;
        Config::$is3ds        = true;

        $orderId = 'ORDER-' . $booking->unique_code . '-' . time();
        $booking->midtrans_order_id = $orderId;
        $booking->save();

        $customerName  = $booking->guest_name  ?? ($booking->user?->name  ?? 'Customer');
        $customerPhone = $booking->guest_phone ?? ($booking->user?->phone ?? '');
        $customerEmail = $booking->user?->email ?? 'customer@themodernartisan.com';

        $serviceName = DB::table('booking_details')
            ->join('services', 'booking_details.service_id', '=', 'services.id')
            ->where('booking_details.booking_id', $booking->id)
            ->value('services.name') ?? 'Service Barbershop';

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
                'shopeepay',
                'indomaret',
                'alfamart',
            ],
        ];

        $snapToken = Snap::getSnapToken($params);

        return response()->json([
            'status'     => 'success',
            'snap_token' => $snapToken,
            'order_id'   => $orderId,
        ]);
    }

    public function handleMidtransNotification(Request $request)
    {
        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production', false);

        $notification = new Notification();

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

        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized  = true;

        if (!$booking->midtrans_order_id) {
            return response()->json(['status' => 'error', 'message' => 'There are no Midtrans transactions yet for this booking.'], 400);
        }

        try {
            $status = (object) Transaction::status($booking->midtrans_order_id);

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
                'message'        => 'Payment status successfully updated.'
            ]);
        } catch (Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    private function sendBookingConfirmationEmail($booking, $filePath)
    {
        $booking->load(['user']);
        $recipientEmail = $booking->guest_email ?? ($booking->user?->email ?? null);

        if (!$recipientEmail) return;

        try {
            Mail::to($recipientEmail)->send(
                new BookingTicketMail($booking, $filePath)
            );
            Log::info("Ticket email sent to {$recipientEmail}");
        } catch (Exception $e) {
            Log::error("Failed to send ticket email: " . $e->getMessage());
        }
    }

    // --- MESIN UTAMA PENGIRIM WHATSAPP (DRY PRINCIPLE) ---
    private function sendBookingConfirmationWhatsapp($booking)
    {
        $booking->load(['barber', 'services', 'user']);

        $phone = $booking->guest_phone ?? ($booking->user?->phone ?? null);
        $name = $booking->guest_name ?? ($booking->user?->name ?? 'Customer');

        if (!$phone) {
            Log::warning("No WhatsApp number found for booking {$booking->id}. WhatsApp not sent.");
            return;
        }

        if (substr($phone, 0, 1) === '0') {
            $phone = '62' . substr($phone, 1);
        }

        $serviceName = $booking->services->first()?->name ?? 'Service Barbershop';
        $barberName = $booking->barber?->name ?? 'Any Barber';

        $message = "Hello *{$name}*!\n\n";
        $message .= "Your payment for booking at *The Modern Artisan* has been successfully confirmed. ✅\n\n";
        $message .= "*Booking Details:*\n";
        $message .= "Booking Code: *{$booking->unique_code}*\n";
        $message .= "Service: *{$serviceName}*\n";
        $message .= "Barber: *{$barberName}*\n";
        $message .= "Date: *" . date('d M Y', strtotime($booking->booking_date)) . "*\n";
        $message .= "Time: *" . substr($booking->booking_time, 0, 5) . " WIB*\n\n";

        // Logika Pintar: Member vs Guest
        if ($booking->user_id) {
            $message .= "Please check your *Email* to view your official e-ticket. Show the e-ticket or the booking code above to our barber upon arrival.\n\n";
        } else {
            $message .= "Your e-ticket has been securely recorded in our system. Please show the booking code above directly to our barber upon arrival.\n\n";
        }

        $message .= "Thank you and see you at our barbershop! ✂️";

        $fonnteToken = env('FONNTE_TOKEN') ?? config('services.fonnte.token');

        if (!$fonnteToken) {
            Log::warning("Fonnte token is not configured. WhatsApp not sent for booking {$booking->unique_code}");
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
            Log::info("WhatsApp confirmation successfully sent to {$phone} for booking {$booking->unique_code}");
        } else {
            Log::error("WhatsApp failed to send to {$phone} for booking {$booking->unique_code}. Response: " . $response);
        }
    }

    public function sendWhatsapp(Request $request, $id)
    {
        $request->validate([
            'ticket_image' => 'required|string',
        ]);

        $booking = Booking::with(['user', 'services', 'barber'])->findOrFail($id);

        // 1. Save Image Keren Buatan React Kamu!
        $image_parts = explode(";base64,", $request->ticket_image);
        if (count($image_parts) == 2) {
            $image_base64 = base64_decode($image_parts[1]);
            $fileName = 'ticket_' . $booking->unique_code . '_' . time() . '.png';
            $folderPath = storage_path('app/public/tickets');

            if (!File::exists($folderPath)) {
                File::makeDirectory($folderPath, 0755, true);
            }

            $filePath = $folderPath . '/' . $fileName;
            File::put($filePath, $image_base64);

            // 2. Kirim Email pakai gambar yang BARUSAN AJA disimpan!
            $this->sendBookingConfirmationEmail($booking, $filePath);
        }

        // NOTE: Perintah kirim WA dihapus of sini! 
        // WA murni hanya dikirim 1x saat status Midtrans berubah jadi 'paid'.

        return response()->json([
            'status' => 'success',
            'message' => 'E-Ticket saved and sent via Email successfully!',
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
            return response()->json(['status' => 'error', 'message' => 'Booking not found.'], 404);
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
            return response()->json(['status' => 'error', 'message' => 'The selected time slot is full.'], 400);
        }

        if ($request->barber_id) {
            $isBarberBooked = Booking::where('booking_date', $request->booking_date)
                ->where('booking_time', $timeFormat)
                ->where('id', '!=', $booking->id)
                ->where('barber_id', $request->barber_id)
                ->whereIn('status', ['pending', 'arrived', 'processing'])
                ->exists();

            if ($isBarberBooked) {
                return response()->json(['status' => 'error', 'message' => 'This barber is already booked for the selected time.'], 400);
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

        return response()->json(['status' => 'success', 'message' => 'Schedule successfully rescheduled!', 'data' => $booking]);
    }
}
