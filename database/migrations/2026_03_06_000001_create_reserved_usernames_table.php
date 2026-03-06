<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reserved_usernames', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('celebrity_name');
            $table->text('notes')->nullable();
            $table->enum('status', ['reserved', 'claimed'])->default('reserved');
            $table->foreignId('claimed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('claimed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reserved_usernames');
    }
};
