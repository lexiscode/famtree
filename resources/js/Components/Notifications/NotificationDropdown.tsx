import { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import NotificationItem from './NotificationItem';

interface Notification {
    id: number;
    type: string;
    type_label: string;
    type_icon: string;
    type_color: string;
    title: string;
    message: string;
    is_read: boolean;
    action_url?: string;
    related_user?: {
        id: number;
        name: string;
        username: string;
        profile_image_url?: string;
    };
    created_at: string;
    created_at_human: string;
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(route('notifications.get-unread'), {
                headers: {
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setNotifications(data.notifications || []);
                setUnreadCount(data.count || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen]);

    const handleMarkAsRead = useCallback(async (notificationId: number) => {
        try {
            const response = await fetch(route('notifications.mark-as-read', { notificationId }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                // Update notification in state
                setNotifications(notifications.map(n =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                ));
                setUnreadCount(Math.max(0, unreadCount - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, [notifications, unreadCount]);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            const response = await fetch(route('notifications.mark-all-as-read'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                // Mark all as read locally
                setNotifications(notifications.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }, [notifications]);

    const handleDelete = useCallback(async (notificationId: number) => {
        try {
            const response = await fetch(route('notifications.delete', { notificationId }), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setNotifications(notifications.filter(n => n.id !== notificationId));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    }, [notifications]);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id);
        }

        if (notification.action_url) {
            window.location.href = notification.action_url;
        }
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
                title="Notifications"
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="notification-dropdown">
                    {/* Header */}
                    <div className="notification-dropdown-header">
                        <h3 className="notification-dropdown-title">
                            Notifications
                        </h3>
                        <div className="notification-dropdown-actions">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="notification-action-btn"
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={16} />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="notification-action-btn"
                                title="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    {loading ? (
                        <div className="notification-empty">
                            <div className="notification-empty-text">Loading...</div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="notification-empty">
                            <div className="notification-empty-icon">📭</div>
                            <p className="notification-empty-text">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="notification-list">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClick={() => handleNotificationClick(notification)}
                                    onMarkAsRead={() => handleMarkAsRead(notification.id)}
                                    onDelete={() => handleDelete(notification.id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="notification-dropdown-footer">
                            <a href={route('notifications.index')} className="notification-view-all-btn">
                                View All Notifications →
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
