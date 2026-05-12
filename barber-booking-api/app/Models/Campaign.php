<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image',
        'discount_type',
        'discount_unit',
        'service_id',
        'required_points',
        'discount_amount',
        'min_transaction',
        'max_discount',
        'is_active',
        'start_date',
        'end_date',
        'is_new_member_only',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_new_member_only' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'discount_amount' => 'decimal:2',
        'min_transaction' => 'decimal:2',
        'max_discount' => 'decimal:2',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
