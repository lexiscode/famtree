import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Clock, Check, X, ArrowLeft, AlertCircle, Mail, Phone, MapPin, Cake, FileText, Users, ChevronDown, ChevronUp } from 'lucide-react';
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
    const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);

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

    const toggleExpand = (requestId: number) => {
        setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
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
                            {requests.map(request => {
                                const isExpanded = expandedRequestId === request.id;

                                return (
                                    <div
                                        key={request.id}
                                        className="connection-request-item"
                                    >
                                        {/* Clickable User Info Header */}
                                        <div
                                            className="connection-request-header"
                                            onClick={() => toggleExpand(request.id)}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            <img
                                                src={request.requester.profile_image_url || 'https://via.placeholder.com/56'}
                                                alt={request.requester.name}
                                                className="connection-request-avatar"
                                            />
                                            <div className="connection-request-info">
                                                <h4 className="connection-request-name">{request.requester.name}</h4>
                                                <p className="connection-request-username text-center">@{request.requester.username}</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span className="connection-request-badge connection-request-badge-sent">
                                                    ⏳ Pending
                                                </span>
                                                {isExpanded ? (
                                                    <ChevronUp size={20} style={{ color: '#6b7280' }} />
                                                ) : (
                                                    <ChevronDown size={20} style={{ color: '#6b7280' }} />
                                                )}
                                            </div>
                                        </div>

                                        {/* Collapsible Request Details */}
                                        {isExpanded && (
                                            <div className="connection-request-details pb-3">
                                        {/* Relationship Badge */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{
                                                display: 'inline-block',
                                                backgroundColor: '#f0f4ff',
                                                color: '#4f46e5',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                letterSpacing: '0.3px'
                                            }}>
                                                {request.relationship_label}
                                            </div>
                                        </div>

                                        {/* Info Grid Layout */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '14px',
                                            marginBottom: '14px'
                                        }}>
                                            {/* Email */}
                                            {request.requester.email && (
                                                <div style={{
                                                    padding: '10px 12px',
                                                    backgroundColor: '#f9fafb',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '4px'
                                                    }}>
                                                        <Mail size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            color: '#9ca3af',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>Email</span>
                                                    </div>
                                                    <p style={{
                                                        margin: '0',
                                                        fontSize: '0.875rem',
                                                        color: '#1f2937',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {request.requester.email}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Phone */}
                                            {request.requester.phone && (
                                                <div style={{
                                                    padding: '10px 12px',
                                                    backgroundColor: '#f9fafb',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '4px'
                                                    }}>
                                                        <Phone size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            color: '#9ca3af',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>Phone</span>
                                                    </div>
                                                    <p style={{
                                                        margin: '0',
                                                        fontSize: '0.875rem',
                                                        color: '#1f2937'
                                                    }}>
                                                        {request.requester.phone}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Gender */}
                                            {request.requester.gender && (
                                                <div style={{
                                                    padding: '10px 12px',
                                                    backgroundColor: '#f9fafb',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '4px'
                                                    }}>
                                                        <Users size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            color: '#9ca3af',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>Gender</span>
                                                    </div>
                                                    <p style={{
                                                        margin: '0',
                                                        fontSize: '0.875rem',
                                                        color: '#1f2937'
                                                    }}>
                                                        {request.requester.gender.charAt(0).toUpperCase() + request.requester.gender.slice(1)}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Date of Birth */}
                                            {request.requester.date_of_birth && (
                                                <div style={{
                                                    padding: '10px 12px',
                                                    backgroundColor: '#f9fafb',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '4px'
                                                    }}>
                                                        <Cake size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            color: '#9ca3af',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>DOB</span>
                                                    </div>
                                                    <p style={{
                                                        margin: '0',
                                                        fontSize: '0.875rem',
                                                        color: '#1f2937'
                                                    }}>
                                                        {new Date(request.requester.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Address */}
                                            {request.requester.address && (
                                                <div style={{
                                                    gridColumn: 'span 2',
                                                    padding: '10px 12px',
                                                    backgroundColor: '#f9fafb',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '4px'
                                                    }}>
                                                        <MapPin size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            color: '#9ca3af',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>Address</span>
                                                    </div>
                                                    <p style={{
                                                        margin: '0',
                                                        fontSize: '0.875rem',
                                                        color: '#1f2937'
                                                    }}>
                                                        {request.requester.address}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Bio */}
                                            {request.requester.bio && (
                                                <div style={{
                                                    gridColumn: 'span 2',
                                                    padding: '10px 12px',
                                                    backgroundColor: '#f9fafb',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '4px'
                                                    }}>
                                                        <FileText size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            color: '#9ca3af',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>Bio</span>
                                                    </div>
                                                    <p style={{
                                                        margin: '0',
                                                        fontSize: '0.875rem',
                                                        color: '#1f2937',
                                                        lineHeight: '1.4',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        {request.requester.bio}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status & Date Footer */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingTop: '12px',
                                            borderTop: '1px solid #e5e7eb',
                                            fontSize: '0.875rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {request.requester.status && (
                                                    <>
                                                        <div style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            backgroundColor: request.requester.status === 'alive' ? '#10b981' : '#d1d5db'
                                                        }}></div>
                                                        <span style={{
                                                            color: '#6b7280',
                                                            fontSize: '0.8rem',
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {request.requester.status}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                                                Requested {new Date(request.requested_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                                {/* Actions */}
                                                <div className="connection-request-actions">
                                                    <button
                                                        className="connection-request-btn-accept"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openAcceptModal(request.id);
                                                        }}
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openDeclineModal(request.id);
                                                        }}
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
                                        )}
                                    </div>
                                );
                            })}
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
