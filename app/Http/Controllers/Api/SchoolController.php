<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\LoadsPolymorphicMedia;
use App\Models\School;
use App\Models\SchoolRequirement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    use LoadsPolymorphicMedia;

    public function index(Request $request): JsonResponse
    {
        $query = School::query()
            ->with(['village:id,village_name,slug'])
            ->where('is_active', true);

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }
        if ($request->filled('village_id')) {
            $query->where('village_id', $request->integer('village_id'));
        }
        if ($request->filled('search')) {
            $s = '%'.$request->input('search').'%';
            $query->where('school_name', 'like', $s);
        }

        $orderBy = $request->input('order_by', 'created_at');
        $asc = $request->boolean('ascending', false);
        $query->orderBy($orderBy, $asc ? 'asc' : 'desc');

        return response()->json($this->paginateQuery($query, $request));
    }

    public function show(string $slug): JsonResponse
    {
        $school = School::query()
            ->with(['village:id,village_name,slug,state_id,district_id,mandal_id', 'village.state:id,name', 'village.district:id,name', 'village.mandal:id,name'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json($school);
    }

    public function requirements(int $id): JsonResponse
    {
        return response()->json(
            SchoolRequirement::query()->where('school_id', $id)->orderBy('priority')->get()
        );
    }

    public function gallery(int $id): JsonResponse
    {
        return response()->json($this->galleriesFor('school', $id));
    }

    public function timeline(int $id): JsonResponse
    {
        return response()->json($this->timelineFor('school', $id));
    }
}
