<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_group_polls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_group_id')->constrained('org_groups')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('question');
            $table->text('description')->nullable();
            $table->enum('poll_type', ['single', 'multiple'])->default('single');
            $table->boolean('is_anonymous')->default(false);
            $table->boolean('show_results_before_vote')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->unsignedBigInteger('closed_by')->nullable();
            $table->timestamps();

            $table->foreign('closed_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['org_group_id', 'is_active']);
        });

        Schema::create('org_group_poll_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_group_poll_id')->constrained('org_group_polls')->cascadeOnDelete();
            $table->string('label');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('org_group_poll_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_group_poll_id')->constrained('org_group_polls')->cascadeOnDelete();
            $table->foreignId('org_group_poll_option_id')->constrained('org_group_poll_options')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['org_group_poll_id', 'org_group_poll_option_id', 'user_id'], 'poll_vote_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_group_poll_votes');
        Schema::dropIfExists('org_group_poll_options');
        Schema::dropIfExists('org_group_polls');
    }
};
