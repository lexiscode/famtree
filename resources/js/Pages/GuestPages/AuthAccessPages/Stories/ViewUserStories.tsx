import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Search, Filter, ArrowLeft, Type, Mic } from 'lucide-react';
import { Post, UserProfile } from '@/types';
import PostCard from './PostCard';
import ProfileSidebar from './ProfileSidebar';
import EngagedPostsSidebar from './EngagedPostsSidebar';

interface Props {
    user: UserProfile;
    userId: number;
    posts: Post[];
    postCount: number;
    stats: any;
    topPosts: Post[];
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
}

export default function ViewUserStories({
    user,
    userId,
    posts: initialPosts,
    postCount,
    stats,
    topPosts,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
}: Props) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [filter, setFilter] = useState<'all' | 'text' | 'voice'>('all');
    const [searchQuery, setSearchQuery] = useState('');

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

    // Handle filter change
    const handleFilterChange = (newFilter: 'all' | 'text' | 'voice') => {
        setFilter(newFilter);
    };

    // Handle post deletion
    const handlePostDeleted = (postId: number) => {
        setPosts(posts.filter(post => post.id !== postId));
    };

    // Handle search
    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <AuthAccessLayout>
            <div className="stories-page">
                <div className="stories-grid-layout">
                    {/* Left Sidebar - Profile */}
                    {user && (
                        <div className="stories-left-sidebar">
                            <ProfileSidebar
                                user={user}
                                connectionCount={connectionCount}
                                pendingRequestCount={pendingRequestCount}
                                sentRequestCount={sentRequestCount}
                                unreadNotificationCount={unreadNotificationCount}
                            />
                        </div>
                    )}

                    {/* Center Content - Stories */}
                    <div className="stories-center-content">
                        {/* Back Button */}
                        <button
                            className="back-button"
                            onClick={() => router.visit(route('profile.view', userId))}
                            title="Back to profile"
                        >
                            <ArrowLeft size={20} />
                            Back to Profile
                        </button>

                        {/* Header */}
                        <div className="stories-header">
                            <div className="stories-title-section">
                                <div>
                                    <h1 className="stories-title">{user.name}'s Stories</h1>
                                    <p className="stories-subtitle">View posts shared by {user.name}</p>
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
                                    placeholder={`Search ${user.name}'s posts...`}
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
                                            : filter === 'voice'
                                                ? `No voice posts from ${user.name}`
                                                : filter === 'text'
                                                    ? `No text posts from ${user.name}`
                                                    : `${user.name} hasn't shared any stories yet`}
                                    </h3>
                                    <p className="empty-message" style={{ color: '#9c9595ff', textAlign: 'center', width: '100%', margin: '0 auto 1rem auto', display: 'block' }}>
                                        {searchQuery.trim()
                                            ? 'Try adjusting your search query'
                                            : 'Come back later to see their stories'}
                                    </p>
                                    {searchQuery && (
                                        <button
                                            className="clear-search-btn"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setPosts(initialPosts);
                                            }}
                                        >
                                            Clear search
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Engagement Metrics */}
                    <div className="stories-right-sidebar">
                        <EngagedPostsSidebar
                            stats={stats}
                            topPosts={topPosts}
                        />
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
