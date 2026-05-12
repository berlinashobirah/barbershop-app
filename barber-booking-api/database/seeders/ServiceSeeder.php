<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'French Crop Cut',
                'description' => 'Modern short haircut with textured top and neat sides.',
                'duration_minutes' => 45,
                'price' => 85000,
                'points_reward' => 15,
                'is_addon' => false,
            ],
            [
                'name' => 'Artisan Haircut',
                'description' => 'Premium haircut experience tailored by our master barber with hot towel service.',
                'duration_minutes' => 60,
                'price' => 120000,
                'points_reward' => 25,
                'is_addon' => false,
            ],
            [
                'name' => 'Beard Grooming',
                'description' => 'Clean shave or trim using straight razor and beard oils.',
                'duration_minutes' => 30,
                'price' => 50000,
                'points_reward' => 10,
                'is_addon' => true,
            ],
            [
                'name' => 'Hair Mask Treatment',
                'description' => 'Nourishing mask to revitalize dry scalp and damaged hair.',
                'duration_minutes' => 20,
                'price' => 35000,
                'points_reward' => 5,
                'is_addon' => true,
            ],
            [
                'name' => 'Gentlemen Hair Color',
                'description' => 'Natural looking grey coverage or dynamic highlights.',
                'duration_minutes' => 90,
                'price' => 250000,
                'points_reward' => 50,
                'is_addon' => false,
            ],
        ];

        foreach ($services as $svc) {
            Service::create($svc);
        }
    }
}
