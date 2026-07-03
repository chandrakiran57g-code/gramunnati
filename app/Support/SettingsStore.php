<?php

namespace App\Support;

use App\Models\Setting;

class SettingsStore
{
    public static function get(string $key, mixed $default = null): mixed
    {
        $row = Setting::query()->where('key', $key)->first();

        if (! $row || $row->value === null || $row->value === '') {
            return $default;
        }

        $decoded = json_decode($row->value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $row->value;
    }

    public static function set(string $key, mixed $value): Setting
    {
        $stored = is_array($value) || is_object($value)
            ? json_encode($value, JSON_UNESCAPED_UNICODE)
            : (string) $value;

        return Setting::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $stored],
        );
    }
}
