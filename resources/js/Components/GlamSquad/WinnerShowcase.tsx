import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Sparkles, Crown } from 'lucide-react';
import type { GlamWinner } from '@/types/glam';

export default function WinnerShowcase() {
    const [winners, setWinners] = useState<GlamWinner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(route('glam-squad.winners'))
            .then(r => r.json())
            .then(data => {
                setWinners(data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading || winners.length === 0) return null;

    return (
        <div className="sidebar-widget">
            <div className="widget-header">
                <h3><Sparkles size={16} /> Glam Winners</h3>
                <Link href={route('glam-squad.index')} style={{ fontSize: 12, color: '#667eea', textDecoration: 'none' }}>
                    View All
                </Link>
            </div>
            <div className="widget-body">
                <div className="winner-showcase">
                    {winners.slice(0, 4).map((w, idx) => (
                        <Link
                            key={idx}
                            href={route('glam-squad.results', { challengeId: w.challenge_id, track: w.gender_track })}
                            className="winner-item"
                            style={{ textDecoration: 'none' }}
                        >
                            {w.rank === 1 && (
                                <Crown size={16} style={{ color: '#ffd700', flexShrink: 0 }} />
                            )}
                            {w.rank !== 1 && (
                                <span className={`rank-badge ${w.rank === 2 ? 'silver' : w.rank === 3 ? 'bronze' : 'other'}`} style={{ flexShrink: 0 }}>
                                    {w.rank}
                                </span>
                            )}
                            <img src={w.photo_1} alt="" className="winner-photo" />
                            <div className="winner-info">
                                <div className="winner-name">
                                    {w.user?.first_name} {w.user?.last_name}
                                </div>
                                <div className="winner-score">
                                    {Number(w.weighted_score).toFixed(1)} pts
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
