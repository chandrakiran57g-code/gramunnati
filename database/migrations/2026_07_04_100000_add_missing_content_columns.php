<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('news', function (Blueprint $table) {
            if (! Schema::hasColumn('news', 'summary')) {
                $table->text('summary')->nullable()->after('content');
            }
            if (! Schema::hasColumn('news', 'summary_te')) {
                $table->text('summary_te')->nullable()->after('summary');
            }
            if (! Schema::hasColumn('news', 'category')) {
                $table->string('category', 50)->nullable()->default('general')->after('summary_te');
            }
        });

        Schema::table('events', function (Blueprint $table) {
            if (! Schema::hasColumn('events', 'registration_link')) {
                $table->string('registration_link', 500)->nullable()->after('featured_image');
            }
        });

        Schema::table('schools', function (Blueprint $table) {
            if (! Schema::hasColumn('schools', 'short_description')) {
                $table->text('short_description')->nullable()->after('website');
            }
        });
        Schema::table('schools', function (Blueprint $table) {
            if (! Schema::hasColumn('schools', 'short_description_te')) {
                $table->text('short_description_te')->nullable()->after('short_description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('news', function (Blueprint $table) {
            foreach (['summary', 'summary_te', 'category'] as $col) {
                if (Schema::hasColumn('news', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'registration_link')) {
                $table->dropColumn('registration_link');
            }
        });

        Schema::table('schools', function (Blueprint $table) {
            foreach (['short_description_te', 'short_description'] as $col) {
                if (Schema::hasColumn('schools', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
