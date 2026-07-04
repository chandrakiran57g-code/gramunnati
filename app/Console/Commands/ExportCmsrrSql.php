<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class ExportCmsrrSql extends Command
{
    protected $signature = 'cmsr:export-sql {--path=database/cmsrr.sql}';

    protected $description = 'Export MySQL-compatible cmsrr.sql from the connected database (local or cPanel)';

    /** Tables exported in dependency-safe order */
    private array $tables = [
        'users', 'profiles', 'roles', 'user_roles', 'user_categories', 'user_category_user',
        'personal_access_tokens', 'password_reset_tokens', 'sessions',
        'states', 'districts', 'mandals',
        'settings', 'cms_pages', 'faqs',
        'villages', 'schools', 'project_categories', 'projects',
        'programs', 'team_groups', 'team_members', 'partners', 'beneficiaries',
        'news', 'events', 'success_stories', 'galleries', 'impact_metrics',
        'activity_logs', 'documents', 'testimonials',
        'donations', 'volunteers', 'contact_messages', 'notifications',
        'audit_logs', 'receipts', 'media',
    ];

    public function handle(): int
    {
        $outPath = base_path($this->option('path'));
        $templatePath = base_path('database/cmsrr.sql');

        if (! File::exists($templatePath)) {
            $this->error('database/cmsrr.sql not found. Run: git pull origin laravel');

            return 1;
        }

        $ddl = File::get($templatePath);
        // Keep schema (DROP/CREATE); drop old INSERT blocks — fresh data appended below.
        $ddl = preg_replace('/^-- CMSRR MySQL schema \+ seed \(generated.*\n/m', '', $ddl) ?? $ddl;
        $ddl = preg_replace('/^-- Admin login:.*\n/m', '', $ddl) ?? $ddl;
        $ddl = preg_replace('/INSERT INTO `[^`]+`[^;]+;\s*/s', '', $ddl) ?? $ddl;
        $ddl = preg_replace('/-- [a-z_]+: no rows\n\n/s', '', $ddl) ?? $ddl;

        $sql = "-- CMSRR MySQL schema + seed (generated ".now()->toDateTimeString().")\n";
        $sql .= "-- Import on cPanel: phpMyAdmin → Import → cmsrr.sql\n";
        $sql .= "-- Admin login: test@gmail.com / testadmin123\n\n";
        $sql .= $ddl;

        foreach ($this->tables as $table) {
            if (! $this->tableExists($table)) {
                continue;
            }
            $query = DB::table($table);
            if (Schema::hasColumn($table, 'id')) {
                $query->orderBy('id');
            }
            $rows = $query->get();
            if ($rows->isEmpty()) {
                $sql .= "-- {$table}: no rows\n\n";
                continue;
            }
            $columns = array_keys((array) $rows->first());
            $colList = implode(', ', array_map(fn ($c) => "`{$c}`", $columns));
            $values = $rows->map(function ($row) use ($columns) {
                $vals = array_map(fn ($c) => $this->esc($row->{$c} ?? null), $columns);

                return '('.implode(', ', $vals).')';
            })->implode(",\n");

            $sql .= "INSERT INTO `{$table}` ({$colList}) VALUES\n{$values};\n\n";
        }

        File::put($outPath, $sql);
        $this->info("Exported to {$outPath} (".number_format(strlen($sql)).' bytes)');

        return 0;
    }

    private function tableExists(string $table): bool
    {
        return Schema::hasTable($table);
    }

    private function esc(mixed $val): string
    {
        if ($val === null) {
            return 'NULL';
        }
        if (is_bool($val)) {
            return $val ? '1' : '0';
        }
        if (is_int($val) || is_float($val)) {
            return (string) $val;
        }

        return "'".str_replace(["\\", "'"], ["\\\\", "''"], (string) $val)."'";
    }
}
