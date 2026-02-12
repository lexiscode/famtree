import OrgLayout from '@/Layouts/OrgLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import RichTextEditor from '@/Components/RichTextEditor';

interface OrgPostImage {
    id: number;
    image_url: string;
    full_image_url: string;
}

interface OrgPost {
    id: number;
    uuid: string;
    content: string | null;
    images: OrgPostImage[];
}

interface Props {
    post: OrgPost;
}

export default function PostsEdit({ post }: Props) {
    const [content, setContent] = useState(post.content || '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getTextContent = (html: string) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return (tmp.textContent || tmp.innerText || '').trim();
    };

    const hasContent = getTextContent(content).length > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasContent) return;
        setSubmitting(true);
        setError(null);

        router.put(route('org.posts.update', { id: post.id }), { content }, {
            onSuccess: () => setSubmitting(false),
            onError: (errors) => {
                setError(Object.values(errors)[0] as string || 'Failed to update post');
                setSubmitting(false);
            },
        });
    };

    return (
        <OrgLayout>
            <div>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => router.visit(route('org.posts.show', { id: post.id }))}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'none', border: 'none', color: '#8B5CF6',
                            fontSize: '0.9rem', cursor: 'pointer', padding: 0,
                            marginBottom: '1rem',
                        }}
                    >
                        <ArrowLeft size={16} />
                        Back to Post
                    </button>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                        Edit Post
                    </h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{
                    background: '#141425',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '2rem',
                }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Edit your post..."
                            maxLength={5000}
                            disabled={submitting}
                        />
                    </div>

                    {/* Existing Images (read-only preview) */}
                    {post.images && post.images.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ color: '#888', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                                Attached images (cannot be changed during edit)
                            </p>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                gap: '0.5rem',
                            }}>
                                {post.images.map((img) => (
                                    <div key={img.id} style={{
                                        aspectRatio: '1', borderRadius: '8px',
                                        overflow: 'hidden', opacity: 0.7,
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}>
                                        <img
                                            src={img.full_image_url || img.image_url}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <p style={{ color: '#EF4444', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{error}</p>
                    )}

                    <div style={{
                        display: 'flex', justifyContent: 'flex-end',
                        paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <button type="submit" disabled={submitting || !hasContent} style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            color: '#fff', border: 'none', borderRadius: '8px',
                            fontWeight: 600,
                            cursor: submitting || !hasContent ? 'not-allowed' : 'pointer',
                            opacity: submitting || !hasContent ? 0.6 : 1,
                        }}>
                            <Save size={16} />
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </OrgLayout>
    );
}
