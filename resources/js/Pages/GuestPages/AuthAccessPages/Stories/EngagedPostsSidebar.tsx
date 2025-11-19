import { BarChart3, Heart, MessageCircle, Eye, TrendingUp, Clock } from 'lucide-react';
import { Post, EngagementStats, EngagedPostsSidebarProps } from '@/types';

export default function EngagedPostsSidebar({ stats, topPosts }: EngagedPostsSidebarProps) {
    const totalEngagement = stats.total_reactions + stats.total_comments + stats.total_views;

    const formatNumber = (num: number): string => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="engaged-sidebar">
            {/* Header */}
            <div className="engaged-sidebar-header">
                <div className="engaged-header-icon">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <h3 className="engaged-header-title">Engagement Metrics</h3>
                    <p className="engaged-header-subtitle">Your story performance</p>
                </div>
            </div>

            {/* Stats Grid - Single Column */}
            <div className="engaged-stats-grid">
                {/* Total Posts */}
                <div className="engaged-stat-card">
                    <div className="engaged-stat-icon posts">
                        <BarChart3 size={18} />
                    </div>
                    <div className="engaged-stat-content">
                        <p className="engaged-stat-label">Posts</p>
                        <p className="engaged-stat-value">{stats.total_posts}</p>
                        <p className="engaged-stat-breakdown">
                            {stats.text_posts}T • {stats.voice_posts}V
                        </p>
                    </div>
                </div>

                {/* Total Reactions */}
                <div className="engaged-stat-card">
                    <div className="engaged-stat-icon reactions">
                        <Heart size={18} />
                    </div>
                    <div className="engaged-stat-content">
                        <p className="engaged-stat-label">Reactions</p>
                        <p className="engaged-stat-value">{formatNumber(stats.total_reactions)}</p>
                        <p className="engaged-stat-breakdown">❤️ 😍 😂 😮</p>
                    </div>
                </div>

                {/* Total Comments */}
                <div className="engaged-stat-card">
                    <div className="engaged-stat-icon comments">
                        <MessageCircle size={18} />
                    </div>
                    <div className="engaged-stat-content">
                        <p className="engaged-stat-label">Comments</p>
                        <p className="engaged-stat-value">{formatNumber(stats.total_comments)}</p>
                        <p className="engaged-stat-breakdown">Community feedback</p>
                    </div>
                </div>

                {/* Total Views */}
                <div className="engaged-stat-card">
                    <div className="engaged-stat-icon views">
                        <Eye size={18} />
                    </div>
                    <div className="engaged-stat-content">
                        <p className="engaged-stat-label">Views</p>
                        <p className="engaged-stat-value">{formatNumber(stats.total_views)}</p>
                        <p className="engaged-stat-breakdown">People reached</p>
                    </div>
                </div>
            </div>

            {/* Overall Engagement Score */}
            <div className="engagement-score-card">
                <div className="score-header">
                    <span className="score-label">Overall Engagement</span>
                    <span className="score-value">{formatNumber(totalEngagement)}</span>
                </div>
                <div className="score-bar">
                    <div className="score-fill"></div>
                </div>
                <p className="score-text">Keep creating amazing content!</p>
            </div>

            {/* Top #5 Performing Posts */}
            {topPosts.length > 0 && (
                <div className="engaged-posts-section">
                    <h4 className="engaged-posts-title">
                        <TrendingUp size={18} />
                        Top #5 Performing Posts
                    </h4>

                    <div className="engaged-posts-list">
                        {topPosts.map((post, index) => {
                            const engagementScore =
                                (post.reactions_count * 2) +
                                (post.comments_count * 1.5) +
                                (post.views_count * 0.1);

                            return (
                                <div key={post.id} className="engaged-post-item">
                                    <div className="post-rank">#{index + 1}</div>
                                    <div className="post-info">
                                        <p className="post-title">{post.title}</p>
                                        <div className="post-metrics">
                                            <span className="metric">
                                                <Heart size={14} />
                                                {formatNumber(post.reactions_count)}
                                            </span>
                                            <span className="metric">
                                                <MessageCircle size={14} />
                                                {formatNumber(post.comments_count)}
                                            </span>
                                            <span className="metric">
                                                <Eye size={14} />
                                                {formatNumber(post.views_count)}
                                            </span>
                                        </div>
                                        <div className="post-timestamp">
                                            <Clock size={12} />
                                            {post.created_at_human}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

        </div>
    );
}
