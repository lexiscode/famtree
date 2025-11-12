import { Link } from '@inertiajs/react';

interface Family {
    id: number;
    name: string;
    state: string;
    lga: string;
    founder: string;
    member_count: number;
    cover_image: string;
    slug: string;
}

interface FamilyCardProps {
    family: Family;
}

export default function FamilyCard({ family }: FamilyCardProps) {
    return (
        <div className="family-card">
            <div className="family-card-image">
                {family.cover_image ? (
                    <img src={family.cover_image} alt={family.name} />
                ) : (
                    <div className="family-card-image-placeholder">🌳</div>
                )}
                <div className="family-card-overlay">
                    <Link href={`/families/${family.slug}`} className="view-family-btn">
                        View Family
                    </Link>
                </div>
            </div>

            <div className="family-card-content">
                <h3 className="family-card-name">{family.name}</h3>
                <p className="family-card-location">
                    {family.state}
                    {family.lga && ` • ${family.lga}`}
                </p>
                <p className="family-card-founder">
                    Founded by <strong>{family.founder}</strong>
                </p>

                <div className="family-card-stats">
                    <div className="stat">
                        <span className="stat-icon">👥</span>
                        <span className="stat-value">{family.member_count}</span>
                        <span className="stat-label">Members</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
