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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->enum('type', [
                'connection_request',
                'connection_accepted',
                'connection_declined',
                'connection_undone',
                'family_tree_invite',
                'family_tree_member_added',
                'status_changed',
                'child_account_created',
                'profile_updated',
                'message',
            ])->default('message');

            // Related data
            $table->unsignedBigInteger('related_user_id')->nullable()->index();
            $table->unsignedBigInteger('related_object_id')->nullable()->index();
            $table->string('related_object_type')->nullable();

            // Notification content
            $table->string('title');
            $table->text('message');
            $table->string('action_url')->nullable();

            // Status
            $table->boolean('is_read')->default(false)->index();
            $table->timestamp('read_at')->nullable();

            // Timestamps
            $table->timestamps();

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('related_user_id')->references('id')->on('users')->onDelete('cascade');

            // Composite index for efficiency
            $table->index(['user_id', 'is_read', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
