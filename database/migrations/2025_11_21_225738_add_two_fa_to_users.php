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
            $table->boolean('two_fa_enabled')->default(false)->after('email');
            $table->string('two_fa_secret')->nullable()->after('two_fa_enabled');
            $table->json('two_fa_backup_codes')->nullable()->after('two_fa_secret');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('two_fa_enabled');
            $table->dropColumn('two_fa_secret');
            $table->dropColumn('two_fa_backup_codes');
        });
    }
};
