<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

return new class extends Migration
{
    public function up(): void
    {
        $now = Carbon::now();

        // STEP 1 — Create admin entries for all existing tree creators
        $trees = DB::table('family_trees')
            ->whereNull('deleted_at')
            ->get(['id', 'created_by_user_id', 'created_at']);

        foreach ($trees as $tree) {
            DB::table('family_tree_admins')->insert([
                'family_tree_id'     => $tree->id,
                'user_id'            => $tree->created_by_user_id,
                'role'               => 'creator',
                'granted_at'         => $tree->created_at ?? $now,
                'granted_by_user_id' => null,
                'created_at'         => $now,
                'updated_at'         => $now,
            ]);
        }

        // STEP 2 — Mark trees as nuclear family
        DB::table('family_trees')
            ->whereNull('deleted_at')
            ->update(['is_nuclear_family' => true]);

        // STEP 3 — Creator gets can_add_members = true
        $creatorMembers = DB::table('family_tree_members')
            ->join('family_trees', 'family_tree_members.family_tree_id', '=', 'family_trees.id')
            ->whereColumn('family_tree_members.user_id', 'family_trees.created_by_user_id')
            ->whereNull('family_trees.deleted_at')
            ->select('family_tree_members.id')
            ->get();

        foreach ($creatorMembers as $row) {
            DB::table('family_tree_members')
                ->where('id', $row->id)
                ->update(['can_add_members' => true]);
        }

        // STEP 4 — Non-creator members => nuclear_family_role = 'extended'
        $nonCreators = DB::table('family_tree_members')
            ->join('family_trees', 'family_tree_members.family_tree_id', '=', 'family_trees.id')
            ->whereColumn('family_tree_members.user_id', '!=', 'family_trees.created_by_user_id')
            ->whereNull('family_trees.deleted_at')
            ->whereNull('family_tree_members.nuclear_family_role')
            ->select('family_tree_members.id')
            ->get();

        foreach ($nonCreators as $row) {
            DB::table('family_tree_members')
                ->where('id', $row->id)
                ->update(['nuclear_family_role' => 'extended']);
        }

        // STEP 5 — Creator role becomes NULL
        $creatorRoleReset = DB::table('family_tree_members')
            ->join('family_trees', 'family_tree_members.family_tree_id', '=', 'family_trees.id')
            ->whereColumn('family_tree_members.user_id', 'family_trees.created_by_user_id')
            ->whereNull('family_trees.deleted_at')
            ->select('family_tree_members.id')
            ->get();

        foreach ($creatorRoleReset as $row) {
            DB::table('family_tree_members')
                ->where('id', $row->id)
                ->update(['nuclear_family_role' => null]);
        }
    }

    public function down(): void
    {
        // Remove creator admin entries created by this migration
        $creatorAdmins = DB::table('family_tree_admins')
            ->where('role', 'creator')
            ->whereNull('granted_by_user_id')
            ->pluck('id');

        DB::table('family_tree_admins')
            ->whereIn('id', $creatorAdmins)
            ->delete();

        // Reset nuclear flags
        DB::table('family_trees')->update([
            'is_nuclear_family' => false,
        ]);

        DB::table('family_tree_members')->update([
            'can_add_members'      => false,
            'nuclear_family_role'  => null,
        ]);
    }
};
