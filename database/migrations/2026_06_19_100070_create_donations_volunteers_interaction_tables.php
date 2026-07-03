<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('mobile', 20)->nullable();
            $table->string('subject')->nullable();
            $table->text('message');
            $table->string('status', 20)->default('new');
            $table->timestamps();
        });

        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('donor_name');
            $table->string('email')->nullable();
            $table->string('mobile', 20)->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 10)->default('INR');
            $table->string('target_type', 50)->default('general');
            $table->unsignedBigInteger('village_id')->nullable();
            $table->unsignedBigInteger('school_id')->nullable();
            $table->unsignedBigInteger('project_id')->nullable();
            $table->text('message')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->string('payment_status', 30)->default('pending');
            $table->string('payment_gateway', 50)->nullable();
            $table->string('receipt_number', 100)->nullable();
            $table->string('transaction_id', 100)->nullable();
            $table->string('stripe_payment_intent_id')->nullable();
            $table->timestamp('donated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('donation_receipts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('donation_id');
            $table->string('receipt_number', 100);
            $table->string('receipt_path', 500)->nullable();
            $table->timestamps();
        });

        Schema::create('volunteers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('full_name');
            $table->string('email')->nullable();
            $table->string('mobile', 20)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('district', 100)->nullable();
            $table->string('occupation')->nullable();
            $table->string('availability', 50)->nullable();
            $table->json('skills')->nullable();
            $table->text('experience')->nullable();
            $table->string('photo', 500)->nullable();
            $table->string('program_category', 100)->nullable();
            $table->string('status', 30)->default('active');
            $table->integer('age')->nullable();
            $table->string('volunteer_code', 20)->nullable();
            $table->integer('hours_contributed')->default(0);
            $table->integer('projects_joined')->default(0);
            $table->timestamps();
        });

        Schema::create('volunteer_activities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('volunteer_id');
            $table->unsignedBigInteger('project_id')->nullable();
            $table->date('activity_date')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('village_needs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('village_id');
            $table->string('title');
            $table->string('priority', 20)->nullable();
            $table->text('description')->nullable();
            $table->string('status', 30)->default('open');
            $table->timestamps();
        });

        Schema::create('school_requirements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('school_id');
            $table->string('title');
            $table->string('priority', 20)->nullable();
            $table->text('description')->nullable();
            $table->string('status', 30)->default('open');
            $table->timestamps();
        });

        Schema::create('village_followers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('village_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamp('created_at')->nullable();

            $table->unique(['village_id', 'user_id']);
        });

        Schema::create('school_followers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('school_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamp('created_at')->nullable();

            $table->unique(['school_id', 'user_id']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('title');
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('action', 100);
            $table->string('module', 100);
            $table->unsignedBigInteger('record_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('school_followers');
        Schema::dropIfExists('village_followers');
        Schema::dropIfExists('school_requirements');
        Schema::dropIfExists('village_needs');
        Schema::dropIfExists('volunteer_activities');
        Schema::dropIfExists('volunteers');
        Schema::dropIfExists('donation_receipts');
        Schema::dropIfExists('donations');
        Schema::dropIfExists('contact_messages');
    }
};
