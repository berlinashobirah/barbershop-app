<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Barber;
use Illuminate\Http\Request;

class MasterController extends Controller
{
    // Fungsi untuk mengambil semua data layanan & harga
    public function getServices()
    {
        // Mengambil semua data dari tabel services
        $services = Service::all();

        return response()->json([
            'status' => 'success',
            'data' => $services
        ]);
    }

    // Fungsi untuk mengambil kapster yang HANYA sedang aktif
    public function getActiveBarbers()
    {
        // Mengambil semua kapster yang tidak sedang 'Absent'
        $barbers = Barber::where('status', '!=', 'Absent')->get();

        return response()->json([
            'status' => 'success',
            'data' => $barbers
        ]);
    }
}