<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\SchoolFollower;
use App\Models\Village;
use App\Models\VillageFollower;
use App\Support\Notifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Member follow/unfollow for villages and schools.
 * Always scoped to the authenticated user — the client never supplies user_id.
 */
class FollowController extends Controller
{
    public function followVillage(Request $request, int $id): JsonResponse
    {
        $row = VillageFollower::query()->firstOrCreate(
            ['village_id' => $id, 'user_id' => $request->user()->id],
            ['created_at' => now()]
        );

        if ($row->wasRecentlyCreated) {
            $village = Village::query()->find($id);
            if ($village) {
                Notifier::send(
                    (int) $request->user()->id,
                    'village',
                    'Following '.$village->village_name,
                    "You'll now receive updates about ".$village->village_name.'.',
                    '/villages/'.$village->slug
                );
            }
        }

        return response()->json(['data' => $row, 'error' => null], 201);
    }

    public function unfollowVillage(Request $request, int $id): JsonResponse
    {
        VillageFollower::query()
            ->where('village_id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['data' => null, 'error' => null]);
    }

    public function followSchool(Request $request, int $id): JsonResponse
    {
        $row = SchoolFollower::query()->firstOrCreate(
            ['school_id' => $id, 'user_id' => $request->user()->id],
            ['created_at' => now()]
        );

        if ($row->wasRecentlyCreated) {
            $school = School::query()->find($id);
            if ($school) {
                Notifier::send(
                    (int) $request->user()->id,
                    'school',
                    'Following '.$school->school_name,
                    "You'll now receive updates about ".$school->school_name.'.',
                    '/schools/'.$school->slug
                );
            }
        }

        return response()->json(['data' => $row, 'error' => null], 201);
    }

    public function unfollowSchool(Request $request, int $id): JsonResponse
    {
        SchoolFollower::query()
            ->where('school_id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['data' => null, 'error' => null]);
    }
}
