import { useState, useCallback, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import {
    Sparkles, Image, Trophy, Users, Award, Heart, HeartOff,
    Clock, ChevronRight, ZoomIn, ChevronLeft, X,
} from 'lucide-react';
import ChallengeCard from '@/Components/GlamSquad/ChallengeCard';
import LeaderboardTable from '@/Components/GlamSquad/LeaderboardTable';
import GenderTrackToggle from '@/Components/GlamSquad/GenderTrackToggle';
import BadgeGrid from '@/Components/GlamSquad/BadgeGrid';
import SquadInfoCard from '@/Components/GlamSquad/SquadInfoCard';
import ChallengeTimeline from '@/Components/GlamSquad/ChallengeTimeline';
import type { GlamSeason, GlamChallenge, GlamSquad, GlamStanding, GlamBadge, GlamUserBadge } from '@/types/glam';
import '../../../../../css/glam-squad.css';

interface UserEntry {
    id: number;
    photo_1: string | null;
    photo_2: string | null;
    caption: string | null;
    avg_rating: number;
    vote_count: number;
    rank: number | null;
}

interface UserStanding {
    total_points: number;
    challenges_entered: number;
    current_entry_streak: number;
}

interface Props {
    season: GlamSeason | null;
    currentChallenge: GlamChallenge | null;
    challenges: GlamChallenge[];
    pastChallenges: GlamChallenge[];
    userSquad: GlamSquad | null;
    userMixedSquad: GlamSquad | null;
    userEntry: UserEntry | null;
    userVoteCount: number;
    userStanding: UserStanding | null;
    isFollowing: boolean;
    userGender: string | null;
    userBadges: GlamUserBadge[];
    allBadges: GlamBadge[];
    seasons: { id: number; uuid: string; name: string; status: string }[];
}

export default function Index({
    season, currentChallenge, challenges, pastChallenges,
    userSquad, userMixedSquad, userEntry, userVoteCount,
    userStanding, isFollowing, userGender, userBadges, allBadges, seasons,
}: Props) {
    const validTabs = ['challenges', 'leaderboard', 'squad', 'badges'] as const;
    type Tab = typeof validTabs[number];
    const getInitialTab = (): Tab => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.replace('#', '') as Tab;
            if (validTabs.includes(hash)) return hash;
        }
        return 'challenges';
    };
    const [activeTab, setActiveTab] = useState<Tab>(getInitialTab);
    const [genderTrack, setGenderTrack] = useState<'female' | 'male'>('female');
    const [standings, setStandings] = useState<GlamStanding[]>([]);

    useEffect(() => {
        if (activeTab === 'leaderboard' && season) {
            fetch(route('glam-squad.standings', { seasonUuid: season.uuid, track: genderTrack }))
                .then(r => r.json())
                .then(data => setStandings(data))
                .catch(() => {});
        }
    }, [activeTab, genderTrack, season?.uuid]);

    const handleFollow = useCallback(() => {
        router.post(route('glam-squad.toggleFollow'), {}, { preserveScroll: true });
    }, []);

    const countdownTarget = currentChallenge?.status === 'submissions_open'
        ? currentChallenge.submissions_close_at
        : currentChallenge?.status === 'voting_open'
        ? currentChallenge.voting_close_at
        : currentChallenge?.status === 'upcoming'
        ? currentChallenge.submissions_open_at
        : null;

    const countdownLabel = currentChallenge?.status === 'submissions_open'
        ? 'Submissions close in'
        : currentChallenge?.status === 'voting_open'
        ? 'Voting closes in'
        : currentChallenge?.status === 'upcoming'
        ? 'Submissions open in'
        : '';

    const calcCountdown = useCallback(() => {
        if (!countdownTarget) return null;
        const diff = new Date(countdownTarget).getTime() - Date.now();
        if (diff <= 0) return null;
        return {
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            mins: Math.floor((diff % 3600000) / 60000),
            secs: Math.floor((diff % 60000) / 1000),
        };
    }, [countdownTarget]);

    const [countdown, setCountdown] = useState(calcCountdown);

    useEffect(() => {
        if (!countdownTarget) return;
        setCountdown(calcCountdown());
        const timer = setInterval(() => {
            const val = calcCountdown();
            setCountdown(val);
            if (!val) clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdownTarget, calcCountdown]);

    const tabs = [
        { key: 'challenges', label: 'Challenges', icon: Image },
        { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        { key: 'squad', label: 'My Squad', icon: Users },
        { key: 'badges', label: 'Badges', icon: Award },
    ] as const;

    const hasSidebarContent = !!userStanding || !!userEntry || seasons.length > 1;

    // Lightbox
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = (images: string[], startIndex: number = 0) => {
        setLightboxImages(images);
        setLightboxIndex(startIndex);
        setLightboxImage(images[startIndex]);
    };
    const closeLightbox = () => { setLightboxImage(null); setLightboxImages([]); setLightboxIndex(0); };
    const lightboxPrev = () => { const i = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length; setLightboxIndex(i); setLightboxImage(lightboxImages[i]); };
    const lightboxNext = () => { const i = (lightboxIndex + 1) % lightboxImages.length; setLightboxIndex(i); setLightboxImage(lightboxImages[i]); };

    const entryPhotos = [userEntry?.photo_1, userEntry?.photo_2].filter(Boolean) as string[];

    return (
        <AuthAccessLayout>
            <div className="glam-page">
                <div className="container-fluid">
                    <div className="glam-content">
                        <div className="row justify-content-center">
                            {/* Main Content */}
                            <div className={hasSidebarContent ? 'col-lg-8' : 'col-lg-10 col-xl-8'}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <div>
                                        <h1 style={{ color: '#ffffff', fontSize: 28, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <Sparkles size={28} /> Glam Squad
                                        </h1>
                                        {season && (
                                            <p style={{ color: '#94a3b8', fontSize: 14, margin: '4px 0 0' }}>
                                                {season.name}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        className={`glam-btn ${isFollowing ? 'glam-btn-outline' : 'glam-btn-pink'}`}
                                        onClick={handleFollow}
                                    >
                                        {isFollowing ? <><HeartOff size={16} /> Unfollow</> : <><Heart size={16} /> Follow</>}
                                    </button>
                                </div>

                                {/* Current Challenge Banner */}
                                {currentChallenge && (
                                    <div className="challenge-banner">
                                        <span className={`status-indicator ${currentChallenge.status}`}>
                                            {currentChallenge.status.replace('_', ' ')}
                                        </span>
                                        <h2 style={{ marginTop: 12 }}>{currentChallenge.title}</h2>
                                        {currentChallenge.theme && (
                                            <span className="theme-tag">{currentChallenge.theme}</span>
                                        )}
                                        {currentChallenge.description && (
                                            <p style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 16 }}>
                                                {currentChallenge.description}
                                            </p>
                                        )}
                                        <ChallengeTimeline status={currentChallenge.status} />

                                        {countdown && (
                                            <div style={{ marginTop: 16 }}>
                                                <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>
                                                    <Clock size={12} /> {countdownLabel}
                                                </p>
                                                <div className="countdown">
                                                    <div className="countdown-segment">
                                                        <div className="countdown-value">{countdown.days}</div>
                                                        <div className="countdown-label">Days</div>
                                                    </div>
                                                    <div className="countdown-segment">
                                                        <div className="countdown-value">{countdown.hours}</div>
                                                        <div className="countdown-label">Hours</div>
                                                    </div>
                                                    <div className="countdown-segment">
                                                        <div className="countdown-value">{countdown.mins}</div>
                                                        <div className="countdown-label">Mins</div>
                                                    </div>
                                                    <div className="countdown-segment">
                                                        <div className="countdown-value">{countdown.secs}</div>
                                                        <div className="countdown-label">Secs</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                                            {currentChallenge.status === 'submissions_open' && userSquad && !userEntry && (
                                                <Link
                                                    href={route('glam-squad.challenge', currentChallenge.uuid)}
                                                    className="glam-btn glam-btn-pink"
                                                >
                                                    Submit Entry <ChevronRight size={16} />
                                                </Link>
                                            )}
                                            {currentChallenge.status === 'voting_open' && !userEntry && (
                                                <Link
                                                    href={route('glam-squad.challenge', currentChallenge.uuid)}
                                                    className="glam-btn glam-btn-primary"
                                                >
                                                    Vote Now <ChevronRight size={16} />
                                                </Link>
                                            )}
                                            {currentChallenge.status === 'completed' && (
                                                <Link
                                                    href={route('glam-squad.results', { challengeUuid: currentChallenge.uuid, track: 'female' })}
                                                    className="glam-btn glam-btn-primary"
                                                >
                                                    View Results <ChevronRight size={16} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Tabs */}
                                <div className="glam-tabs">
                                    {tabs.map(tab => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.key}
                                                className={`glam-tab ${activeTab === tab.key ? 'active' : ''}`}
                                                onClick={() => { setActiveTab(tab.key); window.location.hash = tab.key; }}
                                            >
                                                <Icon size={15} /> {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Challenges Tab */}
                                {activeTab === 'challenges' && (
                                    <div>
                                        {challenges.length > 0 ? (
                                            <div style={{ display: 'grid', gap: 16 }}>
                                                {challenges.map(c => (
                                                    <ChallengeCard
                                                        key={c.id}
                                                        challenge={c}
                                                        onClick={() => {
                                                            if (c.status === 'completed') {
                                                                router.visit(route('glam-squad.results', { challengeUuid: c.uuid, track: 'female' }));
                                                            } else {
                                                                router.visit(route('glam-squad.challenge', c.uuid));
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="glam-empty">
                                                <Sparkles size={32} className="glam-empty-icon" />
                                                <h3>No challenges yet</h3>
                                                <p>Check back soon for the first fashion challenge!</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Leaderboard Tab */}
                                {activeTab === 'leaderboard' && (
                                    <div className="sidebar-widget">
                                        <div className="widget-header">
                                            <h3><Trophy size={16} /> Season Leaderboard</h3>
                                            <GenderTrackToggle value={genderTrack} onChange={setGenderTrack} />
                                        </div>
                                        <div className="widget-body" style={{ padding: 0 }}>
                                            <LeaderboardTable standings={standings} />
                                        </div>
                                    </div>
                                )}

                                {/* Squad Tab */}
                                {activeTab === 'squad' && (
                                    <div>
                                        <SquadInfoCard squad={userSquad} type="gendered" userGender={userGender} />
                                        <SquadInfoCard squad={userMixedSquad} type="mixed" />
                                    </div>
                                )}

                                {/* Badges Tab */}
                                {activeTab === 'badges' && (
                                    <div className="sidebar-widget">
                                        <div className="widget-header">
                                            <h3><Award size={16} /> Badges</h3>
                                        </div>
                                        <div className="widget-body">
                                            <BadgeGrid allBadges={allBadges} userBadges={userBadges} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar — only rendered when there's content to show */}
                            {hasSidebarContent && (
                                <div className="col-lg-4">
                                    <div className="glam-sidebar">
                                        {/* User Stats */}
                                        {userStanding && (
                                            <div className="sidebar-widget">
                                                <div className="widget-header">
                                                    <h3><Trophy size={16} /> Your Stats</h3>
                                                </div>
                                                <div className="widget-body">
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
                                                        <div>
                                                            <div style={{ fontSize: 20, fontWeight: 700, color: '#667eea' }}>{userStanding.total_points}</div>
                                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Points</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff' }}>{userStanding.challenges_entered}</div>
                                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Entries</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 20, fontWeight: 700, color: '#f97316' }}>{userStanding.current_entry_streak}</div>
                                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Streak</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Current Entry */}
                                        {userEntry && (
                                            <div className="sidebar-widget">
                                                <div className="widget-header">
                                                    <h3><Image size={16} /> Your Entry</h3>
                                                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                                                        {entryPhotos.length} photo{entryPhotos.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <div className="widget-body">
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: entryPhotos.length > 1 ? '1fr 1fr' : '1fr',
                                                        gap: 8,
                                                        marginBottom: 8,
                                                    }}>
                                                        {entryPhotos.map((photo, i) => (
                                                            <div
                                                                key={i}
                                                                onClick={() => openLightbox(entryPhotos, i)}
                                                                className="entry-photo-thumb"
                                                            >
                                                                <img src={photo} alt={`Photo ${i + 1}`} />
                                                                <div className="entry-photo-overlay">
                                                                    <ZoomIn size={18} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {userEntry.caption && (
                                                        <p style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 8 }}>{userEntry.caption}</p>
                                                    )}
                                                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#94a3b8' }}>
                                                        <span>Rating: {Number(userEntry.avg_rating).toFixed(1)}</span>
                                                        <span>Votes: {userEntry.vote_count}</span>
                                                        {userEntry.rank && <span>Rank: #{userEntry.rank}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Season Selector */}
                                        {seasons.length > 1 && (
                                            <div className="sidebar-widget">
                                                <div className="widget-header">
                                                    <h3><Sparkles size={16} /> Seasons</h3>
                                                </div>
                                                <div className="widget-body">
                                                    {seasons.map(s => (
                                                        <div
                                                            key={s.id}
                                                            onClick={() => router.visit(route('glam-squad.index'), { data: { season_uuid: s.uuid } })}
                                                            style={{
                                                                padding: '8px 12px',
                                                                borderRadius: 8,
                                                                cursor: 'pointer',
                                                                background: season?.uuid === s.uuid ? 'rgba(102,126,234,0.15)' : 'transparent',
                                                                color: season?.uuid === s.uuid ? '#ffffff' : '#94a3b8',
                                                                fontSize: 13,
                                                                marginBottom: 4,
                                                            }}
                                                        >
                                                            {s.name}
                                                            <span style={{
                                                                marginLeft: 8,
                                                                fontSize: 11,
                                                                padding: '2px 8px',
                                                                borderRadius: 10,
                                                                background: s.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.1)',
                                                                color: s.status === 'active' ? '#34d399' : '#94a3b8',
                                                            }}>
                                                                {s.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    onClick={closeLightbox}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
                        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'fadeIn 0.2s ease',
                    }}
                >
                    <button
                        onClick={closeLightbox}
                        style={{
                            position: 'absolute', top: 16, right: 16,
                            width: 40, height: 40, borderRadius: 10,
                            background: 'rgba(255,255,255,0.1)', border: 'none',
                            color: '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <X size={20} />
                    </button>

                    {lightboxImages.length > 1 && (
                        <div style={{
                            position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
                            color: '#94a3b8', fontSize: 14, fontWeight: 500,
                        }}>
                            {lightboxIndex + 1} / {lightboxImages.length}
                        </div>
                    )}

                    {lightboxImages.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                            style={{
                                position: 'absolute', left: 16,
                                width: 44, height: 44, borderRadius: 12,
                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                color: '#fff', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    <img
                        src={lightboxImage}
                        alt={`Photo ${lightboxIndex + 1}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '90vw', maxHeight: '85vh',
                            objectFit: 'contain', borderRadius: 12,
                            animation: 'slideUp 0.25s ease',
                        }}
                    />

                    {lightboxImages.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                            style={{
                                position: 'absolute', right: 16,
                                width: 44, height: 44, borderRadius: 12,
                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                color: '#fff', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}
                </div>
            )}
        </AuthAccessLayout>
    );
}
