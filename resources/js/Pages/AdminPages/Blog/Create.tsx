import { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Save,
    Loader2,
} from 'lucide-react';

interface SharedProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Create() {
    const { flash } = usePage<SharedProps>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: '',
        author: '',
        is_published: false,
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
        router.post(route('admin.blog.store'), formData, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleCancel = () => {
        router.get(route('admin.blog.index'));
    };

    return (
        <AdminLayout>
            <div>
{/* Page Header */}
                <div className="ap-page-header">
                    <div className="ap-flex ap-items-center ap-gap-md">
                        <button onClick={handleCancel} className="ap-back-btn">
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 className="ap-page-title">Create Blog Post</h1>
                            <p className="ap-page-subtitle">Write and publish a new blog post</p>
                        </div>
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
                                {formData.is_published ? 'Publish immediately' : 'Save as draft'}
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
                            {isSubmitting ? 'Creating...' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
