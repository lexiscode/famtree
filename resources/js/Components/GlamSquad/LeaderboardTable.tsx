import { useState } from 'react';
import { Flame, Crown, Medal, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GlamStanding } from '@/types/glam';

interface Props {
    standings: GlamStanding[];
    perPage?: number;
}

function getRankIcon(rank: number) {
    if (rank === 1) return <span className="rank-badge gold"><Crown size={14} /></span>;
    if (rank === 2) return <span className="rank-badge silver">{rank}</span>;
    if (rank === 3) return <span className="rank-badge bronze">{rank}</span>;
    return <span className="rank-badge other">{rank}</span>;
}

export default function LeaderboardTable({ standings, perPage = 20 }: Props) {
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(standings.length / perPage);
    const paginated = standings.slice((page - 1) * perPage, page * perPage);

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
        <div>
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
                    {paginated.map(s => (
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

            {totalPages > 1 && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 12, padding: '16px 0',
                }}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: page === 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                            border: 'none', color: page === 1 ? '#475569' : '#fff',
                            cursor: page === 1 ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: page === totalPages ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                            border: 'none', color: page === totalPages ? '#475569' : '#fff',
                            cursor: page === totalPages ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
