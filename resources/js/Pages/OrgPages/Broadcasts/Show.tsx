import OrgLayout from '@/Layouts/OrgLayout';
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    ArrowLeft, XCircle, Pencil, Calendar, Users, Clock, Repeat,
    ShieldCheck, ShieldX, Flag, FlagOff, Tag, AlertTriangle,
    BarChart3, Eye, CheckCircle2, X, Loader
} from 'lucide-react';

interface BroadcastCreator {
    display_name: string | null;
    username: string;
}

interface DeliveryDetail {
    class_set_id: number;
    class_set_name?: string;
    status: string;
    sent_at?: string;
    error?: string;
}

interface Broadcast {
    id: number;
    uuid: string;
    title: string | null;
    category: string;
    category_label: string;
    priority: string;
    priority_label: string;
    message: string;
    target_type: string;
    target_class_set_ids: number[] | null;
    schedule_type: string;
    scheduled_at: string | null;
    recurrence_type: string | null;
    recurrence_count: number | null;
    recurrences_sent: number | null;
    status: string;
    requires_approval: boolean;
    approval_status: string | null;
    approved_at: string | null;
    rejection_reason: string | null;
    approver: BroadcastCreator | null;
    is_flagged: boolean;
    flag_reason: string | null;
    flagged_at: string | null;
    flagger: BroadcastCreator | null;
    sent_at: string | null;
    sent_to_count: number;
    delivery_details: DeliveryDetail[] | null;
    created_at: string;
    creator: BroadcastCreator;
}

interface AnalyticsData {
    total_sent: number;
    total_reads: number;
    reads_by_class_set: { class_set_id: number; read_count: number }[];
    recent_reads: { user: { id: number; first_name: string; last_name: string; username: string; profile_image: string | null }; read_at: string }[];
}

interface Props {
    broadcast: Broadcast;
    hasFullAccess: boolean;
    categories: Record<string, string>;
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    draft: { color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.15)', label: 'Draft' },
    pending: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', label: 'Pending' },
    sent: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)', label: 'Sent' },
    partially_sent: { color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)', label: 'Partially Sent' },
    cancelled: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Cancelled' },
};

const categoryColors: Record<string, string> = {
    announcement: '#3B82F6',
    event: '#8B5CF6',
    urgent: '#EF4444',
    reminder: '#F59E0B',
    academic: '#06B6D4',
    general: '#6B7280',
};

const priorityColors: Record<string, string> = {
    normal: '#6B7280',
    high: '#F59E0B',
    critical: '#EF4444',
};

