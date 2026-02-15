<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('glam_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('entry_id')->constrained('glam_entries')->cascadeOnDelete();
            $table->foreignId('voter_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('stars');
            $table->timestamps();

            $table->unique(['entry_id', 'voter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('glam_votes');
    }
};
