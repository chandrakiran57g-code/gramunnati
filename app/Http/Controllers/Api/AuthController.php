<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use App\Models\UserCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
        ]);

        $mobile = preg_replace('/\D/', '', $data['mobile']);
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
        $request->validate(['email' => 'required|email']);
        // Phase 3+: wire cPanel SMTP — acknowledge for now
        return response()->json(['ok' => true, 'message' => 'If that email exists, a reset link will be sent.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
            'token' => 'required|string',
        ]);

        return response()->json(['ok' => false, 'message' => 'Password reset via email not configured yet.'], 501);
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
