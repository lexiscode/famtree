<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Join requests
        Schema::create('org_group_join_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('org_group_id');
            $table->unsignedBigInteger('user_id');
            $table->text('message')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_note')->nullable();
            $table->timestamps();

            $table->foreign('org_group_id')->references('id')->on('org_groups')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('org_accounts')->nullOnDelete();

            $table->unique(['org_group_id', 'user_id', 'status'], 'group_user_pending_unique');
            $table->index(['org_group_id', 'status']);
        });

        // Banned members
        Schema::create('org_group_bans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('org_group_id');
            $table->unsignedBigInteger('user_id');
            $table->text('reason')->nullable();
            $table->unsignedBigInteger('banned_by');
            $table->timestamp('banned_at');
            $table->timestamp('expires_at')->nullable();

            $table->foreign('org_group_id')->references('id')->on('org_groups')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('banned_by')->references('id')->on('org_accounts')->cascadeOnDelete();

            $table->unique(['org_group_id', 'user_id']);
        });

        // Auto-membership rules
        Schema::create('org_group_auto_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('org_group_id');
            $table->enum('rule_type', ['class_set', 'faculty', 'all_followers']);
            $table->unsignedBigInteger('target_id')->nullable(); // class_set_id or faculty_id
            $table->string('target_name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by');
            $table->integer('last_run_count')->default(0);
            $table->timestamp('last_run_at')->nullable();
            $table->timestamps();

            $table->foreign('org_group_id')->references('id')->on('org_groups')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('org_accounts')->cascadeOnDelete();

            $table->index(['org_group_id', 'is_active']);
        });

        // Add allow_join_requests to org_groups
        Schema::table('org_groups', function (Blueprint $table) {
            $table->boolean('allow_join_requests')->default(false)->after('max_members');
        });
    }

    public function down(): void
    {
        Schema::table('org_groups', function (Blueprint $table) {
            $table->dropColumn('allow_join_requests');
        });
        Schema::dropIfExists('org_group_auto_rules');
        Schema::dropIfExists('org_group_bans');
        Schema::dropIfExists('org_group_join_requests');
    }
};
