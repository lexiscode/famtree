import { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft, Pencil, Trophy, Calendar, Target, Users, Award,
    Plus, Check, X, AlertTriangle, Flame, ChevronDown, ChevronUp,
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
    user: { id: number; first_name: string; last_name: string; username: string; profile_image: string | null } | null;
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

export default function Show({ season, standings, badges }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

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

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; color: string }> = {
            upcoming: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' },
            active: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' },
            completed: { bg: 'rgba(107, 114, 128, 0.15)', color: '#9CA3AF' },
            live: { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' },
            cancelled: { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' },
        };
        const s = styles[status] || styles.upcoming;
        return (
            <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: s.bg, color: s.color }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getRankStyle = (rank: number) => {
        if (rank === 1) return { color: '#FFD700', fontWeight: 700 };
        if (rank === 2) return { color: '#C0C0C0', fontWeight: 700 };
        if (rank === 3) return { color: '#CD7F32', fontWeight: 700 };
        if (rank === 4) return { color: '#8B5CF6', fontWeight: 600 };
        return { color: '#aaa' };
    };

    const tabs = [
        { key: 'overview', label: 'Overview', icon: Trophy },
        { key: 'gameweeks', label: 'Gameweeks', icon: Calendar },
        { key: 'fixtures', label: 'Fixtures', icon: Target },
        { key: 'standings', label: 'Standings', icon: Users },
        { key: 'badges', label: 'Badges', icon: Award },
    ] as const;

    return (
        <AdminLayout>
            <div>
                {flash?.success && <div className="ap-flash ap-flash-success">{flash.success}</div>}
                {flash?.error && <div className="ap-flash ap-flash-error">{flash.error}</div>}

                {/* Header */}
                <div className="ap-page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button className="ap-btn ap-btn-ghost" onClick={() => router.visit(route('admin.predictions.index'))}>
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="ap-page-title">{season.name}</h1>
                            <p className="ap-page-subtitle">
                                {season.organization?.name} &middot; {getStatusBadge(season.status)} &middot; {season.start_date} to {season.end_date}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {season.status === 'upcoming' && (
                            <button className="ap-btn ap-btn-primary" onClick={handleActivate}>Activate Season</button>
                        )}
                        {season.status === 'active' && (
                            <button className="ap-btn ap-btn-warning" onClick={handleComplete}>Complete Season</button>
                        )}
                        <button className="ap-btn ap-btn-ghost" onClick={() => router.visit(route('admin.predictions.edit', season.id))}>
                            <Pencil size={14} /> Edit
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0' }}>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    padding: '10px 16px', border: 'none', background: 'transparent', color: activeTab === tab.key ? '#8B5CF6' : '#888',
                                    borderBottom: activeTab === tab.key ? '2px solid #8B5CF6' : '2px solid transparent',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500,
                                    transition: 'color 0.15s ease',
                                }}
                            >
                                <Icon size={15} /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div className="ap-stat-card">
                            <div className="ap-stat-info">
                                <span className="ap-stat-value">{season.fixtures_count}</span>
                                <span className="ap-stat-label">Total Fixtures</span>
                            </div>
                        </div>
                        <div className="ap-stat-card">
                            <div className="ap-stat-info">
                                <span className="ap-stat-value">{season.gameweeks.length}</span>
                                <span className="ap-stat-label">Gameweeks</span>
                            </div>
                        </div>
                        <div className="ap-stat-card">
                            <div className="ap-stat-info">
                                <span className="ap-stat-value">{season.standings_count}</span>
                                <span className="ap-stat-label">Participants</span>
                            </div>
                        </div>
                        <div className="ap-stat-card">
                            <div className="ap-stat-info">
                                <span className="ap-stat-value">{season.fixtures.filter(f => f.status === 'completed').length}</span>
                                <span className="ap-stat-label">Completed Fixtures</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gameweeks Tab */}
                {activeTab === 'gameweeks' && (
                    <div className="ap-card">
                        <div className="ap-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Gameweeks</h3>
                            <button className="ap-btn ap-btn-sm ap-btn-primary" onClick={() => setShowGwForm(!showGwForm)}>
                                <Plus size={14} /> Add Gameweek
                            </button>
                        </div>
                        {showGwForm && (
                            <form onSubmit={handleCreateGameweek} style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div className="ap-form-group" style={{ flex: 1, minWidth: '150px' }}>
                                    <label className="ap-label">Label</label>
                                    <input type="text" className="ap-input" placeholder="e.g. Matchday 1" value={gwForm.label} onChange={(e) => setGwForm({ ...gwForm, label: e.target.value })} />
                                </div>
                                <div className="ap-form-group" style={{ flex: 1, minWidth: '150px' }}>
                                    <label className="ap-label">Start Date</label>
                                    <input type="date" className="ap-input" value={gwForm.start_date} onChange={(e) => setGwForm({ ...gwForm, start_date: e.target.value })} required />
                                </div>
                                <div className="ap-form-group" style={{ flex: 1, minWidth: '150px' }}>
                                    <label className="ap-label">End Date</label>
                                    <input type="date" className="ap-input" value={gwForm.end_date} onChange={(e) => setGwForm({ ...gwForm, end_date: e.target.value })} required />
                                </div>
                                <button type="submit" className="ap-btn ap-btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
                            </form>
                        )}
                        <div className="ap-table-container">
                            <table className="ap-table">
                                <thead>
                                    <tr><th>#</th><th>Label</th><th>Start</th><th>End</th><th>Fixtures</th></tr>
                                </thead>
                                <tbody>
                                    {season.gameweeks.length === 0 ? (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No gameweeks yet</td></tr>
                                    ) : season.gameweeks.map((gw) => (
                                        <tr key={gw.id}>
                                            <td style={{ fontWeight: 600 }}>{gw.number}</td>
                                            <td>{gw.label || `Gameweek ${gw.number}`}</td>
                                            <td style={{ color: '#aaa', fontSize: '0.85rem' }}>{gw.start_date}</td>
                                            <td style={{ color: '#aaa', fontSize: '0.85rem' }}>{gw.end_date}</td>
                                            <td>{gw.fixtures_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Fixtures Tab */}
                {activeTab === 'fixtures' && (
                    <div className="ap-card">
                        <div className="ap-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Fixtures</h3>
                            <button className="ap-btn ap-btn-sm ap-btn-primary" onClick={() => setShowFixtureForm(!showFixtureForm)}>
                                <Plus size={14} /> Add Fixture
                            </button>
                        </div>
                        {showFixtureForm && (
                            <form onSubmit={handleCreateFixture} style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                    <div className="ap-form-group">
                                        <label className="ap-label">Opponent</label>
                                        <input type="text" className="ap-input" placeholder="e.g. Manchester City" value={fixtureForm.opponent_name} onChange={(e) => setFixtureForm({ ...fixtureForm, opponent_name: e.target.value })} required />
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-label">Opponent Logo URL</label>
                                        <input type="text" className="ap-input" placeholder="https://..." value={fixtureForm.opponent_logo} onChange={(e) => setFixtureForm({ ...fixtureForm, opponent_logo: e.target.value })} />
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-label">Venue</label>
                                        <select className="ap-input" value={fixtureForm.venue} onChange={(e) => setFixtureForm({ ...fixtureForm, venue: e.target.value })}>
                                            <option value="home">Home</option>
                                            <option value="away">Away</option>
                                        </select>
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-label">Competition</label>
                                        <input type="text" className="ap-input" placeholder="e.g. Premier League" value={fixtureForm.competition} onChange={(e) => setFixtureForm({ ...fixtureForm, competition: e.target.value })} />
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-label">Match Date & Time</label>
                                        <input type="datetime-local" className="ap-input" value={fixtureForm.match_date} onChange={(e) => setFixtureForm({ ...fixtureForm, match_date: e.target.value })} required />
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-label">Gameweek</label>
                                        <select className="ap-input" value={fixtureForm.gameweek_id} onChange={(e) => setFixtureForm({ ...fixtureForm, gameweek_id: e.target.value })}>
                                            <option value="">None</option>
                                            {season.gameweeks.map((gw) => (
                                                <option key={gw.id} value={gw.id}>GW {gw.number}{gw.label ? ` - ${gw.label}` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button type="button" className="ap-btn ap-btn-ghost" onClick={() => setShowFixtureForm(false)}>Cancel</button>
                                    <button type="submit" className="ap-btn ap-btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Fixture'}</button>
                                </div>
                            </form>
                        )}
                        <div className="ap-table-container">
                            <table className="ap-table">
                                <thead>
                                    <tr><th>Opponent</th><th>Venue</th><th>Competition</th><th>Date</th><th>GW</th><th>Status</th><th>Score</th><th>Predictions</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {season.fixtures.length === 0 ? (
                                        <tr><td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No fixtures yet</td></tr>
                                    ) : season.fixtures.map((fixture) => (
                                        <tr key={fixture.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {fixture.opponent_logo && <img src={fixture.opponent_logo} alt="" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />}
                                                    <span style={{ fontWeight: 500 }}>{fixture.opponent_name}</span>
                                                </div>
                                            </td>
                                            <td style={{ textTransform: 'capitalize' }}>{fixture.venue}</td>
                                            <td style={{ color: '#aaa', fontSize: '0.85rem' }}>{fixture.competition || '—'}</td>
                                            <td style={{ fontSize: '0.85rem' }}>{fixture.match_date}</td>
                                            <td>{fixture.gameweek ? `GW${fixture.gameweek.number}` : '—'}</td>
                                            <td>{getStatusBadge(fixture.status)}</td>
                                            <td style={{ fontWeight: 600 }}>
                                                {fixture.status === 'completed' ? `${fixture.home_score} - ${fixture.away_score}` : '—'}
                                            </td>
                                            <td>{fixture.entries_count}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    {fixture.status === 'upcoming' && (
                                                        <>
                                                            <button className="ap-btn ap-btn-sm ap-btn-primary" onClick={() => { setShowResultModal(fixture.id); setResultForm({ home_score: '', away_score: '' }); }}>
                                                                Result
                                                            </button>
                                                            <button className="ap-btn ap-btn-sm ap-btn-ghost" style={{ color: '#F59E0B' }} onClick={() => handleCancelFixture(fixture.id)}>
                                                                <X size={12} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Standings Tab */}
                {activeTab === 'standings' && (
                    <div className="ap-card">
                        <div className="ap-card-header"><h3>Season Standings</h3></div>
                        <div className="ap-table-container">
                            <table className="ap-table">
                                <thead>
                                    <tr><th>#</th><th>Player</th><th>Points</th><th>Predictions</th><th>Correct</th><th>Accuracy</th><th>Streak</th><th>Best</th></tr>
                                </thead>
                                <tbody>
                                    {standings.length === 0 ? (
                                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No standings yet</td></tr>
                                    ) : standings.map((entry) => (
                                        <tr key={entry.user_id} style={entry.rank <= 4 ? { background: 'rgba(139, 92, 246, 0.04)' } : {}}>
                                            <td style={getRankStyle(entry.rank)}>{entry.rank}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600, color: '#8B5CF6', overflow: 'hidden' }}>
                                                        {entry.user?.profile_image
                                                            ? <img src={entry.user.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            : entry.user?.first_name?.charAt(0) || '?'}
                                                    </div>
                                                    <span>{entry.user?.first_name} {entry.user?.last_name}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#8B5CF6' }}>{entry.total_points}</td>
                                            <td>{entry.predictions_made}</td>
                                            <td>{entry.correct_predictions}</td>
                                            <td>{entry.accuracy}%</td>
                                            <td>
                                                {entry.current_streak > 0 && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F97316' }}>
                                                        <Flame size={14} /> {entry.current_streak}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ color: '#aaa' }}>{entry.best_streak}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Badges Tab */}
                {activeTab === 'badges' && (
                    <div className="ap-card">
                        <div className="ap-card-header"><h3>Badge Awards</h3></div>
                        <div className="ap-table-container">
                            <table className="ap-table">
                                <thead>
                                    <tr><th>Badge</th><th>Player</th><th>Times Earned</th><th>Earned At</th></tr>
                                </thead>
                                <tbody>
                                    {badges.length === 0 ? (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No badges awarded yet</td></tr>
                                    ) : badges.map((entry) => (
                                        <tr key={entry.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${entry.badge?.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Award size={14} color={entry.badge?.color} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{entry.badge?.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{entry.badge?.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{entry.user?.first_name} {entry.user?.last_name}</td>
                                            <td>{entry.times_earned}x</td>
                                            <td style={{ color: '#aaa', fontSize: '0.85rem' }}>{entry.earned_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Enter Result Modal */}
                {showResultModal !== null && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                        onClick={() => setShowResultModal(null)}>
                        <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '24px', width: '360px', border: '1px solid rgba(255,255,255,0.1)' }}
                            onClick={(e) => e.stopPropagation()}>
                            <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '1.1rem' }}>Enter Match Result</h3>
                            <p style={{ color: '#aaa', fontSize: '0.85rem', margin: '0 0 16px' }}>
                                {season.fixtures.find(f => f.id === showResultModal)?.opponent_name
                                    ? `vs ${season.fixtures.find(f => f.id === showResultModal)?.opponent_name}`
                                    : ''}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '4px' }}>Home</label>
                                    <input
                                        type="number" min="0" max="99" className="ap-input"
                                        style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 }}
                                        value={resultForm.home_score}
                                        onChange={(e) => setResultForm({ ...resultForm, home_score: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <span style={{ color: '#888', fontSize: '1.2rem', paddingTop: '20px' }}>—</span>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '4px' }}>Away</label>
                                    <input
                                        type="number" min="0" max="99" className="ap-input"
                                        style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 }}
                                        value={resultForm.away_score}
                                        onChange={(e) => setResultForm({ ...resultForm, away_score: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button className="ap-btn ap-btn-ghost" onClick={() => setShowResultModal(null)}>Cancel</button>
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
                )}
            </div>
        </AdminLayout>
    );
}
