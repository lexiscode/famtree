<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('glam_standings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('season_id')->constrained('glam_seasons')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('gender_track', ['female', 'male']);
            $table->unsignedInteger('total_points')->default(0);
            $table->unsignedInteger('challenges_entered')->default(0);
            $table->unsignedInteger('votes_cast')->default(0);
            $table->unsignedInteger('top_1_count')->default(0);
            $table->unsignedInteger('top_3_count')->default(0);
            $table->unsignedInteger('current_entry_streak')->default(0);
            $table->unsignedInteger('best_entry_streak')->default(0);
            $table->unsignedInteger('streak_bonus_points')->default(0);
            $table->timestamps();

            $table->unique(['season_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('glam_standings');
    }
};
