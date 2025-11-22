import { useMemo } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import UserProfileCard from '@/Pages/GuestPages/AuthAccessPages/Stories/UserProfileCard';
import { ArrowLeft } from 'lucide-react';

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
    const formatRelationshipLabel = (type: string | null) => {
        if (!type) return null;
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <AuthAccessLayout>
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Left Sidebar - User Profile Card */}
                <div>
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
                <div>
                    {/* Header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {user.name}'s Connections
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                            Showing {connectionCount} connection{connectionCount !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Connections Grid */}
                    {connections.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '2rem',
                        }}>
                            {connections.map((connection) => (
                                <div
                                    key={connection.id}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                    onClick={() => router.visit(route('profile.view', connection.id))}
                                >
                                    {/* Avatar */}
                                    <img
                                        src={connection.profile_image_url || 'https://via.placeholder.com/100'}
                                        alt={connection.name}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            marginBottom: '1rem',
                                            objectFit: 'cover',
                                            border: '3px solid #e5e7eb',
                                        }}
                                    />

                                    {/* Name and Username */}
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        margin: '0 0 0.25rem 0',
                                        color: '#1f2937',
                                    }}>
                                        {connection.name}
                                    </h3>
                                    <p style={{
                                        color: '#6b7280',
                                        fontSize: '0.9rem',
                                        margin: '0 0 1rem 0',
                                    }}>
                                        @{connection.username}
                                    </p>

                                    {/* Status Badge */}
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.25rem 0.75rem',
                                        backgroundColor: connection.status === 'alive' ? '#dbeafe' : '#fecaca',
                                        color: connection.status === 'alive' ? '#0c4a6e' : '#7c2d12',
                                        borderRadius: '9999px',
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                    }}>
                                        {connection.status === 'alive' ? '✓ Alive' : '🕊️ Deceased'}
                                    </span>

                                    {/* View Profile Button */}
                                    <button
                                        style={{
                                            marginTop: '1rem',
                                            width: '100%',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.visit(route('profile.view', connection.id));
                                        }}
                                    >
                                        View Profile
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            padding: '3rem 2rem',
                            textAlign: 'center',
                            color: '#6b7280',
                        }}>
                            <p style={{ fontSize: '1rem', margin: 0 }}>
                                {user.name} has no connections yet.
                            </p>
                        </div>
                    )}

                    {/* Back Button */}
                    <button
                        onClick={() => router.visit(route('profile.view', userId))}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                    >
                        <ArrowLeft size={18} />
                        Back to Profile
                    </button>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
