import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Users, UserPlus, Search, Filter, ExternalLink, ArrowLeft, MessageCircle } from 'lucide-react';
import { Connection, MyConnectionsProps } from '@/types';
import ProfileSidebar from '../Stories/ProfileSidebar';

export default function MyConnections({
    user,
    connections: initialConnections,
    total_count,
    relationship_filter,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
}: MyConnectionsProps) {
    const [connections, setConnections] = useState(initialConnections);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState(relationship_filter || '');
    const [divorceConfirmId, setDivorceConfirmId] = useState<number | null>(null);

    const spousalTypes = ['wife', 'husband', 'partner'];

    const pluralizeLabel = (label: string, count: number): string => {
        if (count === 1) return label;
        const lower = label.toLowerCase();
        if (lower === 'wife') return 'Wives';
        if (lower === 'ex wife') return 'Ex Wives';
        if (lower === 'co-wife') return 'Co-wives';
        if (lower === 'co-husband') return 'Co-husbands';
        return label + 's';
    };

    const handleDivorce = (connectionId: number) => {
        router.post(route('connections.divorce', { connection: connectionId }), {}, {
            preserveScroll: true,
            onFinish: () => {
                setDivorceConfirmId(null);
            }
        });
    };

    const filteredConnections = connections.filter(conn => {
        const matchesSearch = conn.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            conn.user.username.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = !filterType || conn.relationship_type === filterType;
        return matchesSearch && matchesFilter;
    });

    const groupedByRelationship = filteredConnections.reduce((acc, conn) => {
        const key = conn.relationship_label;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(conn);
        return acc;
    }, {} as Record<string, Connection[]>);

    return (
        <AuthAccessLayout>
            <div className="connections-page">
                <div className="connections-grid-layout">
                    {/* Left Sidebar - Profile */}
                    {user && (
                        <div className="connections-left-sidebar">
                            <ProfileSidebar
                                user={user}
                                connectionCount={connectionCount}
                                pendingRequestCount={pendingRequestCount}
                                sentRequestCount={sentRequestCount}
                                unreadNotificationCount={unreadNotificationCount}
                            />
                        </div>
                    )}

                    {/* Center Content */}
                    <div className="connections-center-content">
                <div className="connections-container">
                    {/* Header Section */}
                    <div className="connections-header">
                        <div className="connections-header-top">
                            <div>
                                <h1 className="connections-title">My Connections</h1>
                                <p className="connections-subtitle">
                                    You have <strong>{total_count}</strong> family connection{total_count !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <button
                                className="connections-btn-primary"
                                onClick={() => router.visit(route('connections.create'))}
                            >
                                <UserPlus size={18} className="me-2" style={{ display: 'inline' }} />
                                Add Connection
                            </button>
                        </div>

                        {/* Search and Filter */}
                        <div className="connections-filters">
                            <div className="connections-search-wrapper">
                                <Search
                                    size={18}
                                    className="connections-input-icon"
                                />
                                <input
                                    type="text"
                                    className="connections-search-input"
                                    placeholder="Search connections by name or username..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="connections-filter-wrapper">
                                <Filter
                                    size={18}
                                    className="connections-input-icon"
                                />
                                <select
                                    className="connections-filter-select"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="">All Relationship Types</option>
                                    {Array.from(new Set(connections.map(c => c.relationship_label))).map(label => (
                                        <option key={label} value={connections.find(c => c.relationship_label === label)?.relationship_type}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Connections Grid */}
                    {filteredConnections.length === 0 ? (
                        <div className="connections-empty-state">
                            <Users size={56} className="connections-empty-icon" />
                            <h3 className="connections-empty-title">No connections found</h3>
                            <p className="connections-empty-text">
                                Start connecting with your family members to build your family tree.
                            </p>
                            <button
                                className="connections-btn-primary"
                                onClick={() => router.visit(route('connections.create'))}
                            >
                                <UserPlus size={18} className="me-2" style={{ display: 'inline' }} />
                                Add Your First Connection
                            </button>
                        </div>
                    ) : (
                        Object.entries(groupedByRelationship).map(([relationshipType, group]) => (
                            <div key={relationshipType} className="connections-group">
                                <h3 className="connections-group-title">
                                    {pluralizeLabel(relationshipType, group.length)} <span className="connections-group-count">({group.length})</span>
                                </h3>

                                <div className="connections-grid">
                                    {group.map(connection => (
                                        <div key={connection.id} className="connection-card">
                                            <div className="connection-card-header">
                                                <img
                                                    src={connection.user.profile_image_url || 'https://via.placeholder.com/56'}
                                                    alt={connection.user.name}
                                                    className="connection-avatar"
                                                />
                                                <div className="connection-info">
                                                    <h4 className="connection-name">{connection.user.name}</h4>
                                                    <p className="connection-username">@{connection.user.username}</p>
                                                </div>
                                                <span className="connection-status-badge" style={connection.is_divorced ? { background: '#FEE2E2', color: '#DC2626' } : {}}>
                                                    {connection.is_divorced ? 'Divorced' : '✓ Connected'}
                                                </span>
                                            </div>

                                            <div className="connection-relationship pb-2" style={{ color: '#9c9595ff' }}>
                                                <span className="relationship-label">Relationship: </span>
                                                <strong>{connection.relationship_label}</strong>
                                            </div>

                                            <div className="connection-card-actions pb-2" style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="connection-action-btn connection-action-view"
                                                    onClick={() => router.visit(route('profile.view', { username: connection.user.username }))}
                                                    title="View profile"
                                                    style={{ flex: 1 }}
                                                >
                                                    <ExternalLink size={16} className="me-1" style={{ display: 'inline' }} />
                                                    View Profile
                                                </button>
                                                <button
                                                    className="connection-action-btn"
                                                    onClick={() => router.post(route('messages.start'), { user_id: connection.user.id })}
                                                    title="Send message"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        padding: '0.5rem 0.75rem',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <MessageCircle size={16} />
                                                </button>
                                            </div>

                                            {/* Divorce button for spousal connections */}
                                            {spousalTypes.includes(connection.relationship_type) && !connection.is_divorced && (
                                                <div className="pb-2">
                                                    {divorceConfirmId === connection.id ? (
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.8rem', color: '#DC2626' }}>Are you sure?</span>
                                                            <button
                                                                onClick={() => handleDivorce(connection.id)}
                                                                style={{
                                                                    background: '#DC2626',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    padding: '0.35rem 0.75rem',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setDivorceConfirmId(null)}
                                                                style={{
                                                                    background: '#E5E7EB',
                                                                    color: '#374151',
                                                                    border: 'none',
                                                                    padding: '0.35rem 0.75rem',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDivorceConfirmId(connection.id)}
                                                            style={{
                                                                background: 'transparent',
                                                                color: '#DC2626',
                                                                border: '1px solid #FCA5A5',
                                                                padding: '0.35rem 0.75rem',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 600,
                                                                width: '100%'
                                                            }}
                                                        >
                                                            Mark as Divorced
                                                        </button>
                                                    )}
                                                </div>
                                            )}


                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Back to Profile Button */}
                    <a
                        href="/profile"
                        className="connections-btn-back"
                        title="Back to profile"
                    >
                        <ArrowLeft size={18} className="me-2" style={{ display: 'inline' }} />
                        Back to Profile
                    </a>
                </div>
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
