interface FamilyHeadCardProps {
    founder: string;
}

export default function FamilyHeadCard({ founder }: FamilyHeadCardProps) {
    return (
        <div className="family-head-card">
            <div className="head-photo">
                <div className="photo-placeholder">👤</div>
            </div>

            <div className="head-info">
                <h3 className="head-name">{founder}</h3>
                <p className="head-role">Family Founder</p>
                <p className="head-bio">The visionary founder of this family, preserving and building the family heritage.</p>
            </div>
        </div>
    );
}
