import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    UserMinus,
    Clock,
    XCircle,
    AlertTriangle,
    Vote,
} from 'lucide-react';

interface RemovalVote {
    id: number;
    vote: string;
    user: {
        id: number;
        full_name: string;
        username: string;
    } | null;
    created_at: string | null;
}

interface RemovalDetail {
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
    votes: RemovalVote[];
    created_at: string;
    created_at_formatted: string;
}

interface Props {
    removal: RemovalDetail;
}

function getStatusBadgeClass(status: string): string {
    switch (status) {
        case 'pending': return 'ap-badge ap-badge-warning';
        case 'completed': return 'ap-badge ap-badge-success';
        case 'cancelled': return 'ap-badge ap-badge-neutral';
        default: return 'ap-badge ap-badge-neutral';
    }
}

function getVoteBadgeClass(vote: string): string {
    switch (vote) {
        case 'confirm': return 'ap-badge ap-badge-success';
        case 'reject': return 'ap-badge ap-badge-danger';
        default: return 'ap-badge ap-badge-neutral';
    }
}

export default function RemovalDetailPage({ removal }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this removal request?')) {
            router.post(route('admin.removals.cancel', removal.id), {}, { preserveScroll: true });
        }
    };

    const handleForceExecute = () => {
        if (confirm('Are you sure you want to force execute this removal? The target user will be removed from the group immediately. This action cannot be undone.')) {
            router.post(route('admin.removals.execute', removal.id), {}, { preserveScroll: true });
        }
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

                {/* Back Button */}
                <button
                    className="ap-back-btn"
                    onClick={() => router.get(route('admin.removals.index'))}
                >
                    <ArrowLeft size={16} /> Back to Removals
                </button>

                {/* Header */}
                <div className="ap-page-header">
                    <div className="ap-page-header-row">
                        <div>
                            <h1 className="ap-page-title">Removal Details</h1>
                            <p className="ap-page-subtitle">Review removal request information and votes</p>
                        </div>
                        <div className="ap-flex ap-gap-sm">
                            <button
                                className="ap-btn ap-btn-secondary"
                                onClick={handleCancel}
                            >
                                <XCircle size={16} /> Cancel Removal
                            </button>
                            {removal.status === 'pending' && (
                                <button
                                    className="ap-btn ap-btn-danger"
                                    onClick={handleForceExecute}
                                >
                                    <AlertTriangle size={16} /> Force Execute
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Removal Info Card */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-card-header">
                        <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                            <UserMinus size={18} className="ap-icon-danger" /> Removal Information
                        </h3>
                    </div>
                    <div className="ap-grid-3">
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Target User</span>
                            <span className="ap-detail-value">{removal.target_user?.full_name || 'Unknown'}</span>
                            <span className="ap-text-sm ap-text-tertiary">@{removal.target_user?.username || 'N/A'}</span>
                        </div>
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Initiator</span>
                            <span className="ap-detail-value">{removal.initiator?.full_name || 'Unknown'}</span>
                            <span className="ap-text-sm ap-text-tertiary">@{removal.initiator?.username || 'N/A'}</span>
                        </div>
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Class Set</span>
                            <span className="ap-detail-value">{removal.class_set?.name || 'N/A'}</span>
                        </div>
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Status</span>
                            <span className={getStatusBadgeClass(removal.status) + ' ap-capitalize'}>{removal.status.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Votes</span>
                            <span className="ap-stat-value">{removal.votes_count}</span>
                        </div>
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Expires At</span>
                            <span className="ap-detail-value ap-flex ap-items-center ap-gap-xs">
                                <Clock size={14} className={removal.status === 'pending' ? 'ap-icon-warning' : 'ap-text-secondary'} />
                                {removal.expires_at_formatted || 'N/A'}
                            </span>
                        </div>
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Created At</span>
                            <span className="ap-detail-value">{removal.created_at_formatted}</span>
                        </div>
                    </div>

                    {/* Reason */}
                    {removal.reason && (
                        <div className="ap-alert ap-alert-warning ap-mt-lg">
                            <div>
                                <p className="ap-alert-title">Reason for Removal</p>
                                <p className="ap-alert-text">{removal.reason}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Votes Table */}
                <div className="ap-table-wrap">
                    <div className="ap-card-header" style={{ padding: '1.25rem 1rem 0.75rem' }}>
                        <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                            <Vote size={18} className="ap-icon-info" /> Votes ({removal.votes.length})
                        </h3>
                    </div>
                    {removal.votes.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Voter</th>
                                        <th>Vote</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {removal.votes.map((vote) => (
                                        <tr key={vote.id}>
                                            <td>
                                                <p className="ap-user-cell-name">{vote.user?.full_name || 'Unknown'}</p>
                                                <p className="ap-user-cell-sub">@{vote.user?.username || 'N/A'}</p>
                                            </td>
                                            <td>
                                                <span className={getVoteBadgeClass(vote.vote) + ' ap-capitalize'}>{vote.vote}</span>
                                            </td>
                                            <td className="secondary">
                                                {vote.created_at ? new Date(vote.created_at).toLocaleDateString() + ' ' + new Date(vote.created_at).toLocaleTimeString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Vote size={24} />
                            </div>
                            <p className="ap-empty-title">No votes</p>
                            <p className="ap-empty-text">No votes have been cast yet</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
