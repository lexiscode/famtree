<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->enum('type', ['text', 'voice'])->default('text');
            $table->string('title')->nullable();
            $table->longText('content')->nullable();
            $table->string('voice_url')->nullable();
            $table->integer('voice_duration')->nullable(); // in seconds
            $table->integer('views_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->integer('reactions_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
