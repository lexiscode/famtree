<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_posts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('org_account_id')->constrained('org_accounts')->cascadeOnDelete();
            $table->enum('type', ['text', 'voice'])->default('text');
            $table->longText('content')->nullable();
            $table->string('voice_url')->nullable();
            $table->unsignedInteger('voice_duration')->nullable();
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->unsignedInteger('reactions_count')->default(0);
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index('organization_id');
            $table->index('is_pinned');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_posts');
    }
};
