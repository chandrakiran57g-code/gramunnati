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
use App\Support\PublicCache;
use App\Support\SettingsStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function pageData(): JsonResponse
    {
        return response()->json(PublicCache::remember('home:page-data', fn () => $this->pageDataArray()));
    }

    private function pageDataArray(): array
    {
        return [
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
        ];
    }

    public function stats(): JsonResponse
    {
        return response()->json(PublicCache::remember('home:stats', fn () => $this->statsArray()));
    }

    public function impact(): JsonResponse
    {
        return response()->json(PublicCache::remember('home:impact', fn () => $this->impactArray()));
    }

    private function impactArray(): array
    {
        $metricRows = ImpactMetric::query()
            ->where('metricable_type', 'site')
            ->where('metricable_id', 0)
            ->pluck('metric_value', 'metric_name');

        $villages = (int) Village::query()->where('is_active', true)->count();
        $schools = (int) School::query()->where('is_active', true)->count();
        $donationsTotal = (float) Donation::query()->where('payment_status', 'success')->sum('amount');
        $volunteers = (int) Volunteer::query()->count();

        $metrics = [
            'villages' => $villages,
            'schools' => $schools,
            'donations_total' => $donationsTotal,
            'trees_planted' => (int) ($metricRows['trees_planted'] ?? 0),
            'farmers_benefited' => (int) ($metricRows['farmers_benefited'] ?? 0),
            'students_benefited' => (int) ($metricRows['students_benefited'] ?? 0),
            'volunteers' => $volunteers,
            'water_projects' => (int) ($metricRows['water_projects']
                ?? Project::query()->where('status', 'active')
                    ->whereHas('category', fn ($q) => $q->where('slug', 'water-conservation'))
                    ->count()),
        ];

        return [
            'metrics' => $metrics,
            'stateStats' => $this->stateStats(),
        ];
    }

    /**
     * Per-state rollup in a fixed number of grouped queries (previously 1 + 3×N
     * queries, one set per state).
     */
    private function stateStats(): array
    {
        $states = \App\Models\State::query()->where('is_active', true)->get(['id', 'name']);

        $villagesByState = Village::query()
            ->where('is_active', true)
            ->groupBy('state_id')
            ->selectRaw('state_id, COUNT(*) as total')
            ->pluck('total', 'state_id');

        $schoolsByState = School::query()
            ->join('villages', 'villages.id', '=', 'schools.village_id')
            ->where('schools.is_active', true)
            ->groupBy('villages.state_id')
            ->selectRaw('villages.state_id as state_id, COUNT(*) as total')
            ->pluck('total', 'state_id');

        $donationsByState = Donation::query()
            ->join('villages', 'villages.id', '=', 'donations.village_id')
            ->where('donations.payment_status', 'success')
            ->groupBy('villages.state_id')
            ->selectRaw('villages.state_id as state_id, SUM(donations.amount) as total')
            ->pluck('total', 'state_id');

        return $states->map(fn ($state) => [
            'state' => $state->name,
            'villages' => (int) ($villagesByState[$state->id] ?? 0),
            'schools' => (int) ($schoolsByState[$state->id] ?? 0),
            'donations' => (float) ($donationsByState[$state->id] ?? 0),
        ])
            ->filter(fn ($row) => $row['villages'] > 0 || $row['schools'] > 0 || $row['donations'] > 0)
            ->sortByDesc(fn ($row) => $row['villages'] + $row['schools'])
            ->take(8)
            ->values()
            ->all();
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
