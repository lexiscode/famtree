import { useState, useCallback, useMemo } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import {
    Home, TrendingUp, Users, Bell, Plus, Heart, MessageCircle,
    User, Settings, BookOpen, UserPlus
} from 'lucide-react';
import CreatePostModal from '../Stories/CreatePostModal';
import PostCard from '../Stories/PostCard';
import './Feed.css';

interface FeedUser {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    username: string;
    email: string;
    profile_image_url: string | null;
    bio: string | null;
}

interface Post {
    id: number;
    type: string;
    title: string;
    content: string | null;
    voice_url: string | null;
    voice_duration: number;
    views_count: number;
    comments_count: number;
    reactions_count: number;
    user_reaction: string | null;
    images: Array<{ id: number; url: string; order: number }>;
    comments: any[];
    user: {
        id: number;
        name: string;
        username: string;
        profile_image_url: string | null;
    };
    created_at: string;
    created_at_human: string;
}

interface Notification {
    id: number;
    type: string;
    data: any;
    read_at: string | null;
    created_at: string;
}

interface SuggestedUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    profile_image_url: string | null;
    mutual_connections_count?: number;
}

interface FeedProps {
    user: FeedUser;
    stats: {
        connections: number;
        following: number;
        followers: number;
        posts: number;
    };
    followingPosts: Post[];
    connectionPosts: Post[];
    generalPosts: Post[];
    trendingPosts: Post[];
    recentNotifications: Notification[];
    suggestedUsers: SuggestedUser[];
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
}

