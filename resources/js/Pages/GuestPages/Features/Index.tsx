import { useState } from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import HomeHeader from '@/Components/Navigation/HomeHeader';
import FloatingNavDock from '@/Components/Navigation/FloatingNavDock';
import FloatingSocialDock from '@/Components/Navigation/FloatingSocialDock';
import FeatureModal from './components/FeatureModal';
import './FeaturesNew.css';

export default function Features() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const featureCategories = [
        {
            id: 'build',
            icon: 'bi-diagram-3',
            title: 'Build Your Tree',
            subtitle: 'Create & manage your family',
            color: '#FFD700',
        },
        {
            id: 'connect',
            icon: 'bi-link-45deg',
            title: 'Connect Families',
            subtitle: 'Link family branches',
            color: '#FF6B00',
        },
        {
            id: 'preserve',
            icon: 'bi-archive',
            title: 'Preserve Legacy',
            subtitle: 'Safeguard memories',
            color: '#FFD700',
        },
        {
            id: 'engage',
            icon: 'bi-chat-dots',
            title: 'Stay Connected',
            subtitle: 'Engage with family',
            color: '#FF6B00',
        },
    ];

    const categoryFeatures = {
        build: {
            title: 'Build Your Family Tree',
            description: 'Create and manage your digital family space with ease',
            features: [
                {
                    icon: 'bi-house-door',
                    title: 'Create Digital Family Spaces',
                    description: 'Instantly create secure digital spaces for your family tree with customizable privacy settings.',
                },
                {
                    icon: 'bi-people',
                    title: 'Add Family Members',
                    description: 'Easily add relatives, define relationships, and invite family members to join and verify connections.',
                },
                {
                    icon: 'bi-shield-lock',
                    title: 'Manage Privacy & Access',
                    description: 'Control who sees what with granular privacy controls and role-based access permissions.',
                },
            ],
        },
        connect: {
            title: 'Connect Family Lines',
            description: 'Link different family branches and see the complete picture',
            features: [
                {
                    icon: 'bi-heart',
                    title: 'Auto-Link Families Through Marriages',
                    description: 'Automatically connect family trees when marriages are verified, creating unified heritage maps.',
                },
                {
                    icon: 'bi-diagram-3-fill',
                    title: 'View Relationship Maps',
                    description: 'Visualize complex family connections and see how different branches of your family tree connect.',
                },
            ],
        },
        preserve: {
            title: 'Preserve Your Legacy',
            description: 'Safeguard your family\'s stories, memories, and heritage for generations',
            features: [
                {
                    icon: 'bi-camera',
                    title: 'Preserve Photos & Stories',
                    description: 'Upload family photos, videos, and personal stories with rich metadata and descriptions.',
                },
                {
                    icon: 'bi-flower1',
                    title: 'Create Memorial Pages',
                    description: 'Honor and celebrate loved ones with dedicated memorial pages and tribute sections.',
                },
                {
                    icon: 'bi-book',
                    title: 'AI Family Book Generation',
                    description: 'Get an automatically generated family book summarizing your entire family history and stories.',
                },
                {
                    icon: 'bi-safe',
                    title: 'Digital Vault for Artifacts',
                    description: 'Store important documents, certificates, and heirlooms safely in a secure digital vault.',
                },
            ],
        },
        engage: {
            title: 'Stay Connected',
            description: 'Engage with your family across generations and distances',
            features: [
                {
                    icon: 'bi-chat-square-dots',
                    title: 'Private Family Feed',
                    description: 'Share updates, photos, and moments with your family in a private, secure feed.',
                },
                {
                    icon: 'bi-calendar-event',
                    title: 'Family Events & Meetings',
                    description: 'Organize family events, reunions, and meetings with built-in RSVP and planning tools.',
                },
                {
                    icon: 'bi-camera-video',
                    title: 'Chat & Video Rooms',
                    description: 'Connect with family members through text chat and video calls, all within FamTree.',
                },
            ],
        },
    };

    return (
        <GuestLayout hideFooter hideNavigation>
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

            <HomeHeader />
            <FloatingNavDock />
            <FloatingSocialDock />

            <section className="features-hero">
                <div className="features-hero-content">
                    <div className="hero-badge">
                        <i className="bi-stars"></i>
                        <span>Powerful Features</span>
                    </div>

                    <h1 className="features-title">
                        Everything You Need to
                        <span className="gradient-text"> Preserve Your Legacy</span>
                    </h1>

                    <p className="features-description">
                        Powerful tools to build, connect, preserve, and engage with your family across generations.
                        Discover the features that make FamTree the most trusted family heritage platform.
                    </p>

                    <div className="feature-categories">
                        {featureCategories.map((category, index) => (
                            <div
                                key={category.id}
                                className="category-card"
                                onClick={() => setOpenModal(category.id)}
                                style={{
                                    '--category-color': category.color,
                                    animationDelay: `${index * 0.1}s`,
                                } as React.CSSProperties}
                            >
                                <div className="category-icon">
                                    <i className={category.icon}></i>
                                </div>
                                <h3>{category.title}</h3>
                                <p>{category.subtitle}</p>
                                <div className="category-arrow">
                                    <i className="bi-arrow-right"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Background decoration */}
                <div className="features-background">
                    <div className="bg-shape shape-1"></div>
                    <div className="bg-shape shape-2"></div>
                    <div className="bg-shape shape-3"></div>
                </div>
            </section>

            {/* Feature Modals */}
            {openModal && (
                <FeatureModal
                    isOpen={true}
                    onClose={() => setOpenModal(null)}
                    title={categoryFeatures[openModal as keyof typeof categoryFeatures].title}
                    description={categoryFeatures[openModal as keyof typeof categoryFeatures].description}
                    features={categoryFeatures[openModal as keyof typeof categoryFeatures].features}
                />
            )}
        </GuestLayout>
    );
}
