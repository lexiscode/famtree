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
    ChevronDown,
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

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

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

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.85rem 1.15rem',
    border: '2.5px solid #E5E7EB',
    borderRadius: '12px',
    fontSize: '0.96rem',
    color: '#0a0e27',
    fontWeight: 500,
    background: '#FFFFFF',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#0a0e27',
    marginBottom: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = THEME.primary;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`;
};

const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#E5E7EB';
    e.currentTarget.style.boxShadow = 'none';
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
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Flash Messages */}
                {flash?.success && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            background: '#e8f5e9',
                            border: `2px solid ${THEME.success}`,
                            color: THEME.success,
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            background: '#ffebee',
                            border: `2px solid ${THEME.danger}`,
                            color: THEME.danger,
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Premium Header Section with Gradient Background */}
                <div
                    style={{
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                        borderRadius: '20px',
                        padding: '2.5rem',
                        color: '#FFFFFF',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 16px 48px rgba(13, 110, 253, 0.20)',
                    }}
                >
                    {/* Background decoration */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-40px',
                            right: '-40px',
                            width: '200px',
                            height: '200px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '50%',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-60px',
                            left: '-60px',
                            width: '300px',
                            height: '300px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '50%',
                        }}
                    />

                    {/* Header Content */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <UserCog size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Admin Team
                            </h1>
                        </div>
                        <p
                            style={{
                                fontSize: '1.05rem',
                                color: 'rgba(255, 255, 255, 0.95)',
                                margin: 0,
                                maxWidth: '600px',
                                lineHeight: 1.6,
                                fontWeight: 500,
                            }}
                        >
                            Manage admin team members, assign roles, and control access to the admin panel
                        </p>
                    </div>
                </div>

                {/* Premium Stats Grid */}
                <div style={{ marginBottom: '3rem' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '1.75rem',
                        }}
                    >
                        {[
                            { label: 'Total Admins', value: statistics.total, icon: Users, color: THEME.primary, lightColor: '#e7f1ff' },
                            { label: 'Active', value: statistics.active, icon: UserCheck, color: THEME.success, lightColor: '#e8f5e9' },
                        ].map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '18px',
                                        padding: '1.75rem',
                                        border: `2.5px solid ${stat.lightColor}`,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = stat.color;
                                        e.currentTarget.style.boxShadow = `0 20px 48px ${stat.color}20, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                        e.currentTarget.style.transform = 'translateY(-6px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = stat.lightColor;
                                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {/* Background accent */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '100px',
                                            height: '100px',
                                            background: stat.lightColor,
                                            borderRadius: '50%',
                                            opacity: 0.3,
                                            transform: 'translate(30%, -30%)',
                                        }}
                                    />

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {stat.label}
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                            <p
                                                style={{
                                                    fontSize: '2.25rem',
                                                    fontWeight: 800,
                                                    color: stat.color,
                                                    margin: 0,
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {stat.value}
                                            </p>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '72px',
                                                    height: '72px',
                                                    borderRadius: '16px',
                                                    backgroundColor: stat.lightColor,
                                                    transition: 'all 0.3s ease',
                                                }}
                                            >
                                                <Icon size={36} color={stat.color} strokeWidth={1.5} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Add Admin Button */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => {
                            setShowCreateForm(!showCreateForm);
                            setEditingId(null);
                        }}
                        style={{
                            paddingLeft: '1.85rem',
                            paddingRight: '1.85rem',
                            paddingTop: '0.8rem',
                            paddingBottom: '0.8rem',
                            background: showCreateForm
                                ? '#FFFFFF'
                                : `linear-gradient(135deg, ${THEME.success} 0%, #157347 100%)`,
                            color: showCreateForm ? THEME.secondary : '#FFFFFF',
                            border: showCreateForm ? `2.5px solid #E5E7EB` : 'none',
                            borderRadius: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontSize: '0.96rem',
                            letterSpacing: '0.3px',
                            boxShadow: showCreateForm ? '0 2px 8px rgba(0, 0, 0, 0.04)' : '0 4px 12px rgba(25, 135, 84, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                        }}
                        onMouseEnter={(e) => {
                            if (!showCreateForm) {
                                e.currentTarget.style.boxShadow = '0 16px 32px rgba(25, 135, 84, 0.40)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!showCreateForm) {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 135, 84, 0.25)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {showCreateForm ? (
                            <>
                                <ChevronUp size={18} strokeWidth={2.5} />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Plus size={18} strokeWidth={2.5} />
                                Add Admin
                            </>
                        )}
                    </button>
                </div>

                {/* Create Admin Form (Collapsible) */}
                {showCreateForm && (
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2.5rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                            marginBottom: '2.5rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <Plus size={22} color={THEME.success} strokeWidth={2} />
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27' }}>
                                Create New Admin
                            </h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={labelStyle}>Username</label>
                                <input
                                    type="text"
                                    value={createForm.username}
                                    onChange={(e) => handleCreateChange('username', e.target.value)}
                                    style={inputStyle}
                                    placeholder="Enter username"
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input
                                    type="email"
                                    value={createForm.email}
                                    onChange={(e) => handleCreateChange('email', e.target.value)}
                                    style={inputStyle}
                                    placeholder="admin@example.com"
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={createForm.password}
                                        onChange={(e) => handleCreateChange('password', e.target.value)}
                                        style={{ ...inputStyle, paddingRight: '3rem' }}
                                        placeholder="Minimum 8 characters"
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '0.75rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '0.25rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: THEME.secondary,
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Phone</label>
                                <input
                                    type="text"
                                    value={createForm.phone}
                                    onChange={(e) => handleCreateChange('phone', e.target.value)}
                                    style={inputStyle}
                                    placeholder="Optional phone number"
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Role</label>
                                <select
                                    value={createForm.role}
                                    onChange={(e) => handleCreateChange('role', e.target.value)}
                                    style={{
                                        ...inputStyle,
                                        cursor: 'pointer',
                                    }}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
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

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setCreateForm({ username: '', email: '', password: '', phone: '', role: '' });
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    padding: '0.85rem 1.75rem',
                                    background: '#FFFFFF',
                                    color: THEME.secondary,
                                    border: '2.5px solid #E5E7EB',
                                    borderRadius: '14px',
                                    fontWeight: 700,
                                    fontSize: '0.96rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = THEME.secondary;
                                    e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.secondary}15`;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <X size={18} strokeWidth={2.5} />
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={saving}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    padding: '0.85rem 2rem',
                                    background: `linear-gradient(135deg, ${THEME.success} 0%, #157347 100%)`,
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontWeight: 700,
                                    fontSize: '0.96rem',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    opacity: saving ? 0.6 : 1,
                                    boxShadow: '0 4px 12px rgba(25, 135, 84, 0.25)',
                                    letterSpacing: '0.3px',
                                }}
                                onMouseEnter={(e) => {
                                    if (!saving) {
                                        e.currentTarget.style.boxShadow = '0 16px 32px rgba(25, 135, 84, 0.40)';
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!saving) {
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 135, 84, 0.25)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                <Save size={18} strokeWidth={2.5} />
                                {saving ? 'Creating...' : 'Create Admin'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit Admin Modal Overlay */}
                {editingId !== null && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1050,
                            backdropFilter: 'blur(4px)',
                        }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setEditingId(null);
                        }}
                    >
                        <div
                            style={{
                                background: '#FFFFFF',
                                borderRadius: '20px',
                                padding: '2.5rem',
                                width: '100%',
                                maxWidth: '600px',
                                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.15)',
                                position: 'relative',
                            }}
                        >
                            <button
                                onClick={() => setEditingId(null)}
                                style={{
                                    position: 'absolute',
                                    top: '1.25rem',
                                    right: '1.25rem',
                                    background: '#f3f4f6',
                                    border: 'none',
                                    borderRadius: '10px',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    color: THEME.secondary,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#e5e7eb';
                                    e.currentTarget.style.color = THEME.danger;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#f3f4f6';
                                    e.currentTarget.style.color = THEME.secondary;
                                }}
                            >
                                <X size={18} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                                <Pencil size={22} color={THEME.primary} strokeWidth={2} />
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27' }}>
                                    Edit Admin
                                </h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={labelStyle}>Username</label>
                                    <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={(e) => handleEditChange('username', e.target.value)}
                                        style={inputStyle}
                                        placeholder="Enter username"
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => handleEditChange('email', e.target.value)}
                                        style={inputStyle}
                                        placeholder="admin@example.com"
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone</label>
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={(e) => handleEditChange('phone', e.target.value)}
                                        style={inputStyle}
                                        placeholder="Optional phone number"
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => handleEditChange('role', e.target.value)}
                                        style={{
                                            ...inputStyle,
                                            cursor: 'pointer',
                                        }}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
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

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    onClick={() => setEditingId(null)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        padding: '0.85rem 1.75rem',
                                        background: '#FFFFFF',
                                        color: THEME.secondary,
                                        border: '2.5px solid #E5E7EB',
                                        borderRadius: '14px',
                                        fontWeight: 700,
                                        fontSize: '0.96rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = THEME.secondary;
                                        e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.secondary}15`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={saving}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        padding: '0.85rem 2rem',
                                        background: `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '14px',
                                        fontWeight: 700,
                                        fontSize: '0.96rem',
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        opacity: saving ? 0.6 : 1,
                                        boxShadow: `0 4px 12px ${THEME.primary}25`,
                                        letterSpacing: '0.3px',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!saving) {
                                            e.currentTarget.style.boxShadow = `0 16px 32px ${THEME.primary}40`;
                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!saving) {
                                            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}25`;
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    <Save size={18} strokeWidth={2.5} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Admin Team Table */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    {admins.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Username
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Email
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Phone
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Role
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Status
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Last Login
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Created
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((admin) => (
                                        <tr
                                            key={admin.id}
                                            style={{
                                                borderBottom: '1.5px solid #E5E7EB',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                background: '#FFFFFF',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#F9FAFB';
                                                e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(13, 110, 253, 0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = '#FFFFFF';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {/* Username */}
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                    <div
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '10px',
                                                            background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                                                            color: '#FFFFFF',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 700,
                                                            fontSize: '0.9rem',
                                                        }}
                                                    >
                                                        {admin.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                                        {admin.username}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.95rem', color: '#4B5563', fontWeight: 500 }}>
                                                {admin.email}
                                            </td>

                                            {/* Phone */}
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {admin.phone || <span style={{ color: '#9CA3AF' }}>--</span>}
                                            </td>

                                            {/* Role */}
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        paddingLeft: '0.75rem',
                                                        paddingRight: '0.75rem',
                                                        paddingTop: '0.45rem',
                                                        paddingBottom: '0.45rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 700,
                                                        backgroundColor: '#f0f7ff',
                                                        color: THEME.primary,
                                                        border: '1.5px solid #cfe2ff',
                                                    }}
                                                >
                                                    {formatRole(admin.role)}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        paddingLeft: '0.75rem',
                                                        paddingRight: '0.75rem',
                                                        paddingTop: '0.5rem',
                                                        paddingBottom: '0.5rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600,
                                                        border: `1.5px solid ${admin.is_active ? THEME.success : THEME.danger}`,
                                                        backgroundColor: admin.is_active ? '#e8f5e9' : '#ffebee',
                                                        color: admin.is_active ? THEME.success : THEME.danger,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            backgroundColor: admin.is_active ? THEME.success : THEME.danger,
                                                        }}
                                                    />
                                                    {admin.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            {/* Last Login */}
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {admin.last_login_at_formatted || <span style={{ color: '#9CA3AF' }}>Never</span>}
                                            </td>

                                            {/* Created */}
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {admin.created_at_formatted}
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={() => startEdit(admin)}
                                                        title="Edit"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.4rem',
                                                            paddingLeft: '0.75rem',
                                                            paddingRight: '0.75rem',
                                                            paddingTop: '0.5rem',
                                                            paddingBottom: '0.5rem',
                                                            background: '#e7f1ff',
                                                            color: THEME.primary,
                                                            border: '2px solid #cfe2ff',
                                                            borderRadius: '10px',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = THEME.primary;
                                                            e.currentTarget.style.color = '#FFFFFF';
                                                            e.currentTarget.style.borderColor = THEME.primary;
                                                            e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.primary}35`;
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = '#e7f1ff';
                                                            e.currentTarget.style.color = THEME.primary;
                                                            e.currentTarget.style.borderColor = '#cfe2ff';
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        }}
                                                    >
                                                        <Pencil size={14} />
                                                        Edit
                                                    </button>

                                                    {/* Toggle Status Button */}
                                                    <button
                                                        onClick={() => handleToggleStatus(admin.id)}
                                                        title={admin.is_active ? 'Deactivate' : 'Activate'}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.4rem',
                                                            paddingLeft: '0.75rem',
                                                            paddingRight: '0.75rem',
                                                            paddingTop: '0.5rem',
                                                            paddingBottom: '0.5rem',
                                                            background: admin.is_active ? '#fff8e1' : '#e8f5e9',
                                                            color: admin.is_active ? THEME.warning : THEME.success,
                                                            border: `2px solid ${admin.is_active ? '#ffe082' : '#a5d6a7'}`,
                                                            borderRadius: '10px',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            const color = admin.is_active ? THEME.warning : THEME.success;
                                                            e.currentTarget.style.background = color;
                                                            e.currentTarget.style.color = admin.is_active ? '#0a0e27' : '#FFFFFF';
                                                            e.currentTarget.style.borderColor = color;
                                                            e.currentTarget.style.boxShadow = `0 12px 24px ${color}35`;
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = admin.is_active ? '#fff8e1' : '#e8f5e9';
                                                            e.currentTarget.style.color = admin.is_active ? THEME.warning : THEME.success;
                                                            e.currentTarget.style.borderColor = admin.is_active ? '#ffe082' : '#a5d6a7';
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        }}
                                                    >
                                                        {admin.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                        {admin.is_active ? 'Disable' : 'Enable'}
                                                    </button>

                                                    {/* Reset Password Button */}
                                                    <button
                                                        onClick={() => handleResetPassword(admin.id, admin.username)}
                                                        title="Reset Password"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.4rem',
                                                            paddingLeft: '0.75rem',
                                                            paddingRight: '0.75rem',
                                                            paddingTop: '0.5rem',
                                                            paddingBottom: '0.5rem',
                                                            background: '#ffebee',
                                                            color: THEME.danger,
                                                            border: `2px solid #f5c6cb`,
                                                            borderRadius: '10px',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = THEME.danger;
                                                            e.currentTarget.style.color = '#FFFFFF';
                                                            e.currentTarget.style.borderColor = THEME.danger;
                                                            e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.danger}35`;
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = '#ffebee';
                                                            e.currentTarget.style.color = THEME.danger;
                                                            e.currentTarget.style.borderColor = '#f5c6cb';
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        }}
                                                    >
                                                        <KeyRound size={14} />
                                                        Reset
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: '#F3F4F6',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                }}
                            >
                                <UserCog size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No admin team members found
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                Add your first admin team member to get started
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
