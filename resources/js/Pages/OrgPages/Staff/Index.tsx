import OrgLayout from '@/Layouts/OrgLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, UserPlus, Trash2, Shield, X, Settings, Edit2 } from 'lucide-react';

interface StaffMember {
    id: number;
    username: string;
    email: string;
    role: string;
    display_name: string | null;
    permissions: Record<string, boolean> | null;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
}

interface Props {
    staff: StaffMember[];
}

const roleConfig: Record<string, { color: string; bg: string }> = {
    owner: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
    admin: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
    editor: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
    moderator: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
};

const AVAILABLE_PERMISSIONS = [
    { key: 'manage_posts', label: 'Manage Posts' },
    { key: 'manage_broadcasts', label: 'Manage Broadcasts' },
    { key: 'manage_staff', label: 'Manage Staff' },
    { key: 'view_analytics', label: 'View Analytics' },
    { key: 'manage_groups', label: 'Manage Groups' },
    { key: 'manage_profile', label: 'Manage Profile' },
];

export default function StaffIndex({ staff }: Props) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('moderator');
    const [newDisplayName, setNewDisplayName] = useState('');
    const [newPermissions, setNewPermissions] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState(false);

    // Edit modal state
    const [editRole, setEditRole] = useState('');
    const [editDisplayName, setEditDisplayName] = useState('');
    const [editPermissions, setEditPermissions] = useState<Record<string, boolean>>({});
    const [editPassword, setEditPassword] = useState('');

    const resetAddForm = () => {
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('moderator');
        setNewDisplayName('');
        setNewPermissions({});
    };

    const handleAddStaff = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) return;
        setSubmitting(true);
        router.post(route('org.staff.store'), {
            username: newUsername,
            email: newEmail,
            password: newPassword,
            role: newRole,
            display_name: newDisplayName || null,
            permissions: newPermissions,
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
        setEditRole(member.role);
        setEditDisplayName(member.display_name || '');
        setEditPermissions(member.permissions || {});
        setEditPassword('');
    };

    const handleEditStaff = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStaff) return;
        setSubmitting(true);

        const data = {
            role: editRole,
            display_name: editDisplayName || null,
            permissions: editPermissions,
            ...(editPassword.trim() ? { password: editPassword } : {}),
        };

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

    const togglePermission = (
        perms: Record<string, boolean>,
        setPerms: (p: Record<string, boolean>) => void,
        key: string
    ) => {
        setPerms({ ...perms, [key]: !perms[key] });
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: '#1a1a24',
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

    const renderPermissionToggles = (
        perms: Record<string, boolean>,
        setPerms: (p: Record<string, boolean>) => void,
    ) => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
        }}>
            {AVAILABLE_PERMISSIONS.map(({ key, label }) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => togglePermission(perms, setPerms, key)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 0.75rem',
                        background: perms[key] ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${perms[key] ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: perms[key] ? '#8B5CF6' : '#888',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                    }}
                >
                    <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        border: `2px solid ${perms[key] ? '#8B5CF6' : '#555'}`,
                        background: perms[key] ? '#8B5CF6' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                    }}>
                        {perms[key] && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    {label}
                </button>
            ))}
        </div>
    );

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
                background: '#111118',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '2rem',
                width: '100%',
                maxWidth: '520px',
                maxHeight: '85vh',
                overflowY: 'auto',
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
                        onClick={() => setShowAddModal(true)}
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
                    background: '#111118',
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
                                        const role = roleConfig[member.role] || roleConfig.moderator;
                                        const activePerms = member.permissions
                                            ? Object.entries(member.permissions).filter(([, v]) => v).map(([k]) => k)
                                            : [];
                                        const isOwner = member.role === 'owner';

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
                                                        color: role.color,
                                                        background: role.bg,
                                                        textTransform: 'capitalize',
                                                    }}>
                                                        <Shield size={12} />
                                                        {member.role}
                                                    </span>
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                }}>
                                                    {isOwner ? (
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
                                                        disabled={isOwner}
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
                                                            cursor: isOwner ? 'default' : 'pointer',
                                                            opacity: isOwner ? 0.5 : 1,
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
                                                        {!isOwner && (
                                                            <>
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
                                                            </>
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
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={labelStyle}>Role</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer' }}
                            >
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                                <option value="moderator">Moderator</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>
                                <Settings size={14} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
                                Permissions
                            </label>
                            {renderPermissionToggles(newPermissions, setNewPermissions)}
                        </div>
                    </>,
                    'Add Staff',
                    !!(newUsername.trim() && newEmail.trim() && newPassword.trim()),
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
                            <select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer' }}
                            >
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                                <option value="moderator">Moderator</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}>
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
                        <div>
                            <label style={labelStyle}>
                                <Settings size={14} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
                                Permissions
                            </label>
                            {renderPermissionToggles(editPermissions, setEditPermissions)}
                        </div>
                    </>,
                    'Save Changes',
                    true,
                )}
            </div>
        </OrgLayout>
    );
}
