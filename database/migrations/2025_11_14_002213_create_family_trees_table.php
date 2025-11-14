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
        Schema::create('family_trees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('root_user_id')->constrained('users')->onDelete('cascade');
            $table->string('tree_name');
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false);
            $table->foreignId('created_by_user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // Indexes for quick lookups
            $table->index('root_user_id');
            $table->index('created_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_trees');
    }
};
