<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('villages', function (Blueprint $table) {
            $table->text('vision')->nullable();
            $table->text('challenges')->nullable();
            $table->text('achievements')->nullable();
        });

        Schema::table('schools', function (Blueprint $table) {
            $table->text('vision')->nullable();
            $table->text('challenges')->nullable();
            $table->text('achievements')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('villages', function (Blueprint $table) {
            $table->dropColumn(['vision', 'challenges', 'achievements']);
        });

        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn(['vision', 'challenges', 'achievements']);
        });
    }
};
