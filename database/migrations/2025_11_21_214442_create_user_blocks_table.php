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
        Schema::create('user_blocks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('blocker_user_id'); // User who is doing the blocking
            $table->unsignedBigInteger('blocked_user_id'); // User being blocked
            $table->timestamps();

            // Foreign keys
            $table->foreign('blocker_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('blocked_user_id')->references('id')->on('users')->onDelete('cascade');

            // Indexes
            $table->index('blocker_user_id');
            $table->index('blocked_user_id');
            $table->unique(['blocker_user_id', 'blocked_user_id'], 'unique_user_block'); // Prevent duplicate blocks
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_blocks');
    }
};
