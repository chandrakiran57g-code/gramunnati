<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_is_generic_for_unknown_email(): void
    {
        $this->postJson('/api/auth/forgot-password', ['email' => 'nobody@example.com'])
            ->assertOk()
            ->assertJson(['ok' => true]);

        $this->assertDatabaseCount('password_reset_tokens', 0);
    }

    public function test_forgot_password_creates_a_token_for_known_email(): void
    {
        User::query()->create([
            'name' => 'Member',
            'email' => 'member@example.com',
            'password' => 'secret123',
        ]);

        $this->postJson('/api/auth/forgot-password', ['email' => 'member@example.com'])
            ->assertOk();

        $this->assertDatabaseHas('password_reset_tokens', ['email' => 'member@example.com']);
    }

    public function test_reset_password_rejects_invalid_token(): void
    {
        User::query()->create([
            'name' => 'Member',
            'email' => 'member@example.com',
            'password' => 'secret123',
        ]);

        $this->postJson('/api/auth/reset-password', [
            'email' => 'member@example.com',
            'token' => 'not-a-real-token',
            'password' => 'newsecret',
            'password_confirmation' => 'newsecret',
        ])->assertStatus(422);
    }

    public function test_reset_password_updates_with_valid_token(): void
    {
        $user = User::query()->create([
            'name' => 'Member',
            'email' => 'member@example.com',
            'password' => 'secret123',
        ]);

        $token = 'valid-token-value';
        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'brandnew123',
            'password_confirmation' => 'brandnew123',
        ])->assertOk();

        $this->assertTrue(Hash::check('brandnew123', $user->fresh()->password));
        $this->assertDatabaseCount('password_reset_tokens', 0);
    }
}
