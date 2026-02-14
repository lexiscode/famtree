import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Clock,
    BellRing,
    Info,
    AlertTriangle,
    CheckCircle,
    Users,
    Send,
    ChevronLeft,
    ChevronRight,
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

const typeBadgeMap: Record<string, { className: string; icon: any }> = {
    info: { className: 'ap-badge ap-badge-info', icon: Info },
    warning: { className: 'ap-badge ap-badge-warning', icon: AlertTriangle },
    success: { className: 'ap-badge ap-badge-success', icon: CheckCircle },
    admin_broadcast: { className: 'ap-badge ap-badge-primary', icon: Send },
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
        const config = typeBadgeMap[notifType] || typeBadgeMap.admin_broadcast;
        const Icon = config.icon;
        return (
            <span className={`${config.className} ap-capitalize`}>
                <Icon size={12} />
                {notifType.replace(/_/g, ' ')}
            </span>
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
        { label: 'Total Broadcasts', value: notifications.total, icon: Send, iconClass: 'indigo' },
        { label: 'Current Page', value: `${notifications.current_page} / ${notifications.last_page}`, icon: Clock, iconClass: 'green' },
    ];

    const getProgressBarClass = (rate: number): string => {
        if (rate >= 70) return 'green';
        if (rate >= 40) return 'amber';
        return 'red';
    };

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
                    <h1 className="ap-page-title">Notification History</h1>
                    <p className="ap-page-subtitle">
                        View all broadcast notifications sent to users with delivery and read statistics
                    </p>
                </div>

                {/* Back to Broadcast */}
                <button
                    className="ap-back-btn"
                    onClick={() => router.get(route('admin.notifications.broadcast'))}
                >
                    <BellRing size={14} />
                    Back to Broadcast
                </button>

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

                {/* History Table */}
                <div className="ap-table-wrap">
                    <div className="ap-flex ap-items-center ap-justify-between ap-card-header-md">
                        <div className="ap-flex ap-items-center ap-gap-sm">
                            <Mail size={18} className="ap-text-secondary" />
                            <h2 className="ap-card-title">Sent Notifications</h2>
                        </div>
                        {notifications.total > 0 && (
                            <span className="ap-text-sm ap-text-secondary">
                                Showing {notifications.from} to {notifications.to} of {notifications.total} results
                            </span>
                        )}
                    </div>

                    {notifications.data.length > 0 ? (
                        <>
                            <div className="ap-table-scroll">
                                <table className="ap-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Type</th>
                                            <th>Recipients</th>
                                            <th>Read Rate</th>
                                            <th>Sent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notifications.data.map((notification, idx) => {
                                            const readRate = getReadRate(notification.read_count, notification.recipients_count);
                                            const barClass = getProgressBarClass(readRate);

                                            return (
                                                <tr key={idx}>
                                                    <td className="ap-max-w-350">
                                                        <p className="ap-user-cell-name">{notification.title}</p>
                                                        <p className="ap-user-cell-sub ap-truncate ap-max-w-320">
                                                            {notification.message}
                                                        </p>
                                                    </td>
                                                    <td>{getTypeBadge(notification.type)}</td>
                                                    <td>
                                                        <span className="ap-badge ap-badge-primary">
                                                            <Users size={12} />
                                                            {notification.recipients_count.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="ap-flex ap-items-center ap-gap-sm">
                                                            <div className="ap-progress-cell">
                                                                <div className="ap-progress-track">
                                                                    <div
                                                                        className={`ap-progress-bar ${barClass}`}
                                                                        style={{ width: `${readRate}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <span className="ap-text-sm ap-font-semibold">
                                                                {readRate}%
                                                            </span>
                                                            <span className="ap-text-xs ap-text-tertiary">
                                                                ({notification.read_count}/{notification.recipients_count})
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ap-flex ap-items-center ap-gap-xs ap-text-secondary ap-text-sm">
                                                            <Clock size={14} />
                                                            {notification.created_at_formatted}
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
                                <div className="ap-pagination ap-pagination-sm">
                                    <div></div>
                                    <div className="ap-pagination-btns">
                                        <button
                                            className="ap-page-btn"
                                            onClick={() => goToPage(notifications.current_page - 1)}
                                            disabled={notifications.current_page <= 1}
                                        >
                                            <ChevronLeft size={14} />
                                            Prev
                                        </button>

                                        {generatePageNumbers(notifications.current_page, notifications.last_page).map((pg, idx) => (
                                            <button
                                                key={idx}
                                                className={`ap-page-btn ${pg === notifications.current_page ? 'active' : ''}`}
                                                onClick={() => typeof pg === 'number' ? goToPage(pg) : undefined}
                                                disabled={typeof pg !== 'number'}
                                            >
                                                {pg}
                                            </button>
                                        ))}

                                        <button
                                            className="ap-page-btn"
                                            onClick={() => goToPage(notifications.current_page + 1)}
                                            disabled={notifications.current_page >= notifications.last_page}
                                        >
                                            Next
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <BellRing size={28} />
                            </div>
                            <p className="ap-empty-title">No notification history</p>
                            <p className="ap-empty-text">Broadcast notifications will appear here once sent</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
