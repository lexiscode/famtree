import { useState } from 'react';
import { ExternalLink, Send, Loader } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'react-toastify';

interface InferredRelationship {
    type: string;
    label: string;
    text: string;
    confidence: number;
    path_length: number;
}

interface SuggestedMember {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_image_url: string | null;
    email: string | null;
    phone: string | null;
    bio: string | null;
    gender: string | null;
    inferred_relationship: InferredRelationship;
}

interface Spouse {
    id: number;
    name: string;
    profile_image_url: string | null;
}

interface Props {
    suggestion: SuggestedMember;
    spouses: Spouse[];
    onConnectionRequested: (userId: number) => void;
}

const CHILD_TYPES = ['son', 'daughter', 'child', 'step_son', 'step_daughter', 'step_child'];

export default function SuggestedMemberCard({ suggestion, spouses, onConnectionRequested }: Props) {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedRelationshipType, setSelectedRelationshipType] = useState(
        suggestion.inferred_relationship.type
    );
    const [otherParentId, setOtherParentId] = useState<number | null>(null);

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 90) return '#22c55e'; // Green
        if (confidence >= 75) return '#3b82f6'; // Blue
        if (confidence >= 60) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const handleSendRequest = async () => {
        if (CHILD_TYPES.includes(selectedRelationshipType) && otherParentId === null) {
            toast.error('Please select the other parent');
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
                    recipient_id: suggestion.id,
                    relationship_type: selectedRelationshipType,
                    ...(CHILD_TYPES.includes(selectedRelationshipType)
                        ? { other_parent_id: otherParentId === 0 ? null : otherParentId }
                        : {}),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Close modal and notify parent
                    setShowModal(false);
                    onConnectionRequested(suggestion.id);

                    toast.success('Connection request sent successfully!');
                }
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to send connection request');
            }
        } catch (error) {
            toast.error('Failed to send connection request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="suggested-member-card">
                <div className="suggested-member-card-header">
                    <img
                        src={suggestion.profile_image_url || 'https://via.placeholder.com/80'}
                        alt={suggestion.name}
                        className="suggested-member-avatar"
                    />
                </div>

                <div className="suggested-member-card-content">
                    <h4 className="suggested-member-name">{suggestion.name}</h4>
                    <p className="suggested-member-username">@{suggestion.username}</p>

                    <div className="suggested-member-relationship">
                        <p className="suggested-member-relationship-text">
                            {suggestion.inferred_relationship.text}
                        </p>
                        <div className="suggested-member-confidence">
                            <div className="confidence-bar">
                                <div
                                    className="confidence-fill"
                                    style={{
                                        width: `${suggestion.inferred_relationship.confidence}%`,
                                        backgroundColor: getConfidenceColor(
                                            suggestion.inferred_relationship.confidence
                                        ),
                                    }}
                                />
                            </div>
                            <span className="confidence-text">
                                {suggestion.inferred_relationship.confidence}% match
                            </span>
                        </div>
                    </div>

                    {suggestion.bio && (
                        <p className="suggested-member-bio">{suggestion.bio}</p>
                    )}
                </div>

                <div className="suggested-member-card-actions">
                    <button
                        className="suggested-member-action-btn suggested-member-action-view"
                        onClick={() => router.visit(route('profile.view', { username: suggestion.username }))}
                        title="View profile"
                    >
                        <ExternalLink size={16} />
                        View Profile
                    </button>
                    <button
                        className="suggested-member-action-btn suggested-member-action-connect"
                        onClick={() => setShowModal(true)}
                        title="Send connection request"
                    >
                        <Send size={16} />
                        Connect
                    </button>
                </div>
            </div>

            {/* Connection Request Modal */}
            {showModal && (
                <div className="suggested-member-modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="suggested-member-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="suggested-member-modal-header">
                            <h2>Send Connection Request</h2>
                            <button
                                className="suggested-member-modal-close"
                                onClick={() => setShowModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="suggested-member-modal-body">
                            <div className="suggested-member-modal-user-info">
                                <img
                                    src={suggestion.profile_image_url || 'https://via.placeholder.com/80'}
                                    alt={suggestion.name}
                                    className="suggested-member-modal-avatar"
                                />
                                <div>
                                    <h3>{suggestion.name}</h3>
                                    <p>@{suggestion.username}</p>
                                </div>
                            </div>

                            <div className="suggested-member-modal-form">
                                <label htmlFor="relationship-type">Relationship Type:</label>
                                <select
                                    id="relationship-type"
                                    className="suggested-member-modal-select"
                                    value={selectedRelationshipType}
                                    onChange={(e) => {
                                        setSelectedRelationshipType(e.target.value);
                                        setOtherParentId(null);
                                    }}
                                >
                                    <option value={suggestion.inferred_relationship.type}>
                                        {suggestion.inferred_relationship.label} (Suggested)
                                    </option>
                                </select>
                                <p className="suggested-member-modal-hint">
                                    Based on your connection network, this person seems to be your{' '}
                                    <strong>{suggestion.inferred_relationship.label.toLowerCase()}</strong>.
                                </p>
                            </div>

                            {/* Other Parent (conditional - for child relationship types) */}
                            {CHILD_TYPES.includes(selectedRelationshipType) && (
                                <div className="suggested-member-modal-form" style={{ marginTop: '1rem' }}>
                                    <label htmlFor="other-parent">Other Parent:</label>
                                    <select
                                        id="other-parent"
                                        className="suggested-member-modal-select"
                                        value={otherParentId === null ? '' : otherParentId}
                                        onChange={(e) => setOtherParentId(e.target.value === '' ? null : Number(e.target.value))}
                                    >
                                        <option value="" disabled>Select the other parent...</option>
                                        <option value="0">No other parent / Single parent</option>
                                        {spouses.map((spouse) => (
                                            <option key={spouse.id} value={spouse.id}>
                                                {spouse.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="suggested-member-modal-hint">
                                        {spouses.length > 0
                                            ? "Select the child's other parent to help with family tree grouping"
                                            : 'If this child has another parent, first send a connection request to your spouse, then come back to select them here'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="suggested-member-modal-footer">
                            <button
                                className="suggested-member-modal-btn-cancel"
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="suggested-member-modal-btn-send"
                                onClick={handleSendRequest}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader size={18} className="spinner" style={{ display: 'inline' }} />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} style={{ display: 'inline' }} />
                                        Send Request
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
