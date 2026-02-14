import { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Save,
    Loader2,
    Type,
    Link,
    FileText,
    Search,
    Tag,
} from 'lucide-react';

interface PageData {
    id: number;
    slug: string;
    title: string;
    content: string;
    meta_description: string | null;
    meta_keywords: string | null;
    is_published: boolean;
}

interface Props {
    page?: PageData;
}

interface SharedProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Editor({ page }: Props) {
    const { flash } = usePage<SharedProps>().props;
    const isEditing = !!page;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: page?.title || '',
        slug: page?.slug || '',
        content: page?.content || '',
        meta_description: page?.meta_description || '',
        meta_keywords: page?.meta_keywords || '',
        is_published: page?.is_published || false,
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
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        if (isEditing && page) {
            router.put(route('admin.publicPages.update', page.id), formData, {
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post(route('admin.publicPages.store'), formData, {
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    const handleCancel = () => {
        router.get(route('admin.publicPages.index'));
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

                {/* Back Button */}
                <button className="ap-back-btn" onClick={handleCancel}>
                    <ArrowLeft size={16} /> Back to Pages
                </button>

                {/* Page Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">{isEditing ? 'Edit Page' : 'Create Page'}</h1>
                    <p className="ap-page-subtitle">
                        {isEditing ? 'Update the content and settings for this page' : 'Create a new public page for the platform'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="ap-card ap-card-lg ap-mb-xl">
                        {/* Page Details Section */}
                        <div className="ap-section">
                            <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                                <FileText size={18} className="ap-icon-primary" />
                                Page Details
                            </h3>

                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">
                                        <span className="ap-flex ap-items-center ap-gap-xs">
                                            <Type size={14} className="ap-icon-primary" />
                                            Title <span className="ap-icon-danger">*</span>
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter page title"
                                        required
                                        className="ap-form-input"
                                    />
                                </div>

                                <div className="ap-form-group">
                                    <label className="ap-form-label">
                                        <span className="ap-flex ap-items-center ap-gap-xs">
                                            <Link size={14} className="ap-icon-primary" />
                                            Slug
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        placeholder="auto-generated-from-title"
                                        className="ap-form-input"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="ap-divider" />

                        {/* Content Section */}
                        <div className="ap-section">
                            <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                                <FileText size={18} className="ap-icon-success" />
                                Content
                            </h3>

                            <div className="ap-form-group">
                                <label className="ap-form-label">
                                    <span className="ap-flex ap-items-center ap-gap-xs">
                                        <FileText size={14} className="ap-icon-primary" />
                                        Page Content <span className="ap-icon-danger">*</span>
                                    </span>
                                </label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    placeholder="Write your page content here..."
                                    required
                                    className="ap-form-textarea"
                                    style={{ minHeight: '320px', fontFamily: 'monospace' }}
                                />
                            </div>
                        </div>

                        <hr className="ap-divider" />

                        {/* SEO Section */}
                        <div className="ap-section">
                            <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                                <Search size={18} className="ap-icon-warning" />
                                SEO Settings
                            </h3>

                            <div className="ap-form-group">
                                <label className="ap-form-label">
                                    <span className="ap-flex ap-items-center ap-gap-xs">
                                        <FileText size={14} className="ap-icon-primary" />
                                        Meta Description
                                    </span>
                                </label>
                                <textarea
                                    name="meta_description"
                                    value={formData.meta_description}
                                    onChange={handleChange}
                                    placeholder="Brief description for search engines (recommended: 150-160 characters)"
                                    className="ap-form-textarea"
                                    style={{ minHeight: '90px' }}
                                />
                            </div>

                            <div className="ap-form-group">
                                <label className="ap-form-label">
                                    <span className="ap-flex ap-items-center ap-gap-xs">
                                        <Tag size={14} className="ap-icon-primary" />
                                        Meta Keywords
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    name="meta_keywords"
                                    value={formData.meta_keywords}
                                    onChange={handleChange}
                                    placeholder="e.g., family tree, genealogy, heritage"
                                    className="ap-form-input"
                                />
                            </div>
                        </div>

                        <hr className="ap-divider" />

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
                    <div className="ap-flex ap-justify-end ap-gap-md">
                        <button
                            type="button"
                            className="ap-btn ap-btn-secondary"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="ap-btn ap-btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 size={18} className="ap-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {isSubmitting
                                ? (isEditing ? 'Saving...' : 'Creating...')
                                : (isEditing ? 'Save Changes' : 'Create Page')
                            }
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
