<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_connections', function (Blueprint $table) {
            $table->unsignedBigInteger('other_parent_id')->nullable()->after('relationship_type');
            $table->foreign('other_parent_id')->references('id')->on('users')->onDelete('set null');
            $table->index('other_parent_id');
        });
    }

    public function down(): void
    {
        Schema::table('user_connections', function (Blueprint $table) {
            $table->dropForeign(['other_parent_id']);
            $table->dropIndex(['other_parent_id']);
            $table->dropColumn('other_parent_id');
        });
    }
};
