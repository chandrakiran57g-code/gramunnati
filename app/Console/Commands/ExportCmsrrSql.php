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

        $sql = "-- CMSRR MySQL schema + seed (generated ".now()->toDateTimeString().")\n";
        $sql .= "-- Import on cPanel: phpMyAdmin → Import → cmsrr.sql\n";
        $sql .= "-- Admin login: test@gmail.com / testadmin123\n\n";
        $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        // Schema (DROP + CREATE) generated from the live database so it always
        // matches the current migrations — no more drift between CREATE and INSERT.
        foreach ($this->tables as $table) {
            if (! $this->tableExists($table)) {
                continue;
            }
            $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";
            $sql .= $this->createTableSql($table)."\n\n";
        }

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

        $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";

        File::put($outPath, $sql);
        $this->info("Exported to {$outPath} (".number_format(strlen($sql)).' bytes)');

        return 0;
    }

    private function tableExists(string $table): bool
    {
        return Schema::hasTable($table);
    }

    /** Build a MySQL-compatible CREATE TABLE from the live schema. */
    private function createTableSql(string $table): string
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            // On the server the source is MySQL — use its exact definition.
            $row = (array) DB::selectOne("SHOW CREATE TABLE `{$table}`");
            $create = $row['Create Table'] ?? ($row['Create View'] ?? null);
            if ($create) {
                return rtrim($create, "; \n").';';
            }
        }

        // SQLite (local dev) → derive MySQL DDL from column metadata.
        $lines = [];
        $hasAutoId = false;
        foreach (DB::select("PRAGMA table_info(`{$table}`)") as $col) {
            $col = (array) $col;
            $name = $col['name'];
            $isId = $name === 'id';
            if ($isId) {
                $hasAutoId = true;
                $lines[] = "  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT";

                continue;
            }
            $type = $this->mysqlType($name, (string) $col['type']);
            $nullable = ((int) $col['notnull']) === 0 ? 'NULL' : 'NOT NULL';
            $default = $this->defaultClause($col['dflt_value'] ?? null);
            $lines[] = "  `{$name}` {$type} {$nullable}{$default}";
        }
        if ($hasAutoId) {
            $lines[] = '  PRIMARY KEY (`id`)';
        }

        return "CREATE TABLE `{$table}` (\n".implode(",\n", $lines)."\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    }

    private function mysqlType(string $name, string $sqliteType): string
    {
        $t = strtolower($sqliteType);

        if (str_contains($t, 'tinyint(1)') || $t === 'boolean') {
            return 'TINYINT(1)';
        }
        if (str_contains($t, 'int')) {
            if ($name === 'id' || str_ends_with($name, '_id') || str_ends_with($name, '_by')) {
                return 'BIGINT UNSIGNED';
            }

            return 'INT';
        }
        if (str_contains($t, 'longtext')) {
            return 'LONGTEXT';
        }
        if (str_contains($t, 'text') || str_contains($t, 'clob') || str_contains($t, 'json')) {
            return 'LONGTEXT';
        }
        if (str_contains($t, 'decimal') || str_contains($t, 'numeric')) {
            return 'DECIMAL(14, 2)';
        }
        if (str_contains($t, 'float') || str_contains($t, 'double') || str_contains($t, 'real')) {
            return 'DOUBLE';
        }
        if (str_contains($t, 'datetime') || str_contains($t, 'timestamp')) {
            return 'TIMESTAMP';
        }
        if (str_contains($t, 'date')) {
            return 'DATE';
        }
        if (str_contains($t, 'time')) {
            return 'TIME';
        }
        if (preg_match('/varchar\((\d+)\)/', $t, $m)) {
            return "VARCHAR({$m[1]})";
        }

        return 'VARCHAR(255)';
    }

    private function defaultClause(mixed $default): string
    {
        if ($default === null || $default === '') {
            return '';
        }
        $d = trim((string) $default);
        // SQLite may quote string defaults with single quotes already.
        if (strtoupper($d) === 'NULL') {
            return ' DEFAULT NULL';
        }
        if (is_numeric($d)) {
            return " DEFAULT {$d}";
        }
        // Strip existing quotes then re-quote for MySQL.
        $d = trim($d, "'");

        return " DEFAULT '".str_replace("'", "''", $d)."'";
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
