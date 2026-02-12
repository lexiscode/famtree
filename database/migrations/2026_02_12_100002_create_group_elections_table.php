<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_elections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_set_id')->constrained('class_sets')->cascadeOnDelete();
            $table->enum('type', ['initial', 'replacement', 'tiebreaker']);
            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active');
            $table->unsignedInteger('positions_to_fill')->default(3);
            $table->foreignId('parent_election_id')->nullable()->constrained('group_elections')->nullOnDelete();
            $table->timestamp('started_at');
            $table->timestamp('ends_at');
            $table->timestamps();

            $table->index(['class_set_id', 'status']);
            $table->index(['status', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_elections');
    }
};
