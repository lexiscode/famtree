<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Add threading columns to post_comments
        Schema::table('post_comments', function (Blueprint $table) {
            $table->string('uuid', 36)->unique()->after('id');
            $table->unsignedBigInteger('parent_comment_id')->nullable()->after('content');
            $table->unsignedInteger('likes_count')->default(0)->after('parent_comment_id');

            $table->foreign('parent_comment_id')->references('id')->on('post_comments')->onDelete('cascade');
        });

        // Backfill existing post_comments with UUIDs
        DB::table('post_comments')->whereNull('uuid')->orWhere('uuid', '')->orderBy('id')->chunk(100, function ($comments) {
            foreach ($comments as $comment) {
                DB::table('post_comments')->where('id', $comment->id)->update(['uuid' => (string) Str::uuid()]);
            }
        });

        // Add threading columns to org_post_comments
        Schema::table('org_post_comments', function (Blueprint $table) {
            $table->string('uuid', 36)->unique()->after('id');
            $table->unsignedBigInteger('parent_comment_id')->nullable()->after('content');
            $table->unsignedInteger('likes_count')->default(0)->after('parent_comment_id');

            $table->foreign('parent_comment_id')->references('id')->on('org_post_comments')->onDelete('cascade');
        });

        // Backfill existing org_post_comments with UUIDs
        DB::table('org_post_comments')->whereNull('uuid')->orWhere('uuid', '')->orderBy('id')->chunk(100, function ($comments) {
            foreach ($comments as $comment) {
                DB::table('org_post_comments')->where('id', $comment->id)->update(['uuid' => (string) Str::uuid()]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('post_comments', function (Blueprint $table) {
            $table->dropForeign(['parent_comment_id']);
            $table->dropColumn(['uuid', 'parent_comment_id', 'likes_count']);
        });

        Schema::table('org_post_comments', function (Blueprint $table) {
            $table->dropForeign(['parent_comment_id']);
            $table->dropColumn(['uuid', 'parent_comment_id', 'likes_count']);
        });
    }
};
