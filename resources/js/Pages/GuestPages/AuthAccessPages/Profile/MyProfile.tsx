import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Mail, Phone, MapPin, Cake, FileText, Users, Edit, Settings, Briefcase, BookOpen, ArrowRight, LogOut, X, Bell, BookMarked } from 'lucide-react';

interface User {
    id: number;
    first_name: string;
    last_name: string;
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
    connections: any[];
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
}

export default function MyProfile({ user, connections, connectionCount, pendingRequestCount, sentRequestCount, unreadNotificationCount }: Props) {
    const [showImagePopup, setShowImagePopup] = useState(false);

    const fields = useMemo(() => [
        { key: 'email', label: 'Email', icon: Mail, value: user.email },
        { key: 'phone', label: 'Phone', icon: Phone, value: user.phone },
        { key: 'address', label: 'Address', icon: MapPin, value: user.address },
        { key: 'date_of_birth', label: 'Date of Birth', icon: Cake, value: user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : null },
        { key: 'bio', label: 'Bio', icon: FileText, value: user.bio },
        { key: 'job_title', label: 'Job Title', icon: Briefcase, value: user.job_title },
        { key: 'education', label: 'Education', icon: BookOpen, value: user.education },
    ], [user]);

    return (
        <AuthAccessLayout>
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-grid">
                        {/* Left Sidebar - Profile Header */}
                        <div className="profile-header">
                            <div className="profile-avatar-section">
                                <img
                                    src={user.profile_image_url || 'https://via.placeholder.com/140'}
                                    alt={user.name}
                                    className="profile-avatar"
                                    onClick={() => setShowImagePopup(true)}
                                    style={{ cursor: 'pointer' }}
                                    title="Click to view full size"
                                />
                                <div className="profile-name-section">
                                    <h1 className="profile-name">
                                        {user.first_name} <span className="profile-last-name">{user.last_name}</span>
                                    </h1>
                                </div>
                                <p className="profile-username">@{user.username}</p>

                                <span className={`profile-status-badge ${user.status === 'alive' ? 'alive' : 'deceased'}`}>
                                    {user.status === 'alive' ? '✓ Alive' : '🕊️ Deceased'}
                                </span>

                                {user.bio && <p className="profile-bio">{user.bio}</p>}

                                {/* Stats */}
                                <div className="profile-stats">
                                    <div className="profile-stat">
                                        <span className="profile-stat-number">{connectionCount}</span>
                                        <span className="profile-stat-label">Connections</span>
                                    </div>
                                    <div className="profile-stat">
                                        <span className="profile-stat-number">{pendingRequestCount + sentRequestCount}</span>
                                        <span className="profile-stat-label">Pending</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="profile-actions">
                                    <button
                                        className="profile-btn profile-btn-primary"
                                        onClick={() => router.visit(route('settings.account'))}
                                        title="Edit your account settings"
                                    >
                                        <Edit size={18} />
                                        Account Settings
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-secondary"
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
                                        className="profile-btn profile-btn-secondary"
                                        onClick={() => router.visit(route('stories.index'))}
                                        title="View and create your stories"
                                    >
                                        <BookMarked size={18} />
                                        My Stories
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-secondary"
                                        onClick={() => router.visit(route('galleries.index'))}
                                        title="View and manage your galleries"
                                    >
                                        <Settings size={18} />
                                        My Galleries
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-secondary"
                                        onClick={() => router.visit(route('connections.index'))}
                                        title="View all your connections"
                                    >
                                        <Users size={18} />
                                        View Connections
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-logout"
                                        onClick={() => router.post(route('auth.logout'))}
                                        title="Sign out of your account"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Profile Details */}
                        <div className="profile-content">
                            {/* Profile Details Card */}
                            <div className="profile-card">
                                <div className="profile-card-header">
                                    <h2 className="profile-card-title">
                                        <FileText size={24} />
                                        Profile Information
                                    </h2>
                                </div>

                                <div className="profile-fields">
                                    {fields.map((field) => {
                                        const IconComponent = field.icon;
                                        return (
                                            <div key={field.key} className="profile-field">
                                                <label className="profile-field-label">
                                                    <IconComponent size={16} />
                                                    {field.label}
                                                </label>
                                                <div className={`profile-field-value ${!field.value ? 'empty' : ''}`}>
                                                    {field.value || 'Not provided'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick Actions Card */}
                            <div className="profile-card">
                                <div className="profile-card-header">
                                    <h2 className="profile-card-title">
                                        <Users size={24} />
                                        Connection Overview
                                    </h2>
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => router.visit(route('connections.index'))}
                                            style={{ padding: '0.85rem 1.25rem' }}
                                        >
                                            <span>
                                                <strong>{connectionCount}</strong> Connected
                                            </span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-warning w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => router.visit(route('connections.pending'))}
                                            style={{ padding: '0.85rem 1.25rem' }}
                                        >
                                            <span>
                                                <strong>{pendingRequestCount}</strong> Pending
                                            </span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-info w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => router.visit(route('connections.sent'))}
                                            style={{ padding: '0.85rem 1.25rem' }}
                                        >
                                            <span>
                                                <strong>{sentRequestCount}</strong> Sent
                                            </span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-success w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => router.visit(route('connections.create'))}
                                            style={{ padding: '0.85rem 1.25rem' }}
                                        >
                                            <span>Add Connection</span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tips & Info Box */}
                            <div className="profile-info-box" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <span style={{ fontWeight: 700 }}>💡 Pro Tip:</span> Your profile is completely visible to you. Use <span style={{ fontWeight: 700 }}>Privacy Settings</span> to control who sees each field across the platform.
                            </div>
                        </div>
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
            </div>
        </AuthAccessLayout>
    );
}
