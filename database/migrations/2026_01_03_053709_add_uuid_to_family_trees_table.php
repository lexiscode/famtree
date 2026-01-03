<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('family_trees', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });

        // Populate UUIDs for existing records
        DB::table('family_trees')->whereNull('uuid')->cursor()->each(function ($tree) {
            DB::table('family_trees')
                ->where('id', $tree->id)
                ->update(['uuid' => Str::uuid()->toString()]);
        });

        // Make uuid column non-nullable and unique
        Schema::table('family_trees', function (Blueprint $table) {
            $table->uuid('uuid')->unique()->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('family_trees', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
