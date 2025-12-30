import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { ArrowLeft, Users, UserPlus, UserMinus, Search, UserCheck } from 'lucide-react';

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
    followers: User[];
    followerCount: number;
    followingCount: number;
    isOwnProfile: boolean;
}

export default function FollowersList({
    user,
    followers,
    followerCount,
    followingCount,
    isOwnProfile,
}: Props) {
    const [followersState, setFollowersState] = useState(followers);
    const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleFollowToggle = async (follower: User) => {
        setLoadingUserId(follower.id);

        try {
            if (follower.is_following) {
                router.post(route('users.unfollow', follower.id), {}, {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setFollowersState(prev => prev.map(f =>
                            f.id === follower.id ? { ...f, is_following: false, is_mutual: false } : f
                        ));
                        setLoadingUserId(null);
                    },
                    onError: () => {
                        setLoadingUserId(null);
                    }
                });
            } else {
                router.post(route('users.follow', follower.id), {}, {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setFollowersState(prev => prev.map(f =>
                            f.id === follower.id ? { ...f, is_following: true, is_mutual: f.is_followed_by } : f
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

    const filteredFollowers = followersState.filter(follower =>
        follower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        follower.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthAccessLayout>
            <div style={{
                background: 'linear-gradient(135deg, #F8F9FA 0%, #E8F0FF 100%)',
                minHeight: '100vh',
                paddingTop: '2rem',
                paddingBottom: '4rem',
                fontFamily: 'Inter, sans-serif'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Header Section */}
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '2rem',
                        marginBottom: '2rem',
                        boxShadow: '0 10px 40px rgba(0, 82, 232, 0.08)',
                        border: '1px solid rgba(0, 82, 232, 0.1)'
                    }}>
                        {/* Back Button */}
                        <button
                            onClick={() => router.visit(route('profile.view', user.id))}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.625rem 1.25rem',
                                background: 'linear-gradient(135deg, #F8F9FA 0%, #E8F0FF 100%)',
                                border: '1px solid #E5E7EB',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '0.875rem',
                                color: '#3D4450',
                                marginBottom: '1.5rem',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(-4px)';
                                e.currentTarget.style.borderColor = '#0052E8';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                                e.currentTarget.style.borderColor = '#E5E7EB';
                            }}
                        >
                            <ArrowLeft size={16} />
                            Back to Profile
                        </button>

                        {/* User Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    inset: '-4px',
                                    background: 'linear-gradient(135deg, #0052E8, #00D4FF)',
                                    borderRadius: '50%',
                                    opacity: 0.2
                                }} />
                                <img
                                    src={user.profile_image_url || 'https://via.placeholder.com/100'}
                                    alt={user.name}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '4px solid #FFFFFF',
                                        position: 'relative',
                                        boxShadow: '0 8px 24px rgba(0, 82, 232, 0.15)'
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h1 style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    marginBottom: '0.5rem',
                                    background: 'linear-gradient(135deg, #0052E8, #00D4FF)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontFamily: 'Poppins, sans-serif'
                                }}>
                                    {user.name}
                                </h1>
                                <p style={{ color: '#6B7280', fontSize: '1rem', marginBottom: '1rem' }}>@{user.username}</p>

                                {/* Tab Navigation */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'linear-gradient(135deg, #0052E8, #00D4FF)',
                                            color: '#FFFFFF',
                                            borderRadius: '12px',
                                            fontWeight: '600',
                                            fontSize: '0.875rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            boxShadow: '0 4px 12px rgba(0, 82, 232, 0.3)'
                                        }}
                                    >
                                        <Users size={16} />
                                        {followerCount} Followers
                                    </div>
                                    <div
                                        onClick={() => router.visit(route('users.following', user.id))}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: '#F8F9FA',
                                            color: '#3D4450',
                                            borderRadius: '12px',
                                            fontWeight: '600',
                                            fontSize: '0.875rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s ease',
                                            border: '2px solid transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#E8F0FF';
                                            e.currentTarget.style.borderColor = '#0052E8';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#F8F9FA';
                                            e.currentTarget.style.borderColor = 'transparent';
                                        }}
                                    >
                                        <UserCheck size={16} />
                                        {followingCount} Following
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div style={{ position: 'relative' }}>
                            <Search
                                size={20}
                                style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Search followers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 3rem',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '12px',
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'Inter, sans-serif'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#0052E8';
                                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 82, 232, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    {/* Followers List */}
                    {filteredFollowers.length === 0 ? (
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: '20px',
                            padding: '4rem 2rem',
                            textAlign: 'center',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, #E8F0FF, #F0F6FF)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <Users size={40} style={{ color: '#0052E8', opacity: 0.5 }} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F2937', marginBottom: '0.5rem' }}>
                                {searchQuery ? 'No followers found' : (isOwnProfile ? 'No followers yet' : `${user.first_name} has no followers yet`)}
                            </h3>
                            <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>
                                {searchQuery ? 'Try a different search term' : 'Start building your network'}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {filteredFollowers.map((follower) => (
                                <div
                                    key={follower.id}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        border: '1px solid #E5E7EB',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 82, 232, 0.12)';
                                        e.currentTarget.style.borderColor = '#0052E8';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                    }}
                                >
                                    {follower.is_mutual && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                            padding: '0.375rem 0.75rem',
                                            borderBottomLeftRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: '#FFFFFF',
                                            boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                                        }}>
                                            Mutual
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.visit(route('profile.view', follower.id));
                                            }}
                                            style={{ position: 'relative', flexShrink: 0 }}
                                        >
                                            <img
                                                src={follower.profile_image_url || 'https://via.placeholder.com/70'}
                                                alt={follower.name}
                                                style={{
                                                    width: '70px',
                                                    height: '70px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '3px solid #F8F9FA',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.borderColor = '#0052E8';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.borderColor = '#F8F9FA';
                                                }}
                                            />
                                        </div>

                                        <div
                                            style={{ flex: 1, minWidth: 0 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.visit(route('profile.view', follower.id));
                                            }}
                                        >
                                            <h3 style={{
                                                fontWeight: '600',
                                                fontSize: '1.0625rem',
                                                marginBottom: '0.375rem',
                                                color: '#1F2937',
                                                fontFamily: 'Poppins, sans-serif'
                                            }}>
                                                {follower.name}
                                            </h3>
                                            <p style={{ color: '#0052E8', fontSize: '0.875rem', marginBottom: '0.625rem', fontWeight: '500' }}>
                                                @{follower.username}
                                            </p>
                                            {follower.bio && (
                                                <p style={{
                                                    color: '#6B7280',
                                                    fontSize: '0.875rem',
                                                    lineHeight: '1.5',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {follower.bio}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFollowToggle(follower);
                                            }}
                                            disabled={loadingUserId === follower.id}
                                            style={{
                                                padding: '0.625rem 1.5rem',
                                                background: follower.is_following
                                                    ? '#F3F4F6'
                                                    : 'linear-gradient(135deg, #0052E8, #00D4FF)',
                                                color: follower.is_following ? '#374151' : '#FFFFFF',
                                                border: follower.is_following ? '2px solid #E5E7EB' : 'none',
                                                borderRadius: '10px',
                                                fontWeight: '600',
                                                fontSize: '0.875rem',
                                                cursor: loadingUserId === follower.id ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                whiteSpace: 'nowrap',
                                                transition: 'all 0.2s ease',
                                                boxShadow: follower.is_following ? 'none' : '0 4px 12px rgba(0, 82, 232, 0.3)',
                                                fontFamily: 'Poppins, sans-serif',
                                                flexShrink: 0
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!follower.is_following && loadingUserId !== follower.id) {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 82, 232, 0.4)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = follower.is_following ? 'none' : '0 4px 12px rgba(0, 82, 232, 0.3)';
                                            }}
                                        >
                                            {loadingUserId === follower.id ? (
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    border: '2px solid',
                                                    borderColor: follower.is_following ? '#9CA3AF transparent transparent transparent' : '#FFFFFF transparent transparent transparent',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite'
                                                }} />
                                            ) : (
                                                <>
                                                    {follower.is_following ? <UserMinus size={16} /> : <UserPlus size={16} />}
                                                    {follower.is_following ? 'Unfollow' : 'Follow'}
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

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </AuthAccessLayout>
    );
}
