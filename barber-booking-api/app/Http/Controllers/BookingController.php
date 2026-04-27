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
            '10:00', '11:00', '12:00', '13:00', '14:00', 
            '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
        ];

        // Total available barbers overall (excluding On Break maybe? Or just count all barbers)
        // Let's assume all barbers in DB could potentially work
        $totalBarbers = Barber::count();

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

        // Get barbers that are NOT in the bookedBarberIds array
        $availableBarbers = Barber::whereNotIn('id', $bookedBarberIds)->get();

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

        // 3. GENERATE KODE UNIK
        $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        while (Booking::where('unique_code', $uniqueCode)->exists()) {
            $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        }

        // 4. SIMPAN KE DATABASE
        $service = \App\Models\Service::find($request->service_id);

        $booking = Booking::create([
            'unique_code' => $uniqueCode,
            'user_id' => null, // KOSONG KARENA INI GUEST
            'guest_name' => $request->guest_name,
            'guest_phone' => $request->guest_phone,
            'barber_id' => $request->barber_id,
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

        // 5. KEMBALIKAN RESPONS SUKSES KE FRONTEND
        return response()->json([
            'status' => 'success',
            'message' => 'Booking berhasil!',
            'data' => $booking
        ], 201); // 201 Created
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

        // 3. GENERATE KODE UNIK
        $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        while (Booking::where('unique_code', $uniqueCode)->exists()) {
            $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        }

        // 4. SIMPAN KE DATABASE (Ambil ID User dari Token)
        $service = \App\Models\Service::find($request->service_id);

        $booking = Booking::create([
            'unique_code' => $uniqueCode,
            'user_id' => $request->user()->id, // <-- INI BEDANYA DENGAN GUEST
            'guest_name' => null,
            'guest_phone' => null,
            'barber_id' => $request->barber_id,
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

        return response()->json([
            'status' => 'success',
            'message' => 'Booking Member berhasil!',
            'data' => $booking
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

    public function adminTodayQueue(Request $request)
    {
        // 1. Cek apakah yang akses ini benar-benar Admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak. Anda bukan Admin.'], 403);
        }

        // 2. Ambil tanggal hari ini secara dinamis (format: YYYY-MM-DD)
        $today = now()->toDateString();

        // 3. Tarik data antrean khusus hari ini
        // with(['user', 'barber']) digunakan agar data nama member dan nama kapster
        $todayBookings = Booking::with(['user', 'barber'])
            ->where('booking_date', $today)
            ->orderBy('booking_time', 'asc') // Urutkan jam dari pagi ke malam
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Data antrean hari ini berhasil diambil',
            'data' => $todayBookings
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        // Cek apakah yang akses ini benar-benar Admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak. Anda bukan Admin.'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,arrived,processing,completed,cancelled'
        ]);

        $booking = Booking::findOrFail($id);
        $booking->status = $request->status;
        $booking->save();

        return response()->json([
            'message' => 'Status antrean berhasil diupdate menjadi ' . $booking->status,
            'data' => $booking
        ]);
    }
}
