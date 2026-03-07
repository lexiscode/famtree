<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_group_leadership_terms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_group_id')->constrained('org_groups')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', [
                'president',
                'vice_president',
                'secretary',
                'treasurer',
                'pro',
                'social_director',
            ]);
            $table->string('term_name')->nullable(); // e.g. "2025/2026"
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();
            $table->boolean('is_current')->default(true);
            $table->text('handover_notes')->nullable();
            $table->timestamps();

            $table->index(['org_group_id', 'is_current']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_group_leadership_terms');
    }
};
