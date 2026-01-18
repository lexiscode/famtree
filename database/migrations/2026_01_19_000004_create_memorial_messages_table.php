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
        Schema::create('memorial_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // The deceased user
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade'); // The family member writing
            $table->string('relationship_type'); // Author's relationship to deceased
            $table->text('message');
            $table->boolean('is_approved')->default(true); // For moderation if needed
            $table->timestamps();

            $table->index('user_id');
            $table->index('author_id');
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('memorial_messages');
    }
};
