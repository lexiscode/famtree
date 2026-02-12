<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_refams', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('post_id')->nullable();
            $table->unsignedBigInteger('org_post_id')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->timestamps();

            $table->foreign('post_id')->references('id')->on('posts')->cascadeOnDelete();
            $table->foreign('org_post_id')->references('id')->on('org_posts')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            $table->unique(['post_id', 'user_id']);
            $table->unique(['org_post_id', 'user_id']);
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->unsignedInteger('refams_count')->default(0)->after('reactions_count');
        });

        Schema::table('org_posts', function (Blueprint $table) {
            $table->unsignedInteger('refams_count')->default(0)->after('reactions_count');
        });
    }

    public function down(): void
    {
        Schema::table('org_posts', function (Blueprint $table) {
            $table->dropColumn('refams_count');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('refams_count');
        });

        Schema::dropIfExists('post_refams');
    }
};
