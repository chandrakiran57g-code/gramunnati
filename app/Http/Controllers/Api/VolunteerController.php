<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Volunteer;
use App\Support\Notifier;
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

        // Public applications are always created as pending WITHOUT a volunteer
        // ID. The ID is issued (and a welcome notification is sent) only when an
        // admin approves the request — handled by the Volunteer model events.
        $volunteer = Volunteer::query()->create([
            ...$data,
            'volunteer_code' => null,
            'status' => 'pending',
            'user_id' => $request->user()?->id,
        ]);

        if ($volunteer->user_id) {
            Notifier::send(
                (int) $volunteer->user_id,
                'system',
                'Volunteering request received',
                "Your volunteering request has been submitted successfully. We'll notify you upon approval."
            );
        }

        return response()->json([
            'data' => $volunteer,
            'message' => "Your volunteering request has been submitted successfully. We'll notify you upon approval.",
        ], 201);
    }
}
