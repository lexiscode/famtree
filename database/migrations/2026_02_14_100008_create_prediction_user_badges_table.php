<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prediction_user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('badge_id')->constrained('prediction_badges')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('season_id')->constrained('prediction_seasons')->cascadeOnDelete();
            $table->unsignedInteger('times_earned')->default(1);
            $table->timestamp('earned_at')->useCurrent();
            $table->timestamps();

            $table->unique(['badge_id', 'user_id', 'season_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prediction_user_badges');
    }
};
