<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ResetAdminPassword extends Command
{
    protected $signature = 'cmsr:reset-admin
                            {--email=test@gmail.com : Admin email}
                            {--password=testadmin123 : New password}';

    protected $description = 'Reset (or create) the default admin user with the given credentials';

    public function handle(): int
    {
        $email = $this->option('email');
        $password = $this->option('password');

        $user = User::query()->where('email', $email)->first();

        if ($user) {
            $user->update(['password' => Hash::make($password)]);
            $this->info("✅ Password for {$email} has been reset.");
        } else {
            $user = User::query()->create([
                'name' => 'Admin',
                'email' => $email,
                'password' => Hash::make($password),
            ]);
            $this->info("✅ Admin user {$email} created.");
        }

        // Ensure SuperAdmin role exists and is assigned
        $role = Role::query()->firstOrCreate(
            ['name' => 'SuperAdmin', 'guard_name' => 'web']
        );

        if (! $user->roles()->where('role_id', $role->id)->exists()) {
            $user->roles()->attach($role->id);
            $this->info("   Assigned SuperAdmin role.");
        }

        return self::SUCCESS;
    }
}
