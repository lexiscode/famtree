import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import UserProfileSidebar from '@/Components/Profile/UserProfileSidebar';
import { ArrowLeft, Users, UserPlus, UserMinus, Search, UserCheck } from 'lucide-react';
import './Follow.css';

interface User {
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    name: string;
    username: string;
    profile_image_url: string | null;
    bio: string | null;
    is_following: boolean;
    is_followed_by: boolean;
    is_mutual: boolean;
}

interface Profile {
    id: number;
    uuid: string;
    name: string;
    username: string;
    profile_image_url: string | null;
    bio: string | null;
    status: string;
}

interface Props {
    profile: Profile;
    following: User[];
    relationshipContext: string | null;
    connectionStatus: string | null;
    relationshipType: string | null;
    relationshipLabel: string | null;
    connectionId: number | null;
    canUndoConnection: boolean;
    pendingRequest: { id: number; status: string } | null;
    sentRequest: { id: number; status: string } | null;
    mutualConnectionsCount: number;
    isFollowing: boolean;
    isFollowedBy: boolean;
    followerCount: number;
    followingCount: number;
    isOwnProfile: boolean;
}

export default function FollowingList({
    profile,
    following,
    relationshipContext,
    connectionStatus,
    relationshipType,
    relationshipLabel,
    connectionId,
    canUndoConnection,
    pendingRequest,
    sentRequest,
    mutualConnectionsCount,
    isFollowing,
    isFollowedBy,
    followerCount,
    followingCount,
    isOwnProfile,
}: Props) {
    const [followingState, setFollowingState] = useState(following);
    const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleFollowToggle = async (followedUser: User) => {
        setLoadingUserId(followedUser.id);

        try {
            if (followedUser.is_following) {
                router.post(route('users.unfollow', followedUser.uuid), {}, {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setFollowingState(prev => prev.map(f =>
                            f.id === followedUser.id ? { ...f, is_following: false, is_mutual: false } : f
                        ));
                        setLoadingUserId(null);
                    },
                    onError: () => {
                        setLoadingUserId(null);
                    }
                });
            } else {
                router.post(route('users.follow', followedUser.uuid), {}, {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setFollowingState(prev => prev.map(f =>
                            f.id === followedUser.id ? { ...f, is_following: true, is_mutual: f.is_followed_by } : f
                        ));
                        setLoadingUserId(null);
                    },
                    onError: () => {
                        setLoadingUserId(null);
                    }
                });
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            setLoadingUserId(null);
        }
    };

    const filteredFollowing = followingState.filter(followedUser =>
        followedUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        followedUser.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthAccessLayout>
            <div className="connections-page">
                <div className="connections-grid-layout">
                    {/* Left Sidebar - Profile */}
                    <div className="connections-left-sidebar">
                        <UserProfileSidebar
                            profile={profile}
                            relationshipContext={relationshipContext}
                            connectionStatus={connectionStatus}
                            relationshipType={relationshipType}
                            relationshipLabel={relationshipLabel}
                            connectionId={connectionId}
                            canUndoConnection={canUndoConnection}
                            pendingRequest={pendingRequest}
                            sentRequest={sentRequest}
                            mutualConnectionsCount={mutualConnectionsCount}
                            isFollowing={isFollowing}
                            isFollowedBy={isFollowedBy}
                            followerCount={followerCount}
                            followingCount={followingCount}
                            isOwnProfile={isOwnProfile}
                        />
                    </div>

                    {/* Center Content */}
                    <div className="connections-center-content">
                        <div className="follow-center-wrapper">
                            <div className="follow-center-inner">
                                {/* Header Section */}
                                <div className="follow-header-card">
                                    {/* Back Button */}
                                    <button
                                        className="follow-back-btn"
                                        onClick={() => router.visit(route('profile.view', { username: profile.username }))}
                                    >
                                        <ArrowLeft size={16} />
                                        Back to Profile
                                    </button>

                                    {/* User Info */}
                                    <div className="follow-user-info">
                                        <div className="follow-avatar-wrapper">
                                            <div className="follow-avatar-ring" />
                                            <img
                                                src={profile.profile_image_url || 'https://via.placeholder.com/100'}
                                                alt={profile.name}
                                                className="follow-avatar-img"
                                            />
                                        </div>
                                        <div className="follow-profile-details">
                                            <h1 className="follow-profile-name">
                                                {profile.name}
                                            </h1>
                                            <p className="follow-profile-username">@{profile.username}</p>

                                            {/* Tab Navigation */}
                                            <div className="follow-tabs">
                                                <div
                                                    className="follow-tab-inactive"
                                                    onClick={() => router.visit(route('users.followers', profile.uuid))}
                                                >
                                                    <Users size={16} />
                                                    {followerCount} Followers
                                                </div>
                                                <div className="follow-tab-active">
                                                    <UserCheck size={16} />
                                                    {followingCount} Following
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="follow-search-wrapper">
                                        <Search size={20} className="follow-search-icon" />
                                        <input
                                            type="text"
                                            className="follow-search-input"
                                            placeholder="Search following..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Following List */}
                                {filteredFollowing.length === 0 ? (
                                    <div className="follow-empty-state">
                                        <div className="follow-empty-icon">
                                            <UserCheck size={40} />
                                        </div>
                                        <h3 className="follow-empty-heading">
                                            {searchQuery ? 'No one found' : (isOwnProfile ? 'Not following anyone yet' : `${profile.name} is not following anyone yet`)}
                                        </h3>
                                        <p className="follow-empty-text">
                                            {searchQuery ? 'Try a different search term' : 'Discover and follow interesting people'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="follow-list-grid">
                                        {filteredFollowing.map((followedUser) => (
                                            <div key={followedUser.id} className="follow-user-card">
                                                {followedUser.is_mutual && (
                                                    <div className="follow-mutual-badge">
                                                        Mutual
                                                    </div>
                                                )}

                                                <div className="follow-card-content">
                                                    <div
                                                        className="follow-card-avatar-wrapper"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.visit(route('profile.view', { username: followedUser.username }));
                                                        }}
                                                    >
                                                        <img
                                                            src={followedUser.profile_image_url || 'https://via.placeholder.com/70'}
                                                            alt={followedUser.name}
                                                            className="follow-card-avatar"
                                                        />
                                                    </div>

                                                    <div
                                                        className="follow-card-info"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.visit(route('profile.view', { username: followedUser.username }));
                                                        }}
                                                    >
                                                        <h3 className="follow-card-name">
                                                            {followedUser.name}
                                                        </h3>
                                                        <p className="follow-card-username">
                                                            @{followedUser.username}
                                                        </p>
                                                        {followedUser.bio && (
                                                            <p className="follow-card-bio">
                                                                {followedUser.bio}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <button
                                                        className={`follow-btn ${followedUser.is_following ? 'follow-btn-unfollow' : 'follow-btn-follow'}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFollowToggle(followedUser);
                                                        }}
                                                        disabled={loadingUserId === followedUser.id}
                                                    >
                                                        {loadingUserId === followedUser.id ? (
                                                            <div className={`follow-spinner ${followedUser.is_following ? 'follow-spinner-muted' : 'follow-spinner-light'}`} />
                                                        ) : (
                                                            <>
                                                                {followedUser.is_following ? <UserMinus size={16} /> : <UserPlus size={16} />}
                                                                {followedUser.is_following ? 'Unfollow' : 'Follow'}
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
