import { useMemo } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import UserProfileCard from '@/Pages/GuestPages/AuthAccessPages/Stories/UserProfileCard';
import { Users, ExternalLink, ArrowLeft } from 'lucide-react';

interface User {
    id: number;
    name: string;
    username: string;
    profile_image_url: string | null;
    status: string;
    bio: string | null;
}

interface Connection {
    id: number;
    name: string;
    username: string;
    profile_image_url: string | null;
    status: string;
    relationship_type: string;
    relationship_label: string;
}

interface Props {
    user: User;
    userId: number;
    connections: Connection[];
    connectionCount: number;
    mutualConnectionsCount: number;
    connectionStatus: string | null;
    relationshipType: string | null;
    pendingRequest: { id: number; status: string } | null;
    sentRequest: { id: number; status: string } | null;
    relationshipContext: string;
}

export default function ViewUserConnections({
    user,
    userId,
    connections,
    connectionCount,
    mutualConnectionsCount,
    connectionStatus,
    relationshipType,
    pendingRequest,
    sentRequest,
    relationshipContext,
}: Props) {
    // Group connections by relationship type
    const groupedByRelationship = useMemo(() => {
        return connections.reduce((acc, conn) => {
            const key = conn.relationship_label;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(conn);
            return acc;
        }, {} as Record<string, Connection[]>);
    }, [connections]);

    return (
        <AuthAccessLayout>
            <div className="connections-page">
                <div className="connections-grid-layout">
                    {/* Left Sidebar - User Profile Card */}
                    <div className="connections-left-sidebar">
                        <UserProfileCard
                            user={user}
                            userId={userId}
                            mutualConnectionsCount={mutualConnectionsCount}
                            connectionStatus={connectionStatus}
                            relationshipType={relationshipType}
                            pendingRequest={pendingRequest}
                            sentRequest={sentRequest}
                            relationshipContext={relationshipContext}
                        />
                    </div>

                    {/* Center Content - Connections List */}
                    <div className="connections-center-content">
                        <div className="connections-container">
                            {/* Header Section */}
                            <div className="connections-header">
                                <div className="connections-header-simple">
                                    <h1 className="connections-title">
                                        {user.name}'s Connections
                                    </h1>
                                    <p className="connections-subtitle">
                                        Showing <strong>{connectionCount}</strong> connection{connectionCount !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Connections Grouped by Relationship Type */}
                            {connections.length === 0 ? (
                                <div className="connections-empty-state">
                                    <Users size={56} className="connections-empty-icon" />
                                    <h3 className="connections-empty-title">No connections found</h3>
                                    <p className="connections-empty-text">
                                        {user.name} has no connections yet.
                                    </p>
                                </div>
                            ) : (
                                Object.entries(groupedByRelationship).map(([relationshipType, group]) => (
                                    <div key={relationshipType} className="connections-group">
                                        <h3 className="connections-group-title">
                                            {relationshipType}s <span className="connections-group-count">({group.length})</span>
                                        </h3>

                                        <div className="connections-grid">
                                            {group.map((connection) => (
                                                <div key={connection.id} className="connection-card">
                                                    <div className="connection-card-header">
                                                        <img
                                                            src={connection.profile_image_url || 'https://via.placeholder.com/56'}
                                                            alt={connection.name}
                                                            className="connection-avatar"
                                                        />
                                                        <div className="connection-info">
                                                            <h4 className="connection-name">{connection.name}</h4>
                                                            <p className="connection-username">@{connection.username}</p>
                                                        </div>
                                                        <span className={`connection-status-badge ${connection.status === 'alive' ? '' : 'deceased'}`}>
                                                            {connection.status === 'alive' ? '✓ Connected' : '🕊️ Deceased'}
                                                        </span>
                                                    </div>

                                                    <div className="connection-relationship pb-2" style={{ color: '#9c9595ff' }}>
                                                        <span className="relationship-label">Relationship: </span>
                                                        <strong>{connection.relationship_label}</strong>
                                                    </div>

                                                    <div className="connection-card-actions">
                                                        <button
                                                            className="connection-action-btn connection-action-view"
                                                            onClick={() => router.visit(route('profile.view', { username: connection.username }))}
                                                            title="View profile"
                                                        >
                                                            <ExternalLink size={16} style={{ display: 'inline' }} />
                                                            View Profile
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Back Button */}
                            <button
                                className="connections-btn-back"
                                onClick={() => router.visit(route('profile.view', { username: user.username }))}
                                title="Back to profile"
                            >
                                <ArrowLeft size={18} style={{ display: 'inline' }} />
                                Back to Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
