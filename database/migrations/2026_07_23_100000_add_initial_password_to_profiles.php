<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            // Auto-generated password captured when a guest donor is registered
            // during checkout, so the WhatsApp/email flow can later send them
            // their login credentials. Cleared once they set their own password.
            if (! Schema::hasColumn('profiles', 'initial_password')) {
                $table->string('initial_password')->nullable()->after('mobile');
            }
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            if (Schema::hasColumn('profiles', 'initial_password')) {
                $table->dropColumn('initial_password');
            }
        });
    }
};
