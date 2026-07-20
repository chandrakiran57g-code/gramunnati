<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use App\Models\UserCategory;
use App\Support\Mailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'nullable|email|max:255',
            'password' => 'required|string|min:6',
            'full_name' => 'nullable|string|max:255',
            'mobile' => 'required|string|min:10|max:20',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'profession' => 'nullable|string|max:255',
            'state_id' => 'required|integer|exists:states,id',
            'district_id' => 'required|integer|exists:districts,id',
            'mandal_name' => 'nullable|string|max:255',
        ]);

        $mobile = preg_replace('/\D/', '', $data['mobile']);
        if (! preg_match('/^[6-9]\d{9}$/', $mobile)) {
            throw ValidationException::withMessages(['mobile' => 'Enter a valid 10-digit Indian mobile number']);
        }
        $email = $data['email'] ?? "{$mobile}@cmsr.local";
        $fullName = $data['full_name'] ?? trim(($data['first_name'] ?? '').' '.($data['last_name'] ?? ''));

        if (User::query()->where('email', $email)->exists()) {
            throw ValidationException::withMessages(['email' => 'Email already registered']);
        }

        $user = User::query()->create([
            'name' => $fullName ?: 'Member',
            'email' => $email,
            'password' => $data['password'],
        ]);

        Profile::query()->create([
            'user_id' => $user->id,
            'full_name' => $fullName,
            'mobile' => $mobile,
            'email' => $data['email'] ?? null,
            'profession' => $data['profession'] ?? null,
            'state_id' => $data['state_id'],
            'district_id' => $data['district_id'],
            'mandal_name' => $data['mandal_name'] ?? null,
        ]);

        $memberRole = Role::query()->where('name', 'Member')->first();
        if ($memberRole) {
            $user->roles()->syncWithoutDetaching([$memberRole->id]);
        }

        $citizen = UserCategory::query()->where('slug', 'citizen')->first();
        if ($citizen) {
            $user->categories()->syncWithoutDetaching([$citizen->id]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json($this->authPayload($user));
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'nullable|string',
            'mobile' => 'nullable|string',
            'password' => 'required|string',
        ]);

        $user = null;
        if (! empty($data['email'])) {
            $user = User::query()->where('email', $data['email'])->first();
        } elseif (! empty($data['mobile'])) {
            $mobile = preg_replace('/\D/', '', $data['mobile']);
            $profile = Profile::query()
                ->where('mobile', $mobile)
                ->orWhere('mobile', '+91'.$mobile)
                ->first();
            $user = $profile?->user;
        }

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'Invalid credentials']);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json($this->authPayload($user));
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['user' => null], 401);
        }

        return response()->json($this->authPayload($user));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'full_name' => 'nullable|string|max:255',
            'mobile' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'state_id' => 'nullable|integer',
            'district_id' => 'nullable|integer',
            'mandal_id' => 'nullable|integer',
            'village_id' => 'nullable|integer',
            'profile_photo' => 'nullable|string|max:500',
        ]);

        $profile = Profile::query()->firstOrCreate(['user_id' => $user->id]);
        $profile->fill($data)->save();

        if (! empty($data['full_name'])) {
            $user->update(['name' => $data['full_name']]);
        }

        return response()->json($this->authPayload($user->fresh()));
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email']);
        $genericResponse = response()->json([
            'ok' => true,
            'message' => 'If an account exists for that email, a password reset link has been sent.',
        ]);

        $user = User::query()->where('email', $data['email'])->first();
        if (! $user) {
            // Do not disclose whether the email is registered.
            return $genericResponse;
        }

        $token = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $resetUrl = rtrim((string) config('app.url'), '/')
            .'/reset-password?token='.$token.'&email='.urlencode($user->email);

        $body = "Hello,\n\n"
            ."We received a request to reset your ".config('mail.from.name')." account password.\n\n"
            ."Reset your password using the link below (valid for 60 minutes):\n"
            .$resetUrl."\n\n"
            ."If you did not request this, you can safely ignore this email — your password will not change.\n\n"
            .config('mail.from.name');

        Mailer::sendRawDeferred($user->email, 'Reset your '.config('mail.from.name').' password', $body, $user->name);

        return $genericResponse;
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
            'token' => 'required|string',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $data['email'])->first();

        if (! $record || ! Hash::check($data['token'], $record->token)) {
            throw ValidationException::withMessages(['token' => 'This reset link is invalid. Please request a new one.']);
        }

        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $data['email'])->delete();
            throw ValidationException::withMessages(['token' => 'This reset link has expired. Please request a new one.']);
        }

        $user = User::query()->where('email', $data['email'])->first();
        if (! $user) {
            throw ValidationException::withMessages(['email' => 'No account found for this email.']);
        }

        $user->update(['password' => $data['password']]);
        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();

        return response()->json(['ok' => true, 'message' => 'Your password has been reset. You can now log in.']);
    }

    private function authPayload(User $user): array
    {
        $user->load(['profile.state', 'profile.district', 'profile.mandal', 'profile.village', 'roles', 'categories']);

        $profile = $user->profile;
        $profileArray = $profile ? $profile->toArray() : null;
        if ($profileArray) {
            $profileArray['user_roles'] = $user->roles->map(fn ($r) => [
                'role_id' => $r->id,
                'roles' => ['id' => $r->id, 'name' => $r->name],
            ])->values()->all();
            $profileArray['user_category_user'] = $user->categories->map(fn ($c) => [
                'category_id' => $c->id,
                'user_categories' => ['id' => $c->id, 'name' => $c->name, 'slug' => $c->slug],
            ])->values()->all();
            $profileArray['states'] = $profile->state;
            $profileArray['districts'] = $profile->district;
            $profileArray['mandals'] = $profile->mandal;
            $profileArray['villages'] = $profile->village;
        }

        return [
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'user_metadata' => [
                    'full_name' => $profile?->full_name ?? $user->name,
                    'mobile' => $profile?->mobile,
                ],
            ],
            'session' => ['user' => ['id' => $user->id, 'email' => $user->email]],
            'profile' => $profileArray,
            'roles' => $user->roles->pluck('name')->all(),
        ];
    }
}
