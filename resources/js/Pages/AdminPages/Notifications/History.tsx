import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Clock,
    BellRing,
    Zap,
    Info,
    AlertTriangle,
    CheckCircle,
    Users,
    Send,
    ChevronLeft,
    ChevronRight,
    Eye,
    Mail,
} from 'lucide-react';

interface NotificationItem {
    title: string;
    message: string;
    type: string;
    recipients_count: number;
    read_count: number;
    created_at: string;
    created_at_formatted: string;
}

interface PaginatedNotifications {
    data: NotificationItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface Props {
    notifications: PaginatedNotifications;
    perPage: number;
}

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

const typeBadgeConfig: Record<string, { bg: string; border: string; text: string; icon: any }> = {
    info: { bg: '#e0f7fa', border: THEME.info, text: '#0c5460', icon: Info },
    warning: { bg: '#fff8e1', border: THEME.warning, text: '#856404', icon: AlertTriangle },
    success: { bg: '#e8f5e9', border: THEME.success, text: '#155724', icon: CheckCircle },
    admin_broadcast: { bg: '#e7f1ff', border: THEME.primary, text: '#084298', icon: Send },
};

const generatePageNumbers = (currentPage: number, lastPage: number): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (lastPage <= 7) {
        for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push('...');
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(lastPage - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (currentPage < lastPage - 2) pages.push('...');
        pages.push(lastPage);
    }
    return pages;
};

export default function History({ notifications, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const getTypeBadge = (notifType: string) => {
        const config = typeBadgeConfig[notifType] || typeBadgeConfig.admin_broadcast;
        const Icon = config.icon;
        return (
            <div
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    paddingLeft: '0.75rem',
                    paddingRight: '0.75rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: `1.5px solid ${config.border}`,
                    backgroundColor: config.bg,
                    color: config.text,
                    textTransform: 'capitalize' as const,
                }}
            >
                <Icon size={14} />
                <span>{notifType.replace(/_/g, ' ')}</span>
            </div>
        );
    };

    const getReadRate = (readCount: number, total: number): number => {
        if (total === 0) return 0;
        return Math.round((readCount / total) * 100);
    };

    const goToPage = (page: number) => {
        router.get(route('admin.notifications.history'), { page, per_page: perPage }, { preserveScroll: true });
    };

    const statCards = [
        { label: 'Total Broadcasts', value: notifications.total, icon: Send, color: THEME.primary, lightColor: '#e7f1ff' },
        { label: 'Current Page', value: `${notifications.current_page} / ${notifications.last_page}`, icon: Clock, color: THEME.success, lightColor: '#e8f5e9' },
    ];

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

