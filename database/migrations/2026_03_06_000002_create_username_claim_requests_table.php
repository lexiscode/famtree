<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('username_claim_requests', function (Blueprint $table) {
            $table->id();
            $table->string('username');
            $table->string('full_name');
            $table->string('email');
            $table->string('social_media_url');
            $table->text('message')->nullable();
            $table->string('verification_code')->nullable();
            $table->enum('status', ['pending', 'code_sent', 'verified', 'rejected'])->default('pending');
            $table->string('temp_username')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->index('username');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('username_claim_requests');
    }
};
