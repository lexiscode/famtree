import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import {
    Home, TrendingUp, Users, Bell, Plus, Heart, MessageCircle,
    User, Settings, UserPlus, UserCheck, Globe, FileText, Loader, Image as ImageIcon, Video, ArrowUp
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
    const [showScrollTop, setShowScrollTop] = useState(false);

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

    // Attach scroll listener
    useEffect(() => {
        const handleWindowScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

            // Show scroll to top button after scrolling 500px
            setShowScrollTop(scrollTop > 500);

            // Load more when user scrolls to 80% of the page
            if (scrollPercentage > 0.8 && !isLoadingRef.current && hasMore[activeTab]) {
                fetchMorePosts();
            }
        };

        window.addEventListener('scroll', handleWindowScroll);
        return () => window.removeEventListener('scroll', handleWindowScroll);
    }, [fetchMorePosts, activeTab, hasMore]);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handlePostCreated = useCallback(() => {
        setShowCreateModal(false);
        router.reload();
    }, []);

    const handlePostDeleted = useCallback(() => {
        router.reload();
    }, []);

    const tabs = [
        { key: 'following' as TabType, label: 'Following', icon: UserPlus },
        { key: 'connections' as TabType, label: 'Connections', icon: Users },
        { key: 'general' as TabType, label: 'Discover', icon: Home },
        { key: 'followers' as TabType, label: 'Followers', icon: UserCheck },
        { key: 'all' as TabType, label: 'All', icon: Globe },
        { key: 'mystories' as TabType, label: 'My Stories', icon: FileText },
    ];

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
                        {/* LEFT SIDEBAR - Compact Profile & Navigation */}
                        <div className="col-lg-3">
                            <div className="left-sidebar">
                                {/* Profile Widget */}
                                <div className="profile-widget">
                                    <div className="position-relative d-inline-block mb-3 w-100">
                                        {user.profile_image_url ? (
                                            <img
                                                src={user.profile_image_url}
                                                alt={user.name}
                                                className="profile-avatar"
                                            />
                                        ) : (
                                            <div className="profile-avatar-fallback">
                                                {user.first_name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="online-badge"></span>
                                    </div>
                                    <h6>{user.name}</h6>
                                    <p className="username">@{user.username}</p>
                                    {user.bio && <p className="bio-text">{user.bio}</p>}

                                    {/* Menu Count Cards - 2 per row, 3 rows */}
                                    <div className="menu-counts-grid">
                                        <a href="/connections/pending" className="count-card">
                                            <span className="count-number count-pending">{pendingRequestCount}</span>
                                            <span className="count-label">PENDING</span>
                                        </a>

                                        <a href="/connections" className="count-card">
                                            <span className="count-number count-connections">{connectionCount}</span>
                                            <span className="count-label">CONNECTIONS</span>
                                        </a>

                                        <a href={`/users/${user.uuid}/following`} className="count-card">
                                            <span className="count-number count-following">{stats.following}</span>
                                            <span className="count-label">FOLLOWING</span>
                                        </a>

                                        <a href={`/users/${user.uuid}/followers`} className="count-card">
                                            <span className="count-number count-followers">{stats.followers}</span>
                                            <span className="count-label">FOLLOWERS</span>
                                        </a>

                                        <a href="/suggested-connections" className="count-card">
                                            <span className="count-number count-suggestions">{suggestedUsers.length}</span>
                                            <span className="count-label">SUGGESTIONS</span>
                                        </a>

                                        <a href="/family-tree" className="count-card">
                                            <Users size={32} className="count-icon" />
                                            <span className="count-label">FAMILY TREE</span>
                                        </a>
                                    </div>

                                    {/* Quick Links */}
                                    <div className="quick-links">
                                        <a href="/profile" className="quick-link">
                                            <User size={20} />
                                            <span>My Profile</span>
                                        </a>
                                        <a href="/settings/account" className="quick-link">
                                            <Settings size={20} />
                                            <span>Settings</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CENTER FEED - Main Content */}
                        <div className="col-lg-6">
                            <div className="center-feed">
                                {/* Feed Tabs - Horizontal Pills */}
                                <div className="feed-tabs-container">
                                    <div className="feed-tabs">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.key}
                                                className={`feed-tab ${activeTab === tab.key ? 'active' : ''}`}
                                                onClick={() => setActiveTab(tab.key)}
                                            >
                                                <tab.icon size={18} />
                                                <span>{tab.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Posts Container */}
                                <div className="posts-container">
                                    {currentPosts.length > 0 ? (
                                        <>
                                            {currentPosts.map((post) => (
                                                <div key={post.id} className="post-card">
                                                    <PostCard post={post} currentUserId={user.id} onPostDeleted={handlePostDeleted} />
                                                </div>
                                            ))}

                                            {/* Loading Indicator */}
                                            {isLoading && (
                                                <div className="loading-container">
                                                    <div className="loading-spinner"></div>
                                                    <p className="loading-text">Loading more posts...</p>
                                                </div>
                                            )}

                                            {/* End of Posts */}
                                            {!hasMore[activeTab] && !isLoading && (
                                                <div className="text-center py-4">
                                                    <p className="text-muted">You've reached the end!</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="empty-state">
                                            <div className="empty-state-icon">
                                                <MessageCircle size={80} />
                                            </div>
                                            <h5>No posts yet</h5>
                                            <p>
                                                {activeTab === 'following' && "Posts from people you follow will appear here"}
                                                {activeTab === 'connections' && "Posts from your connections will appear here"}
                                                {activeTab === 'general' && "Discover posts from the community"}
                                                {activeTab === 'followers' && "Posts from users who follow you (but you don't follow back) will appear here"}
                                                {activeTab === 'all' && "All public posts will appear here"}
                                                {activeTab === 'mystories' && "Your stories will appear here"}
                                            </p>
                                            {activeTab === 'following' && (
                                                <Link href="/suggested-connections" className="btn btn-primary">
                                                    <UserPlus size={18} style={{ marginRight: '8px' }} />
                                                    Find People to Follow
                                                </Link>
                                            )}
                                            {activeTab === 'mystories' && (
                                                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                                                    <Plus size={18} style={{ marginRight: '8px' }} />
                                                    Create Your First Story
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDEBAR - Widgets */}
                        <div className="col-lg-3">
                            <div className="right-sidebar">
                                {/* Notifications Widget */}
                                <div className="sidebar-widget">
                                    <div className="widget-header">
                                        <h6 className="widget-title">
                                            <Bell size={20} />
                                            Notifications
                                        </h6>
                                        {unreadNotificationCount > 0 && (
                                            <span className="badge badge-danger">{unreadNotificationCount}</span>
                                        )}
                                    </div>
                                    <div className="widget-body">
                                        {recentNotifications.slice(0, 5).map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`widget-item notification-item ${!notification.read_at ? 'unread' : ''}`}
                                            >
                                                <div className="notification-content">
                                                    <p className="notification-text">{notification.data?.message || 'New notification'}</p>
                                                    <span className="notification-time">{new Date(notification.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {recentNotifications.length === 0 && (
                                            <div className="widget-item text-center">
                                                <small className="text-muted">No notifications yet</small>
                                            </div>
                                        )}
                                    </div>
                                    <div className="widget-footer">
                                        <Link href="/notifications">View All</Link>
                                    </div>
                                </div>

                                {/* Trending Posts Widget */}
                                <div className="sidebar-widget">
                                    <div className="widget-header">
                                        <h6 className="widget-title">
                                            <TrendingUp size={20} />
                                            Trending
                                        </h6>
                                    </div>
                                    <div className="widget-body">
                                        {trendingPosts.slice(0, 5).map((post, index) => (
                                            <Link
                                                key={post.id}
                                                href={`/stories/${post.id}`}
                                                className="widget-item trending-item text-decoration-none"
                                            >
                                                <div className="trending-number">#{index + 1}</div>
                                                <div className="trending-content">
                                                    <p className="trending-title">{post.title}</p>
                                                    <div className="trending-stats">
                                                        <span>{post.reactions_count} likes</span>
                                                        <span>{post.comments_count} comments</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        {trendingPosts.length === 0 && (
                                            <div className="widget-item text-center">
                                                <small className="text-muted">No trending posts yet</small>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Suggested Users Widget */}
                                <div className="sidebar-widget">
                                    <div className="widget-header">
                                        <h6 className="widget-title">
                                            <UserPlus size={20} />
                                            Suggested
                                        </h6>
                                    </div>
                                    <div className="widget-body">
                                        {suggestedUsers.slice(0, 5).map((suggestedUser) => (
                                            <div key={suggestedUser.id} className="widget-item suggestion-item">
                                                <Link href={`/profile/${suggestedUser.username}`}>
                                                    {suggestedUser.profile_image_url ? (
                                                        <img src={suggestedUser.profile_image_url} alt={`${suggestedUser.first_name} ${suggestedUser.last_name}`} className="suggestion-avatar" />
                                                    ) : (
                                                        <div className="suggestion-avatar-fallback">{suggestedUser.first_name.charAt(0)}</div>
                                                    )}
                                                </Link>
                                                <div className="suggestion-info">
                                                    <Link href={`/profile/${suggestedUser.username}`} className="suggestion-name text-decoration-none">
                                                        {suggestedUser.first_name} {suggestedUser.last_name}
                                                    </Link>
                                                    <p className="suggestion-username">@{suggestedUser.username}</p>
                                                </div>
                                                <button className="suggestion-btn">Follow</button>
                                            </div>
                                        ))}
                                        {suggestedUsers.length === 0 && (
                                            <div className="widget-item text-center">
                                                <small className="text-muted">No suggestions available</small>
                                            </div>
                                        )}
                                    </div>
                                    <div className="widget-footer">
                                        <Link href="/suggested-connections">View All</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Create Post Button */}
            <button
                onClick={() => setShowCreateModal(true)}
                title="Create Post"
                style={{
                    position: 'fixed',
                    bottom: '32px',
                    right: '32px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    zIndex: 1001,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                }}
            >
                <Plus size={24} />
            </button>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="scroll-to-top-btn"
                    title="Scroll to top"
                >
                    <ArrowUp size={24} />
                </button>
            )}

            {/* Create Post Modal */}
            {showCreateModal && (
                <CreatePostModal user={user} onClose={() => setShowCreateModal(false)} onPostCreated={handlePostCreated} />
            )}

            {/* Profile Completion Modal */}
            {profileCompletion.percentage < 100 && (
                <button
                    onClick={() => setShowCompletionModal(true)}
                    title="View profile completion status"
                    style={{
                        position: 'fixed',
                        bottom: '110px',
                        right: '32px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: 'white',
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        transition: 'all 0.3s ease',
                        zIndex: 999,
                        fontWeight: '700',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
                    }}
                >
                    <TrendingUp size={22} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>
                        {profileCompletion.percentage}%
                    </span>
                </button>
            )}

            {showCompletionModal && (
                <ProfileCompletionModal
                    data={profileCompletion}
                    onClose={() => setShowCompletionModal(false)}
                />
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
