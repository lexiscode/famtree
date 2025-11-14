import { Trash2, Check } from 'lucide-react';
import { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';

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

interface NotificationItemProps {
    notification: Notification;
    onClick: () => void;
    onMarkAsRead: () => void;
    onDelete: () => void;
}

export default function NotificationItem({
    notification,
    onClick,
    onMarkAsRead,
    onDelete,
}: NotificationItemProps) {
    // Get the icon component dynamically
    const IconComponent = useMemo(() => {
        const iconMap: Record<string, any> = {
            'UserPlus': LucideIcons.UserPlus,
            'CheckCircle': LucideIcons.CheckCircle,
            'XCircle': LucideIcons.XCircle,
            'RotateCcw': LucideIcons.RotateCcw,
            'Share2': LucideIcons.Share2,
            'Users': LucideIcons.Users,
            'AlertCircle': LucideIcons.AlertCircle,
            'Baby': LucideIcons.Baby,
            'Edit': LucideIcons.Edit,
            'MessageCircle': LucideIcons.MessageCircle,
            'Bell': LucideIcons.Bell,
        };

        return iconMap[notification.type_icon] || LucideIcons.Bell;
    }, [notification.type_icon]);

    return (
        <div
            className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
            onClick={onClick}
            role="article"
            aria-label={`${notification.title}: ${notification.message}`}
        >
            {/* Icon Container with type-specific styling */}
            <div className={`notification-icon-container ${notification.type_color}`} aria-hidden="true">
                {IconComponent && <IconComponent size={20} />}
            </div>

            {/* Content Section */}
            <div className="notification-content">
                <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    {!notification.is_read && (
                        <span className="notification-item-unread-indicator" title="Unread"></span>
                    )}
                </div>
                <p className="notification-message">{notification.message}</p>
                <p className="notification-time" title={notification.created_at}>{notification.created_at_human}</p>
            </div>

            {/* Action Buttons Section */}
            <div className="notification-item-actions">
                {!notification.is_read && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead();
                        }}
                        className="notification-item-action read"
                        title="Mark as read"
                        aria-label="Mark as read"
                    >
                        <Check size={16} />
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="notification-item-action delete"
                    title="Delete notification"
                    aria-label="Delete notification"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
