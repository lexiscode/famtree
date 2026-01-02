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
        Schema::create('family_tree_admins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_tree_id')->constrained('family_trees')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('role', ['creator', 'co_admin'])->default('co_admin');
            $table->timestamp('granted_at')->useCurrent();
            $table->foreignId('granted_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Ensure a user can only be admin once per tree
            $table->unique(['family_tree_id', 'user_id']);

            // Indexes for performance
            $table->index('family_tree_id');
            $table->index('user_id');
            $table->index('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_tree_admins');
    }
};
