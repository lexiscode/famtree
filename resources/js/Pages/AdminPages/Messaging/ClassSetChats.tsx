import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    Mail,
    Activity,
    Building2,
    Calendar,
} from 'lucide-react';

interface ClassSetChat {
    id: number;
    name: string;
    year: string | null;
    organization_name: string | null;
    member_count: number;
    messages_count: number;
    last_activity: string | null;
    last_activity_formatted: string | null;
}

interface PaginatedData {
    data: ClassSetChat[];
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
    classSetChats: PaginatedData;
    statistics: Statistics;
    filters: Record<string, any>;
    search: string;
    perPage: number;
}

export default function ClassSetChats({ classSetChats, statistics, filters, search, perPage }: Props) {
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
        router.get(route('admin.messaging.classSetChats'), buildParams(), { preserveScroll: true });
    }, [buildParams]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(route('admin.messaging.classSetChats'), buildParams(), { preserveScroll: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        router.get(route('admin.messaging.classSetChats'), { search: '', per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = (page: number) => {
        router.get(route('admin.messaging.classSetChats'), { ...buildParams(), page }, { preserveScroll: true });
    };

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = classSetChats.current_page;
        const last = classSetChats.last_page;

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
                    <h1 className="ap-page-title">Class Set Chats</h1>
                    <p className="ap-page-subtitle">Monitor and oversee all class set group conversations across organizations</p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Class Set Chats', value: statistics.total_conversations, icon: Users, colorClass: 'indigo' },
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
                            placeholder="Search class set chats by name or organization..."
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

                {/* Class Set Chats Table */}
                <div className="ap-table-wrap">
                    {classSetChats.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Class Set Name</th>
                                        <th>Organization</th>
                                        <th>Year</th>
                                        <th>Members</th>
                                        <th>Messages</th>
                                        <th>Last Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classSetChats.data.map((chat) => (
                                        <tr key={chat.id}>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <div className="ap-avatar ap-avatar-md ap-avatar-indigo">
                                                        <Users size={18} />
                                                    </div>
                                                    <p className="ap-user-cell-name">{chat.name}</p>
                                                </div>
                                            </td>
                                            <td>
                                                {chat.organization_name ? (
                                                    <div className="ap-flex ap-items-center ap-gap-xs">
                                                        <Building2 size={14} className="ap-text-secondary" />
                                                        <span>{chat.organization_name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="ap-text-tertiary">N/A</span>
                                                )}
                                            </td>
                                            <td>
                                                {chat.year ? (
                                                    <span className="ap-badge ap-badge-primary">
                                                        <Calendar size={12} />
                                                        {chat.year}
                                                    </span>
                                                ) : (
                                                    <span className="ap-text-tertiary">N/A</span>
                                                )}
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Users size={24} />
                            </div>
                            <p className="ap-empty-title">No class set chats found</p>
                            <p className="ap-empty-text">Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {classSetChats.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{classSetChats.from}</strong> to{' '}
                            <strong>{classSetChats.to}</strong> of{' '}
                            <strong>{classSetChats.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(classSetChats.current_page - 1)}
                                disabled={classSetChats.current_page === 1}
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`ap-page-btn ${page === classSetChats.current_page ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(classSetChats.current_page + 1)}
                                disabled={classSetChats.current_page === classSetChats.last_page}
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
