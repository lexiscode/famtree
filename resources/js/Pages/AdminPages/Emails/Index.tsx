import { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Mail,
    Send,
    Zap,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    AlertTriangle,
} from 'lucide-react';

interface EmailLog {
    id: number;
    recipient: string;
    type: string;
    status: string;
    error: string | null;
    sent_at: string;
    sent_at_formatted: string;
}

interface PaginatedData {
    data: EmailLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total_sent: number;
    failed: number;
    success_rate: number;
}

interface Props {
    emails: PaginatedData;
    statistics: Statistics;
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

export default function Index({ emails, statistics, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    const handleSendTest = useCallback(() => {
        if (!testEmail.trim()) return;
        setSendingTest(true);
        router.post(route('admin.emails.test'), {
            email: testEmail.trim(),
        }, {
            preserveScroll: true,
            onFinish: () => {
                setSendingTest(false);
                setTestEmail('');
            },
        });
    }, [testEmail]);

    const handlePageChange = useCallback((page: number) => {
        router.get(route('admin.emails.index'), { page, per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = emails.current_page;
        const last = emails.last_page;

        let start = Math.max(1, current - 2);
        let end = Math.min(last, current + 2);

        if (current <= 3) {
            end = Math.min(last, 5);
        }
        if (current >= last - 2) {
            start = Math.max(1, last - 4);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const getStatusBadge = (status: string) => {
        const isSent = status === 'sent';
        const Icon = isSent ? CheckCircle : XCircle;
        const color = isSent ? THEME.success : THEME.danger;
        const bg = isSent ? '#e8f5e9' : '#ffebee';
        const border = isSent ? THEME.success : THEME.danger;
        const text = isSent ? '#155724' : '#721c24';

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
                    border: `1.5px solid ${border}`,
                    backgroundColor: bg,
                    color: text,
                    textTransform: 'capitalize' as const,
                }}
            >
                <Icon size={14} />
                <span>{status}</span>
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
                            <Mail size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Email Management
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
                            Monitor email delivery, track failures, and send test emails
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Real-time email delivery monitoring
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
                            { label: 'Total Sent', value: statistics.total_sent, icon: Mail, color: THEME.primary, lightColor: '#e7f1ff' },
                            { label: 'Failed', value: statistics.failed, icon: XCircle, color: THEME.danger, lightColor: '#ffebee' },
                            { label: 'Success Rate', value: `${statistics.success_rate}%`, icon: BarChart3, color: THEME.success, lightColor: '#e8f5e9' },
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

                {/* Test Email Section */}
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
                        Send Test Email
                    </h2>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: '1 1 320px', minWidth: '280px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="Enter recipient email address..."
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
                                onKeyPress={(e) => e.key === 'Enter' && handleSendTest()}
                            />
                        </div>

                        <button
                            onClick={handleSendTest}
                            disabled={sendingTest || !testEmail.trim()}
                            style={{
                                paddingLeft: '1.85rem',
                                paddingRight: '1.85rem',
                                paddingTop: '0.8rem',
                                paddingBottom: '0.8rem',
                                background: sendingTest || !testEmail.trim()
                                    ? '#e9ecef'
                                    : `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                color: sendingTest || !testEmail.trim() ? '#adb5bd' : '#FFFFFF',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: 700,
                                cursor: sendingTest || !testEmail.trim() ? 'not-allowed' : 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: '0.96rem',
                                letterSpacing: '0.3px',
                                boxShadow: sendingTest || !testEmail.trim()
                                    ? 'none'
                                    : '0 4px 12px rgba(13, 110, 253, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                            }}
                            onMouseEnter={(e) => {
                                if (!sendingTest && testEmail.trim()) {
                                    e.currentTarget.style.boxShadow = `0 16px 32px ${THEME.primary}40`;
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!sendingTest && testEmail.trim()) {
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.25)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            <Send size={18} strokeWidth={2.5} />
                            {sendingTest ? 'Sending...' : 'Send Test'}
                        </button>
                    </div>
                </div>

                {/* View Failed Emails Link */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => router.get(route('admin.emails.failed'))}
                        style={{
                            paddingLeft: '1.4rem',
                            paddingRight: '1.4rem',
                            paddingTop: '0.8rem',
                            paddingBottom: '0.8rem',
                            background: '#ffebee',
                            color: THEME.danger,
                            border: `2.5px solid #f5c6cb`,
                            borderRadius: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontSize: '0.96rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            letterSpacing: '0.3px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = THEME.danger;
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.borderColor = THEME.danger;
                            e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.danger}35`;
                            e.currentTarget.style.transform = 'translateY(-3px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ffebee';
                            e.currentTarget.style.color = THEME.danger;
                            e.currentTarget.style.borderColor = '#f5c6cb';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <AlertTriangle size={18} strokeWidth={2.5} />
                        View Failed Emails
                    </button>
                </div>

                {/* Email Logs Table */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    {emails.data.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        {['Recipient', 'Type', 'Status', 'Error', 'Date'].map((h) => (
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
                                    {emails.data.map((email) => (
                                        <tr
                                            key={email.id}
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
                                                <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27' }}>
                                                    {email.recipient}
                                                </span>
                                            </td>
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
                                                        textTransform: 'capitalize',
                                                    }}
                                                >
                                                    {email.type.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                {getStatusBadge(email.status)}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', maxWidth: '200px' }}>
                                                {email.error ? (
                                                    <p style={{ fontSize: '0.85rem', color: THEME.danger, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                        {email.error}
                                                    </p>
                                                ) : (
                                                    <span style={{ fontSize: '0.92rem', color: '#9CA3AF', fontWeight: 500 }}>--</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {email.sent_at_formatted}
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
                                <Mail size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No email logs found
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                Email logs will appear here once emails are sent
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {emails.last_page > 1 && (
                    <div
                        style={{
                            marginTop: '2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#FFFFFF',
                            padding: '1.75rem 2rem',
                            borderRadius: '16px',
                            border: '2px solid #E5E7EB',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                            flexWrap: 'wrap',
                            gap: '1rem',
                        }}
                    >
                        <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#4B5563', margin: 0 }}>
                            Showing <span style={{ fontWeight: 800, color: '#0a0e27' }}>{emails.from}</span> to{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{emails.to}</span> of{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{emails.total}</span> results
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(emails.current_page - 1)}
                                disabled={emails.current_page === 1}
                                style={{
                                    paddingLeft: '0.85rem',
                                    paddingRight: '0.85rem',
                                    paddingTop: '0.6rem',
                                    paddingBottom: '0.6rem',
                                    borderRadius: '10px',
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2.5px solid #e9ecef',
                                    cursor: emails.current_page === 1 ? 'not-allowed' : 'pointer',
                                    background: emails.current_page === 1 ? '#f9fafb' : '#f8f9fa',
                                    color: emails.current_page === 1 ? '#adb5bd' : '#0a0e27',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (emails.current_page !== 1) {
                                        e.currentTarget.style.background = '#e9ecef';
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (emails.current_page !== 1) {
                                        e.currentTarget.style.background = '#f8f9fa';
                                        e.currentTarget.style.borderColor = '#e9ecef';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                <ChevronLeft size={16} />
                                Prev
                            </button>

                            {/* Page Numbers */}
                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    style={{
                                        paddingLeft: '0.85rem',
                                        paddingRight: '0.85rem',
                                        paddingTop: '0.6rem',
                                        paddingBottom: '0.6rem',
                                        borderRadius: '10px',
                                        fontSize: '0.92rem',
                                        fontWeight: 700,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: `2.5px solid ${page === emails.current_page ? THEME.primary : '#e9ecef'}`,
                                        cursor: 'pointer',
                                        background: page === emails.current_page ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)` : '#f8f9fa',
                                        color: page === emails.current_page ? '#FFFFFF' : '#0a0e27',
                                        boxShadow: page === emails.current_page ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                        minWidth: '44px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (page !== emails.current_page) {
                                            e.currentTarget.style.background = '#e9ecef';
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (page !== emails.current_page) {
                                            e.currentTarget.style.background = '#f8f9fa';
                                            e.currentTarget.style.borderColor = '#e9ecef';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(emails.current_page + 1)}
                                disabled={emails.current_page === emails.last_page}
                                style={{
                                    paddingLeft: '0.85rem',
                                    paddingRight: '0.85rem',
                                    paddingTop: '0.6rem',
                                    paddingBottom: '0.6rem',
                                    borderRadius: '10px',
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2.5px solid #e9ecef',
                                    cursor: emails.current_page === emails.last_page ? 'not-allowed' : 'pointer',
                                    background: emails.current_page === emails.last_page ? '#f9fafb' : '#f8f9fa',
                                    color: emails.current_page === emails.last_page ? '#adb5bd' : '#0a0e27',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (emails.current_page !== emails.last_page) {
                                        e.currentTarget.style.background = '#e9ecef';
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (emails.current_page !== emails.last_page) {
                                        e.currentTarget.style.background = '#f8f9fa';
                                        e.currentTarget.style.borderColor = '#e9ecef';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
