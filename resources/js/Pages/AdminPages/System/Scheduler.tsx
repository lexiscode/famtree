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
    Zap,
    Terminal,
    CalendarClock,
} from 'lucide-react';

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

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

    const getStatusBadge = (status: string | null) => {
        if (!status || status === 'never') {
            return {
                label: 'Never',
                color: THEME.secondary,
                bg: '#f3f4f6',
                border: '#d1d5db',
                icon: MinusCircle,
            };
        }
        if (status === 'success') {
            return {
                label: 'Success',
                color: '#155724',
                bg: '#e8f5e9',
                border: THEME.success,
                icon: CheckCircle,
            };
        }
        return {
            label: 'Failed',
            color: '#842029',
            bg: '#f8d7da',
            border: THEME.danger,
            icon: XCircle,
        };
    };

    const statCards = [
        { label: 'Total Tasks', value: statistics.total_tasks, icon: ListChecks, color: THEME.primary, lightColor: '#e7f1ff' },
        { label: 'Failed Jobs', value: statistics.failed_jobs, icon: AlertTriangle, color: THEME.danger, lightColor: '#f8d7da' },
    ];

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Flash Messages */}
                {(flash?.success || flash?.error) && (
                    <div
                        style={{
                            marginBottom: '2rem',
                            padding: '1.25rem 1.5rem',
                            borderRadius: '12px',
                            background: flash?.error
                                ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                            border: `1px solid ${flash?.error ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)'}`,
                            color: flash?.error ? '#DC2626' : '#16A34A',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        {flash?.success || flash?.error}
                    </div>
                )}

                {/* Header */}
                <div
                    style={{
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                        borderRadius: '20px',
                        padding: '2.5rem',
                        color: '#FFFFFF',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 16px 48px rgba(13, 110, 253, 0.20)',
                    }}
                >
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '50%' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <Clock size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                Scheduled Tasks
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            Monitor and manage scheduled commands, background jobs, and task execution history
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Task scheduler and job queue monitoring
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem', marginBottom: '3rem' }}>
                    {statCards.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={idx}
                                style={{
                                    background: '#FFFFFF',
                                    borderRadius: '18px',
                                    padding: '1.75rem',
                                    border: `2.5px solid ${stat.lightColor}`,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = stat.color;
                                    e.currentTarget.style.boxShadow = `0 20px 48px ${stat.color}20, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = stat.lightColor;
                                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: stat.lightColor, borderRadius: '50%', opacity: 0.3, transform: 'translate(30%, -30%)' }} />
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {stat.label}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                        <p style={{ fontSize: '2.25rem', fontWeight: 800, color: stat.color, margin: 0, lineHeight: 1 }}>
                                            {stat.value}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '16px', backgroundColor: stat.lightColor }}>
                                            <Icon size={36} color={stat.color} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Scheduled Tasks Section */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#e7f1ff' }}>
                            <CalendarClock size={20} color={THEME.primary} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0a0e27' }}>
                            Scheduled Commands
                        </h2>
                    </div>

                    {tasks.length > 0 ? (
                        <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '2px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                            {['Name', 'Command', 'Schedule', 'Last Run', 'Status', 'Description', 'Actions'].map((h) => (
                                                <th key={h} style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map((task, idx) => {
                                            const badge = getStatusBadge(task.last_status);
                                            const BadgeIcon = badge.icon;
                                            return (
                                                <tr
                                                    key={idx}
                                                    style={{ borderBottom: '1.5px solid #E5E7EB', background: '#FFFFFF', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                                                >
                                                    <td style={{ padding: '1.2rem 1rem' }}>
                                                        <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27' }}>{task.name}</span>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Terminal size={14} color={THEME.secondary} />
                                                            <code style={{
                                                                fontSize: '0.85rem',
                                                                fontWeight: 600,
                                                                color: THEME.primary,
                                                                background: '#e7f1ff',
                                                                padding: '0.3rem 0.6rem',
                                                                borderRadius: '6px',
                                                                fontFamily: 'monospace',
                                                            }}>
                                                                {task.command}
                                                            </code>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1rem' }}>
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '0.4rem 0.75rem',
                                                            borderRadius: '8px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600,
                                                            backgroundColor: '#fff8e1',
                                                            color: '#856404',
                                                            border: '1.5px solid #ffe0b2',
                                                        }}>
                                                            {task.schedule}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                        {task.last_run_formatted || 'Never'}
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1rem' }}>
                                                        <div
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                paddingLeft: '0.75rem',
                                                                paddingRight: '0.75rem',
                                                                paddingTop: '0.5rem',
                                                                paddingBottom: '0.5rem',
                                                                borderRadius: '8px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 600,
                                                                border: `1.5px solid ${badge.border}`,
                                                                backgroundColor: badge.bg,
                                                                color: badge.color,
                                                            }}
                                                        >
                                                            <BadgeIcon size={14} />
                                                            <span>{badge.label}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1rem', maxWidth: '220px' }}>
                                                        <p style={{ fontSize: '0.92rem', color: '#4B5563', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                            {task.description}
                                                        </p>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1rem' }}>
                                                        <button
                                                            onClick={() => handleRunTask(task.command)}
                                                            disabled={runningTask === task.command}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.5rem',
                                                                paddingLeft: '1rem',
                                                                paddingRight: '1rem',
                                                                paddingTop: '0.6rem',
                                                                paddingBottom: '0.6rem',
                                                                background: runningTask === task.command ? '#e9ecef' : '#e8f5e9',
                                                                color: runningTask === task.command ? THEME.secondary : THEME.success,
                                                                border: `2.5px solid ${runningTask === task.command ? '#d1d5db' : '#c3e6cb'}`,
                                                                borderRadius: '10px',
                                                                fontSize: '0.87rem',
                                                                fontWeight: 700,
                                                                cursor: runningTask === task.command ? 'not-allowed' : 'pointer',
                                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                letterSpacing: '0.3px',
                                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                                opacity: runningTask === task.command ? 0.7 : 1,
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (runningTask !== task.command) {
                                                                    e.currentTarget.style.background = THEME.success;
                                                                    e.currentTarget.style.color = '#FFFFFF';
                                                                    e.currentTarget.style.borderColor = THEME.success;
                                                                    e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.success}35`;
                                                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (runningTask !== task.command) {
                                                                    e.currentTarget.style.background = '#e8f5e9';
                                                                    e.currentTarget.style.color = THEME.success;
                                                                    e.currentTarget.style.borderColor = '#c3e6cb';
                                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                }
                                                            }}
                                                        >
                                                            <Play size={15} strokeWidth={2.5} />
                                                            {runningTask === task.command ? 'Running...' : 'Run Now'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '4rem 2rem',
                            textAlign: 'center',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}>
                            <div style={{ width: '80px', height: '80px', background: '#F3F4F6', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Clock size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>No scheduled tasks</p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>No tasks have been configured for this application</p>
                        </div>
                    )}
                </div>

                {/* Failed Jobs Section */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f8d7da' }}>
                            <AlertTriangle size={20} color={THEME.danger} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0a0e27' }}>
                            Failed Jobs
                        </h2>
                        {failedJobs.length > 0 && (
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                background: '#f8d7da',
                                color: THEME.danger,
                                border: `1.5px solid ${THEME.danger}30`,
                            }}>
                                {failedJobs.length}
                            </span>
                        )}
                    </div>

                    <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '2px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        {failedJobs.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                            {['ID', 'Queue', 'Payload Preview', 'Exception Preview', 'Failed At', 'Actions'].map((h) => (
                                                <th key={h} style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {failedJobs.map((job) => (
                                            <tr
                                                key={job.id}
                                                style={{ borderBottom: '1.5px solid #E5E7EB', background: '#FFFFFF', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                                            >
                                                <td style={{ padding: '1.2rem 1rem' }}>
                                                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: THEME.danger }}>#{job.id}</span>
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '0.35rem 0.7rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600,
                                                        backgroundColor: '#e0f7fa',
                                                        color: '#0c5460',
                                                        border: '1.5px solid #b2ebf2',
                                                    }}>
                                                        {job.queue}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem', maxWidth: '200px' }}>
                                                    <code style={{
                                                        fontSize: '0.82rem',
                                                        color: '#4B5563',
                                                        fontFamily: 'monospace',
                                                        display: 'block',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        {job.payload_preview}
                                                    </code>
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem', maxWidth: '250px' }}>
                                                    <code style={{
                                                        fontSize: '0.82rem',
                                                        color: THEME.danger,
                                                        fontFamily: 'monospace',
                                                        display: 'block',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        background: '#fff5f5',
                                                        padding: '0.35rem 0.6rem',
                                                        borderRadius: '6px',
                                                    }}>
                                                        {job.exception_preview}
                                                    </code>
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                    {job.failed_at_formatted}
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem' }}>
                                                    <button
                                                        onClick={() => handleRetryJob(job.id)}
                                                        disabled={retryingJob === job.id}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.5rem',
                                                            paddingLeft: '1rem',
                                                            paddingRight: '1rem',
                                                            paddingTop: '0.6rem',
                                                            paddingBottom: '0.6rem',
                                                            background: retryingJob === job.id ? '#e9ecef' : '#e7f1ff',
                                                            color: retryingJob === job.id ? THEME.secondary : THEME.primary,
                                                            border: `2.5px solid ${retryingJob === job.id ? '#d1d5db' : '#cfe2ff'}`,
                                                            borderRadius: '10px',
                                                            fontSize: '0.87rem',
                                                            fontWeight: 700,
                                                            cursor: retryingJob === job.id ? 'not-allowed' : 'pointer',
                                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            letterSpacing: '0.3px',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                            opacity: retryingJob === job.id ? 0.7 : 1,
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (retryingJob !== job.id) {
                                                                e.currentTarget.style.background = THEME.primary;
                                                                e.currentTarget.style.color = '#FFFFFF';
                                                                e.currentTarget.style.borderColor = THEME.primary;
                                                                e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.primary}35`;
                                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (retryingJob !== job.id) {
                                                                e.currentTarget.style.background = '#e7f1ff';
                                                                e.currentTarget.style.color = THEME.primary;
                                                                e.currentTarget.style.borderColor = '#cfe2ff';
                                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }
                                                        }}
                                                    >
                                                        <RotateCcw size={15} strokeWidth={2.5} />
                                                        {retryingJob === job.id ? 'Retrying...' : 'Retry'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                <div style={{ width: '80px', height: '80px', background: '#e8f5e9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    <CheckCircle size={40} color={THEME.success} strokeWidth={1.5} />
                                </div>
                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>No failed jobs</p>
                                <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>All queued jobs have been processed successfully</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
