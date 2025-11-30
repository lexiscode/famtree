import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Plus, Edit2, Trash2, Users, Shield, CheckCircle } from 'lucide-react';

interface ChildAccount {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    username: string;
    email: string;
    status: string;
    profile_image_url: string | null;
    two_fa_enabled: boolean;
    created_at: string;
    created_at_formatted: string;
    onboarding_completed: boolean;
}

interface UserDetail {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
}

interface ChildStats {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    with_2fa: number;
}

interface Props {
    user: UserDetail;
    childAccounts: ChildAccount[];
    childStats: ChildStats;
}

// Bootstrap theme colors
const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

const statusBadge = {
    active: { bg: '#e8f5e9', text: THEME.success, label: 'Active' },
    inactive: { bg: '#f3f4f6', text: '#6c757d', label: 'Inactive' },
    suspended: { bg: '#ffebee', text: THEME.danger, label: 'Suspended' },
};

// Avatar component with image and fallback to initials
interface AvatarProps {
    imageUrl: string | null;
    fullName: string;
}

function ChildAvatar({ imageUrl, fullName }: AvatarProps) {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={fullName}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    display: 'block',
                }}
                onError={handleImageError}
            />
        );
    }

    return (
        <div
            style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
            }}
        >
            {fullName.charAt(0).toUpperCase()}
        </div>
    );
}

