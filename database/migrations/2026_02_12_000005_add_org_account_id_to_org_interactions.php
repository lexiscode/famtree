<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add org_account_id to org_post_comments and make user_id nullable
        Schema::table('org_post_comments', function (Blueprint $table) {
            $table->unsignedBigInteger('org_account_id')->nullable()->after('user_id');
            $table->foreign('org_account_id')->references('id')->on('org_accounts')->onDelete('cascade');
        });

        // Make user_id nullable (drop FK first, modify, re-add)
        Schema::table('org_post_comments', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        Schema::table('org_post_comments', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Add org_account_id to org_post_reactions and make user_id nullable
        Schema::table('org_post_reactions', function (Blueprint $table) {
            $table->unsignedBigInteger('org_account_id')->nullable()->after('user_id');
            $table->foreign('org_account_id')->references('id')->on('org_accounts')->onDelete('cascade');
        });

        Schema::table('org_post_reactions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        Schema::table('org_post_reactions', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Add org_account_id to org_post_comment_likes and make user_id nullable
        Schema::table('org_post_comment_likes', function (Blueprint $table) {
            $table->unsignedBigInteger('org_account_id')->nullable()->after('user_id');
            $table->foreign('org_account_id')->references('id')->on('org_accounts')->onDelete('cascade');
        });

        Schema::table('org_post_comment_likes', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        Schema::table('org_post_comment_likes', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('org_post_comments', function (Blueprint $table) {
            $table->dropForeign(['org_account_id']);
            $table->dropColumn('org_account_id');
        });
        Schema::table('org_post_comments', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        Schema::table('org_post_comments', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('org_post_reactions', function (Blueprint $table) {
            $table->dropForeign(['org_account_id']);
            $table->dropColumn('org_account_id');
        });
        Schema::table('org_post_reactions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        Schema::table('org_post_reactions', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('org_post_comment_likes', function (Blueprint $table) {
            $table->dropForeign(['org_account_id']);
            $table->dropColumn('org_account_id');
        });
        Schema::table('org_post_comment_likes', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        Schema::table('org_post_comment_likes', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
