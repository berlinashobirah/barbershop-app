<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Campaign;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CampaignController extends Controller
{
    // Get active campaigns for public/landing page
    public function index()
    {
        $campaigns = Campaign::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('start_date')->orWhereDate('start_date', '<=', now()->timezone('Asia/Jakarta'));
            })
            ->where(function ($query) {
                $query->whereNull('end_date')->orWhereDate('end_date', '>=', now()->timezone('Asia/Jakarta'));
            })
            ->with('service')
            ->get();

        return response()->json($campaigns);
    }

    // Get all campaigns for admin
    public function adminIndex()
    {
        $campaigns = Campaign::with('service')->orderBy('created_at', 'desc')->get();
        return response()->json($campaigns);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'discount_type' => 'required|in:points_based,specific_service,all_services',
            'discount_unit' => 'required|in:fixed,percentage',
            'service_id' => 'nullable|exists:services,id',
            'required_points' => 'required_if:discount_type,points_based|integer|min:0',
            'discount_amount' => 'required|numeric|min:0',
            'min_transaction' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'is_new_member_only' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('campaigns', 'public');
            $validated['image'] = '/storage/' . $imagePath;
        }

        $campaign = Campaign::create($validated);
        return response()->json(['message' => 'Campaign created successfully', 'campaign' => $campaign], 201);
    }

    public function update(Request $request, $id)
    {
        $campaign = Campaign::findOrFail($id);

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'discount_type' => 'in:points_based,specific_service,all_services',
            'discount_unit' => 'in:fixed,percentage',
            'service_id' => 'nullable|exists:services,id',
            'required_points' => 'integer|min:0',
            'discount_amount' => 'numeric|min:0',
            'min_transaction' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'is_new_member_only' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if needed
            if ($campaign->image && Str::startsWith($campaign->image, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $campaign->image);
                Storage::disk('public')->delete($oldPath);
            }
            $imagePath = $request->file('image')->store('campaigns', 'public');
            $validated['image'] = '/storage/' . $imagePath;
        }

        $campaign->update($validated);
        return response()->json(['message' => 'Campaign updated successfully', 'campaign' => $campaign]);
    }

    public function destroy($id)
    {
        $campaign = Campaign::findOrFail($id);
        
        // Cleanup the physical image file if it exists
        if ($campaign->image && Str::startsWith($campaign->image, '/storage/')) {
            $path = str_replace('/storage/', '', $campaign->image);
            Storage::disk('public')->delete($path);
        }

        $campaign->delete();
        return response()->json(['message' => 'Campaign deleted successfully']);
    }
}
