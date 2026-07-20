<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityGuardsTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_is_public(): void
    {
        $this->getJson('/api/health')->assertOk()->assertJson(['ok' => true]);
    }

    public function test_admin_db_write_requires_authentication(): void
    {
        // No admin credentials exist in the frontend anymore, so the only way in
        // is a real authenticated admin session. Anonymous writes must be denied.
        $this->postJson('/api/admin/db/villages', ['village_name' => 'Hacked'])
            ->assertUnauthorized();
    }

    public function test_public_contact_endpoint_stores_a_message(): void
    {
        $this->postJson('/api/contact', [
            'name' => 'Visitor',
            'email' => 'visitor@example.com',
            'message' => 'Hello there',
        ])->assertCreated();

        $this->assertDatabaseHas('contact_messages', ['email' => 'visitor@example.com']);
    }
}
