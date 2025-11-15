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
        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('file_path'); // Path to the uploaded file (image or video)
            $table->string('file_type'); // 'image' or 'video'
            $table->string('mime_type'); // e.g., 'image/jpeg', 'video/mp4'
            $table->bigInteger('file_size')->nullable(); // File size in bytes
            $table->string('thumbnail_path')->nullable(); // Thumbnail for videos
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamps();

            // Foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('galleries');
    }
};
