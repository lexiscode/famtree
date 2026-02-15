<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('private_messages', function (Blueprint $table) {
            $table->unsignedBigInteger('reply_to_id')->nullable()->after('message');
            $table->foreign('reply_to_id')->references('id')->on('private_messages')->onDelete('set null');
        });

        Schema::table('tree_chat_messages', function (Blueprint $table) {
            $table->unsignedBigInteger('reply_to_id')->nullable()->after('message');
            $table->foreign('reply_to_id')->references('id')->on('tree_chat_messages')->onDelete('set null');
        });

        Schema::table('class_set_messages', function (Blueprint $table) {
            $table->unsignedBigInteger('reply_to_id')->nullable()->after('message');
            $table->foreign('reply_to_id')->references('id')->on('class_set_messages')->onDelete('set null');
        });

        Schema::table('glam_squad_messages', function (Blueprint $table) {
            $table->unsignedBigInteger('reply_to_id')->nullable()->after('message');
            $table->foreign('reply_to_id')->references('id')->on('glam_squad_messages')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('private_messages', function (Blueprint $table) {
            $table->dropForeign(['reply_to_id']);
            $table->dropColumn('reply_to_id');
        });

        Schema::table('tree_chat_messages', function (Blueprint $table) {
            $table->dropForeign(['reply_to_id']);
            $table->dropColumn('reply_to_id');
        });

        Schema::table('class_set_messages', function (Blueprint $table) {
            $table->dropForeign(['reply_to_id']);
            $table->dropColumn('reply_to_id');
        });

        Schema::table('glam_squad_messages', function (Blueprint $table) {
            $table->dropForeign(['reply_to_id']);
            $table->dropColumn('reply_to_id');
        });
    }
};
