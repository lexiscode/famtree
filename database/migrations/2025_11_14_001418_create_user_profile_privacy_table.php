<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_profile_privacy', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('field_name'); // full_name, phone, address, date_of_birth, bio, job_title, education, etc.
            $table->enum('visibility_level', ['public', 'connected_family', 'nuclear_family', 'only_me'])->default('public');
            $table->timestamps();

            // Index for quick lookups
            $table->index(['user_id', 'field_name']);
            $table->unique(['user_id', 'field_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profile_privacy');
    }
};
