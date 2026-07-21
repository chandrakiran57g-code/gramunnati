<?php

namespace App\Console\Commands;

use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;

class ResetAdminPassword extends Command
{
    protected $signature = 'cmsr:reset-admin
                            {--email=test@gmail.com : Existing admin email to find}
                            {--new-email= : Optional new email to rename the admin account to}
                            {--password= : New password (min 8 chars; prompted if omitted)}';

    protected $description = 'Reset / rename the admin user and set a new, strong password';

    public function handle(): int
    {
        $email = $this->option('email');
        $newEmail = $this->option('new-email');
        $password = $this->option('password');

        if ($newEmail && ! filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
            $this->error("'{$newEmail}' is not a valid email address. Aborting.");

            return self::FAILURE;
        }

        // Prevent renaming onto an email already used by a different account.
        if ($newEmail && $newEmail !== $email) {
            $clash = User::query()->where('email', $newEmail)->first();
            if ($clash) {
                $this->error("Another account already uses {$newEmail}. Aborting.");

                return self::FAILURE;
            }
        }

        if (empty($password)) {
            $password = (string) $this->secret('Enter a new admin password (min 8 characters)');
        }

        if (strlen($password) < 8) {
            $this->error('Password must be at least 8 characters. Aborting.');

            return self::FAILURE;
        }

        $user = User::query()->where('email', $email)->first();
        $finalEmail = $newEmail ?: $email;

        if ($user) {
            // The User model has a 'hashed' cast on password — pass plain text.
            $user->email = $finalEmail;
            $user->password = $password;
            $user->save();
            $this->info($newEmail && $newEmail !== $email
                ? "✅ Admin renamed from {$email} to {$finalEmail} and password reset."
                : "✅ Password for {$finalEmail} has been reset.");
        } else {
            $user = User::query()->create([
                'name' => 'Admin',
                'email' => $finalEmail,
                'password' => $password,  // 'hashed' cast auto-hashes
            ]);
            $this->info("✅ Admin user {$finalEmail} created.");
        }

        // Ensure profile exists and its email matches the account.
        $profile = Profile::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['full_name' => 'Admin', 'email' => $finalEmail, 'is_active' => true]
        );
        if ($profile->email !== $finalEmail) {
            $profile->update(['email' => $finalEmail]);
        }

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

        $this->info("✅ Done. You can now log in at /admin/login with {$finalEmail} and your new password.");

        return self::SUCCESS;
    }
}
