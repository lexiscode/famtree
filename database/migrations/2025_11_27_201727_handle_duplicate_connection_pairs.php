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
        // Safely drop the old unique index if it exists
        Schema::table('user_connections', function (Blueprint $table) {
            try {
                $table->dropUnique('unique_connection_pair');
            } catch (\Throwable $e) {
                // ignore if it doesn't exist
            }
        });

        // Add nullable column instead of generated column
        Schema::table('user_connections', function (Blueprint $table) {
            if (!Schema::hasColumn('user_connections', 'active_status')) {
                $table->string('active_status')->nullable();
            }
        });

        // Populate active_status field based on status values
        DB::table('user_connections')->update([
            'active_status' => DB::raw(
                "CASE WHEN status IN ('pending','accepted') THEN status ELSE NULL END"
            )
        ]);

        // Create Laravel-portable unique index
        Schema::table('user_connections', function (Blueprint $table) {
            $table->unique(
                ['requester_user_id', 'recipient_user_id', 'relationship_type', 'active_status'],
                'unique_active_connection'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_connections', function (Blueprint $table) {
            try {
                $table->dropUnique('unique_active_connection');
            } catch (\Throwable $e) {}

            if (Schema::hasColumn('user_connections', 'active_status')) {
                $table->dropColumn('active_status');
            }

            $table->unique(
                ['requester_user_id', 'recipient_user_id', 'relationship_type'],
                'unique_connection_pair'
            );
        });
    }

};
