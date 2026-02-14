import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    GitBranch,
    Users,
    Eye,
    EyeOff,
    GitMerge,
    Shield,
    MessageSquare,
    Calendar,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Clock,
    Mail,
    User,
} from 'lucide-react';

interface TreeMember {
    id: number;
    full_name: string;
    username: string;
    role: string;
    joined_at: string;
}

interface TreeAdmin {
    id: number;
    full_name: string;
    username: string;
}

interface TreeDetail {
    id: number;
    name: string;
    description: string | null;
    is_public: boolean;
    type: string;
    is_merged: boolean;
    root_user: { id: number; full_name: string; username: string; email: string } | null;
    members: TreeMember[];
    admins: TreeAdmin[];
    chat_stats: { message_count: number; last_activity: string | null };
    created_at: string;
}

interface Props {
    tree: TreeDetail;
}

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

export default function Show({ tree }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleToggleVisibility = () => {
        router.post(route('admin.familyTrees.toggleVisibility', tree.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        router.delete(route('admin.familyTrees.destroy', tree.id), {
            onSuccess: () => {
                setShowDeleteConfirm(false);
            },
        });
    };

    return (
        <AdminLayout>
            <div>
                {/* Header with Back Button */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <button
                        onClick={() => router.get(route('admin.familyTrees.index'))}
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
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>Family Tree Details</h1>
                        <p style={{ fontSize: '0.98rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>View and manage family tree information</p>
                    </div>
                </div>

                {/* Tree Info Card */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flex: 1 }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                                    color: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 24px rgba(0, 82, 232, 0.3)',
                                }}
                            >
                                <GitBranch size={40} strokeWidth={1.5} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>
                                    {tree.name}
                                </h2>
                                {tree.description && (
                                    <p style={{ fontSize: '1rem', color: '#6B7280', margin: 0, marginTop: '0.5rem', fontWeight: 500, lineHeight: 1.6 }}>
                                        {tree.description}
                                    </p>
                                )}
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
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
                                            border: `1.5px solid ${tree.is_public ? '#b7eb8f' : '#ffe58f'}`,
                                            backgroundColor: tree.is_public ? '#f6ffed' : '#fffbe6',
                                            color: tree.is_public ? THEME.success : '#d48806',
                                        }}
                                    >
                                        {tree.is_public ? <Eye size={14} /> : <EyeOff size={14} />}
                                        {tree.is_public ? 'Public' : 'Private'}
                                    </span>
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
                                            border: '1.5px solid #cfe2ff',
                                            backgroundColor: '#e7f1ff',
                                            color: THEME.primary,
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {tree.type}
                                    </span>
                                    {tree.is_merged && (
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
                                                border: '1.5px solid #b3e5fc',
                                                backgroundColor: '#e0f7fa',
                                                color: THEME.info,
                                            }}
                                        >
                                            <GitMerge size={14} />
                                            Merged
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', padding: '0.75rem 1.25rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</p>
                            <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginTop: '0.4rem' }}>
                                {new Date(tree.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
                    {[
                        { label: 'Total Members', value: tree.members.length.toString(), icon: Users, color: THEME.primary },
                        { label: 'Tree Admins', value: tree.admins.length.toString(), icon: Shield, color: THEME.success },
                        { label: 'Chat Messages', value: tree.chat_stats.message_count.toString(), icon: MessageSquare, color: THEME.info },
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

                {/* Root User Card */}
                {tree.root_user && (
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.85rem', letterSpacing: '-0.3px' }}>
                            <div style={{ padding: '0.6rem', background: '#E7F1FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={22} color={THEME.primary} strokeWidth={2.5} />
                            </div>
                            Root User
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            {[
                                { label: 'Full Name', value: tree.root_user.full_name, icon: User },
                                { label: 'Username', value: `@${tree.root_user.username}`, icon: User },
                                { label: 'Email', value: tree.root_user.email, icon: Mail },
                            ].map((field, idx) => {
                                const Icon = field.icon;
                                return (
                                    <div key={idx}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{field.label}</p>
                                        <div
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB', transition: 'all 0.3s ease' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#F3F4F6';
                                                e.currentTarget.style.borderColor = '#D1D5DB';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = '#F9FAFB';
                                                e.currentTarget.style.borderColor = '#E5E7EB';
                                            }}
                                        >
                                            <Icon size={20} color={THEME.primary} strokeWidth={2} />
                                            <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500 }}>{field.value}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Members Table */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        marginBottom: '2.5rem',
                    }}
                >
                    <div style={{ padding: '1.5rem 1.75rem', borderBottom: '2px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ padding: '0.5rem', background: '#E7F1FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={20} color={THEME.primary} strokeWidth={2.5} />
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.3px' }}>
                            Members ({tree.members.length})
                        </h3>
                    </div>

                    {tree.members.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tree.members.map((member) => (
                                        <tr
                                            key={member.id}
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
                                            <td style={{ padding: '1.2rem 1.25rem' }}>
                                                <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>{member.full_name}</p>
                                            </td>
                                            <td style={{ padding: '1.2rem 1.25rem' }}>
                                                <p style={{ fontSize: '0.92rem', color: '#6B7280', margin: 0, fontWeight: 500 }}>@{member.username}</p>
                                            </td>
                                            <td style={{ padding: '1.2rem 1.25rem' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        paddingLeft: '0.6rem',
                                                        paddingRight: '0.6rem',
                                                        paddingTop: '0.45rem',
                                                        paddingBottom: '0.45rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 700,
                                                        backgroundColor: member.role === 'admin' ? '#e7f1ff' : '#f3f4f6',
                                                        color: member.role === 'admin' ? THEME.primary : '#6c757d',
                                                        border: `1.5px solid ${member.role === 'admin' ? '#cfe2ff' : '#e5e7eb'}`,
                                                        textTransform: 'capitalize',
                                                    }}
                                                >
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1.25rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {member.joined_at}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                            <div style={{ width: '60px', height: '60px', background: '#F3F4F6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Users size={30} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>No members found</p>
                            <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>This tree does not have any members yet</p>
                        </div>
                    )}
                </div>

                {/* Admins List */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.85rem', letterSpacing: '-0.3px' }}>
                        <div style={{ padding: '0.6rem', background: '#e8f5e9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={22} color={THEME.success} strokeWidth={2.5} />
                        </div>
                        Tree Admins ({tree.admins.length})
                    </h3>

                    {tree.admins.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {tree.admins.map((admin) => (
                                <div
                                    key={admin.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem 1.25rem',
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
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #198754 0%, #157347 100%)',
                                            color: '#FFFFFF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {admin.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>{admin.full_name}</p>
                                        <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.2rem', fontWeight: 500 }}>@{admin.username}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.95rem', color: '#888', margin: 0, fontStyle: 'italic' }}>No admins assigned to this tree</p>
                    )}
                </div>

                {/* Chat Statistics Card */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.85rem', letterSpacing: '-0.3px' }}>
                        <div style={{ padding: '0.6rem', background: '#e0f7fa', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare size={22} color={THEME.info} strokeWidth={2.5} />
                        </div>
                        Chat Statistics
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Messages</p>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB', transition: 'all 0.3s ease' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#F3F4F6';
                                    e.currentTarget.style.borderColor = '#D1D5DB';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#F9FAFB';
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                }}
                            >
                                <MessageSquare size={20} color={THEME.info} strokeWidth={2} />
                                <p style={{ margin: 0, color: '#0a0e27', fontSize: '1.1rem', fontWeight: 700 }}>{tree.chat_stats.message_count}</p>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Activity</p>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB', transition: 'all 0.3s ease' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#F3F4F6';
                                    e.currentTarget.style.borderColor = '#D1D5DB';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#F9FAFB';
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                }}
                            >
                                <Clock size={20} color={THEME.info} strokeWidth={2} />
                                <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500 }}>
                                    {tree.chat_stats.last_activity ? new Date(tree.chat_stats.last_activity).toLocaleString() : 'No activity yet'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleToggleVisibility}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            paddingLeft: '1.75rem',
                            paddingRight: '1.75rem',
                            paddingTop: '0.85rem',
                            paddingBottom: '0.85rem',
                            background: tree.is_public
                                ? `linear-gradient(135deg, ${THEME.warning} 0%, #e0a800 100%)`
                                : `linear-gradient(135deg, ${THEME.success} 0%, #157347 100%)`,
                            color: tree.is_public ? '#0a0e27' : '#FFFFFF',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: tree.is_public ? `0 4px 12px ${THEME.warning}40` : `0 4px 12px ${THEME.success}40`,
                            fontSize: '0.96rem',
                            letterSpacing: '0.3px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = tree.is_public ? `0 12px 28px ${THEME.warning}50` : `0 12px 28px ${THEME.success}50`;
                            e.currentTarget.style.transform = 'translateY(-3px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = tree.is_public ? `0 4px 12px ${THEME.warning}40` : `0 4px 12px ${THEME.success}40`;
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {tree.is_public ? <EyeOff size={18} /> : <Eye size={18} />}
                        {tree.is_public ? 'Make Private' : 'Make Public'}
                    </button>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            paddingLeft: '1.75rem',
                            paddingRight: '1.75rem',
                            paddingTop: '0.85rem',
                            paddingBottom: '0.85rem',
                            background: '#FFFFFF',
                            color: THEME.danger,
                            border: `2px solid ${THEME.danger}30`,
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontSize: '0.96rem',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            letterSpacing: '0.3px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${THEME.danger}15`;
                            e.currentTarget.style.borderColor = `${THEME.danger}60`;
                            e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.danger}25`;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#FFFFFF';
                            e.currentTarget.style.borderColor = `${THEME.danger}30`;
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Trash2 size={18} />
                        Delete Tree
                    </button>
                </div>

                {/* Delete Confirmation Dialog */}
                {showDeleteConfirm && (
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
                            zIndex: 1000,
                        }}
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <div
                            style={{
                                background: '#FFFFFF',
                                borderRadius: '20px',
                                padding: '2.5rem',
                                maxWidth: '480px',
                                width: '90%',
                                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        background: '#ffebee',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1.25rem',
                                    }}
                                >
                                    <Trash2 size={32} color={THEME.danger} strokeWidth={1.5} />
                                </div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '0.75rem' }}>Delete Family Tree</h3>
                                <p style={{ fontSize: '0.96rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                                    Are you sure you want to delete <strong>{tree.name}</strong>? This action cannot be undone and will remove all associated data.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    style={{
                                        paddingLeft: '1.75rem',
                                        paddingRight: '1.75rem',
                                        paddingTop: '0.85rem',
                                        paddingBottom: '0.85rem',
                                        background: '#F3F4F6',
                                        color: '#374151',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        fontSize: '0.96rem',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#E5E7EB';
                                        e.currentTarget.style.borderColor = '#D1D5DB';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#F3F4F6';
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    style={{
                                        paddingLeft: '1.75rem',
                                        paddingRight: '1.75rem',
                                        paddingTop: '0.85rem',
                                        paddingBottom: '0.85rem',
                                        background: `linear-gradient(135deg, ${THEME.danger} 0%, #b02a37 100%)`,
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: `0 4px 12px ${THEME.danger}40`,
                                        fontSize: '0.96rem',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = `0 12px 28px ${THEME.danger}50`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.danger}40`;
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    Delete Tree
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
