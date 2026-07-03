<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\Village;
use App\Support\SettingsStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActiveWorkController extends Controller
{
    private const STORE_KEY = 'active_work_store';

    public function show(): JsonResponse
    {
        return response()->json(SettingsStore::get(self::STORE_KEY, [
            'categories' => [],
            'items' => [],
            'entity_templates' => [],
        ]));
    }

    public function publicBundle(): JsonResponse
    {
        $store = SettingsStore::get(self::STORE_KEY, ['categories' => [], 'items' => [], 'entity_templates' => []]);

        return response()->json([
            'store' => $store,
            'villages' => Village::query()->where('is_active', true)->get(),
            'schools' => School::query()->where('is_active', true)->get(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'categories' => 'nullable|array',
            'items' => 'nullable|array',
            'entity_templates' => 'nullable|array',
        ]);

        $current = SettingsStore::get(self::STORE_KEY, [
            'categories' => [],
            'items' => [],
            'entity_templates' => [],
        ]);

        $merged = array_merge($current, array_filter($data, fn ($v) => $v !== null));
        SettingsStore::set(self::STORE_KEY, $merged);

        return response()->json($merged);
    }
}
