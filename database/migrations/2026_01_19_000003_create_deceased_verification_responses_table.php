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
        Schema::create('deceased_verification_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('verification_id')->constrained('deceased_verifications')->onDelete('cascade');
            $table->foreignId('responder_id')->constrained('users')->onDelete('cascade');
            $table->string('relationship_type'); // wife, husband, father, mother, son, daughter, brother, sister
            $table->enum('response', ['alive', 'deceased', 'unknown']);
            $table->timestamp('responded_at');
            $table->timestamps();

            $table->index('verification_id', 'dvr_verification_id_idx');
            $table->index('responder_id', 'dvr_responder_id_idx');
            $table->unique(['verification_id', 'responder_id'], 'dvr_verification_responder_unique'); // One response per family member per verification
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deceased_verification_responses');
    }
};
