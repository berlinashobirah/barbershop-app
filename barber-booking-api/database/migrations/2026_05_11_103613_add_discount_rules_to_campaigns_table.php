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
        Schema::table('campaigns', function (Blueprint $table) {
            $table->enum('discount_unit', ['fixed', 'percentage'])->default('fixed')->after('discount_type');
            $table->decimal('min_transaction', 10, 2)->default(0)->after('discount_amount');
            $table->decimal('max_discount', 10, 2)->nullable()->after('min_transaction');
            $table->boolean('is_new_member_only')->default(false)->after('end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn(['discount_unit', 'min_transaction', 'max_discount', 'is_new_member_only']);
        });
    }
};
