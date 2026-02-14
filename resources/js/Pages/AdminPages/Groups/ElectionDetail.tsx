import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Vote,
    Users,
    Trophy,
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Timer,
    Award,
    User,
} from 'lucide-react';

interface Candidate {
    id: number;
    votes_count: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        full_name: string;
        username: string;
        email: string;
        profile_image_url: string | null;
    } | null;
}

interface VoteRecord {
    id: number;
    voter: {
        id: number;
        full_name: string;
        username: string;
    } | null;
    candidate: {
        id: number;
        full_name: string;
        username: string;
    } | null;
    created_at: string | null;
}

interface Election {
    id: number;
    type: string;
    status: string;
    positions_to_fill: number;
    is_active: boolean;
    has_ended: boolean;
    candidates_count: number;
    votes_count: number;
    started_at: string | null;
    started_at_formatted: string | null;
    ends_at: string | null;
    ends_at_formatted: string | null;
    class_set: {
        id: number;
        uuid: string;
        name: string;
        year: string | null;
        department: { id: number; name: string } | null;
    } | null;
    parent_election: {
        id: number;
        type: string;
        status: string;
    } | null;
    candidates: Candidate[];
    votes: VoteRecord[];
    created_at: string;
    created_at_formatted: string;
}

interface Props {
    election: Election;
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
    active: { bg: '#e8f5e9', border: '#198754', text: '#155724' },
    completed: { bg: '#e0f7fa', border: '#0dcaf0', text: '#0c5460' },
    cancelled: { bg: '#ffebee', border: '#dc3545', text: '#842029' },
    tiebreaker: { bg: '#fff8e1', border: '#ffc107', text: '#856404' },
};

function UserAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={name}
                style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', display: 'block' }}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
            color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.9rem',
        }}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function ElectionDetail({ election }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [extendHours, setExtendHours] = useState(24);

    const sortedCandidates = [...election.candidates].sort((a, b) => b.votes_count - a.votes_count);

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

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this election? This action cannot be undone.')) {
            router.post(route('admin.elections.cancel', election.id), {}, { preserveScroll: true });
        }
    };

    const handleExtend = () => {
        if (extendHours <= 0) return;
        if (confirm(`Are you sure you want to extend this election by ${extendHours} hours?`)) {
            router.post(route('admin.elections.extend', election.id), { hours: extendHours }, { preserveScroll: true });
        }
    };

    const getRankIndicator = (index: number) => {
        if (index === 0) return { icon: Trophy, color: '#FFD700', label: '1st' };
        if (index === 1) return { icon: Award, color: '#C0C0C0', label: '2nd' };
        if (index === 2) return { icon: Award, color: '#CD7F32', label: '3rd' };
        return { icon: User, color: THEME.secondary, label: `${index + 1}th` };
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
                            onClick={() => router.get(route('admin.elections.index'))}
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
                            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>Election Details</h1>
                            <p style={{ fontSize: '0.98rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>Review election information, candidates, and votes</p>
                        </div>
                    </div>
                    {election.is_active && (
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={handleCancel}
                                style={{
                                    padding: '0.75rem 1.5rem', background: '#ffebee', color: THEME.danger,
                                    border: '2px solid #ffcdd2', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                                    transition: 'all 0.3s', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = THEME.danger; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.danger; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#ffebee'; e.currentTarget.style.color = THEME.danger; e.currentTarget.style.borderColor = '#ffcdd2'; }}
                            >
                                <XCircle size={16} /> Cancel Election
                            </button>
                        </div>
                    )}
                </div>

                {/* Election Info Card */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Vote size={20} color={THEME.primary} /> Election Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</p>
                            <span style={{
                                display: 'inline-block', paddingLeft: '0.6rem', paddingRight: '0.6rem', paddingTop: '0.45rem', paddingBottom: '0.45rem',
                                borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700, backgroundColor: '#e7f1ff', color: '#084298', border: '1.5px solid #cfe2ff', textTransform: 'capitalize',
                            }}>
                                {election.type.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</p>
                            {getStatusBadge(election.status)}
                        </div>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Positions to Fill</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: THEME.primary, margin: 0 }}>{election.positions_to_fill}</p>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class Set</p>
                            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                {election.class_set?.name || 'N/A'}
                            </p>
                            {election.class_set?.department && (
                                <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>
                                    {election.class_set.department.name}{election.class_set.year ? ` - ${election.class_set.year}` : ''}
                                </p>
                            )}
                        </div>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Started At</p>
                            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a0e27', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={14} color={THEME.secondary} />
                                {election.started_at_formatted || 'N/A'}
                            </p>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ends At</p>
                            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a0e27', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={14} color={election.is_active ? THEME.warning : THEME.secondary} />
                                {election.ends_at_formatted || 'N/A'}
                            </p>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created At</p>
                            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a0e27', margin: 0 }}>{election.created_at_formatted}</p>
                        </div>
                        {election.parent_election && (
                            <div style={{ padding: '1.25rem', background: '#fff8e1', borderRadius: '14px', border: '1.5px solid #ffc107' }}>
                                <p style={{ fontSize: '0.8rem', color: '#856404', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Parent Election</p>
                                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#856404', margin: 0 }}>
                                    #{election.parent_election.id} - {election.parent_election.type.replace(/_/g, ' ')} ({election.parent_election.status})
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Extend Election (Active only) */}
                {election.is_active && (
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Timer size={20} color={THEME.warning} /> Extend Election
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.92rem', fontWeight: 600, color: '#4B5563' }}>Hours:</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={extendHours}
                                    onChange={(e) => setExtendHours(Math.max(1, parseInt(e.target.value) || 1))}
                                    style={{
                                        width: '100px', padding: '0.65rem 1rem', border: '2px solid #E5E7EB', borderRadius: '10px',
                                        fontSize: '0.95rem', color: '#0a0e27', fontWeight: 600, backgroundColor: '#FFFFFF',
                                    }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <button
                                onClick={handleExtend}
                                style={{
                                    padding: '0.75rem 1.5rem', background: '#fff8e1', color: '#856404',
                                    border: '2px solid #ffc107', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                                    transition: 'all 0.3s', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = THEME.warning; e.currentTarget.style.color = '#000'; e.currentTarget.style.borderColor = THEME.warning; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff8e1'; e.currentTarget.style.color = '#856404'; e.currentTarget.style.borderColor = '#ffc107'; }}
                            >
                                <Timer size={16} /> Extend Election
                            </button>
                        </div>
                    </div>
                )}

                {/* Candidates Table */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Users size={20} color={THEME.success} /> Candidates ({election.candidates_count})
                    </h3>
                    {sortedCandidates.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        {['Rank', 'Name', 'Username', 'Email', 'Votes'].map((header) => (
                                            <th key={header} style={{ padding: '1.1rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedCandidates.map((candidate, index) => {
                                        const rank = getRankIndicator(index);
                                        const RankIcon = rank.icon;
                                        return (
                                            <tr
                                                key={candidate.id}
                                                style={{ borderBottom: '1.5px solid #E5E7EB', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: index === 0 ? '#FFFBEB' : '#FFFFFF' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = index === 0 ? '#FFF3CD' : '#F9FAFB'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = index === 0 ? '#FFFBEB' : '#FFFFFF'; }}
                                            >
                                                <td style={{ padding: '1.2rem 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <RankIcon size={18} color={rank.color} strokeWidth={2} />
                                                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: rank.color }}>{rank.label}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                        <UserAvatar imageUrl={candidate.user?.profile_image_url || null} name={candidate.user?.full_name || 'Unknown'} />
                                                        <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                                            {candidate.user?.full_name || 'Unknown User'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#9CA3AF', fontWeight: 500 }}>
                                                    @{candidate.user?.username || 'N/A'}
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                    {candidate.user?.email || 'N/A'}
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem' }}>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                        padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 800,
                                                        backgroundColor: index === 0 ? '#e8f5e9' : '#f3f4f6',
                                                        color: index === 0 ? THEME.success : '#0a0e27',
                                                        border: `1.5px solid ${index === 0 ? '#a5d6a7' : '#E5E7EB'}`,
                                                    }}>
                                                        <Vote size={14} /> {candidate.votes_count}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <Users size={40} color="#D1D5DB" strokeWidth={1.5} style={{ margin: '0 auto 1rem', display: 'block' }} />
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>No candidates registered for this election</p>
                        </div>
                    )}
                </div>

                {/* Votes Table */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Vote size={20} color={THEME.info} /> Votes ({election.votes_count})
                    </h3>
                    {election.votes.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        {['Voter', 'Voted For', 'Date'].map((header) => (
                                            <th key={header} style={{ padding: '1.1rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {election.votes.map((vote) => (
                                        <tr
                                            key={vote.id}
                                            style={{ borderBottom: '1.5px solid #E5E7EB', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: '#FFFFFF' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                                        >
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>{vote.voter?.full_name || 'Unknown'}</p>
                                                    <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>@{vote.voter?.username || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>{vote.candidate?.full_name || 'Unknown'}</p>
                                                    <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>@{vote.candidate?.username || 'N/A'}</p>
                                                </div>
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
