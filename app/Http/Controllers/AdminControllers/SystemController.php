<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\SystemService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemController extends Controller
{
    public function __construct(
        private SystemService $systemService
    ) {
    }

    /**
     * Display scheduled tasks
     */
    public function scheduler()
    {
        $tasks = $this->systemService->getScheduledTasks();

        return Inertia::render('AdminPages/System/Scheduler', [
            'tasks' => $tasks,
        ]);
    }

    /**
     * Display system health status
     */
    public function health()
    {
        $healthData = $this->systemService->getHealthStatus();

        return Inertia::render('AdminPages/System/Health', [
            'health' => $healthData,
        ]);
    }

    /**
     * Display failed jobs
     */
    public function failedJobs(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $page = $request->input('page', 1);

        $data = $this->systemService->getFailedJobs($perPage, $page);

        return Inertia::render('AdminPages/System/Scheduler', [
            'failedJobs' => $data,
            'perPage' => $perPage,
            'viewType' => 'failed_jobs',
        ]);
    }

    /**
     * Retry a failed job
     */
    public function retryJob(string $uuid)
    {
        $success = $this->systemService->retryJob($uuid);

        if ($success) {
            return redirect()->back()->with('success', 'Failed job has been queued for retry');
        }

        return redirect()->back()->with('error', 'Failed to retry job');
    }

    /**
     * Run a scheduled task
     */
    public function runTask(Request $request)
    {
        $data = $request->validate([
            'command' => 'required|string|max:255',
        ]);

        $result = $this->systemService->runTask($data['command']);

        if ($result['success']) {
            return redirect()->back()->with('success', 'Task executed successfully');
        }

        return redirect()->back()->with('error', 'Failed to execute task: ' . $result['output']);
    }
}
