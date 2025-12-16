import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Users, UserPlus, Search, Filter, ExternalLink, Undo2, ArrowLeft, AlertCircle, X } from 'lucide-react';
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
    const [showUndoModal, setShowUndoModal] = useState(false);
    const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

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

    const openUndoModal = (connectionId: number) => {
        setSelectedConnectionId(connectionId);
        setShowUndoModal(true);
    };

    const closeUndoModal = () => {
        setShowUndoModal(false);
        setSelectedConnectionId(null);
    };

    const handleUndoConnection = async () => {
        if (selectedConnectionId === null) return;

        setLoading(true);
        closeUndoModal();

        try {
            const response = await fetch(route('connections.undo-acceptance', selectedConnectionId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setConnections(connections.filter(c => c.id !== selectedConnectionId));
            }
        } catch (error) {
            console.error('Error undoing connection:', error);
        } finally {
            setLoading(false);
        }
    };

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
                                    {relationshipType}s <span className="connections-group-count">({group.length})</span>
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
                                                <span className="connection-status-badge">
                                                    ✓ Connected
                                                </span>
                                            </div>

                                            <div className="connection-relationship pb-2" style={{ color: '#9c9595ff' }}>
                                                <span className="relationship-label">Relationship: </span>
                                                <strong>{connection.relationship_label}</strong>
                                            </div>

                                            <div className={`connection-card-actions pb-2 ${connection.can_undo ? '' : 'single-button'}`}>
                                                <button
                                                    className="connection-action-btn connection-action-view"
                                                    onClick={() => router.visit(route('profile.view', connection.user.id))}
                                                    title="View profile"
                                                >
                                                    <ExternalLink size={16} className="me-1" style={{ display: 'inline' }} />
                                                    View Profile
                                                </button>
                                                {connection.can_undo && (
                                                    <button
                                                        className="connection-action-btn connection-action-undo"
                                                        onClick={() => openUndoModal(connection.id)}
                                                        disabled={loading}
                                                        title="Undo this connection"
                                                    >
                                                        {loading ? (
                                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                                        ) : (
                                                            <Undo2 size={16} style={{ display: 'inline' }} />
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                        
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Back to Profile Button */}
                    <button
                        className="connections-btn-back"
                        onClick={() => router.visit(route('home'))}
                        title="Back to profile"
                    >
                        <ArrowLeft size={18} className="me-2" style={{ display: 'inline' }} />
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
                                    Are you sure you want to undo this connection? This will remove the connection between you and this person.
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
            </div>
        </AuthAccessLayout>
    );
}
