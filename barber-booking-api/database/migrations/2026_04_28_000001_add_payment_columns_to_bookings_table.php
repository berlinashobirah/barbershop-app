<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('payment_status', ['unpaid', 'paid', 'failed', 'expired'])->default('unpaid')->after('total_amount');
            $table->string('midtrans_order_id')->nullable()->after('payment_status');
            $table->string('midtrans_transaction_id')->nullable()->after('midtrans_order_id');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'midtrans_order_id', 'midtrans_transaction_id']);
        });
    }
};
