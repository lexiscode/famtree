import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    AlertTriangle,
    ChevronDown,
    Filter,
    ChevronRight,
    Clock,
    CheckCircle,
    Eye,
    XCircle,
    FileText,
} from 'lucide-react';

interface Report {
    id: number;
    reason: string;
    description: string;
    status: string;
    reporter: { id: number; full_name: string; username: string; profile_image_url: string | null } | null;
    reported_user: { id: number; full_name: string; username: string; profile_image_url: string | null } | null;
    created_at: string;
    created_at_formatted: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: Report[];
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
    reviewing: number;
    resolved: number;
    dismissed: number;
    total_blocks: number;
}

interface Props {
    reports: PaginatedData;
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
            <div className="ap-avatar ap-avatar-md ap-avatar-indigo">
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

const statusBadgeMap: Record<string, { className: string; icon: any }> = {
    pending: { className: 'ap-badge ap-badge-warning', icon: Clock },
    reviewing: { className: 'ap-badge ap-badge-info', icon: Eye },
    resolved: { className: 'ap-badge ap-badge-success', icon: CheckCircle },
    dismissed: { className: 'ap-badge ap-badge-neutral', icon: XCircle },
};

export default function Index({ reports, statistics, search, filters, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState(filters?.status || '');
    const [filterReason, setFilterReason] = useState(filters?.reason || '');
    const isInitialMount = useRef(true);

    const buildParams = useCallback(() => {
        const filterObj: Record<string, any> = {};
        if (filterStatus) filterObj.status = filterStatus;
        if (filterReason) filterObj.reason = filterReason;
        return {
            search: searchQuery,
            filters: filterObj,
            per_page: perPage,
        };
    }, [searchQuery, filterStatus, filterReason, perPage]);

    const handleSearch = useCallback(() => {
        router.get(route('admin.reports.index'), buildParams(), { preserveScroll: true });
    }, [buildParams]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(route('admin.reports.index'), buildParams(), { preserveScroll: true, preserveState: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [filterStatus, filterReason, searchQuery]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setFilterStatus('');
        setFilterReason('');
        router.get(route('admin.reports.index'), { search: '', filters: {}, per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = (page: number) => {
        router.get(route('admin.reports.index'), { ...buildParams(), page }, { preserveScroll: true });
    };

    const getStatusBadge = (status: string) => {
        const config = statusBadgeMap[status] || statusBadgeMap.pending;
        const Icon = config.icon;
        return (
            <span className={config.className}>
                <Icon size={12} />
                <span className="ap-capitalize">{status}</span>
            </span>
        );
    };

    return (
        <AdminLayout>
            <div>
{/* Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Reports</h1>
                    <p className="ap-page-subtitle">Review and manage user reports to maintain community safety and trust</p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Reports', value: statistics.total, icon: FileText, colorClass: 'indigo' },
                        { label: 'Pending', value: statistics.pending, icon: Clock, colorClass: 'amber' },
                        { label: 'Reviewing', value: statistics.reviewing, icon: Eye, colorClass: 'blue' },
                        { label: 'Resolved', value: statistics.resolved, icon: CheckCircle, colorClass: 'green' },
                        { label: 'Dismissed', value: statistics.dismissed, icon: XCircle, colorClass: 'purple' },
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
                            placeholder="Search by reporter, reported user, or reason..."
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
                            <label className="ap-filter-label">Status</label>
                            <select
                                className="ap-filter-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="reviewing">Reviewing</option>
                                <option value="resolved">Resolved</option>
                                <option value="dismissed">Dismissed</option>
                            </select>
                        </div>
                        <div>
                            <label className="ap-filter-label">Reason</label>
                            <select
                                className="ap-filter-select"
                                value={filterReason}
                                onChange={(e) => setFilterReason(e.target.value)}
                            >
                                <option value="">All Reasons</option>
                                <option value="harassment">Harassment</option>
                                <option value="spam">Spam</option>
                                <option value="inappropriate_content">Inappropriate Content</option>
                                <option value="fake_account">Fake Account</option>
                                <option value="hate_speech">Hate Speech</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                )}

                {(searchQuery || filterStatus || filterReason) && (
                    <button className="ap-reset-btn" onClick={handleReset}>
                        Reset all filters
                    </button>
                )}

                {/* Reports Table */}
                <div className="ap-table-wrap">
                    {reports.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Report ID</th>
                                        <th>Reported User</th>
                                        <th>Reporter</th>
                                        <th>Reason</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.data.map((report) => (
                                        <tr key={report.id}>
                                            <td>
                                                <span className="ap-font-semibold">#{report.id}</span>
                                            </td>
                                            <td>
                                                {report.reported_user ? (
                                                    <div className="ap-user-cell">
                                                        <UserAvatar imageUrl={report.reported_user.profile_image_url} name={report.reported_user.full_name} />
                                                        <div>
                                                            <p className="ap-user-cell-name">{report.reported_user.full_name}</p>
                                                            <p className="ap-user-cell-sub">@{report.reported_user.username}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="ap-text-secondary">Deleted User</span>
                                                )}
                                            </td>
                                            <td>
                                                {report.reporter ? (
                                                    <div className="ap-user-cell">
                                                        <UserAvatar imageUrl={report.reporter.profile_image_url} name={report.reporter.full_name} />
                                                        <div>
                                                            <p className="ap-user-cell-name">{report.reporter.full_name}</p>
                                                            <p className="ap-user-cell-sub">@{report.reporter.username}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="ap-text-secondary">Deleted User</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="ap-badge ap-badge-warning ap-capitalize">
                                                    {report.reason.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <p className="ap-truncate" style={{ maxWidth: '200px' }}>
                                                    {report.description}
                                                </p>
                                            </td>
                                            <td>
                                                {getStatusBadge(report.status)}
                                            </td>
                                            <td className="secondary">
                                                {report.created_at_formatted}
                                            </td>
                                            <td>
                                                <button
                                                    className="ap-btn ap-btn-primary ap-btn-sm"
                                                    onClick={() => router.get(route('admin.reports.show', report.id))}
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
                                <AlertTriangle size={24} />
                            </div>
                            <p className="ap-empty-title">No reports found</p>
                            <p className="ap-empty-text">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {reports.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{reports.from}</strong> to{' '}
                            <strong>{reports.to}</strong> of{' '}
                            <strong>{reports.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            {reports.links.map((link, index) => (
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
            </div>
        </AdminLayout>
    );
}
