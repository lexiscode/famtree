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
            // Nuclear family designation
            $table->boolean('is_nuclear_family')->default(true)->after('is_public');

            // Tree merging tracking
            $table->json('merged_tree_ids')->nullable()->after('is_nuclear_family');
            $table->foreignId('merged_into_tree_id')->nullable()->constrained('family_trees')->onDelete('set null')->after('merged_tree_ids');
            $table->timestamp('merged_at')->nullable()->after('merged_into_tree_id');

            // Soft deletes for merged trees
            $table->softDeletes()->after('updated_at');

            // Indexes for performance
            $table->index('is_nuclear_family');
            $table->index('merged_into_tree_id');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('family_trees', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['is_nuclear_family']);
            $table->dropIndex(['merged_into_tree_id']);
            $table->dropIndex(['deleted_at']);

            // Drop foreign key
            $table->dropForeign(['merged_into_tree_id']);

            // Drop columns
            $table->dropColumn([
                'is_nuclear_family',
                'merged_tree_ids',
                'merged_into_tree_id',
                'merged_at',
                'deleted_at',
            ]);
        });
    }
};
