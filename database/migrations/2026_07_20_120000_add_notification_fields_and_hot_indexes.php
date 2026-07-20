<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Notifications: add type + link so producers can categorise and deep-link.
        Schema::table('notifications', function (Blueprint $table) {
            if (! Schema::hasColumn('notifications', 'type')) {
                $table->string('type', 40)->default('system')->after('user_id');
            }
            if (! Schema::hasColumn('notifications', 'link')) {
                $table->string('link', 500)->nullable()->after('message');
            }
        });

        // Indexes on hot relational / filter columns. Guarded so a re-run or a
        // partial prior state never aborts the migration.
        $this->addIndex('donations', ['user_id'], 'donations_user_id_index');
        $this->addIndex('donations', ['village_id'], 'donations_village_id_index');
        $this->addIndex('donations', ['school_id'], 'donations_school_id_index');
        $this->addIndex('donations', ['project_id'], 'donations_project_id_index');
        $this->addIndex('donations', ['payment_status'], 'donations_payment_status_index');
        $this->addIndex('donation_receipts', ['donation_id'], 'donation_receipts_donation_id_index');
        $this->addIndex('volunteers', ['user_id'], 'volunteers_user_id_index');
        $this->addIndex('volunteers', ['status'], 'volunteers_status_index');
        $this->addIndex('volunteer_activities', ['volunteer_id'], 'volunteer_activities_volunteer_id_index');
        $this->addIndex('village_needs', ['village_id'], 'village_needs_village_id_index');
        $this->addIndex('school_requirements', ['school_id'], 'school_requirements_school_id_index');
        $this->addIndex('notifications', ['user_id', 'is_read'], 'notifications_user_id_is_read_index');
        $this->addIndex('village_followers', ['user_id'], 'village_followers_user_id_index');
        $this->addIndex('school_followers', ['user_id'], 'school_followers_user_id_index');
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            if (Schema::hasColumn('notifications', 'type')) {
                $table->dropColumn('type');
            }
            if (Schema::hasColumn('notifications', 'link')) {
                $table->dropColumn('link');
            }
        });

        foreach ([
            ['donations', 'donations_user_id_index'],
            ['donations', 'donations_village_id_index'],
            ['donations', 'donations_school_id_index'],
            ['donations', 'donations_project_id_index'],
            ['donations', 'donations_payment_status_index'],
            ['donation_receipts', 'donation_receipts_donation_id_index'],
            ['volunteers', 'volunteers_user_id_index'],
            ['volunteers', 'volunteers_status_index'],
            ['volunteer_activities', 'volunteer_activities_volunteer_id_index'],
            ['village_needs', 'village_needs_village_id_index'],
            ['school_requirements', 'school_requirements_school_id_index'],
            ['notifications', 'notifications_user_id_is_read_index'],
            ['village_followers', 'village_followers_user_id_index'],
            ['school_followers', 'school_followers_user_id_index'],
        ] as [$table, $index]) {
            $this->dropIndex($table, $index);
        }
    }

    /**
     * @param  array<int, string>  $columns
     */
    private function addIndex(string $table, array $columns, string $name): void
    {
        if (! Schema::hasTable($table)) {
            return;
        }
        foreach ($columns as $column) {
            if (! Schema::hasColumn($table, $column)) {
                return;
            }
        }
        if ($this->indexExists($table, $name)) {
            return;
        }
        Schema::table($table, function (Blueprint $t) use ($columns, $name) {
            $t->index($columns, $name);
        });
    }

    private function dropIndex(string $table, string $name): void
    {
        if (! Schema::hasTable($table) || ! $this->indexExists($table, $name)) {
            return;
        }
        Schema::table($table, function (Blueprint $t) use ($name) {
            $t->dropIndex($name);
        });
    }

    private function indexExists(string $table, string $name): bool
    {
        try {
            return count(
                \Illuminate\Support\Facades\DB::select(
                    'SHOW INDEX FROM `'.$table.'` WHERE Key_name = ?',
                    [$name]
                )
            ) > 0;
        } catch (\Throwable $e) {
            return false;
        }
    }
};
