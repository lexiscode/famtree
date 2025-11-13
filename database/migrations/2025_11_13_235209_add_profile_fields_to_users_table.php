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
        Schema::table('users', function (Blueprint $table) {
            // Profile information fields
            $table->string('phone')->nullable()->after('email');
            $table->text('address')->nullable()->after('phone');
            $table->text('bio')->nullable()->after('address');
            $table->date('date_of_birth')->nullable()->after('bio');
            $table->string('profile_image_url')->nullable()->after('date_of_birth');

            // Family and account type fields
            $table->enum('status', ['alive', 'deceased'])->default('alive')->after('profile_image_url');
            $table->unsignedBigInteger('parent_user_id')->nullable()->after('status');
            $table->boolean('is_child_account')->default(false)->after('parent_user_id');
            $table->unsignedBigInteger('created_by_user_id')->nullable()->after('is_child_account');
            $table->boolean('onboarding_completed')->default(false)->after('created_by_user_id');

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
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['parent_user_id']);
            $table->dropIndex(['created_by_user_id']);
            $table->dropIndex(['status']);

            $table->dropColumn([
                'phone',
                'address',
                'bio',
                'date_of_birth',
                'profile_image_url',
                'status',
                'parent_user_id',
                'is_child_account',
                'created_by_user_id',
                'onboarding_completed',
            ]);
        });
    }
};
