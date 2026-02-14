import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Clock,
    ListChecks,
    AlertTriangle,
    Play,
    RotateCcw,
    CheckCircle,
    XCircle,
    MinusCircle,
} from 'lucide-react';

interface ScheduledTask {
    name: string;
    command: string;
    schedule: string;
    last_run: string | null;
    last_run_formatted: string | null;
    next_run: string | null;
    last_status: string | null;
    description: string;
}

interface FailedJob {
    id: number;
    uuid: string;
    connection: string;
    queue: string;
    payload_preview: string;
    exception_preview: string;
    failed_at: string;
    failed_at_formatted: string;
}

interface Props {
    tasks: ScheduledTask[];
    failedJobs: FailedJob[];
    statistics: {
        total_tasks: number;
        failed_jobs: number;
    };
}

function getStatusBadgeClass(status: string | null): string {
    if (!status || status === 'never') return 'ap-badge ap-badge-neutral';
    if (status === 'success') return 'ap-badge ap-badge-success';
    return 'ap-badge ap-badge-danger';
}

function getStatusLabel(status: string | null): string {
    if (!status || status === 'never') return 'Never';
    if (status === 'success') return 'Success';
    return 'Failed';
}

export default function Scheduler({ tasks, failedJobs, statistics }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [runningTask, setRunningTask] = useState<string | null>(null);
    const [retryingJob, setRetryingJob] = useState<number | null>(null);

    const handleRunTask = (command: string) => {
        setRunningTask(command);
        router.post(route('admin.system.runTask'), { command }, {
            preserveScroll: true,
            onFinish: () => setRunningTask(null),
        });
    };

    const handleRetryJob = (id: number) => {
        setRetryingJob(id);
        router.post(route('admin.system.retryJob'), { id }, {
            preserveScroll: true,
            onFinish: () => setRetryingJob(null),
        });
    };

    return (
        <AdminLayout>
            <div>
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="ap-flash ap-flash-success">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="ap-flash ap-flash-error">{flash.error}</div>
                )}

                {/* Page Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Scheduled Tasks</h1>
                    <p className="ap-page-subtitle">Monitor and manage scheduled commands, background jobs, and task execution history</p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    <div className="ap-stat-card">
                        <div className="ap-stat-card-header">
                            <div>
                                <p className="ap-stat-label">Total Tasks</p>
                                <p className="ap-stat-value">{statistics.total_tasks}</p>
                            </div>
                            <div className="ap-stat-icon indigo">
                                <ListChecks size={20} />
                            </div>
                        </div>
                    </div>
                    <div className="ap-stat-card">
                        <div className="ap-stat-card-header">
                            <div>
                                <p className="ap-stat-label">Failed Jobs</p>
                                <p className="ap-stat-value">{statistics.failed_jobs}</p>
                            </div>
                            <div className="ap-stat-icon red">
                                <AlertTriangle size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scheduled Tasks Table */}
                <div className="ap-section">
                    <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                        <Clock size={18} className="ap-icon-primary" />
                        Scheduled Commands
                    </h3>

                    <div className="ap-table-wrap">
                        {tasks.length > 0 ? (
                            <div className="ap-table-scroll">
                                <table className="ap-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Command</th>
                                            <th>Schedule</th>
                                            <th>Last Run</th>
                                            <th>Status</th>
                                            <th>Description</th>
                                            <th className="center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map((task, idx) => (
                                            <tr key={idx}>
                                                <td className="ap-font-semibold">{task.name}</td>
                                                <td>
                                                    <span className="ap-badge ap-badge-primary ap-font-mono">
                                                        {task.command}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="ap-badge ap-badge-warning">{task.schedule}</span>
                                                </td>
                                                <td className="secondary">{task.last_run_formatted || 'Never'}</td>
                                                <td>
                                                    <span className={getStatusBadgeClass(task.last_status)}>
                                                        {getStatusLabel(task.last_status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <p className="ap-truncate-md ap-text-secondary">{task.description}</p>
                                                </td>
                                                <td className="center">
                                                    <button
                                                        onClick={() => handleRunTask(task.command)}
                                                        disabled={runningTask === task.command}
                                                        className="ap-btn ap-btn-sm ap-btn-success"
                                                    >
                                                        <Play size={14} />
                                                        {runningTask === task.command ? 'Running...' : 'Run Now'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="ap-empty">
                                <div className="ap-empty-icon">
                                    <Clock size={24} />
                                </div>
                                <p className="ap-empty-title">No scheduled tasks</p>
                                <p className="ap-empty-text">No tasks have been configured for this application</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Failed Jobs Section */}
                <div className="ap-section">
                    <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                        <AlertTriangle size={18} className="ap-icon-danger" />
                        Failed Jobs
                        {failedJobs.length > 0 && (
                            <span className="ap-badge ap-badge-danger">{failedJobs.length}</span>
                        )}
                    </h3>

                    <div className="ap-table-wrap">
                        {failedJobs.length > 0 ? (
                            <div className="ap-table-scroll">
                                <table className="ap-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Queue</th>
                                            <th>Payload Preview</th>
                                            <th>Exception Preview</th>
                                            <th>Failed At</th>
                                            <th className="center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {failedJobs.map((job) => (
                                            <tr key={job.id}>
                                                <td className="ap-font-semibold">#{job.id}</td>
                                                <td>
                                                    <span className="ap-badge ap-badge-info">{job.queue}</span>
                                                </td>
                                                <td>
                                                    <code className="ap-truncate-md ap-font-mono-sm">
                                                        {job.payload_preview}
                                                    </code>
                                                </td>
                                                <td>
                                                    <code className="ap-truncate-md ap-text-danger ap-font-mono-sm">
                                                        {job.exception_preview}
                                                    </code>
                                                </td>
                                                <td className="secondary">{job.failed_at_formatted}</td>
                                                <td className="center">
                                                    <button
                                                        onClick={() => handleRetryJob(job.id)}
                                                        disabled={retryingJob === job.id}
                                                        className="ap-btn ap-btn-sm ap-btn-primary"
                                                    >
                                                        <RotateCcw size={14} />
                                                        {retryingJob === job.id ? 'Retrying...' : 'Retry'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="ap-empty">
                                <div className="ap-empty-icon">
                                    <CheckCircle size={24} />
                                </div>
                                <p className="ap-empty-title">No failed jobs</p>
                                <p className="ap-empty-text">All queued jobs have been processed successfully</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
