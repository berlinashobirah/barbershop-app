<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Barber;
use Illuminate\Http\Request;
use Illuminate\Support\Str; // Untuk membuat string acak

class BookingController extends Controller
{
    public function storeGuest(Request $request)
    {
        // 1. Validasi Input dari Frontend (React nanti)
        $request->validate([
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'required|numeric', // Harus angka
            'booking_date' => 'required|date',
            'booking_time' => 'required',
            'barber_id' => 'nullable|exists:barbers,id' // Boleh diisi, boleh kosong (Siapa Saja)
        ]);

        // 2. CEK KUOTA (LOGIKA UTAMA)
        // Hitung berapa kapster yang sedang aktif hari ini
        $activeBarbersCount = Barber::where('is_active', true)->count();

        // Hitung ada berapa orang yang sudah booking di tanggal dan jam yang sama
        $existingBookingsCount = Booking::where('booking_date', $request->booking_date)
            ->where('booking_time', $request->booking_time)
            ->whereIn('status', ['pending', 'arrived', 'processing'])
            ->count();

        // Jika jumlah antrean sudah sama atau lebih dari jumlah kapster, TOLAK!
        if ($existingBookingsCount >= $activeBarbersCount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Maaf, slot pada jam tersebut sudah penuh. Silakan pilih jam lain.'
            ], 400); // 400 Bad Request
        }

        // 3. GENERATE KODE UNIK
        // Membuat string acak misal: BRB-7X9A2
        $uniqueCode = 'BRB-' . strtoupper(Str::random(5));

        // Pastikan kode benar-benar unik (tidak ada di database)
        while (Booking::where('unique_code', $uniqueCode)->exists()) {
            $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        }

        // 4. SIMPAN KE DATABASE
        $booking = Booking::create([
            'unique_code' => $uniqueCode,
            'user_id' => null, // KOSONG KARENA INI GUEST
            'guest_name' => $request->guest_name,
            'guest_phone' => $request->guest_phone,
            'barber_id' => $request->barber_id,
            'booking_date' => $request->booking_date,
            'booking_time' => $request->booking_time,
            'status' => 'pending'
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
            'barber_id' => 'nullable|exists:barbers,id'
        ]);

        // 2. CEK KUOTA (Sama seperti Guest)
        $activeBarbersCount = Barber::where('is_active', true)->count();
        $existingBookingsCount = Booking::where('booking_date', $request->booking_date)
            ->where('booking_time', $request->booking_time)
            ->whereIn('status', ['pending', 'arrived', 'processing'])
            ->count();

        if ($existingBookingsCount >= $activeBarbersCount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Maaf, slot pada jam tersebut sudah penuh.'
            ], 400);
        }

        // 3. GENERATE KODE UNIK
        $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        while (Booking::where('unique_code', $uniqueCode)->exists()) {
            $uniqueCode = 'BRB-' . strtoupper(Str::random(5));
        }

        // 4. SIMPAN KE DATABASE (Ambil ID User dari Token)
        $booking = Booking::create([
            'unique_code' => $uniqueCode,
            'user_id' => $request->user()->id, // <-- INI BEDANYA DENGAN GUEST
            'guest_name' => null,
            'guest_phone' => null,
            'barber_id' => $request->barber_id,
            'booking_date' => $request->booking_date,
            'booking_time' => $request->booking_time,
            'status' => 'pending'
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
