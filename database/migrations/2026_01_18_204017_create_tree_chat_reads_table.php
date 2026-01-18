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
        Schema::create('tree_chat_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_tree_id')->constrained('family_trees')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('last_read_at')->useCurrent();
            $table->timestamps();

            // Unique constraint - one record per user per tree
            $table->unique(['family_tree_id', 'user_id']);

            // Index for quick lookups
            $table->index(['user_id', 'family_tree_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tree_chat_reads');
    }
};
