<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_removal_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('removal_id')->constrained('group_member_removals')->cascadeOnDelete();
            $table->foreignId('admin_user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('vote', ['confirm', 'reject']);
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['removal_id', 'admin_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_removal_votes');
    }
};
