<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // The API pipeline enables Sanctum's stateful CSRF for the localhost
        // test host. CSRF is verified in the browser flow; disable it here so
        // feature tests can exercise the JSON endpoints directly.
        $this->withoutMiddleware([
            \Laravel\Sanctum\Http\Middleware\ValidateCsrfToken::class,
            \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
        ]);
    }
}
