<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['name' => 'Gentleman Haircut', 'duration_minutes' => 30, 'price' => 35000],
            ['name' => 'Hairwash & Massage', 'duration_minutes' => 15, 'price' => 15000],
            ['name' => 'Hair Coloring', 'duration_minutes' => 60, 'price' => 75000],
            ['name' => 'Shaving', 'duration_minutes' => 20, 'price' => 10000],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}