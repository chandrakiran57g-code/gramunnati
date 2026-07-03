<?php

namespace App\Http\Middleware;

use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful as SanctumMiddleware;
use Laravel\Sanctum\Sanctum;

class EnsureFrontendRequestsAreStateful extends SanctumMiddleware
{
    /**
     * Same-origin SPA requests (Laravel serves both UI and /api).
     */
    public static function fromFrontend($request): bool
    {
        if (parent::fromFrontend($request)) {
            return true;
        }

        $host = Str::lower($request->getHttpHost());

        return Collection::make(array_filter(config('sanctum.stateful', [])))->contains(function ($uri) use ($host) {
            $uri = $uri === Sanctum::$currentRequestHostPlaceholder ? $host : Str::lower($uri);

            return $host === $uri;
        });
    }
}
