<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'duration_minutes', 'price'];

    // Relasi Many-to-Many ke Booking melalui tabel pivot booking_details
    public function bookings()
    {
        return $this->belongsToMany(Booking::class, 'booking_details')
                    ->withPivot('price_snapshot')
                    ->withTimestamps();
    }
}