<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Beneficiary;
use App\Models\CmsPage;
use App\Models\ContactMessage;
use App\Models\Donation;
use App\Models\Event;
use App\Models\Faq;
use App\Models\Gallery;
use App\Models\News;
use App\Models\Partner;
use App\Models\Program;
use App\Models\Setting;
use App\Models\SuccessStory;
use App\Models\TeamGroup;
use App\Models\Testimonial;
use App\Support\SettingsStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsController extends Controller
{
    public function page(string $slug): JsonResponse
    {
        $page = CmsPage::query()->where('slug', $slug)->first();

        return response()->json($page);
    }

    public function pages(Request $request): JsonResponse
    {
        $query = CmsPage::query()->orderBy('display_order');
        if ($request->boolean('published_only')) {
            $query->where('status', 'active');
        }

        return response()->json($query->get());
    }

    public function programs(): JsonResponse
    {
        return response()->json(
            Program::query()->where('status', 'active')->orderBy('sort_order')->get()
        );
    }

    public function teamGroups(): JsonResponse
    {
        return response()->json(
            TeamGroup::query()
                ->with(['members' => fn ($q) => $q->where('is_active', true)->orderBy('display_order')])
                ->where('status', 'active')
                ->orderBy('display_order')
                ->get()
        );
    }

    public function partners(): JsonResponse
    {
        return response()->json(
            Partner::query()->where('is_active', true)->orderBy('name')->get()
        );
    }

    public function beneficiaries(): JsonResponse
    {
        return response()->json(
            Beneficiary::query()->with(['village:id,village_name,slug', 'school:id,school_name,slug'])
                ->where('is_active', true)
                ->get()
        );
    }

    public function news(Request $request): JsonResponse
    {
        $query = News::query()->where('is_published', true)->orderByDesc('published_at');
        if ($request->filled('limit')) {
            $query->limit((int) $request->input('limit'));
        }

        return response()->json($query->get());
    }

    public function events(Request $request): JsonResponse
    {
        $query = Event::query()->where('is_published', true)->orderBy('start_date');
        if ($request->boolean('upcoming')) {
            $query->where('start_date', '>=', now());
        }
        if ($request->filled('limit')) {
            $query->limit((int) $request->input('limit'));
        }

        return response()->json($query->get());
    }

    public function stories(Request $request): JsonResponse
    {
        $query = SuccessStory::query()->orderByDesc('published_at');
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        return response()->json($query->get());
    }

    public function faqs(): JsonResponse
    {
        return response()->json(
            Faq::query()->where('is_active', true)->orderBy('sort_order')->get()
        );
    }

    public function testimonials(Request $request): JsonResponse
    {
        $query = Testimonial::query()->orderBy('sort_order');
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        return response()->json($query->get());
    }

    public function gallery(Request $request): JsonResponse
    {
        $query = Gallery::query()->orderBy('sort_order');
        if ($request->filled('type')) {
            $query->where('galleryable_type', $request->input('type'));
        }
        if ($request->filled('limit')) {
            $query->limit((int) $request->input('limit'));
        }

        return response()->json($query->get());
    }

    public function settings(): JsonResponse
    {
        $rows = Setting::query()->get(['key', 'value']);
        $out = [];
        foreach ($rows as $row) {
            $decoded = json_decode($row->value, true);
            $out[$row->key] = json_last_error() === JSON_ERROR_NONE ? $decoded : $row->value;
        }

        return response()->json($out);
    }

    public function setting(string $key): JsonResponse
    {
        return response()->json(['key' => $key, 'value' => SettingsStore::get($key)]);
    }

    public function contact(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        $message = ContactMessage::query()->create($data);

        return response()->json($message, 201);
    }

    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->input('q', ''));
        if (strlen($q) < 2) {
            return response()->json(['villages' => [], 'schools' => [], 'projects' => [], 'news' => []]);
        }

        $like = '%'.$q.'%';

        return response()->json([
            'villages' => \App\Models\Village::query()
                ->where('is_active', true)
                ->where('village_name', 'like', $like)
                ->limit(10)->get(['id', 'village_name', 'slug']),
            'schools' => \App\Models\School::query()
                ->where('is_active', true)
                ->where('school_name', 'like', $like)
                ->limit(10)->get(['id', 'school_name', 'slug']),
            'projects' => \App\Models\Project::query()
                ->where('project_name', 'like', $like)
                ->limit(10)->get(['id', 'project_name', 'slug']),
            'news' => News::query()
                ->where('is_published', true)
                ->where('title', 'like', $like)
                ->limit(10)->get(['id', 'title', 'slug']),
        ]);
    }
}
