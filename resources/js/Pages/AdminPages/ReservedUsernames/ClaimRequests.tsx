import { useState, useCallback, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    Send,
    Mail,
    Key,
    Trash2,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    X,
    FileText,
    AlertTriangle,
} from 'lucide-react';

interface ClaimRequest {
    id: number;
    username: string;
    full_name: string;
    email: string;
    social_media_url: string;
    message: string | null;
    verification_code: string | null;
    status: 'pending' | 'code_sent' | 'verified' | 'rejected';
    temp_username: string | null;
    admin_notes: string | null;
    created_at: string;
}

interface PaginatedData {
    data: ClaimRequest[];
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
    code_sent: number;
    verified: number;
    rejected: number;
}

interface Filters {
    search: string;
    status: string;
}

interface Props {
    claimRequests: PaginatedData;
    statistics: Statistics;
    filters: Filters;
    perPage: number;
}

const statusConfig: Record<string, { badge: string; label: string }> = {
    pending: { badge: 'ap-badge-warning', label: 'Pending' },
    code_sent: { badge: 'ap-badge-info', label: 'Code Sent' },
    verified: { badge: 'ap-badge-success', label: 'Verified' },
    rejected: { badge: 'ap-badge-danger', label: 'Rejected' },
};

export default function ClaimRequests({ claimRequests, statistics, filters, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [showActionModal, setShowActionModal] = useState(false);
    const [showGenerateCodeModal, setShowGenerateCodeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSendCodeModal, setShowSendCodeModal] = useState(false);
    const [actionType, setActionType] = useState<'verify' | 'reject'>('verify');
    const [selectedItem, setSelectedItem] = useState<ClaimRequest | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const isInitialMount = useRef(true);

    const handleSearch = useCallback(() => {
        router.get(route('admin.claimRequests.index'), {
            search: searchQuery,
            status: statusFilter,
            per_page: perPage,
        }, { preserveScroll: true, preserveState: true });
    }, [searchQuery, statusFilter, perPage]);

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

    const handleStatusFilter = useCallback((status: string) => {
        setStatusFilter(status);
        router.get(route('admin.claimRequests.index'), {
            search: searchQuery,
            status,
            per_page: perPage,
        }, { preserveScroll: true });
    }, [searchQuery, perPage]);

    const handlePageChange = (page: number) => {
        router.get(route('admin.claimRequests.index'), {
            page,
            search: filters.search,
            status: filters.status,
            per_page: perPage,
        }, { preserveScroll: true });
    };

    const openGenerateCodeModal = (item: ClaimRequest) => {
        setSelectedItem(item);
        setShowGenerateCodeModal(true);
    };

    const handleGenerateCode = useCallback(() => {
        if (!selectedItem) return;
        setSubmitting(true);
        router.post(route('admin.claimRequests.generateCode', selectedItem.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowGenerateCodeModal(false);
                setSelectedItem(null);
            },
            onFinish: () => setSubmitting(false),
        });
    }, [selectedItem]);

    const openSendCodeModal = (item: ClaimRequest) => {
        setSelectedItem(item);
        setShowSendCodeModal(true);
    };

    const handleSendCode = useCallback(() => {
        if (!selectedItem) return;
        setSubmitting(true);
        router.post(route('admin.claimRequests.sendCode', selectedItem.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSendCodeModal(false);
                setSelectedItem(null);
            },
            onFinish: () => setSubmitting(false),
        });
    }, [selectedItem]);

    const openActionModal = (item: ClaimRequest, type: 'verify' | 'reject') => {
        setSelectedItem(item);
        setActionType(type);
        setAdminNotes('');
        setShowActionModal(true);
    };

    const handleAction = useCallback(() => {
        if (!selectedItem) return;
        setSubmitting(true);
        const routeName = actionType === 'verify' ? 'admin.claimRequests.verify' : 'admin.claimRequests.reject';
        router.post(route(routeName, selectedItem.id), { admin_notes: adminNotes || null }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowActionModal(false);
                setSelectedItem(null);
                setAdminNotes('');
            },
            onFinish: () => setSubmitting(false),
        });
    }, [selectedItem, actionType, adminNotes]);

    const openDeleteModal = (item: ClaimRequest) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const handleDelete = useCallback(() => {
        if (!selectedItem) return;
        setSubmitting(true);
        router.delete(route('admin.claimRequests.destroy', selectedItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedItem(null);
            },
            onFinish: () => setSubmitting(false),
        });
    }, [selectedItem]);

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = claimRequests.current_page;
        const last = claimRequests.last_page;
        let start = Math.max(1, current - 2);
        let end = Math.min(last, current + 2);
        if (current <= 3) end = Math.min(last, 5);
        if (current >= last - 2) start = Math.max(1, last - 4);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const statCards = [
        { label: 'Total Requests', value: statistics.total, icon: FileText, colorClass: 'indigo' },
        { label: 'Pending', value: statistics.pending, icon: Clock, colorClass: 'amber' },
        { label: 'Code Sent', value: statistics.code_sent, icon: Send, colorClass: 'blue' },
        { label: 'Verified', value: statistics.verified, icon: CheckCircle, colorClass: 'green' },
        { label: 'Rejected', value: statistics.rejected, icon: XCircle, colorClass: 'red' },
    ];

    return (
        <AdminLayout>
            <div>
                {/* Header */}
                <div className="ap-page-header">
                    <div>
                        <h1 className="ap-page-title">Username Claim Requests</h1>
                        <p className="ap-page-subtitle">Review and process celebrity username claim requests</p>
                    </div>
                    <button
                        className="ap-btn ap-btn-secondary"
                        onClick={() => router.get(route('admin.reservedUsernames.index'))}
                    >
                        <Shield size={16} /> Reserved Usernames
                    </button>
                </div>

                {/* Stats */}
                <div className="ap-stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {statCards.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="ap-stat-card">
                                <div className="ap-stat-card-header">
                                    <p className="ap-stat-label">{stat.label}</p>
                                    <div className={`ap-stat-icon ${stat.colorClass}`}>
                                        <Icon size={18} strokeWidth={1.8} />
                                    </div>
                                </div>
                                <p className="ap-stat-value">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Search & Filter */}
                <div className="ap-filter-bar">
                    <div className="ap-search-bar">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search by username, name, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="ap-filter-select"
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="code_sent">Code Sent</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Table */}
                <div className="ap-table-wrap">
                    <div className="ap-card-header">
                        <div>
                            <h2 className="ap-card-title">All Claim Requests</h2>
                            <p className="ap-card-subtitle">{claimRequests.total} total request{claimRequests.total !== 1 ? 's' : ''}</p>
                        </div>
                    </div>

                    {claimRequests.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Claimant</th>
                                        <th>Social Media</th>
                                        <th className="center">Status</th>
                                        <th>Verification Code</th>
                                        <th>Temp Username</th>
                                        <th>Date</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {claimRequests.data.map((item) => {
                                        const sc = statusConfig[item.status] || statusConfig.pending;
                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <span className="ap-font-semibold ap-text-primary">@{item.username}</span>
                                                </td>
                                                <td>
                                                    <div>
                                                        <p className="ap-user-cell-name">{item.full_name}</p>
                                                        <p className="ap-user-cell-sub">{item.email}</p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <a
                                                        href={item.social_media_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ap-btn ap-btn-ghost ap-btn-sm"
                                                        title={item.social_media_url}
                                                    >
                                                        <ExternalLink size={14} /> View Profile
                                                    </a>
                                                </td>
                                                <td className="center">
                                                    <span className={`ap-badge ${sc.badge}`}>
                                                        {sc.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    {item.verification_code ? (
                                                        <code style={{ fontSize: 13, background: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>
                                                            {item.verification_code}
                                                        </code>
                                                    ) : (
                                                        <span className="ap-text-sm ap-text-tertiary">--</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {item.temp_username ? (
                                                        <code style={{ fontSize: 13, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4 }}>
                                                            {item.temp_username}
                                                        </code>
                                                    ) : (
                                                        <span className="ap-text-sm ap-text-tertiary">--</span>
                                                    )}
                                                </td>
                                                <td className="secondary">{item.created_at}</td>
                                                <td className="center">
                                                    <div className="ap-flex ap-items-center ap-justify-center ap-gap-sm ap-flex-wrap">
                                                        {item.status === 'pending' && (
                                                            <button
                                                                className="ap-btn ap-btn-sm ap-btn-info"
                                                                onClick={() => openGenerateCodeModal(item)}
                                                                title="Generate Verification Code"
                                                            >
                                                                <Key size={14} />
                                                            </button>
                                                        )}
                                                        {item.status === 'code_sent' && item.verification_code && (
                                                            <button
                                                                className="ap-btn ap-btn-sm ap-btn-primary"
                                                                onClick={() => openSendCodeModal(item)}
                                                                title="Send Code via Email"
                                                            >
                                                                <Mail size={14} />
                                                            </button>
                                                        )}
                                                        {item.status === 'code_sent' && (
                                                            <button
                                                                className="ap-btn ap-btn-sm ap-btn-success"
                                                                onClick={() => openActionModal(item, 'verify')}
                                                                title="Mark as Verified"
                                                            >
                                                                <CheckCircle size={14} />
                                                            </button>
                                                        )}
                                                        {['pending', 'code_sent'].includes(item.status) && (
                                                            <button
                                                                className="ap-btn ap-btn-sm ap-btn-warning"
                                                                onClick={() => openActionModal(item, 'reject')}
                                                                title="Reject"
                                                            >
                                                                <XCircle size={14} />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="ap-btn ap-btn-sm ap-btn-danger"
                                                            onClick={() => openDeleteModal(item)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <FileText size={28} />
                            </div>
                            <p className="ap-empty-title">No claim requests</p>
                            <p className="ap-empty-text">Claim requests from celebrities will appear here</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {claimRequests.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{claimRequests.from}</strong> to <strong>{claimRequests.to}</strong> of <strong>{claimRequests.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(claimRequests.current_page - 1)}
                                disabled={claimRequests.current_page === 1}
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    className={`ap-page-btn ${page === claimRequests.current_page ? 'active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(claimRequests.current_page + 1)}
                                disabled={claimRequests.current_page === claimRequests.last_page}
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Verify/Reject Modal */}
                {showActionModal && selectedItem && (
                    <div className="ap-modal-overlay" onClick={() => setShowActionModal(false)}>
                        <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="ap-modal-header">
                                <h3 className="ap-modal-title">
                                    {actionType === 'verify' ? 'Verify' : 'Reject'} Claim: @{selectedItem.username}
                                </h3>
                                <button className="ap-modal-close" onClick={() => setShowActionModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="ap-modal-body">
                                {actionType === 'verify' ? (
                                    <div className="ap-alert ap-alert-info ap-mb-lg">
                                        <CheckCircle size={18} style={{ flexShrink: 0 }} />
                                        <div>
                                            <p className="ap-alert-text">
                                                Confirming that <strong>{selectedItem.full_name}</strong> has posted the verification
                                                code <code>{selectedItem.verification_code}</code> on their social media profile.
                                                After verification, you can reassign the username from the Reserved Usernames page.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="ap-alert ap-alert-warning ap-mb-lg">
                                        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                                        <div>
                                            <p className="ap-alert-text">
                                                Rejecting the claim request from <strong>{selectedItem.full_name}</strong> for
                                                username <strong>@{selectedItem.username}</strong>.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Admin Notes (optional)</label>
                                    <textarea
                                        className="ap-form-input"
                                        rows={3}
                                        placeholder="Add any notes about this decision..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="ap-modal-footer">
                                <button className="ap-btn ap-btn-neutral" onClick={() => setShowActionModal(false)}>Cancel</button>
                                <button
                                    className={`ap-btn ${actionType === 'verify' ? 'ap-btn-success' : 'ap-btn-danger'}`}
                                    onClick={handleAction}
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? (actionType === 'verify' ? 'Verifying...' : 'Rejecting...')
                                        : (actionType === 'verify' ? 'Confirm Verification' : 'Confirm Rejection')
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Generate Code Modal */}
                {showGenerateCodeModal && selectedItem && (
                    <div className="ap-modal-overlay" onClick={() => setShowGenerateCodeModal(false)}>
                        <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="ap-modal-header">
                                <h3 className="ap-modal-title">Generate Verification Code</h3>
                                <button className="ap-modal-close" onClick={() => setShowGenerateCodeModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="ap-modal-body">
                                <div className="ap-alert ap-alert-info ap-mb-lg">
                                    <Key size={18} style={{ flexShrink: 0 }} />
                                    <div>
                                        <p className="ap-alert-text">
                                            A unique verification code will be generated for the claim request
                                            on <strong>@{selectedItem.username}</strong> by <strong>{selectedItem.full_name}</strong>.
                                            You'll need to send this code to <strong>{selectedItem.email}</strong> and
                                            ask them to post it on their verified social media profile.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="ap-modal-footer">
                                <button className="ap-btn ap-btn-neutral" onClick={() => setShowGenerateCodeModal(false)}>Cancel</button>
                                <button
                                    className="ap-btn ap-btn-info"
                                    onClick={handleGenerateCode}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Generating...' : 'Generate Code'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Send Code Modal */}
                {showSendCodeModal && selectedItem && (
                    <div className="ap-modal-overlay" onClick={() => setShowSendCodeModal(false)}>
                        <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="ap-modal-header">
                                <h3 className="ap-modal-title">Send Verification Code</h3>
                                <button className="ap-modal-close" onClick={() => setShowSendCodeModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="ap-modal-body">
                                <div className="ap-alert ap-alert-info ap-mb-lg">
                                    <Mail size={18} style={{ flexShrink: 0 }} />
                                    <div>
                                        <p className="ap-alert-text">
                                            Send the verification code <code>{selectedItem.verification_code}</code> to <strong>{selectedItem.full_name}</strong> at <strong>{selectedItem.email}</strong>.
                                            The email will include instructions to post the code on their verified social media profile.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="ap-modal-footer">
                                <button className="ap-btn ap-btn-neutral" onClick={() => setShowSendCodeModal(false)}>Cancel</button>
                                <button
                                    className="ap-btn ap-btn-primary"
                                    onClick={handleSendCode}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Sending...' : 'Send Email'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && selectedItem && (
                    <div className="ap-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="ap-modal-header">
                                <h3 className="ap-modal-title">Delete Claim Request</h3>
                                <button className="ap-modal-close" onClick={() => setShowDeleteModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="ap-modal-body">
                                <div className="ap-alert ap-alert-danger ap-mb-lg">
                                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                                    <div>
                                        <p className="ap-alert-text">
                                            Are you sure you want to permanently delete the claim request
                                            for <strong>@{selectedItem.username}</strong> by <strong>{selectedItem.full_name}</strong>?
                                            This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="ap-modal-footer">
                                <button className="ap-btn ap-btn-neutral" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button
                                    className="ap-btn ap-btn-danger"
                                    onClick={handleDelete}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Deleting...' : 'Delete Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
