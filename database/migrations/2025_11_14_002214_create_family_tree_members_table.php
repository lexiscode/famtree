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
        Schema::create('family_tree_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_tree_id')->constrained('family_trees')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('added_by_user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('added_at')->useCurrent();
            $table->timestamps();

            // Ensure a user can only be added once to a tree
            $table->unique(['family_tree_id', 'user_id']);

            // Indexes for quick lookups
            $table->index('family_tree_id');
            $table->index('user_id');
            $table->index('added_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_tree_members');
    }
};
