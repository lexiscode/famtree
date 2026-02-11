import OrgLayout from '@/Layouts/OrgLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Pin, Trash2, Edit3, Send } from 'lucide-react';

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

export default function PostsIndex({ posts }: Props) {
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setSubmitting(true);
        router.post(route('org.posts.store'), {
            content,
            type: 'text',
        }, {
            onSuccess: () => { setContent(''); setSubmitting(false); },
            onError: () => setSubmitting(false),
        });
    };

    const handleTogglePin = (id: number) => {
        router.post(route('org.posts.togglePin', { id }));
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(route('org.posts.destroy', { id }));
        }
    };

    return (
        <OrgLayout>
            <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '2rem' }}>
                    Posts
                </h1>

                {/* Create Post Form */}
                <form onSubmit={handleCreatePost} style={{
                    background: '#111118',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                }}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write a post for your followers..."
                        rows={3}
                        style={{
                            width: '100%',
                            background: '#1a1a24',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '8px',
                            padding: '0.875rem',
                            color: '#fff',
                            fontSize: '0.95rem',
                            resize: 'vertical',
                            outline: 'none',
                            marginBottom: '1rem',
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" disabled={submitting || !content.trim()} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting || !content.trim() ? 0.6 : 1,
                        }}>
                            <Send size={16} />
                            {submitting ? 'Posting...' : 'Publish Post'}
                        </button>
                    </div>
                </form>

                {/* Posts List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {posts.data.length > 0 ? posts.data.map((post) => (
                        <div key={post.id} style={{
                            background: '#111118',
                            border: `1px solid ${post.is_pinned ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '12px',
                            padding: '1.5rem',
                        }}>
                            {post.is_pinned && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#8B5CF6', fontSize: '0.8rem', fontWeight: 600 }}>
                                    <Pin size={14} /> Pinned Post
                                </div>
                            )}
                            <p style={{ color: '#e0e0e0', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1rem' }}>
                                {post.content}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', color: '#666', fontSize: '0.8rem' }}>
                                    <span>{post.views_count} views</span>
                                    <span>{post.reactions_count} reactions</span>
                                    <span>{post.comments_count} comments</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleTogglePin(post.id)} style={{
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        color: post.is_pinned ? '#8B5CF6' : '#888',
                                    }}>
                                        <Pin size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(post.id)} style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        color: '#EF4444',
                                    }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <p style={{ margin: '0.75rem 0 0', color: '#555', fontSize: '0.75rem' }}>
                                By {post.creator?.display_name || post.creator?.username || 'Unknown'} · {new Date(post.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    )) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            background: '#111118',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <Plus size={32} color="#555" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#888', fontSize: '0.95rem' }}>No posts yet. Create your first post above.</p>
                        </div>
                    )}
                </div>
            </div>
        </OrgLayout>
    );
}
