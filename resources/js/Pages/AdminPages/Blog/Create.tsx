import { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Plus,
    Save,
    Loader2,
    Type,
    Link,
    FileText,
    Tag,
    User,
} from 'lucide-react';

interface SharedProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

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

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.85rem 1.1rem',
        border: '2px solid #E5E7EB',
        borderRadius: '12px',
        fontSize: '0.96rem',
        color: '#0a0e27',
        backgroundColor: '#FFFFFF',
        fontWeight: 500,
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
        outline: 'none',
        boxSizing: 'border-box' as const,
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 700,
        color: '#0a0e27',
        marginBottom: '0.6rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    };

    const textareaStyle: React.CSSProperties = {
        ...inputStyle,
        minHeight: '120px',
        resize: 'vertical' as const,
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = THEME.primary;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`;
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.boxShadow = 'none';
    };

    return (
        <AdminLayout>
            <div>
                {/* Flash Messages */}
                {(flash?.success || flash?.error) && (
                    <div
                        style={{
                            marginBottom: '2rem',
                            padding: '1.25rem 1.5rem',
                            borderRadius: '12px',
                            background: flash?.error
                                ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(25, 135, 84, 0.1) 0%, rgba(25, 135, 84, 0.05) 100%)',
                            border: `1px solid ${flash?.error ? 'rgba(220, 38, 38, 0.3)' : 'rgba(25, 135, 84, 0.3)'}`,
                            color: flash?.error ? THEME.danger : THEME.success,
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: flash?.error
                                ? '0 4px 12px rgba(220, 38, 38, 0.1)'
                                : '0 4px 12px rgba(25, 135, 84, 0.1)',
                        }}
                    >
                        {flash?.success || flash?.error}
                    </div>
                )}

                {/* Page Header */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <button
                        onClick={handleCancel}
                        style={{
                            background: '#E7F5FF',
                            border: '2px solid #cfe2ff',
                            padding: '0.65rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: THEME.primary,
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = THEME.primary;
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.borderColor = THEME.primary;
                            e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.primary}30`;
                            e.currentTarget.style.transform = 'translateX(-3px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#E7F5FF';
                            e.currentTarget.style.color = THEME.primary;
                            e.currentTarget.style.borderColor = '#cfe2ff';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Plus size={28} color={THEME.primary} strokeWidth={2} />
                            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>
                                Create Blog Post
                            </h1>
                        </div>
                        <p style={{ fontSize: '0.98rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>
                            Write and publish a new blog post
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit}>
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '20px',
                            border: '2px solid #E5E7EB',
                            padding: '2.5rem',
                            marginBottom: '2rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        {/* Post Details Section */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3
                                style={{
                                    fontSize: '1.15rem',
                                    fontWeight: 800,
                                    color: '#0a0e27',
                                    margin: 0,
                                    marginBottom: '1.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.85rem',
                                    letterSpacing: '-0.3px',
                                }}
                            >
                                <div
                                    style={{
                                        padding: '0.6rem',
                                        background: '#E7F1FF',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <FileText size={22} color={THEME.primary} strokeWidth={2.5} />
                                </div>
                                Post Details
                            </h3>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: '1.5rem',
                                }}
                            >
                                {/* Title */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Type size={14} color={THEME.primary} />
                                            Title <span style={{ color: THEME.danger }}>*</span>
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter post title"
                                        required
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* Slug */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Link size={14} color={THEME.primary} />
                                            Slug
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        placeholder="auto-generated-from-title"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Tag size={14} color={THEME.primary} />
                                            Category
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="e.g., News, Tutorial, Update"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* Author */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <User size={14} color={THEME.primary} />
                                            Author
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleChange}
                                        placeholder="Author name"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3
                                style={{
                                    fontSize: '1.15rem',
                                    fontWeight: 800,
                                    color: '#0a0e27',
                                    margin: 0,
                                    marginBottom: '1.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.85rem',
                                    letterSpacing: '-0.3px',
                                }}
                            >
                                <div
                                    style={{
                                        padding: '0.6rem',
                                        background: '#e8f5e9',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <FileText size={22} color={THEME.success} strokeWidth={2.5} />
                                </div>
                                Content
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Excerpt */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <FileText size={14} color={THEME.primary} />
                                            Excerpt
                                        </span>
                                    </label>
                                    <textarea
                                        name="excerpt"
                                        value={formData.excerpt}
                                        onChange={handleChange}
                                        placeholder="Brief summary of the post..."
                                        style={textareaStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <FileText size={14} color={THEME.primary} />
                                            Content <span style={{ color: THEME.danger }}>*</span>
                                        </span>
                                    </label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        placeholder="Write your blog post content here..."
                                        required
                                        style={{ ...textareaStyle, minHeight: '280px' }}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Publish Toggle */}
                        <div style={{ marginBottom: '0' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.85rem',
                                    padding: '1.25rem 1.5rem',
                                    background: formData.is_published ? '#e8f5e9' : '#f0f0f0',
                                    borderRadius: '12px',
                                    border: `2px solid ${formData.is_published ? THEME.success : '#E5E7EB'}`,
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    id="is_published"
                                    checked={formData.is_published}
                                    onChange={handleCheckboxChange}
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        cursor: 'pointer',
                                        accentColor: THEME.success,
                                    }}
                                />
                                <label
                                    htmlFor="is_published"
                                    style={{
                                        fontSize: '0.96rem',
                                        fontWeight: 700,
                                        color: formData.is_published ? THEME.success : '#6c757d',
                                        cursor: 'pointer',
                                        margin: 0,
                                    }}
                                >
                                    {formData.is_published ? 'Publish immediately' : 'Save as draft'}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '1rem',
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={{
                                paddingLeft: '1.75rem',
                                paddingRight: '1.75rem',
                                paddingTop: '0.85rem',
                                paddingBottom: '0.85rem',
                                background: '#FFFFFF',
                                color: THEME.secondary,
                                border: '2px solid #E5E7EB',
                                borderRadius: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: '0.96rem',
                                letterSpacing: '0.3px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#F3F4F6';
                                e.currentTarget.style.borderColor = '#D1D5DB';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#FFFFFF';
                                e.currentTarget.style.borderColor = '#E5E7EB';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                paddingLeft: '2rem',
                                paddingRight: '2rem',
                                paddingTop: '0.85rem',
                                paddingBottom: '0.85rem',
                                background: isSubmitting
                                    ? THEME.secondary
                                    : `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 700,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: `0 4px 12px ${THEME.primary}25`,
                                fontSize: '0.96rem',
                                letterSpacing: '0.3px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                opacity: isSubmitting ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.boxShadow = `0 12px 28px ${THEME.primary}40`;
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}25`;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {isSubmitting ? (
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
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
