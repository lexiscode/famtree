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
        Schema::create('onboarding_steps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('step_name'); // basic_info, family_status, location_info, education_work, siblings_search, complete
            $table->boolean('is_completed')->default(false);
            $table->json('step_data')->nullable(); // Store step-specific responses
            $table->timestamps();

            // Foreign key and indexes
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('user_id');
            $table->index('step_name');
            $table->unique(['user_id', 'step_name']); // One entry per user per step
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('onboarding_steps');
    }
};
