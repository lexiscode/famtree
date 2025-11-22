<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Inertia\Inertia;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Handle 403 errors on profile viewing for Inertia requests
        $this->renderable(function (HttpException $e, $request) {
            if ($e->getStatusCode() === 403 && $request->is('profile/*') && $request->wantsJson()) {
                // Return JSON error response that Inertia can catch
                return response()->json(['message' => $e->getMessage()], 403);
            }
        });
    }
}
