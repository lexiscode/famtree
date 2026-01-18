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
            $table->boolean('is_memorial')->default(false)->after('last_active_at')->index();
            $table->timestamp('memorialized_at')->nullable()->after('is_memorial');
            $table->foreignId('memorialized_by')->nullable()->after('memorialized_at')->constrained('users')->nullOnDelete();
            $table->string('reactivation_token')->nullable()->after('memorialized_by');
            $table->timestamp('reactivation_token_expires_at')->nullable()->after('reactivation_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['memorialized_by']);
            $table->dropIndex(['is_memorial']);
            $table->dropColumn([
                'is_memorial',
                'memorialized_at',
                'memorialized_by',
                'reactivation_token',
                'reactivation_token_expires_at',
            ]);
        });
    }
};
