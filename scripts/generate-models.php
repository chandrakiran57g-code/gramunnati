<?php

$modelsDir = dirname(__DIR__).'/app/Models';

$definitions = [
    'Profile' => ['table' => 'profiles', 'soft' => false, 'methods' => [
        'profile' => null,
        'state' => 'belongsTo(State::class)',
        'district' => 'belongsTo(District::class)',
        'mandal' => 'belongsTo(Mandal::class)',
        'village' => 'belongsTo(Village::class)',
    ]],
    'Role' => ['table' => 'roles', 'methods' => [
        'users' => "belongsToMany(User::class, 'user_roles')",
    ]],
    'UserCategory' => ['table' => 'user_categories', 'methods' => [
        'users' => "belongsToMany(User::class, 'user_category_user', 'category_id', 'user_id')",
    ]],
    'State' => ['table' => 'states', 'methods' => ['districts' => 'hasMany(District::class)']],
    'District' => ['table' => 'districts', 'methods' => [
        'state' => 'belongsTo(State::class)',
        'mandals' => 'hasMany(Mandal::class)',
    ]],
    'Mandal' => ['table' => 'mandals', 'methods' => ['district' => 'belongsTo(District::class)']],
    'Setting' => ['table' => 'settings', 'methods' => []],
    'CmsPage' => ['table' => 'cms_pages', 'methods' => []],
    'Faq' => ['table' => 'faqs', 'methods' => []],
    'Village' => ['table' => 'villages', 'soft' => true, 'methods' => [
        'state' => 'belongsTo(State::class)',
        'district' => 'belongsTo(District::class)',
        'mandal' => 'belongsTo(Mandal::class)',
        'schools' => 'hasMany(School::class)',
        'projects' => 'hasMany(Project::class)',
        'needs' => 'hasMany(VillageNeed::class)',
    ]],
    'School' => ['table' => 'schools', 'soft' => true, 'methods' => [
        'village' => 'belongsTo(Village::class)',
        'projects' => 'hasMany(Project::class)',
        'requirements' => 'hasMany(SchoolRequirement::class)',
    ]],
    'ProjectCategory' => ['table' => 'project_categories', 'methods' => ['projects' => 'hasMany(Project::class)']],
    'Project' => ['table' => 'projects', 'soft' => true, 'methods' => [
        'category' => 'belongsTo(ProjectCategory::class, \'project_category_id\')',
        'village' => 'belongsTo(Village::class)',
        'school' => 'belongsTo(School::class)',
        'updates' => 'hasMany(ProjectUpdate::class)',
    ]],
    'ProjectUpdate' => ['table' => 'project_updates', 'methods' => ['project' => 'belongsTo(Project::class)']],
    'Program' => ['table' => 'programs', 'methods' => []],
    'TeamGroup' => ['table' => 'team_groups', 'methods' => ['members' => 'hasMany(TeamMember::class)']],
    'TeamMember' => ['table' => 'team_members', 'methods' => ['teamGroup' => 'belongsTo(TeamGroup::class)']],
    'Partner' => ['table' => 'partners', 'methods' => []],
    'Beneficiary' => ['table' => 'beneficiaries', 'methods' => [
        'village' => 'belongsTo(Village::class)',
        'school' => 'belongsTo(School::class)',
    ]],
    'News' => ['table' => 'news', 'soft' => true, 'methods' => []],
    'Event' => ['table' => 'events', 'soft' => true, 'methods' => []],
    'SuccessStory' => ['table' => 'success_stories', 'soft' => true, 'methods' => [
        'village' => 'belongsTo(Village::class)',
        'school' => 'belongsTo(School::class)',
    ]],
    'Gallery' => ['table' => 'galleries', 'methods' => []],
    'ImpactMetric' => ['table' => 'impact_metrics', 'methods' => []],
    'ActivityLog' => ['table' => 'activity_logs', 'methods' => []],
    'Testimonial' => ['table' => 'testimonials', 'methods' => []],
    'Document' => ['table' => 'documents', 'methods' => []],
    'ContactMessage' => ['table' => 'contact_messages', 'methods' => []],
    'Donation' => ['table' => 'donations', 'methods' => [
        'user' => 'belongsTo(User::class)',
        'village' => 'belongsTo(Village::class)',
        'school' => 'belongsTo(School::class)',
        'project' => 'belongsTo(Project::class)',
        'receipts' => 'hasMany(DonationReceipt::class)',
    ]],
    'DonationReceipt' => ['table' => 'donation_receipts', 'methods' => ['donation' => 'belongsTo(Donation::class)']],
    'Volunteer' => ['table' => 'volunteers', 'methods' => [
        'user' => 'belongsTo(User::class)',
        'activities' => 'hasMany(VolunteerActivity::class)',
    ]],
    'VolunteerActivity' => ['table' => 'volunteer_activities', 'methods' => [
        'volunteer' => 'belongsTo(Volunteer::class)',
        'project' => 'belongsTo(Project::class)',
    ]],
    'VillageNeed' => ['table' => 'village_needs', 'methods' => ['village' => 'belongsTo(Village::class)']],
    'SchoolRequirement' => ['table' => 'school_requirements', 'methods' => ['school' => 'belongsTo(School::class)']],
    'VillageFollower' => ['table' => 'village_followers', 'timestamps' => false, 'methods' => [
        'village' => 'belongsTo(Village::class)',
        'user' => 'belongsTo(User::class)',
    ]],
    'SchoolFollower' => ['table' => 'school_followers', 'timestamps' => false, 'methods' => [
        'school' => 'belongsTo(School::class)',
        'user' => 'belongsTo(User::class)',
    ]],
    'Notification' => ['table' => 'notifications', 'methods' => ['user' => 'belongsTo(User::class)']],
    'AuditLog' => ['table' => 'audit_logs', 'timestamps' => false, 'methods' => ['user' => 'belongsTo(User::class)']],
];

