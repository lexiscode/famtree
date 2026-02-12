<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('org_broadcasts', function (Blueprint $table) {
            $table->timestamp('recurrence_ends_at')->nullable()->after('recurrence_count');
        });
    }

    public function down(): void
    {
        Schema::table('org_broadcasts', function (Blueprint $table) {
            $table->dropColumn('recurrence_ends_at');
        });
    }
};
