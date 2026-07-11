<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('village_crops', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('village_id');
            $table->string('name');
            $table->string('image', 500)->nullable();
            $table->decimal('price_per_kg', 10, 2)->nullable();
            $table->string('sowing_period')->nullable();
            $table->string('harvest_period')->nullable();
            $table->string('estimated_yield')->nullable();
            $table->string('cultivation_area')->nullable();
            $table->string('availability', 30)->default('in_season');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('village_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('village_crops');
    }
};
