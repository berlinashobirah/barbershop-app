<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Http\Request;
use Carbon\Carbon;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak. Anda bukan Admin.'], 403);
        }

        // Statistik Member
        $totalMembers = User::where('role', 'member')->count();
        $todayVisits = Booking::where('booking_date', Carbon::today()->toDateString())
                              ->where('status', 'completed')
                              ->count();

        // Ambil data member beserta total kunjungannya (booking completed)
        $members = User::where('role', 'member')
            ->withCount(['bookings as total_visits' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->orderBy('total_visits', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'summary' => [
                'total_members' => $totalMembers,
                'today_visits' => $todayVisits,
            ],
            'data' => $members
        ]);
    }
}
