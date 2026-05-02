<?php

namespace Database\Seeders;

use App\Models\Barber;
use Illuminate\Database\Seeder;

class BarberSeeder extends Seeder
{
    public function run(): void
    {
        // Delete existing barbers to avoid duplicates
        Barber::truncate();

        $barbers = [
            [
                'name' => 'Julian "The Edge" Rossi',
                'specialty' => 'Fades, Tapers & Sharp Contours',
                'status' => 'Available',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6KFI3W9jJcCb50cA2Uc3nfwkHy6p9SsarNtW5gEVY4LW1odpyCiNmvnXop4Zzl4mLeeHWXyaRfZiLX7vElYWy4oBFdx5--22J90JuiUzqCLmOMHkkfAbgZkDs9zny-tii3Z4vZUbOty6t0DBPSw2_4yxjErapE-Y3CQkzn3yE0UxGTfO5R6kzkln_LJpif5K6v_4fbcT2GoYKu96lRmZCpIXA6fgG5SCB-2yDQ6RCStZKif4KYvKj8EupSpfHOvXohrsDsrsb-u8',
            ],
            [
                'name' => 'Marcus Vane',
                'specialty' => 'Beard Sculpting & Hot Shave',
                'status' => 'Busy',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCKVlU4zepfDin7Z7UhfvWCF5LXa4B2gEA8k6mELS2hfePHiWz9kN5CfGIi78jCdpqKzUlICK0hXmSXKAN7SkDfis0TTph_LKxVuDZPxfmuP-wKXZdVBjcvCIc-6TZQ1KQS_Pn9ucxP1RvufS1Ape4RaChLkIG4RMCsZXUFQ_ENlolgWMkxciZ6oNvzZEZryVnx5I1luFF5YkzXgF6SnZciFP-M7bZqP5VWPRSUwSbm4WoiAjE5VX2ZBKGBUUh5PTKmiLwCD3D1Xk',
            ],
            [
                'name' => 'Silas Thorne',
                'specialty' => 'Classic Scissors & Vintage Styling',
                'status' => 'On Break',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX1mXSHbSMBrsCKIch5YUJ_3OA0I2ZPoH4X9FoCNZOxAcAo82ycqyeNlbI6EvS6JypCgqG9PDP_7b5sIaFBPVwVlVLLmQQyyQ1_qUKR5iZRlIGBvVD8FpmKUFpkPaAoN9jQkP4ca1EZIoyBIWRTTKMuZ1E6y1EyXIS6RFols21vIp3hvDbdEbxYQTaHQ5tn6YffzEjtyf59BKL-kg390uRN3A1Pd9bsQ_aceKOm9RVVI8dfBlxW7KUsaAYN1Ix14iNGYJblOnsuVA',
            ],
            [
                'name' => 'Leo Castiglione',
                'specialty' => 'Modern Textures & Styling',
                'status' => 'Available',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuBupC9IinjzZkjPmLSLyF3ZYm0J1SY62toN2ss0M1_BeI8zCIv30uHOzxmwPv-yM4AYml-gmXvXgbYbNbRX6MAhlKEOJiqKJw5-kqguPH4y0dYwv7iUCuLJrsU_pKN2smSJr8HSlronJLbF3NyZMY3GyCrHyGhb0fBIvYfl--FbsiG_N-3lACIeSXNMaU0c0MGlg0hltadqdsnCjVOUHzlvnv5RSqqmFZa-dXizDR0sFi0rFQUE_xWnLsfAEYciVVpVAbmKAxFpOXw',
            ],
            [
                'name' => 'Elena Moretti',
                'specialty' => 'Luxury Grooming & Head Therapy',
                'status' => 'Available',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJPE_rGxHFbn1NjtM0sD35txZnmaRWov2UCt6OJa1nHd1bUvHABrNm78f8zx_6RNNIz8iLDZhE6EBRoEUNsoIuY4Wmsv3q-w5sJQ2Zd1nsdEIWKGMTXDu_iwoWYO3pSff7Y4ra_FlubHxepnBqvAPnI-bORY8DCWLaIEtABJDHd4RCfi8YPpD62QLdx09Eec_6DV9RS5hjdojbqaD7nnfw1W76oFndHEX1TtX13j4GcHp46xewVUAHg9cHcFGCPqigLd95FaMoN0Y',
            ],
            [
                'name' => 'Dominic Hart',
                'specialty' => 'Precision Buzz Cuts & Line Ups',
                'status' => 'Busy',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQyLLSzoKuV0x10UhVvXt7bs0eUoryIwY1Y1SfoxySZbg5LH37uHhqcZ6UMbkEWBGqdKY794A9yQrpgt1I7MT7uYvWsMsLW7AQ90FPx2eCPs6BK8adZKiFVAobyCsd8f_m-ivPiMLBhI2LjE0Y85brIz2NfjYOKLDYSoE5HTLTXMSqpRxUw_Ycf-gbUHX48PGJlhqLUlVoLrxT900_eYXRAt3RQsuRF9OuVVyzl3YALt993G3DSmwUII9IP1LZYedt5ShPRUwADGs',
            ],
            [
                'name' => 'Victor Sterling',
                'specialty' => 'Master Colorist & Scissor Cuts',
                'status' => 'Available',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXmIBy6-hD7vS0a1Y9H8T6R4N2z5fX3w9O1Y2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P',
            ],
            [
                'name' => 'Sasha Grey',
                'specialty' => 'Texture Specialist & Razor Fades',
                'status' => 'Available',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V',
            ],
        ];

        foreach ($barbers as $barber) {
            Barber::create($barber);
        }
    }
}
