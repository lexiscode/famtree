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
            $table->string('google_id')->nullable()->unique()->after('email');
            $table->string('oauth_provider')->nullable()->after('google_id'); // 'google', future: 'facebook', etc.
            $table->timestamp('oauth_linked_at')->nullable()->after('oauth_provider');

            // Indexes for faster OAuth lookups
            $table->index('google_id');
            $table->index('oauth_provider');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['google_id']);
            $table->dropIndex(['oauth_provider']);
            $table->dropColumn(['google_id', 'oauth_provider', 'oauth_linked_at']);
        });
    }
};
