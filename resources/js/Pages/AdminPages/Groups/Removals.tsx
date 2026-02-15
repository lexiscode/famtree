import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    UserMinus,
    Clock,
    Eye,
} from 'lucide-react';

interface Removal {
    id: number;
    status: string;
    reason: string | null;
    votes_count: number;
    expires_at: string | null;
    expires_at_formatted: string | null;
    target_user: {
        id: number;
        full_name: string;
        username: string;
    } | null;
    initiator: {
        id: number;
        full_name: string;
        username: string;
    } | null;
    class_set: {
        id: number;
        name: string;
    } | null;
    created_at: string;
    created_at_formatted: string;
}

interface PaginatedData {
    data: Removal[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total: number;
    pending: number;
}

interface Props {
    removals: PaginatedData;
    statistics: Statistics;
    perPage: number;
}

function getStatusBadgeClass(status: string): string {
    switch (status) {
        case 'pending': return 'ap-badge ap-badge-warning';
        case 'completed': return 'ap-badge ap-badge-success';
        case 'cancelled': return 'ap-badge ap-badge-neutral';
        default: return 'ap-badge ap-badge-neutral';
    }
}

export default function Removals({ removals, statistics, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const handlePageChange = (page: number) => {
        router.get(route('admin.removals.index'), { page, per_page: perPage }, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <div>
{/* Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Member Removals</h1>
                    <p className="ap-page-subtitle">Monitor and manage member removal requests across groups</p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    <div className="ap-stat-card">
                        <div className="ap-stat-card-header">
                            <div>
                                <p className="ap-stat-label">Total Removals</p>
                                <p className="ap-stat-value">{statistics.total}</p>
                            </div>
                            <div className="ap-stat-icon indigo">
                                <UserMinus size={20} />
                            </div>
                        </div>
                    </div>
                    <div className="ap-stat-card">
                        <div className="ap-stat-card-header">
                            <div>
                                <p className="ap-stat-label">Pending</p>
                                <p className="ap-stat-value">{statistics.pending}</p>
                            </div>
                            <div className="ap-stat-icon amber">
                                <Clock size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Removals Table */}
                <div className="ap-table-wrap">
                    {removals.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Class Set</th>
                                        <th>Target User</th>
                                        <th>Initiator</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Votes</th>
                                        <th>Expires</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {removals.data.map((removal) => (
                                        <tr key={removal.id}>
                                            <td className="ap-font-semibold">{removal.class_set?.name || 'N/A'}</td>
                                            <td>
                                                <p className="ap-user-cell-name">{removal.target_user?.full_name || 'Unknown'}</p>
                                                <p className="ap-user-cell-sub">@{removal.target_user?.username || 'N/A'}</p>
                                            </td>
                                            <td>
                                                <p className="ap-user-cell-name">{removal.initiator?.full_name || 'Unknown'}</p>
                                                <p className="ap-user-cell-sub">@{removal.initiator?.username || 'N/A'}</p>
                                            </td>
                                            <td>
                                                <p className="ap-truncate-md ap-text-secondary">
                                                    {removal.reason || 'No reason provided'}
                                                </p>
                                            </td>
                                            <td>
                                                <span className={getStatusBadgeClass(removal.status) + ' ap-capitalize'}>
                                                    {removal.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="ap-font-semibold">{removal.votes_count}</td>
                                            <td className="secondary">{removal.expires_at_formatted || 'N/A'}</td>
                                            <td className="center">
                                                <button
                                                    className="ap-btn ap-btn-sm ap-btn-primary"
                                                    onClick={() => router.get(route('admin.removals.show', removal.id))}
                                                >
                                                    <Eye size={15} /> View
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
                                <UserMinus size={24} />
                            </div>
                            <p className="ap-empty-title">No removals found</p>
                            <p className="ap-empty-text">There are no member removal requests at this time</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {removals.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{removals.from}</strong> to <strong>{removals.to}</strong> of <strong>{removals.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            {Array.from({ length: removals.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`ap-page-btn ${removals.current_page === page ? 'active' : ''}`}
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
