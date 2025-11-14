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

    // Get color class based on type
    const colorClass = `notification-icon-container.${notification.type_color}`;

    return (
        <div
            className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
            onClick={onClick}
        >
            {/* Icon Container */}
            <div className={`notification-icon-container ${notification.type_color}`}>
                {IconComponent && <IconComponent size={20} />}
            </div>

            {/* Content */}
            <div className="notification-content">
                <h4 className="notification-title">{notification.title}</h4>
                <p className="notification-message">{notification.message}</p>
                <p className="notification-time">{notification.created_at_human}</p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {!notification.is_read && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead();
                        }}
                        className="notification-item-action"
                        title="Mark as read"
                    >
                        <Check size={16} />
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="notification-item-action"
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
