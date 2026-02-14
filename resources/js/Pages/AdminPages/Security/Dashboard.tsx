import { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Shield,
    AlertTriangle,
    Lock,
    Activity,
    FileText,
    LogOut,
    ChevronRight,
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
        { label: 'Failed Logins (24h)', value: stats.failed_logins_24h, icon: AlertTriangle, iconClass: 'red' },
        { label: 'Failed Logins (7d)', value: stats.failed_logins_7d, icon: AlertTriangle, iconClass: 'amber' },
        { label: 'Active Sessions', value: stats.active_sessions, icon: Activity, iconClass: 'green' },
        { label: '2FA Adoption Rate', value: `${stats.two_fa_adoption}%`, icon: Lock, iconClass: 'blue' },
        { label: 'Suspicious Accounts', value: stats.suspicious_accounts, icon: Eye, iconClass: 'red' },
    ];

    return (
        <AdminLayout>
            <div>
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="ap-flash ap-flash-success">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="ap-flash ap-flash-error">{flash.error}</div>
                )}

                {/* Page Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Security Dashboard</h1>
                    <p className="ap-page-subtitle">
                        Monitor security events, track authentication activity, and manage platform safety
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {statCards.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div className="ap-stat-card" key={idx}>
                                <div className="ap-stat-card-header">
                                    <p className="ap-stat-label">{stat.label}</p>
                                    <div className={`ap-stat-icon ${stat.iconClass}`}>
                                        <Icon size={20} />
                                    </div>
                                </div>
                                <p className="ap-stat-value">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Navigation Links */}
                <div className="ap-grid-2 ap-mb-xl">
                    <div
                        className="ap-card ap-list-item clickable"
                        onClick={() => router.get(route('admin.security.auditLog'))}
                    >
                        <div className="ap-flex ap-items-center ap-justify-between ap-w-full">
                            <div className="ap-flex ap-items-center ap-gap-md">
                                <div className="ap-stat-icon blue">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="ap-card-title">Audit Log</p>
                                    <p className="ap-card-subtitle">View all admin actions and system events</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="ap-text-secondary" />
                        </div>
                    </div>

                    <div
                        className="ap-card ap-list-item clickable"
                        onClick={() => router.get(route('admin.security.dataPrivacy'))}
                    >
                        <div className="ap-flex ap-items-center ap-justify-between ap-w-full">
                            <div className="ap-flex ap-items-center ap-gap-md">
                                <div className="ap-stat-icon green">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <p className="ap-card-title">Data Privacy</p>
                                    <p className="ap-card-subtitle">Manage GDPR compliance and data exports</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="ap-text-secondary" />
                        </div>
                    </div>
                </div>

                {/* Recent Failed Logins Table */}
                <div className="ap-table-wrap">
                    <div className="ap-card-header" style={{ padding: '1rem' }}>
                        <div className="ap-flex ap-items-center ap-gap-sm">
                            <AlertTriangle size={18} className="ap-text-secondary" />
                            <h2 className="ap-card-title">Recent Failed Logins</h2>
                        </div>
                    </div>

                    {recent_failed_logins && recent_failed_logins.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>IP Address</th>
                                        <th>Time</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_failed_logins.map((login) => (
                                        <tr key={login.id}>
                                            <td>
                                                <span className="ap-font-semibold">{login.email}</span>
                                            </td>
                                            <td>
                                                <span className="ap-badge ap-badge-neutral">{login.ip_address}</span>
                                            </td>
                                            <td className="secondary">{login.attempted_at}</td>
                                            <td>
                                                <button
                                                    className="ap-btn ap-btn-danger ap-btn-sm"
                                                    onClick={() => handleForceLogout(login.id)}
                                                    disabled={forcingLogout === login.id}
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
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Shield size={28} />
                            </div>
                            <p className="ap-empty-title">No recent failed logins</p>
                            <p className="ap-empty-text">Everything looks secure</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
