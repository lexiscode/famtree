import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    GitBranch,
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    MessageSquare,
    Users,
    Mail,
    Activity,
} from 'lucide-react';

interface TreeChat {
    id: number;
    name: string;
    member_count: number;
    messages_count: number;
    last_activity: string | null;
    last_activity_formatted: string | null;
    created_at: string;
}

interface PaginatedData {
    data: TreeChat[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total_conversations: number;
    total_messages: number;
    active_today: number;
}

interface Props {
    treeChats: PaginatedData;
    statistics: Statistics;
    filters: Record<string, any>;
    search: string;
    perPage: number;
}

export default function TreeChats({ treeChats, statistics, filters, search, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [searchQuery, setSearchQuery] = useState(search || '');
    const isInitialMount = useRef(true);

    const buildParams = useCallback(() => {
        return {
            search: searchQuery,
            per_page: perPage,
        };
    }, [searchQuery, perPage]);

    const handleSearch = useCallback(() => {
        router.get(route('admin.messaging.treeChats'), buildParams(), { preserveScroll: true });
    }, [buildParams]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(route('admin.messaging.treeChats'), buildParams(), { preserveScroll: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        router.get(route('admin.messaging.treeChats'), { search: '', per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = (page: number) => {
        router.get(route('admin.messaging.treeChats'), { ...buildParams(), page }, { preserveScroll: true });
    };

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = treeChats.current_page;
        const last = treeChats.last_page;

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
{/* Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Family Tree Chats</h1>
                    <p className="ap-page-subtitle">Monitor and oversee all family tree group conversations</p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Tree Chats', value: statistics.total_conversations, icon: GitBranch, colorClass: 'indigo' },
                        { label: 'Total Messages', value: statistics.total_messages, icon: Mail, colorClass: 'green' },
                        { label: 'Active Today', value: statistics.active_today, icon: Activity, colorClass: 'blue' },
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
                            placeholder="Search tree chats by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button className="ap-btn ap-btn-primary" onClick={handleSearch}>
                        Search
                    </button>
                </div>

                {searchQuery && (
                    <button className="ap-reset-btn" onClick={handleReset}>
                        Reset all filters
                    </button>
                )}

                {/* Tree Chats Table */}
                <div className="ap-table-wrap">
                    {treeChats.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Tree Name</th>
                                        <th>Members</th>
                                        <th>Messages</th>
                                        <th>Last Activity</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {treeChats.data.map((chat) => (
                                        <tr key={chat.id}>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <div className="ap-avatar ap-avatar-md ap-avatar-indigo">
                                                        <GitBranch size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="ap-user-cell-name">{chat.name}</p>
                                                        <p className="ap-user-cell-sub">Created {new Date(chat.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ap-flex ap-items-center ap-gap-xs">
                                                    <Users size={14} />
                                                    <span className="ap-font-semibold">{chat.member_count}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ap-flex ap-items-center ap-gap-xs">
                                                    <MessageSquare size={14} />
                                                    <span className="ap-font-semibold">{chat.messages_count}</span>
                                                </div>
                                            </td>
                                            <td className="secondary">
                                                {chat.last_activity_formatted || 'No activity'}
                                            </td>
                                            <td>
                                                <button
                                                    className="ap-btn ap-btn-primary ap-btn-sm"
                                                    onClick={() => router.get(route('admin.messaging.viewTreeChat', chat.id))}
                                                >
                                                    <Eye size={14} />
                                                    View
                                                    <ChevronRight size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <GitBranch size={24} />
                            </div>
                            <p className="ap-empty-title">No tree chats found</p>
                            <p className="ap-empty-text">Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {treeChats.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{treeChats.from}</strong> to{' '}
                            <strong>{treeChats.to}</strong> of{' '}
                            <strong>{treeChats.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(treeChats.current_page - 1)}
                                disabled={treeChats.current_page === 1}
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`ap-page-btn ${page === treeChats.current_page ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(treeChats.current_page + 1)}
                                disabled={treeChats.current_page === treeChats.last_page}
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
