<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Data Admin
        User::create([
            'name' => 'Admin Barber',
            'phone' => '081234567890',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // Data Member Contoh
        User::create([
            'name' => 'Berlina Member',
            'phone' => '089876543210',
            'password' => Hash::make('member123'),
            'role' => 'member',
        ]);
    }
}