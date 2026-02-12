<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_account_id')->nullable()->constrained('org_accounts')->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->cascadeOnDelete();
            $table->string('action_type');
            $table->string('resource_type')->nullable();
            $table->text('description')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index('organization_id');
            $table->index('action_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_activity_logs');
    }
};
