import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users,
    BarChart3,
    TrendingUp,
    AlertCircle,
    Activity,
    GitBranch,
    Clock,
    AlertTriangle,
    CheckCircle,
    ArrowUpRight,
    ArrowRight,
    Shield,
    FileText,
    Eye,
} from 'lucide-react';

interface Metric {
    totalUsers: number;
    activeUsers: number;
    totalConnections: number;
    totalFamilyTrees: number;
    pendingReports: number;
}

interface GrowthData {
    date: string;
    count: number;
}

interface Stats {
    total: number;
    accepted: number;
    pending: number;
    declined: number;
}

interface ReportStats {
    total: number;
    pending: number;
    reviewing: number;
    resolved: number;
    dismissed: number;
}

interface ActivityLog {
    id: number;
    admin: string;
    action: string;
    description: string;
    timestamp: string;
}

interface Alert {
    type: 'warning' | 'alert';
    message: string;
    priority: 'high' | 'critical';
}

interface SharedProps {
    auth?: {
        admin?: {
            id: number;
            username: string;
            email: string;
        };
    };
    flash?: {
        success?: string;
        error?: string;
    };
    metrics?: Metric;
    userGrowth?: GrowthData[];
    connectionStats?: Stats;
    reportStats?: ReportStats;
    recentActivity?: ActivityLog[];
    alerts?: Alert[];
}

