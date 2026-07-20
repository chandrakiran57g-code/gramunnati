<?php

namespace Tests\Feature;

use App\Models\Donation;
use App\Support\SettingsStore;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DonationIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_donation_is_always_pending_even_if_client_claims_success(): void
    {
        $response = $this->postJson('/api/donations', [
            'donor_name' => 'Test Donor',
            'amount' => 500,
            'target_type' => 'general',
            // A malicious client trying to forge a paid donation:
            'payment_status' => 'success',
            'receipt_number' => 'FAKE-123',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('donations', [
            'donor_name' => 'Test Donor',
            'payment_status' => 'pending',
        ]);
        $this->assertDatabaseMissing('donations', ['receipt_number' => 'FAKE-123']);
    }

    public function test_create_order_reports_not_configured_without_keys(): void
    {
        $donation = Donation::query()->create([
            'donor_name' => 'No Gateway',
            'amount' => 100,
            'currency' => 'INR',
            'target_type' => 'general',
            'payment_status' => 'pending',
        ]);

        $this->postJson("/api/donations/{$donation->id}/order")
            ->assertOk()
            ->assertJson(['configured' => false]);
    }

    public function test_verify_rejects_an_invalid_signature(): void
    {
        SettingsStore::set('rzp_secret', 'test_secret');

        $donation = Donation::query()->create([
            'donor_name' => 'Signature Test',
            'amount' => 250,
            'currency' => 'INR',
            'target_type' => 'general',
            'payment_status' => 'pending',
        ]);

        $this->postJson("/api/donations/{$donation->id}/verify", [
            'razorpay_order_id' => 'order_123',
            'razorpay_payment_id' => 'pay_123',
            'razorpay_signature' => 'clearly_wrong_signature',
        ])->assertStatus(422);

        $this->assertDatabaseMissing('donations', [
            'id' => $donation->id,
            'payment_status' => 'success',
        ]);
    }
}
