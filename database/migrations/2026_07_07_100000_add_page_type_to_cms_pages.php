<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('cms_pages', 'page_type')) {
            Schema::table('cms_pages', function (Blueprint $table) {
                $table->string('page_type', 30)->default('general')->after('status');
            });
        }
    }

    public function down(): void
    {
        Schema::table('cms_pages', function (Blueprint $table) {
            $table->dropColumn('page_type');
        });
    }
};
