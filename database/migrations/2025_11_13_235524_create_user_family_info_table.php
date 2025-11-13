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
        Schema::create('user_family_info', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();

            // Family Status Information
            $table->enum('family_status', ['single', 'married', 'divorced', 'widowed', 'prefer_not_to_say'])->nullable();
            $table->integer('number_of_siblings')->nullable();
            $table->integer('number_of_children')->nullable();

            // Location Information
            $table->string('city')->nullable();
            $table->string('state_province')->nullable();
            $table->string('country')->nullable();

            // Education and Work
            $table->string('education_level')->nullable();
            $table->string('current_occupation')->nullable();

            // Onboarding Metadata
            $table->boolean('has_searched_siblings')->default(false);
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            // Foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_family_info');
    }
};
