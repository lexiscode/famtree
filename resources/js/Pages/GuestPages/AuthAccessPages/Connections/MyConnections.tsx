import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Users, UserPlus, Search, Filter, ExternalLink, Undo2 } from 'lucide-react';

interface Connection {
    id: number;
    user: {
        id: number;
        name: string;
        username: string;
        profile_image_url: string;
    };
    relationship_type: string;
    relationship_label: string;
    status: string;
    accepted_at: string;
    can_undo: boolean;
    undo_expires_at: string;
}

interface Props {
    connections: Connection[];
    total_count: number;
    relationship_filter: string | null;
}

export default function MyConnections({ connections: initialConnections, total_count, relationship_filter }: Props) {
    const [connections, setConnections] = useState(initialConnections);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState(relationship_filter || '');

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

    const handleUndoConnection = async (connectionId: number) => {
        if (!confirm('Are you sure you want to undo this connection? This action can only be done within 24 hours of acceptance.')) {
            return;
        }

        try {
            const response = await fetch(route('connections.undo-acceptance', connectionId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setConnections(connections.filter(c => c.id !== connectionId));
            }
        } catch (error) {
            console.error('Error undoing connection:', error);
        }
    };

    return (
        <AuthAccessLayout>
            <div className="connections-page">
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

                                            <div className="connection-relationship">
                                                <span className="relationship-label">Relationship:</span>
                                                <strong>{connection.relationship_label}</strong>
                                            </div>

                                            <div className="connection-card-actions">
                                                <button
                                                    className="connection-action-btn connection-action-view"
                                                    title="View profile"
                                                >
                                                    <ExternalLink size={16} className="me-1" style={{ display: 'inline' }} />
                                                    View Profile
                                                </button>
                                                {connection.can_undo && (
                                                    <button
                                                        className="connection-action-btn connection-action-undo"
                                                        onClick={() => handleUndoConnection(connection.id)}
                                                        title="Undo this connection within 24 hours"
                                                    >
                                                        <Undo2 size={16} style={{ display: 'inline' }} />
                                                    </button>
                                                )}
                                            </div>

                                            {connection.can_undo && (
                                                <p className="connection-undo-expiry">
                                                    ⏰ Can undo until {new Date(connection.undo_expires_at).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
