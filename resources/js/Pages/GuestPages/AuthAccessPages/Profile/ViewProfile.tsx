import { useMemo, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Mail, Phone, MapPin, Cake, FileText, Users, Send, Clock, CheckCircle, Lock, Briefcase, BookOpen, ArrowRight, Image, Newspaper, Plus, ArrowLeft } from 'lucide-react';

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
    relationshipLabel: string | null;
    pendingRequest: { id: number; status: string } | null;
    sentRequest: { id: number; status: string } | null;
    mutualConnectionsCount: number;
    mutualConnections: Array<{ id: number; name: string; username: string; profile_image_url: string }>;
    nonMutualConnectionsCount: number;
    nonMutualConnections: Array<{ id: number; name: string; username: string; profile_image_url: string }>;
    accessDenied: boolean;
    accessDeniedReason: string | null;
}

export default function ViewProfile({
    profile,
    visibleFields,
    relationshipContext,
    connectionStatus,
    relationshipType,
    relationshipLabel,
    pendingRequest,
    sentRequest,
    mutualConnectionsCount,
    mutualConnections,
    nonMutualConnectionsCount,
    nonMutualConnections,
    accessDenied,
    accessDeniedReason,
}: Props) {
    // Redirect back to previous page if access is denied
    useEffect(() => {
        if (accessDenied && accessDeniedReason) {
            // Use a small delay to ensure proper redirect
            setTimeout(() => {
                window.history.back();
            }, 100);
        }
    }, [accessDenied, accessDeniedReason]);

    const handleProfileNavigation = (userId: number, userName: string) => {
        // Navigate to the profile
        router.visit(route('profile.view', userId));
    };

    const formatDateOfBirth = (dateString: string | null) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const fields = useMemo(() => {
        const fieldArray = [
            { key: 'email', label: 'Email', icon: Mail, value: profile.email },
            { key: 'phone', label: 'Phone', icon: Phone, value: profile.phone },
            { key: 'address', label: 'Address', icon: MapPin, value: profile.address },
            { key: 'date_of_birth', label: 'Date of Birth', icon: Cake, value: formatDateOfBirth(profile.date_of_birth) },
            { key: 'gender', label: 'Gender', icon: FileText, value: profile.gender },
            { key: 'bio', label: 'Bio', icon: FileText, value: profile.bio },
            { key: 'job_title', label: 'Job Title', icon: Briefcase, value: profile.job_title },
            { key: 'education', label: 'Education', icon: BookOpen, value: profile.education },
        ];
        return fieldArray;
    }, [profile]);

    const getAccessLevelLabel = () => {
        return {
            nuclear_family: 'Nuclear Family',
            connected: 'Connected',
            public: 'Public Profile',
        }[relationshipContext] || 'Profile';
    };

    const getAccessLevelColor = () => {
        return {
            nuclear_family: { bg: '#1e40af', text: '#dbeafe' },
            connected: { bg: '#059669', text: '#d1fae5' },
            public: { bg: '#7c3aed', text: '#ede9fe' },
        }[relationshipContext] || { bg: '#6b7280', text: '#f3f4f6' };
    };

    const formatRelationshipLabel = (type: string | null) => {
        if (!type) return null;
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <AuthAccessLayout>
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
                                    <div className="profile-connection-type">{getAccessLevelLabel()}</div>
                                </div>

                                {/* Connection Status Badge */}
                                {connectionStatus === 'connected' && relationshipType && (
                                    <span className="profile-relationship-badge">
                                        ✓ {formatRelationshipLabel(relationshipType)}
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

                                {/* Gallery, Stories, and Connections Buttons */}
                                <div className="profile-actions" style={{ marginTop: '2rem', gap: '0.75rem' }}>
                                    <button
                                        className="profile-btn profile-btn-primary"
                                        onClick={() => router.visit(route('galleries.view-user', profile.id))}
                                        style={{ width: '100%' }}
                                    >
                                        <Image size={18} />
                                        View Gallery
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-secondary"
                                        onClick={() => router.visit(route('stories.view-user', profile.id))}
                                        style={{ width: '100%' }}
                                    >
                                        <Newspaper size={18} />
                                        View Stories
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-secondary"
                                        onClick={() => router.visit(route('connections.view-user', profile.id))}
                                        style={{ width: '100%' }}
                                    >
                                        <Users size={18} />
                                        View Connections
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-secondary"
                                        onClick={() => router.visit(`/connections`)}
                                        style={{ width: '100%' }}
                                    >
                                        <ArrowLeft size={18} />
                                        Return to Back
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
                                        const fieldInfo = visibleFields[field.key];
                                        const isVisible = fieldInfo?.visible ?? false;

                                        // Only render fields that have visibility info
                                        if (!fieldInfo) {
                                            return null;
                                        }

                                        return (
                                            <div
                                                key={field.key}
                                                className={`profile-field ${!isVisible ? 'hidden' : ''}`}
                                                style={{
                                                    position: 'relative',
                                                }}
                                            >
                                                <label className="profile-field-label">
                                                    <IconComponent size={16} />
                                                    {field.label}
                                                </label>
                                                <div
                                                    className={`profile-field-value ${!field.value ? 'empty' : ''}`}
                                                    style={{
                                                        filter: !isVisible && field.value ? 'blur(8px)' : 'none',
                                                        transition: 'filter 0.3s ease',
                                                        cursor: !isVisible ? 'not-allowed' : 'default',
                                                        opacity: !isVisible && field.value ? 0.6 : 1,
                                                    }}
                                                >
                                                    {field.value ? (
                                                        field.value
                                                    ) : (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            {!isVisible && <Lock size={14} />}
                                                            {!isVisible ? 'Hidden from you' : 'No data'}
                                                        </span>
                                                    )}
                                                </div>
                                                {!isVisible && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600',
                                                            color: '#666',
                                                            pointerEvents: 'none',
                                                            backdropFilter: 'blur(2px)',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        <Lock size={14} style={{ color: '#FF6B6B' }} />
                                                        Private
                                                    </div>
                                                )}
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
                                                onClick={() => handleProfileNavigation(connection.id, connection.name)}
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

                            {/* Non-Mutual Connections Card */}
                            {nonMutualConnections.length > 0 && (
                                <div className="profile-card profile-card-nonmutual">
                                    <div className="profile-card-header">
                                        <h2 className="profile-card-title">
                                            <Users size={24} />
                                            Their Other Connections
                                        </h2>
                                        <span style={{
                                            background: 'linear-gradient(135deg, #9333EA 0%, #D946EF 100%)',
                                            color: 'white',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: '700'
                                        }}>
                                            {nonMutualConnectionsCount}
                                        </span>
                                    </div>

                                    <div className="profile-mutual-list profile-nonmutual-list">
                                        {nonMutualConnections.map((connection) => (
                                            <div
                                                key={connection.id}
                                                className="profile-mutual-item profile-nonmutual-item"
                                                onClick={() => handleProfileNavigation(connection.id, connection.name)}
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

                                    {nonMutualConnectionsCount > 5 && (
                                        <div className="text-center mt-4">
                                            <button
                                                className="btn btn-outline-primary"
                                                onClick={() => router.visit(route('connections.index'))}
                                                style={{ fontSize: '0.95rem', fontWeight: '600' }}
                                            >
                                                View All {nonMutualConnectionsCount} Connections
                                                <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Privacy Notice Info Box */}
                            <div className="profile-info-box">
                                <strong>🔒 Privacy Notice:</strong> Fields marked with <strong>🔒</strong> are hidden based on {profile.name}'s privacy settings. Your access level is <strong>{getAccessLevelLabel()}</strong>.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
