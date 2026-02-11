<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_post_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_post_id')->constrained('org_posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('reaction_type', ['like', 'love', 'haha', 'wow', 'sad', 'angry'])->default('like');
            $table->timestamps();

            $table->unique(['org_post_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_post_reactions');
    }
};
