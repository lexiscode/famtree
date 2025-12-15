import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useInView } from 'react-intersection-observer';
import FeaturesGridSection from '../Home/sections/FeaturesGridSection';
import './Features.css';

export default function Features() {
    const { ref: headerRef, inView: headerInView } = useInView({ threshold: 0.3, triggerOnce: true });
    const { ref: creationRef, inView: creationInView } = useInView({ threshold: 0.3, triggerOnce: true });
    const { ref: marriageRef, inView: marriageInView } = useInView({ threshold: 0.3, triggerOnce: true });
    const { ref: legacyRef, inView: legacyInView } = useInView({ threshold: 0.3, triggerOnce: true });
    const { ref: socialRef, inView: socialInView } = useInView({ threshold: 0.3, triggerOnce: true });
    const { ref: ctaRef, inView: ctaInView } = useInView({ threshold: 0.3, triggerOnce: true });

    const familyCreationFeatures = [
        {
            id: 1,
            icon: '🏠',
            title: 'Create Digital Family Spaces',
            description: 'Instantly create secure digital spaces for your family tree with customizable privacy settings.',
        },
        {
            id: 2,
            icon: '👥',
            title: 'Add Family Members',
            description: 'Easily add relatives, define relationships, and invite family members to join and verify connections.',
        },
        {
            id: 3,
            icon: '🔒',
            title: 'Manage Privacy & Access',
            description: 'Control who sees what with granular privacy controls and role-based access permissions.',
        },
    ];

    const marriageFeatures = [
        {
            id: 1,
            icon: '💍',
            title: 'Auto-Link Families Through Marriages',
            description: 'Automatically connect family trees when marriages are verified, creating unified heritage maps.',
        },
        {
            id: 2,
            icon: '🌳',
            title: 'View Relationship Maps',
            description: 'Visualize complex family connections and see how different branches of your family tree connect.',
        },
    ];

    const legacyFeatures = [
        {
            id: 1,
            icon: '📸',
            title: 'Preserve Photos & Stories',
            description: 'Upload family photos, videos, and personal stories with rich metadata and descriptions.',
        },
        {
            id: 2,
            icon: '🕊️',
            title: 'Create Memorial Pages',
            description: 'Honor and celebrate loved ones with dedicated memorial pages and tribute sections.',
        },
        {
            id: 3,
            icon: '📖',
            title: 'AI Family Book Generation',
            description: 'Get an automatically generated family book summarizing your entire family history and stories.',
        },
        {
            id: 4,
            icon: '🗂️',
            title: 'Digital Vault for Artifacts',
            description: 'Store important documents, certificates, and heirlooms safely in a secure digital vault.',
        },
    ];

    const socialFeatures = [
        {
            id: 1,
            icon: '💬',
            title: 'Private Family Feed',
            description: 'Share updates, photos, and moments with your family in a private, secure feed.',
        },
        {
            id: 2,
            icon: '🗓️',
            title: 'Family Events & Meetings',
            description: 'Organize family events, reunions, and meetings with built-in RSVP and planning tools.',
        },
        {
            id: 3,
            icon: '📹',
            title: 'Chat & Video Rooms',
            description: 'Connect with family members through text chat and video calls, all within FamTree.',
        },
    ];

    return (
        <GuestLayout>
            <Head
                title="FamTree Features - Digital Family Tree & Heritage Platform"
                meta={[
                    {
                        name: 'description',
                        content: 'Explore FamTree\'s powerful features: build family trees, preserve memories, connect relatives, and celebrate heritage. Digital genealogy made easy.',
                    },
                    {
                        name: 'keywords',
                        content: 'family tree features, genealogy tools, heritage preservation, family connections, digital family tree',
                    },
                    {
                        property: 'og:title',
                        content: 'FamTree Features - Digital Family Tree & Heritage Platform',
                    },
                    {
                        property: 'og:description',
                        content: 'Discover powerful features to build, preserve, and share your family\'s legacy.',
                    },
                    {
                        property: 'og:type',
                        content: 'website',
                    },
                    {
                        property: 'og:url',
                        content: 'https://famtree.com/features',
                    },
                    {
                        property: 'og:image',
                        content: 'https://famtree.com/og-image-features.jpg',
                    },
                    {
                        name: 'canonical',
                        content: 'https://famtree.com/features',
                    },
                ]}
            />

            {/* Page Header */}
            <section className="features-header" ref={headerRef}>
                <div className={`features-header-content ${headerInView ? 'in-view' : ''}`}>
                    <h1>Powerful Features for Family Connection</h1>
                    <p>Everything you need to preserve, share, and celebrate your family's legacy.</p>
                </div>
            </section>

            {/* Features Overview */}
            <FeaturesGridSection />

            {/* Family Creation Features */}
            <section className="features-section" data-section="build-tree" ref={creationRef}>
                <div className={`features-container ${creationInView ? 'in-view' : ''}`}>
                    <div className="section-header">
                        <h2>Build Your Family Tree</h2>
                        <p>Create and manage your digital family space with ease</p>
                    </div>
                    <div className="features-grid">
                        {familyCreationFeatures.map((feature, index) => (
                            <div key={feature.id} className="feature-card" style={{ transitionDelay: `${index * 100}ms` }}>
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Marriage & Links Features */}
            <section className="features-section features-section--alt" ref={marriageRef}>
                <div className={`features-container ${marriageInView ? 'in-view' : ''}`}>
                    <div className="section-header">
                        <h2>Connect Family Lines</h2>
                        <p>Link different family branches and see the complete picture</p>
                    </div>
                    <div className="features-grid">
                        {marriageFeatures.map((feature, index) => (
                            <div key={feature.id} className="feature-card" style={{ transitionDelay: `${index * 100}ms` }}>
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Legacy Preservation Features */}
            <section className="features-section" data-section="preserve-legacy" ref={legacyRef}>
                <div className={`features-container ${legacyInView ? 'in-view' : ''}`}>
                    <div className="section-header">
                        <h2>Preserve Your Legacy</h2>
                        <p>Safeguard your family's stories, memories, and heritage for generations</p>
                    </div>
                    <div className="features-grid features-grid--4col">
                        {legacyFeatures.map((feature, index) => (
                            <div key={feature.id} className="feature-card" style={{ transitionDelay: `${index * 100}ms` }}>
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social & Connection Features */}
            <section className="features-section features-section--alt" ref={socialRef}>
                <div className={`features-container ${socialInView ? 'in-view' : ''}`}>
                    <div className="section-header">
                        <h2>Stay Connected</h2>
                        <p>Engage with your family across generations and distances</p>
                    </div>
                    <div className="features-grid">
                        {socialFeatures.map((feature, index) => (
                            <div key={feature.id} className="feature-card" style={{ transitionDelay: `${index * 100}ms` }}>
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="features-cta" ref={ctaRef}>
                <div className={`features-container ${ctaInView ? 'in-view' : ''}`}>
                    <h2>Ready to Explore All Features?</h2>
                    <p>Experience the complete power of FamTree. Start your free family tree today.</p>
                    <button className="cta-btn">
                        <span>Get Started Now</span>
                        <span>→</span>
                    </button>
                </div>
            </section>
        </GuestLayout>
    );
}
