import { Award } from 'lucide-react';
import type { GlamBadge, GlamUserBadge } from '@/types/glam';

interface Props {
    allBadges: GlamBadge[];
    userBadges: GlamUserBadge[];
}

export default function BadgeGrid({ allBadges, userBadges }: Props) {
    const earnedSlugs = new Set(userBadges.map(ub => ub.badge?.slug));

    return (
        <div className="badge-grid">
            {allBadges.map(badge => {
                const isEarned = earnedSlugs.has(badge.slug);
                const earned = userBadges.find(ub => ub.badge?.slug === badge.slug);

                return (
                    <div key={badge.slug} className={`badge-item ${isEarned ? 'earned' : 'locked'}`}>
                        <div className="badge-icon" style={{ background: `${badge.color}22` }}>
                            <Award size={20} color={badge.color} />
                        </div>
                        <div className="badge-name">{badge.name}</div>
                        <div className="badge-desc">{badge.description}</div>
                        {earned && (
                            <div style={{ marginTop: 6, fontSize: 11, color: badge.color }}>
                                {earned.times_earned}x earned
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
