import { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Shield,
    AlertTriangle,
    Users,
    Lock,
    Activity,
    FileText,
    LogOut,
    ChevronRight,
    Zap,
    Eye,
} from 'lucide-react';

interface Props {
    stats: {
        failed_logins_24h: number;
        failed_logins_7d: number;
        active_sessions: number;
        two_fa_adoption: number;
        total_users: number;
        suspicious_accounts: number;
    };
    recent_failed_logins: {
        id: number;
        email: string;
        ip_address: string;
        attempted_at: string;
    }[];
}

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

export default function Dashboard({ stats, recent_failed_logins }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [forcingLogout, setForcingLogout] = useState<number | null>(null);

    const handleForceLogout = useCallback((loginId: number) => {
        if (window.confirm('Are you sure you want to force logout this session?')) {
            setForcingLogout(loginId);
            router.post(route('admin.security.forceLogout', loginId), {}, {
                preserveScroll: true,
                onFinish: () => setForcingLogout(null),
            });
        }
    }, []);

    const statCards = [
        { label: 'Failed Logins (24h)', value: stats.failed_logins_24h, icon: AlertTriangle, color: THEME.danger, lightColor: '#ffebee' },
        { label: 'Failed Logins (7d)', value: stats.failed_logins_7d, icon: AlertTriangle, color: THEME.warning, lightColor: '#fff8e1' },
        { label: 'Active Sessions', value: stats.active_sessions, icon: Activity, color: THEME.success, lightColor: '#e8f5e9' },
        { label: '2FA Adoption Rate', value: `${stats.two_fa_adoption}%`, icon: Lock, color: THEME.info, lightColor: '#e0f7fa' },
        { label: 'Suspicious Accounts', value: stats.suspicious_accounts, icon: Eye, color: THEME.danger, lightColor: '#ffebee' },
    ];

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Flash Messages */}
                {flash?.success && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        background: '#e8f5e9',
                        border: `2px solid ${THEME.success}`,
                        color: THEME.success,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                    }}>
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        background: '#ffebee',
                        border: `2px solid ${THEME.danger}`,
                        color: THEME.danger,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                    }}>
                        {flash.error}
                    </div>
                )}

                {/* Gradient Header */}
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
                            <Shield size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                Security Dashboard
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            Monitor security events, track authentication activity, and manage platform safety
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Real-time security monitoring and threat detection
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem' }}>
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
                </div>

                {/* Navigation Links */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem', marginBottom: '3rem' }}>
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2rem',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onClick={() => router.get(route('admin.security.auditLog'))}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = THEME.primary;
                            e.currentTarget.style.boxShadow = `0 16px 40px ${THEME.primary}15`;
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    background: '#e7f1ff',
                                }}>
                                    <FileText size={28} color={THEME.primary} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0a0e27' }}>
                                        Audit Log
                                    </h3>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem', color: '#6c757d', fontWeight: 500 }}>
                                        View all admin actions and system events
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={24} color={THEME.primary} strokeWidth={2} />
                        </div>
                    </div>

                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2rem',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onClick={() => router.get(route('admin.security.dataPrivacy'))}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = THEME.primary;
                            e.currentTarget.style.boxShadow = `0 16px 40px ${THEME.primary}15`;
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    background: '#e8f5e9',
                                }}>
                                    <Lock size={28} color={THEME.success} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0a0e27' }}>
                                        Data Privacy
                                    </h3>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem', color: '#6c757d', fontWeight: 500 }}>
                                        Manage GDPR compliance and data exports
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={24} color={THEME.success} strokeWidth={2} />
                        </div>
                    </div>
                </div>

                {/* Recent Failed Logins Table */}
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '2px solid #E5E7EB',
                    overflow: 'hidden',
                    boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                }}>
                    <div style={{
                        padding: '1.75rem 2rem',
                        borderBottom: '2px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}>
                        <AlertTriangle size={22} color={THEME.danger} strokeWidth={2} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27' }}>
                            Recent Failed Logins
                        </h2>
                    </div>

                    {recent_failed_logins && recent_failed_logins.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        {['Email', 'IP Address', 'Time', 'Actions'].map((h) => (
                                            <th key={h} style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_failed_logins.map((login) => (
                                        <tr
                                            key={login.id}
                                            style={{
                                                borderBottom: '1.5px solid #E5E7EB',
                                                background: '#FFFFFF',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                                        >
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <span style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0a0e27' }}>
                                                    {login.email}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.35rem 0.75rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.88rem',
                                                    fontWeight: 600,
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#374151',
                                                    fontFamily: 'monospace',
                                                }}>
                                                    {login.ip_address}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {login.attempted_at}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <button
                                                    onClick={() => handleForceLogout(login.id)}
                                                    disabled={forcingLogout === login.id}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        padding: '0.55rem 1rem',
                                                        background: '#ffebee',
                                                        color: THEME.danger,
                                                        border: `2px solid #f5c6cb`,
                                                        borderRadius: '10px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 700,
                                                        cursor: forcingLogout === login.id ? 'not-allowed' : 'pointer',
                                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        opacity: forcingLogout === login.id ? 0.6 : 1,
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (forcingLogout !== login.id) {
                                                            e.currentTarget.style.background = THEME.danger;
                                                            e.currentTarget.style.color = '#FFFFFF';
                                                            e.currentTarget.style.borderColor = THEME.danger;
                                                            e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.danger}35`;
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (forcingLogout !== login.id) {
                                                            e.currentTarget.style.background = '#ffebee';
                                                            e.currentTarget.style.color = THEME.danger;
                                                            e.currentTarget.style.borderColor = '#f5c6cb';
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        }
                                                    }}
                                                >
                                                    <LogOut size={14} />
                                                    {forcingLogout === login.id ? 'Forcing...' : 'Force Logout'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', background: '#e8f5e9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Shield size={40} color={THEME.success} strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No recent failed logins
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                Everything looks secure
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
