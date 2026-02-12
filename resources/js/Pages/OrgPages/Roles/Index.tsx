import OrgLayout from '@/Layouts/OrgLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Shield, X, Edit2, Trash2, Lock } from 'lucide-react';
import { AVAILABLE_PERMISSIONS } from '@/constants/orgPermissions';

interface OrgRole {
    id: number;
    name: string;
    slug: string;
    is_system: boolean;
    permissions: Record<string, boolean>;
    accounts_count: number;
    created_at: string;
}

interface Props {
    roles: OrgRole[];
}

export default function RolesIndex({ roles }: Props) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRole, setEditingRole] = useState<OrgRole | null>(null);
    const [roleName, setRoleName] = useState('');
    const [rolePermissions, setRolePermissions] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setRoleName('');
        setRolePermissions({});
    };

    const handleAddRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim()) return;
        setSubmitting(true);
        router.post(route('org.roles.store'), {
            name: roleName,
            permissions: rolePermissions,
        }, {
            onSuccess: () => {
                setShowAddModal(false);
                resetForm();
                setSubmitting(false);
            },
            onError: () => setSubmitting(false),
        });
    };

    const openEditModal = (role: OrgRole) => {
        setEditingRole(role);
        setRoleName(role.name);
        setRolePermissions(role.permissions || {});
    };

    const handleEditRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRole || !roleName.trim()) return;
        setSubmitting(true);
        router.put(route('org.roles.update', { id: editingRole.id }), {
            name: roleName,
            permissions: rolePermissions,
        }, {
            onSuccess: () => {
                setEditingRole(null);
                resetForm();
                setSubmitting(false);
            },
            onError: () => setSubmitting(false),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this role?')) {
            router.delete(route('org.roles.destroy', { id }));
        }
    };

    const togglePermission = (key: string) => {
        setRolePermissions(prev => ({ ...prev, [key]: !prev[key] }));
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

    const renderPermissionToggles = () => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
        }}>
            {AVAILABLE_PERMISSIONS.map(({ key, label }) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => togglePermission(key)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 0.75rem',
                        background: rolePermissions[key] ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${rolePermissions[key] ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: rolePermissions[key] ? '#8B5CF6' : '#888',
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
                        border: `2px solid ${rolePermissions[key] ? '#8B5CF6' : '#555'}`,
                        background: rolePermissions[key] ? '#8B5CF6' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                    }}>
                        {rolePermissions[key] && (
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
        submitLabel: string,
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
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={labelStyle}>Role Name *</label>
                        <input
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            placeholder="e.g. Content Manager"
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>
                            <Shield size={14} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
                            Permissions
                        </label>
                        {renderPermissionToggles()}
                    </div>
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
                            disabled={submitting || !roleName.trim()}
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
                                cursor: submitting || !roleName.trim() ? 'not-allowed' : 'pointer',
                                opacity: submitting || !roleName.trim() ? 0.6 : 1,
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
                            Roles
                        </h1>
                        <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                            {roles.length} role{roles.length !== 1 ? 's' : ''} defined
                        </p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowAddModal(true); }}
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
                        <Plus size={18} />
                        Add Role
                    </button>
                </div>

                {/* Roles Table */}
                <div style={{
                    background: '#141425',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                }}>
                    {roles.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Role Name', 'Type', 'Permissions', 'Staff Count', 'Actions'].map((header) => (
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
                                    {roles.map((role) => {
                                        const activePerms = role.permissions
                                            ? Object.entries(role.permissions).filter(([, v]) => v).map(([k]) => k)
                                            : [];

                                        return (
                                            <tr
                                                key={role.id}
                                                style={{ transition: 'background 0.2s ease' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <td style={{
                                                    padding: '1rem',
                                                    fontSize: '0.875rem',
                                                    color: '#e0e0e0',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                    fontWeight: 600,
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '8px',
                                                            background: role.is_system
                                                                ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                                                                : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#ffffff',
                                                            flexShrink: 0,
                                                        }}>
                                                            {role.is_system ? <Lock size={14} /> : <Shield size={14} />}
                                                        </div>
                                                        {role.name}
                                                    </div>
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '0.3rem 0.65rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        color: role.is_system ? '#F59E0B' : '#8B5CF6',
                                                        background: role.is_system ? 'rgba(245, 158, 11, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                                                    }}>
                                                        {role.is_system ? 'System' : 'Custom'}
                                                    </span>
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                }}>
                                                    {role.is_system ? (
                                                        <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontStyle: 'italic' }}>
                                                            All Permissions
                                                        </span>
                                                    ) : activePerms.length > 0 ? (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                            {activePerms.map((perm) => (
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
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '0.75rem', color: '#555' }}>None</span>
                                                    )}
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    fontSize: '0.875rem',
                                                    color: '#888',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                }}>
                                                    {role.accounts_count} staff
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                }}>
                                                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                        {!role.is_system && (
                                                            <>
                                                                <button
                                                                    onClick={() => openEditModal(role)}
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
                                                                    onClick={() => handleDelete(role.id)}
                                                                    disabled={role.accounts_count > 0}
                                                                    style={{
                                                                        background: role.accounts_count > 0
                                                                            ? 'rgba(255, 255, 255, 0.03)'
                                                                            : 'rgba(239, 68, 68, 0.1)',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        padding: '0.5rem',
                                                                        cursor: role.accounts_count > 0 ? 'not-allowed' : 'pointer',
                                                                        color: role.accounts_count > 0 ? '#555' : '#EF4444',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        transition: 'background 0.2s ease',
                                                                        opacity: role.accounts_count > 0 ? 0.5 : 1,
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (role.accounts_count === 0) {
                                                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                                                        }
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        if (role.accounts_count === 0) {
                                                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                                        }
                                                                    }}
                                                                    title={role.accounts_count > 0 ? 'Cannot delete: role has assigned staff' : 'Delete'}
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
                            <Shield size={32} color="#555" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                                No custom roles yet. Add your first role.
                            </p>
                        </div>
                    )}
                </div>

                {/* Add Role Modal */}
                {showAddModal && renderModal(
                    'Add Role',
                    handleAddRole,
                    () => { setShowAddModal(false); resetForm(); },
                    'Create Role',
                )}

                {/* Edit Role Modal */}
                {editingRole && renderModal(
                    `Edit: ${editingRole.name}`,
                    handleEditRole,
                    () => { setEditingRole(null); resetForm(); },
                    'Save Changes',
                )}
            </div>
        </OrgLayout>
    );
}
