import { useState, useCallback, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Link,
    Search,
    Filter,
    ChevronDown,
    CheckCircle,
    Clock,
    AlertTriangle,
    Heart,
} from 'lucide-react';

interface Connection {
    id: number;
    user_one: { id: number; full_name: string; username: string };
    user_two: { id: number; full_name: string; username: string };
    relationship_type: string;
    status: string;
    is_divorced: boolean;
    connected_at: string;
    connected_at_formatted: string;
}

interface PaginatedData {
    data: Connection[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total: number;
    accepted: number;
    pending: number;
    divorced: number;
}

interface Props {
    connections: PaginatedData;
    statistics: Statistics;
    filters: Record<string, any>;
    search: string;
    perPage: number;
}

const statusBadgeMap: Record<string, string> = {
    accepted: 'ap-badge-success',
    pending: 'ap-badge-warning',
    rejected: 'ap-badge-danger',
};

const relationshipBadgeMap: Record<string, string> = {
    spouse: 'ap-badge-danger',
    wife: 'ap-badge-danger',
    husband: 'ap-badge-danger',
    partner: 'ap-badge-danger',
    parent: 'ap-badge-primary',
    father: 'ap-badge-primary',
    mother: 'ap-badge-primary',
    child: 'ap-badge-info',
    son: 'ap-badge-info',
    daughter: 'ap-badge-info',
    sibling: 'ap-badge-neutral',
    brother: 'ap-badge-neutral',
    sister: 'ap-badge-neutral',
};

export default function Index({ connections, statistics, filters, search, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [searchQuery, setSearchQuery] = useState(search);
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState(filters.status || '');
    const [filterRelationship, setFilterRelationship] = useState(filters.relationship_type || '');
    const isInitialMount = useRef(true);

    const handleSearch = useCallback(() => {
        const filterObj: Record<string, any> = {};
        if (filterStatus) {
            filterObj.status = filterStatus;
        }
        if (filterRelationship) {
            filterObj.relationship_type = filterRelationship;
        }

        router.get(
            route('admin.connections.index'),
            {
                search: searchQuery,
                filters: filterObj,
                per_page: perPage,
            },
            { preserveScroll: true }
        );
    }, [searchQuery, filterStatus, filterRelationship, perPage]);

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
            if (filterRelationship) {
                filterObj.relationship_type = filterRelationship;
            }

            router.get(
                route('admin.connections.index'),
                {
                    search: searchQuery,
                    filters: filterObj,
                    per_page: perPage,
                },
                { preserveScroll: true, preserveState: true }
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [filterStatus, filterRelationship, searchQuery]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setFilterStatus('');
        setFilterRelationship('');
        router.get(route('admin.connections.index'), { search: '', filters: {}, per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = (page: number) => {
        const pageFilters: Record<string, any> = {};
        if (filterStatus) {
            pageFilters.status = filterStatus;
        }
        if (filterRelationship) {
            pageFilters.relationship_type = filterRelationship;
        }

        router.get(
            route('admin.connections.index'),
            {
                page,
                search: searchQuery,
                filters: pageFilters,
                per_page: perPage,
            },
            { preserveScroll: true }
        );
    };

    const getStatusBadge = (status: string) => {
        const badgeClass = statusBadgeMap[status] || 'ap-badge-neutral';
        return (
            <span className={`ap-badge ${badgeClass} ap-capitalize`}>
                {status}
            </span>
        );
    };

    const getRelationshipBadge = (type: string) => {
        const badgeClass = relationshipBadgeMap[type.toLowerCase()] || 'ap-badge-neutral';
        return (
            <span className={`ap-badge ${badgeClass} ap-capitalize`}>
                {type.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div>
                {/* Page Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Connections</h1>
                    <p className="ap-page-subtitle">
                        Monitor and manage all user connections and relationships across the platform
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total', value: statistics.total, icon: Link, colorClass: 'indigo' },
                        { label: 'Accepted', value: statistics.accepted, icon: CheckCircle, colorClass: 'green' },
                        { label: 'Pending', value: statistics.pending, icon: Clock, colorClass: 'amber' },
                        { label: 'Divorced', value: statistics.divorced, icon: Heart, colorClass: 'red' },
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
                        <Search size={16} strokeWidth={2} />
                        <input
                            type="text"
                            placeholder="Search by user name or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        className={`ap-btn ${showFilters ? 'ap-btn-primary' : 'ap-btn-secondary'}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={16} strokeWidth={2} />
                        Filters
                        <ChevronDown size={14} className={showFilters ? 'ap-sidebar-chevron open' : 'ap-sidebar-chevron'} />
                    </button>
                </div>

                {showFilters && (
                    <div className="ap-filter-panel">
                        <div>
                            <label className="ap-filter-label">Status</label>
                            <select
                                className="ap-filter-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="accepted">Accepted</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="ap-filter-label">Relationship Type</label>
                            <select
                                className="ap-filter-select"
                                value={filterRelationship}
                                onChange={(e) => setFilterRelationship(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="spouse">Spouse</option>
                                <option value="parent">Parent</option>
                                <option value="child">Child</option>
                                <option value="sibling">Sibling</option>
                                <option value="father">Father</option>
                                <option value="mother">Mother</option>
                                <option value="son">Son</option>
                                <option value="daughter">Daughter</option>
                                <option value="brother">Brother</option>
                                <option value="sister">Sister</option>
                                <option value="husband">Husband</option>
                                <option value="wife">Wife</option>
                            </select>
                        </div>
                    </div>
                )}

                {(searchQuery || filterStatus || filterRelationship) && (
                    <button className="ap-reset-btn" onClick={handleReset}>
                        Reset all filters
                    </button>
                )}

                {/* Connections Table */}
                <div className="ap-table-wrap">
                    {connections.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>User 1</th>
                                        <th>User 2</th>
                                        <th>Relationship</th>
                                        <th>Status</th>
                                        <th>Divorced</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {connections.data.map((connection) => (
                                        <tr key={connection.id}>
                                            <td>
                                                <div className="ap-user-cell-name">{connection.user_one.full_name}</div>
                                                <div className="ap-user-cell-sub">@{connection.user_one.username}</div>
                                            </td>
                                            <td>
                                                <div className="ap-user-cell-name">{connection.user_two.full_name}</div>
                                                <div className="ap-user-cell-sub">@{connection.user_two.username}</div>
                                            </td>
                                            <td>{getRelationshipBadge(connection.relationship_type)}</td>
                                            <td>{getStatusBadge(connection.status)}</td>
                                            <td>
                                                <span className={`ap-badge ${connection.is_divorced ? 'ap-badge-danger' : 'ap-badge-neutral'}`}>
                                                    {connection.is_divorced ? (
                                                        <>
                                                            <AlertTriangle size={12} />
                                                            Yes
                                                        </>
                                                    ) : (
                                                        'No'
                                                    )}
                                                </span>
                                            </td>
                                            <td className="secondary">{connection.connected_at_formatted}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Link size={28} strokeWidth={1.5} />
                            </div>
                            <p className="ap-empty-title">No connections found</p>
                            <p className="ap-empty-text">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {connections.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{connections.from}</strong> to <strong>{connections.to}</strong> of <strong>{connections.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            {Array.from({ length: connections.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    disabled={page === connections.current_page}
                                    className={`ap-page-btn ${page === connections.current_page ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
