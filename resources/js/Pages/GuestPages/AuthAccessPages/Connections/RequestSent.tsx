import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Send, Trash2, ChevronRight } from 'lucide-react';

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
            <div className="min-vh-100" style={{ backgroundColor: '#F8F9FA', paddingTop: '3rem', paddingBottom: '3rem' }}>
                <div className="container" style={{ maxWidth: '700px' }}>
                    {/* Header */}
                    <div className="mb-4">
                        <h1 className="h2 fw-bold mb-1">Sent Requests</h1>
                        <p className="text-muted">
                            You have <strong>{count}</strong> pending connection request{count !== 1 ? 's' : ''} awaiting response
                        </p>
                    </div>

                    {/* Requests List */}
                    {requests.length === 0 ? (
                        <div
                            className="text-center py-5"
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                            }}
                        >
                            <Send size={48} className="text-muted mb-3" style={{ display: 'block', margin: '0 auto 1rem' }} />
                            <h4 className="fw-semibold">No sent requests</h4>
                            <p className="text-muted mb-4">You haven't sent any connection requests yet.</p>
                            <button
                                className="btn"
                                style={{
                                    background: 'linear-gradient(135deg, #0052E8 0%, #00D4FF 100%)',
                                    color: 'white',
                                    border: 'none',
                                }}
                                onClick={() => router.visit(route('connections.create'))}
                            >
                                Send a Connection Request
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requests.map(request => (
                                <div
                                    key={request.id}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        border: '1px solid #E5E7EB',
                                        padding: '1.5rem',
                                        transition: 'all 0.3s ease',
                                    }}
                                    className="mb-3"
                                >
                                    {/* User Info */}
                                    <div className="d-flex align-items-center mb-3">
                                        <img
                                            src={request.recipient.profile_image_url || 'https://via.placeholder.com/56'}
                                            alt={request.recipient.name}
                                            style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '50%',
                                                marginRight: '1rem',
                                                objectFit: 'cover',
                                            }}
                                        />
                                        <div className="flex-grow-1">
                                            <h5 className="mb-0 fw-semibold">{request.recipient.name}</h5>
                                            <small className="text-muted">@{request.recipient.username}</small>
                                        </div>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                backgroundColor: '#FEF3C7',
                                                color: '#92400E',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                            }}
                                        >
                                            ⏳ Pending
                                        </span>
                                    </div>

                                    {/* Request Details */}
                                    <div className="mb-3 p-3" style={{ backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                                        <p className="mb-1 small">
                                            <strong>Proposed Relationship:</strong> {request.relationship_label}
                                        </p>
                                        <p className="mb-0 small text-muted">
                                            Sent {new Date(request.requested_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn flex-grow-1 btn-outline-secondary"
                                            onClick={() => router.visit(route('connections.index'))}
                                        >
                                            View My Connections
                                        </button>
                                        <button
                                            className="btn btn-outline-danger"
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
                    <div
                        className="mt-4 p-3"
                        style={{
                            backgroundColor: '#DBEAFE',
                            border: '1px solid #93C5FD',
                            borderRadius: '8px',
                            color: '#0C4A6E',
                            fontSize: '0.875rem',
                        }}
                    >
                        <strong>💡 Tip:</strong> Requests will automatically be removed if declined. You can also unsend requests that haven't been responded to yet.
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
