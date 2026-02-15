import { useState, useCallback, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import {
    Sparkles, ArrowLeft, Send, Image, Clock, Vote, Eye, ZoomIn, ChevronLeft, ChevronRight, X, Heart, UserPlus,
} from 'lucide-react';
import PhotoUploader from '@/Components/GlamSquad/PhotoUploader';
import StarRating from '@/Components/GlamSquad/StarRating';
import ChallengeTimeline from '@/Components/GlamSquad/ChallengeTimeline';
import EntryCard from '@/Components/GlamSquad/EntryCard';
import type { GlamSeason, GlamChallenge, GlamSquad, GlamEntry } from '@/types/glam';
import type { VotableEntry } from '@/types/glam';
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

interface Props {
    season: GlamSeason | null;
    currentChallenge: GlamChallenge | null;
    challenges: GlamChallenge[];
    pastChallenges: GlamChallenge[];
    userSquad: GlamSquad | null;
    userMixedSquad: GlamSquad | null;
    userEntry: UserEntry | null;
    userVoteCount: number;
    isFollowing: boolean;
    userGender: string | null;
    challengeId: number;
}

export default function Challenge({
    season, currentChallenge, challenges, userSquad, userEntry,
    userVoteCount, isFollowing, userGender, challengeId,
}: Props) {
    // Find the target challenge
    const challenge = challenges.find(c => c.id === challengeId) || currentChallenge;

    // Submission form state
    const [photo1, setPhoto1] = useState<File | null>(null);
    const [photo2, setPhoto2] = useState<File | null>(null);
    const [caption, setCaption] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Voting state
    const [votableEntry, setVotableEntry] = useState<VotableEntry | null>(null);
    const [selectedStars, setSelectedStars] = useState(0);
    const [votingLoading, setVotingLoading] = useState(false);
    const [votedCount, setVotedCount] = useState(userVoteCount);
    const [noMoreEntries, setNoMoreEntries] = useState(false);

    // Lightbox state
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = (images: string[], startIndex: number = 0) => {
        setLightboxImages(images);
        setLightboxIndex(startIndex);
        setLightboxImage(images[startIndex]);
    };

    const closeLightbox = () => {
        setLightboxImage(null);
        setLightboxImages([]);
        setLightboxIndex(0);
    };

    const lightboxPrev = () => {
        const newIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
        setLightboxIndex(newIndex);
        setLightboxImage(lightboxImages[newIndex]);
    };

    const lightboxNext = () => {
        const newIndex = (lightboxIndex + 1) % lightboxImages.length;
        setLightboxIndex(newIndex);
        setLightboxImage(lightboxImages[newIndex]);
    };

    const entryPhotos = [userEntry?.photo_1, userEntry?.photo_2].filter(Boolean) as string[];

    const isSubmissionsOpen = challenge?.status === 'submissions_open';
    const isVotingOpen = challenge?.status === 'voting_open';
    const isCompleted = challenge?.status === 'completed';
    const canSubmit = isSubmissionsOpen && userSquad && !userEntry;
    const isEligibleToVote = isFollowing || !!userSquad;
    const canVote = isVotingOpen && !userEntry && isEligibleToVote;
    const needsJoinToVote = isVotingOpen && !userEntry && !isEligibleToVote;

    const countdownTarget = challenge?.status === 'submissions_open'
        ? challenge.submissions_close_at
        : challenge?.status === 'voting_open'
        ? challenge.voting_close_at
        : null;
    const countdownLabel = challenge?.status === 'submissions_open'
        ? 'Submissions close in'
        : challenge?.status === 'voting_open'
        ? 'Voting closes in'
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

    // Load first votable entry
    useEffect(() => {
        if (canVote && challengeId) {
            fetchNextVotable();
        }
    }, [canVote, challengeId]);

    const fetchNextVotable = useCallback(() => {
        setVotingLoading(true);
        setSelectedStars(0);
        fetch(route('glam-squad.nextVote', challengeId))
            .then(r => r.json())
            .then(data => {
                if (data && data.id) {
                    setVotableEntry(data);
                    setNoMoreEntries(false);
                } else {
                    setVotableEntry(null);
                    setNoMoreEntries(true);
                }
                setVotingLoading(false);
            })
            .catch(() => {
                setVotableEntry(null);
                setNoMoreEntries(true);
                setVotingLoading(false);
            });
    }, [challengeId]);

    const handleSubmit = useCallback(() => {
        if (!photo1 || submitting) return;

        setSubmitting(true);
        const formData = new FormData();
        formData.append('photo_1', photo1);
        if (photo2) formData.append('photo_2', photo2);
        if (caption) formData.append('caption', caption);

        router.post(route('glam-squad.submitEntry', challengeId), formData as any, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => setSubmitting(false),
        });
    }, [photo1, photo2, caption, challengeId, submitting]);

    const handleVote = useCallback(() => {
        if (!votableEntry || selectedStars === 0 || votingLoading) return;

        setVotingLoading(true);
        router.post(route('glam-squad.vote', votableEntry.id), { stars: selectedStars }, {
            preserveScroll: true,
            onSuccess: () => {
                setVotedCount(prev => prev + 1);
                fetchNextVotable();
            },
            onError: () => setVotingLoading(false),
        });
    }, [votableEntry, selectedStars, votingLoading, fetchNextVotable]);

    if (!challenge) {
        return (
            <AuthAccessLayout>
                <div className="glam-page">
                    <div className="container-fluid">
                        <div className="glam-content">
                            <div className="glam-empty">
                                <Sparkles size={32} className="glam-empty-icon" />
                                <h3>Challenge not found</h3>
                                <Link href={route('glam-squad.index')} className="glam-btn glam-btn-primary" style={{ marginTop: 16 }}>
                                    <ArrowLeft size={16} /> Back to Glam Squad
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthAccessLayout>
        );
    }

    return (
        <AuthAccessLayout>
            <div className="glam-page">
                <div className="container-fluid">
                    <div className="glam-content">
                        {/* Back button */}
                        <Link href={route('glam-squad.index')} style={{ color: '#667eea', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                            <ArrowLeft size={16} /> Back to Glam Squad
                        </Link>

                        <div className="row">
                            {/* Main Content */}
                            <div className="col-lg-8">
                                {/* Challenge Header */}
                                <div className="challenge-banner" style={{ marginBottom: 24 }}>
                                    <span className={`status-indicator ${challenge.status}`}>
                                        {challenge.status.replace('_', ' ')}
                                    </span>
                                    <h2 style={{ marginTop: 12 }}>
                                        Challenge #{challenge.challenge_number}: {challenge.title}
                                    </h2>
                                    {challenge.theme && <span className="theme-tag">{challenge.theme}</span>}
                                    {challenge.description && (
                                        <p style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 16 }}>
                                            {challenge.description}
                                        </p>
                                    )}
                                    <ChallengeTimeline status={challenge.status} />

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
                                </div>

                                {/* Submission Form */}
                                {canSubmit && (
                                    <div className="sidebar-widget">
                                        <div className="widget-header">
                                            <h3><Image size={16} /> Submit Your Entry</h3>
                                        </div>
                                        <div className="widget-body">
                                            <PhotoUploader onPhotos={(p1, p2) => { setPhoto1(p1); setPhoto2(p2); }} />

                                            <div style={{ marginTop: 16 }}>
                                                <label style={{ color: '#94a3b8', fontSize: 13, marginBottom: 6, display: 'block' }}>
                                                    Caption (optional, max 200 chars)
                                                </label>
                                                <textarea
                                                    value={caption}
                                                    onChange={e => setCaption(e.target.value)}
                                                    maxLength={200}
                                                    rows={3}
                                                    placeholder="Describe your outfit..."
                                                    style={{
                                                        width: '100%', padding: '10px 14px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: 10, color: '#ffffff',
                                                        fontSize: 14, resize: 'none',
                                                    }}
                                                />
                                                <div style={{ textAlign: 'right', color: '#64748b', fontSize: 12, marginTop: 4 }}>
                                                    {caption.length}/200
                                                </div>
                                            </div>

                                            <button
                                                className="glam-btn glam-btn-pink"
                                                onClick={handleSubmit}
                                                disabled={!photo1 || submitting}
                                                style={{ width: '100%', marginTop: 12 }}
                                            >
                                                <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Entry'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Already Submitted */}
                                {isSubmissionsOpen && userEntry && (
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
                                                marginBottom: 12,
                                            }}>
                                                {entryPhotos.map((photo, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => openLightbox(entryPhotos, i)}
                                                        className="entry-photo-thumb"
                                                    >
                                                        <img src={photo} alt={`Photo ${i + 1}`} />
                                                        <div className="entry-photo-overlay">
                                                            <ZoomIn size={20} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {userEntry.caption && (
                                                <p style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 12 }}>
                                                    {userEntry.caption}
                                                </p>
                                            )}
                                            <p style={{ color: '#34d399', fontSize: 14, textAlign: 'center' }}>
                                                Entry submitted! Voting will begin soon.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* No Squad Warning */}
                                {isSubmissionsOpen && !userSquad && (
                                    <div className="sidebar-widget">
                                        <div className="widget-body" style={{ textAlign: 'center', padding: '32px 20px' }}>
                                            <Sparkles size={32} style={{ color: '#667eea', marginBottom: 12 }} />
                                            <h3 style={{ color: '#ffffff', fontSize: 18, marginBottom: 8 }}>Join a Squad to Compete</h3>
                                            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>
                                                You need to join a gendered squad before you can submit entries.
                                            </p>
                                            <Link href={route('glam-squad.index')} className="glam-btn glam-btn-pink">
                                                Go to Squads
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Join/Follow Guide for Voting */}
                                {needsJoinToVote && (
                                    <div className="sidebar-widget">
                                        <div className="widget-body" style={{ textAlign: 'center', padding: '32px 20px' }}>
                                            <Vote size={36} style={{ color: '#667eea', marginBottom: 16 }} />
                                            <h3 style={{ color: '#ffffff', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                                                Want to vote?
                                            </h3>
                                            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                                                To participate in voting, you need to either follow Glam Squad or join a squad first.
                                            </p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                <button
                                                    className="glam-btn glam-btn-pink"
                                                    style={{ width: '100%', justifyContent: 'center' }}
                                                    onClick={() => router.post(route('glam-squad.toggleFollow'), {}, { preserveScroll: true })}
                                                >
                                                    <Heart size={16} /> Follow Glam Squad
                                                </button>
                                                <Link
                                                    href={route('glam-squad.index')}
                                                    className="glam-btn glam-btn-primary"
                                                    style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                                                >
                                                    <UserPlus size={16} /> Join a Squad
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Voting Booth */}
                                {canVote && (
                                    <div className="voting-booth">
                                        <div className="voting-booth-header">
                                            <h3><Vote size={18} /> Voting Booth</h3>
                                            <span style={{ color: '#94a3b8', fontSize: 13 }}>
                                                You've cast {votedCount} vote{votedCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        {votingLoading && (
                                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                                <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading entry...</div>
                                            </div>
                                        )}

                                        {!votingLoading && votableEntry && (
                                            <div className="voting-booth-entry">
                                                <div className="voting-entry-photos">
                                                    {(() => {
                                                        const photos = [votableEntry.photo_1, votableEntry.photo_2].filter(Boolean) as string[];
                                                        return photos.map((photo, i) => (
                                                            <div
                                                                key={i}
                                                                onClick={() => openLightbox(photos, i)}
                                                                className="entry-photo-thumb"
                                                                style={{ aspectRatio: 'auto' }}
                                                            >
                                                                <img src={photo} alt="Entry" className="voting-photo" />
                                                                <div className="entry-photo-overlay">
                                                                    <ZoomIn size={22} />
                                                                </div>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>

                                                {votableEntry.user && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 8px' }}>
                                                        <div className="entry-card-avatar">
                                                            {votableEntry.user.profile_image_url ? (
                                                                <img src={votableEntry.user.profile_image_url} alt="" />
                                                            ) : (
                                                                votableEntry.user.first_name?.charAt(0) || '?'
                                                            )}
                                                        </div>
                                                        <span style={{ color: '#ffffff', fontWeight: 500, fontSize: 14 }}>
                                                            {votableEntry.user.first_name} {votableEntry.user.last_name}
                                                        </span>
                                                    </div>
                                                )}

                                                {votableEntry.caption && (
                                                    <p style={{ color: '#cbd5e1', fontSize: 14, margin: '8px 0 16px' }}>
                                                        {votableEntry.caption}
                                                    </p>
                                                )}

                                                <div style={{ textAlign: 'center', marginTop: 16 }}>
                                                    <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>
                                                        Rate this entry
                                                    </p>
                                                    <StarRating value={selectedStars} onChange={setSelectedStars} size={36} />

                                                    <button
                                                        className="glam-btn glam-btn-pink"
                                                        onClick={handleVote}
                                                        disabled={selectedStars === 0 || votingLoading}
                                                        style={{ width: '100%', marginTop: 16 }}
                                                    >
                                                        <Send size={16} /> Submit Vote
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {!votingLoading && noMoreEntries && (
                                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                                <Sparkles size={32} style={{ color: '#667eea', marginBottom: 12 }} />
                                                <h3 style={{ color: '#ffffff', fontSize: 18, marginBottom: 8 }}>All caught up!</h3>
                                                <p style={{ color: '#94a3b8', fontSize: 14 }}>
                                                    No more entries to vote on right now. Check back later!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Submitters can't vote message */}
                                {isVotingOpen && userEntry && (
                                    <div className="sidebar-widget">
                                        <div className="widget-body" style={{ textAlign: 'center', padding: '32px 20px' }}>
                                            <Eye size={32} style={{ color: '#667eea', marginBottom: 12 }} />
                                            <h3 style={{ color: '#ffffff', fontSize: 18, marginBottom: 8 }}>Voting in Progress</h3>
                                            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>
                                                Since you submitted an entry, you cannot vote in this challenge.
                                            </p>
                                            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 14, color: '#94a3b8', marginTop: 16 }}>
                                                <span>Rating: {Number(userEntry.avg_rating).toFixed(1)}</span>
                                                <span>Votes: {userEntry.vote_count}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Completed — show results link */}
                                {isCompleted && (
                                    <div className="sidebar-widget">
                                        <div className="widget-body" style={{ textAlign: 'center', padding: '32px 20px' }}>
                                            <Sparkles size={32} style={{ color: '#ffd700', marginBottom: 12 }} />
                                            <h3 style={{ color: '#ffffff', fontSize: 18, marginBottom: 8 }}>Challenge Complete!</h3>
                                            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>
                                                Results are in. See who topped the leaderboard!
                                            </p>
                                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                                <Link
                                                    href={route('glam-squad.results', { challengeId: challenge.id, track: 'female' })}
                                                    className="glam-btn glam-btn-pink"
                                                >
                                                    Female Results
                                                </Link>
                                                <Link
                                                    href={route('glam-squad.results', { challengeId: challenge.id, track: 'male' })}
                                                    className="glam-btn glam-btn-primary"
                                                >
                                                    Male Results
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="col-lg-4">
                                <div className="glam-sidebar">
                                    {/* Challenge Info */}
                                    <div className="sidebar-widget">
                                        <div className="widget-header">
                                            <h3><Sparkles size={16} /> Challenge Info</h3>
                                        </div>
                                        <div className="widget-body">
                                            <div style={{ fontSize: 13, color: '#94a3b8' }}>
                                                <div style={{ marginBottom: 8 }}>
                                                    <span style={{ color: '#64748b' }}>Entries:</span>{' '}
                                                    <span style={{ color: '#ffffff' }}>{challenge.entries_count}</span>
                                                </div>
                                                {challenge.submissions_open_at && (
                                                    <div style={{ marginBottom: 8 }}>
                                                        <span style={{ color: '#64748b' }}>Submissions Open:</span>{' '}
                                                        <span style={{ color: '#ffffff' }}>
                                                            {new Date(challenge.submissions_open_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {challenge.voting_open_at && (
                                                    <div style={{ marginBottom: 8 }}>
                                                        <span style={{ color: '#64748b' }}>Voting Opens:</span>{' '}
                                                        <span style={{ color: '#ffffff' }}>
                                                            {new Date(challenge.voting_open_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {challenge.results_at && (
                                                    <div>
                                                        <span style={{ color: '#64748b' }}>Results:</span>{' '}
                                                        <span style={{ color: '#ffffff' }}>
                                                            {new Date(challenge.results_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Your Entry (sidebar) */}
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
                                                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#94a3b8' }}>
                                                    <span>Rating: {Number(userEntry.avg_rating).toFixed(1)}</span>
                                                    <span>Votes: {userEntry.vote_count}</span>
                                                    {userEntry.rank && <span>Rank: #{userEntry.rank}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Squad Info */}
                                    {userSquad && (
                                        <div className="sidebar-widget">
                                            <div className="widget-header">
                                                <h3>Your Squad</h3>
                                            </div>
                                            <div className="widget-body" style={{ padding: 0 }}>
                                                <div style={{ padding: '12px 16px' }}>
                                                    <div style={{ color: '#ffffff', fontWeight: 600, fontSize: 14 }}>{userSquad.name}</div>
                                                    <div style={{ color: '#94a3b8', fontSize: 12 }}>{userSquad.member_count} members</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                    {/* Close button */}
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

                    {/* Photo counter */}
                    {lightboxImages.length > 1 && (
                        <div style={{
                            position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
                            color: '#94a3b8', fontSize: 14, fontWeight: 500,
                        }}>
                            {lightboxIndex + 1} / {lightboxImages.length}
                        </div>
                    )}

                    {/* Previous button */}
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

                    {/* Image */}
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

                    {/* Next button */}
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
