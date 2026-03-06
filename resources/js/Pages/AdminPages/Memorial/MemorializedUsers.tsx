import { useState, useCallback, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    Heart,
    Calendar,
    MessageSquare,
} from 'lucide-react';

interface MemorializedUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    profile_image_url: string | null;
    memorialized_at: string;
    memorialized_by_name: string;
    memorial_messages_count: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: MemorializedUser[];
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
}

interface Props {
    users: PaginatedData;
    statistics: Statistics;
    search: string;
    perPage: number;
}

function UserAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <div className="ap-avatar ap-avatar-md ap-avatar-indigo">
                <img src={imageUrl} alt={name} onError={() => setImageError(true)} />
            </div>
        );
    }

    return (
        <div className="ap-avatar ap-avatar-md ap-avatar-indigo">
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function MemorializedUsers({ users, statistics, search, perPage }: Props) {
    const [searchQuery, setSearchQuery] = useState(search || '');
    const isInitialMount = useRef(true);

    const handleSearch = useCallback(() => {
        router.get(
            route('admin.memorial.memorialized'),
            { search: searchQuery, per_page: perPage },
            { preserveScroll: true, preserveState: true }
        );
    }, [searchQuery, perPage]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timer = setTimeout(() => {
            handleSearch();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handlePageChange = (page: number) => {
        router.get(
            route('admin.memorial.memorialized'),
            { page, search: searchQuery, per_page: perPage },
            { preserveScroll: true }
        );
    };

    return (
        <AdminLayout>
            <div>
                {/* Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Memorialized Users</h1>
                    <p className="ap-page-subtitle">View all memorialized user accounts and their memorial messages ({statistics.total} total)</p>
                </div>

                {/* Stats */}
                <div className="ap-stats-grid">
                    <div className="ap-stat-card">
                        <div className="ap-stat-card-header">
                            <p className="ap-stat-label">Total Memorialized</p>
                            <div className="ap-stat-icon indigo">
                                <Heart size={20} strokeWidth={1.5} />
                            </div>
                        </div>
                        <p className="ap-stat-value">{statistics.total}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="ap-filter-bar">
                    <div className="ap-search-bar">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="ap-table-wrap">
                    {users.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Memorialized Date</th>
                                        <th>Memorialized By</th>
                                        <th>Messages</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <UserAvatar imageUrl={user.profile_image_url} name={`${user.first_name} ${user.last_name}`} />
                                                    <div>
                                                        <p className="ap-user-cell-name">{user.first_name} {user.last_name}</p>
                                                        <p className="ap-user-cell-sub">@{user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ap-flex ap-items-center ap-gap-xs">
                                                    <Calendar size={14} className="ap-text-secondary" />
                                                    <span className="ap-text-secondary">{new Date(user.memorialized_at).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="secondary">{user.memorialized_by_name}</td>
                                            <td>
                                                <div className="ap-flex ap-items-center ap-gap-xs">
                                                    <MessageSquare size={14} className="ap-text-secondary" />
                                                    <span className="ap-font-semibold">{user.memorial_messages_count}</span>
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
                                <Heart size={24} />
                            </div>
                            <p className="ap-empty-title">No memorialized users found</p>
                            <p className="ap-empty-text">Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{users.from}</strong> to{' '}
                            <strong>{users.to}</strong> of{' '}
                            <strong>{users.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            {users.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => { if (link.url) { const url = new URL(link.url, window.location.origin); handlePageChange(parseInt(url.searchParams.get('page') || '1')); } }}
                                    disabled={!link.url}
                                    className={`ap-page-btn ${link.active ? 'active' : ''}`}
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
