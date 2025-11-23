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
            $table->enum('stories_visibility', ['public', 'connected', 'private'])->default('connected')->after('profile_visibility');
            $table->enum('galleries_visibility', ['public', 'connected', 'private'])->default('connected')->after('stories_visibility');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['stories_visibility', 'galleries_visibility']);
        });
    }
};
