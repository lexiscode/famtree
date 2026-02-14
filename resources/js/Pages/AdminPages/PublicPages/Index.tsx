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
            <div>
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="ap-flash ap-flash-success">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="ap-flash ap-flash-error">{flash.error}</div>
                )}

                {/* Header */}
                <div className="ap-page-header">
                    <div className="ap-page-header-row">
                        <div>
                            <h1 className="ap-page-title">Public Pages</h1>
                            <p className="ap-page-subtitle">Create, edit, and manage static public pages across the platform</p>
                        </div>
                        <button
                            className="ap-btn ap-btn-success"
                            onClick={() => router.get(route('admin.publicPages.create'))}
                        >
                            <Plus size={18} /> Create Page
                        </button>
                    </div>
                </div>

                {/* Public Pages Table */}
                <div className="ap-table-wrap">
                    {pages.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Slug</th>
                                        <th className="center">Status</th>
                                        <th>Last Edited</th>
                                        <th>Edited By</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pages.map((page) => (
                                        <tr key={page.id}>
                                            <td className="ap-font-semibold">{page.title}</td>
                                            <td>
                                                <span className="ap-badge ap-badge-primary" style={{ fontFamily: 'monospace' }}>
                                                    /{page.slug}
                                                </span>
                                            </td>
                                            <td className="center">
                                                <span className={page.is_published ? 'ap-badge ap-badge-success' : 'ap-badge ap-badge-neutral'}>
                                                    <span className={`ap-badge-dot ${page.is_published ? 'success' : 'neutral'}`} />
                                                    {page.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="secondary">{page.last_edited_at_formatted || '--'}</td>
                                            <td className="secondary">{page.edited_by || '--'}</td>
                                            <td className="center">
                                                <div className="ap-flex ap-items-center ap-justify-center ap-gap-sm">
                                                    <button
                                                        className={page.is_published ? 'ap-btn ap-btn-sm ap-btn-warning' : 'ap-btn ap-btn-sm ap-btn-success'}
                                                        onClick={() => handleTogglePublish(page.id)}
                                                        title={page.is_published ? 'Unpublish' : 'Publish'}
                                                    >
                                                        {page.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        {page.is_published ? 'Unpublish' : 'Publish'}
                                                    </button>
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-primary"
                                                        onClick={() => router.get(route('admin.publicPages.edit', page.id))}
                                                    >
                                                        <Pencil size={14} /> Edit
                                                    </button>
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-danger"
                                                        onClick={() => handleDelete(page.id)}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Globe size={24} />
                            </div>
                            <p className="ap-empty-title">No public pages found</p>
                            <p className="ap-empty-text">Create your first public page to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
