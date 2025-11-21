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
        Schema::create('user_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reporter_user_id'); // User submitting the report
            $table->unsignedBigInteger('reported_user_id'); // User being reported
            $table->enum('reason', ['harassment', 'spam', 'inappropriate', 'impersonation', 'other'])->default('other');
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'reviewing', 'resolved', 'dismissed'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->unsignedBigInteger('reviewed_by_admin_id')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('reporter_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('reported_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('reviewed_by_admin_id')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('reporter_user_id');
            $table->index('reported_user_id');
            $table->index('status');
            $table->unique(['reporter_user_id', 'reported_user_id'], 'unique_user_report'); // Prevent duplicate reports
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_reports');
    }
};
