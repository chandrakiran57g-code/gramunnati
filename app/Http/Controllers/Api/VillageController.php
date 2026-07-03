<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\LoadsPolymorphicMedia;
use App\Models\Project;
use App\Models\School;
use App\Models\Village;
use App\Models\VillageNeed;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VillageController extends Controller
{
    use LoadsPolymorphicMedia;

    public function index(Request $request): JsonResponse
    {
        $query = Village::query()
            ->with(['state:id,name,code', 'district:id,name', 'mandal:id,name'])
            ->where('is_active', true);

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }
        if ($request->filled('state_id')) {
            $query->where('state_id', $request->integer('state_id'));
        }
        if ($request->filled('district_id')) {
            $query->where('district_id', $request->integer('district_id'));
        }
        if ($request->filled('mandal_id')) {
            $query->where('mandal_id', $request->integer('mandal_id'));
        }
        if ($request->filled('search')) {
            $s = '%'.$request->input('search').'%';
            $query->where(function ($q) use ($s) {
                $q->where('village_name', 'like', $s)
                    ->orWhere('short_description', 'like', $s)
                    ->orWhere('pincode', 'like', $s);
            });
        }

        $orderBy = $request->input('order_by', 'created_at');
        $asc = $request->boolean('ascending', false);
        $query->orderBy($orderBy, $asc ? 'asc' : 'desc');

        return response()->json($this->paginateQuery($query, $request));
    }

    public function show(string $slug): JsonResponse
    {
        $village = Village::query()
            ->with(['state:id,name,code', 'district:id,name', 'mandal:id,name'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json($village);
    }

    public function needs(int $id): JsonResponse
    {
        return response()->json(
            VillageNeed::query()->where('village_id', $id)->orderBy('priority')->get()
        );
    }

    public function schools(int $id): JsonResponse
    {
        return response()->json(
            School::query()->where('village_id', $id)->where('is_active', true)->get()
        );
    }

    public function projects(int $id): JsonResponse
    {
        return response()->json(
            Project::query()->with('category:id,name,icon')->where('village_id', $id)->get()
        );
    }

    public function gallery(int $id): JsonResponse
    {
        return response()->json($this->galleriesFor('village', $id));
    }

    public function timeline(int $id): JsonResponse
    {
        return response()->json($this->timelineFor('village', $id));
    }
}
