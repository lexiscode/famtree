<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('class_set_members', function (Blueprint $table) {
            $table->boolean('is_muted')->default(false)->after('is_admin');
        });
    }

    public function down(): void
    {
        Schema::table('class_set_members', function (Blueprint $table) {
            $table->dropColumn('is_muted');
        });
    }
};
