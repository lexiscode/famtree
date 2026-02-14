import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BarChart3,
    Users,
    FileText,
    Link2,
    Building2,
    TrendingUp,
    TrendingDown,
    MessageSquare,
    Mic,
    Image,
} from 'lucide-react';

interface Metrics {
    total_users: number;
    total_posts: number;
    total_connections: number;
    total_organizations: number;
    user_growth_percent: number;
    post_growth_percent: number;
}

interface GrowthItem {
    month: string;
    count: number;
}

interface ContentBreakdown {
    text: number;
    voice: number;
    image: number;
}

interface Props {
    metrics: Metrics;
    userGrowth: GrowthItem[];
    contentBreakdown: ContentBreakdown;
}

export default function Overview({ metrics, userGrowth, contentBreakdown }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const totalContent = contentBreakdown.text + contentBreakdown.voice + contentBreakdown.image;
    const textPercent = totalContent > 0 ? Math.round((contentBreakdown.text / totalContent) * 100) : 0;
    const voicePercent = totalContent > 0 ? Math.round((contentBreakdown.voice / totalContent) * 100) : 0;
    const imagePercent = totalContent > 0 ? Math.round((contentBreakdown.image / totalContent) * 100) : 0;

    const metricCards = [
        {
            label: 'Total Users',
            value: metrics.total_users,
            icon: Users,
            iconClass: 'indigo',
            growth: metrics.user_growth_percent,
        },
        {
            label: 'Total Posts',
            value: metrics.total_posts,
            icon: FileText,
            iconClass: 'green',
            growth: metrics.post_growth_percent,
        },
        {
            label: 'Total Connections',
            value: metrics.total_connections,
            icon: Link2,
            iconClass: 'blue',
            growth: null,
        },
        {
            label: 'Total Organizations',
            value: metrics.total_organizations,
            icon: Building2,
            iconClass: 'amber',
            growth: null,
        },
    ];

    const maxGrowth = userGrowth.length > 0 ? Math.max(...userGrowth.map(g => g.count)) : 1;

    const contentItems = [
        { label: 'Text Posts', value: contentBreakdown.text, percent: textPercent, colorClass: 'indigo', icon: MessageSquare },
        { label: 'Voice Posts', value: contentBreakdown.voice, percent: voicePercent, colorClass: 'green', icon: Mic },
        { label: 'Image Posts', value: contentBreakdown.image, percent: imagePercent, colorClass: 'blue', icon: Image },
    ];

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
                    <h1 className="ap-page-title">Analytics Overview</h1>
                    <p className="ap-page-subtitle">
                        Monitor key platform metrics, user growth, and content performance at a glance
                    </p>
                </div>

                {/* Metric Cards */}
                <div className="ap-stats-grid">
                    {metricCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div className="ap-stat-card" key={idx}>
                                <div className="ap-stat-card-header">
                                    <div className={`ap-stat-icon ${card.iconClass}`}>
                                        <Icon size={20} />
                                    </div>
                                    {card.growth !== null && (
                                        <span className={`ap-stat-trend ${card.growth >= 0 ? 'up' : 'down'}`}>
                                            {card.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            {card.growth >= 0 ? '+' : ''}{card.growth}%
                                        </span>
                                    )}
                                </div>
                                <p className="ap-stat-label">{card.label}</p>
                                <p className="ap-stat-value">{card.value.toLocaleString()}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Row */}
                <div className="ap-grid-2 ap-mb-xl">
                    {/* User Growth Chart */}
                    <div className="ap-card ap-card-lg">
                        <div className="ap-card-header">
                            <div>
                                <h2 className="ap-card-title">User Growth</h2>
                                <p className="ap-card-subtitle">Monthly new user registrations</p>
                            </div>
                        </div>
                        <div className="ap-chart-bars">
                            {userGrowth.length > 0 ? (
                                userGrowth.map((item, i) => {
                                    const heightPercent = (item.count / maxGrowth) * 100;
                                    return (
                                        <div key={i} className="ap-chart-bar-col">
                                            <span className="ap-text-xs ap-font-semibold">{item.count}</span>
                                            <div
                                                className="ap-chart-bar"
                                                style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                                title={`${item.month}: ${item.count} users`}
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

                    {/* Content Breakdown */}
                    <div className="ap-card ap-card-lg">
                        <div className="ap-card-header">
                            <div>
                                <h2 className="ap-card-title">Content Breakdown</h2>
                                <p className="ap-card-subtitle">Posts by content type</p>
                            </div>
                        </div>

                        <div className="ap-flex-col ap-gap-xl">
                            {contentItems.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx} className="ap-progress-wrap ap-mb-0">
                                        <div className="ap-progress-header">
                                            <div className="ap-flex ap-items-center ap-gap-sm">
                                                <div className={`ap-stat-icon ${item.colorClass}`}>
                                                    <Icon size={18} />
                                                </div>
                                                <span className="ap-progress-label ap-font-semibold">{item.label}</span>
                                            </div>
                                            <div className="ap-flex ap-items-center ap-gap-sm">
                                                <span className="ap-progress-value">{item.value.toLocaleString()}</span>
                                                <span className={`ap-badge ap-badge-${item.colorClass === 'indigo' ? 'primary' : item.colorClass === 'green' ? 'success' : 'info'}`}>
                                                    {item.percent}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ap-progress-track">
                                            <div
                                                className={`ap-progress-bar ${item.colorClass}`}
                                                style={{ width: `${item.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <hr className="ap-divider" />
                        <p className="ap-text-sm ap-text-secondary ap-text-center ap-mb-0">
                            Total Content: <strong>{totalContent.toLocaleString()}</strong> posts
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
