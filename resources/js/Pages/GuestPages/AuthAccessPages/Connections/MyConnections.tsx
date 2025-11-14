import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Users, UserPlus, Search, Filter } from 'lucide-react';

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
        <GuestLayout>
            <div className="min-vh-100" style={{ backgroundColor: '#F8F9FA', paddingTop: '3rem', paddingBottom: '3rem' }}>
                <div className="container">
                    {/* Header */}
                    <div className="mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h1 className="h2 fw-bold mb-1">My Connections</h1>
                                <p className="text-muted mb-0">You have <strong>{total_count}</strong> family connection{total_count !== 1 ? 's' : ''}</p>
                            </div>
                            <button
                                className="btn"
                                style={{
                                    background: 'linear-gradient(135deg, #0052E8 0%, #00D4FF 100%)',
                                    color: 'white',
                                    border: 'none',
                                }}
                                onClick={() => router.visit(route('connections.create'))}
                            >
                                <UserPlus size={18} className="me-2" style={{ display: 'inline' }} />
                                Add Connection
                            </button>
                        </div>

                        {/* Search and Filter */}
                        <div className="row gap-2">
                            <div className="col-md-6">
                                <div style={{ position: 'relative' }}>
                                    <Search
                                        size={18}
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '12px',
                                            color: '#9CA3AF',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search connections..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ paddingLeft: '40px' }}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div style={{ position: 'relative' }}>
                                    <Filter
                                        size={18}
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '12px',
                                            color: '#9CA3AF',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                    <select
                                        className="form-select"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        style={{ paddingLeft: '40px' }}
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
                    </div>

                    {/* Connections by Type */}
                    {filteredConnections.length === 0 ? (
                        <div
                            className="text-center py-5"
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                            }}
                        >
                            <Users size={48} className="text-muted mb-3" style={{ display: 'block', margin: '0 auto 1rem' }} />
                            <h4 className="fw-semibold">No connections found</h4>
                            <p className="text-muted mb-4">Start connecting with your family members to build your family tree.</p>
                            <button
                                className="btn"
                                style={{
                                    background: 'linear-gradient(135deg, #0052E8 0%, #00D4FF 100%)',
                                    color: 'white',
                                    border: 'none',
                                }}
                                onClick={() => router.visit(route('connections.create'))}
                            >
                                Add Your First Connection
                            </button>
                        </div>
                    ) : (
                        Object.entries(groupedByRelationship).map(([relationshipType, group]) => (
                            <div key={relationshipType} className="mb-5">
                                <h4 className="fw-semibold mb-3" style={{ color: '#0052E8' }}>
                                    {relationshipType}s ({group.length})
                                </h4>

                                <div className="row g-3">
                                    {group.map(connection => (
                                        <div key={connection.id} className="col-md-6 col-lg-4">
                                            <div
                                                style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '12px',
                                                    border: '1px solid #E5E7EB',
                                                    padding: '1.5rem',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                {/* User Info */}
                                                <div className="d-flex align-items-center mb-3">
                                                    <img
                                                        src={connection.user.profile_image_url || 'https://via.placeholder.com/48'}
                                                        alt={connection.user.name}
                                                        style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            borderRadius: '50%',
                                                            marginRight: '1rem',
                                                        }}
                                                    />
                                                    <div className="flex-grow-1">
                                                        <h5 className="mb-0 fw-semibold">{connection.user.name}</h5>
                                                        <small className="text-muted">@{connection.user.username}</small>
                                                    </div>
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            backgroundColor: '#D1FAE5',
                                                            color: '#10B981',
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '9999px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600',
                                                        }}
                                                    >
                                                        ✓ Connected
                                                    </span>
                                                </div>

                                                {/* Relationship */}
                                                <p className="mb-3 text-muted small">
                                                    Relationship: <strong>{connection.relationship_label}</strong>
                                                </p>

                                                {/* Actions */}
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-sm" style={{ flex: 1, backgroundColor: '#F0F2F5', color: '#000' }}>
                                                        View Profile
                                                    </button>
                                                    {connection.can_undo && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleUndoConnection(connection.id)}
                                                        >
                                                            Undo
                                                        </button>
                                                    )}
                                                </div>

                                                {connection.can_undo && (
                                                    <small className="text-warning d-block mt-2">
                                                        Can undo until {new Date(connection.undo_expires_at).toLocaleDateString()}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
