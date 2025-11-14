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
        Schema::create('user_connections', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('requester_user_id');
            $table->unsignedBigInteger('recipient_user_id');
            $table->string('relationship_type'); // wife, husband, sibling, mother, father, etc.
            $table->enum('status', ['pending', 'accepted', 'declined', 'undone'])->default('pending');
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // 24h undo window expiration

            $table->timestamps();

            // Foreign keys
            $table->foreign('requester_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('recipient_user_id')->references('id')->on('users')->onDelete('cascade');

            // Indexes
            $table->index('requester_user_id');
            $table->index('recipient_user_id');
            $table->index(['requester_user_id', 'status']);
            $table->index(['recipient_user_id', 'status']);

            // Unique constraint: only one pending/accepted connection per pair per relationship type
            $table->unique(['requester_user_id', 'recipient_user_id', 'relationship_type'], 'unique_connection_pair');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_connections');
    }
};
