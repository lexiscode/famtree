<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_group_id')->constrained('org_groups')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', [
                'president',
                'vice_president',
                'secretary',
                'treasurer',
                'pro',
                'social_director',
                'member',
            ])->default('member');
            $table->enum('added_by_type', ['org_staff', 'leader'])->default('org_staff');
            $table->unsignedBigInteger('added_by_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();

            $table->unique(['org_group_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_group_members');
    }
};
