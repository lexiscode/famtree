import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Clock, Check, X, ArrowLeft, AlertCircle } from 'lucide-react';
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
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

    const openAcceptModal = (connectionId: number) => {
        setSelectedRequestId(connectionId);
        setShowAcceptModal(true);
    };

    const closeAcceptModal = () => {
        setShowAcceptModal(false);
        setSelectedRequestId(null);
    };

    const openDeclineModal = (connectionId: number) => {
        setSelectedRequestId(connectionId);
        setShowDeclineModal(true);
    };

    const closeDeclineModal = () => {
        setShowDeclineModal(false);
        setSelectedRequestId(null);
    };

    const handleAccept = async () => {
        if (selectedRequestId === null) return;

        setLoading(selectedRequestId);
        closeAcceptModal();

        try {
            const response = await fetch(route('connections.accept', selectedRequestId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setRequests(requests.filter(r => r.id !== selectedRequestId));
            }
        } catch (error) {
            console.error('Error accepting request:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleDecline = async () => {
        if (selectedRequestId === null) return;

        setLoading(selectedRequestId);
        closeDeclineModal();

        try {
            const response = await fetch(route('connections.decline', selectedRequestId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setRequests(requests.filter(r => r.id !== selectedRequestId));
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
                                        <span className="connection-request-badge connection-request-badge-sent">
                                            ⏳ Pending
                                        </span>
                                    </div>

                                    {/* Request Details */}
                                    <div className="connection-request-details pb-3">
                                        <p className="connection-detail-row" style={{ color: '#9c9595ff' }} >
                                            <span className="connection-detail-label">Claimed Relationship: </span>
                                            <strong>{request.relationship_label}</strong>
                                        </p>
                                        <p className="connection-detail-row connection-detail-date" style={{ color: '#9c9595ff' }}>
                                            Requested {new Date(request.requested_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="connection-request-actions">
                                        <button
                                            className="connection-request-btn-accept"
                                            onClick={() => openAcceptModal(request.id)}
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
                                            onClick={() => openDeclineModal(request.id)}
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

                {/* Accept Confirmation Modal */}
                {showAcceptModal && (
                    <div className="modal-backdrop-accept" onClick={closeAcceptModal}>
                        <div className="modal-content-accept" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header-accept">
                                <div className="modal-icon-accept">
                                    <Check size={24} />
                                </div>
                                <button
                                    className="modal-close-btn-accept"
                                    onClick={closeAcceptModal}
                                    title="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-body-accept">
                                <h2 className="modal-title-accept">Accept Request?</h2>
                                <p className="modal-message-accept">
                                    Are you sure you want to accept this connection request? You will be connected with this person.
                                </p>
                            </div>

                            <div className="modal-footer-accept">
                                <button
                                    className="modal-btn-cancel-accept"
                                    onClick={closeAcceptModal}
                                    disabled={loading !== null}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="modal-btn-confirm-accept"
                                    onClick={handleAccept}
                                    disabled={loading !== null}
                                >
                                    {loading !== null ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                            Accepting...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} style={{ display: 'inline' }} />
                                            Accept Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Decline Confirmation Modal */}
                {showDeclineModal && (
                    <div className="modal-backdrop-decline" onClick={closeDeclineModal}>
                        <div className="modal-content-decline" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header-decline">
                                <div className="modal-icon-decline">
                                    <AlertCircle size={24} />
                                </div>
                                <button
                                    className="modal-close-btn-decline"
                                    onClick={closeDeclineModal}
                                    title="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-body-decline">
                                <h2 className="modal-title-decline">Decline Request?</h2>
                                <p className="modal-message-decline">
                                    Are you sure you want to decline this connection request? This action cannot be undone.
                                </p>
                            </div>

                            <div className="modal-footer-decline">
                                <button
                                    className="modal-btn-cancel-decline"
                                    onClick={closeDeclineModal}
                                    disabled={loading !== null}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="modal-btn-confirm-decline"
                                    onClick={handleDecline}
                                    disabled={loading !== null}
                                >
                                    {loading !== null ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                            Declining...
                                        </>
                                    ) : (
                                        <>
                                            <X size={18} style={{ display: 'inline' }} />
                                            Decline Request
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
