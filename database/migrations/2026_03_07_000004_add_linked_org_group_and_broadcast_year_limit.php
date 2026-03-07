<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('org_accounts', function (Blueprint $table) {
            $table->foreignId('linked_org_group_id')
                ->nullable()
                ->after('org_role_id')
                ->constrained('org_groups')
                ->onDelete('set null');
        });

        Schema::table('org_roles', function (Blueprint $table) {
            $table->unsignedSmallInteger('broadcast_year_limit')
                ->nullable()
                ->after('permissions')
                ->comment('Max years back for broadcast targeting. NULL = unlimited.');
        });
    }

    public function down(): void
    {
        Schema::table('org_accounts', function (Blueprint $table) {
            $table->dropForeign(['linked_org_group_id']);
            $table->dropColumn('linked_org_group_id');
        });

        Schema::table('org_roles', function (Blueprint $table) {
            $table->dropColumn('broadcast_year_limit');
        });
    }
};
