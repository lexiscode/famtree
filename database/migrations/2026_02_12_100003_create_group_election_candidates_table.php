<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_election_candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained('group_elections')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('votes_count')->default(0);
            $table->timestamps();

            $table->unique(['election_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_election_candidates');
    }
};
