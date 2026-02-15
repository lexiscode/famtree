<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_election_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained('group_elections')->cascadeOnDelete();
            $table->foreignId('voter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['election_id', 'voter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_election_votes');
    }
};
