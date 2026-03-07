<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_group_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_group_id')->constrained('org_groups')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('message')->nullable();
            $table->enum('message_type', ['text', 'image', 'file'])->default('text');
            $table->string('attachment_url')->nullable();
            $table->string('attachment_name')->nullable();
            $table->foreignId('reply_to_id')->nullable()->constrained('org_group_messages')->nullOnDelete();
            $table->boolean('is_pinned')->default(false);
            $table->unsignedBigInteger('pinned_by')->nullable();
            $table->timestamp('pinned_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('pinned_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['org_group_id', 'created_at']);
            $table->index(['org_group_id', 'is_pinned']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_group_messages');
    }
};
