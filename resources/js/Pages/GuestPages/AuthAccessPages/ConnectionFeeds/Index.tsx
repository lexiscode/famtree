import { useState, useCallback, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Plus, Search, Filter, Type, Mic, ArrowLeft } from 'lucide-react';
import { Post } from '@/types';
import ProfileSidebar from '../Stories/ProfileSidebar';
import PostCard from '../Stories/PostCard';
import ConnectionFeedsSidebar from './ConnectionFeedsSidebar';

interface User {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone: string | null;
    address: string | null;
    bio: string | null;
    date_of_birth: string | null;
    profile_image_url: string | null;
    status: string;
    job_title: string | null;
    education: string | null;
    created_at: string;
}

interface Stats {
    total_direct_connections: number;
    total_indirect_connections: number;
    total_connections: number;
    total_posts: number;
    visible_posts: number;
    hidden_posts: number;
}

interface ConnectionFeedsProps {
    user: User;
    posts: Post[];
    postCount: number;
    stats: Stats;
    topTrendingPosts: Post[];
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
}

export default function ConnectionFeedsIndex({
    user: currentUser,
    posts: initialPosts,
    postCount,
    stats,
    topTrendingPosts,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
}: ConnectionFeedsProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [filter, setFilter] = useState<'all' | 'text' | 'voice'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Filter and search posts
    const filteredPosts = useMemo(() => {
        let filtered = posts;

        // Apply type filter
        if (filter !== 'all') {
            filtered = filtered.filter(post => post.type === filter);
        }

        // Apply search
        if (searchQuery.trim()) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
            );
        }

        return filtered;
    }, [posts, filter, searchQuery]);

    // Handle post deletion
    const handlePostDeleted = useCallback((postId: number) => {
        setPosts(posts.filter(post => post.id !== postId));
    }, [posts]);

    // Handle search
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    // Handle filter change
    const handleFilterChange = useCallback((newFilter: 'all' | 'text' | 'voice') => {
        setFilter(newFilter);
        setSearchQuery('');
    }, []);

    return (
        <AuthAccessLayout>
            <div className="stories-page">
                <div className="stories-grid-layout">
                    {/* Left Sidebar - Profile */}
                    {currentUser && (
                        <div className="stories-left-sidebar">
                            <ProfileSidebar
                                user={currentUser}
                                connectionCount={connectionCount}
                                pendingRequestCount={pendingRequestCount}
                                sentRequestCount={sentRequestCount}
                                unreadNotificationCount={unreadNotificationCount}
                            />
                        </div>
                    )}

                    {/* Center Content - Connection Feeds */}
                    <div className="stories-center-content">
                        {/* Back Button */}
                        <button
                            className="back-button"
                            onClick={() => router.visit(route('home'))}
                            title="Back to profile"
                        >
                            <ArrowLeft size={20} />
                            Back to Profile
                        </button>

                        {/* Header */}
                        <div className="stories-header">
                            <div className="stories-title-section">
                                <div>
                                    <h1 className="stories-title">Connection Feeds</h1>
                                    <p className="stories-subtitle">Stories made from your direct and indirect connections</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Info */}
                        <div style={{
                            display: 'flex',
                            gap: '1.5rem',
                            marginBottom: '2rem',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{
                                flex: '1',
                                minWidth: '120px',
                                padding: '1rem',
                                background: 'rgba(0, 82, 232, 0.1)',
                                border: '1px solid rgba(0, 82, 232, 0.3)',
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0052E8' }}>
                                    {stats.total_direct_connections}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#b0b0b0', marginTop: '0.25rem' }}>
                                    Direct Connections
                                </div>
                            </div>

                            <div style={{
                                flex: '1',
                                minWidth: '120px',
                                padding: '1rem',
                                background: 'rgba(255, 215, 0, 0.1)',
                                border: '1px solid rgba(255, 215, 0, 0.3)',
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FFD700' }}>
                                    {stats.total_indirect_connections}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#b0b0b0', marginTop: '0.25rem' }}>
                                    Indirect Connections
                                </div>
                            </div>

                            <div style={{
                                flex: '1',
                                minWidth: '120px',
                                padding: '1rem',
                                background: 'rgba(0, 212, 255, 0.1)',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00D4FF' }}>
                                    {stats.visible_posts}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#b0b0b0', marginTop: '0.25rem' }}>
                                    Visible Posts
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="stories-controls">
                            {/* Search */}
                            <div className="stories-search">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search connection posts..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="search-input"
                                />
                            </div>

                            {/* Filters */}
                            <div className="stories-filters">
                                <button
                                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('all')}
                                >
                                    <Filter size={16} />
                                    All ({posts.length})
                                </button>
                                <button
                                    className={`filter-btn ${filter === 'text' ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('text')}
                                >
                                    <Type size={16} />
                                    Text Posts
                                </button>
                                <button
                                    className={`filter-btn ${filter === 'voice' ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('voice')}
                                >
                                    <Mic size={16} />
                                    Voice Posts
                                </button>
                            </div>
                        </div>

                        {/* Posts List */}
                        <div className="stories-list">
                            {filteredPosts.length > 0 ? (
                                filteredPosts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onPostDeleted={handlePostDeleted}
                                        isOwnPost={false}
                                    />
                                ))
                            ) : (
                                <div className="stories-empty">
                                    <div className="empty-icon">
                                        {filter === 'voice' ? <Mic size={48} /> : <Type size={48} />}
                                    </div>
                                    <h3 className="empty-title" style={{ color: '#9c9595ff' }}>
                                        {searchQuery.trim()
                                            ? 'No posts found'
                                            : stats.total_connections === 0
                                                ? 'No connections yet'
                                                : filter === 'voice'
                                                    ? 'No voice posts'
                                                    : filter === 'text'
                                                        ? 'No text posts'
                                                        : 'No posts from your connections'}
                                    </h3>
                                    <p className="empty-message" style={{ color: '#9c9595ff', textAlign: 'center', width: '100%', margin: '0 auto 1rem auto', display: 'block' }}>
                                        {searchQuery.trim()
                                            ? 'Try adjusting your search query'
                                            : stats.total_connections === 0
                                                ? 'Connect with other users to see their posts'
                                                : stats.hidden_posts > 0
                                                    ? `${stats.hidden_posts} post(s) are hidden due to privacy settings`
                                                    : 'Check back later for new posts'}
                                    </p>
                                    {searchQuery && (
                                        <button
                                            className="clear-search-btn"
                                            onClick={() => {
                                                setSearchQuery('');
                                            }}
                                        >
                                            Clear search
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Connection Stats & Trending Posts */}
                    {stats && (
                        <div className="stories-right-sidebar">
                            <ConnectionFeedsSidebar
                                directConnections={stats.total_direct_connections}
                                indirectConnections={stats.total_indirect_connections}
                                totalPosts={stats.total_posts}
                                visiblePosts={stats.visible_posts}
                                hiddenPosts={stats.hidden_posts}
                                topPosts={topTrendingPosts}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
