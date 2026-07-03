<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cms_pages', function (Blueprint $table) {
            if (! Schema::hasColumn('cms_pages', 'video_url')) {
                $table->string('video_url', 500)->nullable()->after('featured_image');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cms_pages', function (Blueprint $table) {
            if (Schema::hasColumn('cms_pages', 'video_url')) {
                $table->dropColumn('video_url');
            }
        });
    }
};
