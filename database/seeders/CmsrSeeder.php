<?php

namespace Database\Seeders;

use App\Models\CmsPage;
use App\Models\Faq;
use App\Models\Program;
use App\Models\ProjectCategory;
use App\Models\Role;
use App\Models\Setting;
use App\Models\State;
use App\Models\TeamGroup;
use App\Models\User;
use App\Models\UserCategory;
use App\Models\District;
use App\Models\Mandal;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CmsrSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['Super Admin', 'Full access'],
            ['Member', 'Default member'],
        ] as [$name, $desc]) {
            Role::query()->firstOrCreate(['name' => $name, 'guard_name' => 'web'], ['description' => $desc]);
        }

        UserCategory::query()->firstOrCreate(['slug' => 'citizen'], ['name' => 'Citizen']);

        $admin = User::query()->firstOrCreate(
            ['email' => 'test@gmail.com'],
            ['name' => 'Admin', 'password' => Hash::make('testadmin123')]
        );
        $admin->profile()->updateOrCreate(
            ['user_id' => $admin->id],
            ['full_name' => 'Admin', 'email' => 'test@gmail.com', 'is_active' => true]
        );
        $adminRole = Role::query()->where('name', 'Super Admin')->first();
        if ($adminRole) {
            $admin->roles()->syncWithoutDetaching([$adminRole->id]);
        }

        $state = State::query()->firstOrCreate(['code' => 'TS'], ['name' => 'Telangana', 'is_active' => true]);
        $district = District::query()->firstOrCreate(
            ['state_id' => $state->id, 'name' => 'Hyderabad'],
            ['code' => 'HYD', 'is_active' => true]
        );
        $mandal = Mandal::query()->firstOrCreate(
            ['district_id' => $district->id, 'name' => 'Ameerpet'],
            ['code' => 'AMP', 'is_active' => true]
        );

        // Structural project categories only — no demo villages, schools,
        // projects, volunteers, or donations. Real content is created in the admin panel.
        ProjectCategory::query()->firstOrCreate(
            ['slug' => 'water-conservation'],
            ['name' => 'Water Conservation', 'icon' => '💧']
        );
        ProjectCategory::query()->firstOrCreate(
            ['slug' => 'school-development'],
            ['name' => 'School Development', 'icon' => '🏫']
        );
        ProjectCategory::query()->firstOrCreate(
            ['slug' => 'tree-plantation'],
            ['name' => 'Tree Plantation', 'icon' => '🌳']
        );

        $programs = [
            ['slug' => 'village-development', 'title' => 'Village Development', 'description' => 'Comprehensive rural development initiatives focusing on infrastructure, governance, and community empowerment.', 'icon' => '🏘️', 'sort_order' => 1],
            ['slug' => 'school-empowerment', 'title' => 'School Empowerment', 'description' => 'Transforming rural schools through digital classrooms, infrastructure upgrades, and teacher training.', 'icon' => '🏫', 'sort_order' => 2],
            ['slug' => 'tree-plantation', 'title' => 'Tree Plantation', 'description' => 'Large-scale afforestation drives planting native species and fruit orchards across villages.', 'icon' => '🌳', 'sort_order' => 3],
            ['slug' => 'water-conservation', 'title' => 'Water Conservation', 'description' => 'Building check dams, rainwater harvesting systems, and rejuvenating traditional water bodies.', 'icon' => '💧', 'sort_order' => 4],
            ['slug' => 'agriculture-development', 'title' => 'Agriculture Development', 'description' => 'Supporting farmers with modern techniques, organic farming, and market linkages.', 'icon' => '🌾', 'sort_order' => 5],
            ['slug' => 'women-shgs', 'title' => 'Women SHGs', 'description' => 'Empowering rural women through Self-Help Groups and entrepreneurship programs.', 'icon' => '👩', 'sort_order' => 6],
            ['slug' => 'skill-development', 'title' => 'Skill Development', 'description' => 'Youth-focused skill training in IT, trades, and entrepreneurship.', 'icon' => '🎓', 'sort_order' => 7],
            ['slug' => 'healthcare', 'title' => 'Healthcare', 'description' => 'Improving rural healthcare through medical camps and health awareness drives.', 'icon' => '🏥', 'sort_order' => 8],
        ];

        foreach ($programs as $prog) {
            Program::query()->firstOrCreate(
                ['slug' => $prog['slug']],
                array_merge($prog, ['status' => 'active'])
            );
        }

        $cmsPages = [
            ['slug' => 'about-cmsr', 'title' => 'About CMSR', 'short_description' => 'About our mission to empower villages and schools across India.', 'content' => 'As responsible citizens, we all have a social responsibility towards our communities. Through CMSR, citizens voluntarily come together to support village development and school empowerment across India.', 'display_order' => 1, 'page_type' => 'general'],
            ['slug' => 'our-vision', 'title' => 'Our Vision', 'short_description' => 'Our Village – Our Responsibility – Our Development', 'content' => 'By uniting citizens, communities, and institutions on a common platform, we create sustainable, self-reliant model villages and schools.', 'display_order' => 2, 'page_type' => 'general'],
            ['slug' => 'our-mission', 'title' => 'Our Mission', 'short_description' => 'Connecting people to build better villages and schools.', 'content' => 'Our mission is to create a nationwide digital platform that connects villagers, donors, volunteers, and organizations.', 'display_order' => 3, 'page_type' => 'general'],
            ['slug' => 'about-villages', 'title' => 'About Villages', 'short_description' => 'Understanding the village development program.', 'content' => 'The village module allows communities to create digital profiles, track development needs, and receive donations.', 'display_order' => 4, 'page_type' => 'about_villages'],
            ['slug' => 'about-schools', 'title' => 'About Schools', 'short_description' => 'How we empower rural schools.', 'content' => 'Our school empowerment program focuses on infrastructure, digital classrooms, and connecting schools with donors.', 'display_order' => 5, 'page_type' => 'about_schools'],
            ['slug' => 'about-volunteers', 'title' => 'About Volunteers', 'short_description' => 'Join our volunteer network.', 'content' => 'Volunteers are the backbone of CMSR. Register on the Volunteer page to be matched with relevant projects.', 'display_order' => 6, 'page_type' => 'about_volunteers'],
            ['slug' => 'about-donations', 'title' => 'About Donations', 'short_description' => 'How your donations make an impact.', 'content' => 'Every donation is tracked transparently. Donate to a village, school, or project and see your impact.', 'display_order' => 7, 'page_type' => 'general'],
        ];

        $navGroups = [];
        foreach ($cmsPages as $page) {
            $row = CmsPage::query()->firstOrCreate(
                ['slug' => $page['slug']],
                array_merge($page, ['status' => 'active'])
            );
            $navGroups[(string) $row->id] = 'about_us';
        }

        $teams = [
            ['slug' => 'core-team', 'name' => 'Core Team', 'description' => 'The founding and leadership team driving CMSR forward.', 'display_order' => 1],
            ['slug' => 'advisory-board', 'name' => 'Advisory Board', 'description' => 'Distinguished experts guiding our strategy and governance.', 'display_order' => 2],
            ['slug' => 'technical-team', 'name' => 'Technical Team', 'description' => 'Engineers and developers building the platform.', 'display_order' => 3],
            ['slug' => 'village-coordinators', 'name' => 'Village Coordinators', 'description' => 'Field coordinators working directly with villages.', 'display_order' => 4],
            ['slug' => 'school-coordinators', 'name' => 'School Coordinators', 'description' => 'Coordinators managing school empowerment programs.', 'display_order' => 5],
        ];

        foreach ($teams as $team) {
            TeamGroup::query()->firstOrCreate(
                ['slug' => $team['slug']],
                array_merge($team, ['status' => 'active'])
            );
        }

        Faq::query()->firstOrCreate(
            ['question' => 'What is CMSR?'],
            ['answer' => 'CMSR (Common Man Social Responsibility) is a nationwide platform connecting citizens to village and school development.', 'sort_order' => 1, 'is_active' => true]
        );

        Faq::query()->firstOrCreate(
            ['question' => 'How do I become a volunteer?'],
            ['answer' => 'Visit the Volunteer page, fill in the registration form with your skills and availability. Our team will review and contact you.', 'sort_order' => 4, 'is_active' => true]
        );

        $navConfig = [
            'items' => [
                ['key' => 'about-us', 'label' => 'About Us', 'type' => 'dropdown', 'enabled' => true, 'order' => 0, 'source' => 'cms', 'navGroup' => 'about_us'],
                ['key' => 'teams', 'label' => 'Teams', 'type' => 'dropdown', 'enabled' => true, 'order' => 1, 'source' => 'team_groups'],
                ['key' => 'what-we-do', 'label' => 'What We Do', 'type' => 'dropdown', 'enabled' => true, 'order' => 2, 'source' => 'programs'],
                ['key' => 'member-list', 'label' => 'Member List', 'type' => 'link', 'enabled' => true, 'order' => 3, 'path' => '/members'],
                ['key' => 'partners', 'label' => 'Partner Organizations', 'type' => 'link', 'enabled' => true, 'order' => 4, 'path' => '/partners'],
                ['key' => 'gallery', 'label' => 'Gallery', 'type' => 'link', 'enabled' => true, 'order' => 5, 'path' => '/gallery'],
                ['key' => 'contact', 'label' => 'Contact Us', 'type' => 'link', 'enabled' => true, 'order' => 6, 'path' => '/contact'],
            ],
        ];

        foreach ([
            'site_name' => 'CMSR',
            'site_tagline' => 'Common Man Social Responsibility',
            'contact_email' => 'contact@cmsr.in',
            'contact_phone' => '+91 98765 43210',
            'contact_address' => 'Hyderabad, Telangana, India',
            'donation_enabled' => 'true',
            'nav_config' => json_encode($navConfig),
            'cms_nav_groups' => json_encode($navGroups),
        ] as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
