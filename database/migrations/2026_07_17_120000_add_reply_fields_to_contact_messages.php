<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->string('reply_subject')->nullable()->after('status');
            $table->text('reply_message')->nullable()->after('reply_subject');
            $table->timestamp('replied_at')->nullable()->after('reply_message');
        });
    }

    public function down(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->dropColumn(['reply_subject', 'reply_message', 'replied_at']);
        });
    }
};
