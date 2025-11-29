import { Users, Eye, Lock, Globe, TrendingUp, Heart, MessageCircle, Clock } from 'lucide-react';
import { Post } from '@/types';

interface ConnectionFeedsSidebarProps {
    directConnections: number;
    indirectConnections: number;
    totalPosts: number;
    visiblePosts: number;
    hiddenPosts: number;
    topPosts: Post[];
}

export default function ConnectionFeedsSidebar({
    directConnections,
    indirectConnections,
    totalPosts,
    visiblePosts,
    hiddenPosts,
    topPosts,
}: ConnectionFeedsSidebarProps) {
    const formatNumber = (num: number): string => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="engaged-sidebar">
            {/* Header */}
            <div className="engaged-sidebar-header">
                <div className="engaged-header-icon">
                    <Users size={24} />
                </div>
                <div>
                    <h3 className="engaged-header-title">Feeds Overview</h3>
                    <p className="engaged-header-subtitle">Your connection stats</p>
                </div>
            </div>

            {/* Connection Statistics */}
            <div className="engaged-stats-grid">
                {/* Direct Connections */}
                <div className="engaged-stat-card">
                    <div className="engaged-stat-icon posts" style={{ backgroundColor: 'rgba(0, 82, 232, 0.1)' }}>
                        <Users size={18} style={{ color: '#0052E8' }} />
                    </div>
                    <div className="engaged-stat-content">
                        <p className="engaged-stat-label">Direct</p>
                        <p className="engaged-stat-value">{directConnections}</p>
                        <p className="engaged-stat-breakdown">1st degree</p>
                    </div>
                </div>

                {/* Indirect Connections */}
                <div className="engaged-stat-card">
                    <div className="engaged-stat-icon reactions" style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}>
                        <Users size={18} style={{ color: '#FFD700' }} />
                    </div>
                    <div className="engaged-stat-content">
                        <p className="engaged-stat-label">Indirect</p>
                        <p className="engaged-stat-value">{indirectConnections}</p>
                        <p className="engaged-stat-breakdown">2nd degree</p>
                    </div>
                </div>

                {/* Visible Posts */}
                <div className="engaged-stat-card">
                    <div className="engaged-stat-icon comments" style={{ backgroundColor: 'rgba(0, 212, 255, 0.1)' }}>
                        <Eye size={18} style={{ color: '#00D4FF' }} />
                    </div>
                    <div className="engaged-stat-content">
                        <p className="engaged-stat-label">Visible</p>
                        <p className="engaged-stat-value">{visiblePosts}</p>
                        <p className="engaged-stat-breakdown">Can access</p>
                    </div>
                </div>

                {/* Hidden Posts */}
                <div className="engaged-stat-card">
                    <div className="engaged-stat-icon views" style={{ backgroundColor: 'rgba(220, 20, 60, 0.1)' }}>
                        <Lock size={18} style={{ color: '#DC143C' }} />
                    </div>
                    <div className="engaged-stat-content">
                        <p className="engaged-stat-label">Hidden</p>
                        <p className="engaged-stat-value">{hiddenPosts}</p>
                        <p className="engaged-stat-breakdown">Private posts</p>
                    </div>
                </div>
            </div>

            {/* Privacy Info Card */}
            <div className="engagement-score-card">
                <div className="score-header">
                    <span className="score-label">Privacy Info</span>
                    <span className="score-value">{totalPosts}</span>
                </div>
                <p className="score-text" style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#9c9595' }}>
                    Hidden posts are hidden due to privacy settings from their authors.
                </p>
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: '1rem',
                    fontSize: '0.8rem',
                    color: '#9c9595'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Globe size={14} />
                        <span>Public</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Users size={14} />
                        <span>Connected</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Lock size={14} />
                        <span>Private</span>
                    </div>
                </div>
            </div>

            {/* Top Trending Posts */}
            {topPosts.length > 0 && (
                <div className="engaged-posts-section">
                    <h4 className="engaged-posts-title">
                        <TrendingUp size={18} />
                        Top Trending Posts
                    </h4>

                    <div className="engaged-posts-list">
                        {topPosts.slice(0, 5).map((post, index) => {
                            const engagementScore =
                                (post.reactions_count * 2) +
                                (post.comments_count * 1.5) +
                                (post.views_count * 0.1);

                            return (
                                <div key={post.id} className="engaged-post-item">
                                    <div className="post-rank">#{index + 1}</div>
                                    <div className="post-info">
                                        <p className="post-title">{post.title || 'Untitled Post'}</p>
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
