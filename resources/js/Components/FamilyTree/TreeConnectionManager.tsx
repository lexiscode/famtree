import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Users, Send, Check, X, Link2, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import './TreeConnectionManager.css';

interface TreeConnection {
    id: number;
    requester_tree_id: number;
    recipient_tree_id: number;
    status: 'pending' | 'accepted' | 'declined';
    requested_at: string;
    accepted_at?: string;
    message?: string;
    requester_tree?: {
        id: number;
        tree_name: string;
    };
    recipient_tree?: {
        id: number;
        tree_name: string;
    };
    requested_by?: {
        id: number;
        first_name: string;
        last_name: string;
    };
}

interface Props {
    treeId: number;
    treeName: string;
    pendingRequests: TreeConnection[];
    sentRequests: TreeConnection[];
    acceptedConnections: TreeConnection[];
    isAdmin: boolean;
}

export default function TreeConnectionManager({
    treeId,
    treeName,
    pendingRequests,
    sentRequests,
    acceptedConnections,
    isAdmin,
}: Props) {
    const [showSendForm, setShowSendForm] = useState(false);
    const [targetTreeId, setTargetTreeId] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendRequest = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.post(
            route('family-tree.connections.send'),
            {
                my_tree_id: treeId,
                target_tree_id: parseInt(targetTreeId),
                message: message || null,
            },
            {
                onSuccess: () => {
                    setTargetTreeId('');
                    setMessage('');
                    setShowSendForm(false);
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                },
            }
        );
    }, [treeId, targetTreeId, message]);

    const handleAccept = useCallback((connectionId: number) => {
        if (confirm('Accept this tree connection request? The trees will be merged into one.')) {
            router.post(route('family-tree.connections.accept', connectionId));
        }
    }, []);

    const handleDecline = useCallback((connectionId: number) => {
        if (confirm('Decline this tree connection request?')) {
            router.post(route('family-tree.connections.decline', connectionId));
        }
    }, []);

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="tree-connection-manager">
            {/* Header */}
            <div className="connection-header">
                <div className="connection-title-group">
                    <Link2 size={28} className="connection-icon" />
                    <div>
                        <h3 className="connection-title">Tree Connections</h3>
                        <p className="connection-subtitle">Merge family trees to expand your network</p>
                    </div>
                </div>
                {!showSendForm && (
                    <button onClick={() => setShowSendForm(true)} className="connection-btn-send">
                        <Send size={18} />
                        <span>Send Request</span>
                        <div className="button-glow"></div>
                    </button>
                )}
            </div>

            {/* Send Connection Request Form */}
            {showSendForm && (
                <div className="connection-form-card">
                    <div className="form-card-header">
                        <div className="form-card-icon">
                            <Send size={24} />
                        </div>
                        <div>
                            <h4 className="form-card-title">Send Connection Request</h4>
                            <p className="form-card-subtitle">Connect with another family tree</p>
                        </div>
                    </div>

                    <form onSubmit={handleSendRequest} className="connection-form">
                        <div className="form-group">
                            <label htmlFor="targetTreeId" className="form-label">
                                Target Tree UUID <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="targetTreeId"
                                value={targetTreeId}
                                onChange={(e) => setTargetTreeId(e.target.value)}
                                placeholder="e.g., 92cfb3ed-7378-473f-ae30-84a47fc16bbf"
                                required
                                className="form-input"
                            />
                            <span className="form-hint">Enter the UUID of the tree you want to connect with</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="message" className="form-label">
                                Message <span className="optional">(Optional)</span>
                            </label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Explain how the families are related or why you're requesting a connection..."
                                rows={4}
                                className="form-textarea"
                            />
                            <span className="form-hint">Help the other tree admin understand the connection</span>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSendForm(false);
                                    setTargetTreeId('');
                                    setMessage('');
                                }}
                                className="form-btn form-btn-cancel"
                            >
                                <ArrowLeft size={18} />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !targetTreeId.trim()}
                                className="form-btn form-btn-submit"
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Send Request
                                    </>
                                )}
                                <div className="button-glow"></div>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Pending Requests (Received) */}
            {pendingRequests.length > 0 && (
                <div className="connection-section">
                    <div className="section-header">
                        <div className="section-badge pending">
                            <AlertCircle size={16} />
                            {pendingRequests.length} Pending
                        </div>
                        <h4 className="section-title">Requests Awaiting Your Response</h4>
                    </div>
                    <div className="connection-list">
                        {pendingRequests.map((request) => (
                            <div key={request.id} className="connection-card pending-card">
                                <div className="card-content">
                                    <div className="card-header">
                                        <div className="tree-name-badge">
                                            {request.requester_tree?.tree_name}
                                        </div>
                                        <div className="requested-by">
                                            Requested by {request.requested_by?.first_name} {request.requested_by?.last_name}
                                        </div>
                                    </div>
                                    {request.message && (
                                        <div className="request-message">
                                            <span className="message-icon">"</span>
                                            {request.message}
                                            <span className="message-icon">"</span>
                                        </div>
                                    )}
                                    <div className="request-date">
                                        Received {new Date(request.requested_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button onClick={() => handleAccept(request.id)} className="action-btn accept-btn">
                                        <Check size={18} />
                                        Accept & Merge
                                    </button>
                                    <button onClick={() => handleDecline(request.id)} className="action-btn decline-btn">
                                        <X size={18} />
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
                <div className="connection-section">
                    <div className="section-header">
                        <div className="section-badge sent">
                            <Send size={16} />
                            {sentRequests.length} Sent
                        </div>
                        <h4 className="section-title">Requests Awaiting Response</h4>
                    </div>
                    <div className="connection-list">
                        {sentRequests.map((request) => (
                            <div key={request.id} className="connection-card sent-card">
                                <div className="sent-icon">
                                    <Send size={20} />
                                </div>
                                <div className="card-content">
                                    <div className="tree-name">To: {request.recipient_tree?.tree_name}</div>
                                    <div className="sent-status">Waiting for response...</div>
                                    <div className="request-date">
                                        Sent {new Date(request.requested_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Accepted Connections */}
            {acceptedConnections.length > 0 && (
                <div className="connection-section">
                    <div className="section-header">
                        <div className="section-badge merged">
                            <Check size={16} />
                            {acceptedConnections.length} Merged
                        </div>
                        <h4 className="section-title">Successfully Merged Trees</h4>
                    </div>
                    <div className="connection-list">
                        {acceptedConnections.map((connection) => (
                            <div key={connection.id} className="connection-card merged-card">
                                <div className="merged-icon">
                                    <Link2 size={24} />
                                </div>
                                <div className="card-content">
                                    <div className="merged-trees">
                                        {connection.requester_tree?.tree_name} ↔ {connection.recipient_tree?.tree_name}
                                    </div>
                                    <div className="merged-date">
                                        Merged on {new Date(connection.accepted_at!).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {pendingRequests.length === 0 && sentRequests.length === 0 && acceptedConnections.length === 0 && !showSendForm && (
                <div className="connection-empty-state">
                    <div className="empty-icon">
                        <Link2 size={64} strokeWidth={1.5} />
                    </div>
                    <h4 className="empty-title">No Tree Connections Yet</h4>
                    <p className="empty-text">
                        Connect with other family trees to merge your families and expand your network.
                        Send a connection request to get started.
                    </p>
                    <button onClick={() => setShowSendForm(true)} className="empty-cta">
                        <Send size={18} />
                        <span>Send Connection Request</span>
                    </button>
                </div>
            )}
        </div>
    );
}
