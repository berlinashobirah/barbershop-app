<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barber extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'image', 'specialty', 'status'];

    // Relasi: Satu Barber bisa menangani banyak Booking
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}