export default function Feed({
    user,
    stats,
    followingPosts,
    connectionPosts,
    generalPosts,
    trendingPosts,
    recentNotifications,
    suggestedUsers,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
}: FeedProps) {
    const [activeTab, setActiveTab] = useState<'following' | 'connections' | 'general'>('following');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const currentPosts = useMemo(() => {
        switch (activeTab) {
            case 'following':
                return followingPosts;
            case 'connections':
                return connectionPosts;
            case 'general':
                return generalPosts;
            default:
                return followingPosts;
        }
    }, [activeTab, followingPosts, connectionPosts, generalPosts]);

    const handlePostCreated = useCallback(() => {
        setShowCreateModal(false);
        router.reload();
    }, []);

    const handlePostDeleted = useCallback(() => {
        router.reload();
    }, []);

    return (
        <AuthAccessLayout
            user={user}
            connectionCount={connectionCount}
            pendingRequestCount={pendingRequestCount}
            sentRequestCount={sentRequestCount}
            unreadNotificationCount={unreadNotificationCount}
        >
            <div className="feed-page">
                <div className="container-fluid py-4">
                    <div className="row g-4">
                        {/* Left Sidebar */}
                        <div className="col-lg-3">
                            <div className="sticky-sidebar">
                                <div className="card profile-card shadow-sm mb-4">
                                    <div className="card-body text-center">
                                        <div className="position-relative d-inline-block mb-3">
                                            {user.profile_image_url ? (
                                                <img
                                                    src={user.profile_image_url}
                                                    alt={user.name}
                                                    className="profile-avatar rounded-circle"
                                                />
                                            ) : (
                                                <div className="profile-avatar-fallback rounded-circle">
                                                    {user.first_name.charAt(0)}
                                                </div>
                                            )}
                                            <span className="online-badge"></span>
                                        </div>
                                        <h5 className="fw-bold mb-1">{user.name}</h5>
                                        <p className="text-muted small mb-2">@{user.username}</p>
                                        {user.bio && <p className="text-muted small bio-text">{user.bio}</p>}
                                    </div>

                                    <div className="stats-grid border-top pt-3 pb-2">
                                        <div className="row g-0">
                                            <div className="col-6 text-center py-2">
                                                <div className="stat-value text-primary fw-bold">{stats.posts}</div>
                                                <div className="stat-label text-muted small">Posts</div>
                                            </div>
                                            <div className="col-6 text-center py-2 border-start">
                                                <div className="stat-value text-info fw-bold">{stats.connections}</div>
                                                <div className="stat-label text-muted small">Connections</div>
                                            </div>
                                            <div className="col-6 text-center py-2 border-top">
                                                <div className="stat-value text-success fw-bold">{stats.following}</div>
                                                <div className="stat-label text-muted small">Following</div>
                                            </div>
                                            <div className="col-6 text-center py-2 border-start border-top">
                                                <div className="stat-value text-danger fw-bold">{stats.followers}</div>
                                                <div className="stat-label text-muted small">Followers</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="list-group list-group-flush">
                                        <Link href="/profile" className="list-group-item list-group-item-action d-flex align-items-center gap-2">
                                            <User size={18} />
                                            <span>My Profile</span>
                                        </Link>
                                        <Link href="/stories" className="list-group-item list-group-item-action d-flex align-items-center gap-2">
                                            <BookOpen size={18} />
                                            <span>My Stories</span>
                                        </Link>
                                        <Link href="/settings/account" className="list-group-item list-group-item-action d-flex align-items-center gap-2">
                                            <Settings size={18} />
                                            <span>Settings</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Feed */}
                        <div className="col-lg-6">
                            <div className="card create-post-card shadow-sm mb-4">
                                <div className="card-body">
                                    <div className="d-flex align-items-center gap-3">
                                        {user.profile_image_url ? (
                                            <img src={user.profile_image_url} alt={user.name} className="create-post-avatar rounded-circle" />
                                        ) : (
                                            <div className="create-post-avatar-fallback rounded-circle">{user.first_name.charAt(0)}</div>
                                        )}
                                        <button onClick={() => setShowCreateModal(true)} className="btn btn-light flex-grow-1 text-start text-muted rounded-pill">
                                            What's on your mind, {user.first_name}?
                                        </button>
                                        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary rounded-circle create-post-btn">
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="card feed-tabs-card shadow-sm mb-4">
                                <div className="card-header p-0 border-0">
                                    <ul className="nav nav-tabs nav-fill feed-tabs">
                                        <li className="nav-item">
                                            <button className={`nav-link ${activeTab === 'following' ? 'active' : ''}`} onClick={() => setActiveTab('following')}>
                                                <UserPlus size={18} className="me-2" />
                                                Following
                                                <span className="badge bg-primary ms-2">{followingPosts.length}</span>
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button className={`nav-link ${activeTab === 'connections' ? 'active' : ''}`} onClick={() => setActiveTab('connections')}>
                                                <Users size={18} className="me-2" />
                                                Connections
                                                <span className="badge bg-info ms-2">{connectionPosts.length}</span>
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button className={`nav-link ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
                                                <Home size={18} className="me-2" />
                                                Discover
                                                <span className="badge bg-success ms-2">{generalPosts.length}</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="posts-feed">
                                {currentPosts.length > 0 ? (
                                    currentPosts.map((post) => (
                                        <div key={post.id} className="mb-4">
                                            <PostCard post={post} currentUserId={user.id} onPostDeleted={handlePostDeleted} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="card shadow-sm">
                                        <div className="card-body text-center py-5">
                                            <div className="empty-state-icon mb-3">
                                                <MessageCircle size={64} className="text-muted" />
                                            </div>
                                            <h5 className="fw-bold mb-2">No posts yet</h5>
                                            <p className="text-muted mb-4">
                                                {activeTab === 'following' && "Posts from people you follow will appear here"}
                                                {activeTab === 'connections' && "Posts from your connections will appear here"}
                                                {activeTab === 'general' && "Discover posts from the community"}
                                            </p>
                                            {activeTab === 'following' && (
                                                <Link href="/suggested-connections" className="btn btn-primary">
                                                    <UserPlus size={18} className="me-2" />
                                                    Find People to Follow
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="col-lg-3">
                            <div className="sticky-sidebar">
                                <div className="card shadow-sm mb-4">
                                    <div className="card-header bg-white d-flex align-items-center justify-content-between">
                                        <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                            <Bell size={18} className="text-primary" />
                                            Notifications
                                        </h6>
                                        {unreadNotificationCount > 0 && (
                                            <span className="badge bg-danger rounded-pill">{unreadNotificationCount}</span>
                                        )}
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="notifications-list">
                                            {recentNotifications.slice(0, 5).map((notification) => (
                                                <div key={notification.id} className={`notification-item ${!notification.read_at ? 'unread' : ''}`}>
                                                    <p className="mb-1 small">{notification.data?.message || 'New notification'}</p>
                                                    <small className="text-muted">{new Date(notification.created_at).toLocaleDateString()}</small>
                                                </div>
                                            ))}
                                            {recentNotifications.length === 0 && (
                                                <div className="text-center py-4 text-muted small">No notifications yet</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="card-footer bg-white text-center">
                                        <Link href="/notifications" className="small text-primary fw-semibold">View All Notifications</Link>
                                    </div>
                                </div>

                                <div className="card shadow-sm mb-4">
                                    <div className="card-header bg-white">
                                        <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                            <TrendingUp size={18} className="text-warning" />
                                            Trending Posts
                                        </h6>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="trending-list">
                                            {trendingPosts.slice(0, 5).map((post, index) => (
                                                <Link key={post.id} href={`/stories/${post.id}`} className="trending-item">
                                                    <div className="d-flex align-items-start gap-2">
                                                        <span className="trending-number">#{index + 1}</span>
                                                        <div className="flex-grow-1">
                                                            <p className="mb-1 small fw-semibold trending-title">{post.title}</p>
                                                            <div className="d-flex gap-3 text-muted">
                                                                <small className="d-flex align-items-center gap-1">
                                                                    <Heart size={12} />
                                                                    {post.reactions_count}
                                                                </small>
                                                                <small className="d-flex align-items-center gap-1">
                                                                    <MessageCircle size={12} />
                                                                    {post.comments_count}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                            {trendingPosts.length === 0 && (
                                                <div className="text-center py-4 text-muted small">No trending posts yet</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="card shadow-sm">
                                    <div className="card-header bg-white">
                                        <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                            <UserPlus size={18} className="text-success" />
                                            Suggested for You
                                        </h6>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="suggested-users-list">
                                            {suggestedUsers.slice(0, 5).map((suggestedUser) => (
                                                <div key={suggestedUser.id} className="suggested-user-item">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Link href={`/profile/${suggestedUser.id}`}>
                                                            {suggestedUser.profile_image_url ? (
                                                                <img src={suggestedUser.profile_image_url} alt={`${suggestedUser.first_name} ${suggestedUser.last_name}`} className="suggested-avatar rounded-circle" />
                                                            ) : (
                                                                <div className="suggested-avatar-fallback rounded-circle">{suggestedUser.first_name.charAt(0)}</div>
                                                            )}
                                                        </Link>
                                                        <div className="flex-grow-1 overflow-hidden">
                                                            <Link href={`/profile/${suggestedUser.id}`} className="d-block fw-semibold small text-dark text-decoration-none text-truncate">
                                                                {suggestedUser.first_name} {suggestedUser.last_name}
                                                            </Link>
                                                            <small className="text-muted text-truncate d-block">@{suggestedUser.username}</small>
                                                        </div>
                                                        <button className="btn btn-sm btn-primary">Follow</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {suggestedUsers.length === 0 && (
                                                <div className="text-center py-4 text-muted small">No suggestions available</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="card-footer bg-white text-center">
                                        <Link href="/suggested-connections" className="small text-primary fw-semibold">View All Suggestions</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <CreatePostModal user={user} onClose={() => setShowCreateModal(false)} onPostCreated={handlePostCreated} />
            )}
        </AuthAccessLayout>
    );
}
