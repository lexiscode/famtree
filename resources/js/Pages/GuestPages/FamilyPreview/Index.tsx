import { Head } from '@inertiajs/react';
import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import FamilyBanner from './components/FamilyBanner';
import OriginInfo from './components/OriginInfo';
import FamilyHeadCard from './components/FamilyHeadCard';
import MembersPreview from './components/MembersPreview';
import FamilyStats from './components/FamilyStats';
import CTAOverlay from './components/CTAOverlay';
import ShareButton from './components/ShareButton';
import './FamilyPreview.css';

interface FamilyData {
    id: number;
    name: string;
    slug: string;
    state: string;
    lga?: string;
    village?: string;
    story?: string;
    cover_image?: string;
    founder: string;
    member_count: number;
    founded_year: number;
    new_members_this_year: number;
}

interface Props {
    family: FamilyData;
}

export default function FamilyPreview({ family }: Props) {
    const [showShareModal, setShowShareModal] = useState(false);
    const familyUrl = `${window.location.origin}/families/${family.slug}`;

    return (
        <GuestLayout>
            <Head
                title={`${family.name} Family - FamTree`}
                meta={[
                    {
                        name: 'description',
                        content: `Explore the ${family.name} family tree. ${family.member_count} members preserving their heritage from ${family.state}, Nigeria.`,
                    },
                    {
                        property: 'og:title',
                        content: `${family.name} Family - FamTree`,
                    },
                    {
                        property: 'og:description',
                        content: `Discover the ${family.name} family heritage and connect with ${family.member_count} family members.`,
                    },
                    {
                        property: 'og:image',
                        content: family.cover_image || '',
                    },
                    {
                        property: 'og:url',
                        content: familyUrl,
                    },
                    {
                        property: 'og:type',
                        content: 'profile',
                    },
                ]}
            />

            {/* Premium Hero Banner */}
            <FamilyBanner
                family={family}
                onShare={() => setShowShareModal(true)}
            />

            {/* Main Content - Premium Layout */}
            <main className="family-preview-main">
                {/* Family Heritage Section */}
                <section className="heritage-section">
                    <div className="heritage-container">
                        <div className="heritage-content">
                            <h1 className="heritage-title">{family.name}</h1>
                            <p className="heritage-location">
                                <span className="location-icon">📍</span>
                                {family.village && `${family.village}, `}
                                {family.lga && `${family.lga}, `}
                                {family.state}, Nigeria
                            </p>
                            <p className="heritage-story">{family.story}</p>
                            <button
                                className="share-btn-premium"
                                onClick={() => setShowShareModal(true)}
                                title="Share this family page"
                            >
                                <span>📤</span> Share Family
                            </button>
                        </div>

                        <div className="heritage-stats-grid">
                            <div className="stat-block">
                                <div className="stat-number">{family.member_count}</div>
                                <div className="stat-label">Active Members</div>
                            </div>
                            <div className="stat-block">
                                <div className="stat-number">{family.founded_year}</div>
                                <div className="stat-label">Founded</div>
                            </div>
                            <div className="stat-block">
                                <div className="stat-number">+{family.new_members_this_year}</div>
                                <div className="stat-label">New This Year</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Founder Section - Premium Card */}
                <section className="founder-showcase">
                    <div className="founder-container">
                        <div className="founder-content">
                            <div className="founder-badge">Family Founder</div>
                            <h2 className="founder-name">{family.founder}</h2>
                            <p className="founder-description">
                                The visionary founder of the {family.name} family, building a legacy that spans generations. Through dedication and vision, they've created a strong foundation for family unity and heritage preservation.
                            </p>
                            <div className="founder-attributes">
                                <div className="attribute">
                                    <span className="attr-icon">🏛️</span>
                                    <span className="attr-text">Family Leadership</span>
                                </div>
                                <div className="attribute">
                                    <span className="attr-icon">🌍</span>
                                    <span className="attr-text">Heritage Guardian</span>
                                </div>
                                <div className="attribute">
                                    <span className="attr-icon">💎</span>
                                    <span className="attr-text">Legacy Builder</span>
                                </div>
                            </div>
                        </div>
                        <div className="founder-visual">
                            <div className="founder-avatar-large">👤</div>
                        </div>
                    </div>
                </section>

                {/* Family Origin & Details */}
                <section className="family-details-section">
                    <div className="details-container">
                        <h2 className="details-title">Family Heritage</h2>
                        <div className="details-grid">
                            <div className="detail-card">
                                <div className="detail-icon">🏠</div>
                                <h3>State of Origin</h3>
                                <p className="detail-value">{family.state}</p>
                            </div>
                            {family.lga && (
                                <div className="detail-card">
                                    <div className="detail-icon">🗺️</div>
                                    <h3>Local Government</h3>
                                    <p className="detail-value">{family.lga}</p>
                                </div>
                            )}
                            {family.village && (
                                <div className="detail-card">
                                    <div className="detail-icon">🏘️</div>
                                    <h3>Village</h3>
                                    <p className="detail-value">{family.village}</p>
                                </div>
                            )}
                            <div className="detail-card">
                                <div className="detail-icon">📅</div>
                                <h3>Since</h3>
                                <p className="detail-value">{family.founded_year}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Premium CTA Section */}
                <section className="premium-cta-section">
                    <div className="cta-content">
                        <h2 className="cta-heading">Join the {family.name} Family Tree</h2>
                        <p className="cta-description">
                            Connect with your family members, preserve your heritage, and grow your family network. All in one beautiful, easy-to-use platform.
                        </p>
                        <div className="cta-benefits">
                            <div className="benefit-item">
                                <span className="benefit-icon">✓</span>
                                <span>Connect with family members worldwide</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">✓</span>
                                <span>Preserve family stories and memories</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">✓</span>
                                <span>Build your complete family tree</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">✓</span>
                                <span>Share heritage with future generations</span>
                            </div>
                        </div>
                        <button className="cta-button-primary">
                            <span>Start Your Family Journey</span>
                            <span className="btn-arrow">→</span>
                        </button>
                    </div>
                </section>
            </main>

            {/* Share Modal */}
            {showShareModal && (
                <ShareButton
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    familyName={family.name}
                    familyUrl={familyUrl}
                />
            )}
        </GuestLayout>
    );
}
