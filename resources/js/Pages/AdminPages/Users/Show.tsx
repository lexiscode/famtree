import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import UserActionModal from '@/Components/AdminComponents/UserActionModal';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, Users, Lock, CheckCircle, AlertCircle, Clock, MoreVertical, ChevronRight } from 'lucide-react';

interface UserDetail {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone: string | null;
    address: string | null;
    bio: string | null;
    date_of_birth: string | null;
    death_date: string | null;
    gender: string | null;
    status: string;
    profile_image_url: string | null;
    two_fa_enabled: boolean;
    onboarding_completed: boolean;
    is_child_account: boolean;
    parent_user_id: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    scheduled_deletion_at: string | null;
    childrenCount: number;
    connectionsCount: number;
}

interface Props {
    user: UserDetail;
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

const statusConfig = {
    active: { bg: '#e8f5e9', border: '#198754', text: '#198754', label: 'Active', icon: CheckCircle },
    inactive: { bg: '#f3f4f6', border: '#6c757d', text: '#6c757d', label: 'Inactive', icon: Clock },
    suspended: { bg: '#ffebee', border: '#dc3545', text: '#dc3545', label: 'Suspended', icon: AlertCircle },
};

// Avatar component with image and fallback to initials
interface AvatarProps {
    imageUrl: string | null;
    fullName: string;
    size?: 'small' | 'large';
}

function UserAvatar({ imageUrl, fullName, size = 'small' }: AvatarProps) {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    const sizeConfig = size === 'large'
        ? { width: '80px', height: '80px', fontSize: '2rem', shadow: '0 8px 24px rgba(0, 82, 232, 0.3)' }
        : { width: '40px', height: '40px', fontSize: '0.9rem', shadow: 'none' };

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={fullName}
                style={{
                    width: sizeConfig.width,
                    height: sizeConfig.height,
                    borderRadius: size === 'large' ? '16px' : '10px',
                    objectFit: 'cover',
                    display: 'block',
                    boxShadow: size === 'large' ? sizeConfig.shadow : 'none',
                }}
                onError={handleImageError}
            />
        );
    }

    return (
        <div
            style={{
                width: sizeConfig.width,
                height: sizeConfig.height,
                borderRadius: size === 'large' ? '16px' : '10px',
                background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: sizeConfig.fontSize,
                boxShadow: sizeConfig.shadow,
            }}
        >
            {fullName.charAt(0).toUpperCase()}
        </div>
    );
}

