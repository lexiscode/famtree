import { useMemo } from 'react';
import { router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Mail, Phone, MapPin, Cake, FileText, Users, Send, Clock, CheckCircle, Lock, Briefcase, BookOpen, ArrowRight } from 'lucide-react';

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

    const getRelationshipIcon = () => {
        return {
            self: null,
            nuclear_family: '👨‍👩‍👧',
            connected: '🤝',
            public: '👁️',
        }[relationshipContext];
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
                                    src={profile.profile_image_url || 'https://via.placeholder.com/140'}
                                    alt={profile.name}
                                    className="profile-avatar"
                                />
                                <h1 className="profile-name">{profile.name || '🔒 Hidden'}</h1>
                                <p className="profile-username">@{profile.username}</p>

                                <span className={`profile-status-badge ${profile.status === 'alive' ? 'alive' : 'deceased'}`}>
                                    {profile.status === 'alive' ? '✓ Alive' : '🕊️ Deceased'}
                                </span>

                                {profile.bio && <p className="profile-bio">{profile.bio}</p>}

                                {/* Visibility Context Badge */}
                                <div className="profile-connection-status">
                                    <div className="profile-connection-label">🔍 Access Level</div>
                                    <div className="profile-connection-type">{getRelationshipContextLabel()}</div>
                                </div>

                                {/* Connection Status Badge */}
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
                                                        style={{ marginTop: '0.5rem' }}
                                                    >
                                                        <CheckCircle size={18} />
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
                                                        style={{ marginTop: '0.5rem', width: '100%' }}
                                                    >
                                                        <Clock size={18} />
                                                        View Request
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                className="profile-btn profile-btn-primary"
                                                onClick={() => router.visit(route('connections.create'))}
                                                style={{ width: '100%', marginTop: '1rem' }}
                                            >
                                                <Send size={18} />
                                                Send Connection Request
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* Mutual Connections Count */}
                                {mutualConnectionsCount > 0 && (
                                    <div className="mt-3 p-2 rounded text-center" style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px' }}>
                                        <small className="text-muted" style={{ color: '#0C4A6E', fontWeight: '600' }}>
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
                                        <FileText size={24} />
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
                                                    <IconComponent size={16} />
                                                    {field.label}
                                                </label>
                                                <div className={`profile-field-value ${!field.value || !isVisible ? 'empty' : ''}`}>
                                                    {isVisible && field.value ? field.value : (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <Lock size={14} />
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
                                            <Users size={24} />
                                            Mutual Connections
                                        </h2>
                                        <span style={{
                                            background: 'linear-gradient(135deg, #0052E8 0%, #00D4FF 100%)',
                                            color: 'white',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: '700'
                                        }}>
                                            {mutualConnectionsCount}
                                        </span>
                                    </div>

                                    <div className="profile-mutual-list">
                                        {mutualConnections.map((connection) => (
                                            <div
                                                key={connection.id}
                                                className="profile-mutual-item"
                                                onClick={() => router.visit(route('profile.view', connection.id))}
                                                style={{ cursor: 'pointer' }}
                                                title={`View ${connection.name}'s profile`}
                                            >
                                                <img
                                                    src={connection.profile_image_url || 'https://via.placeholder.com/70'}
                                                    alt={connection.name}
                                                    className="profile-mutual-avatar"
                                                />
                                                <div className="profile-mutual-name">{connection.name}</div>
                                                <div className="profile-mutual-username">@{connection.username}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {mutualConnectionsCount > 5 && (
                                        <div className="text-center mt-4">
                                            <button
                                                className="btn btn-outline-primary"
                                                onClick={() => router.visit(route('connections.index'))}
                                                style={{ fontSize: '0.95rem', fontWeight: '600' }}
                                            >
                                                View All {mutualConnectionsCount} Connections
                                                <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Privacy Notice Info Box */}
                            <div className="profile-info-box">
                                <strong>🔒 Privacy Notice:</strong> Fields marked with <strong>🔒</strong> are hidden based on {profile.name}'s privacy settings.
                                Your access level is <strong>{getRelationshipContextLabel()}</strong>.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
