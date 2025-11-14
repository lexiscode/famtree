import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Search, Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';

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
            <div className="connections-page">
                <div className="connections-container" style={{ maxWidth: '650px' }}>
                    {/* Header */}
                    <div className="connections-header-simple">
                        <h1 className="connections-title">Send Connection Request</h1>
                        <p className="connections-subtitle">Connect with family members to build your family tree</p>
                    </div>

                    <div className="connections-form-card">
                        {/* Error Alert */}
                        {error && (
                            <div className="connections-alert connections-alert-error">
                                <AlertCircle size={20} className="connections-alert-icon" />
                                <div>{error}</div>
                            </div>
                        )}

                        {/* Success Alert */}
                        {success && (
                            <div className="connections-alert connections-alert-success">
                                <CheckCircle size={20} className="connections-alert-icon" />
                                <div>{success}</div>
                            </div>
                        )}

                        {/* Search for User */}
                        <div className="connections-form-group">
                            <label className="connections-form-label">Search for Family Member</label>
                            <div className="connections-search-wrapper">
                                <Search
                                    size={18}
                                    className="connections-input-icon"
                                />
                                <input
                                    type="text"
                                    className="connections-search-input"
                                    placeholder="Search by name, username, or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Search Results Dropdown */}
                            {users.length > 0 && (
                                <div className="connections-search-results">
                                    {users.map(user => (
                                        <div
                                            key={user.id}
                                            className={`connections-search-result-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <img
                                                src={user.profile_image_url || 'https://via.placeholder.com/40'}
                                                alt={user.name}
                                                className="connections-result-avatar"
                                            />
                                            <div className="connections-result-info">
                                                <div className="connections-result-name">{user.name}</div>
                                                <small className="connections-result-username">@{user.username}</small>
                                            </div>
                                            {selectedUser?.id === user.id && (
                                                <span className="connections-result-selected">✓ Selected</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searching && (
                                <div className="connections-searching">
                                    <Loader size={16} className="connections-search-spinner" />
                                    Searching...
                                </div>
                            )}
                        </div>

                        {/* Selected User Display */}
                        {selectedUser && (
                            <div className="connections-selected-user">
                                <p>
                                    <strong>Connecting with:</strong> {selectedUser.name} (@{selectedUser.username})
                                </p>
                            </div>
                        )}

                        {/* Relationship Type */}
                        <div className="connections-form-group">
                            <label className="connections-form-label">Relationship Type</label>
                            <select
                                className="connections-form-select"
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
                                <small className="connections-form-hint">
                                    {relationshipTypes.find(t => t.key === relationshipType)?.description}
                                </small>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            className="connections-btn-primary connections-btn-large"
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
                        <div className="connections-info-box">
                            <strong>💡 Tip:</strong> Once the other person accepts your request, you'll both be able to see each other's family connections.
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
