<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('unique_code', 20)->unique();

            // Nullable untuk sistem Guest/Member
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('guest_name')->nullable();
            $table->string('guest_phone')->nullable();

            // Nullable jika pilih "Siapa Saja"
            $table->foreignId('barber_id')->nullable()->constrained('barbers')->onDelete('set null');

            $table->date('booking_date');
            $table->time('booking_time');
            $table->enum('status', ['pending', 'arrived', 'processing', 'completed', 'cancelled'])->default('pending');
            $table->integer('total_amount')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
