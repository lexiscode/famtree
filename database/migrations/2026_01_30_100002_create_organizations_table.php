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
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('category_id')->constrained('organization_categories')->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('short_name')->nullable(); // Acronym like UNILAG
            $table->text('description')->nullable();
            $table->text('vision')->nullable();
            $table->text('mission')->nullable();
            $table->string('logo')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->default('Nigeria');
            $table->string('website')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->integer('founded_year')->nullable();
            $table->string('leader_name')->nullable();
            $table->string('leader_title')->nullable();
            $table->text('leader_qualifications')->nullable();
            $table->string('leader_image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('slug');
            $table->index('category_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
