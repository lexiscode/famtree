interface FamilyData {
    state: string;
    lga: string;
    village: string;
    story: string;
}

interface OriginInfoProps {
    family: FamilyData;
}

export default function OriginInfo({ family }: OriginInfoProps) {
    return (
        <section className="origin-info">
            <div className="origin-grid">
                <div className="origin-story">
                    <h2>Our Story</h2>
                    <p>{family.story}</p>
                </div>

                <div className="origin-details">
                    <h2>Origin</h2>
                    <div className="origin-cards">
                        <div className="origin-card">
                            <span className="origin-icon">🏠</span>
                            <span className="origin-label">State</span>
                            <span className="origin-value">{family.state}</span>
                        </div>

                        {family.lga && (
                            <div className="origin-card">
                                <span className="origin-icon">🗺️</span>
                                <span className="origin-label">LGA</span>
                                <span className="origin-value">{family.lga}</span>
                            </div>
                        )}

                        {family.village && (
                            <div className="origin-card">
                                <span className="origin-icon">🏘️</span>
                                <span className="origin-label">Village</span>
                                <span className="origin-value">{family.village}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
