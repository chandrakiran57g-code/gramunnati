<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('team_groups', function (Blueprint $table) {
            if (!Schema::hasColumn('team_groups', 'banner_image')) {
                $table->string('banner_image', 500)->nullable()->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('team_groups', function (Blueprint $table) {
            if (Schema::hasColumn('team_groups', 'banner_image')) {
                $table->dropColumn('banner_image');
            }
        });
    }
};
