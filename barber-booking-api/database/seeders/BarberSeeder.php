<?php

namespace Database\Seeders;

use App\Models\Barber;
use Illuminate\Database\Seeder;

class BarberSeeder extends Seeder
{
    public function run(): void
    {
        $barbers = [
            [
                'name' => 'Andra Wijaya',
                'specialty' => 'Fades & Textured Cuts',
                'status' => 'active',
            ],
            [
                'name' => 'Dimas Pratama',
                'specialty' => 'Gentlemen Classics & Shaves',
                'status' => 'active',
            ],
            [
                'name' => 'Rahmat Hidayat',
                'specialty' => 'Coloring & Modern Style',
                'status' => 'active',
            ],
        ];

        foreach ($barbers as $barber) {
            Barber::create($barber);
        }
    }
}
