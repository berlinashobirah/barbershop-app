<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak. Anda bukan Admin.'], 403);
        }

        $today = now()->toDateString();

        $totalToday     = Booking::where('booking_date', $today)->count();
        $processing     = Booking::where('booking_date', $today)
                            ->whereIn('status', ['arrived', 'processing'])->count();
        $completed      = Booking::where('booking_date', $today)
                            ->where('status', 'completed')->count();
        $revenue        = Booking::where('booking_date', $today)
                            ->where('status', 'completed')
                            ->sum('total_amount');

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_today'  => $totalToday,
                'processing'   => $processing,
                'completed'    => $completed,
                'revenue_today'=> (int) $revenue,
            ]
        ]);
    }
}
