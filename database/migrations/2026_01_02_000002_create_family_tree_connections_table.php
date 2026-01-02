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
        Schema::create('family_tree_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_tree_id')->constrained('family_trees')->onDelete('cascade');
            $table->foreignId('recipient_tree_id')->constrained('family_trees')->onDelete('cascade');
            $table->enum('status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('accepted_at')->nullable();
            $table->foreignId('requested_by_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('accepted_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('message')->nullable();
            $table->timestamps();

            // Prevent duplicate connection requests between same trees
            $table->unique(['requester_tree_id', 'recipient_tree_id'], 'ftc_unique_tree_connection');

            // Indexes for performance
            $table->index('requester_tree_id');
            $table->index('recipient_tree_id');
            $table->index('status');
            $table->index('requested_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_tree_connections');
    }
};
