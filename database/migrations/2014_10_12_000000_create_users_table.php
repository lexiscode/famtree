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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('profile_image')->nullable();

            // Profile information fields
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->text('bio')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female']);
            $table->string('profile_image_url')->nullable();

            // Family and account type fields
            $table->enum('status', ['alive', 'deceased'])->default('alive');
            $table->unsignedBigInteger('parent_user_id')->nullable();
            $table->boolean('is_child_account')->default(false);
            $table->unsignedBigInteger('created_by_user_id')->nullable();
            $table->boolean('onboarding_completed')->default(false);

            $table->softDeletes();
            $table->timestamp('scheduled_deletion_at')->nullable()->comment('Timestamp when account will be permanently deleted');
            $table->rememberToken();
            $table->timestamps();

            // Add indexes
            $table->index('parent_user_id');
            $table->index('created_by_user_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
