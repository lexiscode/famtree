import { useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BookOpen,
    FileText,
    CheckCircle,
    Clock,
    Plus,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string | null;
    author: string | null;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
    created_at_formatted: string;
}

interface PaginatedData {
    data: BlogPost[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total: number;
    published: number;
    drafts: number;
}

interface Props {
    posts: PaginatedData;
    statistics: Statistics;
    perPage: number;
}

export default function Index({ posts, statistics, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const handlePageChange = useCallback(
        (page: number) => {
            router.get(
                route('admin.blog.index'),
                { page, per_page: perPage },
                { preserveScroll: true }
            );
        },
        [perPage]
    );

    const handleDelete = useCallback((id: number) => {
        if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
            router.delete(route('admin.blog.destroy', id), {
                preserveScroll: true,
            });
        }
    }, []);

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = posts.current_page;
        const last = posts.last_page;

        let start = Math.max(1, current - 2);
        let end = Math.min(last, current + 2);

        if (current <= 3) {
            end = Math.min(last, 5);
        }
        if (current >= last - 2) {
            start = Math.max(1, last - 4);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
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

                {/* Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Blog Management</h1>
                    <p className="ap-page-subtitle">Create, edit, and manage all blog posts across the platform</p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Posts', value: statistics.total, icon: FileText, colorClass: 'indigo' },
                        { label: 'Published', value: statistics.published, icon: CheckCircle, colorClass: 'green' },
                        { label: 'Drafts', value: statistics.drafts, icon: Clock, colorClass: 'amber' },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="ap-stat-card">
                                <div className="ap-stat-card-header">
                                    <p className="ap-stat-label">{stat.label}</p>
                                    <div className={`ap-stat-icon ${stat.colorClass}`}>
                                        <Icon size={20} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <p className="ap-stat-value">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Create Post Button */}
                <div className="ap-flex ap-justify-between ap-items-center ap-mb-lg">
                    <div />
                    <button
                        className="ap-btn ap-btn-success"
                        onClick={() => router.get(route('admin.blog.create'))}
                    >
                        <Plus size={16} /> Create Post
                    </button>
                </div>

                {/* Blog Posts Table */}
                <div className="ap-table-wrap">
                    {posts.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th className="center">Status</th>
                                        <th>Date</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.data.map((post) => (
                                        <tr key={post.id}>
                                            <td>
                                                <div>
                                                    <p className="ap-user-cell-name">{post.title}</p>
                                                    {post.author && (
                                                        <p className="ap-user-cell-sub">by {post.author}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {post.category ? (
                                                    <span className="ap-badge ap-badge-primary">{post.category}</span>
                                                ) : (
                                                    <span className="ap-text-sm ap-text-tertiary">--</span>
                                                )}
                                            </td>
                                            <td className="center">
                                                <span className={`ap-badge ${post.is_published ? 'ap-badge-success' : 'ap-badge-neutral'}`}>
                                                    <span className={`ap-badge-dot ${post.is_published ? 'success' : 'neutral'}`} />
                                                    {post.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="secondary">
                                                {post.created_at_formatted}
                                            </td>
                                            <td className="center">
                                                <div className="ap-flex ap-items-center ap-justify-center ap-gap-sm">
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-primary"
                                                        onClick={() => router.get(route('admin.blog.edit', post.id))}
                                                    >
                                                        <Pencil size={14} /> Edit
                                                    </button>
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-danger"
                                                        onClick={() => handleDelete(post.id)}
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
                                <BookOpen size={28} />
                            </div>
                            <p className="ap-empty-title">No blog posts found</p>
                            <p className="ap-empty-text">Create your first blog post to get started</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {posts.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{posts.from}</strong> to <strong>{posts.to}</strong> of <strong>{posts.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(posts.current_page - 1)}
                                disabled={posts.current_page === 1}
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>

                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    className={`ap-page-btn ${page === posts.current_page ? 'active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(posts.current_page + 1)}
                                disabled={posts.current_page === posts.last_page}
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
