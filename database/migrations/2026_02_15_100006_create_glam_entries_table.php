<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('glam_entries', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('challenge_id')->constrained('glam_challenges')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('squad_id')->constrained('glam_squads')->cascadeOnDelete();
            $table->enum('gender_track', ['female', 'male']);
            $table->string('photo_1');
            $table->string('photo_2')->nullable();
            $table->string('caption', 200)->nullable();
            $table->decimal('avg_rating', 3, 2)->default(0);
            $table->unsignedInteger('vote_count')->default(0);
            $table->decimal('weighted_score', 5, 2)->default(0);
            $table->unsignedInteger('rank')->nullable();
            $table->boolean('is_qualified')->default(false);
            $table->timestamps();

            $table->unique(['challenge_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('glam_entries');
    }
};
