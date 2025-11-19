import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Send, Trash2, ArrowLeft, AlertCircle, X } from 'lucide-react';
import { SentRequest, RequestSentProps } from '@/types';
import ProfileSidebar from '../Stories/ProfileSidebar';

export default function RequestSent({
    user,
    requests: initialRequests,
    count,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
}: RequestSentProps) {
    const [requests, setRequests] = useState(initialRequests);
    const [loading, setLoading] = useState<number | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

    const openConfirmModal = (connectionId: number) => {
        setSelectedRequestId(connectionId);
        setShowConfirmModal(true);
    };

    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setSelectedRequestId(null);
    };

    const handleUnsend = async () => {
        if (selectedRequestId === null) return;

        setLoading(selectedRequestId);
        closeConfirmModal();

        try {
            const response = await fetch(route('connections.undo-request', selectedRequestId), {
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
            console.error('Error unsending request:', error);
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
                                        <span className="connection-request-badge connection-request-badge-sent" style={{ color: '#9c9595ff' }}>
                                            ⏳ Pending
                                        </span>
                                    </div>

                                    {/* Request Details */}
                                    <div className="connection-request-details">
                                        <p className="connection-detail-row" style={{ color: '#9c9595ff' }}>
                                            <span className="connection-detail-label">Proposed Relationship: </span>
                                            <strong>{request.relationship_label}</strong>
                                        </p>
                                        <p className="connection-detail-row connection-detail-date" style={{ color: '#9c9595ff' }}>
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
                                            onClick={() => openConfirmModal(request.id)}
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

                {/* Confirmation Modal */}
                {showConfirmModal && (
                    <div className="modal-backdrop-unsend" onClick={closeConfirmModal}>
                        <div className="modal-content-unsend" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header-unsend">
                                <div className="modal-icon-unsend">
                                    <AlertCircle size={24} />
                                </div>
                                <button
                                    className="modal-close-btn-unsend"
                                    onClick={closeConfirmModal}
                                    title="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-body-unsend">
                                <h2 className="modal-title-unsend">Unsend Request?</h2>
                                <p className="modal-message-unsend">
                                    Are you sure you want to unsend this connection request? This action cannot be undone.
                                </p>
                            </div>

                            <div className="modal-footer-unsend">
                                <button
                                    className="modal-btn-cancel-unsend"
                                    onClick={closeConfirmModal}
                                    disabled={loading !== null}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="modal-btn-confirm-unsend"
                                    onClick={handleUnsend}
                                    disabled={loading !== null}
                                >
                                    {loading !== null ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                            Unsending...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={18} style={{ display: 'inline' }} />
                                            Unsend Request
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
