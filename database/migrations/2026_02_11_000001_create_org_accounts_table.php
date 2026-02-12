<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_accounts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('username')->unique();
            $table->string('email')->unique()->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->enum('role', ['owner', 'admin', 'editor', 'moderator'])->default('moderator');
            $table->json('permissions')->nullable();
            $table->string('display_name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();

            $table->index('organization_id');
            $table->index('is_active');
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_accounts');
    }
};
