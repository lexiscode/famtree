import { useState, useCallback, useRef, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    Vote,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Users,
} from 'lucide-react';

interface Election {
    id: number;
    type: string;
    status: string;
    positions_to_fill: number;
    is_active: boolean;
    has_ended: boolean;
    candidates_count: number;
    votes_count: number;
    started_at: string | null;
    ends_at: string | null;
    ends_at_formatted: string | null;
    class_set: {
        id: number;
        name: string;
        year: string | null;
        department: { id: number; name: string } | null;
    } | null;
    created_at: string;
    created_at_formatted: string;
}

interface PaginatedData {
    data: Election[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
}

interface Props {
    elections: PaginatedData;
    statistics: Statistics;
    filters: Record<string, any>;
    search: string;
    perPage: number;
}

const statusBadgeMap: Record<string, string> = {
    active: 'ap-badge-success',
    completed: 'ap-badge-info',
    cancelled: 'ap-badge-danger',
    tiebreaker: 'ap-badge-warning',
};

export default function Elections({ elections, statistics, search, filters, perPage }: Props) {
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
        router.get(route('admin.elections.index'), buildParams(), { preserveScroll: true, preserveState: true });
    }, [buildParams]);

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
        router.get(route('admin.elections.index'), { ...buildParams(), page }, { preserveScroll: true });
    };

    const handleReset = useCallback(() => {
        setSearchQuery('');
        router.get(route('admin.elections.index'), { search: '', per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const getStatusBadge = (status: string) => {
        const badgeClass = statusBadgeMap[status] || 'ap-badge-neutral';
        return (
            <span className={`ap-badge ${badgeClass} ap-capitalize`}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        return (
            <span className="ap-badge ap-badge-primary ap-capitalize">
                {type.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div>
{/* Page Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Group Elections</h1>
                    <p className="ap-page-subtitle">
                        Monitor and manage group leadership elections across the platform
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Elections', value: statistics.total, icon: Vote, colorClass: 'indigo' },
                        { label: 'Active', value: statistics.active, icon: Clock, colorClass: 'green' },
                        { label: 'Completed', value: statistics.completed, icon: CheckCircle, colorClass: 'blue' },
                        { label: 'Cancelled', value: statistics.cancelled, icon: XCircle, colorClass: 'red' },
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
                        <Search size={16} strokeWidth={2} />
                        <input
                            type="text"
                            placeholder="Search elections by class set name..."
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

                {/* Elections Table */}
                <div className="ap-table-wrap">
                    {elections.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Class Set</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Positions</th>
                                        <th>Candidates</th>
                                        <th>Votes</th>
                                        <th>Ends At</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {elections.data.map((election) => (
                                        <tr key={election.id}>
                                            <td>
                                                <div className="ap-user-cell-name">
                                                    {election.class_set?.name || 'N/A'}
                                                </div>
                                                {election.class_set?.department && (
                                                    <div className="ap-user-cell-sub">
                                                        {election.class_set.department.name}
                                                        {election.class_set.year ? ` - ${election.class_set.year}` : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td>{getTypeBadge(election.type)}</td>
                                            <td>{getStatusBadge(election.status)}</td>
                                            <td className="ap-font-semibold">{election.positions_to_fill}</td>
                                            <td className="secondary">
                                                <span className="ap-flex ap-items-center ap-gap-xs">
                                                    <Users size={14} /> {election.candidates_count}
                                                </span>
                                            </td>
                                            <td className="secondary">
                                                <span className="ap-flex ap-items-center ap-gap-xs">
                                                    <Vote size={14} /> {election.votes_count}
                                                </span>
                                            </td>
                                            <td className="secondary">{election.ends_at_formatted || 'N/A'}</td>
                                            <td className="center">
                                                <button
                                                    className="ap-btn ap-btn-primary ap-btn-sm"
                                                    onClick={() => router.get(route('admin.elections.show', election.id))}
                                                >
                                                    <Eye size={14} />
                                                    View
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
                                <Vote size={28} strokeWidth={1.5} />
                            </div>
                            <p className="ap-empty-title">No elections found</p>
                            <p className="ap-empty-text">Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {elections.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{elections.from}</strong> to <strong>{elections.to}</strong> of <strong>{elections.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            {Array.from({ length: elections.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    disabled={elections.current_page === page}
                                    className={`ap-page-btn ${elections.current_page === page ? 'active' : ''}`}
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
