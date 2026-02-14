<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prediction_gameweeks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('season_id')->constrained('prediction_seasons')->cascadeOnDelete();
            $table->unsignedInteger('number');
            $table->string('label')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();

            $table->unique(['season_id', 'number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prediction_gameweeks');
    }
};
