import { useState, useCallback, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    ChevronDown,
    Filter,
    ShieldCheck,
    CheckCircle,
    Clock,
    ChevronRight,
    XCircle,
    Eye,
} from 'lucide-react';

interface User {
    name: string;
    username: string;
    profile_image_url: string | null;
}

interface Verification {
    id: number;
    uuid: string;
    user: User;
    stage: string;
    status: string;
    created_at: string;
    created_at_formatted: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: Verification[];
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
    pending: number;
    completed: number;
    cancelled: number;
}

interface Props {
    verifications: PaginatedData;
    statistics: Statistics;
    search: string;
    filters: Record<string, any>;
    perPage: number;
}

const stageBadgeMap: Record<string, string> = {
    reengagement: 'ap-badge ap-badge-warning',
    family_check: 'ap-badge ap-badge-info',
    final_review: 'ap-badge ap-badge-success',
};

const statusBadgeMap: Record<string, string> = {
    pending: 'ap-badge ap-badge-warning',
    in_progress: 'ap-badge ap-badge-primary',
    completed: 'ap-badge ap-badge-success',
    cancelled: 'ap-badge ap-badge-danger',
};

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

export default function Verifications({ verifications, statistics, search, filters, perPage }: Props) {
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStage, setFilterStage] = useState(filters.stage || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || '');
    const isInitialMount = useRef(true);

    const buildFilterObj = useCallback(() => {
        const filterObj: Record<string, any> = {};
        if (filterStage) filterObj.stage = filterStage;
        if (filterStatus) filterObj.status = filterStatus;
        return filterObj;
    }, [filterStage, filterStatus]);

    const handleSearch = useCallback(() => {
        router.get(
            route('admin.memorial.verifications'),
            { search: searchQuery, filters: buildFilterObj(), per_page: perPage },
            { preserveScroll: true }
        );
    }, [searchQuery, buildFilterObj, perPage]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(
                route('admin.memorial.verifications'),
                { search: searchQuery, filters: buildFilterObj(), per_page: perPage },
                { preserveScroll: true, preserveState: true }
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [filterStage, filterStatus, searchQuery]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setFilterStage('');
        setFilterStatus('');
        router.get(route('admin.memorial.verifications'), { search: '', filters: {}, per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = (page: number) => {
        router.get(
            route('admin.memorial.verifications'),
            { page, search: searchQuery, filters: buildFilterObj(), per_page: perPage },
            { preserveScroll: true }
        );
    };

    return (
        <AdminLayout>
            <div>
                {/* Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Deceased Verifications</h1>
                    <p className="ap-page-subtitle">Manage and monitor deceased user verification requests and their progress</p>
                </div>

                {/* Stats */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Verifications', value: statistics.total, icon: ShieldCheck, colorClass: 'indigo' },
                        { label: 'Pending', value: statistics.pending, icon: Clock, colorClass: 'amber' },
                        { label: 'Completed', value: statistics.completed, icon: CheckCircle, colorClass: 'green' },
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

                {/* Search and Filters */}
                <div className="ap-filter-bar">
                    <div className="ap-search-bar">
                        <Search size={16} />
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
                        <Filter size={16} />
                        Filters
                        <ChevronDown size={14} />
                    </button>
                </div>

                {showFilters && (
                    <div className="ap-filter-panel">
                        <div>
                            <label className="ap-filter-label">Stage</label>
                            <select className="ap-filter-select" value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                                <option value="">All Stages</option>
                                <option value="reengagement">Reengagement</option>
                                <option value="family_check">Family Check</option>
                                <option value="final_review">Final Review</option>
                            </select>
                        </div>
                        <div>
                            <label className="ap-filter-label">Status</label>
                            <select className="ap-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                )}

                {(searchQuery || filterStage || filterStatus) && (
                    <button className="ap-reset-btn" onClick={handleReset}>
                        Reset all filters
                    </button>
                )}

                {/* Table */}
                <div className="ap-table-wrap">
                    {verifications.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Stage</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {verifications.data.map((v) => (
                                        <tr key={v.id}>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <UserAvatar imageUrl={v.user.profile_image_url} name={v.user.name} />
                                                    <div>
                                                        <p className="ap-user-cell-name">{v.user.name}</p>
                                                        <p className="ap-user-cell-sub">@{v.user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={stageBadgeMap[v.stage] || 'ap-badge ap-badge-neutral'}>
                                                    <span className="ap-capitalize">{v.stage.replace(/_/g, ' ')}</span>
                                                </span>
                                            </td>
                                            <td>
                                                <span className={statusBadgeMap[v.status] || 'ap-badge ap-badge-neutral'}>
                                                    <span className="ap-capitalize">{v.status.replace(/_/g, ' ')}</span>
                                                </span>
                                            </td>
                                            <td className="secondary">{v.created_at_formatted}</td>
                                            <td className="center">
                                                <div className="ap-flex ap-items-center ap-justify-center ap-gap-sm">
                                                    <button
                                                        className="ap-btn ap-btn-primary ap-btn-sm"
                                                        onClick={() => router.get(route('admin.memorial.verifications.show', v.uuid))}
                                                    >
                                                        <Eye size={14} />
                                                        View
                                                    </button>
                                                    {v.status !== 'cancelled' && v.status !== 'completed' && (
                                                        <button
                                                            className="ap-btn ap-btn-danger ap-btn-sm"
                                                            onClick={() => router.post(route('admin.memorial.verifications.cancel', v.uuid), {}, { preserveScroll: true })}
                                                        >
                                                            <XCircle size={14} />
                                                            Cancel
                                                        </button>
                                                    )}
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
                                <ShieldCheck size={24} />
                            </div>
                            <p className="ap-empty-title">No verifications found</p>
                            <p className="ap-empty-text">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {verifications.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{verifications.from}</strong> to{' '}
                            <strong>{verifications.to}</strong> of{' '}
                            <strong>{verifications.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            {verifications.links.map((link, index) => (
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
