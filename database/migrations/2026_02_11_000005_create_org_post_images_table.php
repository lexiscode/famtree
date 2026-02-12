<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_post_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_post_id')->constrained('org_posts')->cascadeOnDelete();
            $table->string('image_url');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index('org_post_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_post_images');
    }
};
