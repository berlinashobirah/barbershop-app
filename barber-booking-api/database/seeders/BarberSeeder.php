<?php

namespace Database\Seeders;

use App\Models\Barber;
use Illuminate\Database\Seeder;

class BarberSeeder extends Seeder
{
    public function run(): void
    {
        $barbers = [
            ['name' => 'Ahmad'],
            ['name' => 'Budi'],
            ['name' => 'Candra'],
        ];

        foreach ($barbers as $barber) {
            Barber::create($barber);
        }
    }
}
