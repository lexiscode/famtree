import { useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Globe,
    Plus,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
} from 'lucide-react';

interface PublicPage {
    id: number;
    slug: string;
    title: string;
    meta_description: string | null;
    is_published: boolean;
    last_edited_at: string | null;
    last_edited_at_formatted: string | null;
    edited_by: string | null;
    created_at: string;
}

interface Props {
    pages: PublicPage[];
}

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

export default function Index({ pages }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const handleDelete = useCallback((id: number) => {
        if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
            router.delete(route('admin.publicPages.destroy', id), {
                preserveScroll: true,
            });
        }
    }, []);

    const handleTogglePublish = useCallback((id: number) => {
        router.post(route('admin.publicPages.publish', id), {}, {
            preserveScroll: true,
        });
    }, []);

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Flash Messages */}
                {flash?.success && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            background: '#e8f5e9',
                            border: `2px solid ${THEME.success}`,
                            color: THEME.success,
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            background: '#ffebee',
                            border: `2px solid ${THEME.danger}`,
                            color: THEME.danger,
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Premium Header Section with Gradient Background */}
                <div
                    style={{
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                        borderRadius: '20px',
                        padding: '2.5rem',
                        color: '#FFFFFF',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 16px 48px rgba(13, 110, 253, 0.20)',
                    }}
                >
                    {/* Background decoration */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-40px',
                            right: '-40px',
                            width: '200px',
                            height: '200px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '50%',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-60px',
                            left: '-60px',
                            width: '300px',
                            height: '300px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '50%',
                        }}
                    />

                    {/* Header Content */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <Globe size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Public Pages
                            </h1>
                        </div>
                        <p
                            style={{
                                fontSize: '1.05rem',
                                color: 'rgba(255, 255, 255, 0.95)',
                                margin: 0,
                                maxWidth: '600px',
                                lineHeight: 1.6,
                                fontWeight: 500,
                            }}
                        >
                            Create, edit, and manage static public pages across the platform
                        </p>
                    </div>
                </div>

                {/* Create Page Button */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => router.get(route('admin.publicPages.create'))}
                        style={{
                            paddingLeft: '1.85rem',
                            paddingRight: '1.85rem',
                            paddingTop: '0.8rem',
                            paddingBottom: '0.8rem',
                            background: `linear-gradient(135deg, ${THEME.success} 0%, #157347 100%)`,
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontSize: '0.96rem',
                            letterSpacing: '0.3px',
                            boxShadow: '0 4px 12px rgba(25, 135, 84, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 16px 32px rgba(25, 135, 84, 0.40)';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 135, 84, 0.25)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Create Page
                    </button>
                </div>

                {/* Public Pages Table */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    {pages.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Title
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Slug
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Status
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Last Edited
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Edited By
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pages.map((page) => (
                                        <tr
                                            key={page.id}
                                            style={{
                                                borderBottom: '1.5px solid #E5E7EB',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                background: '#FFFFFF',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#F9FAFB';
                                                e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(13, 110, 253, 0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = '#FFFFFF';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {/* Title */}
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                                    {page.title}
                                                </p>
                                            </td>

                                            {/* Slug */}
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        paddingLeft: '0.75rem',
                                                        paddingRight: '0.75rem',
                                                        paddingTop: '0.45rem',
                                                        paddingBottom: '0.45rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 700,
                                                        backgroundColor: '#f0f7ff',
                                                        color: THEME.primary,
                                                        border: '1.5px solid #cfe2ff',
                                                        fontFamily: 'monospace',
                                                    }}
                                                >
                                                    /{page.slug}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        paddingLeft: '0.75rem',
                                                        paddingRight: '0.75rem',
                                                        paddingTop: '0.5rem',
                                                        paddingBottom: '0.5rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600,
                                                        border: `1.5px solid ${page.is_published ? THEME.success : THEME.secondary}`,
                                                        backgroundColor: page.is_published ? '#e8f5e9' : '#f0f0f0',
                                                        color: page.is_published ? THEME.success : THEME.secondary,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            backgroundColor: page.is_published ? THEME.success : THEME.secondary,
                                                        }}
                                                    />
                                                    {page.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>

                                            {/* Last Edited */}
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {page.last_edited_at_formatted || '--'}
                                            </td>

                                            {/* Edited By */}
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {page.edited_by || '--'}
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                                                    {/* Publish/Unpublish Toggle */}
                                                    <button
                                                        onClick={() => handleTogglePublish(page.id)}
                                                        title={page.is_published ? 'Unpublish' : 'Publish'}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.4rem',
                                                            paddingLeft: '0.85rem',
                                                            paddingRight: '0.85rem',
                                                            paddingTop: '0.55rem',
                                                            paddingBottom: '0.55rem',
                                                            background: page.is_published ? '#fff3e0' : '#e8f5e9',
                                                            color: page.is_published ? '#e65100' : THEME.success,
                                                            border: `2px solid ${page.is_published ? '#ffcc80' : THEME.success}`,
                                                            borderRadius: '10px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (page.is_published) {
                                                                e.currentTarget.style.background = '#e65100';
                                                                e.currentTarget.style.color = '#FFFFFF';
                                                                e.currentTarget.style.borderColor = '#e65100';
                                                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(230, 81, 0, 0.35)';
                                                            } else {
                                                                e.currentTarget.style.background = THEME.success;
                                                                e.currentTarget.style.color = '#FFFFFF';
                                                                e.currentTarget.style.borderColor = THEME.success;
                                                                e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.success}35`;
                                                            }
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (page.is_published) {
                                                                e.currentTarget.style.background = '#fff3e0';
                                                                e.currentTarget.style.color = '#e65100';
                                                                e.currentTarget.style.borderColor = '#ffcc80';
                                                            } else {
                                                                e.currentTarget.style.background = '#e8f5e9';
                                                                e.currentTarget.style.color = THEME.success;
                                                                e.currentTarget.style.borderColor = THEME.success;
                                                            }
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        }}
                                                    >
                                                        {page.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        {page.is_published ? 'Unpublish' : 'Publish'}
                                                    </button>

                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={() => router.get(route('admin.publicPages.edit', page.id))}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.4rem',
                                                            paddingLeft: '0.85rem',
                                                            paddingRight: '0.85rem',
                                                            paddingTop: '0.55rem',
                                                            paddingBottom: '0.55rem',
                                                            background: '#e7f1ff',
                                                            color: THEME.primary,
                                                            border: '2px solid #cfe2ff',
                                                            borderRadius: '10px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = THEME.primary;
                                                            e.currentTarget.style.color = '#FFFFFF';
                                                            e.currentTarget.style.borderColor = THEME.primary;
                                                            e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.primary}35`;
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = '#e7f1ff';
                                                            e.currentTarget.style.color = THEME.primary;
                                                            e.currentTarget.style.borderColor = '#cfe2ff';
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        }}
                                                    >
                                                        <Pencil size={14} />
                                                        Edit
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => handleDelete(page.id)}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.4rem',
                                                            paddingLeft: '0.85rem',
                                                            paddingRight: '0.85rem',
                                                            paddingTop: '0.55rem',
                                                            paddingBottom: '0.55rem',
                                                            background: '#ffebee',
                                                            color: THEME.danger,
                                                            border: `2px solid #f5c6cb`,
                                                            borderRadius: '10px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = THEME.danger;
                                                            e.currentTarget.style.color = '#FFFFFF';
                                                            e.currentTarget.style.borderColor = THEME.danger;
                                                            e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.danger}35`;
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = '#ffebee';
                                                            e.currentTarget.style.color = THEME.danger;
                                                            e.currentTarget.style.borderColor = '#f5c6cb';
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: '#F3F4F6',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                }}
                            >
                                <Globe size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No public pages found
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                Create your first public page to get started
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
