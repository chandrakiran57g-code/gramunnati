<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            $table->string('galleryable_type', 50);
            $table->unsignedBigInteger('galleryable_id')->default(0);
            $table->string('title')->nullable();
            $table->string('image_path', 500)->nullable();
            $table->string('video_url', 500)->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('impact_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('metricable_type', 50);
            $table->unsignedBigInteger('metricable_id')->default(0);
            $table->string('metric_name', 100);
            $table->decimal('metric_value', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('loggable_type', 50);
            $table->unsignedBigInteger('loggable_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('activity_type', 50)->nullable();
            $table->string('image', 500)->nullable();
            $table->date('activity_date')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });

        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('content');
            $table->string('designation')->nullable();
            $table->string('photo', 500)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('documentable_type', 50);
            $table->unsignedBigInteger('documentable_id');
            $table->string('title');
            $table->string('file_path', 500);
            $table->string('file_type', 50)->nullable();
            $table->integer('file_size')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('impact_metrics');
        Schema::dropIfExists('galleries');
    }
};
