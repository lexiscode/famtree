import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import {
    Home, TrendingUp, Users, Bell, Plus, Heart, MessageCircle,
    User, Settings, BookOpen, UserPlus, UserCheck, Globe, FileText, Loader
} from 'lucide-react';
import CreatePostModal from '../Stories/CreatePostModal';
import PostCard from '../Stories/PostCard';
import ProfileCompletionModal from '@/Components/Profile/ProfileCompletionModal';
import TreeChatWindow from '@/Components/FamilyTree/TreeChatWindow';
import { ProfileCompletion } from '@/types/inertia';
import './Feed.css';

interface FeedUser {
    id: number;
    uuid: string;
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

interface TreeForChat {
    id: string;
    tree_name: string;
}

interface FeedProps {
    user: FeedUser;
    stats: {
        connections: number;
        following: number;
        followers: number;
    };
    followingPosts: Post[];
    connectionPosts: Post[];
    generalPosts: Post[];
    followersPosts: Post[];
    allPosts: Post[];
    myPosts: Post[];
    trendingPosts: Post[];
    recentNotifications: Notification[];
    suggestedUsers: SuggestedUser[];
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
    profileCompletion: ProfileCompletion;
    treeForChat: TreeForChat | null;
}

type TabType = 'following' | 'connections' | 'general' | 'followers' | 'all' | 'mystories';

export default function Feed({
    user,
    stats,
    followingPosts: initialFollowingPosts,
    connectionPosts: initialConnectionPosts,
    generalPosts: initialGeneralPosts,
    followersPosts: initialFollowersPosts = [],
    allPosts: initialAllPosts = [],
    myPosts: initialMyPosts = [],
    trendingPosts,
    recentNotifications,
    suggestedUsers,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
    profileCompletion,
    treeForChat,
}: FeedProps) {
    const [activeTab, setActiveTab] = useState<TabType>('following');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [isChatMinimized, setIsChatMinimized] = useState(false);

    // Separate state for each tab's posts
    const [tabPosts, setTabPosts] = useState({
        following: initialFollowingPosts,
        connections: initialConnectionPosts,
        general: initialGeneralPosts,
        followers: initialFollowersPosts,
        all: initialAllPosts,
        mystories: initialMyPosts,
    });

    // Loading and pagination states
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState({
        following: true,
        connections: true,
        general: true,
        followers: true,
        all: true,
        mystories: true,
    });

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isLoadingRef = useRef(false);

    const currentPosts = useMemo(() => {
        return tabPosts[activeTab];
    }, [activeTab, tabPosts]);

    // Fetch more posts for the current tab
    const fetchMorePosts = useCallback(async () => {
        if (isLoadingRef.current || !hasMore[activeTab]) {
            return;
        }

        isLoadingRef.current = true;
        setIsLoading(true);

        try {
            const offset = tabPosts[activeTab].length;
            const response = await fetch(`/api/feed/${activeTab}?offset=${offset}&limit=10`);
            const data = await response.json();

            if (data.posts && data.posts.length > 0) {
                setTabPosts(prev => ({
                    ...prev,
                    [activeTab]: [...prev[activeTab], ...data.posts],
                }));
            }

            setHasMore(prev => ({
                ...prev,
                [activeTab]: data.hasMore,
            }));
        } catch (error) {
            console.error('Error fetching more posts:', error);
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    }, [activeTab, tabPosts, hasMore]);

    // Handle scroll event
    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        // Load more when user scrolls to 80% of the page
        if (scrollPercentage > 0.8 && !isLoadingRef.current && hasMore[activeTab]) {
            fetchMorePosts();
        }
    }, [fetchMorePosts, activeTab, hasMore]);

