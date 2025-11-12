interface FamilyData {
    member_count: number;
    founded_year: number;
    new_members_this_year: number;
}

interface FamilyStatsProps {
    family: FamilyData;
}

export default function FamilyStats({ family }: FamilyStatsProps) {
    return (
        <div className="family-stats">
            <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                    <span className="stat-value">{family.member_count}</span>
                    <span className="stat-label">Total Members</span>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                    <span className="stat-value">{family.founded_year}</span>
                    <span className="stat-label">Founded</span>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                    <span className="stat-value">+{family.new_members_this_year}</span>
                    <span className="stat-label">New This Year</span>
                </div>
            </div>
        </div>
    );
}
