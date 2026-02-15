import { useState, useCallback, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    FileText,
    Eye,
    MessageSquare,
    Heart,
    Pin,
    Building2,
    Trash2,
} from 'lucide-react';

interface Organization {
    name: string;
    logo_url: string | null;
}

interface Creator {
    username: string;
}

interface OrgPost {
    id: number;
    organization: Organization;
    creator: Creator;
    type: string;
    content: string;
    views_count: number;
    comments_count: number;
    reactions_count: number;
    is_pinned: boolean;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: OrgPost[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface Statistics {
    total: number;
    pinned: number;
}

interface Props {
    orgPosts: PaginatedData;
    statistics: Statistics;
    search: string;
    perPage: number;
}

function OrgAvatar({ logoUrl, name }: { logoUrl: string | null; name: string }) {
    const [imageError, setImageError] = useState(false);

    if (logoUrl && !imageError) {
        return (
            <div className="ap-avatar ap-avatar-md">
                <img src={logoUrl} alt={name} onError={() => setImageError(true)} />
            </div>
        );
    }

    return (
        <div className="ap-avatar ap-avatar-md ap-avatar-indigo">
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function OrgPosts({ orgPosts, statistics, search, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [searchQuery, setSearchQuery] = useState(search || '');
    const isInitialMount = useRef(true);

    const handleSearch = useCallback(() => {
        router.get(route('admin.content.orgPosts'), { search: searchQuery, per_page: perPage }, { preserveScroll: true });
    }, [searchQuery, perPage]);

    const handlePageChange = (page: number) => {
        router.get(route('admin.content.orgPosts'), { page, search: searchQuery, per_page: perPage }, { preserveScroll: true });
    };

    const handleDelete = (postId: number) => {
        if (confirm('Are you sure you want to delete this organization post?')) {
            router.delete(route('admin.content.orgPosts.delete', postId), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <div>
{/* Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Organization Posts</h1>
                    <p className="ap-page-subtitle">Manage and moderate posts created by organizations</p>
                </div>

                {/* Stats */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Org Posts', value: statistics.total, icon: FileText, colorClass: 'indigo' },
                        { label: 'Pinned Posts', value: statistics.pinned, icon: Pin, colorClass: 'amber' },
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

                {/* Search */}
                <div className="ap-filter-bar">
                    <div className="ap-search-bar">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search org posts by content or organization..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button className="ap-btn ap-btn-primary" onClick={handleSearch}>
                        Search
                    </button>
                </div>

                {/* Table */}
                <div className="ap-table-wrap">
                    {orgPosts.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Organization</th>
                                        <th>Content</th>
                                        <th>Creator</th>
                                        <th>Type</th>
                                        <th>Engagement</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orgPosts.data.map((post) => (
                                        <tr key={post.id}>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <OrgAvatar logoUrl={post.organization.logo_url} name={post.organization.name} />
                                                    <p className="ap-user-cell-name">{post.organization.name}</p>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="ap-truncate" style={{ maxWidth: '220px', display: 'block' }}>
                                                    {post.content}
                                                </span>
                                            </td>
                                            <td className="secondary">
                                                @{post.creator.username}
                                            </td>
                                            <td>
                                                <span className="ap-badge ap-badge-primary ap-capitalize">
                                                    {post.type}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="ap-flex ap-items-center ap-gap-md">
                                                    <span className="ap-flex ap-items-center ap-gap-xs ap-text-sm ap-text-secondary">
                                                        <Eye size={14} /> {post.views_count}
                                                    </span>
                                                    <span className="ap-flex ap-items-center ap-gap-xs ap-text-sm ap-text-secondary">
                                                        <MessageSquare size={14} /> {post.comments_count}
                                                    </span>
                                                    <span className="ap-flex ap-items-center ap-gap-xs ap-text-sm ap-text-secondary">
                                                        <Heart size={14} /> {post.reactions_count}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {post.is_pinned ? (
                                                    <span className="ap-badge ap-badge-warning">
                                                        <Pin size={12} /> Pinned
                                                    </span>
                                                ) : (
                                                    <span className="ap-text-sm ap-text-tertiary">--</span>
                                                )}
                                            </td>
                                            <td className="secondary">
                                                {post.created_at}
                                            </td>
                                            <td>
                                                <div className="ap-flex ap-gap-sm">
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-primary"
                                                        onClick={() => router.get(route('admin.content.orgPosts.show', post.id))}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-danger"
                                                        onClick={() => handleDelete(post.id)}
                                                    >
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
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Building2 size={28} />
                            </div>
                            <p className="ap-empty-title">No organization posts found</p>
                            <p className="ap-empty-text">Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {orgPosts.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{orgPosts.from}</strong> to <strong>{orgPosts.to}</strong> of <strong>{orgPosts.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            {orgPosts.links.map((link, index) => (
                                <button
                                    key={index}
                                    className={`ap-page-btn ${link.active ? 'active' : ''}`}
                                    onClick={() => {
                                        if (link.url) {
                                            const url = new URL(link.url, window.location.origin);
                                            const page = url.searchParams.get('page') || '1';
                                            handlePageChange(parseInt(page));
                                        }
                                    }}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
