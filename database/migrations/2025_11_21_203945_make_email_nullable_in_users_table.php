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
            // Drop the unique constraint if it exists
            $table->dropUnique(['email']);
            // Make email nullable
            $table->string('email')->nullable()->change();
            // Add unique constraint that allows nulls (via partial index in MySQL)
            $table->unique('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->string('email')->nullable(false)->change();
            $table->unique('email');
        });
    }
};
