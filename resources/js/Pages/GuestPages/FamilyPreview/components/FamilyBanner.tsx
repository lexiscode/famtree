interface FamilyData {
    id: number;
    name: string;
    state: string;
    cover_image?: string;
}

interface FamilyBannerProps {
    family: FamilyData;
    onShare: () => void;
}

export default function FamilyBanner({ family, onShare }: FamilyBannerProps) {
    return (
        <div className="premium-family-banner">
            <div className="banner-background">
                {family.cover_image ? (
                    <img src={family.cover_image} alt={family.name} className="banner-bg-image" />
                ) : (
                    <div className="banner-bg-placeholder"></div>
                )}
                <div className="banner-gradient-overlay"></div>
            </div>

            <div className="banner-content-wrapper">
                <div className="banner-content-inner">
                    <div className="banner-badge">Family Directory</div>
                    <h1 className="banner-family-name">{family.name}</h1>
                    <p className="banner-family-location">
                        <span className="location-pin">📍</span>
                        <span>{family.state}, Nigeria</span>
                    </p>
                </div>

                <button
                    className="banner-share-button"
                    onClick={onShare}
                    title="Share this family"
                    aria-label="Share family page"
                >
                    <span className="share-icon">📤</span>
                    <span className="share-text">Share</span>
                </button>
            </div>
        </div>
    );
}
