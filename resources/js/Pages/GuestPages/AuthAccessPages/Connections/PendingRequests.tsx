import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Clock, Check, X, ChevronRight } from 'lucide-react';

interface Request {
    id: number;
    requester: {
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
    requests: Request[];
    count: number;
}

export default function PendingRequests({ requests: initialRequests, count }: Props) {
    const [requests, setRequests] = useState(initialRequests);
    const [loading, setLoading] = useState<number | null>(null);

    const handleAccept = async (connectionId: number) => {
        setLoading(connectionId);
        try {
            const response = await fetch(route('connections.accept', connectionId), {
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
            console.error('Error accepting request:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleDecline = async (connectionId: number) => {
        if (!confirm('Are you sure you want to decline this connection request?')) {
            return;
        }

        setLoading(connectionId);
        try {
            const response = await fetch(route('connections.decline', connectionId), {
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
            console.error('Error declining request:', error);
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
                        <h1 className="h2 fw-bold mb-1">Pending Requests</h1>
                        <p className="text-muted">
                            You have <strong>{count}</strong> pending connection request{count !== 1 ? 's' : ''}
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
                            <Clock size={48} className="text-muted mb-3" style={{ display: 'block', margin: '0 auto 1rem' }} />
                            <h4 className="fw-semibold">No pending requests</h4>
                            <p className="text-muted">You're all caught up! Check back later for new connection requests.</p>
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
                                            src={request.requester.profile_image_url || 'https://via.placeholder.com/56'}
                                            alt={request.requester.name}
                                            style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '50%',
                                                marginRight: '1rem',
                                                objectFit: 'cover',
                                            }}
                                        />
                                        <div className="flex-grow-1">
                                            <h5 className="mb-0 fw-semibold">{request.requester.name}</h5>
                                            <small className="text-muted">@{request.requester.username}</small>
                                        </div>
                                        <ChevronRight size={20} className="text-muted" />
                                    </div>

                                    {/* Request Details */}
                                    <div className="mb-3 p-3" style={{ backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                                        <p className="mb-1 small">
                                            <strong>Claimed Relationship:</strong> {request.relationship_label}
                                        </p>
                                        <p className="mb-0 small text-muted">
                                            Requested {new Date(request.requested_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn flex-grow-1"
                                            style={{
                                                background: 'linear-gradient(135deg, #00D97F 0%, #00B981 100%)',
                                                color: 'white',
                                                border: 'none',
                                            }}
                                            onClick={() => handleAccept(request.id)}
                                            disabled={loading === request.id}
                                        >
                                            {loading === request.id ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                    Accepting...
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={18} className="me-2" style={{ display: 'inline' }} />
                                                    Accept
                                                </>
                                            )}
                                        </button>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() => handleDecline(request.id)}
                                            disabled={loading === request.id}
                                        >
                                            {loading === request.id ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                    Declining...
                                                </>
                                            ) : (
                                                <>
                                                    <X size={18} className="me-2" style={{ display: 'inline' }} />
                                                    Decline
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
