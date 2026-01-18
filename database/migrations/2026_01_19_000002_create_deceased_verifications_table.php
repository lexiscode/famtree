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
        Schema::create('deceased_verifications', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('stage', ['reengagement', 'family_check', 'pending_change', 'completed', 'cancelled'])->default('reengagement');
            $table->timestamp('reengagement_sent_at')->nullable();
            $table->timestamp('family_check_sent_at')->nullable();
            $table->timestamp('status_change_scheduled_at')->nullable();
            $table->enum('final_status', ['alive', 'deceased'])->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancelled_reason')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('stage');
            $table->index(['stage', 'status_change_scheduled_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deceased_verifications');
    }
};
