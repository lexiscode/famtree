import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users,
    BarChart3,
    TrendingUp,
    AlertCircle,
    Activity,
    MessageSquare,
    FileText,
    Clock,
    AlertTriangle,
    CheckCircle,
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

interface StatCard {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    colorClass: string;
}

const StatCard = ({ title, value, icon, trend, colorClass }: StatCard) => (
    <div className="ap-stat-card">
        <div className="ap-stat-card-header">
            <div className={`ap-stat-icon ${colorClass}`}>
                {icon}
            </div>
            {trend && (
                <span className={`ap-stat-trend ${trend.includes('+') ? 'up' : 'down'}`}>
                    {trend.includes('+') ? '↑' : '↓'} {trend}
                </span>
            )}
        </div>
        <p className="ap-stat-label">{title}</p>
        <p className="ap-stat-value">{value}</p>
    </div>
);

export default function AdminDashboard() {
    const { auth, flash, metrics, userGrowth, connectionStats, reportStats, recentActivity, alerts } = usePage<SharedProps>().props;

    // Build stat cards from real data
    const statCards = [
        {
            title: 'Total Users',
            value: (metrics?.totalUsers || 0).toLocaleString(),
            icon: <Users size={20} />,
            colorClass: 'indigo',
        },
        {
            title: 'Active Users',
            value: (metrics?.activeUsers || 0).toLocaleString(),
            icon: <Activity size={20} />,
            colorClass: 'green',
        },
        {
            title: 'Pending Reports',
            value: (metrics?.pendingReports || 0).toString(),
            icon: <AlertCircle size={20} />,
            colorClass: 'red',
        },
        {
            title: 'Family Trees',
            value: (metrics?.totalFamilyTrees || 0).toLocaleString(),
            icon: <BarChart3 size={20} />,
            colorClass: 'purple',
        },
    ];

    return (
        <AdminLayout>
{/* Page Header */}
            <div className="ap-page-header">
                <h1 className="ap-page-title">Welcome back, {auth?.admin?.username}</h1>
                <p className="ap-page-subtitle">Here's what's happening with your platform today</p>
            </div>

            {/* Stats Grid */}
            <div className="ap-stats-grid">
                {statCards.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        colorClass={stat.colorClass}
                    />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="ap-grid-2 ap-mb-xl">
                {/* Activity Chart */}
                <div className="ap-card ap-card-lg">
                    <div className="ap-card-header">
                        <div>
                            <h2 className="ap-card-title">Activity Overview</h2>
                            <p className="ap-card-subtitle">User engagement trends</p>
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
                                        <div
                                            key={i}
                                            className="ap-chart-bar"
                                            style={{ height: `${heightPercent}%` }}
                                            title={`${item.date}: ${item.count} new users`}
                                        />
                                    );
                                });
                            })()
                        ) : (
                            <div className="ap-empty">
                                <p className="ap-empty-text">No data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistics */}
                <div className="ap-card ap-card-lg">
                    <div>
                        <h2 className="ap-card-title">Platform Statistics</h2>
                        <p className="ap-card-subtitle">User connections & reports overview</p>
                    </div>
                    <div className="ap-flex-col ap-gap-lg ap-mt-lg">
                        {/* Connections Stats */}
                        <div className="ap-progress-wrap">
                            <div className="ap-progress-header">
                                <span className="ap-progress-label">Accepted Connections</span>
                                <span className="ap-progress-value">
                                    {connectionStats?.accepted || 0} / {connectionStats?.total || 0}
                                </span>
                            </div>
                            <div className="ap-progress-track">
                                <div
                                    className="ap-progress-bar green"
                                    style={{ width: `${connectionStats ? (connectionStats.accepted / connectionStats.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Reports Stats */}
                        <div className="ap-progress-wrap">
                            <div className="ap-progress-header">
                                <span className="ap-progress-label">Resolved Reports</span>
                                <span className="ap-progress-value">
                                    {reportStats?.resolved || 0} / {reportStats?.total || 0}
                                </span>
                            </div>
                            <div className="ap-progress-track">
                                <div
                                    className="ap-progress-bar blue"
                                    style={{ width: `${reportStats ? (reportStats.resolved / reportStats.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Pending Reports Alert */}
                        {reportStats && reportStats.pending > 0 && (
                            <div className="ap-alert ap-alert-warning">
                                <AlertTriangle size={16} />
                                <div>
                                    <p className="ap-alert-title">{reportStats.pending} Pending Reports</p>
                                    <p className="ap-alert-text">Requires review and action</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            {alerts && alerts.length > 0 && (
                <div className="ap-section">
                    <h3 className="ap-section-title">Active Alerts</h3>
                    {alerts.map((alert, i) => (
                        <div
                            key={i}
                            className={`ap-alert ${alert.type === 'alert' ? 'ap-alert-danger' : 'ap-alert-warning'}`}
                        >
                            <AlertTriangle size={16} />
                            <div>
                                <p className="ap-alert-title">{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Recent Activities */}
            <div className="ap-card ap-card-lg">
                <div className="ap-card-header">
                    <div>
                        <h2 className="ap-card-title">Recent Admin Activities</h2>
                        <p className="ap-card-subtitle">Latest admin actions and system events</p>
                    </div>
                </div>
                <div className="ap-scroll-list">
                    {recentActivity && recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                            <div key={activity.id} className="ap-activity-item">
                                <div className="ap-activity-icon">
                                    <CheckCircle size={18} />
                                </div>
                                <div className="ap-activity-content">
                                    <p className="ap-activity-title">{activity.description}</p>
                                    <p className="ap-activity-sub">By {activity.admin} &bull; {activity.action}</p>
                                </div>
                                <div className="ap-activity-time">
                                    <Clock size={13} />
                                    {activity.timestamp}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="ap-empty">
                            <p className="ap-empty-text">No recent activities</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
