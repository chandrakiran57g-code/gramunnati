<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cms_pages', function (Blueprint $table) {
            if (! Schema::hasColumn('cms_pages', 'content_title')) {
                $table->string('content_title')->nullable()->after('content');
            }
            if (! Schema::hasColumn('cms_pages', 'content_title_te')) {
                $table->string('content_title_te')->nullable()->after('content_title');
            }
            if (! Schema::hasColumn('cms_pages', 'content_heading')) {
                $table->string('content_heading')->nullable()->after('content_title_te');
            }
            if (! Schema::hasColumn('cms_pages', 'content_heading_te')) {
                $table->string('content_heading_te')->nullable()->after('content_heading');
            }
            if (! Schema::hasColumn('cms_pages', 'content_sections')) {
                $table->json('content_sections')->nullable()->after('content_heading_te');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cms_pages', function (Blueprint $table) {
            foreach (['content_sections', 'content_heading_te', 'content_heading', 'content_title_te', 'content_title'] as $col) {
                if (Schema::hasColumn('cms_pages', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
