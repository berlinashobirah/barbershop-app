<?php

namespace Database\Seeders;

use App\Models\Campaign;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class CampaignSeeder extends Seeder
{
    public function run(): void
    {
        $campaigns = [
            [
                'title' => 'Welcome Discount 20%',
                'description' => 'Special welcoming discount for all new registered members!',
                'discount_type' => 'all_services',
                'discount_unit' => 'percentage',
                'discount_amount' => 20,
                'min_transaction' => 50000,
                'max_discount' => 50000,
                'is_new_member_only' => true,
                'is_active' => true,
                'start_date' => Carbon::now(),
                'end_date' => Carbon::now()->addMonths(6),
            ],
            [
                'title' => 'Redeem 100 Points',
                'description' => 'Exchange your 100 loyalty points for an instant Rp 25.000 discount.',
                'discount_type' => 'points_based',
                'discount_unit' => 'fixed',
                'required_points' => 100,
                'discount_amount' => 25000,
                'min_transaction' => 0,
                'is_new_member_only' => false,
                'is_active' => true,
                'start_date' => Carbon::now(),
            ],
            [
                'title' => 'Artisan Special Promo',
                'description' => 'Enjoy Rp 30.000 off on our signature Artisan Haircut service.',
                'discount_type' => 'specific_service',
                'discount_unit' => 'fixed',
                'discount_amount' => 30000,
                // Kita asumsikan id 2 adalah Artisan Haircut dari ServiceSeeder sebelumnya
                'service_id' => 2, 
                'min_transaction' => 100000,
                'is_new_member_only' => false,
                'is_active' => true,
                'start_date' => Carbon::now(),
                'end_date' => Carbon::now()->addMonths(1),
            ],
            [
                'title' => 'Flash Sale 50%',
                'description' => 'Massive weekend deal for all treatments!',
                'discount_type' => 'all_services',
                'discount_unit' => 'percentage',
                'discount_amount' => 50,
                'min_transaction' => 200000,
                'max_discount' => 100000,
                'is_new_member_only' => false,
                'is_active' => true,
                'start_date' => Carbon::now(),
                'end_date' => Carbon::now()->addDays(7),
            ],
        ];

        foreach ($campaigns as $campaign) {
            Campaign::create($campaign);
        }
    }
}
