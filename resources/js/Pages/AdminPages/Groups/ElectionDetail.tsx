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

function getStatusBadgeClass(status: string): string {
    switch (status) {
        case 'active': return 'ap-badge ap-badge-success';
        case 'completed': return 'ap-badge ap-badge-info';
        case 'cancelled': return 'ap-badge ap-badge-danger';
        case 'tiebreaker': return 'ap-badge ap-badge-warning';
        default: return 'ap-badge ap-badge-neutral';
    }
}

function getVoteBadgeClass(vote: string): string {
    switch (vote) {
        case 'confirm': return 'ap-badge ap-badge-success';
        case 'reject': return 'ap-badge ap-badge-danger';
        default: return 'ap-badge ap-badge-neutral';
    }
}

function UserAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <div className="ap-avatar ap-avatar-lg ap-avatar-indigo">
                <img
                    src={imageUrl}
                    alt={name}
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    return (
        <div className="ap-avatar ap-avatar-lg ap-avatar-indigo">
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function ElectionDetail({ election }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [extendHours, setExtendHours] = useState(24);

    const sortedCandidates = [...election.candidates].sort((a, b) => b.votes_count - a.votes_count);

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

    return (
        <AdminLayout>
            <div>
{/* Back Button */}
                <button
                    className="ap-back-btn"
                    onClick={() => router.get(route('admin.elections.index'))}
                >
                    <ArrowLeft size={16} /> Back to Elections
                </button>

                {/* Header */}
                <div className="ap-page-header">
                    <div className="ap-page-header-row">
                        <div>
                            <h1 className="ap-page-title">Election Details</h1>
                            <p className="ap-page-subtitle">Review election information, candidates, and votes</p>
                        </div>
                        {election.is_active && (
                            <div className="ap-page-header-actions">
                                <button
                                    className="ap-btn ap-btn-danger"
                                    onClick={handleCancel}
                                >
                                    <XCircle size={16} /> Cancel Election
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Election Info Card */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-card-header">
                        <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                            <Vote size={18} className="ap-icon-primary" /> Election Information
                        </h3>
                    </div>
                    <div className="ap-grid-3">
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Type</span>
                            <span className="ap-badge ap-badge-primary ap-capitalize">{election.type.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Status</span>
                            <span className={getStatusBadgeClass(election.status) + ' ap-capitalize'}>{election.status.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Positions to Fill</span>
                            <span className="ap-stat-value">{election.positions_to_fill}</span>
                        </div>
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Class Set</span>
                            <span className="ap-detail-value">{election.class_set?.name || 'N/A'}</span>
                            {election.class_set?.department && (
                                <span className="ap-text-sm ap-text-secondary">
                                    {election.class_set.department.name}{election.class_set.year ? ` - ${election.class_set.year}` : ''}
                                </span>
                            )}
                        </div>
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Started At</span>
                            <span className="ap-detail-value ap-flex ap-items-center ap-gap-xs">
                                <Calendar size={14} className="ap-text-secondary" />
                                {election.started_at_formatted || 'N/A'}
                            </span>
                        </div>
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Ends At</span>
                            <span className="ap-detail-value ap-flex ap-items-center ap-gap-xs">
                                <Clock size={14} className={election.is_active ? 'ap-icon-warning' : 'ap-text-secondary'} />
                                {election.ends_at_formatted || 'N/A'}
                            </span>
                        </div>
                        <div className="ap-detail-row ap-flex-col">
                            <span className="ap-detail-label">Created At</span>
                            <span className="ap-detail-value">{election.created_at_formatted}</span>
                        </div>
                        {election.parent_election && (
                            <div className="ap-detail-row ap-flex-col">
                                <span className="ap-detail-label">Parent Election</span>
                                <span className="ap-detail-value">
                                    #{election.parent_election.id} - {election.parent_election.type.replace(/_/g, ' ')} ({election.parent_election.status})
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Extend Election (Active only) */}
                {election.is_active && (
                    <div className="ap-card ap-card-lg ap-mb-xl">
                        <div className="ap-card-header">
                            <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                                <Timer size={18} className="ap-icon-warning" /> Extend Election
                            </h3>
                        </div>
                        <div className="ap-flex ap-items-center ap-gap-lg ap-flex-wrap">
                            <div className="ap-flex ap-items-center ap-gap-sm">
                                <label className="ap-form-label ap-mb-0">Hours:</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={extendHours}
                                    onChange={(e) => setExtendHours(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="ap-form-input ap-w-input-sm"
                                />
                            </div>
                            <button
                                className="ap-btn ap-btn-warning"
                                onClick={handleExtend}
                            >
                                <Timer size={16} /> Extend Election
                            </button>
                        </div>
                    </div>
                )}

                {/* Candidates Table */}
                <div className="ap-table-wrap ap-mb-xl">
                    <div className="ap-card-header">
                        <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                            <Users size={18} className="ap-icon-success" /> Candidates ({election.candidates_count})
                        </h3>
                    </div>
                    {sortedCandidates.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Name</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Votes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedCandidates.map((candidate, index) => (
                                        <tr key={candidate.id}>
                                            <td>
                                                <div className="ap-flex ap-items-center ap-gap-xs">
                                                    {index === 0 && <Trophy size={16} className="ap-icon-warning" />}
                                                    {index === 1 && <Award size={16} className="ap-text-secondary" />}
                                                    {index === 2 && <Award size={16} className="ap-icon-warning" />}
                                                    {index > 2 && <User size={16} className="ap-text-secondary" />}
                                                    <span className="ap-font-semibold">{index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <UserAvatar imageUrl={candidate.user?.profile_image_url || null} name={candidate.user?.full_name || 'Unknown'} />
                                                    <p className="ap-user-cell-name">
                                                        {candidate.user?.full_name || 'Unknown User'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="secondary">@{candidate.user?.username || 'N/A'}</td>
                                            <td className="secondary">{candidate.user?.email || 'N/A'}</td>
                                            <td>
                                                <span className={index === 0 ? 'ap-badge ap-badge-success' : 'ap-badge ap-badge-neutral'}>
                                                    <Vote size={14} /> {candidate.votes_count}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Users size={24} />
                            </div>
                            <p className="ap-empty-title">No candidates</p>
                            <p className="ap-empty-text">No candidates registered for this election</p>
                        </div>
                    )}
                </div>

                {/* Votes Table */}
                <div className="ap-table-wrap">
                    <div className="ap-card-header">
                        <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                            <Vote size={18} className="ap-icon-info" /> Votes ({election.votes_count})
                        </h3>
                    </div>
                    {election.votes.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Voter</th>
                                        <th>Voted For</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {election.votes.map((vote) => (
                                        <tr key={vote.id}>
                                            <td>
                                                <p className="ap-user-cell-name">{vote.voter?.full_name || 'Unknown'}</p>
                                                <p className="ap-user-cell-sub">@{vote.voter?.username || 'N/A'}</p>
                                            </td>
                                            <td>
                                                <p className="ap-user-cell-name">{vote.candidate?.full_name || 'Unknown'}</p>
                                                <p className="ap-user-cell-sub">@{vote.candidate?.username || 'N/A'}</p>
                                            </td>
                                            <td className="secondary">
                                                {vote.created_at ? new Date(vote.created_at).toLocaleDateString() + ' ' + new Date(vote.created_at).toLocaleTimeString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Vote size={24} />
                            </div>
                            <p className="ap-empty-title">No votes</p>
                            <p className="ap-empty-text">No votes have been cast yet</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
