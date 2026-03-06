import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    FileText,
    Mic,
    Flag,
    Eye,
    MessageSquare,
    Heart,
    ChevronDown,
    Filter,
    Trash2,
} from 'lucide-react';

interface PostUser {
    name: string;
    username: string;
    profile_image_url: string | null;
}

interface Post {
    id: number;
    user: PostUser;
    type: string;
    privacy: string;
    content: string;
    views_count: number;
    comments_count: number;
    reactions_count: number;
    created_at: string;
    created_at_formatted: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: Post[];
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
    text: number;
    voice: number;
    flagged: number;
}

interface Props {
    posts: PaginatedData;
    statistics: Statistics;
    search: string;
    filters: Record<string, any>;
    perPage: number;
}

interface AvatarProps {
    imageUrl: string | null;
    name: string;
}

function UserAvatar({ imageUrl, name }: AvatarProps) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <div className="ap-avatar ap-avatar-md">
                <img
                    src={imageUrl}
                    alt={name}
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    return (
        <div className="ap-avatar ap-avatar-md ap-avatar-indigo">
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function Posts({ posts, statistics, search, filters, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState(filters?.type || '');
    const [filterPrivacy, setFilterPrivacy] = useState(filters?.privacy || '');
    const isInitialMount = useRef(true);

    const buildParams = useCallback(() => {
        const filterObj: Record<string, any> = {};
        if (filterType) filterObj.type = filterType;
        if (filterPrivacy) filterObj.privacy = filterPrivacy;
        return {
            search: searchQuery,
            filters: filterObj,
            per_page: perPage,
        };
    }, [searchQuery, filterType, filterPrivacy, perPage]);

    const handleSearch = useCallback(() => {
        router.get(route('admin.content.posts'), buildParams(), { preserveScroll: true });
    }, [buildParams]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(route('admin.content.posts'), buildParams(), { preserveScroll: true, preserveState: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [filterType, filterPrivacy, searchQuery]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setFilterType('');
        setFilterPrivacy('');
        router.get(route('admin.content.posts'), { search: '', filters: {}, per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = (page: number) => {
        router.get(route('admin.content.posts'), { ...buildParams(), page }, { preserveScroll: true });
    };

    const handleDelete = (postId: number) => {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(route('admin.content.posts.delete', postId), { preserveScroll: true });
        }
    };

    const handleFlag = (postId: number) => {
        router.post(route('admin.content.posts.flag', postId), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <div>
{/* Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Post Management</h1>
                    <p className="ap-page-subtitle">Monitor and moderate all user-generated posts across the platform</p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Posts', value: statistics.total, icon: FileText, colorClass: 'indigo' },
                        { label: 'Text Posts', value: statistics.text, icon: FileText, colorClass: 'green' },
                        { label: 'Voice Posts', value: statistics.voice, icon: Mic, colorClass: 'blue' },
                        { label: 'Flagged', value: statistics.flagged, icon: Flag, colorClass: 'red' },
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

                {/* Search and Filters */}
                <div className="ap-filter-bar">
                    <div className="ap-search-bar">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search posts by content or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        className={`ap-btn ${showFilters ? 'ap-btn-primary' : 'ap-btn-secondary'}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={16} />
                        Filters
                        <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : '', transition: 'transform 0.2s ease' }} />
                    </button>
                </div>

                {showFilters && (
                    <div className="ap-filter-panel">
                        <div>
                            <label className="ap-filter-label">Type</label>
                            <select
                                className="ap-filter-select"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="text">Text</option>
                                <option value="voice">Voice</option>
                            </select>
                        </div>
                        <div>
                            <label className="ap-filter-label">Privacy</label>
                            <select
                                className="ap-filter-select"
                                value={filterPrivacy}
                                onChange={(e) => setFilterPrivacy(e.target.value)}
                            >
                                <option value="">All Privacy</option>
                                <option value="public">Public</option>
                                <option value="friends">Friends</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                    </div>
                )}

                {(searchQuery || filterType || filterPrivacy) && (
                    <button className="ap-reset-btn ap-mb-lg" onClick={handleReset}>
                        Reset all filters
                    </button>
                )}

                {/* Posts Table */}
                <div className="ap-table-wrap">
                    {posts.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Content</th>
                                        <th>Type</th>
                                        <th>Privacy</th>
                                        <th>Engagement</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.data.map((post) => (
                                        <tr key={post.id}>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <UserAvatar imageUrl={post.user.profile_image_url} name={post.user.name} />
                                                    <div>
                                                        <p className="ap-user-cell-name">{post.user.name}</p>
                                                        <p className="ap-user-cell-sub">@{post.user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="ap-truncate" style={{ maxWidth: '250px', display: 'block' }}>
                                                    {post.content}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`ap-badge ${post.type === 'voice' ? 'ap-badge-info' : 'ap-badge-primary'} ap-capitalize`}>
                                                    {post.type === 'voice' ? <Mic size={12} /> : <FileText size={12} />}
                                                    {post.type}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`ap-badge ap-capitalize ${post.privacy === 'public' ? 'ap-badge-success' : post.privacy === 'friends' ? 'ap-badge-warning' : 'ap-badge-neutral'}`}>
                                                    {post.privacy}
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
                                            <td className="secondary">
                                                {post.created_at_formatted}
                                            </td>
                                            <td>
                                                <div className="ap-flex ap-gap-sm">
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-primary"
                                                        onClick={() => router.get(route('admin.content.posts.show', post.id))}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-warning"
                                                        onClick={() => handleFlag(post.id)}
                                                    >
                                                        Flag
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
                                <FileText size={28} />
                            </div>
                            <p className="ap-empty-title">No posts found</p>
                            <p className="ap-empty-text">Try adjusting your search or filter criteria</p>
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
                            {posts.links.map((link, index) => (
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
