<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Booking;
use App\Models\Campaign;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::all();
        return response()->json(['data' => $services]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'points_reward' => 'required|integer|min:0',
            'is_addon' => 'nullable',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->has('is_addon')) {
            $validated['is_addon'] = filter_var($request->is_addon, FILTER_VALIDATE_BOOLEAN);
        } else {
            $validated['is_addon'] = false;
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('services', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $service = Service::create($validated);

        return response()->json(['message' => 'Service berhasil ditambahkan', 'data' => $service], 201);
    }

    public function show($id)
    {
        $service = Service::findOrFail($id);
        return response()->json(['data' => $service]);
    }

    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'sometimes|required|integer|min:1',
            'price' => 'sometimes|required|numeric|min:0',
            'points_reward' => 'sometimes|required|integer|min:0',
            'is_addon' => 'nullable',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->has('is_addon')) {
            $validated['is_addon'] = filter_var($request->is_addon, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($service->image) {
                $oldPath = str_replace('/storage/', '', $service->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('services', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $service->update($validated);

        return response()->json(['message' => 'Service berhasil diperbarui', 'data' => $service]);
    }

    public function destroy($id)
    {
        $service = Service::findOrFail($id);
        
        // 1. Check if service is linked to any booking in booking_details
        $hasBookings = DB::table('booking_details')->where('service_id', $id)->exists();
            
        if ($hasBookings) {
            return response()->json([
                'message' => 'This service cannot be deleted because it has existing customer booking records in the system!',
                'error_code' => 'SERVICE_IN_USE'
            ], 400);
        }

        // 2. Check if service is tied to an active/inactive Campaign (promotion)
        $hasCampaigns = Campaign::where('service_id', $id)->exists();
        if ($hasCampaigns) {
            return response()->json([
                'message' => 'This service is currently tied to an active promotional campaign. Please delete or detach the promotion first!',
                'error_code' => 'SERVICE_IN_PROMOTION'
            ], 400);
        }
        
        if ($service->image) {
            $oldPath = str_replace('/storage/', '', $service->image);
            Storage::disk('public')->delete($oldPath);
        }

        $service->delete();

        return response()->json(['message' => 'Service successfully deleted']);
    }
}
