<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\ActivityLog;
use App\Models\Gallery;
use Illuminate\Http\Request;

trait LoadsPolymorphicMedia
{
    protected function galleriesFor(string $type, int $id)
    {
        return Gallery::query()
            ->where('galleryable_type', $type)
            ->where('galleryable_id', $id)
            ->orderBy('sort_order')
            ->get();
    }

    protected function timelineFor(string $type, int $id)
    {
        return ActivityLog::query()
            ->where('loggable_type', $type)
            ->where('loggable_id', $id)
            ->orderByDesc('activity_date')
            ->get();
    }

    protected function paginateQuery($query, Request $request): array
    {
        $limit = min((int) $request->input('limit', 50), 100);
        $offset = max((int) $request->input('offset', 0), 0);

        $count = (clone $query)->count();
        $data = $query->offset($offset)->limit($limit)->get();

        return ['data' => $data, 'count' => $count];
    }
}
