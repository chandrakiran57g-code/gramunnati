<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

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
        'village_crops' => \App\Models\VillageCrop::class,
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

    /** Tables readable without authentication (public site). */
    private const PUBLIC_READ_TABLES = [
        'villages', 'schools', 'projects', 'project_categories', 'project_updates',
        'programs', 'team_groups', 'team_members', 'partners', 'beneficiaries',
        'news', 'events', 'success_stories', 'galleries', 'impact_metrics',
        'activity_logs', 'testimonials', 'cms_pages', 'settings', 'faqs',
        'states', 'districts', 'mandals',
        'village_needs', 'school_requirements', 'village_crops',
        'donations', 'profiles', 'volunteers',
    ];

    /** Tables that require a signed-in member (scoped to the current user). */
    private const MEMBER_READ_TABLES = [
        'village_followers', 'school_followers', 'notifications',
        'volunteer_activities',
    ];

    /** Donation columns safe for anonymous aggregate reads (no PII). */
    private const PUBLIC_DONATION_COLUMNS = [
        'id', 'amount', 'currency', 'payment_status', 'village_id', 'school_id',
        'project_id', 'target_type', 'is_anonymous', 'donated_at', 'created_at', 'updated_at',
    ];

    /** Profile columns exposed on the public member directory. */
    private const PUBLIC_PROFILE_COLUMNS = [
        'id', 'user_id', 'full_name', 'profession', 'village_name', 'village_id',
        'state', 'district', 'mandal', 'state_id', 'district_id', 'mandal_id',
        'profile_photo', 'created_at', 'updated_at',
    ];

    /** Volunteer columns exposed on the public volunteer directory (no contact PII). */
    private const PUBLIC_VOLUNTEER_COLUMNS = [
        'id', 'volunteer_code', 'full_name', 'state', 'district', 'status',
        'photo', 'skills', 'occupation', 'created_at',
    ];

    /** CMS pages that cannot be edited or deleted from admin. */
    private const LOCKED_CMS_SLUGS = ['about-cmsr'];

    /** Per-table Laravel validation rules for admin CRUD. */
    private const TABLE_RULES = [
        'partners' => [
            'email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:20',
            'website' => 'nullable|string|max:500',
        ],
        'team_members' => [
            'email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:20',
        ],
        'volunteers' => [
            'email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:20',
        ],
        'schools' => [
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:500',
            'contact_number' => 'nullable|string|max:20',
        ],
        'events' => [
            'registration_link' => 'nullable|string|max:500',
        ],
        'profiles' => [
            'email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:20',
        ],
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

        if ($table === 'village_crops') {
            $this->enforcePublicReadAccess($request, $table, $filters);

            $query = DB::table('village_crops');
            foreach ($filters as $filter) {
                if (($filter['column'] ?? '') && ($filter['op'] ?? '') === 'eq') {
                    $query->where($filter['column'], $filter['value']);
                }
            }

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

            return response()->json(['data' => $rows, 'count' => $count, 'error' => null]);
        }

        if ($table === 'user_roles') {
            if (! $this->isPrivilegedRequest($request)) {
                abort(403, 'Table not allowed');
            }

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

        $this->enforcePublicReadAccess($request, $table, $filters);

        $model = $this->resolveModel($table);
        $query = $model::query();

        // Never expose payment secrets / bank details outside the admin API.
        if ($table === 'settings' && ! $this->isPrivilegedRequest($request)) {
            $query->whereNotIn('key', ['rzp_key', 'rzp_secret', 'bank_name', 'bank_account', 'ifsc']);
        }

        // The admin account is the platform founder, not a member — hide it
        // from directory listings (/members and the admin Member List mirror).
        // Specific profile fetches (id / user_id filter) are unaffected.
        if ($table === 'profiles' && ! $this->isAdminDbRequest($request) && ! $this->filtersTargetSpecificUser($filters)) {
            $query->whereNotIn('user_id', function ($sub) {
                $sub->select('user_roles.user_id')
                    ->from('user_roles')
                    ->join('roles', 'roles.id', '=', 'user_roles.role_id')
                    ->whereIn('roles.name', ['Super Admin', 'SuperAdmin']);
            });
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
        $rows = $this->stripSensitiveReadColumns($request, $table, $filters, $rows);

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
            $payload = $this->validateTablePayload($table, $payload);

            if ($table === 'cms_pages' && in_array($payload['slug'] ?? '', self::LOCKED_CMS_SLUGS, true)) {
                throw ValidationException::withMessages([
                    'slug' => 'This slug is reserved for the system About CMSR page.',
                ]);
            }

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
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            return response()->json(['data' => null, 'error' => ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]], 500);
        }
    }

    public function update(Request $request, string $table, int $id): JsonResponse
    {
        try {
            $model = $this->resolveModel($table);
            $row = $model::query()->findOrFail($id);

            if ($table === 'cms_pages' && in_array($row->slug, self::LOCKED_CMS_SLUGS, true)) {
                throw ValidationException::withMessages([
                    'slug' => 'This page is managed by the system and cannot be edited.',
                ]);
            }

            $payload = $this->columnsOnly($table, $request->except(['filters', 'order', 'limit', 'offset']));
            $payload = $this->validateTablePayload($table, $payload);
            $row->fill($payload)->save();

            $row = $row->fresh();
            $freshWith = self::WITH[$table] ?? [];
            if (! empty($freshWith)) {
                $row->load($freshWith);
            }
            $this->transformRows($table, collect([$row]));

            return response()->json(['data' => $row, 'error' => null]);
        } catch (ValidationException $e) {
            throw $e;
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

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function validateTablePayload(string $table, array $payload): array
    {
        $rules = self::TABLE_RULES[$table] ?? [];
        if (empty($rules)) {
            return $payload;
        }

        $applicable = array_intersect_key($rules, $payload);
        if (empty($applicable)) {
            return $payload;
        }

        $validator = Validator::make($payload, $applicable);

        $validator->after(function ($v) use ($payload) {
            foreach (['mobile', 'contact_number'] as $field) {
                if (empty($payload[$field])) {
                    continue;
                }
                $digits = preg_replace('/\D/', '', (string) $payload[$field]);
                if ($digits && ! preg_match('/^[6-9]\d{9}$/', $digits)) {
                    $v->errors()->add($field, 'Enter a valid 10-digit Indian mobile number.');
                }
            }
            foreach (['website', 'registration_link'] as $field) {
                if (empty($payload[$field])) {
                    continue;
                }
                $url = (string) $payload[$field];
                if (! filter_var($url, FILTER_VALIDATE_URL) && ! filter_var("https://{$url}", FILTER_VALIDATE_URL)) {
                    $v->errors()->add($field, 'Enter a valid URL.');
                }
            }
        });

        if ($validator->fails()) {
            throw new ValidationException($validator);
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
        try {
            $model = $this->resolveModel($table);
            $row = $model::query()->findOrFail($id);

            if ($table === 'cms_pages' && in_array($row->slug, self::LOCKED_CMS_SLUGS, true)) {
                throw ValidationException::withMessages([
                    'slug' => 'This page is managed by the system and cannot be deleted.',
                ]);
            }

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
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            return response()->json(['data' => null, 'error' => ['message' => $e->getMessage()]], 500);
        }
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

    private function isAdminDbRequest(Request $request): bool
    {
        return str_contains($request->path(), 'admin/db');
    }

    private ?bool $privilegedRequest = null;

    /**
     * True for /admin/db requests AND for signed-in Super Admins hitting the
     * public /db path (admin pages read through the shared shim, which always
     * uses /db for reads).
     */
    private function isPrivilegedRequest(Request $request): bool
    {
        if ($this->privilegedRequest !== null) {
            return $this->privilegedRequest;
        }

        if ($this->isAdminDbRequest($request)) {
            return $this->privilegedRequest = true;
        }

        $user = $request->user() ?: $request->user('sanctum');

        return $this->privilegedRequest = (bool) ($user && $user->roles()
            ->whereIn('name', ['Super Admin', 'SuperAdmin'])
            ->exists());
    }

    /**
     * @param  array<int, array<string, mixed>>  $filters
     */
    private function enforcePublicReadAccess(Request $request, string $table, array &$filters): void
    {
        if ($this->isPrivilegedRequest($request)) {
            return;
        }

        if ($table === 'user_roles') {
            abort(403, 'Table not allowed');
        }

        $user = $request->user();
        $allowed = self::PUBLIC_READ_TABLES;

        if ($user) {
            $allowed = array_merge($allowed, self::MEMBER_READ_TABLES);
        }

        if (! in_array($table, $allowed, true)) {
            abort($user ? 403 : 401, $user ? 'Table not allowed' : 'Authentication required');
        }

        if ($user) {
            $this->enforceMemberScope($table, $filters, $user);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $filters
     */
    private function enforceMemberScope(string $table, array &$filters, \App\Models\User $user): void
    {
        $scopedTables = [
            'village_followers' => 'user_id',
            'school_followers' => 'user_id',
            'notifications' => 'user_id',
        ];

        if (! isset($scopedTables[$table])) {
            return;
        }

        $column = $scopedTables[$table];
        $filters = array_values(array_filter(
            $filters,
            fn ($filter) => ! (($filter['column'] ?? '') === $column && ($filter['op'] ?? '') === 'eq')
        ));
        $filters[] = ['column' => $column, 'op' => 'eq', 'value' => $user->id];
    }

    /**
     * @param  array<int, array<string, mixed>>  $filters
     */
    private function stripSensitiveReadColumns(Request $request, string $table, array $filters, $rows)
    {
        if ($this->isPrivilegedRequest($request)) {
            return $rows;
        }

        $user = $request->user();

        if ($table === 'donations' && ! $this->filtersScopeToUserDonations($filters, $user)) {
            return $rows->map(fn ($row) => collect($row->toArray())->only(self::PUBLIC_DONATION_COLUMNS)->all());
        }

        if ($table === 'profiles' && ! $this->filtersScopeToOwnProfile($filters, $user)) {
            return $rows->map(fn ($row) => collect($row->toArray())->only(self::PUBLIC_PROFILE_COLUMNS)->all());
        }

        // Volunteer directory is public, but email/mobile stay private unless
        // the signed-in member is reading their own volunteer record.
        if ($table === 'volunteers' && ! $this->filtersScopeToOwnUserId($filters, $user)) {
            return $rows->map(fn ($row) => collect($row->toArray())->only(self::PUBLIC_VOLUNTEER_COLUMNS)->all());
        }

        return $rows;
    }

    /**
     * @param  array<int, array<string, mixed>>  $filters
     */
    private function filtersScopeToUserDonations(array $filters, ?\App\Models\User $user): bool
    {
        if (! $user) {
            return false;
        }

        foreach ($filters as $filter) {
            if (($filter['op'] ?? '') !== 'eq') {
                continue;
            }
            if (($filter['column'] ?? '') === 'user_id' && (int) ($filter['value'] ?? 0) === (int) $user->id) {
                return true;
            }
            if (($filter['column'] ?? '') === 'email'
                && strtolower((string) ($filter['value'] ?? '')) === strtolower((string) $user->email)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<int, array<string, mixed>>  $filters
     */
    private function filtersScopeToOwnUserId(array $filters, ?\App\Models\User $user): bool
    {
        if (! $user) {
            return false;
        }

        foreach ($filters as $filter) {
            if (($filter['op'] ?? '') === 'eq'
                && ($filter['column'] ?? '') === 'user_id'
                && (int) ($filter['value'] ?? 0) === (int) $user->id) {
                return true;
            }
        }

        return false;
    }

    /**
     * True when the query targets specific user rows (own-profile lookups,
     * role management) rather than the whole member directory.
     *
     * @param  array<int, array<string, mixed>>  $filters
     */
    private function filtersTargetSpecificUser(array $filters): bool
    {
        foreach ($filters as $filter) {
            if (in_array($filter['column'] ?? '', ['id', 'user_id', 'email'], true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<int, array<string, mixed>>  $filters
     */
    private function filtersScopeToOwnProfile(array $filters, ?\App\Models\User $user): bool
    {
        if (! $user) {
            return false;
        }

        foreach ($filters as $filter) {
            if (($filter['op'] ?? '') !== 'eq') {
                continue;
            }
            if (in_array($filter['column'] ?? '', ['id', 'user_id'], true)
                && (int) ($filter['value'] ?? 0) === (int) $user->id) {
                return true;
            }
        }

        return false;
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
