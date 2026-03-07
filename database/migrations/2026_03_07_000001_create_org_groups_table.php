<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_groups', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->enum('type', ['sug', 'faculty_union', 'hall_committee', 'departmental_rep', 'custom'])->default('custom');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('max_members')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('org_accounts')->onDelete('set null');
            $table->timestamps();

            $table->unique(['organization_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_groups');
    }
};
