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
        // Add to tree_chat_messages
        Schema::table('tree_chat_messages', function (Blueprint $table) {
            $table->boolean('is_edited')->default(false)->after('is_read');
            $table->timestamp('edited_at')->nullable()->after('is_edited');
        });

        // Add to class_set_messages
        Schema::table('class_set_messages', function (Blueprint $table) {
            $table->boolean('is_edited')->default(false)->after('message');
            $table->timestamp('edited_at')->nullable()->after('is_edited');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tree_chat_messages', function (Blueprint $table) {
            $table->dropColumn(['is_edited', 'edited_at']);
        });

        Schema::table('class_set_messages', function (Blueprint $table) {
            $table->dropColumn(['is_edited', 'edited_at']);
        });
    }
};
