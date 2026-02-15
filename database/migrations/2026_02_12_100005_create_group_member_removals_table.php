<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_member_removals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_set_id')->constrained('class_sets')->cascadeOnDelete();
            $table->foreignId('target_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('initiated_by')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'expired'])->default('pending');
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['class_set_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_member_removals');
    }
};
