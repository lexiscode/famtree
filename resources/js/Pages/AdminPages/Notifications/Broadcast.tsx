import { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BellRing,
    Send,
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

const typeBadgeMap: Record<string, { className: string; icon: any }> = {
    info: { className: 'ap-badge ap-badge-info', icon: Info },
    warning: { className: 'ap-badge ap-badge-warning', icon: AlertTriangle },
    success: { className: 'ap-badge ap-badge-success', icon: CheckCircle },
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
        const config = typeBadgeMap[notifType] || typeBadgeMap.info;
        const Icon = config.icon;
        return (
            <span className={`${config.className} ap-capitalize`}>
                <Icon size={12} />
                {notifType}
            </span>
        );
    };

    const statCards = [
        { label: 'Total Sent', value: statistics.total_sent, icon: Send, iconClass: 'indigo' },
        { label: 'Sent Today', value: statistics.sent_today, icon: Clock, iconClass: 'green' },
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
                    <h1 className="ap-page-title">System Notifications</h1>
                    <p className="ap-page-subtitle">
                        Broadcast notifications to your users and manage communication history
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

                {/* Compose Notification */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-flex ap-items-center ap-gap-sm ap-mb-lg">
                        <Send size={18} className="ap-text-secondary" />
                        <h2 className="ap-card-title">Compose Broadcast</h2>
                    </div>

                    <div className="ap-flex-col ap-gap-lg">
                        {/* Title */}
                        <div className="ap-form-group ap-mb-0">
                            <label className="ap-form-label">Title</label>
                            <input
                                className="ap-form-input"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter notification title..."
                            />
                        </div>

                        {/* Message */}
                        <div className="ap-form-group ap-mb-0">
                            <label className="ap-form-label">Message</label>
                            <textarea
                                className="ap-form-textarea"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter notification message..."
                                rows={4}
                            />
                        </div>

                        {/* Type and Target */}
                        <div className="ap-form-row">
                            <div>
                                <label className="ap-form-label">Type</label>
                                <select
                                    className="ap-form-select"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="info">Info</option>
                                    <option value="warning">Warning</option>
                                    <option value="success">Success</option>
                                </select>
                            </div>
                            <div>
                                <label className="ap-form-label">Target Audience</label>
                                <select
                                    className="ap-form-select"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                >
                                    <option value="all_users">All Users</option>
                                    <option value="active_users">Active Users</option>
                                </select>
                            </div>
                        </div>

                        {/* Send Button */}
                        <div className="ap-flex ap-justify-end">
                            <button
                                className="ap-btn ap-btn-primary ap-btn-lg"
                                onClick={handleSendBroadcast}
                                disabled={sending || !title.trim() || !message.trim()}
                            >
                                <Send size={16} />
                                {sending ? 'Sending...' : 'Send Broadcast'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Broadcast History */}
                <div className="ap-table-wrap">
                    <div className="ap-card-header ap-card-header-md">
                        <div className="ap-flex ap-items-center ap-gap-sm">
                            <Clock size={18} className="ap-text-secondary" />
                            <h2 className="ap-card-title">Broadcast History</h2>
                        </div>
                    </div>

                    {history.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Target</th>
                                        <th>Recipients</th>
                                        <th>Sent Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((notification) => (
                                        <tr key={notification.id}>
                                            <td>
                                                <p className="ap-user-cell-name">{notification.title}</p>
                                                <p className="ap-user-cell-sub ap-truncate ap-max-w-300">
                                                    {notification.message}
                                                </p>
                                            </td>
                                            <td>{getTypeBadge(notification.type)}</td>
                                            <td>
                                                <span className="ap-badge ap-badge-primary ap-capitalize">
                                                    <Users size={12} />
                                                    {notification.target.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="ap-font-semibold">{notification.recipients_count}</span>
                                            </td>
                                            <td className="secondary">{notification.sent_at_formatted}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <BellRing size={28} />
                            </div>
                            <p className="ap-empty-title">No broadcasts sent yet</p>
                            <p className="ap-empty-text">Compose your first broadcast notification above</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
