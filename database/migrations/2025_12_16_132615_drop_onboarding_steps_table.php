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
        Schema::dropIfExists('onboarding_steps');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('onboarding_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('step_name');
            $table->boolean('is_completed')->default(false);
            $table->json('step_data')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'step_name']);
        });
    }
};
