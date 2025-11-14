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
            // Add child account fields
            $table->unsignedBigInteger('parent_user_id')->nullable()->after('id');
            $table->boolean('is_child_account')->default(false)->after('parent_user_id');
            $table->unsignedBigInteger('created_by_user_id')->nullable()->after('is_child_account');

            // Make email and password nullable for child accounts
            $table->string('email')->nullable()->change();
            $table->string('password')->nullable()->change();

            // Add foreign key constraints
            $table->foreign('parent_user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('created_by_user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            // Add indexes
            $table->index('parent_user_id');
            $table->index('created_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop foreign keys
            $table->dropForeign(['parent_user_id']);
            $table->dropForeign(['created_by_user_id']);

            // Drop indexes
            $table->dropIndex(['parent_user_id']);
            $table->dropIndex(['created_by_user_id']);

            // Drop columns
            $table->dropColumn(['parent_user_id', 'is_child_account', 'created_by_user_id']);

            // Revert email and password to not nullable
            $table->string('email')->nullable(false)->change();
            $table->string('password')->nullable(false)->change();
        });
    }
};
