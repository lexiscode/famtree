import { useMemo } from 'react';
import { router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Mail, Phone, MapPin, Cake, FileText, Users, Send, Clock, CheckCircle, Lock, Briefcase, BookOpen } from 'lucide-react';

interface Profile {
    id: number;
    name: string;
    username: string;
    email: string | null;
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

interface VisibleField {
    visible: boolean;
    label: string;
}

interface Props {
    profile: Profile;
    visibleFields: Record<string, VisibleField>;
    relationshipContext: string;
    connectionStatus: string | null;
    relationshipType: string | null;
    pendingRequest: { id: number; status: string } | null;
    sentRequest: { id: number; status: string } | null;
    mutualConnectionsCount: number;
    mutualConnections: Array<{ id: number; name: string; username: string; profile_image_url: string }>;
}

export default function ViewProfile({
    profile,
    visibleFields,
    relationshipContext,
    connectionStatus,
    relationshipType,
    pendingRequest,
    sentRequest,
    mutualConnectionsCount,
    mutualConnections,
}: Props) {
    const fields = useMemo(() => [
        { key: 'email', label: 'Email', icon: Mail, value: profile.email },
        { key: 'phone', label: 'Phone', icon: Phone, value: profile.phone },
        { key: 'address', label: 'Address', icon: MapPin, value: profile.address },
        { key: 'date_of_birth', label: 'Date of Birth', icon: Cake, value: profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : null },
        { key: 'bio', label: 'Bio', icon: FileText, value: profile.bio },
        { key: 'job_title', label: 'Job Title', icon: Briefcase, value: profile.job_title },
        { key: 'education', label: 'Education', icon: BookOpen, value: profile.education },
    ], [profile]);

    const getRelationshipContextLabel = () => {
        return {
            self: 'Your Profile',
            nuclear_family: '👨‍👩‍👧 Nuclear Family',
            connected: '🤝 Connected',
            public: '👁️ Public Profile',
        }[relationshipContext] || 'Profile';
    };

    return (
        <GuestLayout>
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-grid">
                        {/* Left Sidebar - Profile Header */}
                        <div className="profile-header">
                            <div className="profile-avatar-section">
                                <img
                                    src={profile.profile_image_url || 'https://via.placeholder.com/120'}
                                    alt={profile.name}
                                    className="profile-avatar"
                                />
                                <h1 className="profile-name">{profile.name || '🔒 Hidden'}</h1>
                                <p className="profile-username">@{profile.username}</p>

                                <span className={`profile-status-badge ${profile.status === 'alive' ? 'alive' : 'deceased'}`}>
                                    {profile.status === 'alive' ? '✓ Alive' : '🕊️ Deceased'}
                                </span>

                                {profile.bio && <p className="profile-bio">{profile.bio}</p>}

                                {/* Visibility Context */}
                                <div className="profile-connection-status">
                                    <div className="profile-connection-label">Access Level:</div>
                                    <div className="profile-connection-type">{getRelationshipContextLabel()}</div>
                                </div>

                                {/* Connection Status */}
                                {connectionStatus === 'connected' && relationshipType && (
                                    <span className="profile-relationship-badge">
                                        ✓ {relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1)}
                                    </span>
                                )}

                                {/* Request Status Section */}
                                {!connectionStatus && (
                                    <>
                                        {pendingRequest ? (
                                            <div className="profile-request-section">
                                                <div className="profile-request-title">⏳ Pending Your Response</div>
                                                <p className="profile-request-info">
                                                    {profile.name} sent you a connection request
                                                </p>
                                                <div className="profile-request-actions">
                                                    <button
                                                        className="profile-btn profile-btn-primary"
                                                        onClick={() => router.visit(route('connections.pending'))}
                                                    >
                                                        <CheckCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                                        View & Respond
                                                    </button>
                                                </div>
                                            </div>
                                        ) : sentRequest ? (
                                            <div className="profile-request-section">
                                                <div className="profile-request-title">⏳ Request Sent</div>
                                                <p className="profile-request-info">
                                                    Waiting for {profile.name} to respond
                                                </p>
                                                <div className="profile-request-actions">
                                                    <button
                                                        className="profile-btn profile-btn-secondary"
                                                        onClick={() => router.visit(route('connections.sent'))}
                                                    >
                                                        <Clock size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                                        View Request
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                className="profile-btn profile-btn-primary w-100"
                                                onClick={() => router.visit(route('connections.create'))}
                                            >
                                                <Send size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                                Send Connection Request
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* Mutual Connections Count */}
                                {mutualConnectionsCount > 0 && (
                                    <div className="mt-3 p-2 bg-light rounded text-center">
                                        <small className="text-muted">
                                            <Users size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                            {mutualConnectionsCount} mutual connection{mutualConnectionsCount !== 1 ? 's' : ''}
                                        </small>
                                    </div>
                                )}
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
                                        const fieldInfo = visibleFields[field.key];
                                        const isVisible = fieldInfo?.visible ?? false;

                                        return (
                                            <div key={field.key} className={`profile-field ${!isVisible ? 'hidden' : ''}`}>
                                                <label className="profile-field-label">
                                                    <IconComponent size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                                    {field.label}
                                                </label>
                                                <div className={`profile-field-value ${!field.value || !isVisible ? 'empty' : ''}`}>
                                                    {isVisible && field.value ? field.value : (
                                                        <span>
                                                            <Lock size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />
                                                            Hidden from you
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Mutual Connections Card */}
                            {mutualConnections.length > 0 && (
                                <div className="profile-card">
                                    <div className="profile-card-header">
                                        <h2 className="profile-card-title">
                                            <Users size={20} />
                                            Mutual Connections ({mutualConnectionsCount})
                                        </h2>
                                    </div>

                                    <div className="profile-mutual-list">
                                        {mutualConnections.map((connection) => (
                                            <div
                                                key={connection.id}
                                                className="profile-mutual-item"
                                                onClick={() => router.visit(route('profile.view', connection.id))}
                                            >
                                                <img
                                                    src={connection.profile_image_url || 'https://via.placeholder.com/60'}
                                                    alt={connection.name}
                                                    className="profile-mutual-avatar"
                                                />
                                                <div className="profile-mutual-name">{connection.name}</div>
                                                <div className="profile-mutual-username">@{connection.username}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {mutualConnectionsCount > 5 && (
                                        <div className="text-center mt-3">
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => router.visit(route('connections.index'))}
                                            >
                                                View All {mutualConnectionsCount} Connections
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Privacy Notice */}
                            <div className="profile-info-box">
                                <strong>🔒 Privacy Notice:</strong> Fields marked with 🔒 are hidden from you based on {profile.name}'s
                                privacy settings. Your access level is: <strong>{getRelationshipContextLabel()}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
