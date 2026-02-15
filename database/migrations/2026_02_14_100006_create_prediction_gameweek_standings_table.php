<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prediction_gameweek_standings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gameweek_id')->constrained('prediction_gameweeks')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('points')->default(0);
            $table->unsignedInteger('predictions_made')->default(0);
            $table->unsignedInteger('correct_predictions')->default(0);
            $table->timestamps();

            $table->unique(['gameweek_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prediction_gameweek_standings');
    }
};
