import { UserProfile } from '@/types';
import { router } from '@inertiajs/react';
import { Image, ArrowLeft, Send, Clock, CheckCircle, Users } from 'lucide-react';

interface Props {
    user: UserProfile;
    userId: number;
    mutualConnectionsCount?: number;
    connectionStatus?: string | null;
    relationshipType?: string | null;
    pendingRequest?: { id: number; status: string } | null;
    sentRequest?: { id: number; status: string } | null;
    relationshipContext?: string;
}

export default function UserProfileCard({
    user,
    userId,
    mutualConnectionsCount = 0,
    connectionStatus = null,
    relationshipType = null,
    pendingRequest = null,
    sentRequest = null,
    relationshipContext = 'public',
}: Props) {
    const formatRelationshipLabel = (type: string | null) => {
        if (!type) return null;
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getAccessLevelLabel = () => {
        return {
            nuclear_family: 'Nuclear Family',
            connected: 'Connected',
            public: 'Public Profile',
        }[relationshipContext] || 'Profile';
    };

    return (
        <div className="profile-card profile-sidebar-card">
            <div className="profile-card-content">
                {/* Profile Image */}
                <img
                    src={user.profile_image_url || 'https://via.placeholder.com/200'}
                    alt={user.name}
                    className="profile-avatar"
                />

                {/* Name and Username */}
                <h1 className="profile-name">{user.name || '🔒 Hidden'}</h1>
                <p className="profile-username">@{user.username}</p>

                {/* Status Badge */}
                <span className={`profile-status-badge ${user.status === 'alive' ? 'alive' : 'deceased'}`}>
                    {user.status === 'alive' ? '✓ Alive' : '🕊️ Deceased'}
                </span>

                {/* Bio */}
                {user.bio && <p className="profile-bio">{user.bio}</p>}

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
                                    {user.name} sent you a connection request
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
                                    Waiting for {user.name} to respond
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

                {/* Gallery and Full Profile Buttons */}
                <div className="profile-actions" style={{ marginTop: '2rem', gap: '0.75rem' }}>
                    <button
                        className="profile-btn profile-btn-primary"
                        onClick={() => router.visit(route('galleries.view-user', userId))}
                        style={{ width: '100%' }}
                    >
                        <Image size={18} />
                        View Gallery
                    </button>
                    <button
                        className="profile-btn profile-btn-secondary"
                        onClick={() => router.visit(route('profile.view', userId))}
                        style={{ width: '100%' }}
                    >
                        <ArrowLeft size={18} />
                        View Full Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
