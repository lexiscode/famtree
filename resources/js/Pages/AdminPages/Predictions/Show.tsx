import { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft, Pencil, Trophy, Calendar, Target, Users, Award,
    Plus, X, Flame,
} from 'lucide-react';

interface Gameweek {
    id: number;
    number: number;
    label: string | null;
    start_date: string;
    end_date: string;
    fixtures_count: number;
}

interface Fixture {
    id: number;
    uuid: string;
    opponent_name: string;
    opponent_logo: string | null;
    venue: string;
    competition: string | null;
    match_date: string;
    status: string;
    home_score: number | null;
    away_score: number | null;
    gameweek: { id: number; number: number; label: string | null } | null;
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
    organization: { id: number; name: string; logo_url: string | null } | null;
    fixtures_count: number;
    standings_count: number;
    gameweeks: Gameweek[];
    fixtures: Fixture[];
    created_at: string;
}

interface StandingEntry {
    rank: number;
    user_id: number;
    user: { id: number; first_name: string; last_name: string; username: string; profile_image_url: string | null } | null;
    total_points: number;
    predictions_made: number;
    correct_predictions: number;
    accuracy: number;
    current_streak: number;
    best_streak: number;
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
    standings: StandingEntry[];
    badges: BadgeEntry[];
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

export default function Show({ season, standings, badges }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const errors = (props as any).errors || {};

    const [activeTab, setActiveTab] = useState<'overview' | 'gameweeks' | 'fixtures' | 'standings' | 'badges'>('overview');
    const [showResultModal, setShowResultModal] = useState<number | null>(null);
    const [resultForm, setResultForm] = useState({ home_score: '', away_score: '' });
    const [submitting, setSubmitting] = useState(false);

    // Gameweek form
    const [showGwForm, setShowGwForm] = useState(false);
    const [gwForm, setGwForm] = useState({ label: '', start_date: '', end_date: '' });

    // Fixture form
    const [showFixtureForm, setShowFixtureForm] = useState(false);
    const [fixtureForm, setFixtureForm] = useState({
        opponent_name: '', opponent_logo: '', venue: 'home', competition: '', match_date: '', gameweek_id: '',
    });

    const handleActivate = useCallback(() => {
        if (window.confirm('Activate this season? Users will be able to make predictions.')) {
            router.post(route('admin.predictions.activateSeason', season.id), {}, { preserveScroll: true });
        }
    }, [season.id]);

    const handleComplete = useCallback(() => {
        if (window.confirm('Complete this season? This will freeze the final standings.')) {
            router.post(route('admin.predictions.completeSeason', season.id), {}, { preserveScroll: true });
        }
    }, [season.id]);

    const handleEnterResult = useCallback(() => {
        if (showResultModal === null) return;
        setSubmitting(true);
        router.post(route('admin.predictions.enterResult', showResultModal), {
            home_score: parseInt(resultForm.home_score),
            away_score: parseInt(resultForm.away_score),
        }, {
            preserveScroll: true,
            onFinish: () => { setSubmitting(false); setShowResultModal(null); setResultForm({ home_score: '', away_score: '' }); },
        });
    }, [showResultModal, resultForm]);

    const handleCancelFixture = useCallback((id: number) => {
        if (window.confirm('Cancel this fixture? Predictions will not be scored.')) {
            router.post(route('admin.predictions.cancelFixture', id), {}, { preserveScroll: true });
        }
    }, []);

    const handleCreateGameweek = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(route('admin.predictions.storeGameweek', season.id), gwForm, {
            preserveScroll: true,
            onFinish: () => { setSubmitting(false); setShowGwForm(false); setGwForm({ label: '', start_date: '', end_date: '' }); },
        });
    }, [season.id, gwForm]);

    const handleCreateFixture = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const data = { ...fixtureForm, gameweek_id: fixtureForm.gameweek_id || null };
        router.post(route('admin.predictions.storeFixture', season.id), data, {
            preserveScroll: true,
            onFinish: () => {
                setSubmitting(false); setShowFixtureForm(false);
                setFixtureForm({ opponent_name: '', opponent_logo: '', venue: 'home', competition: '', match_date: '', gameweek_id: '' });
            },
        });
    }, [season.id, fixtureForm]);

    const statusBadgeMap: Record<string, string> = {
        upcoming: 'ap-badge-info',
        active: 'ap-badge-success',
        completed: 'ap-badge-neutral',
        live: 'ap-badge-danger',
        cancelled: 'ap-badge-warning',
    };

    const getRankClass = (rank: number) => {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return 'bronze';
        return '';
    };

    const tabs = [
        { key: 'overview', label: 'Overview', icon: Trophy },
        { key: 'gameweeks', label: 'Gameweeks', icon: Calendar },
        { key: 'fixtures', label: 'Fixtures', icon: Target },
        { key: 'standings', label: 'Standings', icon: Users },
        { key: 'badges', label: 'Badges', icon: Award },
    ] as const;

    const resultFixture = season.fixtures.find(f => f.id === showResultModal);

    return (
        <AdminLayout>
            <div>
                {flash?.success && <div className="ap-flash ap-flash-success">{flash.success}</div>}
                {flash?.error && <div className="ap-flash ap-flash-error">{flash.error}</div>}

                {/* Header */}
                <button className="ap-back-btn ap-mb-md" onClick={() => router.visit(route('admin.predictions.index'))}>
                    <ArrowLeft size={16} /> Back to Predictions
                </button>

                <div className="ap-page-header">
                    <div className="ap-page-header-row">
                        <div>
                            <h1 className="ap-page-title">{season.name}</h1>
                            <p className="ap-page-subtitle">
                                {season.organization?.name} &middot;{' '}
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
                            <button className="ap-btn ap-btn-secondary" onClick={() => router.visit(route('admin.predictions.edit', season.id))}>
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
                            { label: 'Total Fixtures', value: season.fixtures_count, icon: Target, colorClass: 'blue' },
                            { label: 'Gameweeks', value: season.gameweeks.length, icon: Calendar, colorClass: 'purple' },
                            { label: 'Participants', value: season.standings_count, icon: Users, colorClass: 'green' },
                            { label: 'Completed', value: season.fixtures.filter(f => f.status === 'completed').length, icon: Trophy, colorClass: 'amber' },
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

                {/* Gameweeks Tab */}
                {activeTab === 'gameweeks' && (
                    <div className="ap-table-wrap">
                        <div className="ap-card-header">
                            <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                                <Calendar size={18} /> Gameweeks
                            </h3>
                            <button className="ap-btn ap-btn-sm ap-btn-primary" onClick={() => setShowGwForm(!showGwForm)}>
                                <Plus size={14} /> Add Gameweek
                            </button>
                        </div>

                        {showGwForm && (
                            <form onSubmit={handleCreateGameweek} className="ap-card-body">
                                <div className="ap-form-row">
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Label</label>
                                        <input type="text" className="ap-form-input" placeholder="e.g. Matchday 1" value={gwForm.label} onChange={(e) => setGwForm({ ...gwForm, label: e.target.value })} />
                                        {errors.label && <p className="ap-form-error">{errors.label}</p>}
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Start Date</label>
                                        <input type="date" className="ap-form-input" value={gwForm.start_date} onChange={(e) => setGwForm({ ...gwForm, start_date: e.target.value })} required />
                                        {errors.start_date && <p className="ap-form-error">{errors.start_date}</p>}
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">End Date</label>
                                        <input type="date" className="ap-form-input" value={gwForm.end_date} onChange={(e) => setGwForm({ ...gwForm, end_date: e.target.value })} required />
                                        {errors.end_date && <p className="ap-form-error">{errors.end_date}</p>}
                                    </div>
                                </div>
                                <div className="ap-flex ap-justify-end ap-gap-sm ap-mt-md">
                                    <button type="button" className="ap-btn ap-btn-secondary" onClick={() => setShowGwForm(false)}>Cancel</button>
                                    <button type="submit" className="ap-btn ap-btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
                                </div>
                            </form>
                        )}

                        {season.gameweeks.length > 0 ? (
                            <div className="ap-table-scroll">
                                <table className="ap-table">
                                    <thead>
                                        <tr><th>#</th><th>Label</th><th>Start</th><th>End</th><th className="center">Fixtures</th></tr>
                                    </thead>
                                    <tbody>
                                        {season.gameweeks.map((gw) => (
                                            <tr key={gw.id}>
                                                <td><span className="ap-font-semibold">{gw.number}</span></td>
                                                <td>{gw.label || `Gameweek ${gw.number}`}</td>
                                                <td className="ap-text-secondary ap-text-sm">{gw.start_date}</td>
                                                <td className="ap-text-secondary ap-text-sm">{gw.end_date}</td>
                                                <td className="center">{gw.fixtures_count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="ap-empty">
                                <div className="ap-empty-icon"><Calendar size={28} strokeWidth={1.5} /></div>
                                <p className="ap-empty-title">No gameweeks yet</p>
                                <p className="ap-empty-text">Click "Add Gameweek" to create your first gameweek.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Fixtures Tab */}
                {activeTab === 'fixtures' && (
                    <div className="ap-table-wrap">
                        <div className="ap-card-header">
                            <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                                <Target size={18} /> Fixtures
                            </h3>
                            <button className="ap-btn ap-btn-sm ap-btn-primary" onClick={() => setShowFixtureForm(!showFixtureForm)}>
                                <Plus size={14} /> Add Fixture
                            </button>
                        </div>

                        {showFixtureForm && (
                            <form onSubmit={handleCreateFixture} className="ap-card-body">
                                <div className="ap-form-row">
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Opponent</label>
                                        <input type="text" className="ap-form-input" placeholder="e.g. Manchester City" value={fixtureForm.opponent_name} onChange={(e) => setFixtureForm({ ...fixtureForm, opponent_name: e.target.value })} required />
                                        {errors.opponent_name && <p className="ap-form-error">{errors.opponent_name}</p>}
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Opponent Logo URL</label>
                                        <input type="text" className="ap-form-input" placeholder="https://..." value={fixtureForm.opponent_logo} onChange={(e) => setFixtureForm({ ...fixtureForm, opponent_logo: e.target.value })} />
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Venue</label>
                                        <select className="ap-form-select" value={fixtureForm.venue} onChange={(e) => setFixtureForm({ ...fixtureForm, venue: e.target.value })}>
                                            <option value="home">Home</option>
                                            <option value="away">Away</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="ap-form-row ap-mt-md">
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Competition</label>
                                        <input type="text" className="ap-form-input" placeholder="e.g. Premier League" value={fixtureForm.competition} onChange={(e) => setFixtureForm({ ...fixtureForm, competition: e.target.value })} />
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Match Date & Time</label>
                                        <input type="datetime-local" className="ap-form-input" value={fixtureForm.match_date} min={new Date().toISOString().slice(0, 16)} onChange={(e) => setFixtureForm({ ...fixtureForm, match_date: e.target.value })} required />
                                        {errors.match_date && <p className="ap-form-error">{errors.match_date}</p>}
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Gameweek</label>
                                        <select className="ap-form-select" value={fixtureForm.gameweek_id} onChange={(e) => setFixtureForm({ ...fixtureForm, gameweek_id: e.target.value })}>
                                            <option value="">None</option>
                                            {season.gameweeks.map((gw) => (
                                                <option key={gw.id} value={gw.id}>GW {gw.number}{gw.label ? ` — ${gw.label}` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="ap-flex ap-justify-end ap-gap-sm ap-mt-md">
                                    <button type="button" className="ap-btn ap-btn-secondary" onClick={() => setShowFixtureForm(false)}>Cancel</button>
                                    <button type="submit" className="ap-btn ap-btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Fixture'}</button>
                                </div>
                            </form>
                        )}

                        {season.fixtures.length > 0 ? (
                            <div className="ap-table-scroll">
                                <table className="ap-table">
                                    <thead>
                                        <tr>
                                            <th>Opponent</th>
                                            <th>Venue</th>
                                            <th>Competition</th>
                                            <th>Date</th>
                                            <th>GW</th>
                                            <th>Status</th>
                                            <th className="center">Score</th>
                                            <th className="center">Predictions</th>
                                            <th className="center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {season.fixtures.map((fixture) => (
                                            <tr key={fixture.id}>
                                                <td>
                                                    <div className="ap-flex ap-items-center ap-gap-sm">
                                                        {fixture.opponent_logo ? (
                                                            <div className="ap-avatar ap-avatar-sm">
                                                                <img src={fixture.opponent_logo} alt="" />
                                                            </div>
                                                        ) : null}
                                                        <span className="ap-font-semibold">{fixture.opponent_name}</span>
                                                    </div>
                                                </td>
                                                <td className="ap-capitalize">{fixture.venue}</td>
                                                <td className="ap-text-secondary ap-text-sm">{fixture.competition || '—'}</td>
                                                <td className="ap-text-sm">{fixture.match_date}</td>
                                                <td>{fixture.gameweek ? `GW${fixture.gameweek.number}` : '—'}</td>
                                                <td>
                                                    <span className={`ap-badge ${statusBadgeMap[fixture.status] || 'ap-badge-neutral'} ap-capitalize`}>
                                                        {fixture.status}
                                                    </span>
                                                </td>
                                                <td className="center ap-font-semibold">
                                                    {fixture.status === 'completed' ? `${fixture.home_score} - ${fixture.away_score}` : '—'}
                                                </td>
                                                <td className="center">{fixture.entries_count}</td>
                                                <td className="center">
                                                    {fixture.status === 'upcoming' && (
                                                        <div className="ap-flex ap-items-center ap-justify-center ap-gap-xs">
                                                            <button className="ap-btn ap-btn-sm ap-btn-primary" onClick={() => { setShowResultModal(fixture.id); setResultForm({ home_score: '', away_score: '' }); }}>
                                                                Result
                                                            </button>
                                                            <button className="ap-btn ap-btn-sm ap-btn-danger-outline" onClick={() => handleCancelFixture(fixture.id)}>
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="ap-empty">
                                <div className="ap-empty-icon"><Target size={28} strokeWidth={1.5} /></div>
                                <p className="ap-empty-title">No fixtures yet</p>
                                <p className="ap-empty-text">Click "Add Fixture" to create your first fixture.</p>
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
                        </div>

                        {standings.length > 0 ? (
                            <div className="ap-table-scroll">
                                <table className="ap-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Player</th>
                                            <th className="center">Points</th>
                                            <th className="center">Predictions</th>
                                            <th className="center">Correct</th>
                                            <th className="center">Accuracy</th>
                                            <th className="center">Streak</th>
                                            <th className="center">Best</th>
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
                                                <td className="center">{entry.predictions_made}</td>
                                                <td className="center">{entry.correct_predictions}</td>
                                                <td className="center">{entry.accuracy}%</td>
                                                <td className="center">
                                                    {entry.current_streak > 0 && (
                                                        <span className="ap-flex ap-items-center ap-justify-center ap-gap-xs ap-text-warning">
                                                            <Flame size={14} /> {entry.current_streak}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="center ap-text-secondary">{entry.best_streak}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="ap-empty">
                                <div className="ap-empty-icon"><Users size={28} strokeWidth={1.5} /></div>
                                <p className="ap-empty-title">No standings yet</p>
                                <p className="ap-empty-text">Standings will appear once users make predictions and results are entered.</p>
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
                                            <th>Player</th>
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
                                <p className="ap-empty-text">Badges will be awarded as users earn achievements through predictions.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Enter Result Modal */}
                {showResultModal !== null && (() => {
                    const orgName = season.organization?.name || 'Home Team';
                    const homeName = resultFixture?.venue === 'away' ? resultFixture.opponent_name : orgName;
                    const awayName = resultFixture?.venue === 'away' ? orgName : (resultFixture?.opponent_name || 'Away Team');
                    return (
                    <div className="ap-modal-overlay" onClick={() => setShowResultModal(null)}>
                        <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
                            <h3 className="ap-modal-title">Enter Match Result</h3>
                            <p className="ap-modal-subtitle">
                                {homeName} vs {awayName}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="ap-form-label">{homeName}</label>
                                    <input
                                        type="number" min="0" max="99"
                                        className="ap-form-input"
                                        style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 }}
                                        value={resultForm.home_score}
                                        onChange={(e) => setResultForm({ ...resultForm, home_score: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <span className="ap-text-secondary" style={{ fontSize: '1.4rem', fontWeight: 600, marginTop: '1.4rem' }}>–</span>
                                <div style={{ flex: 1 }}>
                                    <label className="ap-form-label">{awayName}</label>
                                    <input
                                        type="number" min="0" max="99"
                                        className="ap-form-input"
                                        style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 }}
                                        value={resultForm.away_score}
                                        onChange={(e) => setResultForm({ ...resultForm, away_score: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="ap-modal-footer">
                                <button className="ap-btn ap-btn-secondary" onClick={() => setShowResultModal(null)}>Cancel</button>
                                <button
                                    className="ap-btn ap-btn-primary"
                                    onClick={handleEnterResult}
                                    disabled={submitting || resultForm.home_score === '' || resultForm.away_score === ''}
                                >
                                    {submitting ? 'Saving...' : 'Save Result'}
                                </button>
                            </div>
                        </div>
                    </div>
                    );
                })()}
            </div>
        </AdminLayout>
    );
}
