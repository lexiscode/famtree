<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('glam_squads', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->enum('gender_track', ['female', 'male', 'mixed']);
            $table->unsignedInteger('squad_number')->default(1);
            $table->unsignedInteger('member_cap')->default(250);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['gender_track', 'squad_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('glam_squads');
    }
};
