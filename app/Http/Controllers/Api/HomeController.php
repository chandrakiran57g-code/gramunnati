<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Donation;
use App\Models\Event;
use App\Models\Gallery;
use App\Models\ImpactMetric;
use App\Models\News;
use App\Models\Partner;
use App\Models\Program;
use App\Models\Project;
use App\Models\School;
use App\Models\SuccessStory;
use App\Models\Testimonial;
use App\Models\Village;
use App\Models\Volunteer;
use App\Support\SettingsStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function pageData(): JsonResponse
    {
        return response()->json([
            'stats' => $this->statsArray(),
            'villages' => Village::query()->where('is_active', true)->where('is_featured', true)->limit(6)->get(),
            'schools' => School::query()->where('is_active', true)->where('is_featured', true)->limit(6)->get(),
            'projects' => Project::query()->where('status', 'active')->orderByDesc('created_at')->limit(8)->get(),
            'programs' => Program::query()->where('status', 'active')->orderBy('sort_order')->limit(8)->get(),
            'stories' => SuccessStory::query()->where('is_featured', true)->orderByDesc('published_at')->limit(6)->get(),
            'testimonials' => $this->featuredTestimonials(),
            'news' => News::query()->where('is_published', true)->orderByDesc('published_at')->limit(4)->get(),
            'events' => Event::query()->where('is_published', true)->where('start_date', '>=', now())->orderBy('start_date')->limit(4)->get(),
            'activity' => ActivityLog::query()->orderByDesc('activity_date')->limit(10)->get(),
            'partners' => Partner::query()->where('is_active', true)->limit(12)->get(),
            'gallery' => Gallery::query()->orderBy('sort_order')->limit(12)->get(),
            'urgentProjects' => Project::query()
                ->where('status', 'active')
                ->whereColumn('raised_amount', '<', 'budget_amount')
                ->orderByRaw('(budget_amount - raised_amount) DESC')
                ->limit(6)
                ->get(),
            'monthlyDonations' => Donation::query()
                ->where('payment_status', 'success')
                ->where('created_at', '>=', now()->startOfMonth())
                ->sum('amount'),
            'donationBreakdown' => Donation::query()
                ->select('target_type', DB::raw('SUM(amount) as total'))
                ->where('payment_status', 'success')
                ->groupBy('target_type')
                ->get(),
        ]);
    }

    public function stats(): JsonResponse
    {
        return response()->json($this->statsArray());
    }

    private function statsArray(): array
    {
        $metrics = ImpactMetric::query()
            ->where('metricable_type', 'site')
            ->where('metricable_id', 0)
            ->pluck('metric_value', 'metric_name');

        return [
            'villages' => (int) ($metrics['villages'] ?? Village::query()->where('is_active', true)->count()),
            'schools' => (int) ($metrics['schools'] ?? School::query()->where('is_active', true)->count()),
            'projects' => (int) ($metrics['projects'] ?? Project::query()->where('status', 'active')->count()),
            'beneficiaries' => (int) ($metrics['beneficiaries'] ?? 0),
            'volunteers' => (int) ($metrics['volunteers'] ?? Volunteer::query()->count()),
            'donations_total' => (float) Donation::query()->where('payment_status', 'success')->sum('amount'),
        ];
    }

    private function featuredTestimonials()
    {
        $fromSetting = SettingsStore::get('featured_testimonials');
        if (is_array($fromSetting) && count($fromSetting)) {
            return $fromSetting;
        }

        return Testimonial::query()->where('is_featured', true)->orderBy('sort_order')->limit(6)->get();
    }
}
