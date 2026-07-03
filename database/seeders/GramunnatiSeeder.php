<?php

namespace Database\Seeders;

use App\Models\CmsPage;
use App\Models\Faq;
use App\Models\Program;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\Role;
use App\Models\School;
use App\Models\Setting;
use App\Models\State;
use App\Models\User;
use App\Models\UserCategory;
use App\Models\Village;
use App\Models\District;
use App\Models\Mandal;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GramunnatiSeeder extends Seeder
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

        $geo = ['state_id' => $state->id, 'district_id' => $district->id, 'mandal_id' => $mandal->id];

        $village = Village::query()->firstOrCreate(
            ['slug' => 'kondapur'],
            array_merge($geo, [
                'village_name' => 'Kondapur',
                'short_description' => 'Digital classroom and water supply.',
                'cover_image' => 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
                'is_featured' => true,
                'is_active' => true,
            ])
        );

        Village::query()->firstOrCreate(
            ['slug' => 'rajapet'],
            array_merge($geo, [
                'village_name' => 'Rajapet',
                'short_description' => 'Women SHG and tree plantation.',
                'cover_image' => 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
                'is_featured' => true,
                'is_active' => true,
            ])
        );

        School::query()->firstOrCreate(
            ['slug' => 'zphs-kondapur'],
            [
                'village_id' => $village->id,
                'school_name' => 'ZPHS Kondapur',
                'school_type' => 'government',
                'student_count' => 320,
                'teacher_count' => 12,
                'cover_image' => 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
                'is_featured' => true,
                'is_active' => true,
            ]
        );

        $cat = ProjectCategory::query()->firstOrCreate(
            ['slug' => 'water-conservation'],
            ['name' => 'Water Conservation', 'icon' => '💧']
        );

        Project::query()->firstOrCreate(
            ['slug' => 'water-harvest-kondapur'],
            [
                'project_category_id' => $cat->id,
                'village_id' => $village->id,
                'project_name' => 'Water Harvest — Kondapur',
                'short_description' => 'Rainwater harvesting for farming families.',
                'budget_amount' => 250000,
                'raised_amount' => 180000,
                'status' => 'active',
                'cover_image' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
            ]
        );

        Program::query()->firstOrCreate(
            ['slug' => 'village-development'],
            ['title' => 'Village Development', 'description' => 'Rural development initiatives.', 'status' => 'active', 'sort_order' => 1, 'icon' => '🏘️']
        );

        CmsPage::query()->firstOrCreate(
            ['slug' => 'our-mission'],
            ['title' => 'Our Mission', 'status' => 'active', 'display_order' => 1, 'content' => 'Our mission is village and school development.', 'short_description' => 'Connecting people to build better villages.']
        );

        Faq::query()->firstOrCreate(
            ['question' => 'What is GramUnnati?'],
            ['answer' => 'A digital platform for village and school development.', 'sort_order' => 1, 'is_active' => true]
        );

        foreach ([
            'site_name' => 'GramUnnati',
            'site_tagline' => 'Village Development & School Empowerment Platform',
            'contact_email' => 'contact@gramunnati.in',
            'contact_phone' => '+91 98765 43210',
            'contact_address' => 'Hyderabad, Telangana, India',
            'donation_enabled' => 'true',
        ] as $key => $value) {
            Setting::query()->firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
