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
        Schema::create('families', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('state');
            $table->string('lga')->nullable();
            $table->string('village')->nullable();
            $table->string('founder');
            $table->integer('member_count')->default(0);
            $table->text('story')->nullable();
            $table->string('cover_image')->nullable();
            $table->integer('founded_year')->nullable();
            $table->integer('new_members_this_year')->default(0);
            $table->boolean('is_public')->default(true);
            $table->timestamps();
            $table->index('state');
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('families');
    }
};