export default function AdminDashboard() {
    const { auth, metrics, userGrowth, connectionStats, reportStats, recentActivity, alerts } = usePage<SharedProps>().props;

    const statCards = [
        {
            title: 'Total Users',
            value: (metrics?.totalUsers || 0).toLocaleString(),
            icon: Users,
            colorClass: 'indigo',
            change: '+12%',
            changeUp: true,
        },
        {
            title: 'Active Users',
            value: (metrics?.activeUsers || 0).toLocaleString(),
            icon: Activity,
            colorClass: 'green',
            change: '+8%',
            changeUp: true,
        },
        {
            title: 'Pending Reports',
            value: (metrics?.pendingReports || 0).toString(),
            icon: AlertCircle,
            colorClass: 'red',
            change: metrics?.pendingReports ? `${metrics.pendingReports} new` : '0',
            changeUp: false,
        },
        {
            title: 'Family Trees',
            value: (metrics?.totalFamilyTrees || 0).toLocaleString(),
            icon: GitBranch,
            colorClass: 'purple',
            change: '+5%',
            changeUp: true,
        },
    ];

    const quickActions = [
        { label: 'View Users', icon: Users, href: route('admin.users.index'), color: 'indigo' },
        { label: 'Reports', icon: AlertTriangle, href: route('admin.reports.index'), color: 'amber' },
        { label: 'Analytics', icon: BarChart3, href: route('admin.analytics.overview'), color: 'blue' },
        { label: 'Security', icon: Shield, href: route('admin.security.dashboard'), color: 'green' },
    ];

    return (
        <AdminLayout>
            {/* Welcome Header */}
            <div className="ap-welcome-banner">
                <div className="ap-welcome-content">
                    <h1 className="ap-welcome-title">Welcome back, {auth?.admin?.username}</h1>
                    <p className="ap-welcome-subtitle">Here's what's happening with your platform today</p>
                </div>
                <div className="ap-welcome-actions">
                    {quickActions.map((action, i) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={i}
                                className="ap-quick-action"
                                onClick={() => router.get(action.href)}
                            >
                                <Icon size={16} />
                                <span>{action.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="ap-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <p className="ap-stat-label">{stat.title}</p>
                                <div className={`ap-stat-icon ${stat.colorClass}`}>
                                    <Icon size={18} strokeWidth={1.8} />
                                </div>
                            </div>
                            <p className="ap-stat-value">{stat.value}</p>
                            <div className="ap-stat-footer">
                                <span className={`ap-stat-trend ${stat.changeUp ? 'up' : 'down'}`}>
                                    <ArrowUpRight size={12} />
                                    {stat.change}
                                </span>
                                <span className="ap-stat-period">vs last month</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Alerts Section */}
            {alerts && alerts.length > 0 && (
                <div className="ap-mb-lg">
                    {alerts.map((alert, i) => (
                        <div
                            key={i}
                            className={`ap-alert ${alert.type === 'alert' ? 'ap-alert-danger' : 'ap-alert-warning'}`}
                        >
                            <AlertTriangle size={16} />
                            <div className="ap-flex-1">
                                <p className="ap-alert-title">{alert.message}</p>
                            </div>
                            <button className="ap-btn ap-btn-sm ap-btn-ghost">
                                <Eye size={14} /> View
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Content Grid */}
            <div className="ap-grid-2 ap-mb-xl">
                {/* Activity Chart */}
                <div className="ap-card ap-card-lg">
                    <div className="ap-card-header">
                        <div>
                            <h2 className="ap-card-title">User Growth</h2>
                            <p className="ap-card-subtitle">New user registrations over time</p>
                        </div>
                        <select className="ap-filter-select ap-filter-select-sm">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last 90 days</option>
                        </select>
                    </div>
                    <div className="ap-chart-bars">
                        {userGrowth && userGrowth.length > 0 ? (
                            (() => {
                                const maxCount = Math.max(...userGrowth.map(d => d.count)) || 1;
                                return userGrowth.map((item, i) => {
                                    const heightPercent = (item.count / maxCount) * 100;
                                    return (
                                        <div key={i} className="ap-chart-bar-col">
                                            <div
                                                className="ap-chart-bar"
                                                style={{ height: `${Math.max(heightPercent, 4)}%`, width: '100%' }}
                                                title={`${item.date}: ${item.count} new users`}
                                            />
                                            <span className="ap-text-xs ap-text-tertiary">{item.date.slice(-2)}</span>
                                        </div>
                                    );
                                });
                            })()
                        ) : (
                            <div className="ap-empty" style={{ width: '100%' }}>
                                <p className="ap-empty-text">No growth data available yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Platform Health */}
                <div className="ap-card ap-card-lg">
                    <div className="ap-card-header">
                        <div>
                            <h2 className="ap-card-title">Platform Health</h2>
                            <p className="ap-card-subtitle">Connections & reports overview</p>
                        </div>
                    </div>

                    <div className="ap-flex-col ap-gap-lg">
                        {/* Connections */}
                        <div className="ap-health-metric">
                            <div className="ap-health-metric-header">
                                <div className="ap-flex ap-items-center ap-gap-sm">
                                    <div className="ap-health-dot green" />
                                    <span className="ap-font-medium">Connections</span>
                                </div>
                                <span className="ap-text-sm ap-text-secondary">
                                    {connectionStats?.accepted || 0} / {connectionStats?.total || 0} accepted
                                </span>
                            </div>
                            <div className="ap-progress-track">
                                <div
                                    className="ap-progress-bar green"
                                    style={{ width: `${connectionStats && connectionStats.total ? (connectionStats.accepted / connectionStats.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Reports */}
                        <div className="ap-health-metric">
                            <div className="ap-health-metric-header">
                                <div className="ap-flex ap-items-center ap-gap-sm">
                                    <div className="ap-health-dot blue" />
                                    <span className="ap-font-medium">Reports Resolved</span>
                                </div>
                                <span className="ap-text-sm ap-text-secondary">
                                    {reportStats?.resolved || 0} / {reportStats?.total || 0}
                                </span>
                            </div>
                            <div className="ap-progress-track">
                                <div
                                    className="ap-progress-bar blue"
                                    style={{ width: `${reportStats && reportStats.total ? (reportStats.resolved / reportStats.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Pending Reports */}
                        {reportStats && reportStats.pending > 0 && (
                            <div className="ap-alert ap-alert-warning ap-mb-0">
                                <AlertTriangle size={16} />
                                <div className="ap-flex-1">
                                    <p className="ap-alert-title">{reportStats.pending} pending reports</p>
                                    <p className="ap-alert-text">Requires review and action</p>
                                </div>
                                <button
                                    className="ap-btn ap-btn-sm ap-btn-warning"
                                    onClick={() => router.get(route('admin.reports.index'))}
                                >
                                    Review <ArrowRight size={14} />
                                </button>
                            </div>
                        )}

                        {/* Quick Stats Row */}
                        <div className="ap-quick-stats-row">
                            <div className="ap-quick-stat">
                                <span className="ap-quick-stat-value">{connectionStats?.pending || 0}</span>
                                <span className="ap-quick-stat-label">Pending</span>
                            </div>
                            <div className="ap-quick-stat-divider" />
                            <div className="ap-quick-stat">
                                <span className="ap-quick-stat-value">{connectionStats?.declined || 0}</span>
                                <span className="ap-quick-stat-label">Declined</span>
                            </div>
                            <div className="ap-quick-stat-divider" />
                            <div className="ap-quick-stat">
                                <span className="ap-quick-stat-value">{reportStats?.reviewing || 0}</span>
                                <span className="ap-quick-stat-label">Reviewing</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="ap-card ap-card-lg">
                <div className="ap-card-header">
                    <div>
                        <h2 className="ap-card-title">Recent Activity</h2>
                        <p className="ap-card-subtitle">Latest admin actions and system events</p>
                    </div>
                    <button
                        className="ap-btn ap-btn-sm ap-btn-secondary"
                        onClick={() => router.get(route('admin.security.auditLog'))}
                    >
                        View All <ArrowRight size={14} />
                    </button>
                </div>
                <div className="ap-scroll-list">
                    {recentActivity && recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                            <div key={activity.id} className="ap-activity-item">
                                <div className="ap-activity-icon">
                                    <CheckCircle size={16} />
                                </div>
                                <div className="ap-activity-content">
                                    <p className="ap-activity-title">{activity.description}</p>
                                    <p className="ap-activity-sub">By {activity.admin} &bull; {activity.action}</p>
                                </div>
                                <div className="ap-activity-time">
                                    <Clock size={12} />
                                    {activity.timestamp}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <FileText size={24} />
                            </div>
                            <p className="ap-empty-title">No recent activities</p>
                            <p className="ap-empty-text">Admin actions will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
