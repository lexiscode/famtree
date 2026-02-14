import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    UserMinus,
    User,
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Vote,
    Shield,
    Zap,
} from 'lucide-react';

interface RemovalVote {
    id: number;
    vote: string;
    user: {
        id: number;
        full_name: string;
        username: string;
    } | null;
    created_at: string | null;
}

interface RemovalDetail {
    id: number;
    status: string;
    reason: string | null;
    votes_count: number;
    expires_at: string | null;
    expires_at_formatted: string | null;
    target_user: {
        id: number;
        full_name: string;
        username: string;
    } | null;
    initiator: {
        id: number;
        full_name: string;
        username: string;
    } | null;
    class_set: {
        id: number;
        name: string;
    } | null;
    votes: RemovalVote[];
    created_at: string;
    created_at_formatted: string;
}

interface Props {
    removal: RemovalDetail;
}

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    pending: { bg: '#fff8e1', border: '#ffc107', text: '#856404' },
    completed: { bg: '#e8f5e9', border: '#198754', text: '#155724' },
    cancelled: { bg: '#f3f4f6', border: '#6c757d', text: '#6c757d' },
};

const voteColors: Record<string, { bg: string; border: string; text: string }> = {
    confirm: { bg: '#e8f5e9', border: '#198754', text: '#155724' },
    reject: { bg: '#ffebee', border: '#dc3545', text: '#842029' },
};

export default function RemovalDetailPage({ removal }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const getStatusBadge = (status: string) => {
        const config = statusColors[status] || { bg: '#f3f4f6', border: '#6c757d', text: '#6c757d' };
        return (
            <span style={{
                display: 'inline-block', paddingLeft: '0.6rem', paddingRight: '0.6rem', paddingTop: '0.45rem', paddingBottom: '0.45rem',
                borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, backgroundColor: config.bg, color: config.text,
                border: `1.5px solid ${config.border}`, textTransform: 'capitalize',
            }}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    const getVoteBadge = (vote: string) => {
        const config = voteColors[vote] || { bg: '#f3f4f6', border: '#6c757d', text: '#6c757d' };
        return (
            <span style={{
                display: 'inline-block', paddingLeft: '0.6rem', paddingRight: '0.6rem', paddingTop: '0.45rem', paddingBottom: '0.45rem',
                borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, backgroundColor: config.bg, color: config.text,
                border: `1.5px solid ${config.border}`, textTransform: 'capitalize',
            }}>
                {vote}
            </span>
        );
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this removal request?')) {
            router.post(route('admin.removals.cancel', removal.id), {}, { preserveScroll: true });
        }
    };

    const handleForceExecute = () => {
        if (confirm('Are you sure you want to force execute this removal? The target user will be removed from the group immediately. This action cannot be undone.')) {
            router.post(route('admin.removals.execute', removal.id), {}, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <div>
                {/* Flash Messages */}
                {(flash?.success || flash?.error) && (
                    <div style={{
                        marginBottom: '2rem', padding: '1.25rem 1.5rem', borderRadius: '12px',
                        background: flash?.error ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)' : 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                        border: `1px solid ${flash?.error ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)'}`,
                        color: flash?.error ? '#DC2626' : '#16A34A', fontSize: '0.95rem', fontWeight: 500,
                    }}>
                        {flash?.success || flash?.error}
                    </div>
                )}

                {/* Header */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <button
                            onClick={() => router.get(route('admin.removals.index'))}
                            style={{
                                background: '#E7F5FF', border: '2px solid #cfe2ff', padding: '0.65rem', borderRadius: '12px',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', color: THEME.primary,
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = THEME.primary; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.primary; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#E7F5FF'; e.currentTarget.style.color = THEME.primary; e.currentTarget.style.borderColor = '#cfe2ff'; }}
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>Removal Details</h1>
                            <p style={{ fontSize: '0.98rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>Review removal request information and votes</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleCancel}
                            style={{
                                padding: '0.75rem 1.5rem', background: '#f3f4f6', color: THEME.secondary,
                                border: '2px solid #dee2e6', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.3s', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = THEME.secondary; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.secondary; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = THEME.secondary; e.currentTarget.style.borderColor = '#dee2e6'; }}
                        >
                            <XCircle size={16} /> Cancel Removal
                        </button>
                        {removal.status === 'pending' && (
                            <button
                                onClick={handleForceExecute}
                                style={{
                                    padding: '0.75rem 1.5rem', background: '#ffebee', color: THEME.danger,
                                    border: '2px solid #ffcdd2', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                                    transition: 'all 0.3s', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = THEME.danger; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.danger; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#ffebee'; e.currentTarget.style.color = THEME.danger; e.currentTarget.style.borderColor = '#ffcdd2'; }}
                            >
                                <AlertTriangle size={16} /> Force Execute
                            </button>
                        )}
                    </div>
                </div>

                {/* Removal Info Card */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <UserMinus size={20} color={THEME.danger} /> Removal Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target User</p>
                            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                {removal.target_user?.full_name || 'Unknown'}
                            </p>
                            <p style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>
                                @{removal.target_user?.username || 'N/A'}
                            </p>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Initiator</p>
                            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                {removal.initiator?.full_name || 'Unknown'}
                            </p>
                            <p style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>
                                @{removal.initiator?.username || 'N/A'}
                            </p>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class Set</p>
                            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                {removal.class_set?.name || 'N/A'}
                            </p>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</p>
                            {getStatusBadge(removal.status)}
                        </div>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Votes</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: THEME.primary, margin: 0 }}>{removal.votes_count}</p>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expires At</p>
                            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a0e27', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={14} color={removal.status === 'pending' ? THEME.warning : THEME.secondary} />
                                {removal.expires_at_formatted || 'N/A'}
                            </p>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created At</p>
                            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a0e27', margin: 0 }}>{removal.created_at_formatted}</p>
                        </div>
                    </div>

                    {/* Reason */}
                    {removal.reason && (
                        <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#fff8e1', borderRadius: '14px', border: '1.5px solid #ffc107' }}>
                            <p style={{ fontSize: '0.8rem', color: '#856404', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason for Removal</p>
                            <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#856404', margin: 0, lineHeight: 1.6 }}>{removal.reason}</p>
                        </div>
                    )}
                </div>

                {/* Votes Table */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Vote size={20} color={THEME.info} /> Votes ({removal.votes.length})
                    </h3>
                    {removal.votes.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        {['Voter', 'Vote', 'Date'].map((header) => (
                                            <th key={header} style={{ padding: '1.1rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {removal.votes.map((vote) => (
                                        <tr
                                            key={vote.id}
                                            style={{ borderBottom: '1.5px solid #E5E7EB', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: '#FFFFFF' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                                        >
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>{vote.user?.full_name || 'Unknown'}</p>
                                                    <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>@{vote.user?.username || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                {getVoteBadge(vote.vote)}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {vote.created_at ? new Date(vote.created_at).toLocaleDateString() + ' ' + new Date(vote.created_at).toLocaleTimeString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <Vote size={40} color="#D1D5DB" strokeWidth={1.5} style={{ margin: '0 auto 1rem', display: 'block' }} />
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>No votes have been cast yet</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
