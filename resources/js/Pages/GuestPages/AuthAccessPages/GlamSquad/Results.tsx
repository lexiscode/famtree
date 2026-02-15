import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import {
    Sparkles, ArrowLeft, Trophy, Crown,
} from 'lucide-react';
import EntryCard from '@/Components/GlamSquad/EntryCard';
import GenderTrackToggle from '@/Components/GlamSquad/GenderTrackToggle';
import type { GlamChallenge, GlamEntry } from '@/types/glam';
import '../../../../../css/glam-squad.css';

interface Props {
    challenge: GlamChallenge;
    entries: GlamEntry[];
}

export default function Results({ challenge, entries }: Props) {
    // Determine initial track from URL
    const urlTrack = typeof window !== 'undefined'
        ? window.location.pathname.split('/').pop() as 'female' | 'male'
        : 'female';
    const [track, setTrack] = useState<'female' | 'male'>(
        urlTrack === 'male' ? 'male' : 'female'
    );

    const handleTrackChange = (newTrack: 'female' | 'male') => {
        setTrack(newTrack);
        window.location.href = route('glam-squad.results', { challengeId: challenge.id, track: newTrack });
    };

    const qualified = entries.filter(e => e.is_qualified);
    const unqualified = entries.filter(e => !e.is_qualified);
    const top3 = qualified.filter(e => e.rank !== null && e.rank <= 3);
    const restQualified = qualified.filter(e => e.rank === null || e.rank > 3);

    if (!challenge) {
        return (
            <AuthAccessLayout>
                <div className="glam-page">
                    <div className="container-fluid">
                        <div className="glam-content">
                            <div className="glam-empty">
                                <Sparkles size={32} className="glam-empty-icon" />
                                <h3>Results not available</h3>
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

                        {/* Header */}
                        <div style={{ marginBottom: 24 }}>
                            <h1 style={{ color: '#ffffff', fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Trophy size={24} style={{ color: '#ffd700' }} />
                                Challenge #{challenge.challenge_number} Results
                            </h1>
                            <p style={{ color: '#94a3b8', fontSize: 14, margin: '4px 0 0' }}>
                                {challenge.title}
                                {challenge.theme && <span className="theme-tag" style={{ marginLeft: 8 }}>{challenge.theme}</span>}
                            </p>
                        </div>

                        {/* Gender Toggle */}
                        <div style={{ marginBottom: 24 }}>
                            <GenderTrackToggle value={track} onChange={handleTrackChange} />
                        </div>

                        {entries.length === 0 ? (
                            <div className="glam-empty">
                                <Sparkles size={32} className="glam-empty-icon" />
                                <h3>No results yet</h3>
                                <p>No qualifying entries in the {track} track for this challenge.</p>
                            </div>
                        ) : (
                            <>
                                {/* Top 3 Podium */}
                                {top3.length > 0 && (
                                    <div style={{ marginBottom: 32 }}>
                                        <div className="results-podium">
                                            {/* Reorder: 2nd, 1st, 3rd for visual podium */}
                                            {[
                                                top3.find(e => e.rank === 2),
                                                top3.find(e => e.rank === 1),
                                                top3.find(e => e.rank === 3),
                                            ].filter(Boolean).map((entry) => {
                                                if (!entry) return null;
                                                const isFirst = entry.rank === 1;
                                                return (
                                                    <div key={entry.id} className={`podium-entry ${isFirst ? 'podium-first' : ''}`}>
                                                        <div className="podium-rank">
                                                            {isFirst ? (
                                                                <Crown size={28} style={{ color: '#ffd700' }} />
                                                            ) : (
                                                                <span className={`rank-badge ${entry.rank === 2 ? 'silver' : 'bronze'}`} style={{ fontSize: 18 }}>
                                                                    {entry.rank}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="podium-photo-wrap">
                                                            {entry.photo_1 && (
                                                                <img src={entry.photo_1} alt="" className="podium-photo" />
                                                            )}
                                                        </div>
                                                        <div className="podium-user">
                                                            <div className="entry-card-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                                                                {entry.user?.profile_image_url ? (
                                                                    <img src={entry.user.profile_image_url} alt="" />
                                                                ) : (
                                                                    entry.user?.first_name?.charAt(0) || '?'
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div style={{ color: '#ffffff', fontWeight: 600, fontSize: 14 }}>
                                                                    {entry.user?.first_name} {entry.user?.last_name}
                                                                </div>
                                                                <div style={{ color: '#667eea', fontSize: 13, fontWeight: 600 }}>
                                                                    {Number(entry.weighted_score).toFixed(2)} pts
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                                                            <span>Avg: {Number(entry.avg_rating).toFixed(1)}</span>
                                                            <span>{entry.vote_count} votes</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Ranked Entries */}
                                {restQualified.length > 0 && (
                                    <div className="sidebar-widget">
                                        <div className="widget-header">
                                            <h3><Trophy size={16} /> Ranked Entries</h3>
                                        </div>
                                        <div className="widget-body" style={{ padding: 0 }}>
                                            <div style={{ display: 'grid', gap: 16, padding: 16 }}>
                                                {restQualified.map(entry => (
                                                    <EntryCard key={entry.id} entry={entry} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* All Entries (unqualified — didn't meet min votes) */}
                                {unqualified.length > 0 && (
                                    <div className="sidebar-widget">
                                        <div className="widget-header">
                                            <h3><Sparkles size={16} /> All Entries ({unqualified.length})</h3>
                                        </div>
                                        <div style={{ padding: '8px 16px 0', color: '#94a3b8', fontSize: 13 }}>
                                            These entries did not meet the minimum vote requirement (5 votes) to qualify for ranking.
                                        </div>
                                        <div className="widget-body" style={{ padding: 0 }}>
                                            <div style={{ display: 'grid', gap: 16, padding: 16 }}>
                                                {unqualified.map(entry => (
                                                    <EntryCard key={entry.id} entry={entry} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
