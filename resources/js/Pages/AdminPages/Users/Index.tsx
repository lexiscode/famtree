import { useState, useCallback, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    ChevronDown,
    Filter,
    Users,
    Shield,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
} from 'lucide-react';

interface User {
    id: number;
    full_name: string;
    username: string;
    email: string;
    status: string;
    account_status: string;
    profile_image_url: string | null;
    two_fa_enabled: boolean;
    is_child_account: boolean;
    created_at: string;
    created_at_formatted: string;
    onboarding_completed: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: User[];
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
    active: number;
    inactive: number;
    suspended: number;
    deleted: number;
    with_2fa: number;
    child_accounts: number;
}

interface Props {
    users: PaginatedData;
    statistics: Statistics;
    search: string;
    filters: Record<string, any>;
    perPage: number;
}

interface AvatarProps {
    imageUrl: string | null;
    fullName: string;
}

function UserAvatar({ imageUrl, fullName }: AvatarProps) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <div className="ap-avatar ap-avatar-lg">
                <img src={imageUrl} alt={fullName} onError={() => setImageError(true)} />
            </div>
        );
    }

    return (
        <div className="ap-avatar ap-avatar-lg ap-avatar-indigo">
            {fullName.charAt(0).toUpperCase()}
        </div>
    );
}