export default function BroadcastsShow({ broadcast, hasFullAccess }: Props) {
    const status = statusConfig[broadcast.status] || statusConfig.draft;
    const canCancel = broadcast.status !== 'sent' && broadcast.status !== 'cancelled';
    const canApprove = hasFullAccess && broadcast.requires_approval && broadcast.approval_status === 'pending';
    const canFlag = hasFullAccess && !broadcast.is_flagged;
    const canUnflag = hasFullAccess && broadcast.is_flagged;
    const isSent = broadcast.status === 'sent' || broadcast.status === 'partially_sent';
    const catColor = categoryColors[broadcast.category] || '#6B7280';
    const priColor = priorityColors[broadcast.priority] || '#6B7280';

    // Modals
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showFlagModal, setShowFlagModal] = useState(false);
    const [flagReason, setFlagReason] = useState('');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this broadcast?')) {
            router.post(route('org.broadcasts.cancel', { broadcast: broadcast.id }));
        }
    };

    const handleApprove = () => {
        setProcessing(true);
        router.post(route('org.broadcasts.approve', broadcast.id), {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) return;
        setProcessing(true);
        router.post(route('org.broadcasts.reject', broadcast.id), {
            rejection_reason: rejectionReason,
        }, {
            onFinish: () => { setProcessing(false); setShowRejectModal(false); },
        });
    };

    const handleFlag = () => {
        if (!flagReason.trim()) return;
        setProcessing(true);
        router.post(route('org.broadcasts.flag', broadcast.id), {
            flag_reason: flagReason,
        }, {
            onFinish: () => { setProcessing(false); setShowFlagModal(false); },
        });
    };

    const handleUnflag = () => {
        if (confirm('Remove the flag from this broadcast?')) {
            router.post(route('org.broadcasts.unflag', broadcast.id));
        }
    };

    const loadAnalytics = async () => {
        setLoadingAnalytics(true);
        try {
            const response = await fetch(route('org.broadcasts.analytics', broadcast.id));
            const data = await response.json();
            setAnalytics(data);
        } catch {
            // ignore
        }
        setLoadingAnalytics(false);
    };

    useEffect(() => {
        if (showAnalytics && !analytics) {
            loadAnalytics();
        }
    }, [showAnalytics]);

    const detailRowStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1rem 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    };

    const detailLabelStyle: React.CSSProperties = {
        width: '160px',
        flexShrink: 0,
        color: '#888',
        fontSize: '0.875rem',
        fontWeight: 500,
    };

    const detailValueStyle: React.CSSProperties = {
        color: '#e0e0e0',
        fontSize: '0.875rem',
        flex: 1,
    };

    const modalOverlayStyle: React.CSSProperties = {
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
    };

    const modalStyle: React.CSSProperties = {
        background: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
    };

    return (
        <OrgLayout>
            <div>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => router.visit(route('org.broadcasts.index'))}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#8B5CF6',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            padding: 0,
                            marginBottom: '1rem',
                        }}
                    >
                        <ArrowLeft size={16} />
                        Back to Broadcasts
                    </button>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: catColor,
                                    background: `${catColor}15`,
                                }}>
                                    <Tag size={11} />
                                    {broadcast.category_label}
                                </span>
                                {broadcast.priority !== 'normal' && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: priColor,
                                        background: `${priColor}15`,
                                    }}>
                                        <AlertTriangle size={11} />
                                        {broadcast.priority_label} Priority
                                    </span>
                                )}
                            </div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.5rem' }}>
                                {broadcast.title || 'Untitled Broadcast'}
                            </h1>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: status.color,
                                    background: status.bg,
                                }}>
                                    {status.label}
                                </span>
                                {broadcast.is_flagged && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: '#EF4444',
                                        background: 'rgba(239, 68, 68, 0.15)',
                                    }}>
                                        <Flag size={12} />
                                        Flagged
                                    </span>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {/* Analytics button */}
                            {isSent && (
                                <button
                                    onClick={() => setShowAnalytics(!showAnalytics)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.65rem 1.25rem',
                                        background: showAnalytics ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.08)',
                                        color: '#06B6D4',
                                        border: '1px solid rgba(6, 182, 212, 0.3)',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <BarChart3 size={15} />
                                    Analytics
                                </button>
                            )}

                            {canCancel && (
                                <>
                                    <button
                                        onClick={() => router.visit(route('org.broadcasts.edit', broadcast.id))}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.65rem 1.25rem',
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            color: '#8B5CF6',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Pencil size={15} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.65rem 1.25rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#EF4444',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <XCircle size={15} />
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Approval Section */}
                {canApprove && (
                    <div style={{
                        background: 'rgba(245, 158, 11, 0.06)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <ShieldCheck size={22} color="#F59E0B" />
                            <div>
                                <h3 style={{ color: '#F59E0B', fontWeight: 700, fontSize: '1rem', margin: 0 }}>Approval Required</h3>
                                <p style={{ color: '#888', fontSize: '0.82rem', margin: '0.15rem 0 0' }}>
                                    This broadcast was submitted by {broadcast.creator.display_name || broadcast.creator.username} and needs your review.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={handleApprove}
                                disabled={processing}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.65rem 1.5rem',
                                    background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    opacity: processing ? 0.6 : 1,
                                }}
                            >
                                <CheckCircle2 size={16} />
                                Approve & Send
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                disabled={processing}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.65rem 1.5rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#EF4444',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    opacity: processing ? 0.6 : 1,
                                }}
                            >
                                <ShieldX size={16} />
                                Reject
                            </button>
                        </div>
                    </div>
                )}

                {/* Rejection banner */}
                {broadcast.requires_approval && broadcast.approval_status === 'rejected' && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        marginBottom: '1.5rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <ShieldX size={18} color="#EF4444" />
                            <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.9rem' }}>Broadcast Rejected</span>
                        </div>
                        <p style={{ color: '#ccc', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                            <strong>Reason:</strong> {broadcast.rejection_reason}
                        </p>
                        {broadcast.approver && (
                            <p style={{ color: '#666', fontSize: '0.78rem', margin: '0.5rem 0 0' }}>
                                By {broadcast.approver.display_name || broadcast.approver.username}
                                {broadcast.approved_at && ` on ${new Date(broadcast.approved_at).toLocaleString()}`}
                            </p>
                        )}
                    </div>
                )}

                {/* Approved banner */}
                {broadcast.requires_approval && broadcast.approval_status === 'approved' && (
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.06)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}>
                        <CheckCircle2 size={18} color="#22C55E" />
                        <div>
                            <span style={{ color: '#22C55E', fontWeight: 600, fontSize: '0.85rem' }}>Approved</span>
                            {broadcast.approver && (
                                <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                    by {broadcast.approver.display_name || broadcast.approver.username}
                                    {broadcast.approved_at && ` on ${new Date(broadcast.approved_at).toLocaleString()}`}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Flagged banner */}
                {broadcast.is_flagged && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                <Flag size={16} color="#EF4444" />
                                <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.9rem' }}>Flagged for Review</span>
                            </div>
                            <p style={{ color: '#ccc', fontSize: '0.85rem', margin: 0 }}>
                                <strong>Reason:</strong> {broadcast.flag_reason}
                            </p>
                            {broadcast.flagger && (
                                <p style={{ color: '#666', fontSize: '0.78rem', margin: '0.35rem 0 0' }}>
                                    By {broadcast.flagger.display_name || broadcast.flagger.username}
                                    {broadcast.flagged_at && ` on ${new Date(broadcast.flagged_at).toLocaleString()}`}
                                </p>
                            )}
                        </div>
                        {canUnflag && (
                            <button
                                onClick={handleUnflag}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    color: '#22C55E',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            >
                                <FlagOff size={14} />
                                Unflag
                            </button>
                        )}
                    </div>
                )}

                {/* Analytics Panel */}
                {showAnalytics && (
                    <div style={{
                        background: '#141425',
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                        borderRadius: '12px',
                        padding: '1.75rem',
                        marginBottom: '1.5rem',
                    }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#06B6D4',
                            margin: '0 0 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}>
                            <BarChart3 size={18} />
                            Broadcast Analytics
                        </h3>

                        {loadingAnalytics ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <Loader size={24} color="#06B6D4" style={{ animation: 'spin 1s linear infinite' }} />
                                <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.75rem' }}>Loading analytics...</p>
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : analytics ? (
                            <div>
                                {/* Stats row */}
                                <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        flex: 1,
                                        background: 'rgba(6, 182, 212, 0.06)',
                                        border: '1px solid rgba(6, 182, 212, 0.15)',
                                        borderRadius: '10px',
                                        padding: '1.25rem',
                                        textAlign: 'center',
                                    }}>
                                        <p style={{ color: '#06B6D4', fontSize: '2rem', fontWeight: 800, margin: 0 }}>
                                            {analytics.total_sent}
                                        </p>
                                        <p style={{ color: '#888', fontSize: '0.78rem', margin: '0.25rem 0 0', fontWeight: 500 }}>Groups Delivered</p>
                                    </div>
                                    <div style={{
                                        flex: 1,
                                        background: 'rgba(34, 197, 94, 0.06)',
                                        border: '1px solid rgba(34, 197, 94, 0.15)',
                                        borderRadius: '10px',
                                        padding: '1.25rem',
                                        textAlign: 'center',
                                    }}>
                                        <p style={{ color: '#22C55E', fontSize: '2rem', fontWeight: 800, margin: 0 }}>
                                            {analytics.total_reads}
                                        </p>
                                        <p style={{ color: '#888', fontSize: '0.78rem', margin: '0.25rem 0 0', fontWeight: 500 }}>Total Reads</p>
                                    </div>
                                    <div style={{
                                        flex: 1,
                                        background: 'rgba(139, 92, 246, 0.06)',
                                        border: '1px solid rgba(139, 92, 246, 0.15)',
                                        borderRadius: '10px',
                                        padding: '1.25rem',
                                        textAlign: 'center',
                                    }}>
                                        <p style={{ color: '#8B5CF6', fontSize: '2rem', fontWeight: 800, margin: 0 }}>
                                            {analytics.total_sent > 0 && analytics.total_reads > 0
                                                ? `${Math.round((analytics.total_reads / (analytics.total_sent * 30)) * 100)}%`
                                                : '0%'}
                                        </p>
                                        <p style={{ color: '#888', fontSize: '0.78rem', margin: '0.25rem 0 0', fontWeight: 500 }}>Est. Read Rate</p>
                                    </div>
                                </div>

                                {/* Delivery breakdown */}
                                {broadcast.delivery_details && broadcast.delivery_details.length > 0 && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ color: '#e0e0e0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                                            Delivery Breakdown
                                        </h4>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {broadcast.delivery_details.map((d, i) => (
                                                <div key={i} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.5rem 0',
                                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                }}>
                                                    <span style={{ color: '#ccc', fontSize: '0.82rem' }}>
                                                        {d.class_set_name || `Group #${d.class_set_id}`}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        color: d.status === 'delivered' ? '#22C55E' : '#EF4444',
                                                    }}>
                                                        {d.status === 'delivered' ? 'Delivered' : 'Failed'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent reads */}
                                {analytics.recent_reads.length > 0 && (
                                    <div>
                                        <h4 style={{ color: '#e0e0e0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                                            <Eye size={14} style={{ marginRight: '0.4rem', verticalAlign: 'text-bottom' }} />
                                            Recent Reads
                                        </h4>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {analytics.recent_reads.map((r, i) => (
                                                <div key={i} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.5rem 0',
                                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                }}>
                                                    <div style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.7rem',
                                                        color: '#fff',
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                        overflow: 'hidden',
                                                    }}>
                                                        {r.user.profile_image ? (
                                                            <img src={r.user.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            `${r.user.first_name[0]}${r.user.last_name[0]}`
                                                        )}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <span style={{ color: '#e0e0e0', fontSize: '0.82rem', fontWeight: 500 }}>
                                                            {r.user.first_name} {r.user.last_name}
                                                        </span>
                                                        <span style={{ color: '#666', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                                                            @{r.user.username}
                                                        </span>
                                                    </div>
                                                    <span style={{ color: '#666', fontSize: '0.75rem' }}>
                                                        {new Date(r.read_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {analytics.recent_reads.length === 0 && (
                                    <p style={{ color: '#666', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                                        No read receipts recorded yet.
                                    </p>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Message Card */}
                <div style={{
                    background: '#141425',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                }}>
                    <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#888',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '1rem',
                    }}>
                        Message
                    </h3>
                    <div
                        dangerouslySetInnerHTML={{ __html: broadcast.message }}
                        style={{
                            color: '#e0e0e0',
                            fontSize: '1rem',
                            lineHeight: 1.7,
                            margin: 0,
                            wordBreak: 'break-word',
                        }}
                    />
                </div>

                {/* Details Card */}
                <div style={{
                    background: '#141425',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                }}>
                    <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#888',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '1rem',
                    }}>
                        Details
                    </h3>

                    <div style={detailRowStyle}>
                        <span style={detailLabelStyle}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Tag size={14} /> Category
                            </span>
                        </span>
                        <span style={{ ...detailValueStyle, color: catColor, fontWeight: 600 }}>
                            {broadcast.category_label}
                        </span>
                    </div>

                    <div style={detailRowStyle}>
                        <span style={detailLabelStyle}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertTriangle size={14} /> Priority
                            </span>
                        </span>
                        <span style={{ ...detailValueStyle, color: priColor, fontWeight: 600 }}>
                            {broadcast.priority_label}
                        </span>
                    </div>

                    <div style={detailRowStyle}>
                        <span style={detailLabelStyle}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={14} /> Target
                            </span>
                        </span>
                        <span style={detailValueStyle}>
                            {broadcast.target_type === 'all_groups' ? 'All Groups' : 'Selected Groups'}
                            {broadcast.target_class_set_ids && broadcast.target_class_set_ids.length > 0 && (
                                <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                                    ({broadcast.target_class_set_ids.length} group{broadcast.target_class_set_ids.length !== 1 ? 's' : ''})
                                </span>
                            )}
                        </span>
                    </div>

                    <div style={detailRowStyle}>
                        <span style={detailLabelStyle}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={14} /> Schedule
                            </span>
                        </span>
                        <span style={detailValueStyle}>
                            {broadcast.schedule_type.charAt(0).toUpperCase() + broadcast.schedule_type.slice(1)}
                        </span>
                    </div>

                    {broadcast.scheduled_at && (
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={14} /> Scheduled At
                                </span>
                            </span>
                            <span style={detailValueStyle}>
                                {new Date(broadcast.scheduled_at).toLocaleString()}
                            </span>
                        </div>
                    )}

                    {broadcast.recurrence_type && (
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Repeat size={14} /> Recurrence
                                </span>
                            </span>
                            <span style={detailValueStyle}>
                                {broadcast.recurrence_type.charAt(0).toUpperCase() + broadcast.recurrence_type.slice(1)}
                                {broadcast.recurrence_count && ` (${broadcast.recurrences_sent || 0} of ${broadcast.recurrence_count} sent)`}
                            </span>
                        </div>
                    )}

                    {broadcast.sent_at && (
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Sent At</span>
                            <span style={detailValueStyle}>
                                {new Date(broadcast.sent_at).toLocaleString()}
                            </span>
                        </div>
                    )}

                    <div style={detailRowStyle}>
                        <span style={detailLabelStyle}>Sent To</span>
                        <span style={detailValueStyle}>
                            {broadcast.sent_to_count} group{broadcast.sent_to_count !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div style={{ ...detailRowStyle, borderBottom: 'none' }}>
                        <span style={detailLabelStyle}>Created By</span>
                        <span style={detailValueStyle}>
                            {broadcast.creator.display_name || broadcast.creator.username}
                            <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                                on {new Date(broadcast.created_at).toLocaleString()}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Moderation Actions */}
                {hasFullAccess && (
                    <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'flex-end',
                    }}>
                        {canFlag && (
                            <button
                                onClick={() => setShowFlagModal(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.6rem 1.25rem',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    color: '#EF4444',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                }}
                            >
                                <Flag size={14} />
                                Flag Broadcast
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div style={modalOverlayStyle} onClick={() => setShowRejectModal(false)}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ color: '#EF4444', fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShieldX size={20} />
                                Reject Broadcast
                            </h2>
                            <button onClick={() => setShowRejectModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            Please provide a reason for rejecting this broadcast. The creator will see this message.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            rows={4}
                            style={{
                                width: '100%',
                                background: '#1e1e35',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                padding: '0.875rem',
                                color: '#e0e0e0',
                                fontSize: '0.9rem',
                                outline: 'none',
                                resize: 'vertical',
                                marginBottom: '1.25rem',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#888',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim() || processing}
                                style={{
                                    padding: '0.6rem 1.5rem',
                                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: !rejectionReason.trim() || processing ? 'not-allowed' : 'pointer',
                                    opacity: !rejectionReason.trim() || processing ? 0.6 : 1,
                                }}
                            >
                                Reject Broadcast
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Flag Modal */}
            {showFlagModal && (
                <div style={modalOverlayStyle} onClick={() => setShowFlagModal(false)}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ color: '#EF4444', fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Flag size={20} />
                                Flag Broadcast
                            </h2>
                            <button onClick={() => setShowFlagModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            Flag this broadcast for review. This will mark it for other administrators to investigate.
                        </p>
                        <textarea
                            value={flagReason}
                            onChange={(e) => setFlagReason(e.target.value)}
                            placeholder="Why are you flagging this broadcast?"
                            rows={4}
                            style={{
                                width: '100%',
                                background: '#1e1e35',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                padding: '0.875rem',
                                color: '#e0e0e0',
                                fontSize: '0.9rem',
                                outline: 'none',
                                resize: 'vertical',
                                marginBottom: '1.25rem',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowFlagModal(false)}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#888',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFlag}
                                disabled={!flagReason.trim() || processing}
                                style={{
                                    padding: '0.6rem 1.5rem',
                                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: !flagReason.trim() || processing ? 'not-allowed' : 'pointer',
                                    opacity: !flagReason.trim() || processing ? 0.6 : 1,
                                }}
                            >
                                Flag Broadcast
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </OrgLayout>
    );
}
