import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Clock, Check, X, ArrowLeft } from 'lucide-react';
import { PendingRequest, PendingRequestsProps } from '@/types';
import ProfileSidebar from '../Stories/ProfileSidebar';

export default function PendingRequests({
    user,
    requests: initialRequests,
    count,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
}: PendingRequestsProps) {
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
                    {/* Header */}
                    <div className="connections-header-simple">
                        <h1 className="connections-title">Pending Requests</h1>
                        <p className="connections-subtitle">
                            You have <strong>{count}</strong> pending connection request{count !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Requests List */}
                    {requests.length === 0 ? (
                        <div className="connections-empty-state">
                            <Clock size={56} className="connections-empty-icon" />
                            <h3 className="connections-empty-title">No pending requests</h3>
                            <p className="connections-empty-text">
                                You're all caught up! Check back later for new connection requests.
                            </p>
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
                                            src={request.requester.profile_image_url || 'https://via.placeholder.com/56'}
                                            alt={request.requester.name}
                                            className="connection-request-avatar"
                                        />
                                        <div className="connection-request-info">
                                            <h4 className="connection-request-name">{request.requester.name}</h4>
                                            <p className="connection-request-username">@{request.requester.username}</p>
                                        </div>
                                        <span className="connection-request-badge">
                                            ⏳ Pending
                                        </span>
                                    </div>

                                    {/* Request Details */}
                                    <div className="connection-request-details">
                                        <p className="connection-detail-row">
                                            <span className="connection-detail-label">Claimed Relationship:</span>
                                            <strong>{request.relationship_label}</strong>
                                        </p>
                                        <p className="connection-detail-row connection-detail-date">
                                            Requested {new Date(request.requested_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="connection-request-actions">
                                        <button
                                            className="connection-request-btn-accept"
                                            onClick={() => handleAccept(request.id)}
                                            disabled={loading === request.id}
                                            title="Accept this connection request"
                                        >
                                            {loading === request.id ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                    Accepting...
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={18} style={{ display: 'inline' }} />
                                                    Accept
                                                </>
                                            )}
                                        </button>
                                        <button
                                            className="connection-request-btn-decline"
                                            onClick={() => handleDecline(request.id)}
                                            disabled={loading === request.id}
                                            title="Decline this connection request"
                                        >
                                            {loading === request.id ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                    Declining...
                                                </>
                                            ) : (
                                                <>
                                                    <X size={18} style={{ display: 'inline' }} />
                                                    Decline
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
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
            </div>
        </AuthAccessLayout>
    );
}
