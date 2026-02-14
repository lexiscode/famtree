<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prediction_group_standings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('season_id')->constrained('prediction_seasons')->cascadeOnDelete();
            $table->foreignId('class_set_id')->constrained('class_sets')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('total_points')->default(0);
            $table->unsignedInteger('predictions_made')->default(0);
            $table->unsignedInteger('correct_predictions')->default(0);
            $table->timestamps();

            $table->unique(['season_id', 'class_set_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prediction_group_standings');
    }
};
