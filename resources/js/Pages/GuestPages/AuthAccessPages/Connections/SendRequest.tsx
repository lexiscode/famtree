import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Search, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    profile_image_url: string;
}

interface RelationshipType {
    key: string;
    label: string;
    description: string;
}

interface Props {
    current_user_id: number;
}

export default function SendRequest({ current_user_id }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [relationshipType, setRelationshipType] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [relationshipTypes, setRelationshipTypes] = useState<RelationshipType[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load relationship types on mount
    useEffect(() => {
        fetchRelationshipTypes();
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                searchUsers();
            } else {
                setUsers([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchRelationshipTypes = async () => {
        try {
            const response = await fetch(route('connections.relationship-types'));
            const data = await response.json();
            setRelationshipTypes(data.types);
        } catch (err) {
            console.error('Error fetching relationship types:', err);
        }
    };

    const searchUsers = async () => {
        if (searchQuery.length < 2) {
            setUsers([]);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(`${route('connections.search-users')}?query=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setUsers(data.users);
        } catch (err) {
            console.error('Error searching users:', err);
            setError('Failed to search users');
        } finally {
            setSearching(false);
        }
    };

    const handleSendRequest = async () => {
        setError('');
        setSuccess('');

        if (!selectedUser) {
            setError('Please select a user');
            return;
        }

        if (!relationshipType) {
            setError('Please select a relationship type');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(route('connections.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    recipient_id: selectedUser.id,
                    relationship_type: relationshipType,
                }),
            });

            if (response.ok) {
                setSuccess('Connection request sent successfully!');
                setSelectedUser(null);
                setRelationshipType('');
                setSearchQuery('');
                setUsers([]);

                // Redirect to sent requests after 2 seconds
                setTimeout(() => {
                    router.visit(route('connections.sent'));
                }, 2000);
            } else {
                const error = await response.json();
                setError(error.errors?.connection?.[0] || error.errors?.parent?.[0] || 'Failed to send request');
            }
        } catch (err) {
            console.error('Error sending request:', err);
            setError('Failed to send connection request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GuestLayout>
            <div className="min-vh-100" style={{ backgroundColor: '#F8F9FA', paddingTop: '3rem', paddingBottom: '3rem' }}>
                <div className="container" style={{ maxWidth: '600px' }}>
                    {/* Header */}
                    <div className="mb-4">
                        <h1 className="h2 fw-bold mb-1">Send Connection Request</h1>
                        <p className="text-muted">Connect with family members to build your family tree</p>
                    </div>

                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            padding: '2rem',
                        }}
                    >
                        {/* Error Alert */}
                        {error && (
                            <div
                                className="alert mb-4 d-flex align-items-start gap-3"
                                style={{
                                    backgroundColor: '#FEE2E2',
                                    border: '1px solid #FCA5A5',
                                    color: '#991B1B',
                                }}
                            >
                                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>{error}</div>
                            </div>
                        )}

                        {/* Success Alert */}
                        {success && (
                            <div
                                className="alert mb-4 d-flex align-items-start gap-3"
                                style={{
                                    backgroundColor: '#DBEAFE',
                                    border: '1px solid #93C5FD',
                                    color: '#1E40AF',
                                }}
                            >
                                <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>{success}</div>
                            </div>
                        )}

                        {/* Search for User */}
                        <div className="form-group mb-4">
                            <label className="form-label fw-semibold mb-2">Search for Family Member</label>
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
                                    placeholder="Search by name, username, or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>

                            {/* Search Results */}
                            {users.length > 0 && (
                                <div
                                    style={{
                                        marginTop: '0.5rem',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        backgroundColor: '#FFFFFF',
                                    }}
                                >
                                    {users.map(user => (
                                        <div
                                            key={user.id}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderBottom: '1px solid #E5E7EB',
                                                cursor: 'pointer',
                                                backgroundColor: selectedUser?.id === user.id ? '#E0E7FF' : 'transparent',
                                                transition: 'background-color 0.2s',
                                            }}
                                            onClick={() => setSelectedUser(user)}
                                            onMouseEnter={(e) => {
                                                if (selectedUser?.id !== user.id) {
                                                    e.currentTarget.style.backgroundColor = '#F8F9FA';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedUser?.id !== user.id) {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                <img
                                                    src={user.profile_image_url || 'https://via.placeholder.com/40'}
                                                    alt={user.name}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                                <div className="flex-grow-1">
                                                    <div className="fw-semibold">{user.name}</div>
                                                    <small className="text-muted">@{user.username}</small>
                                                </div>
                                                {selectedUser?.id === user.id && (
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            backgroundColor: '#0052E8',
                                                            color: 'white',
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '9999px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600',
                                                        }}
                                                    >
                                                        Selected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searching && (
                                <div style={{ marginTop: '0.5rem', color: '#6B7280', fontSize: '0.875rem' }}>
                                    Searching...
                                </div>
                            )}
                        </div>

                        {/* Selected User Display */}
                        {selectedUser && (
                            <div
                                className="p-3 mb-4"
                                style={{
                                    backgroundColor: '#F0F9FF',
                                    border: '1px solid #BAE6FD',
                                    borderRadius: '8px',
                                }}
                            >
                                <p className="mb-0 small">
                                    <strong>Connecting with:</strong> {selectedUser.name} (@{selectedUser.username})
                                </p>
                            </div>
                        )}

                        {/* Relationship Type */}
                        <div className="form-group mb-4">
                            <label className="form-label fw-semibold mb-2">Relationship Type</label>
                            <select
                                className="form-select"
                                value={relationshipType}
                                onChange={(e) => setRelationshipType(e.target.value)}
                                disabled={!selectedUser}
                            >
                                <option value="">Select relationship type...</option>
                                {relationshipTypes.map(type => (
                                    <option key={type.key} value={type.key}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>

                            {relationshipType && (
                                <small className="text-muted d-block mt-2">
                                    {relationshipTypes.find(t => t.key === relationshipType)?.description}
                                </small>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            className="btn w-100"
                            style={{
                                background: 'linear-gradient(135deg, #0052E8 0%, #00D4FF 100%)',
                                color: 'white',
                                border: 'none',
                                height: '48px',
                            }}
                            onClick={handleSendRequest}
                            disabled={loading || !selectedUser || !relationshipType}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={18} className="me-2" style={{ display: 'inline' }} />
                                    Send Connection Request
                                </>
                            )}
                        </button>

                        {/* Info Box */}
                        <div
                            className="mt-4 p-3"
                            style={{
                                backgroundColor: '#F3F4F6',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                color: '#4B5563',
                            }}
                        >
                            <strong>💡 Tip:</strong> Once the other person accepts your request, you'll both be able to see each other's family connections.
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
