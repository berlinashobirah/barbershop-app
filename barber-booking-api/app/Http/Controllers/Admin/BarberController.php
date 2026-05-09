<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barber;
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

        return response()->json(['message' => 'Kapster berhasil ditambahkan', 'data' => $barber], 201);
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
            $pendingBookings = \App\Models\Booking::where('barber_id', $barber->id)
                ->whereIn('status', ['pending', 'arrived', 'processing'])
                ->get();
            
            foreach ($pendingBookings as $booking) {
                $booking->requires_reschedule = true;
                $booking->save();
                $this->sendRescheduleNotification($booking, $barber->name);
            }
        }

        return response()->json(['message' => 'Kapster berhasil diperbarui', 'data' => $barber]);
    }

    public function destroy($id)
    {
        $barber = Barber::findOrFail($id);
        
        if ($barber->image) {
            $oldPath = str_replace('/storage/', '', $barber->image);
            Storage::disk('public')->delete($oldPath);
        }

        $barber->delete();

        return response()->json(['message' => 'Kapster berhasil dihapus']);
    }

    private function sendRescheduleNotification($booking, $barberName)
    {
        $booking->load(['user']);
        $phone = $booking->guest_phone ?? ($booking->user?->phone ?? null);
        $name = $booking->guest_name ?? ($booking->user?->name ?? 'Kak');

        if (!$phone) return;
        if (substr($phone, 0, 1) === '0') $phone = '62' . substr($phone, 1);

        $rescheduleLink = "http://localhost:5173/reschedule/" . $booking->unique_code;

        $message = "Halo *{$name}*!\n\n";
        $message .= "Mohon maaf, kapster *{$barberName}* yang Anda pilih untuk booking *{$booking->unique_code}* saat ini berhalangan hadir.\n\n";
        $message .= "Silakan lakukan penjadwalan ulang (Reschedule) atau pilih kapster lain secara GRATIS melalui link berikut:\n\n";
        $message .= "{$rescheduleLink}\n\n";
        $message .= "Terima kasih atas pengertian Anda. 🙏";

        $fonnteToken = env('FONNTE_TOKEN') ?? config('services.fonnte.token');
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
