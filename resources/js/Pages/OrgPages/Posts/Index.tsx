import OrgLayout from '@/Layouts/OrgLayout';
import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import {
    Plus, Pin, Trash2, Eye,
    ChevronLeft, ChevronRight,
    Heart, MessageCircle, X,
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
    const [confirmDelete, setConfirmDelete] = useState<OrgPost | null>(null);

    const handleTogglePin = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        router.post(route('org.posts.togglePin', { id }));
    };

    const requestDelete = (e: React.MouseEvent, post: OrgPost) => {
        e.stopPropagation();
        setConfirmDelete(post);
    };

    const executeDelete = useCallback(() => {
        if (!confirmDelete) return;
        router.delete(route('org.posts.destroy', { id: confirmDelete.id }));
        setConfirmDelete(null);
    }, [confirmDelete]);

    const dismissConfirm = useCallback(() => {
        setConfirmDelete(null);
    }, []);

    useEffect(() => {
        if (!confirmDelete) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismissConfirm(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [confirmDelete, dismissConfirm]);

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
                                    onClick={(e) => requestDelete(e, post)}
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

            {/* Delete Confirmation Dialog */}
            {confirmDelete && (
                <div
                    onClick={dismissConfirm}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1rem',
                        animation: 'fadeIn 0.15s ease-out',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#1a1a2e',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '1.75rem',
                            width: '100%',
                            maxWidth: '400px',
                            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
                            animation: 'slideUp 0.2s ease-out',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Trash2 size={22} color="#EF4444" />
                            </div>
                            <button
                                onClick={dismissConfirm}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)', border: 'none',
                                    borderRadius: '8px', padding: '6px', cursor: 'pointer',
                                    color: '#888', display: 'flex', transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#ccc'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#888'; }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                            Delete Post
                        </h3>
                        <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#999', lineHeight: 1.5 }}>
                            Are you sure you want to delete this post? This action cannot be undone and all associated comments and reactions will be permanently removed.
                        </p>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={dismissConfirm}
                                style={{
                                    padding: '0.6rem 1.25rem', borderRadius: '10px',
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    color: '#ccc', fontSize: '0.85rem', fontWeight: 500,
                                    cursor: 'pointer', transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                style={{
                                    padding: '0.6rem 1.25rem', borderRadius: '10px',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#EF4444', fontSize: '0.85rem', fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.15s ease',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
                            >
                                <Trash2 size={14} />
                                Delete Post
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </OrgLayout>
    );
}
