<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('glam_squad_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('squad_id')->constrained('glam_squads')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_admin')->default(false);
            $table->boolean('is_muted')->default(false);
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamp('last_read_at')->nullable();
            $table->timestamps();

            $table->unique(['squad_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('glam_squad_members');
    }
};
