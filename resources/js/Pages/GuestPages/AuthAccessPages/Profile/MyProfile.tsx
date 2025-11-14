import { useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Mail, Phone, MapPin, Cake, FileText, Users, Edit, Settings, Briefcase, BookOpen } from 'lucide-react';

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
    connections: any[];
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
}

export default function MyProfile({ user, connections, connectionCount, pendingRequestCount, sentRequestCount }: Props) {
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
        <GuestLayout>
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-grid">
                        {/* Left Sidebar - Profile Header */}
                        <div className="profile-header">
                            <div className="profile-avatar-section">
                                <img
                                    src={user.profile_image_url || 'https://via.placeholder.com/120'}
                                    alt={user.name}
                                    className="profile-avatar"
                                />
                                <h1 className="profile-name">{user.name}</h1>
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
                                        onClick={() => router.visit(route('profile.edit'))}
                                    >
                                        <Edit size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Edit Profile
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-secondary"
                                        onClick={() => router.visit(route('profile.privacy'))}
                                    >
                                        <Settings size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Privacy Settings
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-secondary"
                                        onClick={() => router.visit(route('connections.index'))}
                                    >
                                        <Users size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        View Connections
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
                                        <FileText size={20} />
                                        Profile Information
                                    </h2>
                                </div>

                                <div className="profile-fields">
                                    {fields.map((field) => {
                                        const IconComponent = field.icon;
                                        return (
                                            <div key={field.key} className="profile-field">
                                                <label className="profile-field-label">
                                                    <IconComponent size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
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

                            {/* Quick Links Card */}
                            <div className="profile-card">
                                <div className="profile-card-header">
                                    <h2 className="profile-card-title">
                                        <Users size={20} />
                                        Quick Links
                                    </h2>
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-primary w-100"
                                            onClick={() => router.visit(route('connections.index'))}
                                        >
                                            <strong>{connectionCount}</strong> Connections
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-warning w-100"
                                            onClick={() => router.visit(route('connections.pending'))}
                                        >
                                            <strong>{pendingRequestCount}</strong> Pending Requests
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-info w-100"
                                            onClick={() => router.visit(route('connections.sent'))}
                                        >
                                            <strong>{sentRequestCount}</strong> Sent Requests
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-success w-100"
                                            onClick={() => router.visit(route('connections.create'))}
                                        >
                                            Add Connection
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="profile-info-box">
                                <strong>💡 Tip:</strong> You can control who sees each field of your profile by visiting Privacy Settings.
                                Only you can always see your complete profile!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
