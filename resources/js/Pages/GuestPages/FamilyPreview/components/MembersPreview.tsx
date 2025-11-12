interface FamilyMember {
    id: number;
    name: string;
    relationship: string;
    photo: string;
}

interface MembersPreviewProps {
    members: FamilyMember[];
}

export default function MembersPreview({ members }: MembersPreviewProps) {
    const displayMembers = members.slice(0, 5);

    return (
        <section className="members-preview">
            <div className="members-header">
                <h2>Family Members (Limited Preview)</h2>
                <p className="members-subtitle">
                    Showing {displayMembers.length} of {members.length} members publicly visible
                </p>
            </div>

            <div className="members-grid">
                {displayMembers.map((member) => (
                    <div key={member.id} className="member-card">
                        <div className="member-photo">
                            {member.photo ? (
                                <img src={member.photo} alt={member.name} />
                            ) : (
                                <div className="member-photo-placeholder">👤</div>
                            )}
                        </div>
                        <h3 className="member-name">{member.name}</h3>
                        <p className="member-relationship">{member.relationship}</p>
                    </div>
                ))}
            </div>

            <div className="members-cta-overlay">
                <div className="members-cta-content">
                    <p>See all {members.length} members and connect with your family</p>
                    <button className="members-cta-btn">Sign Up to View More</button>
                </div>
            </div>
        </section>
    );
}
