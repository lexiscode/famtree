import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FileText,
    MessageSquare,
    Mic,
    Eye,
    MessageCircle,
    Heart,
} from 'lucide-react';

interface PostsByType {
    text: number;
    voice: number;
}

interface Engagement {
    avg_views: number;
    avg_comments: number;
    avg_reactions: number;
}

interface TopPost {
    id: number;
    content_preview: string;
    views_count: number;
    reactions_count: number;
    user_name: string;
}

interface MonthlyPost {
    month: string;
    count: number;
}

interface Props {
    postsByType: PostsByType;
    engagement: Engagement;
    topPosts: TopPost[];
    monthlyPosts: MonthlyPost[];
}

export default function ContentAnalytics({ postsByType, engagement, topPosts, monthlyPosts }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const totalPosts = postsByType.text + postsByType.voice;
    const maxMonthly = monthlyPosts.length > 0 ? Math.max(...monthlyPosts.map(m => m.count)) : 1;

    const postTypeCards = [
        { label: 'Text Posts', value: postsByType.text, icon: MessageSquare, iconClass: 'indigo' },
        { label: 'Voice Posts', value: postsByType.voice, icon: Mic, iconClass: 'green' },
    ];

    const engagementItems = [
        { label: 'Avg Views', value: engagement.avg_views, icon: Eye, iconClass: 'indigo' },
        { label: 'Avg Comments', value: engagement.avg_comments, icon: MessageCircle, iconClass: 'blue' },
        { label: 'Avg Reactions', value: engagement.avg_reactions, icon: Heart, iconClass: 'red' },
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
                    <h1 className="ap-page-title">Content Analytics</h1>
                    <p className="ap-page-subtitle">
                        Analyze content performance, engagement metrics, and posting trends
                    </p>
                </div>

                {/* Posts by Type and Engagement */}
                <div className="ap-grid-2 ap-mb-xl">
                    {/* Posts by Type */}
                    <div className="ap-grid-2">
                        {postTypeCards.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div key={idx} className="ap-stat-card">
                                    <div className="ap-stat-card-header">
                                        <div className={`ap-stat-icon ${item.iconClass}`}>
                                            <Icon size={20} />
                                        </div>
                                    </div>
                                    <p className="ap-stat-label">{item.label}</p>
                                    <p className="ap-stat-value">{item.value.toLocaleString()}</p>
                                    <p className="ap-text-xs ap-text-secondary ap-mt-sm">
                                        {totalPosts > 0 ? Math.round((item.value / totalPosts) * 100) : 0}% of total
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Engagement Metrics */}
                    <div className="ap-card ap-card-lg">
                        <h2 className="ap-card-title">Engagement Metrics</h2>
                        <p className="ap-card-subtitle ap-mb-xl">Average per post</p>

                        <div className="ap-flex-col ap-gap-lg">
                            {engagementItems.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx} className="ap-activity-item">
                                        <div className={`ap-stat-icon ${item.iconClass}`}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="ap-flex-1">
                                            <p className="ap-text-sm ap-text-secondary ap-font-semibold ap-mb-0">{item.label}</p>
                                        </div>
                                        <p className="ap-stat-value ap-mb-0">{item.value.toLocaleString()}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Monthly Activity Chart */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-card-header">
                        <div>
                            <h2 className="ap-card-title">Monthly Post Activity</h2>
                            <p className="ap-card-subtitle">Posts created per month</p>
                        </div>
                    </div>
                    <div className="ap-chart-bars">
                        {monthlyPosts.length > 0 ? (
                            monthlyPosts.map((item, i) => {
                                const heightPercent = (item.count / maxMonthly) * 100;
                                return (
                                    <div key={i} className="ap-chart-bar-col">
                                        <span className="ap-text-xs ap-font-semibold">{item.count}</span>
                                        <div
                                            className="ap-chart-bar green"
                                            style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                            title={`${item.month}: ${item.count} posts`}
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

                {/* Top Posts Table */}
                <div className="ap-table-wrap">
                    <div className="ap-card-header">
                        <div>
                            <h2 className="ap-card-title">Top Performing Posts</h2>
                            <p className="ap-card-subtitle">Highest engagement posts</p>
                        </div>
                    </div>
                    {topPosts.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Content</th>
                                        <th>Author</th>
                                        <th>Views</th>
                                        <th>Reactions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topPosts.map((post, idx) => (
                                        <tr key={post.id}>
                                            <td>
                                                <span className={`ap-badge ${idx < 3 ? 'ap-badge-primary' : 'ap-badge-neutral'}`}>
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td className="ap-truncate-md">
                                                {post.content_preview}
                                            </td>
                                            <td className="ap-font-semibold">{post.user_name}</td>
                                            <td>
                                                <div className="ap-flex ap-items-center ap-gap-xs">
                                                    <Eye size={14} className="ap-icon-primary" />
                                                    <span className="ap-font-semibold">{post.views_count.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ap-flex ap-items-center ap-gap-xs">
                                                    <Heart size={14} className="ap-icon-danger" />
                                                    <span className="ap-font-semibold">{post.reactions_count.toLocaleString()}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <FileText size={24} />
                            </div>
                            <p className="ap-empty-title">No posts data available</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
