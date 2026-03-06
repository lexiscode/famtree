import { useState, useCallback, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Crown,
    Shield,
    CheckCircle,
    Clock,
    Plus,
    Pencil,
    Trash2,
    ArrowRightLeft,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Info,
} from 'lucide-react';

interface ClaimedByUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
}

interface ReservedUsername {
    id: number;
    username: string;
    celebrity_name: string;
    notes: string | null;
    status: 'reserved' | 'claimed';
    claimed_by: ClaimedByUser | null;
    claimed_at: string | null;
    created_at: string;
}

interface PaginatedData {
    data: ReservedUsername[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total: number;
    reserved: number;
    claimed: number;
}

interface Filters {
    search: string;
    status: string;
}

interface Props {
    reservedUsernames: PaginatedData;
    statistics: Statistics;
    filters: Filters;
    perPage: number;
}

export default function Index({ reservedUsernames, statistics, filters, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ReservedUsername | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const isInitialMount = useRef(true);

    // Add form state
    const [addForm, setAddForm] = useState({ username: '', celebrity_name: '', notes: '' });
    const [addSubmitting, setAddSubmitting] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({ celebrity_name: '', notes: '' });
    const [editSubmitting, setEditSubmitting] = useState(false);

    // Reassign form state
    const [targetUsername, setTargetUsername] = useState('');
    const [reassignSubmitting, setReassignSubmitting] = useState(false);

    const handleSearch = useCallback(() => {
        router.get(route('admin.reservedUsernames.index'), {
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
        router.get(route('admin.reservedUsernames.index'), {
            search: searchQuery,
            status,
            per_page: perPage,
        }, { preserveScroll: true });
    }, [searchQuery, perPage]);

    const handlePageChange = useCallback((page: number) => {
        router.get(route('admin.reservedUsernames.index'), {
            page,
            search: filters.search,
            status: filters.status,
            per_page: perPage,
        }, { preserveScroll: true });
    }, [filters, perPage]);

    const handleAdd = useCallback(() => {
        setAddSubmitting(true);
        router.post(route('admin.reservedUsernames.store'), addForm, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddModal(false);
                setAddForm({ username: '', celebrity_name: '', notes: '' });
            },
            onFinish: () => setAddSubmitting(false),
        });
    }, [addForm]);

    const handleEdit = useCallback(() => {
        if (!selectedItem) return;
        setEditSubmitting(true);
        router.put(route('admin.reservedUsernames.update', selectedItem.id), editForm, {
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedItem(null);
            },
            onFinish: () => setEditSubmitting(false),
        });
    }, [selectedItem, editForm]);

    const handleDelete = useCallback((id: number, username: string) => {
        if (window.confirm(`Are you sure you want to remove "${username}" from reserved usernames?`)) {
            router.delete(route('admin.reservedUsernames.destroy', id), { preserveScroll: true });
        }
    }, []);

    const handleReassign = useCallback(() => {
        if (!selectedItem) return;
        setReassignSubmitting(true);
        router.post(route('admin.reservedUsernames.reassign', selectedItem.id), { username: targetUsername }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowReassignModal(false);
                setSelectedItem(null);
                setTargetUsername('');
            },
            onFinish: () => setReassignSubmitting(false),
        });
    }, [selectedItem, targetUsername]);

    const openEditModal = (item: ReservedUsername) => {
        setSelectedItem(item);
        setEditForm({ celebrity_name: item.celebrity_name, notes: item.notes || '' });
        setShowEditModal(true);
    };

    const openReassignModal = (item: ReservedUsername) => {
        setSelectedItem(item);
        setTargetUsername('');
        setShowReassignModal(true);
    };

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = reservedUsernames.current_page;
        const last = reservedUsernames.last_page;
        let start = Math.max(1, current - 2);
        let end = Math.min(last, current + 2);
        if (current <= 3) end = Math.min(last, 5);
        if (current >= last - 2) start = Math.max(1, last - 4);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <AdminLayout>
            <div>
                {/* Header */}
                <div className="ap-page-header">
                    <div>
                        <h1 className="ap-page-title">Reserved Usernames</h1>
                        <p className="ap-page-subtitle">
                            Reserve and manage celebrity usernames to prevent unauthorized use
                        </p>
                    </div>
                    <button
                        className="ap-btn ap-btn-primary"
                        onClick={() => router.get(route('admin.claimRequests.index'))}
                    >
                        <Shield size={16} /> Claim Requests
                    </button>
                </div>

                {/* Policy Note */}
                <div className="ap-alert ap-alert-info ap-mb-lg">
                    <Info size={20} className="ap-icon-primary" style={{ flexShrink: 0 }} />
                    <div>
                        <p className="ap-alert-title">Username Policy</p>
                        <p className="ap-alert-text">
                            Usernames may be reassigned by the platform to verified public figures.
                            If a regular user holds a celebrity's username, the admin can reassign it to the verified celebrity and the previous holder will automatically receive an alternative username.
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Reserved', value: statistics.total, icon: Crown, colorClass: 'indigo' },
                        { label: 'Available', value: statistics.reserved, icon: Clock, colorClass: 'amber' },
                        { label: 'Claimed', value: statistics.claimed, icon: CheckCircle, colorClass: 'green' },
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

                {/* Search, Filter, and Add Button */}
                <div className="ap-filter-bar">
                    <div className="ap-search-bar">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search username or celebrity..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="ap-filter-select"
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="reserved">Reserved</option>
                        <option value="claimed">Claimed</option>
                    </select>
                    <button
                        className="ap-btn ap-btn-success"
                        onClick={() => {
                            setAddForm({ username: '', celebrity_name: '', notes: '' });
                            setShowAddModal(true);
                        }}
                    >
                        <Plus size={16} /> Reserve Username
                    </button>
                </div>

                {/* Table */}
                <div className="ap-table-wrap">
                    {reservedUsernames.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Celebrity</th>
                                        <th>Notes</th>
                                        <th className="center">Status</th>
                                        <th>Claimed By</th>
                                        <th>Date</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservedUsernames.data.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <span className="ap-font-semibold ap-text-primary">@{item.username}</span>
                                            </td>
                                            <td>
                                                <p className="ap-user-cell-name">{item.celebrity_name}</p>
                                            </td>
                                            <td>
                                                <span className="ap-text-sm ap-text-tertiary">
                                                    {item.notes || '--'}
                                                </span>
                                            </td>
                                            <td className="center">
                                                <span className={`ap-badge ${item.status === 'claimed' ? 'ap-badge-success' : 'ap-badge-warning'}`}>
                                                    <span className={`ap-badge-dot ${item.status === 'claimed' ? 'success' : 'warning'}`} />
                                                    {item.status === 'claimed' ? 'Claimed' : 'Reserved'}
                                                </span>
                                            </td>
                                            <td>
                                                {item.claimed_by ? (
                                                    <div>
                                                        <p className="ap-user-cell-name">
                                                            {item.claimed_by.first_name} {item.claimed_by.last_name}
                                                        </p>
                                                        <p className="ap-user-cell-sub">@{item.claimed_by.username}</p>
                                                    </div>
                                                ) : (
                                                    <span className="ap-text-sm ap-text-tertiary">--</span>
                                                )}
                                            </td>
                                            <td className="secondary">{item.created_at}</td>
                                            <td className="center">
                                                <div className="ap-flex ap-items-center ap-justify-center ap-gap-sm ap-flex-wrap">
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-primary"
                                                        onClick={() => openEditModal(item)}
                                                        title="Edit"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-warning"
                                                        onClick={() => openReassignModal(item)}
                                                        title="Reassign Username"
                                                    >
                                                        <ArrowRightLeft size={14} />
                                                    </button>
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-danger"
                                                        onClick={() => handleDelete(item.id, item.username)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
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
                                <Crown size={28} />
                            </div>
                            <p className="ap-empty-title">No reserved usernames</p>
                            <p className="ap-empty-text">Start by reserving celebrity usernames to protect them</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {reservedUsernames.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{reservedUsernames.from}</strong> to <strong>{reservedUsernames.to}</strong> of <strong>{reservedUsernames.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(reservedUsernames.current_page - 1)}
                                disabled={reservedUsernames.current_page === 1}
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    className={`ap-page-btn ${page === reservedUsernames.current_page ? 'active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(reservedUsernames.current_page + 1)}
                                disabled={reservedUsernames.current_page === reservedUsernames.last_page}
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Add Modal */}
                {showAddModal && (
                    <div className="ap-modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="ap-modal" onClick={(e) => e.stopPropagation()} >
                            <div className="ap-modal-header">
                                <h3 className="ap-modal-title">Reserve Username</h3>
                                <button className="ap-modal-close" onClick={() => setShowAddModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="ap-modal-body">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Username</label>
                                    <input
                                        type="text"
                                        className="ap-form-input"
                                        placeholder="e.g. davido"
                                        value={addForm.username}
                                        onChange={(e) => setAddForm({ ...addForm, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Celebrity Name</label>
                                    <input
                                        type="text"
                                        className="ap-form-input"
                                        placeholder="e.g. David Adeleke (Davido)"
                                        value={addForm.celebrity_name}
                                        onChange={(e) => setAddForm({ ...addForm, celebrity_name: e.target.value })}
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Notes (Optional)</label>
                                    <textarea
                                        className="ap-form-input"
                                        placeholder="Any additional notes..."
                                        rows={3}
                                        value={addForm.notes}
                                        onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="ap-modal-footer">
                                <button className="ap-btn ap-btn-neutral" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button
                                    className="ap-btn ap-btn-success"
                                    onClick={handleAdd}
                                    disabled={addSubmitting || !addForm.username || !addForm.celebrity_name}
                                >
                                    {addSubmitting ? 'Reserving...' : 'Reserve Username'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showEditModal && selectedItem && (
                    <div className="ap-modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="ap-modal" onClick={(e) => e.stopPropagation()} >
                            <div className="ap-modal-header">
                                <h3 className="ap-modal-title">Edit Reserved Username: @{selectedItem.username}</h3>
                                <button className="ap-modal-close" onClick={() => setShowEditModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="ap-modal-body">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Celebrity Name</label>
                                    <input
                                        type="text"
                                        className="ap-form-input"
                                        value={editForm.celebrity_name}
                                        onChange={(e) => setEditForm({ ...editForm, celebrity_name: e.target.value })}
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Notes</label>
                                    <textarea
                                        className="ap-form-input"
                                        rows={3}
                                        value={editForm.notes}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="ap-modal-footer">
                                <button className="ap-btn ap-btn-neutral" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button
                                    className="ap-btn ap-btn-primary"
                                    onClick={handleEdit}
                                    disabled={editSubmitting || !editForm.celebrity_name}
                                >
                                    {editSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reassign Modal */}
                {showReassignModal && selectedItem && (
                    <div className="ap-modal-overlay" onClick={() => setShowReassignModal(false)}>
                        <div className="ap-modal" onClick={(e) => e.stopPropagation()} >
                            <div className="ap-modal-header">
                                <h3 className="ap-modal-title">Reassign Username: @{selectedItem.username}</h3>
                                <button className="ap-modal-close" onClick={() => setShowReassignModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="ap-modal-body">
                                <div className="ap-alert ap-alert-warning ap-mb-lg">
                                    <Info size={18} className="ap-icon-warning" style={{ flexShrink: 0 }} />
                                    <div>
                                        <p className="ap-alert-text">
                                            This will assign the username <strong>@{selectedItem.username}</strong> to the specified user.
                                            If another user currently holds this username, they will automatically be given an alternative (e.g., @{selectedItem.username}1).
                                        </p>
                                    </div>
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Target Username (the celebrity's account)</label>
                                    <input
                                        type="text"
                                        className="ap-form-input"
                                        placeholder="Enter username of the celebrity"
                                        value={targetUsername}
                                        onChange={(e) => setTargetUsername(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="ap-modal-footer">
                                <button className="ap-btn ap-btn-neutral" onClick={() => setShowReassignModal(false)}>Cancel</button>
                                <button
                                    className="ap-btn ap-btn-warning"
                                    onClick={handleReassign}
                                    disabled={reassignSubmitting || !targetUsername}
                                >
                                    {reassignSubmitting ? 'Reassigning...' : 'Reassign Username'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
