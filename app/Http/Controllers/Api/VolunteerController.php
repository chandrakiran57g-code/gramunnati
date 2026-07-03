<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Volunteer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VolunteerController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'mobile' => 'required|string|max:20',
            'state' => 'required|string|max:100',
            'district' => 'nullable|string|max:100',
            'occupation' => 'nullable|string|max:255',
            'availability' => 'nullable|string|max:50',
            'skills' => 'nullable|array',
            'skills.*' => 'string|max:100',
            'experience' => 'nullable|string|max:5000',
            'program_category' => 'nullable|string|max:100',
            'age' => 'nullable|integer|min:16|max:100',
        ]);

        $year = now()->year;
        $count = Volunteer::query()->whereYear('created_at', $year)->count();
        $volunteerCode = $year.($count + 1);

        $volunteer = Volunteer::query()->create([
            ...$data,
            'volunteer_code' => $volunteerCode,
            'status' => 'pending',
            'user_id' => $request->user()?->id,
        ]);

        return response()->json([
            'data' => $volunteer,
            'message' => 'Registration submitted. Our team will contact you shortly.',
        ], 201);
    }
}
