import { Calendar, Image, Clock } from 'lucide-react';
import type { GlamChallenge } from '@/types/glam';

interface Props {
    challenge: GlamChallenge;
    onClick?: () => void;
}

function getStatusLabel(status: string) {
    const map: Record<string, string> = {
        upcoming: 'Upcoming',
        submissions_open: 'Submissions Open',
        voting_open: 'Voting Open',
        completed: 'Completed',
    };
    return map[status] || status;
}

export default function ChallengeCard({ challenge, onClick }: Props) {
    return (
        <div className="entry-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            {challenge.banner_image && (
                <div className="entry-card-photos">
                    <img src={challenge.banner_image} alt={challenge.title} style={{ height: 160 }} />
                </div>
            )}
            <div className="entry-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <div>
                        <h3 style={{ color: '#ffffff', fontSize: 16, fontWeight: 600, margin: 0 }}>
                            #{challenge.challenge_number} {challenge.title}
                        </h3>
                        {challenge.theme && (
                            <span className="theme-tag" style={{
                                display: 'inline-block',
                                background: 'rgba(236, 72, 153, 0.2)',
                                color: '#f472b6',
                                padding: '2px 10px',
                                borderRadius: 20,
                                fontSize: 11,
                                marginTop: 4,
                            }}>
                                {challenge.theme}
                            </span>
                        )}
                    </div>
                    <span className={`status-indicator ${challenge.status}`}>
                        {getStatusLabel(challenge.status)}
                    </span>
                </div>
                {challenge.description && (
                    <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>
                        {challenge.description.slice(0, 100)}{challenge.description.length > 100 ? '...' : ''}
                    </p>
                )}
                <div className="entry-card-stats">
                    <span><Image size={14} /> {challenge.entries_count} entries</span>
                    {challenge.submissions_open_at && (
                        <span><Clock size={14} /> {new Date(challenge.submissions_open_at).toLocaleDateString()}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
