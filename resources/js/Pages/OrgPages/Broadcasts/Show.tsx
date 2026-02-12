import OrgLayout from '@/Layouts/OrgLayout';
import { router } from '@inertiajs/react';
import { ArrowLeft, XCircle, Calendar, Users, Clock, Repeat } from 'lucide-react';

interface BroadcastCreator {
    display_name: string | null;
    username: string;
}

interface Broadcast {
    id: number;
    uuid: string;
    title: string | null;
    message: string;
    target_type: string;
    target_class_set_ids: number[] | null;
    schedule_type: string;
    scheduled_at: string | null;
    recurrence_type: string | null;
    recurrence_count: number | null;
    recurrences_sent: number | null;
    status: string;
    sent_at: string | null;
    sent_to_count: number;
    creator: BroadcastCreator;
}

interface Props {
    broadcast: Broadcast;
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    draft: { color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.15)', label: 'Draft' },
    pending: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', label: 'Pending' },
    sent: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)', label: 'Sent' },
    cancelled: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Cancelled' },
};

export default function BroadcastsShow({ broadcast }: Props) {
    const status = statusConfig[broadcast.status] || statusConfig.draft;
    const canCancel = broadcast.status !== 'sent' && broadcast.status !== 'cancelled';

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this broadcast?')) {
            router.post(route('org.broadcasts.cancel', { broadcast: broadcast.uuid }));
        }
    };

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
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.5rem' }}>
                                {broadcast.title || 'Untitled Broadcast'}
                            </h1>
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
                        </div>
                        {canCancel && (
                            <button
                                onClick={handleCancel}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#EF4444',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                            >
                                <XCircle size={16} />
                                Cancel Broadcast
                            </button>
                        )}
                    </div>
                </div>

                {/* Message Card */}
                <div style={{
                    background: '#111118',
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
                    <p style={{
                        color: '#e0e0e0',
                        fontSize: '1rem',
                        lineHeight: 1.7,
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                    }}>
                        {broadcast.message}
                    </p>
                </div>

                {/* Details Card */}
                <div style={{
                    background: '#111118',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '2rem',
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
                            {broadcast.sent_to_count} recipient{broadcast.sent_to_count !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div style={{ ...detailRowStyle, borderBottom: 'none' }}>
                        <span style={detailLabelStyle}>Created By</span>
                        <span style={detailValueStyle}>
                            {broadcast.creator.display_name || broadcast.creator.username}
                        </span>
                    </div>
                </div>
            </div>
        </OrgLayout>
    );
}
