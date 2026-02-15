import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Users, Send, Clock, CheckCircle, Undo2, Image, Newspaper, ArrowLeft, Network, AlertCircle, X } from 'lucide-react';

interface UserProfile {
    id: number;
    uuid: string;
    name: string;
    username: string;
    profile_image_url: string | null;
    bio: string | null;
    status: string;
}

interface Props {
    profile: UserProfile;
    relationshipContext: string | null;
    connectionStatus: string | null;
    relationshipType: string | null;
    relationshipLabel: string | null;
    connectionId: number | null;
    canUndoConnection: boolean;
    pendingRequest: { id: number; status: string } | null;
    sentRequest: { id: number; status: string } | null;
    mutualConnectionsCount: number;
    isFollowing: boolean;
    isFollowedBy: boolean;
    followerCount: number;
    followingCount: number;
    isOwnProfile: boolean;
}

export default function UserProfileSidebar({
    profile,
    relationshipContext,
    connectionStatus,
    relationshipType,
    relationshipLabel,
    connectionId,
    canUndoConnection,
    pendingRequest,
    sentRequest,
    mutualConnectionsCount,
    isFollowing: initialIsFollowing,
    isFollowedBy,
    followerCount: initialFollowerCount,
    followingCount,
    isOwnProfile,
}: Props) {
    const [showUndoModal, setShowUndoModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [followerCount, setFollowerCount] = useState(initialFollowerCount);

    const openUndoModal = () => {
        setShowUndoModal(true);
    };

    const closeUndoModal = () => {
        setShowUndoModal(false);
    };

    const handleUndoConnection = async () => {
        if (!connectionId) return;

        setLoading(true);
        closeUndoModal();

        try {
            const response = await fetch(route('connections.undo-acceptance', connectionId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                router.visit(route('connections.index'));
            }
        } catch (error) {
            console.error('Error undoing connection:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        setLoading(true);
        try {
            if (isFollowing) {
                router.post(route('users.unfollow', profile.uuid), {}, {
                    preserveState: false,
                    onSuccess: () => {
                        setIsFollowing(false);
                        setFollowerCount(prev => prev - 1);
                        setLoading(false);
                    },
                    onError: () => {
                        setLoading(false);
                    }
                });
            } else {
                router.post(route('users.follow', profile.uuid), {}, {
                    preserveState: false,
                    onSuccess: () => {
                        setIsFollowing(true);
                        setFollowerCount(prev => prev + 1);
                        setLoading(false);
                    },
                    onError: () => {
                        setLoading(false);
                    }
                });
            }
        } catch (error) {
            setLoading(false);
            console.error('Error toggling follow:', error);
        }
    };

    const getAccessLevelLabel = () => {
        return {
            nuclear_family: 'Nuclear Family',
            connected: 'Connected',
            public: 'Public Profile',
        }[relationshipContext || ''] || 'Profile';
    };

    const formatRelationshipLabel = (type: string | null) => {
        if (!type) return null;
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <>
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
                    {!isOwnProfile && (
                        <div className="profile-connection-status">
                            <div className="profile-connection-label">🔍 Access Level</div>
                            <div className="profile-connection-type">{getAccessLevelLabel()}</div>
                        </div>
                    )}

                    {/* Connection Status Badge */}
                    {connectionStatus === 'connected' && relationshipType && (
                        <span className="profile-relationship-badge">
                            ✓ {formatRelationshipLabel(relationshipType)}
                        </span>
                    )}

                    {/* Undo Connection Button */}
                    {connectionStatus === 'connected' && canUndoConnection && connectionId && (
                        <button
                            className="profile-btn profile-btn-secondary"
                            onClick={openUndoModal}
                            disabled={loading}
                            style={{ width: '100%', marginTop: '1rem', backgroundColor: '#fca5a5', color: '#7f1d1d', border: 'none' }}
                            title="Undo this connection"
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            ) : (
                                <>
                                    <Undo2 size={18} />
                                    Undo Connection
                                </>
                            )}
                        </button>
                    )}

                    {/* Request Status Section */}
                    {!connectionStatus && !isOwnProfile && (
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
                    {mutualConnectionsCount > 0 && !isOwnProfile && (
                        <div className="mt-3 p-2 rounded text-center" style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px' }}>
                            <small className="text-muted" style={{ color: '#0C4A6E', fontWeight: '600' }}>
                                <Users size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                {mutualConnectionsCount} mutual connection{mutualConnectionsCount !== 1 ? 's' : ''}
                            </small>
                        </div>
                    )}

                    {/* Follower/Following Stats */}
                    <div className="profile-stats" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                        <div
                            className="stat-item"
                            onClick={() => router.visit(route('users.followers', profile.uuid))}
                            style={{ cursor: 'pointer', textAlign: 'center', padding: '0.75rem', backgroundColor: '#F3F4F6', borderRadius: '8px', flex: 1 }}
                            title="View followers"
                        >
                            <div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#1F2937' }}>{followerCount}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Followers</div>
                        </div>
                        <div
                            className="stat-item"
                            onClick={() => router.visit(route('users.following', profile.uuid))}
                            style={{ cursor: 'pointer', textAlign: 'center', padding: '0.75rem', backgroundColor: '#F3F4F6', borderRadius: '8px', flex: 1 }}
                            title="View following"
                        >
                            <div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#1F2937' }}>{followingCount}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Following</div>
                        </div>
                    </div>

                    {/* Follow/Unfollow Button */}
                    {!isOwnProfile && (
                        <button
                            className="profile-btn"
                            onClick={handleFollowToggle}
                            disabled={loading}
                            style={{
                                width: '100%',
                                marginTop: '1rem',
                                backgroundColor: isFollowing ? '#E5E7EB' : '#3B82F6',
                                color: isFollowing ? '#374151' : '#FFFFFF',
                                border: 'none',
                                fontWeight: '600'
                            }}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            ) : (
                                <>
                                    <Users size={18} />
                                    {isFollowing ? 'Unfollow' : 'Follow'}
                                </>
                            )}
                        </button>
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
                            onClick={() => router.visit(route('profile.tree', { username: profile.username }))}
                            style={{ width: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}
                            title="View their interactive family tree"
                        >
                            <Network size={18} />
                            View Family Tree
                        </button>
                        <button
                            className="profile-btn profile-btn-secondary"
                            onClick={() => router.visit(route('profile.view', { username: profile.username }))}
                            style={{ width: '100%' }}
                        >
                            <ArrowLeft size={18} />
                            Back to Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Undo Connection Confirmation Modal */}
            {showUndoModal && (
                <div className="modal-backdrop-undo" onClick={closeUndoModal}>
                    <div className="modal-content-undo" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-undo">
                            <div className="modal-icon-undo">
                                <AlertCircle size={24} />
                            </div>
                            <button
                                className="modal-close-btn-undo"
                                onClick={closeUndoModal}
                                title="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body-undo">
                            <h2 className="modal-title-undo">Undo Connection?</h2>
                            <p className="modal-message-undo">
                                Are you sure you want to undo this connection? This will remove the connection between you and {profile.name}.
                            </p>
                        </div>

                        <div className="modal-footer-undo">
                            <button
                                className="modal-btn-cancel-undo"
                                onClick={closeUndoModal}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-btn-confirm-undo"
                                onClick={handleUndoConnection}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                        Undoing...
                                    </>
                                ) : (
                                    <>
                                        <Undo2 size={18} style={{ display: 'inline' }} />
                                        Undo Connection
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
