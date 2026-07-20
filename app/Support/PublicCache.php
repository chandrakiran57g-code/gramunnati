<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

class PublicCache
{
    public const TTL_SECONDS = 60;

    /** @var array<int, string> */
    public const KEYS = [
        'home:page-data',
        'home:stats',
        'home:impact',
    ];

    /**
     * Remember a public payload for a short window to absorb traffic spikes.
     */
    public static function remember(string $key, \Closure $callback): mixed
    {
        return Cache::remember($key, self::TTL_SECONDS, $callback);
    }

    /**
     * Drop cached public payloads — called after any admin content change so
     * edits show up almost immediately instead of waiting for TTL expiry.
     */
    public static function flush(): void
    {
        foreach (self::KEYS as $key) {
            Cache::forget($key);
        }
    }
}
