import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Building2, MapPin, Globe, Mail, Phone, Calendar, Users, Heart, FileText, GraduationCap, Shield, UserPlus, Ban, RefreshCw, Key, Trash2, Eye, EyeOff } from 'lucide-react';

const THEME = { primary: '#0d6efd', success: '#198754', danger: '#dc3545', warning: '#ffc107', info: '#0dcaf0', secondary: '#6c757d' };

interface Faculty {
    id: number;
    name: string;
    is_active: boolean;
    departments: {
        id: number;
        name: string;
        is_active: boolean;
        class_sets_count: number;
    }[];
}

interface StaffMember {
    id: number;
    username: string;
    email: string;
    display_name: string;
    is_active: boolean;
    role_name: string;
    last_login_at: string | null;
    created_at: string;
}

interface OrgDetail {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    short_name: string;
    description: string;
    vision: string;
    mission: string;
    logo_url: string | null;
    cover_image_url: string | null;
    address: string;
    city: string;
    state: string;
    country: string;
    website: string;
    email: string;
    phone: string;
    founded_year: number;
    leader_name: string;
    leader_title: string;
    leader_qualifications: string;
    leader_image_url: string | null;
    is_active: boolean;
    category: { id: number; name: string; slug: string } | null;
    org_accounts_count: number;
    followers_count: number;
    org_posts_count: number;
    faculties_count: number;
    faculties: Faculty[];
    staff: StaffMember[];
    created_at: string;
    updated_at: string;
}

interface Props {
    organization: OrgDetail;
}

