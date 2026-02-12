import OrgLayout from '@/Layouts/OrgLayout';
import { router } from '@inertiajs/react';
import {
    Plus, Pin, Trash2, Eye,
    ChevronLeft, ChevronRight,
    Heart, MessageCircle,
} from 'lucide-react';

interface OrgPostImage {
    id: number;
    image_url: string;
    full_image_url: string;
}

interface OrgPost {
    id: number;
    uuid: string;
    type: 'text' | 'voice';
    content: string | null;
    is_pinned: boolean;
    views_count: number;
    comments_count: number;
    reactions_count: number;
    images: OrgPostImage[];
    creator: { display_name: string | null; username: string } | null;
    created_at: string;
}

interface PaginatedPosts {
    data: OrgPost[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    posts: PaginatedPosts;
}

function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

export default function PostsIndex({ posts }: Props) {
    const handleTogglePin = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        router.post(route('org.posts.togglePin', { id }));
    };

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(route('org.posts.destroy', { id }));
        }
    };

    return (
        <OrgLayout>
            <div>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '2rem',
                }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                        Posts
                    </h1>
                    <button
                        onClick={() => router.visit(route('org.posts.create'))}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            color: '#fff', border: 'none', borderRadius: '8px',
                            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                        }}
                    >
                        <Plus size={16} />
                        Create Post
                    </button>
                </div>

                {/* Posts List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {posts.data.length > 0 ? posts.data.map((post) => (
                        <div
                            key={post.id}
                            onClick={() => router.visit(route('org.posts.show', { id: post.id }))}
                            style={{
                                background: '#141425',
                                border: `1px solid ${post.is_pinned ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: '12px',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (!post.is_pinned) e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                if (!post.is_pinned) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                            }}
                        >
                            {post.is_pinned && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    marginBottom: '0.75rem', color: '#8B5CF6',
                                    fontSize: '0.8rem', fontWeight: 600,
                                }}>
                                    <Pin size={14} /> Pinned Post
                                </div>
                            )}

                            {/* Content + Thumbnail Row */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {post.content && (
                                        <p style={{
                                            color: '#e0e0e0', fontSize: '0.95rem',
                                            lineHeight: 1.6, margin: '0 0 0.75rem',
                                            wordBreak: 'break-word',
                                        }}>
                                            {truncate(stripHtml(post.content), 200)}
                                        </p>
                                    )}

                                    {/* Stats Row */}
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            color: '#888', fontSize: '0.82rem',
                                        }}>
                                            <Heart size={14} /> {post.reactions_count}
                                        </span>
                                        <span style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            color: '#888', fontSize: '0.82rem',
                                        }}>
                                            <MessageCircle size={14} /> {post.comments_count}
                                        </span>
                                        <span style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            color: '#888', fontSize: '0.82rem',
                                        }}>
                                            <Eye size={14} /> {post.views_count}
                                        </span>
                                        <span style={{ color: '#555', fontSize: '0.78rem' }}>
                                            By {post.creator?.display_name || post.creator?.username || 'Unknown'} · {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Thumbnail */}
                                {post.images && post.images.length > 0 && (
                                    <div style={{
                                        width: 80, height: 80, borderRadius: '8px',
                                        overflow: 'hidden', flexShrink: 0,
                                    }}>
                                        <img
                                            src={post.images[0].full_image_url || post.images[0].image_url}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex', justifyContent: 'flex-end', gap: '0.5rem',
                                marginTop: '0.75rem', paddingTop: '0.75rem',
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <button
                                    onClick={(e) => handleTogglePin(e, post.id)}
                                    style={{
                                        background: 'rgba(139, 92, 246, 0.1)', border: 'none',
                                        borderRadius: '6px', padding: '0.5rem', cursor: 'pointer',
                                        color: post.is_pinned ? '#8B5CF6' : '#888',
                                    }}
                                >
                                    <Pin size={14} />
                                </button>
                                <button
                                    onClick={(e) => handleDelete(e, post.id)}
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.1)', border: 'none',
                                        borderRadius: '6px', padding: '0.5rem', cursor: 'pointer',
                                        color: '#EF4444',
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{
                            textAlign: 'center', padding: '3rem',
                            background: '#141425', borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <Plus size={32} color="#555" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#888', fontSize: '0.95rem', margin: '0 0 1rem' }}>
                                No posts yet. Create your first post!
                            </p>
                            <button
                                onClick={() => router.visit(route('org.posts.create'))}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                    color: '#fff', border: 'none', borderRadius: '8px',
                                    fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                <Plus size={16} /> Create Post
                            </button>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {posts.last_page > 1 && (
                    <div style={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        gap: '0.75rem', marginTop: '1.5rem',
                    }}>
                        <button
                            disabled={posts.current_page <= 1}
                            onClick={() => router.get(route('org.posts.index'), { page: posts.current_page - 1 }, { preserveState: true })}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.6rem 1rem',
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '8px', color: '#8B5CF6',
                                fontSize: '0.85rem', fontWeight: 500,
                                cursor: posts.current_page <= 1 ? 'not-allowed' : 'pointer',
                                opacity: posts.current_page <= 1 ? 0.5 : 1,
                            }}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <span style={{ color: '#888', fontSize: '0.85rem' }}>
                            Page {posts.current_page} of {posts.last_page}
                        </span>
                        <button
                            disabled={posts.current_page >= posts.last_page}
                            onClick={() => router.get(route('org.posts.index'), { page: posts.current_page + 1 }, { preserveState: true })}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.6rem 1rem',
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '8px', color: '#8B5CF6',
                                fontSize: '0.85rem', fontWeight: 500,
                                cursor: posts.current_page >= posts.last_page ? 'not-allowed' : 'pointer',
                                opacity: posts.current_page >= posts.last_page ? 0.5 : 1,
                            }}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </OrgLayout>
    );
}
