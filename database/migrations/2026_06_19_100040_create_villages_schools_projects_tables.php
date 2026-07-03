<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('villages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('state_id')->nullable();
            $table->unsignedBigInteger('district_id')->nullable();
            $table->unsignedBigInteger('mandal_id')->nullable();
            $table->string('village_name');
            $table->string('village_code', 50)->nullable();
            $table->string('slug')->unique();
            $table->string('pincode', 10)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->longText('history')->nullable();
            $table->integer('population')->default(0);
            $table->integer('male_population')->default(0);
            $table->integer('female_population')->default(0);
            $table->integer('children_count')->default(0);
            $table->integer('senior_citizen_count')->default(0);
            $table->decimal('literacy_rate', 5, 2)->nullable();
            $table->integer('farmer_count')->default(0);
            $table->string('cultivable_land')->nullable();
            $table->string('major_crops')->nullable();
            $table->integer('trees_count')->default(0);
            $table->integer('water_bodies_count')->default(0);
            $table->string('logo', 500)->nullable();
            $table->string('cover_image', 500)->nullable();
            $table->unsignedBigInteger('primary_representative_id')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('seo_keywords', 500)->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('village_id')->nullable();
            $table->string('school_name');
            $table->string('slug')->unique();
            $table->string('school_type', 50)->nullable();
            $table->string('udise_code', 50)->nullable();
            $table->string('principal_name')->nullable();
            $table->string('contact_number', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->integer('student_count')->default(0);
            $table->integer('teacher_count')->default(0);
            $table->integer('classroom_count')->default(0);
            $table->boolean('library_available')->default(false);
            $table->boolean('computer_lab_available')->default(false);
            $table->boolean('playground_available')->default(false);
            $table->boolean('drinking_water_available')->default(false);
            $table->boolean('toilet_available')->default(false);
            $table->boolean('electricity_available')->default(false);
            $table->boolean('digital_classroom_available')->default(false);
            $table->boolean('boundary_wall_available')->default(false);
            $table->string('logo', 500)->nullable();
            $table->string('cover_image', 500)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('seo_keywords', 500)->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('project_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon', 50)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_category_id')->nullable();
            $table->unsignedBigInteger('village_id')->nullable();
            $table->unsignedBigInteger('school_id')->nullable();
            $table->string('project_name');
            $table->string('slug')->unique();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->text('objective')->nullable();
            $table->decimal('budget_amount', 12, 2)->default(0);
            $table->decimal('raised_amount', 12, 2)->default(0);
            $table->decimal('spent_amount', 12, 2)->default(0);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('status', 30)->default('active');
            $table->string('cover_image', 500)->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('seo_keywords', 500)->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('project_updates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->longText('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_updates');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('project_categories');
        Schema::dropIfExists('schools');
        Schema::dropIfExists('villages');
    }
};