    // Attach scroll listener
    useEffect(() => {
        const handleWindowScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

            // Load more when user scrolls to 80% of the page
            if (scrollPercentage > 0.8 && !isLoadingRef.current && hasMore[activeTab]) {
                fetchMorePosts();
            }
        };

        window.addEventListener('scroll', handleWindowScroll);
        return () => window.removeEventListener('scroll', handleWindowScroll);
    }, [fetchMorePosts, activeTab, hasMore]);

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
                                            <a href="/connections/pending" className="col-6 text-center py-2 text-decoration-none" style={{ cursor: 'pointer' }}>
                                                <div className="stat-value text-warning fw-bold">{pendingRequestCount}</div>
                                                <div className="stat-label text-muted small">Pending</div>
                                            </a>
                                            <a href="/connections" className="col-6 text-center py-2 border-start text-decoration-none" style={{ cursor: 'pointer' }}>
                                                <div className="stat-value text-info fw-bold">{stats.connections}</div>
                                                <div className="stat-label text-muted small">Connections</div>
                                            </a>
                                            <a href={`/users/${user.uuid}/following`} className="col-6 text-center py-2 border-top text-decoration-none" style={{ cursor: 'pointer' }}>
                                                <div className="stat-value text-success fw-bold">{stats.following}</div>
                                                <div className="stat-label text-muted small">Following</div>
                                            </a>
                                            <a href={`/users/${user.uuid}/followers`} className="col-6 text-center py-2 border-start border-top text-decoration-none" style={{ cursor: 'pointer' }}>
                                                <div className="stat-value text-danger fw-bold">{stats.followers}</div>
                                                <div className="stat-label text-muted small">Followers</div>
                                            </a>
                                            <a href="/suggested-connections" className="col-6 text-center py-2 border-top text-decoration-none" style={{ cursor: 'pointer' }}>
                                                <div className="stat-value text-secondary fw-bold">{suggestedUsers.length}</div>
                                                <div className="stat-label text-muted small">Suggestions</div>
                                            </a>
                                            <a href="/family-tree" className="col-6 text-center py-2 border-start border-top text-decoration-none" style={{ cursor: 'pointer' }}>
                                                <div className="stat-value text-primary fw-bold">
                                                    <Users size={20} />
                                                </div>
                                                <div className="stat-label text-muted small">Family Tree</div>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="list-group list-group-flush">
                                        <a href="/profile" className="list-group-item list-group-item-action d-flex align-items-center gap-2">
                                            <User size={18} />
                                            <span>My Profile</span>
                                        </a>
                                        <a href="/settings/account" className="list-group-item list-group-item-action d-flex align-items-center gap-2">
                                            <Settings size={18} />
                                            <span>Settings</span>
                                        </a>
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
                                <div className="card-body p-3">
                                    <div className="row g-2">
                                        {/* Row 1 */}
                                        <div className="col-4">
                                            <button
                                                className={`btn w-100 d-flex align-items-center justify-content-center gap-2 py-3 ${activeTab === 'following' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setActiveTab('following')}
                                                style={{ borderRadius: '12px', transition: 'all 0.3s ease', minHeight: '60px' }}
                                            >
                                                <UserPlus size={20} />
                                                <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Following</span>
                                            </button>
                                        </div>
                                        <div className="col-4">
                                            <button
                                                className={`btn w-100 d-flex align-items-center justify-content-center gap-2 py-3 ${activeTab === 'connections' ? 'btn-info text-white' : 'btn-outline-info'}`}
                                                onClick={() => setActiveTab('connections')}
                                                style={{ borderRadius: '12px', transition: 'all 0.3s ease', minHeight: '60px' }}
                                            >
                                                <Users size={20} />
                                                <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Connections</span>
                                            </button>
                                        </div>
                                        <div className="col-4">
                                            <button
                                                className={`btn w-100 d-flex align-items-center justify-content-center gap-2 py-3 ${activeTab === 'general' ? 'btn-success' : 'btn-outline-success'}`}
                                                onClick={() => setActiveTab('general')}
                                                style={{ borderRadius: '12px', transition: 'all 0.3s ease', minHeight: '60px' }}
                                            >
                                                <Home size={20} />
                                                <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Discover</span>
                                            </button>
                                        </div>
                                        {/* Row 2 */}
                                        <div className="col-4">
                                            <button
                                                className={`btn w-100 d-flex align-items-center justify-content-center gap-2 py-3 ${activeTab === 'followers' ? 'btn-warning' : 'btn-outline-warning'}`}
                                                onClick={() => setActiveTab('followers')}
                                                style={{ borderRadius: '12px', transition: 'all 0.3s ease', minHeight: '60px' }}
                                            >
                                                <UserCheck size={20} />
                                                <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Followers</span>
                                            </button>
                                        </div>
                                        <div className="col-4">
                                            <button
                                                className={`btn w-100 d-flex align-items-center justify-content-center gap-2 py-3 ${activeTab === 'all' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                                onClick={() => setActiveTab('all')}
                                                style={{ borderRadius: '12px', transition: 'all 0.3s ease', minHeight: '60px' }}
                                            >
                                                <Globe size={20} />
                                                <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>All</span>
                                            </button>
                                        </div>
                                        <div className="col-4">
                                            <button
                                                className={`btn w-100 d-flex align-items-center justify-content-center gap-2 py-3 ${activeTab === 'mystories' ? 'btn-danger' : 'btn-outline-danger'}`}
                                                onClick={() => setActiveTab('mystories')}
                                                style={{ borderRadius: '12px', transition: 'all 0.3s ease', minHeight: '60px' }}
                                            >
                                                <FileText size={20} />
                                                <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>My Stories</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="posts-feed">
                                {currentPosts.length > 0 ? (
                                    <>
                                        {currentPosts.map((post) => (
                                            <div key={post.id} className="mb-4">
                                                <PostCard post={post} currentUserId={user.id} onPostDeleted={handlePostDeleted} />
                                            </div>
                                        ))}

                                        {/* Loading Indicator */}
                                        {isLoading && (
                                            <div className="text-center py-4">
                                                <Loader className="spinner-border text-primary" size={32} />
                                                <p className="text-muted mt-2">Loading more posts...</p>
                                            </div>
                                        )}

                                        {/* End of Posts Indicator */}
                                        {!hasMore[activeTab] && !isLoading && (
                                            <div className="text-center py-4">
                                                <p className="text-muted">You've reached the end!</p>
                                            </div>
                                        )}
                                    </>
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
                                                {activeTab === 'followers' && "Posts from users who follow you (but you don't follow back) will appear here"}
                                                {activeTab === 'all' && "All public posts will appear here"}
                                                {activeTab === 'mystories' && "Your stories will appear here"}
                                            </p>
                                            {activeTab === 'following' && (
                                                <Link href="/suggested-connections" className="btn btn-primary">
                                                    <UserPlus size={18} className="me-2" />
                                                    Find People to Follow
                                                </Link>
                                            )}
                                            {activeTab === 'mystories' && (
                                                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                                                    <Plus size={18} className="me-2" />
                                                    Create Your First Story
                                                </button>
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

            {/* Floating Profile Completion Button - Show only if incomplete */}
            {profileCompletion.percentage < 100 && (
                <button
                    onClick={() => setShowCompletionModal(true)}
                    title="View profile completion status"
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        width: '65px',
                        height: '65px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        color: 'white',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        transition: 'all 0.3s ease',
                        zIndex: 1000,
                        fontWeight: '700',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                    }}
                >
                    <TrendingUp size={22} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>
                        {profileCompletion.percentage}%
                    </span>
                </button>
            )}

            {/* Profile Completion Modal */}
            {showCompletionModal && (
                <ProfileCompletionModal
                    data={profileCompletion}
                    onClose={() => setShowCompletionModal(false)}
                />
            )}

            {/* Floating Chat Button - Show only if user has a family tree */}
            {treeForChat && !showChat && (
                <button
                    onClick={() => setShowChat(true)}
                    className="floating-chat-btn"
                    title="Open Family Tree Chat"
                >
                    <MessageCircle size={24} />
                    <span className="chat-btn-pulse"></span>
                </button>
            )}

            {/* Tree Chat Window */}
            {showChat && treeForChat && (
                <TreeChatWindow
                    treeId={treeForChat.id}
                    treeName={treeForChat.tree_name}
                    currentUserId={user.id}
                    onClose={() => setShowChat(false)}
                    isMinimized={isChatMinimized}
                    onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
                />
            )}
        </AuthAccessLayout>
    );
}
