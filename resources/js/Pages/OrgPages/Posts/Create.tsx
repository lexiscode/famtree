import OrgLayout from '@/Layouts/OrgLayout';
import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Send, ImagePlus, X } from 'lucide-react';
import RichTextEditor from '@/Components/RichTextEditor';

export default function PostsCreate() {
    const [content, setContent] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 10) {
            setError('Maximum 10 images allowed');
            return;
        }
        setError(null);

        const newFiles = [...images, ...files];
        setImages(newFiles);

        const newPreviews: string[] = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    newPreviews.push(ev.target.result as string);
                    if (newPreviews.length === files.length) {
                        setImagePreviews(prev => [...prev, ...newPreviews]);
                    }
                }
            };
            reader.readAsDataURL(file);
        });

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

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

        const formData = new FormData();
        formData.append('type', 'text');
        formData.append('content', content);
        images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
        });

        router.post(route('org.posts.store'), formData as any, {
            forceFormData: true,
            onSuccess: () => setSubmitting(false),
            onError: (errors) => {
                setError(Object.values(errors)[0] as string || 'Failed to create post');
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
                        onClick={() => router.visit(route('org.posts.index'))}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'none', border: 'none', color: '#8B5CF6',
                            fontSize: '0.9rem', cursor: 'pointer', padding: 0,
                            marginBottom: '1rem',
                        }}
                    >
                        <ArrowLeft size={16} />
                        Back to Posts
                    </button>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                        Create Post
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
                            placeholder="Write a post for your followers..."
                            maxLength={5000}
                            disabled={submitting}
                        />
                    </div>

                    {imagePreviews.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                        }}>
                            {imagePreviews.map((preview, index) => (
                                <div key={index} style={{
                                    position: 'relative',
                                    aspectRatio: '1',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                }}>
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        style={{
                                            position: 'absolute', top: '4px', right: '4px',
                                            width: '22px', height: '22px', borderRadius: '50%',
                                            background: 'rgba(0,0,0,0.7)', border: 'none',
                                            color: '#fff', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: 0,
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <p style={{ color: '#EF4444', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{error}</p>
                    )}

                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/gif"
                                multiple
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={submitting || images.length >= 10}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    padding: '0.6rem 1rem',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                    borderRadius: '8px', color: '#8B5CF6',
                                    fontSize: '0.85rem', fontWeight: 500,
                                    cursor: submitting || images.length >= 10 ? 'not-allowed' : 'pointer',
                                    opacity: submitting || images.length >= 10 ? 0.5 : 1,
                                }}
                            >
                                <ImagePlus size={16} />
                                {images.length > 0 ? `${images.length}/10 images` : 'Add Images'}
                            </button>
                        </div>
                        <button type="submit" disabled={submitting || !hasContent} style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            color: '#fff', border: 'none', borderRadius: '8px',
                            fontWeight: 600,
                            cursor: submitting || !hasContent ? 'not-allowed' : 'pointer',
                            opacity: submitting || !hasContent ? 0.6 : 1,
                        }}>
                            <Send size={16} />
                            {submitting ? 'Posting...' : 'Publish Post'}
                        </button>
                    </div>
                </form>
            </div>
        </OrgLayout>
    );
}
