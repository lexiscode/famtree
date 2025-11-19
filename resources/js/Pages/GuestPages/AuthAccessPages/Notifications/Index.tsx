import { useState, useCallback, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Bell, Trash2, CheckCircle, Clock, AlertCircle, Users, Heart, MapPin, Search, Filter, ArrowLeft } from 'lucide-react';
import { Notification, NotificationsIndexProps } from '@/types';

export default function NotificationsIndex({ notifications, unreadCount }: NotificationsIndexProps) {
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

    const filteredNotifications = useMemo(() => {
        let filtered = notifications;

        // Apply filter
        if (filter === 'unread') {
            filtered = filtered.filter(n => !n.read);
        } else if (filter === 'read') {
            filtered = filtered.filter(n => n.read);
        }

        // Apply search
        if (searchQuery) {
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.message.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [notifications, filter, searchQuery]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'connection_request':
                return <Users size={20} />;
            case 'connection_accepted':
                return <Heart size={20} />;
            case 'family_update':
                return <Users size={20} />;
            case 'location_nearby':
                return <MapPin size={20} />;
            default:
                return <Bell size={20} />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'connection_request':
                return '#0052E8';
            case 'connection_accepted':
                return '#00D97F';
            case 'family_update':
                return '#FFD700';
            case 'location_nearby':
                return '#FF6B9D';
            default:
                return '#00D4FF';
        }
    };

    const handleMarkAsRead = (notificationId: number) => {
        router.post(route('notifications.mark-as-read', notificationId), {}, {
            onSuccess: () => {
                // Component will re-render with updated props
            },
        });
    };

    const handleDeleteNotification = (notificationId: number) => {
        setDeleteLoading(notificationId);
        router.delete(route('notifications.delete', notificationId), {
            onSuccess: () => {
                setDeleteLoading(null);
            },
            onError: () => {
                setDeleteLoading(null);
            },
        });
    };

    const handleMarkAllAsRead = () => {
        router.post(route('notifications.mark-all-as-read'), {}, {
            onSuccess: () => {
                // Component will re-render with updated props
            },
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <AuthAccessLayout>
            <div className="notifications-page">
                <div className="notifications-container">
                    {/* Back Button */}
                    <button
                        className="back-button"
                        onClick={() => router.visit(route('home'))}
                        title="Back to profile"
                    >
                        <ArrowLeft size={20} />
                        Back to Profile
                    </button>

                    {/* Header */}
                    <div className="notifications-header">
                        <div className="notifications-title-section">
                            <Bell size={32} className="notifications-title-icon" />
                            <div>
                                <h1 className="notifications-title">Notifications</h1>
                                <p className="notifications-subtitle">Stay updated with your family connections</p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="notifications-controls">
                        {/* Search */}
                        <div className="notifications-search">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        {/* Filter & Actions */}
                        <div className="notifications-actions">
                            <div className="filter-buttons">
                                <button
                                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilter('all')}
                                >
                                    <Filter size={16} />
                                    All ({notifications.length})
                                </button>
                                <button
                                    className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                                    onClick={() => setFilter('unread')}
                                >
                                    <Bell size={16} />
                                    Unread ({unreadCount})
                                </button>
                                <button
                                    className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
                                    onClick={() => setFilter('read')}
                                >
                                    <CheckCircle size={16} />
                                    Read ({notifications.filter(n => n.read).length})
                                </button>
                            </div>

                            {unreadCount > 0 && (
                                <button
                                    className="mark-all-btn"
                                    onClick={handleMarkAllAsRead}
                                    title="Mark all as read"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="notifications-list">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-card ${!notification.read ? 'unread' : ''}`}
                                >
                                    {/* Notification Indicator */}
                                    <div
                                        className="notification-indicator"
                                        style={{ backgroundColor: getNotificationColor(notification.type) }}
                                    />

                                    {/* Icon */}
                                    <div
                                        className="notification-icon"
                                        style={{ color: getNotificationColor(notification.type) }}
                                    >
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="notification-content">
                                        <h3 className="notification-title">{notification.title}</h3>
                                        <p className="notification-message">{notification.message}</p>
                                        <div className="notification-meta">
                                            <Clock size={14} />
                                            <span>{formatTime(notification.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="notification-actions">
                                        {!notification.read && (
                                            <button
                                                className="action-btn read-btn"
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                title="Mark as read"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => handleDeleteNotification(notification.id)}
                                            disabled={deleteLoading === notification.id}
                                            title="Delete notification"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="notifications-empty">
                                <div className="empty-icon">
                                    <Bell size={48} />
                                </div>
                                <h3 className="empty-title" style={{ color: '#9c9595ff' }}>
                                    {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                                </h3>
                                <p className="empty-message" style={{ color: '#9c9595ff' }}>
                                    {filter === 'unread'
                                        ? 'You\'re all caught up! Check back later for updates.'
                                        : searchQuery
                                            ? 'No notifications match your search.'
                                            : 'You haven\'t received any notifications yet.'}
                                </p>
                                {searchQuery && (
                                    <button
                                        className="clear-search-btn"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