export default function Index({ users, statistics, search, filters, perPage }: Props) {
    const [searchQuery, setSearchQuery] = useState(search);
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState(filters.status || '');
    const [filterTwoFA, setFilterTwoFA] = useState(filters.twoFaEnabled !== undefined ? String(filters.twoFaEnabled) : '');
    const [filterChildAccount, setFilterChildAccount] = useState(filters.isChildAccount !== undefined ? String(filters.isChildAccount) : '');
    const isInitialMount = useRef(true);

    const handleSearch = useCallback(() => {
        const filterObj: Record<string, any> = {};

        if (filterStatus) {
            filterObj.status = filterStatus;
        }
        if (filterTwoFA !== '') {
            filterObj.twoFaEnabled = filterTwoFA === 'true';
        }
        if (filterChildAccount !== '') {
            filterObj.isChildAccount = filterChildAccount === 'true';
        }

        router.get(
            route('admin.users.index'),
            {
                search: searchQuery,
                filters: filterObj,
                per_page: perPage,
            },
            { preserveScroll: true }
        );
    }, [searchQuery, filterStatus, filterTwoFA, filterChildAccount, perPage]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timer = setTimeout(() => {
            const filterObj: Record<string, any> = {};

            if (filterStatus) {
                filterObj.status = filterStatus;
            }
            if (filterTwoFA !== '') {
                filterObj.twoFaEnabled = filterTwoFA === 'true';
            }
            if (filterChildAccount !== '') {
                filterObj.isChildAccount = filterChildAccount === 'true';
            }

            router.get(
                route('admin.users.index'),
                {
                    search: searchQuery,
                    filters: filterObj,
                    per_page: perPage,
                },
                { preserveScroll: true }
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [filterStatus, filterTwoFA, filterChildAccount]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setFilterStatus('');
        setFilterTwoFA('');
        setFilterChildAccount('');
        router.get(route('admin.users.index'), { search: '', filters: {}, per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = (page: number) => {
        const pageFilters: Record<string, any> = {};

        if (filterStatus) {
            pageFilters.status = filterStatus;
        }
        if (filterTwoFA !== '') {
            pageFilters.twoFaEnabled = filterTwoFA === 'true';
        }
        if (filterChildAccount !== '') {
            pageFilters.isChildAccount = filterChildAccount === 'true';
        }

        router.get(
            route('admin.users.index'),
            {
                page,
                search: searchQuery,
                filters: pageFilters,
                per_page: perPage,
            },
            { preserveScroll: true }
        );
    };

    const getStatusBadge = (user: User) => {
        const config: Record<string, { className: string; icon: typeof CheckCircle }> = {
            active: { className: 'ap-badge ap-badge-success', icon: CheckCircle },
            inactive: { className: 'ap-badge ap-badge-neutral', icon: Clock },
            suspended: { className: 'ap-badge ap-badge-danger', icon: AlertCircle },
        };
        const c = config[user.account_status] || config.inactive;
        const Icon = c.icon;
        return (
            <span className={c.className}>
                <Icon size={12} />
                <span className="ap-capitalize">{user.account_status}</span>
            </span>
        );
    };

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="ap-page-header">
                <h1 className="ap-page-title">User Management</h1>
                <p className="ap-page-subtitle">Manage and monitor all registered users in the system</p>
            </div>

            {/* Stats Grid */}
            <div className="ap-stats-grid">
                {[
                    { label: 'Total Users', value: statistics.total, icon: Users, colorClass: 'indigo' },
                    { label: 'Active', value: statistics.active, icon: CheckCircle, colorClass: 'green' },
                    { label: 'Suspended', value: statistics.suspended, icon: AlertCircle, colorClass: 'red' },
                    { label: 'With 2FA', value: statistics.with_2fa, icon: Shield, colorClass: 'blue' },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div className={`ap-stat-icon ${stat.colorClass}`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                            <p className="ap-stat-label">{stat.label}</p>
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
                        placeholder="Search by name, email, or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                <button className="ap-btn ap-btn-primary" onClick={handleSearch}>
                    Search
                </button>

                <button
                    className={`ap-btn ${showFilters ? 'ap-btn-primary' : 'ap-btn-secondary'}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={16} />
                    Filters
                    <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : '', transition: 'transform 0.2s ease' }} />
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="ap-filter-panel">
                    <div>
                        <label className="ap-filter-label">Status</label>
                        <select className="ap-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                    <div>
                        <label className="ap-filter-label">2FA Status</label>
                        <select className="ap-filter-select" value={filterTwoFA} onChange={(e) => setFilterTwoFA(e.target.value)}>
                            <option value="">All Users</option>
                            <option value="true">2FA Enabled</option>
                            <option value="false">2FA Disabled</option>
                        </select>
                    </div>
                    <div>
                        <label className="ap-filter-label">Account Type</label>
                        <select className="ap-filter-select" value={filterChildAccount} onChange={(e) => setFilterChildAccount(e.target.value)}>
                            <option value="">All Accounts</option>
                            <option value="false">Primary</option>
                            <option value="true">Child</option>
                        </select>
                    </div>
                </div>
            )}

            {(searchQuery || filterStatus || filterTwoFA !== '' || filterChildAccount !== '') && (
                <button className="ap-reset-btn ap-mb-lg" onClick={handleReset}>
                    Reset all filters
                </button>
            )}

            {/* Users Table */}
            <div className="ap-table-wrap">
                {users.data.length > 0 ? (
                    <div className="ap-table-scroll">
                        <table className="ap-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>2FA</th>
                                    <th>Type</th>
                                    <th className="center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="ap-user-cell">
                                                <UserAvatar imageUrl={user.profile_image_url} fullName={user.full_name} />
                                                <div>
                                                    <p className="ap-user-cell-name">{user.full_name}</p>
                                                    <p className="ap-user-cell-sub">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="secondary">{user.email}</td>
                                        <td>{getStatusBadge(user)}</td>
                                        <td className="secondary">{user.created_at}</td>
                                        <td>
                                            <span className={`ap-badge ${user.two_fa_enabled ? 'ap-badge-info' : 'ap-badge-neutral'}`}>
                                                {user.two_fa_enabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="ap-badge ap-badge-primary">
                                                {user.is_child_account ? 'Child' : 'Primary'}
                                            </span>
                                        </td>
                                        <td className="center">
                                            <button
                                                className="ap-btn ap-btn-primary ap-btn-sm"
                                                onClick={() => router.get(route('admin.users.show', user.id))}
                                            >
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
                            <Users size={28} />
                        </div>
                        <p className="ap-empty-title">No users found</p>
                        <p className="ap-empty-text">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {users.last_page > 1 && (
                <div className="ap-pagination">
                    <p className="ap-pagination-info">
                        Showing <strong>{users.from}</strong> to <strong>{users.to}</strong> of <strong>{users.total}</strong> results
                    </p>
                    <div className="ap-pagination-btns">
                        {users.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    if (link.url) {
                                        const url = new URL(link.url, window.location.origin);
                                        const page = url.searchParams.get('page') || '1';
                                        handlePageChange(parseInt(page));
                                    }
                                }}
                                disabled={!link.url}
                                className={`ap-page-btn ${link.active ? 'active' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
