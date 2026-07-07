<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated — please log in first.'], 401);
        }

        // Check for 'Super Admin' role (the canonical name used everywhere).
        // Also accept 'SuperAdmin' (no space) for backward compatibility.
        $isAdmin = $user->roles()
            ->whereIn('name', ['Super Admin', 'SuperAdmin'])
            ->exists();

        if (! $isAdmin) {
            return response()->json([
                'message' => 'Forbidden — your account does not have admin privileges.',
            ], 403);
        }

        return $next($request);
    }
}
