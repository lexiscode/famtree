import { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import {
    Trophy, Target, Users, Award, Calendar, ArrowLeft,
    Flame, Check, X, Star, Shield, ChevronDown,
    MapPin, Clock,
} from 'lucide-react';
import '../../Organizations/Organizations.css';
import '../../../../../../css/predictions.css';

interface Organization {
    id: number;
    name: string;
    slug: string;
    short_name: string | null;
    logo_url: string | null;
    category_slug: string | null;
}

interface Season {
    id: number;
    name: string;
    status: string;
}

interface ActiveSeason {
    id: number;
    name: string;
    status: string;
    start_date: string;
    end_date: string;
    gameweeks: Gameweek[];
}

interface Gameweek {
    id: number;
    number: number;
    label: string | null;
    start_date: string;
    end_date: string;
}

interface UserPrediction {
    prediction_type: string;
    prediction_value: string | null;
    predicted_home_score: number | null;
    predicted_away_score: number | null;
    is_correct: boolean | null;
    points_earned: number;
    is_locked: boolean;
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
    gameweek_id: number | null;
    user_prediction: UserPrediction | null;
}

interface StandingEntry {
    rank: number;
    user_id: number;
    first_name: string;
    last_name: string;
    username: string;
    profile_image: string | null;
    total_points: number;
    predictions_made: number;
    correct_predictions: number;
    accuracy: number;
    current_streak: number;
    best_streak: number;
}

interface Badge {
    id: number;
    slug: string;
    name: string;
    description: string;
    icon: string;
    color: string;
}

interface UserBadge {
    badge_slug: string;
    times_earned: number;
    earned_at: string;
}

interface UserStanding {
    total_points: number;
    predictions_made: number;
    correct_predictions: number;
    accuracy: number;
    current_streak: number;
    best_streak: number;
    match_result_correct: number;
    double_chance_correct: number;
    correct_score_correct: number;
}

interface Props {
    organization: Organization;
    seasons: Season[];
    activeSeason: ActiveSeason | null;
    standings: StandingEntry[];
    fixtures: Fixture[];
    upcomingFixtures: Fixture[];
    userPredictions: any[];
    userStanding: UserStanding | null;
    badges: Badge[];
    userBadges: UserBadge[];
    isEligible: boolean;
}

export default function PredictionsIndex({
    organization, seasons, activeSeason, standings, fixtures,
    upcomingFixtures, userStanding, badges, userBadges, isEligible,
}: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const auth = (props as any).auth;
    const currentUserId = auth?.user?.id;

    const [activeTab, setActiveTab] = useState<'standings' | 'gameweek' | 'predictions' | 'badges'>('standings');
    const [selectedSeasonId, setSelectedSeasonId] = useState(activeSeason?.id || null);
    const [selectedGameweekId, setSelectedGameweekId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Prediction form state per fixture
    const [predForms, setPredForms] = useState<Record<number, { type: string; value: string; homeScore: string; awayScore: string }>>({});

    const handleSeasonChange = useCallback((seasonId: number) => {
        setSelectedSeasonId(seasonId);
        router.get(route('organizations.predictions', organization.slug), { season_id: seasonId }, { preserveScroll: true });
    }, [organization.slug]);

    const getPredForm = (fixtureId: number) => {
        return predForms[fixtureId] || { type: 'match_result', value: '', homeScore: '', awayScore: '' };
    };

    const updatePredForm = (fixtureId: number, updates: Partial<typeof predForms[number]>) => {
        setPredForms(prev => ({
            ...prev,
            [fixtureId]: { ...getPredForm(fixtureId), ...updates },
        }));
    };

    const handleSubmitPrediction = useCallback((fixtureId: number) => {
        const form = getPredForm(fixtureId);
        setSubmitting(true);

        const data: any = {
            fixture_id: fixtureId,
            prediction_type: form.type,
        };

        if (form.type === 'correct_score') {
            data.predicted_home_score = parseInt(form.homeScore);
            data.predicted_away_score = parseInt(form.awayScore);
        } else {
            data.prediction_value = form.value;
        }

        router.post(route('organizations.predictions.predict', organization.slug), data, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
        });
    }, [predForms, organization.slug]);

    const getRankStyle = (rank: number): React.CSSProperties => {
        if (rank === 1) return { color: '#FFD700', fontWeight: 700 };
        if (rank === 2) return { color: '#C0C0C0', fontWeight: 700 };
        if (rank === 3) return { color: '#CD7F32', fontWeight: 700 };
        if (rank === 4) return { color: '#a78bfa', fontWeight: 600 };
        return { color: '#94a3b8' };
    };

    const getBadgeIcon = (icon: string) => {
        switch (icon) {
            case 'star': return <Star size={20} />;
            case 'target': return <Target size={20} />;
            case 'flame': return <Flame size={20} />;
            case 'shield': return <Shield size={20} />;
            default: return <Award size={20} />;
        }
    };

    const formatPredictionLabel = (type: string, value: string | null) => {
        if (type === 'match_result') {
            return value === 'home_win' ? 'Home Win' : value === 'away_win' ? 'Away Win' : 'Draw';
        }
        if (type === 'double_chance') {
            return value === 'home_draw' ? 'Home/Draw' : value === 'away_draw' ? 'Away/Draw' : 'Home/Away';
        }
        return 'Correct Score';
    };

    const tabs = [
        { key: 'standings', label: 'Standings', icon: Users },
        { key: 'gameweek', label: 'Gameweek', icon: Calendar },
        { key: 'predictions', label: 'My Predictions', icon: Target },
        { key: 'badges', label: 'Badges', icon: Award },
    ] as const;

    const gameweekFixtures = selectedGameweekId
        ? fixtures.filter(f => f.gameweek_id === selectedGameweekId)
        : [];

    return (
        <AuthAccessLayout>
            <div className="predictions-page">
                <div className="predictions-background">
                    <div className="pred-orb pred-orb-1"></div>
                    <div className="pred-orb pred-orb-2"></div>
                </div>

                <div className="predictions-container">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="pred-flash pred-flash-success">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="pred-flash pred-flash-error">{flash.error}</div>
                )}

                {/* Header */}
                <div className="pred-header">
                    <div className="pred-header-left">
                        <button
                            className="pred-back-btn"
                            onClick={() => router.visit(route('organizations.show', organization.slug))}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        {organization.logo_url ? (
                            <img src={organization.logo_url} alt="" className="pred-org-logo" />
                        ) : (
                            <div className="pred-org-logo-placeholder"><Trophy size={24} /></div>
                        )}
                        <div>
                            <h1 className="pred-title">Prediction League</h1>
                            <p className="pred-subtitle">{organization.short_name || organization.name} {activeSeason ? `— ${activeSeason.name}` : ''}</p>
                        </div>
                    </div>
                    {seasons.length > 1 && (
                        <select
                            className="pred-season-select"
                            value={selectedSeasonId || ''}
                            onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                        >
                            {seasons.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Not Eligible */}
                {!isEligible && (
                    <div className="pred-not-eligible">
                        <Trophy size={32} style={{ marginBottom: '12px', opacity: 0.7 }} />
                        <h3>Join a group to participate</h3>
                        <p>
                            You need to be a member of a group within this organization to make predictions.
                        </p>
                    </div>
                )}

                {/* No Season */}
                {!activeSeason && isEligible && (
                    <div className="pred-card">
                        <div className="pred-empty">No prediction season available yet. Check back soon!</div>
                    </div>
                )}

                {activeSeason && isEligible && (
                    <>
                        {/* User Stats */}
                        {userStanding && (
                            <div className="pred-user-stats">
                                <div className="pred-stat-item">
                                    <span className="pred-stat-value">{userStanding.total_points}</span>
                                    <span className="pred-stat-label">Points</span>
                                </div>
                                <div className="pred-stat-item">
                                    <span className="pred-stat-value">{userStanding.accuracy}%</span>
                                    <span className="pred-stat-label">Accuracy</span>
                                </div>
                                <div className="pred-stat-item">
                                    <span className="pred-stat-value" style={{ color: '#F97316' }}>
                                        {userStanding.current_streak > 0 ? userStanding.current_streak : '0'}
                                    </span>
                                    <span className="pred-stat-label">Streak</span>
                                </div>
                                <div className="pred-stat-item">
                                    <span className="pred-stat-value">{userStanding.predictions_made}</span>
                                    <span className="pred-stat-label">Predictions</span>
                                </div>
                            </div>
                        )}

                        {/* Upcoming Fixtures */}
                        {upcomingFixtures.length > 0 && (
                            <div className="pred-card" style={{ marginBottom: '24px' }}>
                                <div className="pred-card-header">
                                    <h3>
                                        <Target size={16} color="#a78bfa" style={{ marginRight: '8px' }} /> Upcoming Fixtures
                                    </h3>
                                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{upcomingFixtures.length} open</span>
                                </div>
                                <div className="pred-card-body">
                                    <div className="pred-fixtures-grid">
                                        {upcomingFixtures.map(fixture => {
                                            const form = getPredForm(fixture.id);
                                            return (
                                                <div key={fixture.id} className="pred-fixture-card">
                                                    <div className="pred-fixture-header">
                                                        <div className="pred-fixture-opponent">
                                                            {fixture.opponent_logo ? (
                                                                <img src={fixture.opponent_logo} alt="" />
                                                            ) : (
                                                                <div className="pred-fixture-opponent-placeholder">
                                                                    {fixture.opponent_name.charAt(0)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
                                                                    vs {fixture.opponent_name}
                                                                </div>
                                                                <div className="pred-fixture-meta">
                                                                    <MapPin size={11} /> {fixture.venue === 'home' ? 'Home' : 'Away'}
                                                                    {fixture.competition && <> &middot; {fixture.competition}</>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="pred-fixture-meta">
                                                            <Clock size={11} />
                                                            {new Date(fixture.match_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>

                                                    {/* Already predicted */}
                                                    {fixture.user_prediction ? (
                                                        <div className="pred-confirmation">
                                                            <Check size={14} />
                                                            <span>
                                                                Your prediction: <strong>
                                                                    {fixture.user_prediction.prediction_type === 'correct_score'
                                                                        ? `${fixture.user_prediction.predicted_home_score}-${fixture.user_prediction.predicted_away_score}`
                                                                        : formatPredictionLabel(fixture.user_prediction.prediction_type, fixture.user_prediction.prediction_value)}
                                                                </strong>
                                                                <span style={{ marginLeft: '6px', opacity: 0.7, fontSize: '0.75rem' }}>
                                                                    ({fixture.user_prediction.prediction_type === 'correct_score' ? '15pts' : fixture.user_prediction.prediction_type === 'match_result' ? '5pts' : '2pts'})
                                                                </span>
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Bet Type Selector */}
                                                            <div className="pred-bet-types">
                                                                <button className={`pred-bet-type ${form.type === 'match_result' ? 'active' : ''}`}
                                                                    onClick={() => updatePredForm(fixture.id, { type: 'match_result', value: '' })}>
                                                                    Result (5pts)
                                                                </button>
                                                                <button className={`pred-bet-type ${form.type === 'double_chance' ? 'active' : ''}`}
                                                                    onClick={() => updatePredForm(fixture.id, { type: 'double_chance', value: '' })}>
                                                                    Double (2pts)
                                                                </button>
                                                                <button className={`pred-bet-type ${form.type === 'correct_score' ? 'active' : ''}`}
                                                                    onClick={() => updatePredForm(fixture.id, { type: 'correct_score', value: '' })}>
                                                                    Score (15pts)
                                                                </button>
                                                            </div>

                                                            {/* Match Result Options */}
                                                            {form.type === 'match_result' && (
                                                                <div className="pred-options">
                                                                    {[
                                                                        { value: 'home_win', label: 'Home Win' },
                                                                        { value: 'draw', label: 'Draw' },
                                                                        { value: 'away_win', label: 'Away Win' },
                                                                    ].map(opt => (
                                                                        <button
                                                                            key={opt.value}
                                                                            className={`pred-option-btn ${form.value === opt.value ? 'selected' : ''}`}
                                                                            onClick={() => {
                                                                                updatePredForm(fixture.id, { value: opt.value });
                                                                                setTimeout(() => handleSubmitPrediction(fixture.id), 0);
                                                                            }}
                                                                            disabled={submitting}
                                                                        >
                                                                            {opt.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Double Chance Options */}
                                                            {form.type === 'double_chance' && (
                                                                <div className="pred-options">
                                                                    {[
                                                                        { value: 'home_draw', label: 'Home/Draw' },
                                                                        { value: 'away_draw', label: 'Away/Draw' },
                                                                        { value: 'home_away', label: 'Home/Away' },
                                                                    ].map(opt => (
                                                                        <button
                                                                            key={opt.value}
                                                                            className={`pred-option-btn ${form.value === opt.value ? 'selected' : ''}`}
                                                                            onClick={() => {
                                                                                updatePredForm(fixture.id, { value: opt.value });
                                                                                setTimeout(() => handleSubmitPrediction(fixture.id), 0);
                                                                            }}
                                                                            disabled={submitting}
                                                                        >
                                                                            {opt.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Correct Score Inputs */}
                                                            {form.type === 'correct_score' && (
                                                                <div className="pred-score-inputs">
                                                                    <input
                                                                        type="number" min="0" max="99"
                                                                        className="pred-score-input"
                                                                        placeholder="H"
                                                                        value={form.homeScore}
                                                                        onChange={(e) => updatePredForm(fixture.id, { homeScore: e.target.value })}
                                                                    />
                                                                    <span className="pred-score-separator">—</span>
                                                                    <input
                                                                        type="number" min="0" max="99"
                                                                        className="pred-score-input"
                                                                        placeholder="A"
                                                                        value={form.awayScore}
                                                                        onChange={(e) => updatePredForm(fixture.id, { awayScore: e.target.value })}
                                                                    />
                                                                    <button
                                                                        className="pred-score-submit"
                                                                        onClick={() => handleSubmitPrediction(fixture.id)}
                                                                        disabled={submitting || form.homeScore === '' || form.awayScore === ''}
                                                                    >
                                                                        {submitting ? '...' : 'Submit'}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="pred-tabs">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        className={`pred-tab ${activeTab === tab.key ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab.key)}
                                    >
                                        <Icon size={15} /> {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Standings Tab */}
                        {activeTab === 'standings' && (
                            <div className="pred-card">
                                <div className="pred-card-header">
                                    <h3><Trophy size={16} color="#FFD700" style={{ marginRight: '8px' }} /> League Table</h3>
                                </div>
                                {standings.length === 0 ? (
                                    <div className="pred-empty">No standings yet. Make predictions to appear on the leaderboard!</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="pred-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th><th>Player</th><th>Pts</th><th>Pred</th><th>Correct</th><th>Acc%</th><th>Streak</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {standings.map(entry => (
                                                    <tr key={entry.user_id}
                                                        className={`${entry.user_id === currentUserId ? 'current-user' : ''} ${entry.rank <= 4 ? 'top-4' : ''}`}
                                                    >
                                                        <td style={getRankStyle(entry.rank)}>{entry.rank}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div className="pred-player-avatar">
                                                                    {entry.profile_image
                                                                        ? <img src={entry.profile_image} alt="" />
                                                                        : entry.first_name?.charAt(0) || '?'}
                                                                </div>
                                                                <span style={{ fontWeight: entry.user_id === currentUserId ? 600 : 400, color: '#e2e8f0' }}>
                                                                    {entry.first_name} {entry.last_name}
                                                                    {entry.user_id === currentUserId && <span style={{ fontSize: '0.72rem', color: '#a78bfa', marginLeft: '5px' }}>(You)</span>}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontWeight: 700, color: '#a78bfa' }}>{entry.total_points}</td>
                                                        <td>{entry.predictions_made}</td>
                                                        <td>{entry.correct_predictions}</td>
                                                        <td>{entry.accuracy}%</td>
                                                        <td>
                                                            {entry.current_streak > 0 && (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F97316', fontSize: '0.88rem' }}>
                                                                    <Flame size={13} /> {entry.current_streak}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Gameweek Tab */}
                        {activeTab === 'gameweek' && (
                            <div className="pred-card">
                                <div className="pred-card-header">
                                    <h3>Gameweek Results</h3>
                                    <select
                                        className="pred-season-select"
                                        value={selectedGameweekId || ''}
                                        onChange={(e) => setSelectedGameweekId(e.target.value ? parseInt(e.target.value) : null)}
                                    >
                                        <option value="">Select Gameweek</option>
                                        {activeSeason.gameweeks.map(gw => (
                                            <option key={gw.id} value={gw.id}>GW{gw.number}{gw.label ? ` — ${gw.label}` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pred-card-body">
                                    {!selectedGameweekId ? (
                                        <div className="pred-empty">Select a gameweek to view fixtures and results</div>
                                    ) : gameweekFixtures.length === 0 ? (
                                        <div className="pred-empty">No fixtures in this gameweek</div>
                                    ) : (
                                        <div className="pred-fixtures-grid">
                                            {gameweekFixtures.map(fixture => (
                                                <div key={fixture.id} className="pred-fixture-card">
                                                    <div className="pred-fixture-header">
                                                        <div className="pred-fixture-opponent">
                                                            {fixture.opponent_logo ? (
                                                                <img src={fixture.opponent_logo} alt="" />
                                                            ) : (
                                                                <div className="pred-fixture-opponent-placeholder">
                                                                    {fixture.opponent_name.charAt(0)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
                                                                    vs {fixture.opponent_name}
                                                                </div>
                                                                <div className="pred-fixture-meta">
                                                                    {fixture.venue === 'home' ? 'Home' : 'Away'} &middot; {fixture.competition || ''}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {fixture.status === 'completed' && (
                                                            <div className="pred-score-display">
                                                                {fixture.home_score} - {fixture.away_score}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {fixture.user_prediction && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                                                            <span style={{ color: '#94a3b8' }}>Your prediction:</span>
                                                            <span style={{ color: '#e2e8f0', fontWeight: 500 }}>
                                                                {fixture.user_prediction.prediction_type === 'correct_score'
                                                                    ? `${fixture.user_prediction.predicted_home_score}-${fixture.user_prediction.predicted_away_score}`
                                                                    : formatPredictionLabel(fixture.user_prediction.prediction_type, fixture.user_prediction.prediction_value)}
                                                            </span>
                                                            {fixture.user_prediction.is_correct !== null && (
                                                                <span className={`pred-result-badge ${fixture.user_prediction.is_correct ? 'pred-result-correct' : 'pred-result-incorrect'}`}>
                                                                    {fixture.user_prediction.is_correct ? <><Check size={12} /> +{fixture.user_prediction.points_earned}pts</> : <><X size={12} /> 0pts</>}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* My Predictions Tab */}
                        {activeTab === 'predictions' && (
                            <div>
                                {/* Accuracy Breakdown */}
                                {userStanding && (
                                    <div className="pred-user-stats">
                                        <div className="pred-stat-item">
                                            <span className="pred-stat-value">{userStanding.match_result_correct}</span>
                                            <span className="pred-stat-label">Match Results</span>
                                        </div>
                                        <div className="pred-stat-item">
                                            <span className="pred-stat-value">{userStanding.double_chance_correct}</span>
                                            <span className="pred-stat-label">Double Chance</span>
                                        </div>
                                        <div className="pred-stat-item">
                                            <span className="pred-stat-value">{userStanding.correct_score_correct}</span>
                                            <span className="pred-stat-label">Correct Scores</span>
                                        </div>
                                        <div className="pred-stat-item">
                                            <span className="pred-stat-value">{userStanding.best_streak}</span>
                                            <span className="pred-stat-label">Best Streak</span>
                                        </div>
                                    </div>
                                )}

                                {/* All fixture predictions */}
                                <div className="pred-card">
                                    <div className="pred-card-header"><h3>All Predictions</h3></div>
                                    <div className="pred-card-body">
                                        {fixtures.filter(f => f.user_prediction).length === 0 ? (
                                            <div className="pred-empty">No predictions made yet</div>
                                        ) : (
                                            <div className="pred-fixtures-grid">
                                                {fixtures.filter(f => f.user_prediction).map(fixture => (
                                                    <div key={fixture.id} className="pred-fixture-card">
                                                        <div className="pred-fixture-header">
                                                            <div className="pred-fixture-opponent">
                                                                {fixture.opponent_logo ? (
                                                                    <img src={fixture.opponent_logo} alt="" />
                                                                ) : (
                                                                    <div className="pred-fixture-opponent-placeholder">
                                                                        {fixture.opponent_name.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
                                                                        vs {fixture.opponent_name}
                                                                    </div>
                                                                    <div className="pred-fixture-meta">
                                                                        {new Date(fixture.match_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                                        {fixture.competition && <> &middot; {fixture.competition}</>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {fixture.status === 'completed' && (
                                                                <div className="pred-score-display">{fixture.home_score} - {fixture.away_score}</div>
                                                            )}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                                                            <span className="pred-type-badge">
                                                                {fixture.user_prediction!.prediction_type.replace('_', ' ')}
                                                            </span>
                                                            <span style={{ color: '#e2e8f0' }}>
                                                                {fixture.user_prediction!.prediction_type === 'correct_score'
                                                                    ? `${fixture.user_prediction!.predicted_home_score}-${fixture.user_prediction!.predicted_away_score}`
                                                                    : formatPredictionLabel(fixture.user_prediction!.prediction_type, fixture.user_prediction!.prediction_value)}
                                                            </span>
                                                            {fixture.user_prediction!.is_correct !== null && (
                                                                <span className={`pred-result-badge ${fixture.user_prediction!.is_correct ? 'pred-result-correct' : 'pred-result-incorrect'}`}>
                                                                    {fixture.user_prediction!.is_correct ? `+${fixture.user_prediction!.points_earned}pts` : '0pts'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Badges Tab */}
                        {activeTab === 'badges' && (
                            <div className="pred-card">
                                <div className="pred-card-header"><h3><Award size={16} color="#FFD700" style={{ marginRight: '8px' }} /> Badges</h3></div>
                                <div className="pred-card-body">
                                    <div className="pred-badges-grid">
                                        {badges.map(badge => {
                                            const earned = userBadges.find(ub => ub.badge_slug === badge.slug);
                                            return (
                                                <div key={badge.slug} className={`pred-badge-card ${earned ? 'earned' : 'unearned'}`}>
                                                    <div className="pred-badge-icon" style={{ background: `${badge.color}22`, color: badge.color }}>
                                                        {getBadgeIcon(badge.icon)}
                                                    </div>
                                                    <div className="pred-badge-info">
                                                        <h4>{badge.name}</h4>
                                                        <p>{badge.description}</p>
                                                        {earned && (
                                                            <div className="pred-badge-earned-count">
                                                                Earned {earned.times_earned}x
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
