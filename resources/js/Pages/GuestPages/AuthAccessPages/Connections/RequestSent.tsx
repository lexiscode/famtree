import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Send, Trash2 } from 'lucide-react';

interface SentRequest {
    id: number;
    recipient: {
        id: number;
        name: string;
        username: string;
        profile_image_url: string;
    };
    relationship_type: string;
    relationship_label: string;
    requested_at: string;
}

interface Props {
    requests: SentRequest[];
    count: number;
}

export default function RequestSent({ requests: initialRequests, count }: Props) {
    const [requests, setRequests] = useState(initialRequests);
    const [loading, setLoading] = useState<number | null>(null);

    const handleUnsend = async (connectionId: number) => {
        if (!confirm('Are you sure you want to unsend this connection request?')) {
            return;
        }

        setLoading(connectionId);
        try {
            const response = await fetch(route('connections.undo-request', connectionId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setRequests(requests.filter(r => r.id !== connectionId));
            }
        } catch (error) {
            console.error('Error unsending request:', error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <GuestLayout>
            <div className="connections-page">
                <div className="connections-container">
                    {/* Header */}
                    <div className="connections-header-simple">
                        <h1 className="connections-title">Sent Requests</h1>
                        <p className="connections-subtitle">
                            You have <strong>{count}</strong> pending connection request{count !== 1 ? 's' : ''} awaiting response
                        </p>
                    </div>

                    {/* Requests List */}
                    {requests.length === 0 ? (
                        <div className="connections-empty-state">
                            <Send size={56} className="connections-empty-icon" />
                            <h3 className="connections-empty-title">No sent requests</h3>
                            <p className="connections-empty-text">
                                You haven't sent any connection requests yet.
                            </p>
                            <button
                                className="connections-btn-primary"
                                onClick={() => router.visit(route('connections.create'))}
                            >
                                <Send size={18} className="me-2" style={{ display: 'inline' }} />
                                Send a Connection Request
                            </button>
                        </div>
                    ) : (
                        <div className="connection-requests-list">
                            {requests.map(request => (
                                <div
                                    key={request.id}
                                    className="connection-request-item"
                                >
                                    {/* User Info Header */}
                                    <div className="connection-request-header">
                                        <img
                                            src={request.recipient.profile_image_url || 'https://via.placeholder.com/56'}
                                            alt={request.recipient.name}
                                            className="connection-request-avatar"
                                        />
                                        <div className="connection-request-info">
                                            <h4 className="connection-request-name">{request.recipient.name}</h4>
                                            <p className="connection-request-username">@{request.recipient.username}</p>
                                        </div>
                                        <span className="connection-request-badge connection-request-badge-sent">
                                            ⏳ Pending
                                        </span>
                                    </div>

                                    {/* Request Details */}
                                    <div className="connection-request-details">
                                        <p className="connection-detail-row">
                                            <span className="connection-detail-label">Proposed Relationship:</span>
                                            <strong>{request.relationship_label}</strong>
                                        </p>
                                        <p className="connection-detail-row connection-detail-date">
                                            Sent {new Date(request.requested_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="connection-request-actions connection-request-actions-sent">
                                        <button
                                            className="connection-request-btn-view"
                                            onClick={() => router.visit(route('connections.index'))}
                                            title="View all connections"
                                        >
                                            View My Connections
                                        </button>
                                        <button
                                            className="connection-request-btn-unsend"
                                            onClick={() => handleUnsend(request.id)}
                                            disabled={loading === request.id}
                                            title="Unsend this request"
                                        >
                                            {loading === request.id ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                    Unsending...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 size={18} style={{ display: 'inline' }} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="connections-info-box">
                        <strong>💡 Tip:</strong> Requests will automatically be removed if declined. You can also unsend requests that haven't been responded to yet.
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
