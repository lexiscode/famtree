<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('org_groups', function (Blueprint $table) {
            $table->boolean('is_suspended')->default(false)->after('is_active');
            $table->string('suspension_reason')->nullable()->after('is_suspended');
            $table->timestamp('suspended_at')->nullable()->after('suspension_reason');
            $table->unsignedBigInteger('suspended_by')->nullable()->after('suspended_at');

            $table->foreign('suspended_by')->references('id')->on('org_accounts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('org_groups', function (Blueprint $table) {
            $table->dropForeign(['suspended_by']);
            $table->dropColumn(['is_suspended', 'suspension_reason', 'suspended_at', 'suspended_by']);
        });
    }
};
