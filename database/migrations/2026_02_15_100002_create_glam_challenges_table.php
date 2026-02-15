<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('glam_challenges', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('season_id')->constrained('glam_seasons')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('theme')->nullable();
            $table->string('banner_image')->nullable();
            $table->enum('status', ['upcoming', 'submissions_open', 'voting_open', 'completed'])->default('upcoming');
            $table->timestamp('submissions_open_at')->nullable();
            $table->timestamp('submissions_close_at')->nullable();
            $table->timestamp('voting_open_at')->nullable();
            $table->timestamp('voting_close_at')->nullable();
            $table->timestamp('results_at')->nullable();
            $table->unsignedInteger('challenge_number')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('glam_challenges');
    }
};
