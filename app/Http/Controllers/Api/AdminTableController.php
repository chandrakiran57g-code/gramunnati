<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
        'donation_receipts' => ['donation:id,amount,donor_name,payment_status,created_at,email'],
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

        // Never expose payment secrets / bank details to unauthenticated callers.
        if ($table === 'settings' && ! $request->user()) {
            $query->whereNotIn('key', ['rzp_key', 'rzp_secret', 'bank_name', 'bank_account', 'ifsc']);
        }

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
        try {
            $model = $this->resolveModel($table);
            $query = $model::query();
            if ($with = self::WITH[$table] ?? null) {
                $query->with($with);
            }
            $row = $query->find($id);
            if (! $row) {
                return response()->json(['data' => null, 'error' => ['message' => 'Not found']], 404);
            }
            $this->transformRows($table, collect([$row]));

            return response()->json(['data' => $row, 'error' => null]);
        } catch (\Throwable $e) {
            return response()->json(['data' => null, 'error' => ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]], 500);
        }
    }

    public function store(Request $request, string $table): JsonResponse
    {
        try {
            if ($table === 'user_roles') {
                $data = $request->validate(['user_id' => 'required|integer', 'role_id' => 'required|integer']);
                DB::table('user_roles')->updateOrInsert(
                    ['user_id' => $data['user_id'], 'role_id' => $data['role_id']],
                    $data
                );

                return response()->json(['data' => $data, 'error' => null], 201);
            }

            $model = $this->resolveModel($table);
            $payload = $this->columnsOnly($table, $request->except(['filters', 'order', 'limit', 'offset']));

            // Slugs must be unique even against soft-deleted rows — append -2, -3, …
            // instead of crashing with a duplicate-key error.
            if (! empty($payload['slug']) && Schema::hasColumn($table, 'slug')) {
                $payload['slug'] = $this->uniqueSlug($table, (string) $payload['slug']);
            }

            $row = $model::query()->create($payload);

            if ($table === 'donations' && ($row->payment_status ?? '') === 'success') {
                $number = $row->receipt_number ?: ('RCP-'.now()->format('Y').'-'.str_pad((string) $row->id, 5, '0', STR_PAD_LEFT));
                if (! $row->receipt_number) {
                    $row->update(['receipt_number' => $number]);
                }
                \App\Models\DonationReceipt::query()->firstOrCreate(
                    ['donation_id' => $row->id],
                    ['receipt_number' => $number]
                );
                $row = $row->fresh(['receipts']);
            }

            $row = $row->fresh();
            $freshWith = self::WITH[$table] ?? [];
            if (! empty($freshWith)) {
                $row->load($freshWith);
            }
            $this->transformRows($table, collect([$row]));

            return response()->json(['data' => $row, 'error' => null], 201);
        } catch (\Throwable $e) {
            return response()->json(['data' => null, 'error' => ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]], 500);
        }
    }

    public function update(Request $request, string $table, int $id): JsonResponse
    {
        try {
            $model = $this->resolveModel($table);
            $row = $model::query()->findOrFail($id);
            $payload = $this->columnsOnly($table, $request->except(['filters', 'order', 'limit', 'offset']));
            $row->fill($payload)->save();

            $row = $row->fresh();
            $freshWith = self::WITH[$table] ?? [];
            if (! empty($freshWith)) {
                $row->load($freshWith);
            }
            $this->transformRows($table, collect([$row]));

            return response()->json(['data' => $row, 'error' => null]);
        } catch (\Throwable $e) {
            return response()->json(['data' => null, 'error' => ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]], 500);
        }
    }

    /**
     * Keep only keys that are real columns on the table so admin forms with
     * extra/UI-only fields never crash with "Unknown column".
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function columnsOnly(string $table, array $payload): array
    {
        $columns = Schema::getColumnListing($table);
        if (! empty($columns)) {
            $payload = array_intersect_key($payload, array_flip($columns));
        }

        // JS clients send ISO 8601 dates (2026-07-06T17:00:00.000Z) which MySQL
        // rejects for timestamp columns — normalize them to Y-m-d H:i:s.
        foreach ($payload as $key => $value) {
            $payload[$key] = $this->normalizeDateValue($value);
        }

        return $payload;
    }

    private function uniqueSlug(string $table, string $slug): string
    {
        $exists = fn (string $candidate) => DB::table($table)->where('slug', $candidate)->exists();
        if (! $exists($slug)) {
            return $slug;
        }
        for ($i = 2; $i <= 100; $i++) {
            if (! $exists("{$slug}-{$i}")) {
                return "{$slug}-{$i}";
            }
        }

        return $slug.'-'.now()->timestamp;
    }

    /** Convert ISO 8601 datetime strings (with T/Z) to MySQL-friendly Y-m-d H:i:s. */
    private function normalizeDateValue(mixed $value): mixed
    {
        if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/', $value)) {
            try {
                return Carbon::parse($value)->format('Y-m-d H:i:s');
            } catch (\Throwable) {
                return $value;
            }
        }

        return $value;
    }

    public function destroy(string $table, int $id): JsonResponse
    {
        $model = $this->resolveModel($table);
        $row = $model::query()->findOrFail($id);

        $user = $table === 'profiles' ? $row->user : null;

        // Deleting a profile cascade-deletes its user account. Never allow that
        // for admin accounts — it would lock everyone out of /admin.
        if ($user && $user->roles()->whereIn('name', ['Super Admin', 'SuperAdmin'])->exists()) {
            return response()->json([
                'message' => 'Admin accounts cannot be deleted from the member list.',
                'data' => null,
                'error' => ['message' => 'Admin accounts cannot be deleted from the member list.'],
            ], 422);
        }

        if ($table === 'donations' && method_exists($row, 'receipts')) {
            $row->receipts()->delete();
        }

        $row->delete();

        if ($user) {
            try {
                $user->delete();
            } catch (\Throwable) {
                // User row may be referenced elsewhere (donations, etc.) — profile removal is enough
            }
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
            $val = $this->normalizeDateValue($val);

            // Treat "null" string (from JSON query params) the same as PHP null.
            $isNull = $val === null || $val === 'null';

            match ($op) {
                'eq' => $query->where($col, $val),
                'neq' => $query->where($col, '!=', $val),
                'gt' => $query->where($col, '>', $val),
                'gte' => $query->where($col, '>=', $val),
                'lt' => $query->where($col, '<', $val),
                'lte' => $query->where($col, '<=', $val),
                'is' => $isNull ? $query->whereNull($col) : $query->whereNotNull($col),
                'not.is' => $isNull ? $query->whereNotNull($col) : $query->whereNull($col),
                'like' => $query->where($col, 'like', $val),
                'in' => $query->whereIn($col, (array) $val),
                default => null,
            };
        }
    }

    private function transformRows(string $table, $rows): void
    {
        // ── Flatten geo relations to plain strings ──────────────────────
        // IMPORTANT: Laravel's toArray() does array_merge(attributes, relations).
        // Loaded relations OVERRIDE attributes with the same key.
        // We MUST call unsetRelation() after extracting the name, otherwise
        // the JSON output still contains the {id, name} object.
        $flattenGeo = static function ($row) {
            foreach (['state', 'district', 'mandal'] as $rel) {
                if ($row->relationLoaded($rel) && $row->{$rel}) {
                    $obj = $row->getRelation($rel);
                    $name = $obj->name ?? null;
                    // Copy to plural alias FIRST (states, districts, mandals)
                    // so old code using the plural key still works.
                    $row->setRelation("{$rel}s", $obj);
                    // Remove the singular relation so it won't override the string attribute
                    $row->unsetRelation($rel);
                    // Set the singular key as a plain string
                    $row->setAttribute($rel, $name);
                }
            }
        };

        // Apply geo flattening to ALL tables that have state/district/mandal relations
        if (in_array($table, ['villages', 'schools', 'profiles'], true)) {
            $rows->each($flattenGeo);
        }

        if ($table === 'projects') {
            $rows->each(function ($p) {
                if ($p->relationLoaded('category') && $p->category) {
                    $p->setRelation('project_categories', $p->category);
                }
                if ($p->relationLoaded('village') && $p->village) {
                    $village = $p->village;
                    $p->setRelation('villages', $village);
                    $p->setAttribute('village_name', $village->village_name);
                    $p->setAttribute('state', $village->state?->name ?? $village->state);
                    $p->setAttribute('district', $village->district?->name ?? $village->district);
                }
            });
        }
        if ($table === 'schools') {
            $rows->each(function ($s) {
                if ($s->relationLoaded('village') && $s->village) {
                    $village = $s->village;
                    $s->setRelation('villages', $village);
                    $s->setAttribute('village_name', $village->village_name);
                    foreach (['state', 'district', 'mandal'] as $rel) {
                        if ($village->relationLoaded($rel) && $village->{$rel}) {
                            $village->setRelation("{$rel}s", $village->getRelation($rel));
                        }
                    }
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
        if ($table === 'donations') {
            $rows->each(function ($d) {
                if ($d->relationLoaded('village') && $d->village) {
                    $d->setRelation('villages', $d->village);
                    $d->setAttribute('village_name', $d->village->village_name);
                }
                if ($d->relationLoaded('school') && $d->school) {
                    $d->setRelation('schools', $d->school);
                    $d->setAttribute('school_name', $d->school->school_name);
                }
                if ($d->relationLoaded('project') && $d->project) {
                    $d->setRelation('projects', $d->project);
                    $d->setAttribute('project_name', $d->project->project_name);
                }
            });
        }
        if ($table === 'donation_receipts') {
            $rows->each(function ($r) {
                if ($r->relationLoaded('donation') && $r->donation) {
                    $r->setAttribute('donations', $r->donation);
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
                if ($p->relationLoaded('village') && $p->village) {
                    $p->setAttribute('village_name', $p->village->village_name);
                    $p->unsetRelation('village');
                }
            });
        }
    }
}
