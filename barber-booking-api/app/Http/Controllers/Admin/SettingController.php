<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Public endpoint – anyone can view settings (for landing page).
     */
    public function publicShow()
    {
        $settings = BusinessSetting::first();

        if (! $settings) {
            $settings = BusinessSetting::create([
                'shop_name'         => 'The Modern Artisan',
                'shop_email'        => 'artisan@luxury.com',
                'address'           => 'Jalan Senopati No. 45, Kebayoran Baru, Jakarta Selatan, 12190',
                'latitude'          => -6.2297,
                'longitude'         => 106.8178,
                'phone'             => '+62 21 555 1234',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $settings,
        ]);
    }

    /**
     * Admin – view settings (auth required).
     */
    public function show(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak. Anda bukan Admin.'], 403);
        }

        $settings = BusinessSetting::first();

        if (! $settings) {
            $settings = BusinessSetting::create([
                'shop_name'         => 'The Modern Artisan',
                'shop_email'        => 'artisan@luxury.com',
                'address'           => 'Jalan Senopati No. 45, Kebayoran Baru, Jakarta Selatan, 12190',
                'latitude'          => -6.2297,
                'longitude'         => 106.8178,
                'phone'             => '+62 21 555 1234',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $settings,
        ]);
    }

    /**
     * Admin – update settings.
     */
    public function update(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak. Anda bukan Admin.'], 403);
        }

        $validated = $request->validate([
            'shop_name'         => 'nullable|string|max:255',
            'shop_email'        => 'nullable|email|max:255',
            'address'           => 'nullable|string',
            'latitude'          => 'nullable|numeric|between:-90,90',
            'longitude'         => 'nullable|numeric|between:-180,180',
            'phone'             => 'nullable|string|max:50',
        ]);

        $settings = BusinessSetting::first();

        if (! $settings) {
            $settings = BusinessSetting::create($validated);
        } else {
            $settings->update($validated);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Pengaturan berhasil diperbarui.',
            'data'    => $settings->fresh(),
        ]);
    }
}
