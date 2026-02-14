import { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Save,
    Loader2,
    Trash2,
    CheckCircle,
    XCircle,
} from 'lucide-react';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    author: string;
    is_published: boolean;
}

interface Props {
    post: BlogPost;
}

interface SharedProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Edit({ post }: Props) {
    const { flash } = usePage<SharedProps>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category || '',
        author: post.author || '',
        is_published: post.is_published,
    });

    const generateSlug = (title: string): string => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            if (name === 'title') {
                setFormData((prev) => ({
                    ...prev,
                    title: value,
                    slug: generateSlug(value),
                }));
            } else {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
        },
        []
    );

    const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, is_published: e.target.checked }));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.put(route('admin.blog.update', post.id), formData, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handlePublish = () => {
        router.post(route('admin.blog.publish', post.id), {}, {
            preserveScroll: true,
        });
    };

    const handleUnpublish = () => {
        router.post(route('admin.blog.unpublish', post.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
            router.delete(route('admin.blog.destroy', post.id));
        }
    };

    const handleCancel = () => {
        router.get(route('admin.blog.index'));
    };

    return (
        <AdminLayout>
            <div>
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="ap-flash ap-flash-success">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="ap-flash ap-flash-error">{flash.error}</div>
                )}

                {/* Page Header */}
                <div className="ap-page-header-row">
                    <div className="ap-flex ap-items-center ap-gap-md">
                        <button onClick={handleCancel} className="ap-back-btn">
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 className="ap-page-title">Edit Blog Post</h1>
                            <p className="ap-page-subtitle">Update the content and settings for this post</p>
                        </div>
                    </div>
                    <div className="ap-page-header-actions">
                        {post.is_published ? (
                            <button onClick={handleUnpublish} className="ap-btn ap-btn-warning ap-btn-sm">
                                <XCircle size={16} />
                                Unpublish
                            </button>
                        ) : (
                            <button onClick={handlePublish} className="ap-btn ap-btn-success ap-btn-sm">
                                <CheckCircle size={16} />
                                Publish
                            </button>
                        )}
                        <button onClick={handleDelete} className="ap-btn ap-btn-danger ap-btn-sm">
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit}>
                    <div className="ap-card-lg">
                        {/* Post Details Section */}
                        <div className="ap-section">
                            <h3 className="ap-section-title">Post Details</h3>
                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter post title"
                                        required
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Slug</label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        placeholder="auto-generated-from-title"
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="e.g., News, Tutorial, Update"
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Author</label>
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleChange}
                                        placeholder="Author name"
                                        className="ap-form-input"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="ap-divider" />

                        {/* Content Section */}
                        <div className="ap-section">
                            <h3 className="ap-section-title">Content</h3>
                            <div className="ap-flex-col ap-gap-md">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Excerpt</label>
                                    <textarea
                                        name="excerpt"
                                        value={formData.excerpt}
                                        onChange={handleChange}
                                        placeholder="Brief summary of the post..."
                                        className="ap-form-textarea"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Content *</label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        placeholder="Write your blog post content here..."
                                        required
                                        className="ap-form-textarea"
                                        style={{ minHeight: '280px' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="ap-divider" />

                        {/* Publish Toggle */}
                        <div className="ap-form-checkbox-row">
                            <input
                                type="checkbox"
                                id="is_published"
                                checked={formData.is_published}
                                onChange={handleCheckboxChange}
                            />
                            <label htmlFor="is_published">
                                {formData.is_published ? 'Published' : 'Draft'}
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="ap-flex ap-items-center ap-gap-sm ap-justify-end">
                        <button type="button" onClick={handleCancel} className="ap-btn ap-btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="ap-btn ap-btn-primary">
                            {isSubmitting ? (
                                <Loader2 size={18} className="ap-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
