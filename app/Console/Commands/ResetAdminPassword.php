<?php

namespace App\Console\Commands;

use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;

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
            // The User model has a 'hashed' cast on password — pass plain text.
            $user->password = $password;
            $user->save();
            $this->info("✅ Password for {$email} has been reset.");
        } else {
            $user = User::query()->create([
                'name' => 'Admin',
                'email' => $email,
                'password' => $password,  // 'hashed' cast auto-hashes
            ]);
            $this->info("✅ Admin user {$email} created.");
        }

        // Ensure profile exists
        Profile::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['full_name' => 'Admin', 'email' => $email, 'is_active' => true]
        );

        // Use exact role name 'Super Admin' (with space) — must match
        // User::isSuperAdmin() and the CmsrSeeder.
        $role = Role::query()->firstOrCreate(
            ['name' => 'Super Admin', 'guard_name' => 'web'],
            ['description' => 'Full access']
        );

        if (! $user->roles()->where('role_id', $role->id)->exists()) {
            $user->roles()->attach($role->id);
            $this->info("   Assigned 'Super Admin' role.");
        } else {
            $this->info("   'Super Admin' role already assigned.");
        }

        // Clean up: if a stale 'SuperAdmin' (no space) role was created
        // by a previous version of this command, remove it.
        $staleRole = Role::query()->where('name', 'SuperAdmin')->first();
        if ($staleRole) {
            $user->roles()->detach($staleRole->id);
            $staleRole->delete();
            $this->info("   Cleaned up stale 'SuperAdmin' role.");
        }

        $this->info("✅ Done. Login at /admin/login with: {$email} / {$password}");

        return self::SUCCESS;
    }
}
