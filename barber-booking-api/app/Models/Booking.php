<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'unique_code',
        'user_id',
        'guest_name',
        'guest_phone',
        'barber_id',
        'booking_date',
        'booking_time',
        'status',
        'total_amount',
        'payment_status',
        'midtrans_order_id',
        'midtrans_transaction_id',
        'points_awarded',
    ];

    // Relasi balik ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi balik ke Barber
    public function barber()
    {
        return $this->belongsTo(Barber::class);
    }

    // Relasi Many-to-Many ke Service
    public function services()
    {
        return $this->belongsToMany(Service::class, 'booking_details')
                    ->withPivot('price_snapshot')
                    ->withTimestamps();
    }
}