<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->json('addon_ids')->nullable();
            $table->integer('reschedule_count')->default(0)->after('payment_status');
            $table->boolean('requires_reschedule')->default(false)->after('reschedule_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['addon_ids', 'reschedule_count', 'requires_reschedule']);
        });
    }
};
