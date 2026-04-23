<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class BookingDetail extends Pivot
{
    protected $table = 'booking_details';

    protected $fillable = [
        'booking_id',
        'service_id',
        'price_snapshot'
    ];
}