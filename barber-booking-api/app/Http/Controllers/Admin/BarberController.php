<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barber;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BarberController extends Controller
{
    public function index()
    {
        $barbers = Barber::all();
        return response()->json(['data' => $barbers]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'specialty' => 'nullable|string|max:255',
            'status' => 'required|in:Available,Busy,Absent',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('barbers', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $barber = Barber::create($validated);

        return response()->json(['message' => 'Barber berhasil ditambahkan', 'data' => $barber], 201);
    }

    public function show($id)
    {
        $barber = Barber::findOrFail($id);
        return response()->json(['data' => $barber]);
    }

    public function update(Request $request, $id)
    {
        $barber = Barber::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'specialty' => 'nullable|string|max:255',
            'status' => 'sometimes|required|in:Available,Busy,Absent',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($barber->image) {
                $oldPath = str_replace('/storage/', '', $barber->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('barbers', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $oldStatus = $barber->status;
        $barber->update($validated);

        if ($validated['status'] === 'Absent' && $oldStatus !== 'Absent') {
            $pendingBookings = Booking::where('barber_id', $barber->id)
                ->whereIn('status', ['pending', 'arrived', 'processing'])
                ->get();
            
            foreach ($pendingBookings as $booking) {
                $booking->requires_reschedule = true;
                $booking->save();
                $this->sendRescheduleNotification($booking, $barber->name);
            }
        }

        return response()->json(['message' => 'Barber berhasil diperbarui', 'data' => $barber]);
    }

    public function destroy($id)
    {
        $barber = Barber::findOrFail($id);
        
        // Ambil semua booking aktif milik barber ini sebelum dihapus
        $pendingBookings = Booking::where('barber_id', $barber->id)
            ->whereIn('status', ['pending', 'arrived', 'processing'])
            ->get();
        
        // Kirim notifikasi Reschedule Gratis ke semua customer yang terdampak
        foreach ($pendingBookings as $booking) {
            $booking->requires_reschedule = true;
            $booking->save();
            $this->sendRescheduleNotification($booking, $barber->name);
        }

        if ($barber->image) {
            $oldPath = str_replace('/storage/', '', $barber->image);
            Storage::disk('public')->delete($oldPath);
        }

        $barber->delete();

        return response()->json(['message' => 'Barber berhasil dihapus dan notifikasi reschedule terkirim.']);
    }

    private function sendRescheduleNotification($booking, $barberName)
    {
        $booking->load(['user']);
        $phone = $booking->guest_phone ?? ($booking->user?->phone ?? null);
        $name = $booking->guest_name ?? ($booking->user?->name ?? 'Kak');

        if (!$phone) return;
        if (substr($phone, 0, 1) === '0') $phone = '62' . substr($phone, 1);

        $frontendUrl = config('app.frontend_url') ?? 'https://modernartisan-barbershop.my.id';
        $rescheduleLink = rtrim($frontendUrl, '/') . "/reschedule/" . $booking->unique_code;

        $message = "Hello *{$name}*!\n\n";
        $message .= "We apologize, but our barber *{$barberName}* that you selected for booking *{$booking->unique_code}* is currently unavailable to attend.\n\n";
        $message .= "Please reschedule your appointment or select another barber for FREE via the following link:\n\n";
        $message .= "{$rescheduleLink}\n\n";
        $message .= "Thank you for your understanding. 🙏";

        $fonnteToken = config('services.fonnte.token');
        if (!$fonnteToken) return;

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
            CURLOPT_POSTFIELDS => array('target' => $phone, 'message' => $message),
            CURLOPT_HTTPHEADER => array('Authorization: ' . $fonnteToken),
        ));
        $response = curl_exec($curl);
        curl_close($curl);
    }
}
