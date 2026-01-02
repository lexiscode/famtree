<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Create admin entries for all existing tree creators
        DB::statement("
            INSERT INTO family_tree_admins (family_tree_id, user_id, role, granted_at, granted_by_user_id, created_at, updated_at)
            SELECT
                id as family_tree_id,
                created_by_user_id as user_id,
                'creator' as role,
                created_at as granted_at,
                NULL as granted_by_user_id,
                NOW() as created_at,
                NOW() as updated_at
            FROM family_trees
            WHERE deleted_at IS NULL
        ");

        // Step 2: Mark all existing trees as nuclear family trees
        DB::table('family_trees')
            ->whereNull('deleted_at')
            ->update(['is_nuclear_family' => true]);

        // Step 3: Update existing members to have proper permissions
        // The creator should have can_add_members = true
        DB::statement("
            UPDATE family_tree_members ftm
            INNER JOIN family_trees ft ON ftm.family_tree_id = ft.id
            SET ftm.can_add_members = true
            WHERE ftm.user_id = ft.created_by_user_id
            AND ft.deleted_at IS NULL
        ");

        // Step 4: Set nuclear_family_role for existing members based on their relationship
        // This is a placeholder - actual logic would need to check user_connections table
        // For now, we'll set it to 'extended' for all non-creator members
        DB::statement("
            UPDATE family_tree_members ftm
            INNER JOIN family_trees ft ON ftm.family_tree_id = ft.id
            SET ftm.nuclear_family_role = 'extended'
            WHERE ftm.user_id != ft.created_by_user_id
            AND ft.deleted_at IS NULL
            AND ftm.nuclear_family_role IS NULL
        ");

        // Set the creator's role to NULL (they may or may not be a nuclear family member)
        DB::statement("
            UPDATE family_tree_members ftm
            INNER JOIN family_trees ft ON ftm.family_tree_id = ft.id
            SET ftm.nuclear_family_role = NULL
            WHERE ftm.user_id = ft.created_by_user_id
            AND ft.deleted_at IS NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove all admin entries that were created for existing trees
        DB::statement("
            DELETE fta FROM family_tree_admins fta
            INNER JOIN family_trees ft ON fta.family_tree_id = ft.id
            WHERE fta.role = 'creator'
            AND fta.granted_by_user_id IS NULL
        ");

        // Reset is_nuclear_family to false
        DB::table('family_trees')
            ->update(['is_nuclear_family' => false]);

        // Reset member permissions
        DB::table('family_tree_members')
            ->update([
                'can_add_members' => false,
                'nuclear_family_role' => null,
            ]);
    }
};
