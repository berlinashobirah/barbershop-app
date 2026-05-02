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
        Schema::table('users', function (Blueprint $table) {
            $table->integer('points')->default(0)->after('role');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->integer('points_reward')->default(50)->after('price');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->boolean('points_awarded')->default(false)->after('total_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('points');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('points_reward');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('points_awarded');
        });
    }
};
