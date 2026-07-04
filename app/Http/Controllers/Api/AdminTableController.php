<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminTableController extends Controller
{
    /** @var array<string, class-string<Model>> */
    private const MODELS = [
        'villages' => \App\Models\Village::class,
        'schools' => \App\Models\School::class,
        'projects' => \App\Models\Project::class,
        'project_categories' => \App\Models\ProjectCategory::class,
        'project_updates' => \App\Models\ProjectUpdate::class,
        'programs' => \App\Models\Program::class,
        'team_groups' => \App\Models\TeamGroup::class,
        'team_members' => \App\Models\TeamMember::class,
        'partners' => \App\Models\Partner::class,
        'beneficiaries' => \App\Models\Beneficiary::class,
        'news' => \App\Models\News::class,
        'events' => \App\Models\Event::class,
        'success_stories' => \App\Models\SuccessStory::class,
        'galleries' => \App\Models\Gallery::class,
        'impact_metrics' => \App\Models\ImpactMetric::class,
        'activity_logs' => \App\Models\ActivityLog::class,
        'testimonials' => \App\Models\Testimonial::class,
        'documents' => \App\Models\Document::class,
        'contact_messages' => \App\Models\ContactMessage::class,
        'donations' => \App\Models\Donation::class,
        'donation_receipts' => \App\Models\DonationReceipt::class,
        'volunteers' => \App\Models\Volunteer::class,
        'volunteer_activities' => \App\Models\VolunteerActivity::class,
        'village_needs' => \App\Models\VillageNeed::class,
        'school_requirements' => \App\Models\SchoolRequirement::class,
        'village_followers' => \App\Models\VillageFollower::class,
        'school_followers' => \App\Models\SchoolFollower::class,
        'notifications' => \App\Models\Notification::class,
        'audit_logs' => \App\Models\AuditLog::class,
        'cms_pages' => \App\Models\CmsPage::class,
        'settings' => \App\Models\Setting::class,
        'faqs' => \App\Models\Faq::class,
        'profiles' => \App\Models\Profile::class,
        'roles' => \App\Models\Role::class,
        'user_categories' => \App\Models\UserCategory::class,
        'states' => \App\Models\State::class,
        'districts' => \App\Models\District::class,
        'mandals' => \App\Models\Mandal::class,
    ];

    private const WITH = [
        'villages' => ['state:id,name,code', 'district:id,name', 'mandal:id,name'],
        'schools' => ['village:id,village_name,slug,state_id,district_id,mandal_id', 'village.state:id,name', 'village.district:id,name', 'village.mandal:id,name'],
        'projects' => ['category:id,name,slug,icon', 'village:id,village_name,slug', 'school:id,school_name,slug'],
        'team_groups' => ['members'],
        'team_members' => ['teamGroup:id,name,slug'],
        'beneficiaries' => ['village:id,village_name,slug', 'school:id,school_name,slug'],
        'success_stories' => ['village:id,village_name,slug', 'school:id,school_name,slug'],
        'donations' => ['village:id,village_name', 'school:id,school_name', 'project:id,project_name', 'receipts'],
        'volunteers' => ['user.profile'],
        'profiles' => ['state:id,name', 'district:id,name', 'mandal:id,name', 'village:id,village_name', 'user.roles'],
    ];

    public function query(Request $request, string $table): JsonResponse
    {
        $filtersInput = $request->input('filters', []);
        $filters = is_string($filtersInput) ? (json_decode($filtersInput, true) ?? []) : $filtersInput;
        $filters = $this->normalizeFilters($table, $filters);

        if ($table === 'user_roles') {
            $query = DB::table('user_roles');
            foreach ($filters as $filter) {
                if (($filter['column'] ?? '') && ($filter['op'] ?? '') === 'eq') {
                    $query->where($filter['column'], $filter['value']);
                }
            }
            $rows = $query->get()->map(fn ($row) => [
                'user_id' => $row->user_id,
                'role_id' => $row->role_id,
                'roles' => \App\Models\Role::query()->find($row->role_id),
            ]);

            return response()->json(['data' => $rows, 'count' => $rows->count(), 'error' => null]);
        }

        $model = $this->resolveModel($table);
        $query = $model::query();

        if ($with = self::WITH[$table] ?? null) {
            $query->with($with);
        }

        $this->applyFilters($query, $filters);

        if ($request->boolean('count_only')) {
            return response()->json(['data' => null, 'count' => $query->count(), 'error' => null]);
        }

        $orderInput = $request->input('order', []);
        $order = is_string($orderInput) ? (json_decode($orderInput, true) ?? []) : $orderInput;
        if (! empty($order['column'])) {
            $query->orderBy($order['column'], ($order['ascending'] ?? true) ? 'asc' : 'desc');
        }

        $count = (clone $query)->count();
        $limit = min((int) $request->input('limit', 50), 500);
        $offset = max((int) $request->input('offset', 0), 0);

        $rows = $query->offset($offset)->limit($limit)->get();
        $this->transformRows($table, $rows);

        return response()->json(['data' => $rows, 'count' => $count, 'error' => null]);
    }

    public function show(Request $request, string $table, int $id): JsonResponse
    {
        $model = $this->resolveModel($table);
        $query = $model::query();
        if ($with = self::WITH[$table] ?? null) {
            $query->with($with);
        }
        $row = $query->find($id);
        if (! $row) {
            return response()->json(['data' => null, 'error' => ['message' => 'Not found']], 404);
        }

        return response()->json(['data' => $row, 'error' => null]);
    }

    public function store(Request $request, string $table): JsonResponse
    {
        if ($table === 'user_roles') {
            $data = $request->validate(['user_id' => 'required|integer', 'role_id' => 'required|integer']);
            DB::table('user_roles')->updateOrInsert(
                ['user_id' => $data['user_id'], 'role_id' => $data['role_id']],
                $data
            );

            return response()->json(['data' => $data, 'error' => null], 201);
        }

        $model = $this->resolveModel($table);
        $payload = $request->except(['filters', 'order', 'limit', 'offset']);
        $row = $model::query()->create($payload);

        return response()->json(['data' => $row->fresh(), 'error' => null], 201);
    }

    public function update(Request $request, string $table, int $id): JsonResponse
    {
        $model = $this->resolveModel($table);
        $row = $model::query()->findOrFail($id);
        $row->fill($request->except(['filters', 'order', 'limit', 'offset']))->save();

        return response()->json(['data' => $row->fresh(), 'error' => null]);
    }

    public function destroy(string $table, int $id): JsonResponse
    {
        $model = $this->resolveModel($table);
        $row = $model::query()->findOrFail($id);
        if (method_exists($row, 'delete')) {
            $row->delete();
        }

        return response()->json(['data' => null, 'error' => null]);
    }

    public function upsertSetting(Request $request): JsonResponse
    {
        $data = $request->validate([
            'key' => 'required|string',
            'value' => 'nullable',
        ]);
        $value = is_array($data['value']) || is_object($data['value'])
            ? json_encode($data['value'], JSON_UNESCAPED_UNICODE)
            : $data['value'];

        $row = \App\Models\Setting::query()->updateOrCreate(
            ['key' => $data['key']],
            ['value' => $value]
        );

        return response()->json(['data' => $row, 'error' => null]);
    }

    private function resolveModel(string $table): string
    {
        if (! isset(self::MODELS[$table])) {
            abort(404, "Table {$table} not allowed");
        }

        return self::MODELS[$table];
    }

    private function normalizeFilters(string $table, array $filters): array
    {
        return array_map(function ($filter) use ($table) {
            if ($table === 'profiles' && ($filter['column'] ?? '') === 'id') {
                $filter['column'] = 'user_id';
            }

            return $filter;
        }, $filters);
    }

    private function applyFilters($query, array $filters): void
    {
        foreach ($filters as $filter) {
            $col = $filter['column'] ?? null;
            $op = $filter['op'] ?? 'eq';
            $val = $filter['value'] ?? null;
            if (! $col) {
                continue;
            }

            match ($op) {
                'eq' => $query->where($col, $val),
                'neq' => $query->where($col, '!=', $val),
                'gt' => $query->where($col, '>', $val),
                'gte' => $query->where($col, '>=', $val),
                'lt' => $query->where($col, '<', $val),
                'lte' => $query->where($col, '<=', $val),
                'is' => $val === null ? $query->whereNull($col) : $query->whereNotNull($col),
                'not.is' => $val === null ? $query->whereNotNull($col) : $query->whereNull($col),
                'like' => $query->where($col, 'like', $val),
                'in' => $query->whereIn($col, (array) $val),
                default => null,
            };
        }
    }

    private function transformRows(string $table, $rows): void
    {
        if ($table === 'projects') {
            $rows->each(function ($p) {
                if ($p->relationLoaded('category') && $p->category) {
                    $p->setRelation('project_categories', $p->category);
                }
                if ($p->relationLoaded('village') && $p->village) {
                    $p->setRelation('villages', $p->village);
                }
            });
        }
        if ($table === 'volunteers') {
            $rows->each(function ($v) {
                if ($v->relationLoaded('user') && $v->user?->profile) {
                    $v->setRelation('profiles', $v->user->profile);
                }
            });
        }
        if ($table === 'team_groups') {
            $rows->each(function ($g) {
                if ($g->relationLoaded('members')) {
                    $g->setAttribute('team_members', $g->members);
                }
            });
        }
        if ($table === 'profiles') {
            $rows->each(function ($p) {
                if ($p->relationLoaded('user') && $p->user?->relationLoaded('roles')) {
                    $p->setRelation('user_roles', $p->user->roles->map(fn ($r) => [
                        'role_id' => $r->id,
                        'roles' => ['id' => $r->id, 'name' => $r->name],
                    ]));
                }
            });
        }
    }
}
