<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\DonationReceipt;
use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use App\Models\UserCategory;
use App\Support\Notifier;
use App\Support\SettingsStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class DonationController extends Controller
{
    /**
     * Record a donation intent. Payment status is ALWAYS server-controlled and
     * starts as `pending` — it can only become `success` after a verified
     * gateway callback (see verify()). The client can never mark a donation paid.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'donor_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:20',
            'amount' => 'required|numeric|min:10|max:10000000',
            'target_type' => 'nullable|string|max:50',
            'village_id' => 'nullable|integer',
            'school_id' => 'nullable|integer',
            'project_id' => 'nullable|integer',
            'message' => 'nullable|string|max:2000',
            'is_anonymous' => 'nullable|boolean',
            // Guest-donor profile fields — only used when the donor is not
            // logged in, to register them in the users/profiles tables.
            'profession' => 'nullable|string|max:255',
            'state_id' => 'nullable|integer',
            'district_id' => 'nullable|integer',
            'mandal_name' => 'nullable|string|max:255',
        ]);

        // Logged-in donors keep their own user_id. Guest donors are registered
        // (or matched to an existing account) so every donation ties to a user.
        $userId = $request->user()?->id;
        if (! $userId) {
            $userId = $this->resolveGuestDonor($data);
        }

        $donation = Donation::query()->create([
            'donor_name' => $data['donor_name'],
            'email' => $data['email'] ?? null,
            'mobile' => $data['mobile'] ?? null,
            'amount' => $data['amount'],
            'currency' => 'INR',
            'target_type' => $data['target_type'] ?? 'general',
            'village_id' => $data['village_id'] ?? null,
            'school_id' => $data['school_id'] ?? null,
            'project_id' => $data['project_id'] ?? null,
            'message' => $data['message'] ?? null,
            'is_anonymous' => (bool) ($data['is_anonymous'] ?? false),
            'payment_status' => 'pending',
            'payment_gateway' => 'razorpay',
            'user_id' => $userId,
            'donated_at' => now(),
        ]);

        return response()->json($donation, 201);
    }

    /**
     * Register a guest donor into the existing users + profiles tables (or
     * match an existing account by email/mobile) and return the user id to
     * attach to the donation. A random password is generated so the future
     * WhatsApp/email flow can send the donor their login credentials.
     *
     * @param  array<string, mixed>  $data
     */
    private function resolveGuestDonor(array $data): ?int
    {
        $mobile = isset($data['mobile']) ? preg_replace('/\D/', '', (string) $data['mobile']) : '';
        $email = ! empty($data['email']) ? strtolower(trim((string) $data['email'])) : null;

        // Match an existing account first so we never create duplicates.
        $user = null;
        if ($email) {
            $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();
        }
        if (! $user && strlen($mobile) >= 10) {
            $profile = Profile::query()
                ->where('mobile', $mobile)
                ->orWhere('mobile', '+91'.$mobile)
                ->first();
            $user = $profile?->user;
        }
        if ($user) {
            return (int) $user->id;
        }

        // Need at least one contact handle to register a new donor.
        if (strlen($mobile) < 10 && ! $email) {
            return null;
        }

        $loginEmail = $email ?: ($mobile ? $mobile.'@cmsr.local' : Str::uuid().'@cmsr.local');
        if ($existing = User::query()->whereRaw('LOWER(email) = ?', [strtolower($loginEmail)])->first()) {
            return (int) $existing->id;
        }

        $password = Str::random(12);

        $user = User::query()->create([
            'name' => $data['donor_name'] ?: 'Donor',
            'email' => $loginEmail,
            'password' => $password, // hashed via the User model cast
        ]);

        Profile::query()->create([
            'user_id' => $user->id,
            'full_name' => $data['donor_name'] ?? null,
            'mobile' => $mobile ?: null,
            'email' => $email,
            'profession' => $data['profession'] ?? null,
            'state_id' => $data['state_id'] ?? null,
            'district_id' => $data['district_id'] ?? null,
            'mandal_name' => $data['mandal_name'] ?? null,
            'initial_password' => $password,
        ]);

        if ($memberRole = Role::query()->where('name', 'Member')->first()) {
            $user->roles()->syncWithoutDetaching([$memberRole->id]);
        }
        if ($citizen = UserCategory::query()->where('slug', 'citizen')->first()) {
            $user->categories()->syncWithoutDetaching([$citizen->id]);
        }

        return (int) $user->id;
    }

    /**
     * Look up a returning donor by mobile so the donate form can auto-fill
     * their details. Requires a full 10-digit number to reduce enumeration.
     */
    public function lookup(Request $request): JsonResponse
    {
        $mobile = preg_replace('/\D/', '', (string) $request->query('mobile', ''));
        if (strlen($mobile) < 10) {
            return response()->json(['found' => false]);
        }

        $profile = Profile::query()
            ->with('user')
            ->where('mobile', $mobile)
            ->orWhere('mobile', '+91'.$mobile)
            ->first();

        if ($profile) {
            $email = $profile->email;
            if (! $email && $profile->user && ! str_ends_with((string) $profile->user->email, '@cmsr.local')) {
                $email = $profile->user->email;
            }

            return response()->json(['found' => true, 'donor' => [
                'donor_name' => $profile->full_name ?: ($profile->user->name ?? ''),
                'email' => $email,
                'profession' => $profile->profession,
                'state_id' => $profile->state_id,
                'district_id' => $profile->district_id,
                'mandal_name' => $profile->mandal_name,
            ]]);
        }

        $donation = Donation::query()->where('mobile', $mobile)->latest('id')->first();
        if ($donation) {
            return response()->json(['found' => true, 'donor' => [
                'donor_name' => $donation->donor_name,
                'email' => $donation->email,
            ]]);
        }

        return response()->json(['found' => false]);
    }

    /**
     * Create a Razorpay order for a pending donation. Returns configured=false
     * (HTTP 200) when no gateway keys are set yet, so the UI can degrade
     * gracefully into a "recorded as pending" pledge.
     */
    public function createOrder(Request $request, int $id): JsonResponse
    {
        $donation = Donation::query()->findOrFail($id);

        if ($donation->payment_status === 'success') {
            return response()->json(['configured' => true, 'already_paid' => true]);
        }

        [$keyId, $keySecret] = $this->razorpayCredentials();

        if ($keyId === '' || $keySecret === '') {
            return response()->json([
                'configured' => false,
                'message' => 'Online payments are not enabled yet.',
            ]);
        }

        $amountPaise = (int) round(((float) $donation->amount) * 100);

        $resp = Http::withBasicAuth($keyId, $keySecret)
            ->asJson()
            ->post('https://api.razorpay.com/v1/orders', [
                'amount' => $amountPaise,
                'currency' => 'INR',
                'receipt' => 'donation_'.$donation->id,
                'notes' => ['donation_id' => (string) $donation->id],
            ]);

        if (! $resp->successful()) {
            report(new \RuntimeException('Razorpay order failed: '.$resp->status().' '.$resp->body()));

            return response()->json([
                'configured' => true,
                'error' => 'Could not start the payment. Please try again.',
            ], 502);
        }

        $order = $resp->json();
        $donation->update(['transaction_id' => $order['id'] ?? null]);

        return response()->json([
            'configured' => true,
            'key_id' => $keyId,
            'order_id' => $order['id'] ?? null,
            'amount' => $amountPaise,
            'currency' => 'INR',
            'donation_id' => $donation->id,
        ]);
    }

    /**
     * Verify a Razorpay payment signature and mark the donation successful.
     * This is the ONLY path that can set payment_status = success.
     */
    public function verify(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'razorpay_order_id' => 'required|string|max:255',
            'razorpay_payment_id' => 'required|string|max:255',
            'razorpay_signature' => 'required|string|max:255',
        ]);

        $donation = Donation::query()->findOrFail($id);
        [, $keySecret] = $this->razorpayCredentials();

        if ($keySecret === '') {
            return response()->json(['ok' => false, 'message' => 'Payments are not configured.'], 422);
        }

        $expected = hash_hmac(
            'sha256',
            $data['razorpay_order_id'].'|'.$data['razorpay_payment_id'],
            $keySecret
        );

        if (! hash_equals($expected, $data['razorpay_signature'])) {
            $donation->update(['payment_status' => 'failed']);

            return response()->json(['ok' => false, 'message' => 'Payment verification failed.'], 422);
        }

        $donation->update([
            'payment_status' => 'success',
            'transaction_id' => $data['razorpay_payment_id'],
            'donated_at' => now(),
        ]);

        $this->ensureReceipt($donation);

        if ($donation->user_id) {
            Notifier::send(
                (int) $donation->user_id,
                'donation',
                'Donation received',
                'Thank you! Your donation of ₹'.number_format((float) $donation->amount).' has been received.'
            );
        }

        return response()->json(['ok' => true, 'data' => $donation->fresh('receipts')]);
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function razorpayCredentials(): array
    {
        $keyId = (string) (SettingsStore::get('rzp_key') ?? config('services.razorpay.key') ?? '');
        $keySecret = (string) (SettingsStore::get('rzp_secret') ?? config('services.razorpay.secret') ?? '');

        return [trim($keyId), trim($keySecret)];
    }

    private function ensureReceipt(Donation $donation): DonationReceipt
    {
        $number = $donation->receipt_number ?: ('RCP-'.now()->format('Y').'-'.str_pad((string) $donation->id, 5, '0', STR_PAD_LEFT));

        if (! $donation->receipt_number) {
            $donation->update(['receipt_number' => $number]);
        }

        return DonationReceipt::query()->firstOrCreate(
            ['donation_id' => $donation->id],
            ['receipt_number' => $number]
        );
    }

    public function mine(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $donations = Donation::query()
            ->with(['village:id,village_name', 'school:id,school_name', 'project:id,project_name', 'receipts'])
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($donations);
    }
}
