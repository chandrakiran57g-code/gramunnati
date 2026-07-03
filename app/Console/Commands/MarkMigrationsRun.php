<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MarkMigrationsRun extends Command
{
    protected $signature = 'gramunnati:mark-migrations-run';

    protected $description = 'Mark all GramUnnati migrations as run (use after importing gramunnati.sql on cPanel)';

    public function handle(): int
    {
        if (! Schema::hasTable('migrations')) {
            $this->call('migrate:install');
        }

        $path = database_path('migrations');
        $files = glob($path.'/*.php') ?: [];
        sort($files);

        $batch = (int) DB::table('migrations')->max('batch') + 1;
        $inserted = 0;

        foreach ($files as $file) {
            $migration = pathinfo($file, PATHINFO_FILENAME);

            $exists = DB::table('migrations')->where('migration', $migration)->exists();
            if ($exists) {
                continue;
            }

            DB::table('migrations')->insert([
                'migration' => $migration,
                'batch' => $batch,
            ]);
            $inserted++;
        }

        $this->info("Marked {$inserted} migration(s) as run (batch {$batch}).");

        return self::SUCCESS;
    }
}
