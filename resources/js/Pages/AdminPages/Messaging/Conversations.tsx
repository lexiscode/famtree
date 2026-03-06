import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    MessageSquare,
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    Mail,
    Activity,
} from 'lucide-react';

interface ConversationUser {
    id: number;
    full_name: string;
    username: string;
    profile_image_url: string | null;
}

interface Conversation {
    id: number;
    user_one: ConversationUser;
    user_two: ConversationUser;
    messages_count: number;
    last_message_at: string | null;
    last_message_at_formatted: string | null;
    created_at: string;
}

interface PaginatedData {
    data: Conversation[];
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
    conversations: PaginatedData;
    statistics: Statistics;
    filters: Record<string, any>;
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

export default function Conversations({ conversations, statistics, filters, search, perPage }: Props) {
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
        router.get(route('admin.messaging.conversations'), buildParams(), { preserveScroll: true, preserveState: true });
    }, [buildParams]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(route('admin.messaging.conversations'), buildParams(), { preserveScroll: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        router.get(route('admin.messaging.conversations'), { search: '', per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = (page: number) => {
        router.get(route('admin.messaging.conversations'), { ...buildParams(), page }, { preserveScroll: true });
    };

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = conversations.current_page;
        const last = conversations.last_page;

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
                    <h1 className="ap-page-title">Private Messages</h1>
                    <p className="ap-page-subtitle">Monitor and oversee all private conversations across the platform</p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Conversations', value: statistics.total_conversations, icon: MessageSquare, colorClass: 'indigo' },
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
                            placeholder="Search conversations by username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {searchQuery && (
                    <button className="ap-reset-btn" onClick={handleReset}>
                        Reset all filters
                    </button>
                )}

                {/* Conversations Table */}
                <div className="ap-table-wrap">
                    {conversations.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>User 1</th>
                                        <th>User 2</th>
                                        <th>Messages</th>
                                        <th>Last Activity</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {conversations.data.map((conversation) => (
                                        <tr key={conversation.id}>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <UserAvatar imageUrl={conversation.user_one.profile_image_url} name={conversation.user_one.full_name} />
                                                    <div>
                                                        <p className="ap-user-cell-name">{conversation.user_one.full_name}</p>
                                                        <p className="ap-user-cell-sub">@{conversation.user_one.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <UserAvatar imageUrl={conversation.user_two.profile_image_url} name={conversation.user_two.full_name} />
                                                    <div>
                                                        <p className="ap-user-cell-name">{conversation.user_two.full_name}</p>
                                                        <p className="ap-user-cell-sub">@{conversation.user_two.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ap-flex ap-items-center ap-gap-xs">
                                                    <MessageSquare size={14} />
                                                    <span className="ap-font-semibold">{conversation.messages_count}</span>
                                                </div>
                                            </td>
                                            <td className="secondary">
                                                {conversation.last_message_at_formatted || 'No messages'}
                                            </td>
                                            <td>
                                                <button
                                                    className="ap-btn ap-btn-primary ap-btn-sm"
                                                    onClick={() => router.get(route('admin.messaging.viewConversation', conversation.id))}
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
                                <MessageSquare size={24} />
                            </div>
                            <p className="ap-empty-title">No conversations found</p>
                            <p className="ap-empty-text">Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {conversations.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{conversations.from}</strong> to{' '}
                            <strong>{conversations.to}</strong> of{' '}
                            <strong>{conversations.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(conversations.current_page - 1)}
                                disabled={conversations.current_page === 1}
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`ap-page-btn ${page === conversations.current_page ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(conversations.current_page + 1)}
                                disabled={conversations.current_page === conversations.last_page}
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
