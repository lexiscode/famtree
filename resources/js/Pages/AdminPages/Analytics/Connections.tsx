import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Link2,
    CheckCircle,
    Clock,
    XCircle,
    Users,
} from 'lucide-react';

interface DistributionItem {
    relationship_type: string;
    count: number;
}

interface StatusBreakdown {
    accepted: number;
    pending: number;
    declined: number;
}

interface MonthlyConnection {
    month: string;
    count: number;
}

interface Props {
    distribution: DistributionItem[];
    statusBreakdown: StatusBreakdown;
    monthlyConnections: MonthlyConnection[];
    avgConnectionsPerUser: number;
}

export default function ConnectionsAnalytics({ distribution, statusBreakdown, monthlyConnections, avgConnectionsPerUser }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const maxDistribution = distribution.length > 0 ? Math.max(...distribution.map(d => d.count)) : 1;
    const totalStatus = statusBreakdown.accepted + statusBreakdown.pending + statusBreakdown.declined;
    const maxMonthly = monthlyConnections.length > 0 ? Math.max(...monthlyConnections.map(m => m.count)) : 1;

    const statusCards = [
        { label: 'Accepted', value: statusBreakdown.accepted, icon: CheckCircle, iconClass: 'green' },
        { label: 'Pending', value: statusBreakdown.pending, icon: Clock, iconClass: 'amber' },
        { label: 'Declined', value: statusBreakdown.declined, icon: XCircle, iconClass: 'red' },
        { label: 'Avg Per User', value: avgConnectionsPerUser, icon: Users, iconClass: 'indigo' },
    ];

    const barColorClasses = ['indigo', 'green', 'blue', 'amber', 'red', 'purple'];

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

                {/* Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Connection Analytics</h1>
                    <p className="ap-page-subtitle">
                        Analyze family connection patterns, statuses, and relationship distributions
                    </p>
                </div>

                {/* Status Breakdown Cards */}
                <div className="ap-stats-grid">
                    {statusCards.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={idx} className="ap-stat-card">
                                <div className="ap-stat-card-header">
                                    <div className={`ap-stat-icon ${item.iconClass}`}>
                                        <Icon size={20} />
                                    </div>
                                </div>
                                <p className="ap-stat-label">{item.label}</p>
                                <p className="ap-stat-value">
                                    {typeof item.value === 'number' && item.value % 1 !== 0 ? item.value.toFixed(1) : item.value.toLocaleString()}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Distribution and Monthly Chart */}
                <div className="ap-grid-2">
                    {/* Relationship Type Distribution */}
                    <div className="ap-card ap-card-lg">
                        <h2 className="ap-card-title">Relationship Types</h2>
                        <p className="ap-card-subtitle ap-mb-xl">Distribution by relationship type</p>

                        <div className="ap-flex-col ap-gap-lg">
                            {distribution.length > 0 ? (
                                distribution.map((item, idx) => {
                                    const widthPercent = (item.count / maxDistribution) * 100;
                                    const colorClass = barColorClasses[idx % barColorClasses.length];
                                    return (
                                        <div key={idx} className="ap-progress-wrap ap-mb-0">
                                            <div className="ap-progress-header">
                                                <span className="ap-progress-label ap-capitalize">
                                                    {item.relationship_type.replace(/_/g, ' ')}
                                                </span>
                                                <span className="ap-progress-value">{item.count.toLocaleString()}</span>
                                            </div>
                                            <div className="ap-progress-track">
                                                <div
                                                    className={`ap-progress-bar ${colorClass}`}
                                                    style={{ width: `${widthPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="ap-empty">
                                    <p className="ap-empty-text">No data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Monthly Connections Chart */}
                    <div className="ap-card ap-card-lg">
                        <div className="ap-card-header">
                            <div>
                                <h2 className="ap-card-title">Monthly Connections</h2>
                                <p className="ap-card-subtitle">New connections per month</p>
                            </div>
                        </div>
                        <div className="ap-chart-bars">
                            {monthlyConnections.length > 0 ? (
                                monthlyConnections.map((item, i) => {
                                    const heightPercent = (item.count / maxMonthly) * 100;
                                    return (
                                        <div key={i} className="ap-chart-bar-col">
                                            <span className="ap-text-xs ap-font-semibold">{item.count}</span>
                                            <div
                                                className="ap-chart-bar info"
                                                style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                                title={`${item.month}: ${item.count} connections`}
                                            />
                                            <span className="ap-text-xs ap-text-secondary ap-nowrap">{item.month}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="ap-empty">
                                    <p className="ap-empty-text">No data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
