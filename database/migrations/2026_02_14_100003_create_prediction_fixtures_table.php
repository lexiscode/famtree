<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prediction_fixtures', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('season_id')->constrained('prediction_seasons')->cascadeOnDelete();
            $table->foreignId('gameweek_id')->nullable()->constrained('prediction_gameweeks')->nullOnDelete();
            $table->string('opponent_name');
            $table->string('opponent_logo')->nullable();
            $table->enum('venue', ['home', 'away']);
            $table->string('competition')->nullable();
            $table->dateTime('match_date');
            $table->enum('status', ['upcoming', 'live', 'completed', 'cancelled'])->default('upcoming');
            $table->unsignedTinyInteger('home_score')->nullable();
            $table->unsignedTinyInteger('away_score')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prediction_fixtures');
    }
};
