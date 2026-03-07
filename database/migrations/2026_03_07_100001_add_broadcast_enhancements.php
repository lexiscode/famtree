<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add category, priority, approval workflow, and moderation fields to org_broadcasts
        Schema::table('org_broadcasts', function (Blueprint $table) {
            $table->enum('category', [
                'announcement', 'event', 'urgent', 'reminder', 'academic', 'general',
            ])->default('general')->after('title');
            $table->enum('priority', ['normal', 'high', 'critical'])->default('normal')->after('category');

            // Approval workflow
            $table->boolean('requires_approval')->default(false)->after('status');
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->nullable()->after('requires_approval');
            $table->unsignedBigInteger('approved_by')->nullable()->after('approval_status');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('rejection_reason')->nullable()->after('approved_at');

            // Moderation
            $table->boolean('is_flagged')->default(false)->after('rejection_reason');
            $table->text('flag_reason')->nullable()->after('is_flagged');
            $table->unsignedBigInteger('flagged_by')->nullable()->after('flag_reason');
            $table->timestamp('flagged_at')->nullable()->after('flagged_by');

            // Delivery analytics
            $table->json('delivery_details')->nullable()->after('sent_to_count');

            $table->foreign('approved_by')->references('id')->on('org_accounts')->nullOnDelete();
            $table->foreign('flagged_by')->references('id')->on('org_accounts')->nullOnDelete();
            $table->index('category');
            $table->index('approval_status');
        });

        // Read receipts table
        Schema::create('org_broadcast_reads', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('org_broadcast_id');
            $table->unsignedBigInteger('class_set_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamp('read_at');

            $table->foreign('org_broadcast_id')->references('id')->on('org_broadcasts')->cascadeOnDelete();
            $table->foreign('class_set_id')->references('id')->on('class_sets')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            $table->unique(['org_broadcast_id', 'user_id'], 'broadcast_user_read_unique');
            $table->index(['org_broadcast_id', 'class_set_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_broadcast_reads');

        Schema::table('org_broadcasts', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['flagged_by']);
            $table->dropIndex(['category']);
            $table->dropIndex(['approval_status']);
            $table->dropColumn([
                'category', 'priority',
                'requires_approval', 'approval_status', 'approved_by', 'approved_at', 'rejection_reason',
                'is_flagged', 'flag_reason', 'flagged_by', 'flagged_at',
                'delivery_details',
            ]);
        });
    }
};
