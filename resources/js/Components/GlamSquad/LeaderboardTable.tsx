import { Flame, Crown, Medal } from 'lucide-react';
import type { GlamStanding } from '@/types/glam';

interface Props {
    standings: GlamStanding[];
}

function getRankIcon(rank: number) {
    if (rank === 1) return <span className="rank-badge gold"><Crown size={14} /></span>;
    if (rank === 2) return <span className="rank-badge silver">{rank}</span>;
    if (rank === 3) return <span className="rank-badge bronze">{rank}</span>;
    return <span className="rank-badge other">{rank}</span>;
}

export default function LeaderboardTable({ standings }: Props) {
    if (standings.length === 0) {
        return (
            <div className="glam-empty">
                <Medal size={32} className="glam-empty-icon" />
                <h3>No standings yet</h3>
                <p>Leaderboard will update as challenges are completed.</p>
            </div>
        );
    }

    return (
        <table className="leaderboard-table">
            <thead>
                <tr>
                    <th className="rank-col">#</th>
                    <th>User</th>
                    <th style={{ textAlign: 'center' }}>Points</th>
                    <th style={{ textAlign: 'center' }}>Entries</th>
                    <th style={{ textAlign: 'center' }}>Wins</th>
                    <th style={{ textAlign: 'center' }}>Streak</th>
                </tr>
            </thead>
            <tbody>
                {standings.map(s => (
                    <tr key={s.user?.id || s.rank}>
                        <td className="rank-col">{getRankIcon(s.rank)}</td>
                        <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div className="entry-card-avatar">
                                    {s.user?.profile_image_url ? (
                                        <img src={s.user.profile_image_url} alt="" />
                                    ) : (
                                        s.user?.first_name?.charAt(0) || '?'
                                    )}
                                </div>
                                <span style={{ color: '#ffffff', fontWeight: 500 }}>
                                    {s.user?.first_name} {s.user?.last_name}
                                </span>
                            </div>
                        </td>
                        <td className="points-col" style={{ textAlign: 'center' }}>{s.total_points}</td>
                        <td style={{ textAlign: 'center' }}>{s.challenges_entered}</td>
                        <td style={{ textAlign: 'center' }}>{s.top_1_count}</td>
                        <td style={{ textAlign: 'center' }}>
                            {s.current_entry_streak > 0 && (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#f97316' }}>
                                    <Flame size={14} /> {s.current_entry_streak}
                                </span>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
