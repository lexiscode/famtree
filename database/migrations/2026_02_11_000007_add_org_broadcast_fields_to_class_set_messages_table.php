<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('class_set_messages', function (Blueprint $table) {
            $table->boolean('is_org_broadcast')->default(false)->after('edited_at');
            $table->foreignId('org_broadcast_id')->nullable()->after('is_org_broadcast')
                ->constrained('org_broadcasts')->nullOnDelete();
            $table->foreignId('org_account_id')->nullable()->after('org_broadcast_id')
                ->constrained('org_accounts')->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->after('org_account_id')
                ->constrained('organizations')->nullOnDelete();

            $table->index('is_org_broadcast');
        });
    }

    public function down(): void
    {
        Schema::table('class_set_messages', function (Blueprint $table) {
            $table->dropForeign(['org_broadcast_id']);
            $table->dropForeign(['org_account_id']);
            $table->dropForeign(['organization_id']);
            $table->dropIndex(['is_org_broadcast']);
            $table->dropColumn(['is_org_broadcast', 'org_broadcast_id', 'org_account_id', 'organization_id']);
        });
    }
};
