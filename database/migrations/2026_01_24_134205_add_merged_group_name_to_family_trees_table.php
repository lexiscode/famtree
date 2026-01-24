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
        Schema::table('family_trees', function (Blueprint $table) {
            // Unified name for merged family groups
            // This is separate from tree_name so original family names are preserved
            $table->string('merged_group_name')->nullable()->after('tree_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('family_trees', function (Blueprint $table) {
            $table->dropColumn('merged_group_name');
        });
    }
};
