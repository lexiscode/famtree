import OrgLayout from '@/Layouts/OrgLayout';
import { useState, useEffect, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { UserPlus, Trash2, Shield, X, Edit2, AlertTriangle, UserX } from 'lucide-react';

interface OrgRole {
    id: number;
    name: string;
    slug: string;
    is_system: boolean;
    permissions: Record<string, boolean>;
}

interface StaffMember {
    id: number;
    username: string;
    email: string;
    org_role_id: number | null;
    org_role: OrgRole | null;
    display_name: string | null;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
}

interface Props {
    staff: StaffMember[];
    roles: OrgRole[];
}

export default function StaffIndex({ staff, roles }: Props) {
    const { auth } = usePage<{ auth: { org?: { is_owner: boolean } } }>().props;
    const currentIsOwner = auth?.org?.is_owner ?? false;
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRoleId, setNewRoleId] = useState<number | ''>('');
    const [newDisplayName, setNewDisplayName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Edit modal state
    const [editRoleId, setEditRoleId] = useState<number | ''>('');
    const [editDisplayName, setEditDisplayName] = useState('');
    const [editPassword, setEditPassword] = useState('');

    const resetAddForm = () => {
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setNewRoleId(roles.length > 0 ? roles[0].id : '');
        setNewDisplayName('');
    };

    const handleAddStaff = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim() || !newRoleId) return;
        setSubmitting(true);
        router.post(route('org.staff.store'), {
            username: newUsername,
            email: newEmail,
            password: newPassword,
            org_role_id: newRoleId,
            display_name: newDisplayName || null,
        }, {
            onSuccess: () => {
                setShowAddModal(false);
                resetAddForm();
                setSubmitting(false);
            },
            onError: () => setSubmitting(false),
        });
    };

    const openEditModal = (member: StaffMember) => {
        setEditingStaff(member);
        setEditRoleId(member.org_role_id || '');
        setEditDisplayName(member.display_name || '');
        setEditPassword('');
    };

    const handleEditStaff = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStaff) return;
        setSubmitting(true);

        const data: Record<string, unknown> = {
            display_name: editDisplayName || null,
        };
        if (currentIsOwner) {
            data.org_role_id = editRoleId || undefined;
        }
        if (editPassword.trim()) {
            data.password = editPassword;
        }

        router.put(route('org.staff.update', { id: editingStaff.id }), data, {
            onSuccess: () => {
                setEditingStaff(null);
                setSubmitting(false);
            },
            onError: () => setSubmitting(false),
        });
    };

    const [confirmDialog, setConfirmDialog] = useState<{
        type: 'delete' | 'toggle-active';
        member: StaffMember;
    } | null>(null);

    const requestDelete = (member: StaffMember) => {
        setConfirmDialog({ type: 'delete', member });
    };

    const requestToggleActive = (member: StaffMember) => {
        setConfirmDialog({ type: 'toggle-active', member });
    };

    const dismissConfirm = useCallback(() => {
        setConfirmDialog(null);
    }, []);

    const executeConfirm = useCallback(() => {
        if (!confirmDialog) return;
        const { type, member } = confirmDialog;
        setConfirmDialog(null);

        if (type === 'delete') {
            router.delete(route('org.staff.destroy', { id: member.id }));
        } else {
            router.put(route('org.staff.update', { id: member.id }), {
                is_active: !member.is_active,
            });
        }
    }, [confirmDialog]);

    useEffect(() => {
        if (!confirmDialog) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismissConfirm(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [confirmDialog, dismissConfirm]);

    const getConfirmInfo = (type: string, member: StaffMember) => {
        const name = member.display_name || member.username;
        if (type === 'delete') return {
            title: 'Remove Staff Member',
            message: `Are you sure you want to remove ${name}? They will lose all access to the organization dashboard.`,
            confirmLabel: 'Remove',
            confirmColor: '#EF4444',
            confirmBg: 'rgba(239, 68, 68, 0.15)',
            icon: Trash2,
        };
        return {
            title: member.is_active ? 'Deactivate Staff' : 'Activate Staff',
            message: member.is_active
                ? `Are you sure you want to deactivate ${name}? They will not be able to log into the organization dashboard until reactivated.`
                : `Are you sure you want to reactivate ${name}? They will regain access to the organization dashboard with their assigned role.`,
            confirmLabel: member.is_active ? 'Deactivate' : 'Activate',
            confirmColor: member.is_active ? '#EF4444' : '#22C55E',
            confirmBg: member.is_active ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            icon: member.is_active ? UserX : UserPlus,
        };
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: '#1e1e35',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '8px',
        padding: '0.875rem',
        color: '#ffffff',
        fontSize: '0.95rem',
        outline: 'none',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#e0e0e0',
        marginBottom: '0.5rem',
    };

    const renderModal = (
        title: string,
        onSubmit: (e: React.FormEvent) => void,
        onClose: () => void,
        content: React.ReactNode,
        submitLabel: string,
        canSubmit: boolean,
    ) => (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
        }}
        onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}
        >
            <div style={{
                background: '#141425',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '2rem',
                width: '100%',
                maxWidth: '520px',
                maxHeight: '85vh',
                overflowY: 'auto',
                scrollbarWidth: 'none',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            padding: '0.25rem',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    {content}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#888',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !canSubmit}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: submitting || !canSubmit ? 'not-allowed' : 'pointer',
                                opacity: submitting || !canSubmit ? 0.6 : 1,
                            }}
                        >
                            {submitting ? 'Saving...' : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const isOwner = (member: StaffMember) => member.org_role?.is_system && member.org_role?.slug === 'owner';

    return (
        <OrgLayout>
            <div>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                            Staff
                        </h1>
                        <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                            {staff.length} staff member{staff.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => { resetAddForm(); setShowAddModal(true); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                    >
                        <UserPlus size={18} />
                        Add Staff
                    </button>
                </div>

                {/* Staff Table */}
                <div style={{
                    background: '#141425',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                }}>
                    {staff.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Name', 'Username', 'Email', 'Role', 'Permissions', 'Status', 'Last Login', 'Actions'].map((header) => (
                                            <th
                                                key={header}
                                                style={{
                                                    padding: '1rem',
                                                    textAlign: 'left',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: '#888',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.map((member) => {
                                        const memberIsOwner = isOwner(member);
                                        const roleName = member.org_role?.name || 'No Role';
                                        const roleIsSystem = member.org_role?.is_system ?? false;
                                        const activePerms = member.org_role?.permissions
                                            ? Object.entries(member.org_role.permissions).filter(([, v]) => v).map(([k]) => k)
                                            : [];

                                        return (
                                            <tr
                                                key={member.id}
                                                style={{ transition: 'background 0.2s ease' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <td style={{
                                                    padding: '1rem',
                                                    fontSize: '0.875rem',
                                                    color: '#e0e0e0',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                    fontWeight: 500,
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '8px',
                                                            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#ffffff',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            flexShrink: 0,
                                                        }}>
                                                            {(member.display_name || member.username)[0].toUpperCase()}
                                                        </div>
                                                        {member.display_name || '--'}
                                                    </div>
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    fontSize: '0.875rem',
                                                    color: '#888',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                }}>
                                                    {member.username}
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    fontSize: '0.875rem',
                                                    color: '#888',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                }}>
                                                    {member.email}
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.35rem',
                                                        padding: '0.3rem 0.65rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        color: roleIsSystem ? '#F59E0B' : '#8B5CF6',
                                                        background: roleIsSystem ? 'rgba(245, 158, 11, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                                                        textTransform: 'capitalize',
                                                    }}>
                                                        <Shield size={12} />
                                                        {roleName}
                                                    </span>
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                }}>
                                                    {memberIsOwner ? (
                                                        <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontStyle: 'italic' }}>
                                                            All permissions
                                                        </span>
                                                    ) : activePerms.length > 0 ? (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                            {activePerms.slice(0, 3).map((perm) => (
                                                                <span key={perm} style={{
                                                                    padding: '0.15rem 0.45rem',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.65rem',
                                                                    color: '#8B5CF6',
                                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                                    whiteSpace: 'nowrap',
                                                                }}>
                                                                    {perm.replace('manage_', '').replace('view_', '')}
                                                                </span>
                                                            ))}
                                                            {activePerms.length > 3 && (
                                                                <span style={{
                                                                    padding: '0.15rem 0.45rem',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.65rem',
                                                                    color: '#666',
                                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                                }}>
                                                                    +{activePerms.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '0.75rem', color: '#555' }}>None</span>
                                                    )}
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                }}>
                                                    <button
                                                        onClick={() => requestToggleActive(member)}
                                                        disabled={memberIsOwner}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.35rem',
                                                            padding: '0.3rem 0.65rem',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            color: member.is_active ? '#22C55E' : '#EF4444',
                                                            background: member.is_active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                            border: 'none',
                                                            cursor: memberIsOwner ? 'default' : 'pointer',
                                                            opacity: memberIsOwner ? 0.5 : 1,
                                                            transition: 'opacity 0.2s ease',
                                                        }}
                                                    >
                                                        {member.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    fontSize: '0.8rem',
                                                    color: '#666',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {member.last_login_at
                                                        ? new Date(member.last_login_at).toLocaleDateString()
                                                        : 'Never'}
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                }}>
                                                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                        <button
                                                            onClick={() => openEditModal(member)}
                                                            style={{
                                                                background: 'rgba(139, 92, 246, 0.1)',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                padding: '0.5rem',
                                                                cursor: 'pointer',
                                                                color: '#8B5CF6',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'background 0.2s ease',
                                                            }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; }}
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        {!memberIsOwner && (
                                                            <button
                                                                onClick={() => requestDelete(member)}
                                                                style={{
                                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    padding: '0.5rem',
                                                                    cursor: 'pointer',
                                                                    color: '#EF4444',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'background 0.2s ease',
                                                                }}
                                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                        }}>
                            <UserPlus size={32} color="#555" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                                No staff members yet. Add your first staff member.
                            </p>
                        </div>
                    )}
                </div>

                {/* Add Staff Modal */}
                {showAddModal && renderModal(
                    'Add Staff Member',
                    handleAddStaff,
                    () => { setShowAddModal(false); resetAddForm(); },
                    <>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={labelStyle}>Display Name</label>
                            <input
                                type="text"
                                value={newDisplayName}
                                onChange={(e) => setNewDisplayName(e.target.value)}
                                placeholder="Full name"
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={labelStyle}>Username *</label>
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="username"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={labelStyle}>Email *</label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="email@example.com"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={labelStyle}>Password *</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimum 8 characters"
                                style={inputStyle}
                                required
                                minLength={8}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Role *</label>
                            {roles.length > 0 ? (
                                <select
                                    value={newRoleId}
                                    onChange={(e) => setNewRoleId(Number(e.target.value))}
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                >
                                    <option value="">Select a role...</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
                                    No roles available. Create a role first in the Roles page.
                                </p>
                            )}
                        </div>
                    </>,
                    'Add Staff',
                    !!(newUsername.trim() && newEmail.trim() && newPassword.trim() && newRoleId),
                )}

                {/* Edit Staff Modal */}
                {editingStaff && renderModal(
                    `Edit: ${editingStaff.display_name || editingStaff.username}`,
                    handleEditStaff,
                    () => setEditingStaff(null),
                    <>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={labelStyle}>Display Name</label>
                            <input
                                type="text"
                                value={editDisplayName}
                                onChange={(e) => setEditDisplayName(e.target.value)}
                                placeholder="Full name"
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={labelStyle}>Role</label>
                            {currentIsOwner && !isOwner(editingStaff!) ? (
                                <select
                                    value={editRoleId}
                                    onChange={(e) => setEditRoleId(Number(e.target.value))}
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                >
                                    <option value="">Select a role...</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={editingStaff?.org_role?.name || 'No Role'}
                                    readOnly
                                    style={{ ...inputStyle, cursor: 'not-allowed', opacity: 0.6 }}
                                />
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>New Password (leave blank to keep current)</label>
                            <input
                                type="password"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                placeholder="Enter new password"
                                style={inputStyle}
                                minLength={8}
                            />
                        </div>
                    </>,
                    'Save Changes',
                    true,
                )}
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog && (() => {
                const info = getConfirmInfo(confirmDialog.type, confirmDialog.member);
                const Icon = info.icon;
                return (
                    <div
                        onClick={dismissConfirm}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '1rem',
                            animation: 'fadeIn 0.15s ease-out',
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#1a1a2e',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '16px',
                                padding: '1.75rem',
                                width: '100%',
                                maxWidth: '400px',
                                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
                                animation: 'slideUp 0.2s ease-out',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: info.confirmBg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={22} color={info.confirmColor} />
                                </div>
                                <button
                                    onClick={dismissConfirm}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)', border: 'none',
                                        borderRadius: '8px', padding: '6px', cursor: 'pointer',
                                        color: '#888', display: 'flex', transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#ccc'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#888'; }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                                {info.title}
                            </h3>
                            <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#999', lineHeight: 1.5 }}>
                                {info.message}
                            </p>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={dismissConfirm}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '10px',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        color: '#ccc', fontSize: '0.85rem', fontWeight: 500,
                                        cursor: 'pointer', transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeConfirm}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '10px',
                                        background: info.confirmBg,
                                        border: `1px solid ${info.confirmColor}33`,
                                        color: info.confirmColor, fontSize: '0.85rem', fontWeight: 600,
                                        cursor: 'pointer', transition: 'all 0.15s ease',
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = `${info.confirmColor}30`; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = info.confirmBg; }}
                                >
                                    <Icon size={14} />
                                    {info.confirmLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </OrgLayout>
    );
}