function OrgAvatar({ imageUrl, name, size = 'small' }: { imageUrl: string | null; name: string; size?: 'small' | 'large' }) {
    const [imageError, setImageError] = useState(false);

    const sizeConfig = size === 'large'
        ? { width: '80px', height: '80px', fontSize: '2rem', shadow: '0 8px 24px rgba(0, 82, 232, 0.3)' }
        : { width: '40px', height: '40px', fontSize: '0.9rem', shadow: 'none' };

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={name}
                style={{
                    width: sizeConfig.width,
                    height: sizeConfig.height,
                    borderRadius: size === 'large' ? '16px' : '10px',
                    objectFit: 'cover',
                    display: 'block',
                    boxShadow: size === 'large' ? sizeConfig.shadow : 'none',
                }}
                onError={() => setImageError(true)}
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
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function Show({ organization: org }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash || {};

    const [activeTab, setActiveTab] = useState<'overview' | 'structure' | 'staff'>('overview');
    const [expandedFaculty, setExpandedFaculty] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSuspend = () => {
        if (processing) return;
        setProcessing(true);
        router.post(route('admin.organizations.suspend', org.id), {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleUnsuspend = () => {
        if (processing) return;
        setProcessing(true);
        router.post(route('admin.organizations.unsuspend', org.id), {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleDelete = () => {
        if (processing) return;
        if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) return;
        setProcessing(true);
        router.delete(route('admin.organizations.destroy', org.id), {
            onFinish: () => setProcessing(false),
        });
    };

    const handleEdit = () => {
        router.get(route('admin.organizations.edit', org.id));
    };

    const handleDisableStaff = (staffId: number) => {
        if (processing) return;
        setProcessing(true);
        router.post(route('admin.organizations.disableStaff', staffId), {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleResetStaffPassword = (staffId: number) => {
        if (processing) return;
        setProcessing(true);
        router.post(route('admin.organizations.resetStaffPassword', staffId), {}, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AdminLayout>
            <div>
                {/* Flash Messages */}
                {flash.success && (
                    <div style={{
                        padding: '1rem 1.25rem',
                        background: '#d1e7dd',
                        border: '2px solid #a3cfbb',
                        borderRadius: '12px',
                        color: '#0f5132',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}>
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div style={{
                        padding: '1rem 1.25rem',
                        background: '#f8d7da',
                        border: '2px solid #f1aeb5',
                        borderRadius: '12px',
                        color: '#842029',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}>
                        {flash.error}
                    </div>
                )}

                {/* Header Section */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <button
                        onClick={() => router.get(route('admin.organizations.index'))}
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
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>Organization Details</h1>
                        <p style={{ fontSize: '0.98rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>View and manage organization information</p>
                    </div>
                </div>

                {/* Organization Header Card */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flex: 1, minWidth: '280px' }}>
                            <OrgAvatar imageUrl={org.logo_url} name={org.name} size="large" />
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>
                                    {org.name}
                                </h2>
                                {org.short_name && (
                                    <p style={{ fontSize: '1.05rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>({org.short_name})</p>
                                )}
                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {org.category && (
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            paddingLeft: '0.85rem',
                                            paddingRight: '0.85rem',
                                            paddingTop: '0.5rem',
                                            paddingBottom: '0.5rem',
                                            borderRadius: '10px',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            border: `2px solid ${THEME.info}40`,
                                            backgroundColor: `${THEME.info}15`,
                                            color: '#0a7c8c',
                                            letterSpacing: '0.3px',
                                        }}>
                                            <GraduationCap size={14} />
                                            {org.category.name}
                                        </div>
                                    )}
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
                                        border: `2px solid ${org.is_active ? THEME.success : THEME.danger}`,
                                        backgroundColor: org.is_active ? '#e8f5e9' : '#ffebee',
                                        color: org.is_active ? THEME.success : THEME.danger,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}>
                                        {org.is_active ? (
                                            <>
                                                <Eye size={16} />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff size={16} />
                                                Suspended
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                            <div style={{ textAlign: 'right', padding: '0.75rem 1.25rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</p>
                                <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginTop: '0.4rem' }}>
                                    {new Date(org.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={handleEdit}
                                    style={{
                                        paddingLeft: '1.25rem',
                                        paddingRight: '1.25rem',
                                        paddingTop: '0.7rem',
                                        paddingBottom: '0.7rem',
                                        background: `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: `0 4px 12px ${THEME.primary}25`,
                                        fontSize: '0.9rem',
                                        letterSpacing: '0.3px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
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
                                    <FileText size={16} />
                                    Edit
                                </button>
                                {org.is_active ? (
                                    <button
                                        onClick={handleSuspend}
                                        disabled={processing}
                                        style={{
                                            paddingLeft: '1.25rem',
                                            paddingRight: '1.25rem',
                                            paddingTop: '0.7rem',
                                            paddingBottom: '0.7rem',
                                            background: '#FFFFFF',
                                            color: THEME.warning,
                                            border: `2px solid ${THEME.warning}40`,
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            cursor: processing ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            fontSize: '0.9rem',
                                            letterSpacing: '0.3px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            opacity: processing ? 0.6 : 1,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!processing) {
                                                e.currentTarget.style.background = `${THEME.warning}15`;
                                                e.currentTarget.style.borderColor = THEME.warning;
                                                e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.warning}25`;
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#FFFFFF';
                                            e.currentTarget.style.borderColor = `${THEME.warning}40`;
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <Ban size={16} />
                                        Suspend
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleUnsuspend}
                                        disabled={processing}
                                        style={{
                                            paddingLeft: '1.25rem',
                                            paddingRight: '1.25rem',
                                            paddingTop: '0.7rem',
                                            paddingBottom: '0.7rem',
                                            background: '#FFFFFF',
                                            color: THEME.success,
                                            border: `2px solid ${THEME.success}40`,
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            cursor: processing ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            fontSize: '0.9rem',
                                            letterSpacing: '0.3px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            opacity: processing ? 0.6 : 1,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!processing) {
                                                e.currentTarget.style.background = `${THEME.success}15`;
                                                e.currentTarget.style.borderColor = THEME.success;
                                                e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.success}25`;
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#FFFFFF';
                                            e.currentTarget.style.borderColor = `${THEME.success}40`;
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <RefreshCw size={16} />
                                        Unsuspend
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    disabled={processing}
                                    style={{
                                        paddingLeft: '1.25rem',
                                        paddingRight: '1.25rem',
                                        paddingTop: '0.7rem',
                                        paddingBottom: '0.7rem',
                                        background: '#FFFFFF',
                                        color: THEME.danger,
                                        border: `2px solid ${THEME.danger}40`,
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        cursor: processing ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        fontSize: '0.9rem',
                                        letterSpacing: '0.3px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        opacity: processing ? 0.6 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!processing) {
                                            e.currentTarget.style.background = `${THEME.danger}15`;
                                            e.currentTarget.style.borderColor = THEME.danger;
                                            e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.danger}25`;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#FFFFFF';
                                        e.currentTarget.style.borderColor = `${THEME.danger}40`;
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
                    {[
                        { label: 'Staff', value: org.org_accounts_count.toString(), icon: Users, color: THEME.primary },
                        { label: 'Followers', value: org.followers_count.toString(), icon: Heart, color: THEME.danger },
                        { label: 'Posts', value: org.org_posts_count.toString(), icon: FileText, color: THEME.info },
                        { label: 'Faculties', value: org.faculties_count.toString(), icon: GraduationCap, color: THEME.success },
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
                                    cursor: 'default',
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                    position: 'relative',
                                    overflow: 'hidden',
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

                {/* Tabs */}
                <div style={{ borderBottom: '3px solid #E5E7EB', marginBottom: '2.5rem', display: 'flex', gap: '2.5rem', background: '#FFFFFF', padding: '0 0 0 0', borderRadius: '0' }}>
                    {(['overview', 'structure', 'staff'] as const).map((tab) => (
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

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        {/* Description */}
                        {org.description && (
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.85rem', letterSpacing: '-0.3px' }}>
                                    <div style={{ padding: '0.6rem', background: '#E7F1FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building2 size={22} color={THEME.primary} strokeWidth={2.5} />
                                    </div>
                                    Description
                                </h3>
                                <div style={{ padding: '1.2rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                    <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500, lineHeight: 1.7 }}>{org.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Vision */}
                        {org.vision && (
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.85rem', letterSpacing: '-0.3px' }}>
                                    <div style={{ padding: '0.6rem', background: `${THEME.success}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Eye size={22} color={THEME.success} strokeWidth={2.5} />
                                    </div>
                                    Vision
                                </h3>
                                <div style={{ padding: '1.2rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                    <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500, lineHeight: 1.7 }}>{org.vision}</p>
                                </div>
                            </div>
                        )}

                        {/* Mission */}
                        {org.mission && (
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.85rem', letterSpacing: '-0.3px' }}>
                                    <div style={{ padding: '0.6rem', background: `${THEME.info}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Shield size={22} color={THEME.info} strokeWidth={2.5} />
                                    </div>
                                    Mission
                                </h3>
                                <div style={{ padding: '1.2rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                    <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500, lineHeight: 1.7 }}>{org.mission}</p>
                                </div>
                            </div>
                        )}

                        {/* Contact Information */}
                        <div style={{ marginBottom: '2.5rem', borderTop: '2.5px solid #E5E7EB', paddingTop: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', letterSpacing: '-0.3px' }}>Contact Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                                {[
                                    { label: 'Address', value: [org.address, org.city, org.state, org.country].filter(Boolean).join(', ') || 'Not provided', icon: MapPin },
                                    { label: 'Email', value: org.email || 'Not provided', icon: Mail },
                                    { label: 'Phone', value: org.phone || 'Not provided', icon: Phone },
                                    { label: 'Website', value: org.website || 'Not provided', icon: Globe },
                                ].map((field, idx) => {
                                    const Icon = field.icon;
                                    return (
                                        <div key={idx}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{field.label}</p>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.85rem',
                                                    padding: '0.9rem 1.1rem',
                                                    background: '#F9FAFB',
                                                    borderRadius: '12px',
                                                    border: '1.5px solid #E5E7EB',
                                                    transition: 'all 0.3s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#F3F4F6';
                                                    e.currentTarget.style.borderColor = '#D1D5DB';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = '#F9FAFB';
                                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                                }}
                                            >
                                                <Icon size={20} color={THEME.primary} strokeWidth={2} style={{ flexShrink: 0 }} />
                                                {field.label === 'Website' && org.website ? (
                                                    <a
                                                        href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ margin: 0, color: THEME.primary, fontSize: '0.96rem', fontWeight: 500, textDecoration: 'none' }}
                                                    >
                                                        {field.value}
                                                    </a>
                                                ) : (
                                                    <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500 }}>{field.value}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Leader Information */}
                        {org.leader_name && (
                            <div style={{ marginBottom: '2.5rem', borderTop: '2.5px solid #E5E7EB', paddingTop: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', letterSpacing: '-0.3px' }}>Leader Information</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                                    <OrgAvatar imageUrl={org.leader_image_url} name={org.leader_name} size="large" />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0a0e27', margin: 0 }}>{org.leader_name}</h4>
                                        {org.leader_title && (
                                            <p style={{ fontSize: '0.95rem', color: THEME.primary, margin: 0, marginTop: '0.35rem', fontWeight: 600 }}>{org.leader_title}</p>
                                        )}
                                        {org.leader_qualifications && (
                                            <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, marginTop: '0.5rem', fontWeight: 500, lineHeight: 1.6 }}>{org.leader_qualifications}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Founded Year */}
                        {org.founded_year > 0 && (
                            <div style={{ borderTop: '2.5px solid #E5E7EB', paddingTop: '2.5rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Founded Year</p>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.85rem',
                                            padding: '0.9rem 1.1rem',
                                            background: '#F9FAFB',
                                            borderRadius: '12px',
                                            border: '1.5px solid #E5E7EB',
                                            transition: 'all 0.3s ease',
                                            maxWidth: '250px',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#F3F4F6';
                                            e.currentTarget.style.borderColor = '#D1D5DB';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#F9FAFB';
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                        }}
                                    >
                                        <Calendar size={20} color={THEME.primary} strokeWidth={2} />
                                        <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500 }}>{org.founded_year}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Structure Tab */}
                {activeTab === 'structure' && (
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.85rem', letterSpacing: '-0.3px' }}>
                            <div style={{ padding: '0.6rem', background: `${THEME.success}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <GraduationCap size={22} color={THEME.success} strokeWidth={2.5} />
                            </div>
                            Faculties & Departments
                        </h3>

                        {org.faculties.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                                <GraduationCap size={48} color="#D1D5DB" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
                                <p style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, marginBottom: '0.5rem' }}>No faculties found</p>
                                <p style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>This organization has not created any faculties yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {org.faculties.map((faculty) => (
                                    <div
                                        key={faculty.id}
                                        style={{
                                            border: '1.5px solid #E5E7EB',
                                            borderRadius: '14px',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {/* Faculty Header (Accordion Toggle) */}
                                        <button
                                            onClick={() => setExpandedFaculty(expandedFaculty === faculty.id ? null : faculty.id)}
                                            style={{
                                                width: '100%',
                                                padding: '1.25rem 1.5rem',
                                                background: expandedFaculty === faculty.id ? `${THEME.primary}08` : '#FAFBFC',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                transition: 'all 0.3s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = `${THEME.primary}10`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = expandedFaculty === faculty.id ? `${THEME.primary}08` : '#FAFBFC';
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '10px',
                                                    background: `linear-gradient(135deg, ${THEME.primary}20, ${THEME.primary}10)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <GraduationCap size={20} color={THEME.primary} />
                                                </div>
                                                <div style={{ textAlign: 'left' }}>
                                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0a0e27' }}>{faculty.name}</p>
                                                    <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '0.85rem', color: '#6B7280', fontWeight: 500 }}>
                                                        {faculty.departments.length} department{faculty.departments.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    paddingLeft: '0.7rem',
                                                    paddingRight: '0.7rem',
                                                    paddingTop: '0.35rem',
                                                    paddingBottom: '0.35rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    border: `1.5px solid ${faculty.is_active ? THEME.success : THEME.secondary}40`,
                                                    backgroundColor: faculty.is_active ? `${THEME.success}15` : `${THEME.secondary}15`,
                                                    color: faculty.is_active ? THEME.success : THEME.secondary,
                                                }}>
                                                    {faculty.is_active ? 'Active' : 'Inactive'}
                                                </div>
                                                <div style={{
                                                    transform: expandedFaculty === faculty.id ? 'rotate(90deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.3s ease',
                                                    color: '#6B7280',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}>
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: 'block' }}>
                                                        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </button>

                                        {/* Departments List (Expanded) */}
                                        {expandedFaculty === faculty.id && (
                                            <div style={{ borderTop: '1.5px solid #E5E7EB', padding: '1.25rem 1.5rem', background: '#FFFFFF' }}>
                                                {faculty.departments.length === 0 ? (
                                                    <p style={{ margin: 0, padding: '1rem 0', color: '#6B7280', fontSize: '0.92rem', fontWeight: 500, textAlign: 'center' }}>
                                                        No departments in this faculty.
                                                    </p>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {faculty.departments.map((dept) => (
                                                            <div
                                                                key={dept.id}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    padding: '0.9rem 1.1rem',
                                                                    background: '#F9FAFB',
                                                                    borderRadius: '10px',
                                                                    border: '1.5px solid #E5E7EB',
                                                                    transition: 'all 0.3s ease',
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = '#F3F4F6';
                                                                    e.currentTarget.style.borderColor = '#D1D5DB';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = '#F9FAFB';
                                                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                    <div style={{
                                                                        width: '8px',
                                                                        height: '8px',
                                                                        borderRadius: '50%',
                                                                        background: dept.is_active ? THEME.success : THEME.secondary,
                                                                        flexShrink: 0,
                                                                    }} />
                                                                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0a0e27' }}>{dept.name}</p>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                    <span style={{
                                                                        fontSize: '0.82rem',
                                                                        fontWeight: 600,
                                                                        color: '#6B7280',
                                                                        background: '#F3F4F6',
                                                                        padding: '0.3rem 0.7rem',
                                                                        borderRadius: '6px',
                                                                        border: '1px solid #E5E7EB',
                                                                    }}>
                                                                        {dept.class_sets_count} class set{dept.class_sets_count !== 1 ? 's' : ''}
                                                                    </span>
                                                                    <span style={{
                                                                        fontSize: '0.78rem',
                                                                        fontWeight: 700,
                                                                        color: dept.is_active ? THEME.success : THEME.secondary,
                                                                    }}>
                                                                        {dept.is_active ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Staff Tab */}
                {activeTab === 'staff' && (
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.85rem', letterSpacing: '-0.3px' }}>
                            <div style={{ padding: '0.6rem', background: '#E7F1FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={22} color={THEME.primary} strokeWidth={2.5} />
                            </div>
                            Staff Members
                        </h3>

                        {org.staff.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                                <Users size={48} color="#D1D5DB" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
                                <p style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, marginBottom: '0.5rem' }}>No staff members</p>
                                <p style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>This organization has no staff accounts yet.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                                    <thead>
                                        <tr>
                                            {['Username', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map((header) => (
                                                <th
                                                    key={header}
                                                    style={{
                                                        padding: '0.9rem 1.1rem',
                                                        textAlign: 'left',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700,
                                                        color: '#6B7280',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        borderBottom: '2px solid #E5E7EB',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {org.staff.map((member) => (
                                            <tr
                                                key={member.id}
                                                style={{ transition: 'all 0.2s ease' }}
                                                onMouseEnter={(e) => {
                                                    (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB';
                                                }}
                                                onMouseLeave={(e) => {
                                                    (e.currentTarget as HTMLTableRowElement).style.background = 'transparent';
                                                }}
                                            >
                                                <td style={{ padding: '1rem 1.1rem', fontSize: '0.95rem', fontWeight: 600, color: '#0a0e27', borderBottom: '1px solid #F3F4F6', whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '10px',
                                                            background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                                                            color: '#FFFFFF',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 700,
                                                            fontSize: '0.85rem',
                                                            flexShrink: 0,
                                                        }}>
                                                            {member.display_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0a0e27' }}>{member.display_name}</p>
                                                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#6B7280', fontWeight: 500 }}>@{member.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem 1.1rem', fontSize: '0.92rem', fontWeight: 500, color: '#374151', borderBottom: '1px solid #F3F4F6', whiteSpace: 'nowrap' }}>
                                                    {member.email}
                                                </td>
                                                <td style={{ padding: '1rem 1.1rem', borderBottom: '1px solid #F3F4F6', whiteSpace: 'nowrap' }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        paddingLeft: '0.7rem',
                                                        paddingRight: '0.7rem',
                                                        paddingTop: '0.35rem',
                                                        paddingBottom: '0.35rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 700,
                                                        border: `1.5px solid ${THEME.primary}30`,
                                                        backgroundColor: `${THEME.primary}10`,
                                                        color: THEME.primary,
                                                    }}>
                                                        {member.role_name}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 1.1rem', borderBottom: '1px solid #F3F4F6', whiteSpace: 'nowrap' }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        paddingLeft: '0.7rem',
                                                        paddingRight: '0.7rem',
                                                        paddingTop: '0.35rem',
                                                        paddingBottom: '0.35rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 700,
                                                        border: `1.5px solid ${member.is_active ? THEME.success : THEME.secondary}40`,
                                                        backgroundColor: member.is_active ? `${THEME.success}15` : `${THEME.secondary}15`,
                                                        color: member.is_active ? THEME.success : THEME.secondary,
                                                    }}>
                                                        <div style={{
                                                            width: '6px',
                                                            height: '6px',
                                                            borderRadius: '50%',
                                                            background: member.is_active ? THEME.success : THEME.secondary,
                                                        }} />
                                                        {member.is_active ? 'Active' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 1.1rem', fontSize: '0.9rem', fontWeight: 500, color: '#6B7280', borderBottom: '1px solid #F3F4F6', whiteSpace: 'nowrap' }}>
                                                    {member.last_login_at
                                                        ? new Date(member.last_login_at).toLocaleDateString() + ' ' + new Date(member.last_login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : 'Never'
                                                    }
                                                </td>
                                                <td style={{ padding: '1rem 1.1rem', borderBottom: '1px solid #F3F4F6', whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => handleDisableStaff(member.id)}
                                                            disabled={processing}
                                                            title={member.is_active ? 'Disable staff' : 'Toggle staff status'}
                                                            style={{
                                                                padding: '0.5rem',
                                                                background: '#FFFFFF',
                                                                border: `1.5px solid ${THEME.danger}30`,
                                                                borderRadius: '8px',
                                                                cursor: processing ? 'not-allowed' : 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: THEME.danger,
                                                                transition: 'all 0.3s ease',
                                                                opacity: processing ? 0.6 : 1,
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!processing) {
                                                                    e.currentTarget.style.background = `${THEME.danger}15`;
                                                                    e.currentTarget.style.borderColor = THEME.danger;
                                                                    e.currentTarget.style.boxShadow = `0 4px 8px ${THEME.danger}20`;
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = '#FFFFFF';
                                                                e.currentTarget.style.borderColor = `${THEME.danger}30`;
                                                                e.currentTarget.style.boxShadow = 'none';
                                                            }}
                                                        >
                                                            <Ban size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleResetStaffPassword(member.id)}
                                                            disabled={processing}
                                                            title="Reset password"
                                                            style={{
                                                                padding: '0.5rem',
                                                                background: '#FFFFFF',
                                                                border: `1.5px solid ${THEME.primary}30`,
                                                                borderRadius: '8px',
                                                                cursor: processing ? 'not-allowed' : 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: THEME.primary,
                                                                transition: 'all 0.3s ease',
                                                                opacity: processing ? 0.6 : 1,
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!processing) {
                                                                    e.currentTarget.style.background = `${THEME.primary}15`;
                                                                    e.currentTarget.style.borderColor = THEME.primary;
                                                                    e.currentTarget.style.boxShadow = `0 4px 8px ${THEME.primary}20`;
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = '#FFFFFF';
                                                                e.currentTarget.style.borderColor = `${THEME.primary}30`;
                                                                e.currentTarget.style.boxShadow = 'none';
                                                            }}
                                                        >
                                                            <Key size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
