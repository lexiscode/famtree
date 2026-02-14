<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prediction_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fixture_id')->constrained('prediction_fixtures')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('prediction_type', ['match_result', 'double_chance', 'correct_score']);
            $table->string('prediction_value')->nullable();
            $table->unsignedTinyInteger('predicted_home_score')->nullable();
            $table->unsignedTinyInteger('predicted_away_score')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->unsignedInteger('points_earned')->default(0);
            $table->boolean('is_locked')->default(false);
            $table->timestamps();

            $table->unique(['fixture_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prediction_entries');
    }
};
