import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FileText,
    Search,
    Filter,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    ArrowLeft,
} from 'lucide-react';

interface LogEntry {
    id: number;
    admin_name: string;
    action_type: string;
    resource_type: string;
    description: string;
    ip_address: string;
    created_at: string;
    created_at_formatted: string;
}

interface PaginatedData {
    data: LogEntry[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    logs: PaginatedData;
    filters: Record<string, any>;
    search: string;
    perPage: number;
}

const actionBadgeMap: Record<string, string> = {
    create: 'ap-badge ap-badge-success',
    update: 'ap-badge ap-badge-info',
    delete: 'ap-badge ap-badge-danger',
    login: 'ap-badge ap-badge-info',
    logout: 'ap-badge ap-badge-neutral',
    export: 'ap-badge ap-badge-warning',
};

export default function AuditLog({ logs, filters, search, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterActionType, setFilterActionType] = useState(filters?.action_type || '');
    const [filterResourceType, setFilterResourceType] = useState(filters?.resource_type || '');
    const isInitialMount = useRef(true);

    const buildParams = useCallback(() => {
        const filterObj: Record<string, any> = {};
        if (filterActionType) filterObj.action_type = filterActionType;
        if (filterResourceType) filterObj.resource_type = filterResourceType;
        return {
            search: searchQuery,
            filters: filterObj,
            per_page: perPage,
        };
    }, [searchQuery, filterActionType, filterResourceType, perPage]);

    const handleSearch = useCallback(() => {
        router.get(route('admin.security.auditLog'), buildParams(), { preserveScroll: true });
    }, [buildParams]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(route('admin.security.auditLog'), buildParams(), { preserveScroll: true, preserveState: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [filterActionType, filterResourceType, searchQuery]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setFilterActionType('');
        setFilterResourceType('');
        router.get(route('admin.security.auditLog'), { search: '', filters: {}, per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = useCallback((page: number) => {
        router.get(route('admin.security.auditLog'), { ...buildParams(), page }, { preserveScroll: true });
    }, [buildParams]);

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = logs.current_page;
        const last = logs.last_page;
        let start = Math.max(1, current - 2);
        let end = Math.min(last, current + 2);
        if (current <= 3) end = Math.min(last, 5);
        if (current >= last - 2) start = Math.max(1, last - 4);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const getActionBadgeClass = (actionType: string) => {
        return actionBadgeMap[actionType.toLowerCase()] || 'ap-badge ap-badge-neutral';
    };

    return (
        <AdminLayout>
            <div>
{/* Page Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Admin Audit Log</h1>
                    <p className="ap-page-subtitle">
                        Track and review all administrative actions and system events
                    </p>
                </div>

                {/* Back to Security Dashboard */}
                <button
                    className="ap-back-btn"
                    onClick={() => router.get(route('admin.security.dashboard'))}
                >
                    <ArrowLeft size={14} />
                    Back to Security
                </button>

                {/* Search and Filters */}
                <div className="ap-section">
                    <div className="ap-filter-bar">
                        <div className="ap-search-bar">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search by description..."
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
                            <ChevronDown
                                size={14}
                                style={{ transform: showFilters ? 'rotate(180deg)' : '', transition: 'transform 0.2s ease' }}
                            />
                        </button>
                    </div>

                    {showFilters && (
                        <div className="ap-filter-panel">
                            <div>
                                <label className="ap-filter-label">Action Type</label>
                                <select
                                    className="ap-filter-select"
                                    value={filterActionType}
                                    onChange={(e) => setFilterActionType(e.target.value)}
                                >
                                    <option value="">All Actions</option>
                                    <option value="create">Create</option>
                                    <option value="update">Update</option>
                                    <option value="delete">Delete</option>
                                    <option value="login">Login</option>
                                    <option value="logout">Logout</option>
                                    <option value="export">Export</option>
                                </select>
                            </div>
                            <div>
                                <label className="ap-filter-label">Resource Type</label>
                                <select
                                    className="ap-filter-select"
                                    value={filterResourceType}
                                    onChange={(e) => setFilterResourceType(e.target.value)}
                                >
                                    <option value="">All Resources</option>
                                    <option value="user">User</option>
                                    <option value="organization">Organization</option>
                                    <option value="post">Post</option>
                                    <option value="report">Report</option>
                                    <option value="settings">Settings</option>
                                    <option value="blog">Blog</option>
                                    <option value="family_tree">Family Tree</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {(searchQuery || filterActionType || filterResourceType) && (
                        <button className="ap-reset-btn" onClick={handleReset}>
                            Reset all filters
                        </button>
                    )}
                </div>

                {/* Audit Log Table */}
                <div className="ap-table-wrap">
                    {logs.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Admin</th>
                                        <th>Action</th>
                                        <th>Resource</th>
                                        <th>Description</th>
                                        <th>IP Address</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.data.map((log) => (
                                        <tr key={log.id}>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <div className="ap-avatar ap-avatar-sm ap-avatar-indigo">
                                                        {log.admin_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="ap-font-semibold">{log.admin_name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${getActionBadgeClass(log.action_type)} ap-capitalize`}>
                                                    {log.action_type}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="ap-badge ap-badge-primary ap-capitalize">
                                                    {log.resource_type.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <p className="ap-truncate ap-text-secondary ap-mb-0" style={{ maxWidth: '250px' }}>
                                                    {log.description}
                                                </p>
                                            </td>
                                            <td>
                                                <span className="ap-badge ap-badge-neutral">{log.ip_address}</span>
                                            </td>
                                            <td>
                                                <div className="ap-flex ap-items-center ap-gap-xs ap-text-secondary ap-text-sm">
                                                    <Clock size={14} />
                                                    {log.created_at_formatted}
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
                            <p className="ap-empty-title">No audit log entries found</p>
                            <p className="ap-empty-text">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{logs.from}</strong> to <strong>{logs.to}</strong> of <strong>{logs.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(logs.current_page - 1)}
                                disabled={logs.current_page === 1}
                            >
                                <ChevronLeft size={14} />
                                Prev
                            </button>

                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    className={`ap-page-btn ${page === logs.current_page ? 'active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(logs.current_page + 1)}
                                disabled={logs.current_page === logs.last_page}
                            >
                                Next
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
