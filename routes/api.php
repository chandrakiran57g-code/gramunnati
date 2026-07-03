<?php

use App\Http\Controllers\Api\ActiveWorkController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminTableController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CmsController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\GeographyController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\NeedSupportController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SchoolController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\VillageController;
use App\Http\Controllers\Api\VolunteerController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['ok' => true, 'service' => 'cmsr-api']));

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
    Route::put('/profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::get('/db/{table}', [AdminTableController::class, 'query']);

Route::prefix('geo')->group(function () {
    Route::get('/states', [GeographyController::class, 'states']);
    Route::get('/districts', [GeographyController::class, 'districts']);
    Route::get('/mandals', [GeographyController::class, 'mandals']);
});

Route::get('/home/page-data', [HomeController::class, 'pageData']);
Route::get('/home/stats', [HomeController::class, 'stats']);

Route::prefix('villages')->group(function () {
    Route::get('/', [VillageController::class, 'index']);
    Route::get('/{id}/needs', [VillageController::class, 'needs'])->whereNumber('id');
    Route::get('/{id}/schools', [VillageController::class, 'schools'])->whereNumber('id');
    Route::get('/{id}/projects', [VillageController::class, 'projects'])->whereNumber('id');
    Route::get('/{id}/gallery', [VillageController::class, 'gallery'])->whereNumber('id');
    Route::get('/{id}/timeline', [VillageController::class, 'timeline'])->whereNumber('id');
    Route::get('/{slug}', [VillageController::class, 'show']);
});

Route::prefix('schools')->group(function () {
    Route::get('/', [SchoolController::class, 'index']);
    Route::get('/{id}/requirements', [SchoolController::class, 'requirements'])->whereNumber('id');
    Route::get('/{id}/gallery', [SchoolController::class, 'gallery'])->whereNumber('id');
    Route::get('/{id}/timeline', [SchoolController::class, 'timeline'])->whereNumber('id');
    Route::get('/{slug}', [SchoolController::class, 'show']);
});

Route::prefix('projects')->group(function () {
    Route::get('/', [ProjectController::class, 'index']);
    Route::get('/categories', [ProjectController::class, 'categories']);
    Route::get('/{id}/updates', [ProjectController::class, 'updates'])->whereNumber('id');
    Route::get('/{slug}', [ProjectController::class, 'show']);
});

Route::prefix('cms')->group(function () {
    Route::get('/pages', [CmsController::class, 'pages']);
    Route::get('/pages/{slug}', [CmsController::class, 'page']);
    Route::get('/programs', [CmsController::class, 'programs']);
    Route::get('/team-groups', [CmsController::class, 'teamGroups']);
    Route::get('/partners', [CmsController::class, 'partners']);
    Route::get('/beneficiaries', [CmsController::class, 'beneficiaries']);
    Route::get('/news', [CmsController::class, 'news']);
    Route::get('/events', [CmsController::class, 'events']);
    Route::get('/stories', [CmsController::class, 'stories']);
    Route::get('/faqs', [CmsController::class, 'faqs']);
    Route::get('/testimonials', [CmsController::class, 'testimonials']);
    Route::get('/gallery', [CmsController::class, 'gallery']);
    Route::get('/settings', [CmsController::class, 'settings']);
    Route::get('/settings/{key}', [CmsController::class, 'setting']);
});

Route::get('/search', [CmsController::class, 'search']);
Route::post('/contact', [CmsController::class, 'contact']);
Route::post('/donations', [DonationController::class, 'store']);
Route::post('/volunteers/register', [VolunteerController::class, 'register']);

Route::get('/active-works/store', [ActiveWorkController::class, 'show']);
Route::get('/active-works/public-bundle', [ActiveWorkController::class, 'publicBundle']);

Route::get('/need-support/store', [NeedSupportController::class, 'show']);
Route::get('/need-support/homepage', [NeedSupportController::class, 'homepage']);
Route::get('/need-support/projects', [NeedSupportController::class, 'projects']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/donations/mine', [DonationController::class, 'mine']);
});

Route::middleware(['auth:sanctum', AdminMiddleware::class])->prefix('admin')->group(function () {
    Route::get('/dashboard-stats', [AdminController::class, 'dashboardStats']);
    Route::put('/active-works/store', [ActiveWorkController::class, 'update']);
    Route::put('/need-support/store', [NeedSupportController::class, 'update']);
    Route::post('/db/settings/upsert', [AdminTableController::class, 'upsertSetting']);
    Route::get('/db/{table}', [AdminTableController::class, 'query']);
    Route::get('/db/{table}/{id}', [AdminTableController::class, 'show'])->whereNumber('id');
    Route::post('/db/{table}', [AdminTableController::class, 'store']);
    Route::patch('/db/{table}/{id}', [AdminTableController::class, 'update'])->whereNumber('id');
    Route::delete('/db/{table}/{id}', [AdminTableController::class, 'destroy'])->whereNumber('id');
});

Route::middleware(['auth:sanctum', AdminMiddleware::class])->group(function () {
    Route::post('/upload', [UploadController::class, 'store']);
    Route::delete('/upload', [UploadController::class, 'destroy']);
});
