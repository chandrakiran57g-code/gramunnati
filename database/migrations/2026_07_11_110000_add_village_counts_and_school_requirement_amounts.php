<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('villages', function (Blueprint $table) {
            $table->integer('schools_count')->default(0)->after('water_bodies_count');
            $table->integer('projects_count')->default(0)->after('schools_count');
            $table->integer('volunteers_count')->default(0)->after('projects_count');
        });

        Schema::table('school_requirements', function (Blueprint $table) {
            $table->decimal('needed_amount', 12, 2)->default(0)->after('title');
            $table->decimal('raised_amount', 12, 2)->default(0)->after('needed_amount');
            $table->integer('sort_order')->default(0)->after('raised_amount');
        });
    }

    public function down(): void
    {
        Schema::table('villages', function (Blueprint $table) {
            $table->dropColumn(['schools_count', 'projects_count', 'volunteers_count']);
        });

        Schema::table('school_requirements', function (Blueprint $table) {
            $table->dropColumn(['needed_amount', 'raised_amount', 'sort_order']);
        });
    }
};
