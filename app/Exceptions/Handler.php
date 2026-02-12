<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
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
                return response()->json(['message' => $e->getMessage()], 403);
            }

            // Catch any 403 HttpException on org routes (Gate denials become AccessDeniedHttpException)
            if ($e->getStatusCode() === 403 && $request->is('org/*')) {
                return redirect()->back(fallback: route('org.dashboard'))
                    ->with('error', 'You do not have permission to access this page.');
            }
        });

        // Also catch AuthorizationException directly on org routes
        $this->renderable(function (AuthorizationException $e, $request) {
            if ($request->is('org/*')) {
                return redirect()->back(fallback: route('org.dashboard'))
                    ->with('error', 'You do not have permission to access this page.');
            }
        });
    }
}
