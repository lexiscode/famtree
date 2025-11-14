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
            // Add death date field for tracking when a user was marked as deceased
            $table->date('death_date')->nullable()->after('status');

            // Add index for efficient queries
            $table->index('death_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['death_date']);
            $table->dropColumn('death_date');
        });
    }
};
