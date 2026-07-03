<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Mandal;
use App\Models\State;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeographyController extends Controller
{
    public function states(): JsonResponse
    {
        return response()->json(
            State::query()->where('is_active', true)->orderBy('name')->get()
        );
    }

    public function districts(Request $request): JsonResponse
    {
        $query = District::query()->where('is_active', true)->orderBy('name');
        if ($request->filled('state_id')) {
            $query->where('state_id', $request->integer('state_id'));
        }

        return response()->json($query->get());
    }

    public function mandals(Request $request): JsonResponse
    {
        $query = Mandal::query()->where('is_active', true)->orderBy('name');
        if ($request->filled('district_id')) {
            $query->where('district_id', $request->integer('district_id'));
        }

        return response()->json($query->get());
    }
}