export default function Show({ user }: Props) {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');
    const [openModal, setOpenModal] = useState<string | null>(null);
    const [showActions, setShowActions] = useState(false);

    const statusConfig_ = statusConfig[user.account_status as keyof typeof statusConfig] || statusConfig.inactive;
    const StatusIcon = statusConfig_.icon;

    const getAvailableActions = () => {
        const actions: { label: string; type: any; color: string; isDangerous: boolean }[] = [];
        if (user.account_status === 'active') {
            actions.push({ label: 'Suspend', type: 'suspend', color: '#DC2626', isDangerous: true });
            actions.push({ label: 'Deactivate', type: 'deactivate', color: '#6B7280', isDangerous: false });
        }
        if (user.account_status === 'suspended') {
            actions.push({ label: 'Unsuspend', type: 'unsuspend', color: '#16A34A', isDangerous: false });
        }
        if (!user.deleted_at) {
            actions.push({ label: 'Ban User', type: 'ban', color: '#DC2626', isDangerous: true });
        }
        if (!user.scheduled_deletion_at && !user.deleted_at) {
            actions.push({ label: 'Schedule Deletion', type: 'schedule-delete', color: '#DC2626', isDangerous: true });
        }
        if (user.scheduled_deletion_at && !user.deleted_at) {
            actions.push({ label: 'Cancel Deletion', type: 'cancel-delete', color: '#0052E8', isDangerous: false });
        }
        return actions;
    };

    const getSecurityActions = () => {
        const actions: { label: string; type: any; color: string }[] = [];
        actions.push({ label: 'Reset Password', type: 'reset-password', color: '#0052E8' });
        if (user.two_fa_enabled) {
            actions.push({ label: 'Disable 2FA', type: 'disable-2fa', color: '#DC2626' });
        } else {
            actions.push({ label: 'Enable 2FA', type: 'enable-2fa', color: '#16A34A' });
        }
        if (!user.onboarding_completed) {
            actions.push({ label: 'Complete Onboarding', type: 'complete-onboarding', color: '#16A34A' });
        } else {
            actions.push({ label: 'Reset Onboarding', type: 'reset-onboarding', color: '#DC2626' });
        }
        return actions;
    };

    return (
        <AdminLayout>
            <div>
                {/* Premium Header Section */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <button
                        onClick={() => router.get(route('admin.users.index'))}
                        style={{
                            background: '#E7F5FF',
                            border: '2px solid #cfe2ff',
                            padding: '0.65rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: THEME.primary,
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = THEME.primary;
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.borderColor = THEME.primary;
                            e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.primary}30`;
                            e.currentTarget.style.transform = 'translateX(-3px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#E7F5FF';
                            e.currentTarget.style.color = THEME.primary;
                            e.currentTarget.style.borderColor = '#cfe2ff';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>User Details</h1>
                        <p style={{ fontSize: '0.98rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>View and manage user account information</p>
                    </div>
                </div>

                {/* Premium User Header Card */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flex: 1 }}>
                            <UserAvatar imageUrl={user.profile_image_url} fullName={`${user.first_name} ${user.last_name}`} size="large" />
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>
                                    {user.first_name} {user.last_name}
                                </h2>
                                <p style={{ fontSize: '1.05rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>@{user.username}</p>
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        paddingLeft: '0.9rem',
                                        paddingRight: '0.9rem',
                                        paddingTop: '0.6rem',
                                        paddingBottom: '0.6rem',
                                        borderRadius: '10px',
                                        fontSize: '0.88rem',
                                        fontWeight: 700,
                                        border: `2px solid ${statusConfig_.border}`,
                                        backgroundColor: statusConfig_.bg,
                                        color: statusConfig_.text,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}>
                                        <StatusIcon size={16} />
                                        {statusConfig_.label}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.25rem' }}>
                            <div style={{ textAlign: 'right', padding: '0.75rem 1.25rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined</p>
                                <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginTop: '0.4rem' }}>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowActions(!showActions)}
                                    style={{
                                        padding: '0.8rem',
                                        background: showActions ? `linear-gradient(135deg, ${THEME.primary}15, #0a58ca08)` : '#F3F4F6',
                                        border: `2.5px solid ${showActions ? THEME.primary : '#E5E7EB'}`,
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: showActions ? THEME.primary : '#6B7280',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: showActions ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.04)',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!showActions) {
                                            e.currentTarget.style.background = '#E5E7EB';
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.color = THEME.primary;
                                            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}20`;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!showActions) {
                                            e.currentTarget.style.background = '#F3F4F6';
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                            e.currentTarget.style.color = '#6B7280';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                                        }
                                    }}
                                >
                                    <MoreVertical size={18} />
                                </button>
                                {showActions && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '0.75rem',
                                        background: '#FFFFFF',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '14px',
                                        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.16)',
                                        minWidth: '220px',
                                        zIndex: 10,
                                        overflow: 'hidden',
                                    }}>
                                        {getAvailableActions().map((action) => (
                                            <button
                                                key={action.type}
                                                onClick={() => {
                                                    setOpenModal(action.type);
                                                    setShowActions(false);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.875rem 1rem',
                                                    background: 'none',
                                                    border: 'none',
                                                    borderBottom: '1px solid #E5E7EB',
                                                    textAlign: 'left',
                                                    color: action.color,
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#F9FAFB';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'none';
                                                }}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Premium Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
                    {[
                        { label: 'Account Type', value: user.is_child_account ? 'Child' : 'Primary', icon: Users, color: THEME.primary },
                        { label: '2FA Status', value: user.two_fa_enabled ? 'Enabled' : 'Disabled', icon: Shield, color: user.two_fa_enabled ? THEME.success : THEME.secondary },
                        { label: 'Connections', value: user.connectionsCount.toString(), icon: Users, color: THEME.info, clickable: true },
                        { label: 'Child Accounts', value: user.childrenCount.toString(), icon: Users, color: THEME.primary, clickable: true },
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
                                    cursor: stat.clickable ? 'pointer' : 'default',
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                onClick={() => {
                                    if (stat.clickable) {
                                        if (stat.label === 'Child Accounts') {
                                            router.get(route('admin.users.childAccounts', user.id));
                                        } else if (stat.label === 'Connections') {
                                            router.get(route('admin.users.connections', user.id));
                                        }
                                    }
                                }}
                                onMouseEnter={(e) => {
                                    if (stat.clickable) {
                                        e.currentTarget.style.borderColor = stat.color;
                                        e.currentTarget.style.boxShadow = `0 16px 40px ${stat.color}25, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                        e.currentTarget.style.transform = 'translateY(-6px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (stat.clickable) {
                                        e.currentTarget.style.borderColor = `${stat.color}20`;
                                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
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

                {/* Premium Tabs */}
                <div style={{ borderBottom: `3px solid #E5E7EB`, marginBottom: '2.5rem', display: 'flex', gap: '2.5rem', background: '#FFFFFF', padding: '0 0 0 0', borderRadius: '0' }}>
                    {(['profile', 'security', 'activity'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '1.1rem 0.5rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab ? `4px solid ${THEME.primary}` : '4px solid transparent',
                                color: activeTab === tab ? THEME.primary : '#6B7280',
                                fontSize: '1.02rem',
                                fontWeight: activeTab === tab ? 800 : 700,
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                textTransform: 'capitalize',
                                letterSpacing: '0.3px',
                                position: 'relative',
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== tab) {
                                    (e.target as HTMLElement).style.color = THEME.primary;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== tab) {
                                    (e.target as HTMLElement).style.color = '#6B7280';
                                }
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'profile' && (
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                            {[
                                { label: 'Email Address', value: user.email, icon: Mail },
                                { label: 'Phone', value: user.phone || 'Not provided', icon: Phone },
                                { label: 'Date of Birth', value: user.date_of_birth || 'Not provided', icon: Calendar },
                                { label: 'Gender', value: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified', icon: Users },
                            ].map((field, idx) => {
                                const Icon = field.icon;
                                return (
                                    <div key={idx}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{field.label}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB', transition: 'all 0.3s ease' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#F3F4F6';
                                                e.currentTarget.style.borderColor = '#D1D5DB';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = '#F9FAFB';
                                                e.currentTarget.style.borderColor = '#E5E7EB';
                                            }}>
                                            <Icon size={20} color={THEME.primary} strokeWidth={2} />
                                            <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500 }}>{field.value}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {user.address && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</p>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB', transition: 'all 0.3s ease' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#F3F4F6';
                                            e.currentTarget.style.borderColor = '#D1D5DB';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#F9FAFB';
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                        }}>
                                        <MapPin size={20} color={THEME.primary} strokeWidth={2} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                                        <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500 }}>{user.address}</p>
                                    </div>
                                </div>
                            )}
                            {user.bio && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bio</p>
                                    <div style={{ padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB', transition: 'all 0.3s ease' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#F3F4F6';
                                            e.currentTarget.style.borderColor = '#D1D5DB';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#F9FAFB';
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                        }}>
                                        <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500 }}>{user.bio}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.85rem', letterSpacing: '-0.3px' }}>
                                <div style={{ padding: '0.6rem', background: '#E7F1FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Shield size={22} color={THEME.primary} strokeWidth={2.5} />
                                </div>
                                Two-Factor Authentication
                            </h3>
                            <div style={{ padding: '1.2rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.96rem' }}>
                                    Status: <span style={{ fontWeight: 800, color: user.two_fa_enabled ? THEME.success : '#6B7280', marginLeft: '0.5rem' }}>
                                        {user.two_fa_enabled ? '✓ Enabled' : '✕ Disabled'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.85rem', letterSpacing: '-0.3px' }}>
                                <div style={{ padding: '0.6rem', background: '#E7F1FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Lock size={22} color={THEME.primary} strokeWidth={2.5} />
                                </div>
                                Password Management
                            </h3>
                            <button
                                onClick={() => setOpenModal('reset-password')}
                                style={{
                                    paddingLeft: '1.75rem',
                                    paddingRight: '1.75rem',
                                    paddingTop: '0.85rem',
                                    paddingBottom: '0.85rem',
                                    background: `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: `0 4px 12px ${THEME.primary}25`,
                                    fontSize: '0.96rem',
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
                                Reset Password
                            </button>
                        </div>

                        <div style={{ borderTop: '2.5px solid #E5E7EB', paddingTop: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', letterSpacing: '-0.3px' }}>Account Actions</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                                {getSecurityActions().map((action) => (
                                    <button
                                        key={action.type}
                                        onClick={() => setOpenModal(action.type)}
                                        style={{
                                            paddingLeft: '1.1rem',
                                            paddingRight: '1.1rem',
                                            paddingTop: '0.8rem',
                                            paddingBottom: '0.8rem',
                                            background: '#FFFFFF',
                                            color: action.color,
                                            border: `2px solid ${action.color}30`,
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            fontSize: '0.92rem',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                            letterSpacing: '0.3px',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = action.color + '15';
                                            e.currentTarget.style.borderColor = action.color + '60';
                                            e.currentTarget.style.boxShadow = `0 8px 16px ${action.color}25`;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#FFFFFF';
                                            e.currentTarget.style.borderColor = action.color + '30';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {user.deleted_at && (
                            <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: '#FEE2E2', borderRadius: '14px', border: '2px solid #FECACA', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)' }}>
                                <p style={{ margin: 0, color: '#991B1B', fontWeight: 800, fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>⚠</span>
                                    Account Deleted
                                </p>
                                <p style={{ margin: 0, marginTop: '0.6rem', color: '#7F1D1D', fontSize: '0.92rem', fontWeight: 500 }}>
                                    This account was deleted on <strong>{new Date(user.deleted_at).toLocaleDateString()}</strong>
                                </p>
                            </div>
                        )}

                        {user.scheduled_deletion_at && (
                            <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: '#FEF3C7', borderRadius: '14px', border: '2px solid #FDE68A', boxShadow: '0 4px 12px rgba(180, 83, 9, 0.1)' }}>
                                <p style={{ margin: 0, color: '#92400E', fontWeight: 800, fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>⏱</span>
                                    Scheduled for Deletion
                                </p>
                                <p style={{ margin: 0, marginTop: '0.6rem', color: '#78350F', fontSize: '0.92rem', fontWeight: 500 }}>
                                    Scheduled for deletion on <strong>{new Date(user.scheduled_deletion_at).toLocaleDateString()}</strong>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        <div style={{ space: '1.5rem' }}>
                            {[
                                { label: 'Account Created', value: new Date(user.created_at).toLocaleDateString() + ' at ' + new Date(user.created_at).toLocaleTimeString(), icon: Calendar },
                                { label: 'Last Updated', value: new Date(user.updated_at).toLocaleDateString() + ' at ' + new Date(user.updated_at).toLocaleTimeString(), icon: Calendar },
                                { label: 'Onboarding Status', value: user.onboarding_completed ? '✓ Completed' : 'Incomplete', icon: CheckCircle },
                            ].map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx} style={{ marginBottom: idx === 2 ? 0 : '2rem', paddingBottom: idx === 2 ? 0 : '2rem', borderBottom: idx === 2 ? 'none' : '2px solid #E5E7EB' }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                            <Icon size={20} color={THEME.primary} strokeWidth={2} />
                                            <p style={{ fontSize: '0.98rem', fontWeight: 600, color: '#0a0e27', margin: 0 }}>{item.value}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Action Modal */}
                {openModal && (
                    <UserActionModal
                        isOpen={!!openModal}
                        onClose={() => setOpenModal(null)}
                        userId={user.id}
                        actionType={openModal as any}
                        userName={`${user.first_name} ${user.last_name}`}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
