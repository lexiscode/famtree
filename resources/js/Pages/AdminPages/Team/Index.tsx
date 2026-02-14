import { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    UserCog,
    Users,
    UserCheck,
    Plus,
    Pencil,
    ToggleLeft,
    ToggleRight,
    KeyRound,
    X,
    Save,
    ChevronUp,
    Eye,
    EyeOff,
} from 'lucide-react';

interface Admin {
    id: number;
    username: string;
    email: string;
    phone: string | null;
    role: string | null;
    is_active: boolean;
    last_login_at: string | null;
    last_login_at_formatted: string;
    created_at: string;
    created_at_formatted: string;
}

interface Statistics {
    total: number;
    active: number;
}

interface Props {
    admins: Admin[];
    statistics: Statistics;
}

const ROLES = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'content_moderator', label: 'Content Moderator' },
    { value: 'user_manager', label: 'User Manager' },
    { value: 'system_analyst', label: 'System Analyst' },
    { value: 'support_team', label: 'Support Team' },
];

const formatRole = (role: string | null): string => {
    if (!role) return 'No Role';
    const found = ROLES.find((r) => r.value === role);
    return found ? found.label : role;
};

export default function Index({ admins, statistics }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Create form state
    const [createForm, setCreateForm] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        role: '',
    });

    // Edit form state
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        phone: '',
        role: '',
    });

    const handleCreateChange = useCallback((key: string, value: string) => {
        setCreateForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleEditChange = useCallback((key: string, value: string) => {
        setEditForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleCreate = useCallback(() => {
        setSaving(true);
        router.post(route('admin.team.store'), createForm, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateForm(false);
                setCreateForm({ username: '', email: '', password: '', phone: '', role: '' });
            },
            onFinish: () => setSaving(false),
        });
    }, [createForm]);

    const startEdit = useCallback((admin: Admin) => {
        setEditingId(admin.id);
        setEditForm({
            username: admin.username,
            email: admin.email,
            phone: admin.phone || '',
            role: admin.role || '',
        });
    }, []);

    const handleUpdate = useCallback(() => {
        if (!editingId) return;
        setSaving(true);
        router.put(route('admin.team.update', editingId), editForm, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
            onFinish: () => setSaving(false),
        });
    }, [editingId, editForm]);

    const handleToggleStatus = useCallback((id: number) => {
        router.post(route('admin.team.disable', id), {}, {
            preserveScroll: true,
        });
    }, []);

    const handleResetPassword = useCallback((id: number, username: string) => {
        if (window.confirm(`Are you sure you want to reset the password for "${username}"? A new temporary password will be generated.`)) {
            router.post(route('admin.team.resetPassword', id), {}, {
                preserveScroll: true,
            });
        }
    }, []);

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

                {/* Page Header */}
                <div className="ap-page-header">
                    <div className="ap-page-header-row">
                        <div>
                            <h1 className="ap-page-title">Admin Team</h1>
                            <p className="ap-page-subtitle">Manage admin team members, assign roles, and control access to the admin panel</p>
                        </div>
                        <button
                            className={showCreateForm ? 'ap-btn ap-btn-secondary' : 'ap-btn ap-btn-success'}
                            onClick={() => {
                                setShowCreateForm(!showCreateForm);
                                setEditingId(null);
                            }}
                        >
                            {showCreateForm ? (
                                <><ChevronUp size={18} /> Cancel</>
                            ) : (
                                <><Plus size={18} /> Add Admin</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    <div className="ap-stat-card">
                        <div className="ap-stat-card-header">
                            <div>
                                <p className="ap-stat-label">Total Admins</p>
                                <p className="ap-stat-value">{statistics.total}</p>
                            </div>
                            <div className="ap-stat-icon indigo">
                                <Users size={20} />
                            </div>
                        </div>
                    </div>
                    <div className="ap-stat-card">
                        <div className="ap-stat-card-header">
                            <div>
                                <p className="ap-stat-label">Active</p>
                                <p className="ap-stat-value">{statistics.active}</p>
                            </div>
                            <div className="ap-stat-icon emerald">
                                <UserCheck size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Admin Form (Collapsible) */}
                {showCreateForm && (
                    <div className="ap-card ap-card-lg ap-mb-xl">
                        <div className="ap-section">
                            <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                                <Plus size={18} className="ap-icon-success" />
                                Create New Admin
                            </h3>

                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Username</label>
                                    <input
                                        type="text"
                                        value={createForm.username}
                                        onChange={(e) => handleCreateChange('username', e.target.value)}
                                        className="ap-form-input"
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Email</label>
                                    <input
                                        type="email"
                                        value={createForm.email}
                                        onChange={(e) => handleCreateChange('email', e.target.value)}
                                        className="ap-form-input"
                                        placeholder="admin@example.com"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Password</label>
                                    <div className="ap-input-group">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={createForm.password}
                                            onChange={(e) => handleCreateChange('password', e.target.value)}
                                            className="ap-form-input"
                                            placeholder="Minimum 8 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="ap-input-addon-btn"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Phone</label>
                                    <input
                                        type="text"
                                        value={createForm.phone}
                                        onChange={(e) => handleCreateChange('phone', e.target.value)}
                                        className="ap-form-input"
                                        placeholder="Optional phone number"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Role</label>
                                    <select
                                        value={createForm.role}
                                        onChange={(e) => handleCreateChange('role', e.target.value)}
                                        className="ap-form-select"
                                    >
                                        <option value="">Select a role</option>
                                        {ROLES.map((role) => (
                                            <option key={role.value} value={role.value}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <hr className="ap-divider" />

                        <div className="ap-flex ap-justify-end ap-gap-md">
                            <button
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setCreateForm({ username: '', email: '', password: '', phone: '', role: '' });
                                }}
                                className="ap-btn ap-btn-secondary"
                            >
                                <X size={18} />
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={saving}
                                className="ap-btn ap-btn-success"
                            >
                                <Save size={18} />
                                {saving ? 'Creating...' : 'Create Admin'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit Admin Modal Overlay */}
                {editingId !== null && (
                    <div
                        className="ap-modal-overlay"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setEditingId(null);
                        }}
                    >
                        <div className="ap-modal">
                            <button
                                onClick={() => setEditingId(null)}
                                className="ap-modal-close"
                            >
                                <X size={18} />
                            </button>

                            <h2 className="ap-modal-title ap-flex ap-items-center ap-gap-sm">
                                <Pencil size={18} className="ap-icon-primary" />
                                Edit Admin
                            </h2>

                            <div className="ap-flex ap-flex-col ap-gap-md ap-mb-xl">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Username</label>
                                    <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={(e) => handleEditChange('username', e.target.value)}
                                        className="ap-form-input"
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => handleEditChange('email', e.target.value)}
                                        className="ap-form-input"
                                        placeholder="admin@example.com"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Phone</label>
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={(e) => handleEditChange('phone', e.target.value)}
                                        className="ap-form-input"
                                        placeholder="Optional phone number"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => handleEditChange('role', e.target.value)}
                                        className="ap-form-select"
                                    >
                                        <option value="">Select a role</option>
                                        {ROLES.map((role) => (
                                            <option key={role.value} value={role.value}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="ap-modal-footer">
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="ap-btn ap-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={saving}
                                    className="ap-btn ap-btn-primary"
                                >
                                    <Save size={18} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Admin Team Table */}
                <div className="ap-table-wrap">
                    {admins.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Role</th>
                                        <th className="center">Status</th>
                                        <th>Last Login</th>
                                        <th>Created</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((admin) => (
                                        <tr key={admin.id}>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <div className="ap-avatar ap-avatar-sm ap-avatar-indigo">
                                                        {admin.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <p className="ap-user-cell-name">{admin.username}</p>
                                                </div>
                                            </td>
                                            <td className="secondary">{admin.email}</td>
                                            <td className="secondary">{admin.phone || '--'}</td>
                                            <td>
                                                <span className="ap-badge ap-badge-primary">
                                                    {formatRole(admin.role)}
                                                </span>
                                            </td>
                                            <td className="center">
                                                <span className={admin.is_active ? 'ap-badge ap-badge-success' : 'ap-badge ap-badge-danger'}>
                                                    <span className={`ap-badge-dot ${admin.is_active ? 'success' : 'danger'}`} />
                                                    {admin.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="secondary">{admin.last_login_at_formatted || 'Never'}</td>
                                            <td className="secondary">{admin.created_at_formatted}</td>
                                            <td className="center">
                                                <div className="ap-flex ap-items-center ap-justify-center ap-gap-sm">
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-primary"
                                                        onClick={() => startEdit(admin)}
                                                        title="Edit"
                                                    >
                                                        <Pencil size={14} /> Edit
                                                    </button>
                                                    <button
                                                        className={admin.is_active ? 'ap-btn ap-btn-sm ap-btn-warning' : 'ap-btn ap-btn-sm ap-btn-success'}
                                                        onClick={() => handleToggleStatus(admin.id)}
                                                        title={admin.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {admin.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                        {admin.is_active ? 'Disable' : 'Enable'}
                                                    </button>
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-danger"
                                                        onClick={() => handleResetPassword(admin.id, admin.username)}
                                                        title="Reset Password"
                                                    >
                                                        <KeyRound size={14} /> Reset
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
                                <UserCog size={24} />
                            </div>
                            <p className="ap-empty-title">No admin team members found</p>
                            <p className="ap-empty-text">Add your first admin team member to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
