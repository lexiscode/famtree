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
        // Drop the existing unique constraint that prevents re-creating connections
        Schema::table('user_connections', function (Blueprint $table) {
            $table->dropUnique('unique_connection_pair');
        });

        // Create a new unique constraint that only applies to pending/accepted statuses
        // This is done using a generated column approach with a partial unique index
        // We'll add a generated column that is NULL for 'undone' and 'declined' statuses
        Schema::table('user_connections', function (Blueprint $table) {
            // Add a generated column for the unique constraint
            // When status is 'undone' or 'declined', this will be NULL, allowing duplicates
            $table->string('active_status')->storedAs("IF(status IN ('pending', 'accepted'), status, NULL)")->nullable();
        });

        // Add a unique index that includes the generated column
        DB::statement('
            ALTER TABLE user_connections
            ADD UNIQUE KEY unique_active_connection (requester_user_id, recipient_user_id, relationship_type, active_status)
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_connections', function (Blueprint $table) {
            $table->dropIndex('unique_active_connection');
            $table->dropColumn('active_status');
        });

        // Restore the original constraint
        Schema::table('user_connections', function (Blueprint $table) {
            $table->unique(['requester_user_id', 'recipient_user_id', 'relationship_type'], 'unique_connection_pair');
        });
    }
};
