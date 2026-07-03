<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Support\SettingsStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NeedSupportController extends Controller
{
    private const STORE_KEY = 'needs_support_store';

    public function show(): JsonResponse
    {
        return response()->json(SettingsStore::get(self::STORE_KEY, ['items' => []]));
    }

    public function homepage(): JsonResponse
    {
        $store = SettingsStore::get(self::STORE_KEY, ['items' => []]);
        $items = collect($store['items'] ?? [])
            ->filter(fn ($i) => ($i['status'] ?? 'active') === 'active')
            ->values();

        return response()->json(['items' => $items]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => 'required|array',
        ]);

        SettingsStore::set(self::STORE_KEY, $data);

        return response()->json($data);
    }

    public function projects(): JsonResponse
    {
        return response()->json(
            Project::query()
                ->with(['village:id,village_name,slug'])
                ->where('status', 'active')
                ->get()
        );
    }
}
