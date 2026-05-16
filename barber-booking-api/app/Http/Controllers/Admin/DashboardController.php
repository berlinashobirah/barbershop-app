<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $this->triggerLazyCron(); // Jalankan scheduler pengingat secara pasif di hosting

        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Access denied. You are not an Admin.'], 403);
        }

        $month = $request->query('month'); // format: YYYY-MM

        $query = Booking::query();

        if ($month) {
            $parts = explode('-', $month);
            if (count($parts) == 2) {
                $query->whereYear('booking_date', $parts[0])
                      ->whereMonth('booking_date', $parts[1]);
            }
        } else {
            $query->where('booking_date', now()->toDateString());
        }

        // Jangan hitung yang cancelled untuk total
        $query->where('status', '!=', 'cancelled');

        $totalToday     = (clone $query)->count();
        $processing     = (clone $query)->whereIn('status', ['arrived', 'processing'])->count();
        $completed      = (clone $query)->where('status', 'completed')->count();
        $revenue        = (clone $query)->where('status', 'completed')->sum('total_amount');

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
