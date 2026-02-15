import { useEffect, useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { Sparkles, Crown, Trophy } from 'lucide-react';
import type { GlamWinner, GlamWinnersResponse } from '@/types/glam';

export default function WinnerShowcase() {
    const [data, setData] = useState<GlamWinnersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTrack, setActiveTrack] = useState<string>('female');

    useEffect(() => {
        fetch(route('glam-squad.winners'))
            .then(r => r.json())
            .then((res: GlamWinnersResponse) => {
                setData(res);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const tracks = useMemo(() => {
        if (!data) return [];
        const set = new Set(data.winners.map(w => w.gender_track));
        return Array.from(set);
    }, [data]);

    const filtered = useMemo(() => {
        if (!data) return [];
        return data.winners.filter(w => w.gender_track === activeTrack).slice(0, 4);
    }, [data, activeTrack]);

    // Auto-select first available track
    useEffect(() => {
        if (tracks.length > 0 && !tracks.includes(activeTrack)) {
            setActiveTrack(tracks[0]);
        }
    }, [tracks]);

    if (loading || !data || data.winners.length === 0) return null;

    const isSeason = data.type === 'season';
    const TitleIcon = isSeason ? Trophy : Sparkles;

    return (
        <div className="sidebar-widget">
            <div className="widget-header">
                <h6 className="widget-title">
                    <TitleIcon size={20} />
                    {data.title} Winners
                </h6>
            </div>
            {tracks.length > 1 && (
                <div className="glam-winner-toggle">
                    {tracks.map(track => (
                        <button
                            key={track}
                            className={`glam-winner-toggle-btn ${activeTrack === track ? 'active' : ''}`}
                            onClick={() => setActiveTrack(track)}
                        >
                            {track.charAt(0).toUpperCase() + track.slice(1)}
                        </button>
                    ))}
                </div>
            )}
            <div className="widget-body">
                <div className="glam-winner-list">
                    {filtered.map((w, idx) => {
                        const imgSrc = w.photo_1 || w.user?.profile_image_url || null;
                        const inner = (
                            <>
                                <div className="glam-winner-rank">
                                    {w.rank === 1 ? (
                                        <Crown size={16} className="glam-winner-crown" />
                                    ) : (
                                        <span className={`glam-rank-num ${w.rank === 2 ? 'silver' : w.rank === 3 ? 'bronze' : ''}`}>
                                            {w.rank}
                                        </span>
                                    )}
                                </div>
                                {imgSrc ? (
                                    <img src={imgSrc} alt="" className="glam-winner-thumb" />
                                ) : (
                                    <div className="glam-winner-thumb-fallback">
                                        {w.user?.first_name?.charAt(0) || '?'}
                                    </div>
                                )}
                                <div className="glam-winner-details">
                                    <span className="glam-winner-name">
                                        {w.user?.first_name} {w.user?.last_name}
                                    </span>
                                    <span className="glam-winner-pts">
                                        {Number(w.score).toFixed(1)} pts
                                    </span>
                                </div>
                            </>
                        );

                        return w.challenge_uuid ? (
                            <Link
                                key={idx}
                                href={route('glam-squad.results', { challengeUuid: w.challenge_uuid, track: w.gender_track })}
                                className="glam-winner-row"
                            >
                                {inner}
                            </Link>
                        ) : (
                            <div key={idx} className="glam-winner-row">
                                {inner}
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div className="glam-winner-empty">No winners yet</div>
                    )}
                </div>
            </div>
            <div className="widget-footer">
                <Link href={route('glam-squad.index')}>View All</Link>
            </div>
        </div>
    );
}
