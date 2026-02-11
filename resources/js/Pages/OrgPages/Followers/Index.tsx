import OrgLayout from '@/Layouts/OrgLayout';
import { router } from '@inertiajs/react';
import { Heart, ChevronLeft, ChevronRight, User } from 'lucide-react';

interface FollowerUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    profile_image_url: string | null;
}

interface Follower {
    id: number;
    user: FollowerUser;
    followed_at: string;
}

interface PaginatedFollowers {
    data: Follower[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    followers: PaginatedFollowers;
}

export default function FollowersIndex({ followers }: Props) {
    const handlePageChange = (page: number) => {
        router.visit(route('org.followers.index', { page }));
    };

    return (
        <OrgLayout>
            <div>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                        Followers
                    </h1>
                    <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                        {followers.total} follower{followers.total !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Followers Grid */}
                {followers.data.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1rem',
                    }}>
                        {followers.data.map((follower) => (
                            <div
                                key={follower.id}
                                style={{
                                    background: '#111118',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {/* Profile Image */}
                                <div style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid rgba(139, 92, 246, 0.2)',
                                }}>
                                    {follower.user.profile_image_url ? (
                                        <img
                                            src={follower.user.profile_image_url}
                                            alt={`${follower.user.first_name} ${follower.user.last_name}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    ) : (
                                        <User size={22} color="#ffffff" />
                                    )}
                                </div>

                                {/* User Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        color: '#ffffff',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {follower.user.first_name} {follower.user.last_name}
                                    </p>
                                    <p style={{
                                        margin: '0.15rem 0 0',
                                        fontSize: '0.8rem',
                                        color: '#8B5CF6',
                                    }}>
                                        @{follower.user.username}
                                    </p>
                                    <p style={{
                                        margin: '0.35rem 0 0',
                                        fontSize: '0.75rem',
                                        color: '#666',
                                    }}>
                                        Followed {new Date(follower.followed_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        background: '#111118',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}>
                        <Heart size={32} color="#555" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                            No followers yet. Share your organization to gain followers.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {followers.last_page > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginTop: '2rem',
                    }}>
                        <button
                            onClick={() => handlePageChange(followers.current_page - 1)}
                            disabled={followers.current_page === 1}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 1rem',
                                background: followers.current_page === 1 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '8px',
                                color: followers.current_page === 1 ? '#555' : '#8B5CF6',
                                fontSize: '0.85rem',
                                cursor: followers.current_page === 1 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>
                        <span style={{ color: '#888', fontSize: '0.85rem' }}>
                            Page {followers.current_page} of {followers.last_page}
                        </span>
                        <button
                            onClick={() => handlePageChange(followers.current_page + 1)}
                            disabled={followers.current_page === followers.last_page}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 1rem',
                                background: followers.current_page === followers.last_page ? 'rgba(255, 255, 255, 0.03)' : 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '8px',
                                color: followers.current_page === followers.last_page ? '#555' : '#8B5CF6',
                                fontSize: '0.85rem',
                                cursor: followers.current_page === followers.last_page ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </OrgLayout>
    );
}