foreach ($definitions as $class => $def) {
    $uses = ['Illuminate\Database\Eloquent\Model', 'Illuminate\Database\Eloquent\Relations\\BelongsTo', 'Illuminate\Database\Eloquent\Relations\\BelongsToMany', 'Illuminate\Database\Eloquent\Relations\\HasMany'];
    if ($def['soft'] ?? false) {
        $uses[] = 'Illuminate\Database\Eloquent\SoftDeletes';
    }

    $useBlock = implode("\n", array_map(fn ($u) => "use {$u};", array_unique($uses)));
    $traits = ($def['soft'] ?? false) ? "    use SoftDeletes;\n\n" : '';
    $ts = ($def['timestamps'] ?? true) ? '' : "    public \$timestamps = false;\n\n";
    $audit = $class === 'AuditLog' ? "    const UPDATED_AT = null;\n\n" : '';

    $methods = '';
    foreach ($def['methods'] as $name => $expr) {
        if ($name === 'profile') {
            $methods .= "    public function user(): BelongsTo\n    {\n        return \$this->belongsTo(User::class);\n    }\n\n";
            continue;
        }
        $methods .= "    public function {$name}(): ".(str_starts_with($expr, 'hasMany') ? 'HasMany' : (str_starts_with($expr, 'belongsToMany') ? 'BelongsToMany' : 'BelongsTo'))."\n    {\n        return \$this->{$expr};\n    }\n\n";
    }

    $content = <<<PHP
<?php

namespace App\Models;

{$useBlock}

class {$class} extends Model
{
{$traits}{$ts}{$audit}    protected \$table = '{$def['table']}';

    protected \$guarded = ['id'];

{$methods}}
PHP;

    file_put_contents("{$modelsDir}/{$class}.php", $content);
    echo "Wrote {$class}.php\n";
}

echo "Done.\n";