                {/* Header */}
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
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '50%' }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <Clock size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Notification History
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
                            View all broadcast notifications sent to users with delivery and read statistics
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Complete broadcast delivery history
                            </span>
                        </div>
                    </div>
                </div>

                {/* Back to Broadcast + Stats */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <button
                        onClick={() => router.get(route('admin.notifications.broadcast'))}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.7rem 1.25rem',
                            background: '#FFFFFF',
                            color: THEME.primary,
                            border: `2px solid ${THEME.primary}30`,
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = THEME.primary;
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.borderColor = THEME.primary;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.primary}30`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#FFFFFF';
                            e.currentTarget.style.color = THEME.primary;
                            e.currentTarget.style.borderColor = `${THEME.primary}30`;
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <BellRing size={16} />
                        Back to Broadcast
                    </button>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem', marginBottom: '3rem' }}>
                    {statCards.map((stat, idx) => {
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
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: stat.lightColor, borderRadius: '50%', opacity: 0.3, transform: 'translate(30%, -30%)' }} />
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {stat.label}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                        <p style={{ fontSize: '2.25rem', fontWeight: 800, color: stat.color, margin: 0, lineHeight: 1 }}>
                                            {stat.value}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '16px', backgroundColor: stat.lightColor }}>
                                            <Icon size={36} color={stat.color} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* History Table */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '2px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Mail size={20} color={THEME.primary} />
                            Sent Notifications
                        </h2>
                        {notifications.total > 0 && (
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6c757d' }}>
                                Showing {notifications.from} to {notifications.to} of {notifications.total} results
                            </span>
                        )}
                    </div>

                    {notifications.data.length > 0 ? (
                        <>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                            {['Title', 'Type', 'Recipients', 'Read Rate', 'Sent'].map((h) => (
                                                <th
                                                    key={h}
                                                    style={{
                                                        padding: '1.25rem',
                                                        textAlign: 'left',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 800,
                                                        color: '#374151',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                    }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notifications.data.map((notification, idx) => {
                                            const readRate = getReadRate(notification.read_count, notification.recipients_count);
                                            const rateColor = readRate >= 70 ? THEME.success : readRate >= 40 ? THEME.warning : THEME.danger;

                                            return (
                                                <tr
                                                    key={idx}
                                                    style={{
                                                        borderBottom: '1.5px solid #E5E7EB',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        background: '#FFFFFF',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#F9FAFB';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#FFFFFF';
                                                    }}
                                                >
                                                    <td style={{ padding: '1.2rem 1rem', maxWidth: '350px' }}>
                                                        <div>
                                                            <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                                                {notification.title}
                                                            </p>
                                                            <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>
                                                                {notification.message}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1rem' }}>
                                                        {getTypeBadge(notification.type)}
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1rem' }}>
                                                        <span
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.4rem',
                                                                paddingLeft: '0.75rem',
                                                                paddingRight: '0.75rem',
                                                                paddingTop: '0.45rem',
                                                                paddingBottom: '0.45rem',
                                                                borderRadius: '8px',
                                                                fontSize: '0.88rem',
                                                                fontWeight: 700,
                                                                backgroundColor: '#f0f7ff',
                                                                color: THEME.primary,
                                                                border: '1.5px solid #cfe2ff',
                                                            }}
                                                        >
                                                            <Users size={14} />
                                                            {notification.recipients_count.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <div style={{ flex: 1, maxWidth: '100px' }}>
                                                                <div style={{ height: '8px', background: '#F0F2F7', borderRadius: '4px', overflow: 'hidden' }}>
                                                                    <div
                                                                        style={{
                                                                            height: '100%',
                                                                            width: `${readRate}%`,
                                                                            background: `linear-gradient(90deg, ${rateColor} 0%, ${rateColor}cc 100%)`,
                                                                            borderRadius: '4px',
                                                                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: rateColor, minWidth: '40px' }}>
                                                                {readRate}%
                                                            </span>
                                                            <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 500 }}>
                                                                ({notification.read_count}/{notification.recipients_count})
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            <Clock size={14} color="#9CA3AF" />
                                                            <span style={{ fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                                {notification.created_at_formatted}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {notifications.last_page > 1 && (
                                <div style={{ padding: '1.5rem 2rem', borderTop: '2px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => goToPage(notifications.current_page - 1)}
                                        disabled={notifications.current_page <= 1}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            padding: '0.6rem 1rem',
                                            background: notifications.current_page <= 1 ? '#F3F4F6' : '#FFFFFF',
                                            color: notifications.current_page <= 1 ? '#D1D5DB' : THEME.primary,
                                            border: `2px solid ${notifications.current_page <= 1 ? '#E5E7EB' : '#cfe2ff'}`,
                                            borderRadius: '10px',
                                            fontSize: '0.87rem',
                                            fontWeight: 700,
                                            cursor: notifications.current_page <= 1 ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (notifications.current_page > 1) {
                                                e.currentTarget.style.background = THEME.primary;
                                                e.currentTarget.style.color = '#FFFFFF';
                                                e.currentTarget.style.borderColor = THEME.primary;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (notifications.current_page > 1) {
                                                e.currentTarget.style.background = '#FFFFFF';
                                                e.currentTarget.style.color = THEME.primary;
                                                e.currentTarget.style.borderColor = '#cfe2ff';
                                            }
                                        }}
                                    >
                                        <ChevronLeft size={16} />
                                        Prev
                                    </button>

                                    {generatePageNumbers(notifications.current_page, notifications.last_page).map((pg, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => typeof pg === 'number' ? goToPage(pg) : undefined}
                                            disabled={typeof pg !== 'number'}
                                            style={{
                                                padding: '0.6rem 0.9rem',
                                                background: pg === notifications.current_page
                                                    ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`
                                                    : '#FFFFFF',
                                                color: pg === notifications.current_page ? '#FFFFFF' : typeof pg === 'number' ? '#374151' : '#9CA3AF',
                                                border: `2px solid ${pg === notifications.current_page ? THEME.primary : '#E5E7EB'}`,
                                                borderRadius: '10px',
                                                fontSize: '0.87rem',
                                                fontWeight: 700,
                                                cursor: typeof pg === 'number' && pg !== notifications.current_page ? 'pointer' : 'default',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                minWidth: '40px',
                                                textAlign: 'center' as const,
                                                boxShadow: pg === notifications.current_page ? `0 4px 12px ${THEME.primary}30` : 'none',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (typeof pg === 'number' && pg !== notifications.current_page) {
                                                    e.currentTarget.style.borderColor = THEME.primary;
                                                    e.currentTarget.style.color = THEME.primary;
                                                    e.currentTarget.style.background = '#f0f7ff';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (typeof pg === 'number' && pg !== notifications.current_page) {
                                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                                    e.currentTarget.style.color = '#374151';
                                                    e.currentTarget.style.background = '#FFFFFF';
                                                }
                                            }}
                                        >
                                            {pg}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => goToPage(notifications.current_page + 1)}
                                        disabled={notifications.current_page >= notifications.last_page}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            padding: '0.6rem 1rem',
                                            background: notifications.current_page >= notifications.last_page ? '#F3F4F6' : '#FFFFFF',
                                            color: notifications.current_page >= notifications.last_page ? '#D1D5DB' : THEME.primary,
                                            border: `2px solid ${notifications.current_page >= notifications.last_page ? '#E5E7EB' : '#cfe2ff'}`,
                                            borderRadius: '10px',
                                            fontSize: '0.87rem',
                                            fontWeight: 700,
                                            cursor: notifications.current_page >= notifications.last_page ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (notifications.current_page < notifications.last_page) {
                                                e.currentTarget.style.background = THEME.primary;
                                                e.currentTarget.style.color = '#FFFFFF';
                                                e.currentTarget.style.borderColor = THEME.primary;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (notifications.current_page < notifications.last_page) {
                                                e.currentTarget.style.background = '#FFFFFF';
                                                e.currentTarget.style.color = THEME.primary;
                                                e.currentTarget.style.borderColor = '#cfe2ff';
                                            }
                                        }}
                                    >
                                        Next
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
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
                                <BellRing size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No notification history
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                Broadcast notifications will appear here once sent
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
