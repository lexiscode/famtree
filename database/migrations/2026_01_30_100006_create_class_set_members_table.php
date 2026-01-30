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
        Schema::create('class_set_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_set_id')->constrained('class_sets')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('joined_at')->useCurrent();
            $table->boolean('is_admin')->default(false);
            $table->timestamps();

            $table->unique(['class_set_id', 'user_id']);
            $table->index('class_set_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_set_members');
    }
};
