import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Users, Send, Check, X, Link2, AlertCircle } from 'lucide-react';

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
        <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#1a202c' }}>
                    Tree Connections
                </h3>
                {!showSendForm && (
                    <button
                        onClick={() => setShowSendForm(true)}
                        style={{
                            background: '#0052E8',
                            color: 'white',
                            border: 'none',
                            padding: '0.65rem 1.2rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <Send size={16} />
                        Send Connection Request
                    </button>
                )}
            </div>

            {/* Send Connection Request Form */}
            {showSendForm && (
                <div style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Send Connection Request</h4>
                    <form onSubmit={handleSendRequest}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                                Target Tree ID
                            </label>
                            <input
                                type="number"
                                value={targetTreeId}
                                onChange={(e) => setTargetTreeId(e.target.value)}
                                placeholder="Enter the ID of the tree you want to connect with"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                                Message (Optional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Add a message explaining the connection..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    resize: 'vertical',
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                type="submit"
                                disabled={loading || !targetTreeId}
                                style={{
                                    background: loading || !targetTreeId ? '#cbd5e0' : '#0052E8',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.65rem 1.2rem',
                                    borderRadius: '8px',
                                    cursor: loading || !targetTreeId ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                }}
                            >
                                {loading ? 'Sending...' : 'Send Request'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSendForm(false);
                                    setTargetTreeId('');
                                    setMessage('');
                                }}
                                style={{
                                    background: '#e2e8f0',
                                    color: '#4a5568',
                                    border: 'none',
                                    padding: '0.65rem 1.2rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Pending Requests (Received) */}
            {pendingRequests.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 600, color: '#2d3748' }}>
                        Pending Requests ({pendingRequests.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {pendingRequests.map((request) => (
                            <div
                                key={request.id}
                                style={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    padding: '1.2rem',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>
                                            {request.requester_tree?.tree_name}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem' }}>
                                            Requested by {request.requested_by?.first_name} {request.requested_by?.last_name}
                                        </div>
                                        {request.message && (
                                            <div style={{ fontSize: '0.9rem', color: '#4a5568', fontStyle: 'italic', marginTop: '0.5rem' }}>
                                                "{request.message}"
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                        <button
                                            onClick={() => handleAccept(request.id)}
                                            style={{
                                                background: '#48bb78',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                            }}
                                        >
                                            <Check size={14} />
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleDecline(request.id)}
                                            style={{
                                                background: '#f56565',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                            }}
                                        >
                                            <X size={14} />
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 600, color: '#2d3748' }}>
                        Sent Requests ({sentRequests.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {sentRequests.map((request) => (
                            <div
                                key={request.id}
                                style={{
                                    background: '#fffaf0',
                                    border: '1px solid #fbd38d',
                                    borderRadius: '10px',
                                    padding: '1.2rem',
                                }}
                            >
                                <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>
                                    To: {request.recipient_tree?.tree_name}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#744210' }}>
                                    Waiting for response...
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Accepted Connections */}
            {acceptedConnections.length > 0 && (
                <div>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 600, color: '#2d3748' }}>
                        Merged Trees ({acceptedConnections.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {acceptedConnections.map((connection) => (
                            <div
                                key={connection.id}
                                style={{
                                    background: '#f0fff4',
                                    border: '1px solid #9ae6b4',
                                    borderRadius: '10px',
                                    padding: '1.2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                }}
                            >
                                <Link2 size={20} style={{ color: '#38a169' }} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>
                                        {connection.requester_tree?.tree_name} ↔ {connection.recipient_tree?.tree_name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#2f855a' }}>
                                        Merged on {new Date(connection.accepted_at!).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {pendingRequests.length === 0 && sentRequests.length === 0 && acceptedConnections.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#718096' }}>
                    <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                        No tree connections yet. Send a connection request to another family tree to merge your families together.
                    </p>
                </div>
            )}
        </div>
    );
}
