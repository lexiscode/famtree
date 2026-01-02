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
        Schema::table('family_tree_members', function (Blueprint $table) {
            // Nuclear family role designation
            $table->enum('nuclear_family_role', ['spouse', 'child', 'extended', 'merged'])
                ->nullable()
                ->after('user_id');

            // Permission to add other members
            $table->boolean('can_add_members')->default(false)->after('nuclear_family_role');

            // Indexes for performance
            $table->index('nuclear_family_role');
            $table->index('can_add_members');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('family_tree_members', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['nuclear_family_role']);
            $table->dropIndex(['can_add_members']);

            // Drop columns
            $table->dropColumn([
                'nuclear_family_role',
                'can_add_members',
            ]);
        });
    }
};
