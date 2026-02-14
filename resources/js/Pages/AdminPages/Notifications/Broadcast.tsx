import { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BellRing,
    Send,
    Zap,
    Clock,
    Info,
    AlertTriangle,
    CheckCircle,
    Users,
} from 'lucide-react';

interface SentNotification {
    id: number;
    title: string;
    message: string;
    type: string;
    target: string;
    sent_at: string;
    sent_at_formatted: string;
    recipients_count: number;
}

interface Props {
    history: SentNotification[];
    statistics: {
        total_sent: number;
        sent_today: number;
    };
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
};

export default function Broadcast({ history, statistics }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info');
    const [target, setTarget] = useState('all_users');
    const [sending, setSending] = useState(false);

    const handleSendBroadcast = useCallback(() => {
        if (!title.trim() || !message.trim()) return;
        setSending(true);
        router.post(route('admin.notifications.sendBroadcast'), {
            title: title.trim(),
            message: message.trim(),
            type,
            target,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setSending(false);
                setTitle('');
                setMessage('');
                setType('info');
                setTarget('all_users');
            },
        });
    }, [title, message, type, target]);

    const getTypeBadge = (notifType: string) => {
        const config = typeBadgeConfig[notifType] || typeBadgeConfig.info;
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
                <span>{notifType}</span>
            </div>
        );
    };

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
                            <BellRing size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                System Notifications
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
                            Broadcast notifications to your users and manage communication history
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Real-time notification broadcasting system
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ marginBottom: '3rem' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '1.75rem',
                        }}
                    >
                        {[
                            { label: 'Total Sent', value: statistics.total_sent, icon: Send, color: THEME.primary, lightColor: '#e7f1ff' },
                            { label: 'Sent Today', value: statistics.sent_today, icon: Clock, color: THEME.success, lightColor: '#e8f5e9' },
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
                </div>

                {/* Compose Notification */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        padding: '2rem',
                        marginBottom: '3rem',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Send size={20} color={THEME.primary} />
                        Compose Broadcast
                    </h2>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {/* Title */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter notification title..."
                                style={{
                                    width: '100%',
                                    padding: '0.85rem 1.25rem',
                                    border: '2.5px solid #e9ecef',
                                    borderRadius: '14px',
                                    fontSize: '0.98rem',
                                    color: '#0a0e27',
                                    background: '#FFFFFF',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = '#e9ecef'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter notification message..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.85rem 1.25rem',
                                    border: '2.5px solid #e9ecef',
                                    borderRadius: '14px',
                                    fontSize: '0.98rem',
                                    color: '#0a0e27',
                                    background: '#FFFFFF',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    resize: 'vertical',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = '#e9ecef'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>

                        {/* Type and Target */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Type
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '10px',
                                        fontSize: '0.96rem',
                                        color: '#0a0e27',
                                        cursor: 'pointer',
                                        backgroundColor: '#FFFFFF',
                                        fontWeight: 600,
                                    }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <option value="info">Info</option>
                                    <option value="warning">Warning</option>
                                    <option value="success">Success</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Target Audience
                                </label>
                                <select
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '10px',
                                        fontSize: '0.96rem',
                                        color: '#0a0e27',
                                        cursor: 'pointer',
                                        backgroundColor: '#FFFFFF',
                                        fontWeight: 600,
                                    }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <option value="all_users">All Users</option>
                                    <option value="active_users">Active Users</option>
                                </select>
                            </div>
                        </div>

                        {/* Send Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleSendBroadcast}
                                disabled={sending || !title.trim() || !message.trim()}
                                style={{
                                    paddingLeft: '1.85rem',
                                    paddingRight: '1.85rem',
                                    paddingTop: '0.8rem',
                                    paddingBottom: '0.8rem',
                                    background: sending || !title.trim() || !message.trim()
                                        ? '#e9ecef'
                                        : `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                    color: sending || !title.trim() || !message.trim() ? '#adb5bd' : '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontWeight: 700,
                                    cursor: sending || !title.trim() || !message.trim() ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontSize: '0.96rem',
                                    letterSpacing: '0.3px',
                                    boxShadow: sending || !title.trim() || !message.trim()
                                        ? 'none'
                                        : '0 4px 12px rgba(13, 110, 253, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (!sending && title.trim() && message.trim()) {
                                        e.currentTarget.style.boxShadow = `0 16px 32px ${THEME.primary}40`;
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!sending && title.trim() && message.trim()) {
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.25)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                <Send size={18} strokeWidth={2.5} />
                                {sending ? 'Sending...' : 'Send Broadcast'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Broadcast History */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '2px solid #E5E7EB' }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Clock size={20} color={THEME.secondary} />
                            Broadcast History
                        </h2>
                    </div>

                    {history.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        {['Title', 'Type', 'Target', 'Recipients', 'Sent Date'].map((h) => (
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
                                    {history.map((notification) => (
                                        <tr
                                            key={notification.id}
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
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                                        {notification.title}
                                                    </p>
                                                    <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
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
                                                        fontSize: '0.82rem',
                                                        fontWeight: 700,
                                                        backgroundColor: '#f0f7ff',
                                                        color: THEME.primary,
                                                        border: '1.5px solid #cfe2ff',
                                                        textTransform: 'capitalize',
                                                    }}
                                                >
                                                    <Users size={13} />
                                                    {notification.target.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: THEME.primary }}>
                                                    {notification.recipients_count}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {notification.sent_at_formatted}
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
                                <BellRing size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No broadcasts sent yet
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                Compose your first broadcast notification above
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
