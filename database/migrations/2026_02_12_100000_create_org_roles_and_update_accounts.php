<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create org_roles table
        Schema::create('org_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('slug', 100);
            $table->boolean('is_system')->default(false);
            $table->json('permissions')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'slug']);
        });

        // 2. Add org_role_id to org_accounts
        Schema::table('org_accounts', function (Blueprint $table) {
            $table->foreignId('org_role_id')->nullable()->after('password')
                ->constrained('org_roles')->nullOnDelete();
        });

        // 3. Data migration: create roles from existing data
        $orgIds = DB::table('org_accounts')->distinct()->pluck('organization_id');

        foreach ($orgIds as $orgId) {
            // Create system Owner role
            $ownerRoleId = DB::table('org_roles')->insertGetId([
                'organization_id' => $orgId,
                'name' => 'Owner',
                'slug' => 'owner',
                'is_system' => true,
                'permissions' => json_encode([]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Assign owner accounts to the owner role
            DB::table('org_accounts')
                ->where('organization_id', $orgId)
                ->where('role', 'owner')
                ->update(['org_role_id' => $ownerRoleId]);

            // For each non-owner role used in this org, create a default role
            $usedRoles = DB::table('org_accounts')
                ->where('organization_id', $orgId)
                ->whereIn('role', ['admin', 'editor', 'moderator'])
                ->distinct()
                ->pluck('role');

            foreach ($usedRoles as $roleName) {
                // Union all permissions from accounts with this role
                $accounts = DB::table('org_accounts')
                    ->where('organization_id', $orgId)
                    ->where('role', $roleName)
                    ->get(['id', 'permissions']);

                $mergedPerms = [];
                foreach ($accounts as $acct) {
                    $perms = json_decode($acct->permissions, true);
                    if (is_array($perms)) {
                        foreach ($perms as $key => $val) {
                            if ($val) {
                                $mergedPerms[$key] = true;
                            }
                        }
                    }
                }

                $roleId = DB::table('org_roles')->insertGetId([
                    'organization_id' => $orgId,
                    'name' => ucfirst($roleName),
                    'slug' => Str::slug($roleName),
                    'is_system' => false,
                    'permissions' => json_encode($mergedPerms),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Assign accounts to this role
                DB::table('org_accounts')
                    ->where('organization_id', $orgId)
                    ->where('role', $roleName)
                    ->update(['org_role_id' => $roleId]);
            }
        }

        // 4. Drop old columns
        Schema::table('org_accounts', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropColumn(['role', 'permissions']);
        });
    }

    public function down(): void
    {
        // Re-add old columns
        Schema::table('org_accounts', function (Blueprint $table) {
            $table->enum('role', ['owner', 'admin', 'editor', 'moderator'])->default('moderator')->after('password');
            $table->json('permissions')->nullable()->after('role');
            $table->index('role');
        });

        // Migrate data back
        $roles = DB::table('org_roles')->get();
        foreach ($roles as $role) {
            $roleName = $role->is_system ? 'owner' : strtolower($role->name);
            // Ensure the role name is valid for the enum
            if (!in_array($roleName, ['owner', 'admin', 'editor', 'moderator'])) {
                $roleName = 'moderator';
            }

            DB::table('org_accounts')
                ->where('org_role_id', $role->id)
                ->update([
                    'role' => $roleName,
                    'permissions' => $role->permissions,
                ]);
        }

        // Drop foreign key and column
        Schema::table('org_accounts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('org_role_id');
        });

        Schema::dropIfExists('org_roles');
    }
};
