import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Edit, Settings, Bell, BookMarked, Settings as GalleryIcon, Users, LogOut, X } from 'lucide-react';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string | null;
    address: string | null;
    bio: string | null;
    date_of_birth: string | null;
    profile_image_url: string | null;
    status: string;
    job_title: string | null;
    education: string | null;
    created_at: string;
}

interface Props {
    user: User;
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
}

export default function ProfileSidebar({
    user,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
}: Props) {
    const [showImagePopup, setShowImagePopup] = useState(false);

    return (
        <>
            <div className="profile-sidebar">
                {/* Avatar Section */}
                <div className="sidebar-avatar-section">
                    <img
                        src={user.profile_image_url || 'https://via.placeholder.com/140'}
                        alt={user.name}
                        className="sidebar-avatar"
                        onClick={() => setShowImagePopup(true)}
                        style={{ cursor: 'pointer' }}
                        title="Click to view full size"
                    />
                    <h2 className="sidebar-name">{user.name}</h2>
                    <p className="sidebar-username">@{user.username}</p>

                    <span
                        className={`sidebar-status-badge ${user.status === 'alive' ? 'alive' : 'deceased'}`}
                    >
                        {user.status === 'alive' ? '✓ Alive' : '🕊️ Deceased'}
                    </span>

                    {user.bio && <p className="sidebar-bio">{user.bio}</p>}

                    {/* Stats */}
                    <div className="sidebar-stats">
                        <div className="sidebar-stat">
                            <span className="sidebar-stat-number">{connectionCount}</span>
                            <span className="sidebar-stat-label">Connections</span>
                        </div>
                        <div className="sidebar-stat">
                            <span className="sidebar-stat-number">
                                {pendingRequestCount + sentRequestCount}
                            </span>
                            <span className="sidebar-stat-label">Pending</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="sidebar-actions">
                    <button
                        className="sidebar-btn sidebar-btn-primary"
                        onClick={() => router.visit(route('settings.account'))}
                        title="Edit your account settings"
                    >
                        <Edit size={18} />
                        Account Settings
                    </button>
                    <button
                        className="sidebar-btn sidebar-btn-secondary"
                        onClick={() => router.visit(route('notifications.index'))}
                        title="View your notifications"
                        style={{ position: 'relative' }}
                    >
                        <Bell size={18} />
                        Notifications
                        {unreadNotificationCount > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    backgroundColor: '#FF6B9D',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    border: '2px solid #1a1a1a',
                                }}
                            >
                                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                            </span>
                        )}
                    </button>
                    <button
                        className="sidebar-btn sidebar-btn-secondary"
                        onClick={() => router.visit(route('galleries.index'))}
                        title="View and manage your galleries"
                    >
                        <GalleryIcon size={18} />
                        My Galleries
                    </button>
                    <button
                        className="sidebar-btn sidebar-btn-secondary"
                        onClick={() => router.visit(route('connections.index'))}
                        title="View all your connections"
                    >
                        <Users size={18} />
                        View Connections
                    </button>
                    <button
                        className="sidebar-btn sidebar-btn-logout"
                        onClick={() => router.post(route('auth.logout'))}
                        title="Sign out of your account"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Image Popup Modal */}
            {showImagePopup && (
                <div
                    className="profile-image-popup-overlay"
                    onClick={() => setShowImagePopup(false)}
                >
                    <div className="profile-image-popup-container">
                        <button
                            className="profile-image-popup-close"
                            onClick={() => setShowImagePopup(false)}
                            title="Close"
                            aria-label="Close image"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={user.profile_image_url || 'https://via.placeholder.com/140'}
                            alt={user.name}
                            className="profile-image-popup-img"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