export default function ChildAccounts({ user, childAccounts, childStats }: Props) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(route('admin.users.createChildAccount', user.id), formData, {
            onSuccess: () => {
                setFormData({ first_name: '', last_name: '', username: '', email: '', password: '' });
                setShowCreateForm(false);
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleDelete = (childId: number) => {
        if (confirm('Are you sure you want to delete this child account? This action cannot be undone.')) {
            router.delete(route('admin.users.deleteChildAccount', { parentId: user.id, childId }));
        }
    };

    return (
        <AdminLayout>
            <div style={{ paddingBottom: '2rem' }}>
                {/* Premium Header Section with Gradient Background */}
                <div
                    style={{
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                        borderRadius: '20px',
                        padding: '2.5rem',
                        color: '#FFFFFF',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 16px 48px rgba(139, 92, 246, 0.20)',
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
                            <Users size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Child Accounts
                            </h1>
                        </div>
                        <p
                            style={{
                                fontSize: '1.05rem',
                                color: 'rgba(255, 255, 255, 0.95)',
                                marginTop: '0.75rem',
                                margin: 0,
                                maxWidth: '600px',
                                lineHeight: 1.6,
                                fontWeight: 500,
                            }}
                        >
                            Manage and create child accounts for {user.first_name} {user.last_name}
                        </p>
                    </div>
                </div>

                {/* Premium Statistics */}
                <div style={{ paddingLeft: '2rem', paddingRight: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
                    {[
                        { label: 'Total Accounts', value: childStats.total, icon: Users, color: THEME.primary },
                        { label: 'Active', value: childStats.active, icon: CheckCircle, color: THEME.success },
                        { label: 'Inactive', value: childStats.inactive, icon: Users, color: THEME.secondary },
                        { label: 'Suspended', value: childStats.suspended, icon: Users, color: THEME.danger },
                        { label: '2FA Enabled', value: childStats.with_2fa, icon: Shield, color: THEME.info },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={idx}
                                style={{
                                    background: '#FFFFFF',
                                    border: `2.5px solid ${stat.color}20`,
                                    borderRadius: '16px',
                                    padding: '1.75rem',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = stat.color;
                                    e.currentTarget.style.boxShadow = `0 16px 40px ${stat.color}25, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = `${stat.color}20`;
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
                                        width: '80px',
                                        height: '80px',
                                        background: `${stat.color}10`,
                                        borderRadius: '50%',
                                        transform: 'translate(30%, -30%)',
                                    }}
                                />

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                                            <p style={{ fontSize: '1.9rem', fontWeight: 800, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '14px', backgroundColor: `${stat.color}15` }}>
                                            <Icon size={30} color={stat.color} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Premium Create New Child Account */}
                {!showCreateForm && (
                    <div style={{ paddingLeft: '2rem', paddingRight: '2rem', marginBottom: '2.5rem' }}>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                paddingLeft: '1.75rem',
                                paddingRight: '1.75rem',
                                paddingTop: '0.85rem',
                                paddingBottom: '0.85rem',
                                background: `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: '0.96rem',
                                boxShadow: `0 4px 12px ${THEME.primary}25`,
                                letterSpacing: '0.3px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = `0 12px 28px ${THEME.primary}40`;
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}25`;
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Plus className="w-5 h-5" />
                            Create New Child Account
                        </button>
                    </div>
                )}

                {/* Premium Create Form */}
                {showCreateForm && (
                    <div style={{ marginLeft: '2rem', marginRight: '2rem', background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '2rem', letterSpacing: '-0.5px' }}>Create New Child Account</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#0a0e27', marginBottom: '0.5rem' }}>First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            border: '1.5px solid #E5E7EB',
                                            borderRadius: '10px',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.3s',
                                            boxSizing: 'border-box',
                                            background: '#FFFFFF',
                                            color: '#0a0e27',
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#0a0e27', marginBottom: '0.5rem' }}>Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            border: '1.5px solid #E5E7EB',
                                            borderRadius: '10px',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.3s',
                                            boxSizing: 'border-box',
                                            background: '#FFFFFF',
                                            color: '#0a0e27',
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#0a0e27', marginBottom: '0.5rem' }}>Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            border: '1.5px solid #E5E7EB',
                                            borderRadius: '10px',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.3s',
                                            boxSizing: 'border-box',
                                            background: '#FFFFFF',
                                            color: '#0a0e27',
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#0a0e27', marginBottom: '0.5rem' }}>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            border: '1.5px solid #E5E7EB',
                                            borderRadius: '10px',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.3s',
                                            boxSizing: 'border-box',
                                            background: '#FFFFFF',
                                            color: '#0a0e27',
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <div style={{ gridColumn: 'span 1' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#0a0e27', marginBottom: '0.5rem' }}>Password (min 8 chars)</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        minLength={8}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            border: '1.5px solid #E5E7EB',
                                            borderRadius: '10px',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.3s',
                                            boxSizing: 'border-box',
                                            background: '#FFFFFF',
                                            color: '#0a0e27',
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: isSubmitting ? THEME.primary + '80' : `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s',
                                        fontSize: '0.95rem',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSubmitting) {
                                            e.currentTarget.style.boxShadow = `0 8px 24px ${THEME.primary}35`;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSubmitting) {
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Account'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setFormData({ first_name: '', last_name: '', username: '', email: '', password: '' });
                                    }}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#F3F4F6',
                                        color: '#666',
                                        border: '1.5px solid #E5E7EB',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        fontSize: '0.95rem',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#E5E7EB';
                                        e.currentTarget.style.color = '#0a0e27';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#F3F4F6';
                                        e.currentTarget.style.color = '#666';
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Premium Child Accounts List */}
                <div style={{ marginLeft: '2rem', marginRight: '2rem', background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    {childAccounts.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>2FA</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {childAccounts.map((child, idx) => {
                                        const badge = statusBadge[child.status as keyof typeof statusBadge] || statusBadge.inactive;
                                        return (
                                            <tr
                                                key={child.id}
                                                style={{
                                                    borderBottom: '1.5px solid #E5E7EB',
                                                    background: '#FFFFFF',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#F9FAFB';
                                                    e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(139, 92, 246, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = '#FFFFFF';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <td style={{ padding: '1.2rem 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <ChildAvatar imageUrl={child.profile_image_url} fullName={child.full_name} />
                                                        <div>
                                                            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a0e27', margin: 0 }}>{child.full_name}</p>
                                                            <p style={{ fontSize: '0.85rem', color: '#888', margin: 0, marginTop: '0.25rem' }}>@{child.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.95rem', color: '#666' }}>{child.email}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            padding: '0.5rem 0.75rem',
                                                            borderRadius: '8px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600,
                                                            backgroundColor: badge.bg,
                                                            color: badge.text,
                                                        }}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.95rem', color: '#666' }}>{child.created_at}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            padding: '0.4rem 0.75rem',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600,
                                                            backgroundColor: child.two_fa_enabled ? '#E8F5E9' : '#F3F4F6',
                                                            color: child.two_fa_enabled ? THEME.success : '#6c757d',
                                                        }}
                                                    >
                                                        {child.two_fa_enabled ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        <button
                                                            onClick={() => router.get(route('admin.users.show', child.id))}
                                                            style={{
                                                                padding: '0.4rem 0.8rem',
                                                                background: 'transparent',
                                                                border: `1.5px solid ${THEME.primary}`,
                                                                borderRadius: '6px',
                                                                color: THEME.primary,
                                                                fontSize: '0.9rem',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = THEME.primary;
                                                                e.currentTarget.style.color = '#FFFFFF';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'transparent';
                                                                e.currentTarget.style.color = THEME.primary;
                                                            }}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(child.id)}
                                                            style={{
                                                                padding: '0.4rem 0.8rem',
                                                                background: 'transparent',
                                                                border: `1.5px solid ${THEME.danger}`,
                                                                borderRadius: '6px',
                                                                color: THEME.danger,
                                                                fontSize: '0.9rem',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = THEME.danger;
                                                                e.currentTarget.style.color = '#FFFFFF';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'transparent';
                                                                e.currentTarget.style.color = THEME.danger;
                                                            }}
                                                        >
                                                            Delete
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
                                <Users size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No child accounts created yet
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                Create one using the button above
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
