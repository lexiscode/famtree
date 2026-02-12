import OrgLayout from '@/Layouts/OrgLayout';
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { UserPlus, Trash2, Shield, X, Edit2 } from 'lucide-react';

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

    const handleToggleActive = (member: StaffMember) => {
        router.put(route('org.staff.update', { id: member.id }), {
            is_active: !member.is_active,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to remove this staff member?')) {
            router.delete(route('org.staff.destroy', { id }));
        }
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
                                                        onClick={() => handleToggleActive(member)}
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
                                                                onClick={() => handleDelete(member.id)}
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
        </OrgLayout>
    );
}
