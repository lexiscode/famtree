<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('class_set_messages', function (Blueprint $table) {
            $table->foreignId('sender_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('class_set_messages', function (Blueprint $table) {
            $table->foreignId('sender_id')->nullable(false)->change();
        });
    }
};
