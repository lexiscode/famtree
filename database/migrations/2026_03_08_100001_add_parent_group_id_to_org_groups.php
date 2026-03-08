<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('org_groups', function (Blueprint $table) {
            $table->unsignedBigInteger('parent_group_id')->nullable()->after('organization_id');
            $table->foreign('parent_group_id')->references('id')->on('org_groups')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('org_groups', function (Blueprint $table) {
            $table->dropForeign(['parent_group_id']);
            $table->dropColumn('parent_group_id');
        });
    }
};
