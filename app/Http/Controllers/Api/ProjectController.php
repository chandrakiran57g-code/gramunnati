<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\LoadsPolymorphicMedia;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\ProjectUpdate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    use LoadsPolymorphicMedia;

    public function index(Request $request): JsonResponse
    {
        $query = Project::query()
            ->with(['category:id,name,slug,icon', 'village:id,village_name,slug', 'school:id,school_name,slug']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        } else {
            $query->where('status', 'active');
        }
        if ($request->filled('village_id')) {
            $query->where('village_id', $request->integer('village_id'));
        }
        if ($request->filled('category_id')) {
            $query->where('project_category_id', $request->integer('category_id'));
        }

        $orderBy = $request->input('order_by', 'created_at');
        $asc = $request->boolean('ascending', false);
        $query->orderBy($orderBy, $asc ? 'asc' : 'desc');

        return response()->json($this->paginateQuery($query, $request));
    }

    public function show(string $slug): JsonResponse
    {
        $project = Project::query()
            ->with(['category', 'village', 'school', 'updates'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($project);
    }

    public function updates(int $id): JsonResponse
    {
        return response()->json(
            ProjectUpdate::query()->where('project_id', $id)->orderByDesc('created_at')->get()
        );
    }

    public function categories(): JsonResponse
    {
        return response()->json(ProjectCategory::query()->orderBy('name')->get());
    }
}
