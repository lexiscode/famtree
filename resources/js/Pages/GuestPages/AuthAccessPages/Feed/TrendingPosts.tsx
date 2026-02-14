import { Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { TrendingUp, ArrowLeft, Eye, Heart, MessageCircle } from 'lucide-react';
import './Feed.css';

interface Post {
    id: number | string;
    org_post_id?: number;
    type: string;
    title: string;
    content: string | null;
    voice_url: string | null;
    voice_duration: number;
    views_count: number;
    comments_count: number;
    reactions_count: number;
    refams_count: number;
    user_reaction: string | null;
    images: Array<{ id: number; url: string; order: number }>;
    user: {
        id: number;
        name: string;
        username: string;
        profile_image_url: string | null;
        is_organization?: boolean;
    };
    is_organization?: boolean;
    created_at: string;
    created_at_human: string;
}

interface TrendingData {
    posts: Post[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface TrendingPostsProps {
    user: {
        id: number;
        uuid: string;
        first_name: string;
        last_name: string;
        name: string;
        username: string;
        email: string;
        profile_image_url: string | null;
        bio: string | null;
    };
    trendingData: TrendingData;
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
}

export default function TrendingPosts({
    trendingData,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
}: TrendingPostsProps) {
    const { posts, current_page, last_page, per_page, total } = trendingData;

    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, current_page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(last_page, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <AuthAccessLayout>
            <div className="feed-page">
                <div className="container-fluid py-4">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            {/* Header */}
                            <div className="sidebar-widget" style={{ marginBottom: '24px' }}>
                                <div className="widget-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h6 className="widget-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <TrendingUp size={22} />
                                        Trending Posts
                                        <span style={{
                                            fontSize: '0.8rem',
                                            fontWeight: '500',
                                            color: 'var(--text-muted)',
                                            marginLeft: '4px',
                                        }}>
                                            ({total} {total === 1 ? 'post' : 'posts'})
                                        </span>
                                    </h6>
                                    <Link href="/" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: 'var(--color-primary)',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                    }}>
                                        <ArrowLeft size={16} />
                                        Back to Feed
                                    </Link>
                                </div>
                            </div>

                            {/* Post List */}
                            {posts.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {posts.map((post, index) => {
                                        const rank = (current_page - 1) * per_page + index + 1;
                                        const postUrl = post.is_organization
                                            ? `/stories/org/${post.org_post_id}`
                                            : `/stories/${post.id}`;

                                        return (
                                            <Link
                                                key={post.id}
                                                href={postUrl}
                                                className="text-decoration-none"
                                            >
                                                <div className="sidebar-widget" style={{
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                                }}>
                                                    <div style={{
                                                        padding: '16px 20px',
                                                        display: 'flex',
                                                        gap: '16px',
                                                        alignItems: 'flex-start',
                                                    }}>
                                                        {/* Rank */}
                                                        <div style={{
                                                            minWidth: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            background: rank <= 3
                                                                ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                                                : 'rgba(255, 255, 255, 0.08)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: '700',
                                                            fontSize: rank <= 3 ? '1rem' : '0.9rem',
                                                            color: rank <= 3 ? '#fff' : 'var(--text-muted)',
                                                            flexShrink: 0,
                                                        }}>
                                                            #{rank}
                                                        </div>

                                                        {/* Content */}
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            {/* Author */}
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                marginBottom: '6px',
                                                            }}>
                                                                {post.user.profile_image_url ? (
                                                                    <img
                                                                        src={post.user.profile_image_url}
                                                                        alt={post.user.name}
                                                                        style={{
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            borderRadius: '50%',
                                                                            objectFit: 'cover',
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div style={{
                                                                        width: '28px',
                                                                        height: '28px',
                                                                        borderRadius: '50%',
                                                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: '600',
                                                                        color: '#fff',
                                                                    }}>
                                                                        {post.user.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <span style={{
                                                                    fontWeight: '600',
                                                                    color: 'var(--text-primary)',
                                                                    fontSize: '0.85rem',
                                                                }}>
                                                                    {post.user.name}
                                                                </span>
                                                                <span style={{
                                                                    color: 'var(--text-muted)',
                                                                    fontSize: '0.8rem',
                                                                }}>
                                                                    @{post.user.username}
                                                                </span>
                                                                <span style={{
                                                                    color: 'var(--text-muted)',
                                                                    fontSize: '0.75rem',
                                                                    marginLeft: 'auto',
                                                                }}>
                                                                    {post.created_at_human}
                                                                </span>
                                                            </div>

                                                            {/* Title */}
                                                            {post.title && (
                                                                <h6 style={{
                                                                    color: 'var(--text-primary)',
                                                                    fontWeight: '600',
                                                                    fontSize: '0.95rem',
                                                                    marginBottom: '4px',
                                                                    lineHeight: 1.4,
                                                                }}>
                                                                    {post.title}
                                                                </h6>
                                                            )}

                                                            {/* Content preview */}
                                                            {post.content && (
                                                                <p style={{
                                                                    color: 'var(--text-secondary)',
                                                                    fontSize: '0.85rem',
                                                                    marginBottom: '8px',
                                                                    lineHeight: 1.5,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                }}>
                                                                    {post.content}
                                                                </p>
                                                            )}

                                                            {/* Image preview */}
                                                            {post.images.length > 0 && (
                                                                <div style={{
                                                                    marginBottom: '8px',
                                                                    borderRadius: 'var(--radius-sm)',
                                                                    overflow: 'hidden',
                                                                    maxHeight: '200px',
                                                                }}>
                                                                    <img
                                                                        src={post.images[0].url}
                                                                        alt=""
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '200px',
                                                                            objectFit: 'cover',
                                                                            display: 'block',
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Stats */}
                                                            <div style={{
                                                                display: 'flex',
                                                                gap: '16px',
                                                                alignItems: 'center',
                                                            }}>
                                                                <span style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    color: 'var(--text-muted)',
                                                                    fontSize: '0.8rem',
                                                                }}>
                                                                    <Heart size={14} />
                                                                    {post.reactions_count}
                                                                </span>
                                                                <span style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    color: 'var(--text-muted)',
                                                                    fontSize: '0.8rem',
                                                                }}>
                                                                    <MessageCircle size={14} />
                                                                    {post.comments_count}
                                                                </span>
                                                                <span style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    color: 'var(--text-muted)',
                                                                    fontSize: '0.8rem',
                                                                }}>
                                                                    <Eye size={14} />
                                                                    {post.views_count}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}

                                    {/* Pagination */}
                                    {last_page > 1 && (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '20px 0',
                                        }}>
                                            {current_page > 1 && (
                                                <Link
                                                    href={`/trending?page=${current_page - 1}`}
                                                    style={{
                                                        padding: '8px 14px',
                                                        borderRadius: 'var(--radius-sm)',
                                                        background: 'rgba(255, 255, 255, 0.08)',
                                                        color: 'var(--text-secondary)',
                                                        textDecoration: 'none',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '500',
                                                    }}
                                                >
                                                    Prev
                                                </Link>
                                            )}

                                            {pageNumbers.map((page) => (
                                                <Link
                                                    key={page}
                                                    href={`/trending?page=${page}`}
                                                    style={{
                                                        padding: '8px 14px',
                                                        borderRadius: 'var(--radius-sm)',
                                                        background: page === current_page
                                                            ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                                            : 'rgba(255, 255, 255, 0.08)',
                                                        color: page === current_page ? '#fff' : 'var(--text-secondary)',
                                                        textDecoration: 'none',
                                                        fontSize: '0.85rem',
                                                        fontWeight: page === current_page ? '700' : '500',
                                                    }}
                                                >
                                                    {page}
                                                </Link>
                                            ))}

                                            {current_page < last_page && (
                                                <Link
                                                    href={`/trending?page=${current_page + 1}`}
                                                    style={{
                                                        padding: '8px 14px',
                                                        borderRadius: 'var(--radius-sm)',
                                                        background: 'rgba(255, 255, 255, 0.08)',
                                                        color: 'var(--text-secondary)',
                                                        textDecoration: 'none',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '500',
                                                    }}
                                                >
                                                    Next
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Empty state */
                                <div className="sidebar-widget" style={{ textAlign: 'center', padding: '60px 20px' }}>
                                    <TrendingUp size={60} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                                    <h5 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No trending posts yet</h5>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        Posts with high engagement will appear here.
                                    </p>
                                    <Link href="/" style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginTop: '16px',
                                        padding: '10px 20px',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        color: '#fff',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                    }}>
                                        <ArrowLeft size={16} />
                                        Back to Feed
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
