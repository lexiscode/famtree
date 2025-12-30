import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { ArrowLeft, Users, UserPlus, UserMinus } from 'lucide-react';

interface User {
    id: number;
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

interface TargetUser {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    username: string;
    profile_image_url: string | null;
}

interface Props {
    user: TargetUser;
    following: User[];
    followerCount: number;
    followingCount: number;
    isOwnProfile: boolean;
}

export default function FollowingList({
    user,
    following,
    followerCount,
    followingCount,
    isOwnProfile,
}: Props) {
    const [followingState, setFollowingState] = useState(following);
    const [loadingUserId, setLoadingUserId] = useState<number | null>(null);

    const handleFollowToggle = async (user: User) => {
        setLoadingUserId(user.id);

        try {
            if (user.is_following) {
                // Unfollow
                router.post(route('users.unfollow', user.id), {}, {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setFollowingState(prev => prev.map(f =>
                            f.id === user.id ? { ...f, is_following: false, is_mutual: false } : f
                        ));
                        setLoadingUserId(null);
                    },
                    onError: () => {
                        setLoadingUserId(null);
                    }
                });
            } else {
                // Follow
                router.post(route('users.follow', user.id), {}, {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setFollowingState(prev => prev.map(f =>
                            f.id === user.id ? { ...f, is_following: true, is_mutual: f.is_followed_by } : f
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

    return (
        <AuthAccessLayout>
            <div className="following-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
                {/* Header */}
                <div className="following-header" style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => router.visit(route('profile.view', user.id))}
                        className="back-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#F3F4F6',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginBottom: '1rem'
                        }}
                    >
                        <ArrowLeft size={18} />
                        Back to Profile
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <img
                                src={user.profile_image_url || 'https://via.placeholder.com/80'}
                                alt={user.name}
                                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #3B82F6' }}
                            />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.25rem' }}>{user.name}</h1>
                        <p style={{ color: '#6B7280', marginBottom: '1rem' }}>@{user.username}</p>

                        {/* Stats */}
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                            <div
                                style={{ textAlign: 'center', cursor: 'pointer' }}
                                onClick={() => router.visit(route('users.followers', user.id))}
                            >
                                <div style={{ fontWeight: '700', fontSize: '1.5rem', color: '#1F2937' }}>{followerCount}</div>
                                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Followers</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: '700', fontSize: '1.5rem', color: '#1F2937' }}>{followingCount}</div>
                                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Following</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Following List */}
                <div className="following-list">
                    {followingState.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
                            <Users size={64} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
                            <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                                {isOwnProfile ? 'You are not following anyone yet' : `${user.first_name} is not following anyone yet`}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {followingState.map((followedUser) => (
                                <div
                                    key={followedUser.id}
                                    className="following-card"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '12px',
                                        border: '1px solid #E5E7EB',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, cursor: 'pointer' }}
                                        onClick={() => router.visit(route('profile.view', followedUser.id))}
                                    >
                                        <img
                                            src={followedUser.profile_image_url || 'https://via.placeholder.com/60'}
                                            alt={followedUser.name}
                                            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                                {followedUser.name}
                                                {followedUser.is_mutual && (
                                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#DBEAFE', color: '#1E40AF', borderRadius: '4px' }}>
                                                        Mutual
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>@{followedUser.username}</div>
                                            {followedUser.bio && (
                                                <div style={{ color: '#9CA3AF', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                                    {followedUser.bio.length > 80 ? `${followedUser.bio.substring(0, 80)}...` : followedUser.bio}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleFollowToggle(followedUser)}
                                        disabled={loadingUserId === followedUser.id}
                                        style={{
                                            padding: '0.5rem 1.25rem',
                                            backgroundColor: followedUser.is_following ? '#E5E7EB' : '#3B82F6',
                                            color: followedUser.is_following ? '#374151' : '#FFFFFF',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: loadingUserId === followedUser.id ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {loadingUserId === followedUser.id ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                        ) : (
                                            <>
                                                {followedUser.is_following ? <UserMinus size={16} /> : <UserPlus size={16} />}
                                                {followedUser.is_following ? 'Unfollow' : 'Follow'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
