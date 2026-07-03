<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** @param array<string, 'string'|'text'|'longText'> $columns */
    private function addTe(string $table, array $columns): void
    {
        Schema::table($table, function (Blueprint $blueprint) use ($columns, $table) {
            foreach ($columns as $column => $type) {
                $te = "{$column}_te";
                if (Schema::hasColumn($table, $te)) {
                    continue;
                }
                match ($type) {
                    'longText' => $blueprint->longText($te)->nullable(),
                    'text' => $blueprint->text($te)->nullable(),
                    default => $blueprint->string($te)->nullable(),
                };
            }
        });
    }

    public function up(): void
    {
        $this->addTe('cms_pages', [
            'title' => 'string',
            'short_description' => 'text',
            'content' => 'longText',
            'seo_title' => 'string',
            'seo_description' => 'text',
        ]);

        $this->addTe('faqs', [
            'question' => 'text',
            'answer' => 'longText',
        ]);

        $this->addTe('programs', [
            'title' => 'string',
            'description' => 'longText',
            'seo_title' => 'string',
            'seo_description' => 'text',
        ]);

        $this->addTe('team_groups', [
            'name' => 'string',
            'description' => 'text',
        ]);

        $this->addTe('team_members', [
            'designation' => 'string',
            'description' => 'text',
        ]);

        $this->addTe('partners', [
            'name' => 'string',
            'description' => 'text',
        ]);

        $this->addTe('beneficiaries', [
            'name' => 'string',
            'description' => 'text',
        ]);

        $this->addTe('news', [
            'title' => 'string',
            'content' => 'longText',
            'seo_title' => 'string',
            'seo_description' => 'text',
        ]);

        $this->addTe('events', [
            'title' => 'string',
            'description' => 'text',
            'location' => 'string',
        ]);

        $this->addTe('success_stories', [
            'title' => 'string',
            'summary' => 'text',
            'content' => 'longText',
            'seo_title' => 'string',
            'seo_description' => 'text',
        ]);

        $this->addTe('villages', [
            'village_name' => 'string',
            'short_description' => 'text',
            'description' => 'longText',
            'history' => 'longText',
            'seo_title' => 'string',
            'seo_description' => 'text',
        ]);

        $this->addTe('schools', [
            'school_name' => 'string',
            'seo_title' => 'string',
            'seo_description' => 'text',
        ]);

        $this->addTe('projects', [
            'project_name' => 'string',
            'short_description' => 'text',
            'description' => 'longText',
            'objective' => 'text',
            'seo_title' => 'string',
            'seo_description' => 'text',
        ]);

        $this->addTe('project_categories', [
            'name' => 'string',
            'description' => 'text',
        ]);

        $this->addTe('galleries', [
            'title' => 'string',
        ]);

        $this->addTe('testimonials', [
            'name' => 'string',
            'content' => 'text',
            'designation' => 'string',
        ]);

        $this->addTe('activity_logs', [
            'title' => 'string',
            'description' => 'text',
        ]);

        $this->addTe('documents', [
            'title' => 'string',
        ]);
    }

    public function down(): void
    {
        $tables = [
            'cms_pages' => ['title', 'short_description', 'content', 'seo_title', 'seo_description'],
            'faqs' => ['question', 'answer'],
            'programs' => ['title', 'description', 'seo_title', 'seo_description'],
            'team_groups' => ['name', 'description'],
            'team_members' => ['designation', 'description'],
            'partners' => ['name', 'description'],
            'beneficiaries' => ['name', 'description'],
            'news' => ['title', 'content', 'seo_title', 'seo_description'],
            'events' => ['title', 'description', 'location'],
            'success_stories' => ['title', 'summary', 'content', 'seo_title', 'seo_description'],
            'villages' => ['village_name', 'short_description', 'description', 'history', 'seo_title', 'seo_description'],
            'schools' => ['school_name', 'seo_title', 'seo_description'],
            'projects' => ['project_name', 'short_description', 'description', 'objective', 'seo_title', 'seo_description'],
            'project_categories' => ['name', 'description'],
            'galleries' => ['title'],
            'testimonials' => ['name', 'content', 'designation'],
            'activity_logs' => ['title', 'description'],
            'documents' => ['title'],
        ];

        foreach ($tables as $table => $columns) {
            Schema::table($table, function (Blueprint $blueprint) use ($columns, $table) {
                foreach ($columns as $column) {
                    $te = "{$column}_te";
                    if (Schema::hasColumn($table, $te)) {
                        $blueprint->dropColumn($te);
                    }
                }
            });
        }
    }
};
