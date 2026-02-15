import { useState, useCallback, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft, Pencil, Sparkles, Calendar, Image, Users, Award,
    Plus, Play, Flame, Star, X, AlertTriangle, CheckCircle, RefreshCw,
} from 'lucide-react';

interface Challenge {
    id: number;
    uuid: string;
    title: string;
    description: string | null;
    theme: string | null;
    banner_image: string | null;
    status: string;
    challenge_number: number;
    submissions_open_at: string | null;
    submissions_close_at: string | null;
    voting_open_at: string | null;
    voting_close_at: string | null;
    results_at: string | null;
    entries_count: number;
}

interface Season {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    status: string;
    start_date: string;
    end_date: string;
    challenges_count: number;
    standings_count: number;
    challenges: Challenge[];
    created_at: string;
}

interface StandingEntry {
    rank: number;
    user_id: number;
    user: { id: number; first_name: string; last_name: string; username: string; profile_image_url: string | null } | null;
    total_points: number;
    challenges_entered: number;
    votes_cast: number;
    top_1_count: number;
    top_3_count: number;
    current_entry_streak: number;
    best_entry_streak: number;
}

interface BadgeEntry {
    id: number;
    badge: { name: string; slug: string; icon: string; color: string; description: string } | null;
    user: { id: number; first_name: string; last_name: string; username: string } | null;
    times_earned: number;
    earned_at: string;
}

interface Props {
    season: Season;
}

function AdminAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [imgError, setImgError] = useState(false);
    if (imageUrl && !imgError) {
        return (
            <div className="ap-avatar ap-avatar-sm">
                <img src={imageUrl} alt={name} onError={() => setImgError(true)} />
            </div>
        );
    }
    return (
        <div className="ap-avatar ap-avatar-sm ap-avatar-purple">
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function Show({ season }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const errors = (props as any).errors || {};

    const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'standings' | 'badges'>('overview');
    const [submitting, setSubmitting] = useState(false);

    // Confirmation dialog
    const [confirmDialog, setConfirmDialog] = useState<{
        type: 'activate' | 'complete' | 'transition' | 'recalculate';
        title: string;
        message: string;
        confirmLabel: string;
        confirmColor: string;
        confirmBg: string;
        icon: typeof CheckCircle;
        onConfirm: () => void;
    } | null>(null);

    // Challenge form
    const [showChallengeForm, setShowChallengeForm] = useState(false);
    const [challengeForm, setChallengeForm] = useState({
        title: '', description: '', theme: '',
        submissions_open_at: '', submissions_close_at: '',
        voting_open_at: '', voting_close_at: '', results_at: '',
    });

    // Standings
    const [genderTrack, setGenderTrack] = useState<'female' | 'male'>('female');
    const [standings, setStandings] = useState<StandingEntry[]>([]);
    const [badges, setBadges] = useState<BadgeEntry[]>([]);

    useEffect(() => {
        if (activeTab === 'standings') {
            fetch(route('admin.glam.standings', { id: season.id, track: genderTrack }))
                .then(r => r.json())
                .then(data => setStandings(data));
        }
    }, [activeTab, genderTrack, season.id]);

    useEffect(() => {
        if (activeTab === 'badges') {
            fetch(route('admin.glam.badges', season.id))
                .then(r => r.json())
                .then(data => setBadges(data));
        }
    }, [activeTab, season.id]);

    const handleActivate = useCallback(() => {
        setConfirmDialog({
            type: 'activate',
            title: 'Activate Season',
            message: `Are you sure you want to activate "${season.name}"? This will make it the current live season and allow challenges to run.`,
            confirmLabel: 'Activate',
            confirmColor: '#10b981',
            confirmBg: 'rgba(16, 185, 129, 0.15)',
            icon: CheckCircle,
            onConfirm: () => {
                setConfirmDialog(null);
                router.post(route('admin.glam.activateSeason', season.id), {}, { preserveScroll: true });
            },
        });
    }, [season.id, season.name]);

    const handleComplete = useCallback(() => {
        setConfirmDialog({
            type: 'complete',
            title: 'Complete Season',
            message: `Are you sure you want to complete "${season.name}"? This will freeze the final standings and no more challenges can be created.`,
            confirmLabel: 'Complete Season',
            confirmColor: '#f59e0b',
            confirmBg: 'rgba(245, 158, 11, 0.15)',
            icon: AlertTriangle,
            onConfirm: () => {
                setConfirmDialog(null);
                router.post(route('admin.glam.completeSeason', season.id), {}, { preserveScroll: true });
            },
        });
    }, [season.id, season.name]);

    const handleCreateChallenge = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(route('admin.glam.storeChallenge', season.id), challengeForm, {
            preserveScroll: true,
            onFinish: () => {
                setSubmitting(false);
                setShowChallengeForm(false);
                setChallengeForm({
                    title: '', description: '', theme: '',
                    submissions_open_at: '', submissions_close_at: '',
                    voting_open_at: '', voting_close_at: '', results_at: '',
                });
            },
        });
    }, [season.id, challengeForm]);

    const handleTransition = useCallback((challengeId: number, status: string) => {
        const labels: Record<string, string> = {
            submissions_open: 'open submissions',
            voting_open: 'open voting',
            completed: 'complete and calculate results',
        };
        const colors: Record<string, { color: string; bg: string }> = {
            submissions_open: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
            voting_open: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
            completed: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
        };
        const c = colors[status] || { color: '#667eea', bg: 'rgba(102, 126, 234, 0.15)' };
        setConfirmDialog({
            type: 'transition',
            title: 'Transition Challenge',
            message: `Are you sure you want to ${labels[status] || status} for this challenge?`,
            confirmLabel: nextStatusLabel(status === 'submissions_open' ? 'upcoming' : status === 'voting_open' ? 'submissions_open' : 'voting_open') || 'Confirm',
            confirmColor: c.color,
            confirmBg: c.bg,
            icon: Play,
            onConfirm: () => {
                setConfirmDialog(null);
                router.post(route('admin.glam.transitionChallenge', challengeId), { status }, { preserveScroll: true });
            },
        });
    }, []);

    const handleCalculateResults = useCallback((challengeId: number) => {
        setConfirmDialog({
            type: 'recalculate',
            title: 'Calculate Results',
            message: 'This will score all entries, update rankings, award points, and check badge eligibility. Continue?',
            confirmLabel: 'Calculate',
            confirmColor: '#667eea',
            confirmBg: 'rgba(102, 126, 234, 0.15)',
            icon: RefreshCw,
            onConfirm: () => {
                setConfirmDialog(null);
                router.post(route('admin.glam.calculateResults', challengeId), {}, { preserveScroll: true });
            },
        });
    }, []);

    const statusBadgeMap: Record<string, string> = {
        upcoming: 'ap-badge-info',
        active: 'ap-badge-success',
        completed: 'ap-badge-neutral',
        submissions_open: 'ap-badge-success',
        voting_open: 'ap-badge-warning',
    };

    const getRankClass = (rank: number) => {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return 'bronze';
        return '';
    };

    const nextStatus = (current: string): string | null => {
        const map: Record<string, string> = {
            upcoming: 'submissions_open',
            submissions_open: 'voting_open',
            voting_open: 'completed',
        };
        return map[current] || null;
    };

    const nextStatusLabel = (current: string): string => {
        const map: Record<string, string> = {
            upcoming: 'Open Submissions',
            submissions_open: 'Open Voting',
            voting_open: 'Complete',
        };
        return map[current] || '';
    };

    const tabs = [
        { key: 'overview', label: 'Overview', icon: Sparkles },
        { key: 'challenges', label: 'Challenges', icon: Image },
        { key: 'standings', label: 'Standings', icon: Users },
        { key: 'badges', label: 'Badges', icon: Award },
    ] as const;

    return (
        <AdminLayout>
            <div>
                <button className="ap-back-btn ap-mb-md" onClick={() => router.visit(route('admin.glam.index'))}>
                    <ArrowLeft size={16} /> Back to Glam Squad
                </button>

                <div className="ap-page-header">
                    <div className="ap-page-header-row">
                        <div>
                            <h1 className="ap-page-title">{season.name}</h1>
                            <p className="ap-page-subtitle">
                                <span className={`ap-badge ${statusBadgeMap[season.status] || 'ap-badge-neutral'} ap-capitalize`}>
                                    {season.status}
                                </span>
                                {' '}&middot; {season.start_date} to {season.end_date}
                            </p>
                        </div>
                        <div className="ap-page-header-actions">
                            {season.status === 'upcoming' && (
                                <button className="ap-btn ap-btn-success" onClick={handleActivate}>Activate Season</button>
                            )}
                            {season.status === 'active' && (
                                <button className="ap-btn ap-btn-warning" onClick={handleComplete}>Complete Season</button>
                            )}
                            <button className="ap-btn ap-btn-secondary" onClick={() => router.visit(route('admin.glam.edit', season.id))}>
                                <Pencil size={14} /> Edit
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="ap-tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`ap-tab ${activeTab === tab.key ? 'active' : ''}`}
                            >
                                <Icon size={15} /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="ap-stats-grid">
                        {[
                            { label: 'Challenges', value: season.challenges_count, icon: Image, colorClass: 'blue' },
                            { label: 'Participants', value: season.standings_count, icon: Users, colorClass: 'green' },
                            { label: 'Completed', value: season.challenges.filter(c => c.status === 'completed').length, icon: Sparkles, colorClass: 'purple' },
                            { label: 'Total Entries', value: season.challenges.reduce((sum, c) => sum + c.entries_count, 0), icon: Star, colorClass: 'amber' },
                        ].map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div key={idx} className="ap-stat-card">
                                    <div className="ap-stat-card-header">
                                        <p className="ap-stat-label">{stat.label}</p>
                                        <div className={`ap-stat-icon ${stat.colorClass}`}>
                                            <Icon size={20} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <p className="ap-stat-value">{stat.value}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Challenges Tab */}
                {activeTab === 'challenges' && (
                    <div className="ap-table-wrap">
                        <div className="ap-card-header">
                            <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                                <Image size={18} /> Challenges
                            </h3>
                            <button className="ap-btn ap-btn-sm ap-btn-primary" onClick={() => setShowChallengeForm(!showChallengeForm)}>
                                <Plus size={14} /> Add Challenge
                            </button>
                        </div>

                        {showChallengeForm && (
                            <form onSubmit={handleCreateChallenge} className="ap-card-body">
                                <div className="ap-form-row">
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Title</label>
                                        <input type="text" className="ap-form-input" placeholder="e.g. Street Style Chic" value={challengeForm.title} onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })} required />
                                        {errors.title && <p className="ap-form-error">{errors.title}</p>}
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Theme</label>
                                        <input type="text" className="ap-form-input" placeholder="e.g. Urban Fashion" value={challengeForm.theme} onChange={(e) => setChallengeForm({ ...challengeForm, theme: e.target.value })} />
                                    </div>
                                </div>
                                <div className="ap-form-group ap-mt-md">
                                    <label className="ap-form-label">Description</label>
                                    <textarea className="ap-form-input" rows={3} placeholder="Challenge description..." value={challengeForm.description} onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })} />
                                </div>
                                <div className="ap-form-row ap-mt-md">
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Submissions Open</label>
                                        <input type="datetime-local" className="ap-form-input" value={challengeForm.submissions_open_at} onChange={(e) => setChallengeForm({ ...challengeForm, submissions_open_at: e.target.value })} required />
                                        {errors.submissions_open_at && <p className="ap-form-error">{errors.submissions_open_at}</p>}
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Submissions Close</label>
                                        <input type="datetime-local" className="ap-form-input" value={challengeForm.submissions_close_at} onChange={(e) => setChallengeForm({ ...challengeForm, submissions_close_at: e.target.value })} required />
                                        {errors.submissions_close_at && <p className="ap-form-error">{errors.submissions_close_at}</p>}
                                    </div>
                                </div>
                                <div className="ap-form-row ap-mt-md">
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Voting Open</label>
                                        <input type="datetime-local" className="ap-form-input" value={challengeForm.voting_open_at} onChange={(e) => setChallengeForm({ ...challengeForm, voting_open_at: e.target.value })} required />
                                        {errors.voting_open_at && <p className="ap-form-error">{errors.voting_open_at}</p>}
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Voting Close</label>
                                        <input type="datetime-local" className="ap-form-input" value={challengeForm.voting_close_at} onChange={(e) => setChallengeForm({ ...challengeForm, voting_close_at: e.target.value })} required />
                                        {errors.voting_close_at && <p className="ap-form-error">{errors.voting_close_at}</p>}
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Results At</label>
                                        <input type="datetime-local" className="ap-form-input" value={challengeForm.results_at} onChange={(e) => setChallengeForm({ ...challengeForm, results_at: e.target.value })} required />
                                        {errors.results_at && <p className="ap-form-error">{errors.results_at}</p>}
                                    </div>
                                </div>
                                <div className="ap-flex ap-justify-end ap-gap-sm ap-mt-md">
                                    <button type="button" className="ap-btn ap-btn-secondary" onClick={() => setShowChallengeForm(false)}>Cancel</button>
                                    <button type="submit" className="ap-btn ap-btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Challenge'}</button>
                                </div>
                            </form>
                        )}

                        {season.challenges.length > 0 ? (
                            <div className="ap-table-scroll">
                                <table className="ap-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Title</th>
                                            <th>Theme</th>
                                            <th>Status</th>
                                            <th>Submissions</th>
                                            <th className="center">Entries</th>
                                            <th className="center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {season.challenges.map((challenge) => (
                                            <tr key={challenge.id}>
                                                <td><span className="ap-font-semibold">{challenge.challenge_number}</span></td>
                                                <td><span className="ap-font-semibold">{challenge.title}</span></td>
                                                <td className="ap-text-secondary ap-text-sm">{challenge.theme || '—'}</td>
                                                <td>
                                                    <span className={`ap-badge ${statusBadgeMap[challenge.status] || 'ap-badge-neutral'}`}>
                                                        {challenge.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="ap-text-secondary ap-text-xs">
                                                    {challenge.submissions_open_at ? challenge.submissions_open_at.replace('T', ' ') : '—'}
                                                </td>
                                                <td className="center">{challenge.entries_count}</td>
                                                <td className="center">
                                                    <div className="ap-flex ap-items-center ap-justify-center ap-gap-xs">
                                                        {nextStatus(challenge.status) && (
                                                            <button
                                                                className="ap-btn ap-btn-sm ap-btn-primary"
                                                                onClick={() => handleTransition(challenge.id, nextStatus(challenge.status)!)}
                                                            >
                                                                <Play size={12} /> {nextStatusLabel(challenge.status)}
                                                            </button>
                                                        )}
                                                        {challenge.status === 'completed' && (
                                                            <button
                                                                className="ap-btn ap-btn-sm ap-btn-secondary"
                                                                onClick={() => handleCalculateResults(challenge.id)}
                                                            >
                                                                Recalculate
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="ap-empty">
                                <div className="ap-empty-icon"><Image size={28} strokeWidth={1.5} /></div>
                                <p className="ap-empty-title">No challenges yet</p>
                                <p className="ap-empty-text">Click "Add Challenge" to create your first fashion challenge.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Standings Tab */}
                {activeTab === 'standings' && (
                    <div className="ap-table-wrap">
                        <div className="ap-card-header">
                            <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                                <Users size={18} /> Season Standings
                            </h3>
                            <div className="ap-flex ap-gap-xs">
                                <button
                                    className={`ap-btn ap-btn-sm ${genderTrack === 'female' ? 'ap-btn-primary' : 'ap-btn-secondary'}`}
                                    onClick={() => setGenderTrack('female')}
                                >
                                    Female
                                </button>
                                <button
                                    className={`ap-btn ap-btn-sm ${genderTrack === 'male' ? 'ap-btn-primary' : 'ap-btn-secondary'}`}
                                    onClick={() => setGenderTrack('male')}
                                >
                                    Male
                                </button>
                            </div>
                        </div>

                        {standings.length > 0 ? (
                            <div className="ap-table-scroll">
                                <table className="ap-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>User</th>
                                            <th className="center">Points</th>
                                            <th className="center">Entries</th>
                                            <th className="center">Votes Cast</th>
                                            <th className="center">Top 1</th>
                                            <th className="center">Top 3</th>
                                            <th className="center">Streak</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {standings.map((entry) => (
                                            <tr key={entry.user_id}>
                                                <td>
                                                    <span className={`ap-font-semibold ap-rank-${getRankClass(entry.rank)}`}>
                                                        {entry.rank}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="ap-flex ap-items-center ap-gap-sm">
                                                        <AdminAvatar
                                                            imageUrl={entry.user?.profile_image_url || null}
                                                            name={entry.user?.first_name || '?'}
                                                        />
                                                        <span>{entry.user?.first_name} {entry.user?.last_name}</span>
                                                    </div>
                                                </td>
                                                <td className="center ap-font-semibold ap-text-primary">{entry.total_points}</td>
                                                <td className="center">{entry.challenges_entered}</td>
                                                <td className="center">{entry.votes_cast}</td>
                                                <td className="center">{entry.top_1_count}</td>
                                                <td className="center">{entry.top_3_count}</td>
                                                <td className="center">
                                                    {entry.current_entry_streak > 0 && (
                                                        <span className="ap-flex ap-items-center ap-justify-center ap-gap-xs ap-text-warning">
                                                            <Flame size={14} /> {entry.current_entry_streak}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="ap-empty">
                                <div className="ap-empty-icon"><Users size={28} strokeWidth={1.5} /></div>
                                <p className="ap-empty-title">No standings yet</p>
                                <p className="ap-empty-text">Standings will appear once users participate in challenges.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Badges Tab */}
                {activeTab === 'badges' && (
                    <div className="ap-table-wrap">
                        <div className="ap-card-header">
                            <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                                <Award size={18} /> Badge Awards
                            </h3>
                        </div>

                        {badges.length > 0 ? (
                            <div className="ap-table-scroll">
                                <table className="ap-table">
                                    <thead>
                                        <tr>
                                            <th>Badge</th>
                                            <th>User</th>
                                            <th className="center">Times Earned</th>
                                            <th>Earned At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {badges.map((entry) => (
                                            <tr key={entry.id}>
                                                <td>
                                                    <div className="ap-flex ap-items-center ap-gap-sm">
                                                        <div className="ap-avatar ap-avatar-sm" style={{ background: `${entry.badge?.color}22` }}>
                                                            <Award size={14} color={entry.badge?.color} />
                                                        </div>
                                                        <div>
                                                            <div className="ap-font-semibold">{entry.badge?.name}</div>
                                                            <div className="ap-text-secondary ap-text-xs">{entry.badge?.description}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{entry.user?.first_name} {entry.user?.last_name}</td>
                                                <td className="center">
                                                    <span className="ap-badge ap-badge-primary">{entry.times_earned}x</span>
                                                </td>
                                                <td className="ap-text-secondary ap-text-sm">{entry.earned_at}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="ap-empty">
                                <div className="ap-empty-icon"><Award size={28} strokeWidth={1.5} /></div>
                                <p className="ap-empty-title">No badges awarded yet</p>
                                <p className="ap-empty-text">Badges will be awarded as users earn achievements through challenges.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog && (() => {
                const Icon = confirmDialog.icon;
                return (
                    <div
                        onClick={() => setConfirmDialog(null)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '1rem',
                            animation: 'fadeIn 0.15s ease-out',
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#1a1a2e',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '16px',
                                padding: '1.75rem',
                                width: '100%',
                                maxWidth: '420px',
                                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
                                animation: 'slideUp 0.2s ease-out',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: confirmDialog.confirmBg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={22} color={confirmDialog.confirmColor} />
                                </div>
                                <button
                                    onClick={() => setConfirmDialog(null)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)', border: 'none',
                                        borderRadius: '8px', padding: '6px', cursor: 'pointer',
                                        color: '#888', display: 'flex', transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#ccc'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#888'; }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                                {confirmDialog.title}
                            </h3>
                            <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#999', lineHeight: 1.5 }}>
                                {confirmDialog.message}
                            </p>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setConfirmDialog(null)}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '10px',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        color: '#ccc', fontSize: '0.85rem', fontWeight: 500,
                                        cursor: 'pointer', transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDialog.onConfirm}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '10px',
                                        background: confirmDialog.confirmBg,
                                        border: `1px solid ${confirmDialog.confirmColor}33`,
                                        color: confirmDialog.confirmColor, fontSize: '0.85rem', fontWeight: 600,
                                        cursor: 'pointer', transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = confirmDialog.confirmColor; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = confirmDialog.confirmBg; e.currentTarget.style.color = confirmDialog.confirmColor; }}
                                >
                                    {confirmDialog.confirmLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </AdminLayout>
    );
}
