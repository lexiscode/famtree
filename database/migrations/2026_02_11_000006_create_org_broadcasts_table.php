<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_broadcasts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('org_account_id')->constrained('org_accounts')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->text('message');
            $table->enum('target_type', ['all_groups', 'selected_groups'])->default('all_groups');
            $table->json('target_class_set_ids')->nullable();
            $table->enum('schedule_type', ['immediate', 'scheduled', 'recurring'])->default('immediate');
            $table->timestamp('scheduled_at')->nullable();
            $table->enum('recurrence_type', ['daily', 'weekly'])->nullable();
            $table->unsignedInteger('recurrence_count')->nullable();
            $table->unsignedInteger('recurrences_sent')->default(0);
            $table->timestamp('next_send_at')->nullable();
            $table->enum('status', ['draft', 'pending', 'sent', 'partially_sent', 'cancelled'])->default('draft');
            $table->timestamp('sent_at')->nullable();
            $table->unsignedInteger('sent_to_count')->default(0);
            $table->timestamps();

            $table->index('organization_id');
            $table->index('status');
            $table->index('next_send_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_broadcasts');
    }
};
