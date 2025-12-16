import { useState } from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import HomeHeader from '@/Components/Navigation/HomeHeader';
import FloatingNavDock from '@/Components/Navigation/FloatingNavDock';
import FloatingSocialDock from '@/Components/Navigation/FloatingSocialDock';
import ProcessModal from './components/ProcessModal';
import './HowItWorksNew.css';

export default function HowItWorks() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const processCards = [
        {
            id: 'steps',
            icon: 'bi-list-ol',
            title: 'The Process',
            subtitle: 'Step by step guide',
            color: '#FFD700',
        },
        {
            id: 'benefits',
            icon: 'bi-star-fill',
            title: 'Why FamTree',
            subtitle: 'Key advantages',
            color: '#FF6B00',
        },
        {
            id: 'getting-started',
            icon: 'bi-rocket-takeoff-fill',
            title: 'Getting Started',
            subtitle: 'Quick start guide',
            color: '#FFD700',
        },
        {
            id: 'best-practices',
            icon: 'bi-lightbulb-fill',
            title: 'Best Practices',
            subtitle: 'Tips for success',
            color: '#FF6B00',
        },
    ];

    const modalContent = {
        steps: {
            title: 'The Process',
            description: 'Follow these five simple steps to preserve your family\'s legacy forever',
            type: 'steps' as const,
            items: [
                {
                    icon: 'bi-person-plus-fill',
                    title: 'Sign Up',
                    description: 'Choose your family name, location, and create a secure account in minutes.',
                    details: ['Create your family profile', 'Set privacy preferences', 'Customize family settings'],
                },
                {
                    icon: 'bi-people-fill',
                    title: 'Build Your Family Base',
                    description: 'Add your immediate family members - parents, siblings, and children.',
                    details: ['Add family members', 'Define relationships', 'Upload photos and bios'],
                },
                {
                    icon: 'bi-link-45deg',
                    title: 'Link Families',
                    description: 'Connect with other family branches through marriages and relationships.',
                    details: ['Add extended family', 'Link in-laws and relatives', 'Build complete family tree'],
                },
                {
                    icon: 'bi-archive-fill',
                    title: 'Preserve Legacy',
                    description: 'Upload stories, photos, documents, and create lasting digital memories.',
                    details: ['Share family stories', 'Upload multimedia', 'Create memorial pages'],
                },
                {
                    icon: 'bi-send-fill',
                    title: 'Invite & Connect',
                    description: 'Invite relatives to join, verify connections, and grow your family tree together.',
                    details: ['Send invitations', 'Verify relationships', 'Collaborate on family history'],
                },
            ],
        },
        benefits: {
            title: 'Why Choose FamTree',
            description: 'Discover what makes FamTree the best choice for preserving your family heritage',
            type: 'grid' as const,
            items: [
                {
                    icon: 'bi-lightning-charge-fill',
                    title: 'Fast & Easy',
                    description: 'Get started in minutes, not hours. Simple and intuitive interface designed for everyone.',
                },
                {
                    icon: 'bi-shield-lock-fill',
                    title: 'Secure & Private',
                    description: 'Enterprise-grade security keeps your family\'s stories safe and private with encryption.',
                },
                {
                    icon: 'bi-globe',
                    title: 'Connect Globally',
                    description: 'Stay connected with family members across continents and time zones effortlessly.',
                },
                {
                    icon: 'bi-infinity',
                    title: 'Forever Preserved',
                    description: 'Your family\'s legacy is preserved safely for generations to come with cloud backup.',
                },
                {
                    icon: 'bi-phone-fill',
                    title: 'Mobile Friendly',
                    description: 'Access your family tree anytime, anywhere from any device - phone, tablet, or computer.',
                },
                {
                    icon: 'bi-diagram-3-fill',
                    title: 'Visual Tree Builder',
                    description: 'Beautiful, interactive family tree visualizations that bring your heritage to life.',
                },
            ],
        },
        'getting-started': {
            title: 'Getting Started',
            description: 'Your quick-start guide to building your first family tree on FamTree',
            type: 'steps' as const,
            items: [
                {
                    icon: 'bi-box-arrow-in-right',
                    title: 'Create Your Account',
                    description: 'Sign up with your email or social media account in less than a minute.',
                    details: ['Click "Sign Up" button', 'Enter your information', 'Verify your email'],
                },
                {
                    icon: 'bi-house-fill',
                    title: 'Set Up Your Family Space',
                    description: 'Choose your family name and set up your private family space.',
                    details: ['Pick a family name', 'Add family description', 'Set privacy settings'],
                },
                {
                    icon: 'bi-person-fill-add',
                    title: 'Add Your First Members',
                    description: 'Start by adding yourself and your immediate family members.',
                    details: ['Add your profile', 'Add parents and siblings', 'Upload profile photos'],
                },
                {
                    icon: 'bi-share-fill',
                    title: 'Invite Your Family',
                    description: 'Send invitations to family members to join and contribute to the tree.',
                    details: ['Generate invite links', 'Share via email or social media', 'Family members verify connections'],
                },
            ],
        },
        'best-practices': {
            title: 'Best Practices',
            description: 'Tips and recommendations for building a comprehensive family tree',
            type: 'grid' as const,
            items: [
                {
                    icon: 'bi-camera-fill',
                    title: 'Add Photos Early',
                    description: 'Upload photos of family members as soon as you add them. Visual memories are powerful.',
                },
                {
                    icon: 'bi-chat-square-text-fill',
                    title: 'Document Stories',
                    description: 'Record family stories, anecdotes, and memories while they\'re fresh in your mind.',
                },
                {
                    icon: 'bi-check-circle-fill',
                    title: 'Verify Information',
                    description: 'Double-check dates, names, and relationships with family members for accuracy.',
                },
                {
                    icon: 'bi-collection-fill',
                    title: 'Organize Documents',
                    description: 'Upload birth certificates, marriage certificates, and other important documents.',
                },
                {
                    icon: 'bi-people',
                    title: 'Collaborate',
                    description: 'Invite family members to contribute their knowledge and help build the tree together.',
                },
                {
                    icon: 'bi-arrow-clockwise',
                    title: 'Update Regularly',
                    description: 'Keep your family tree current by adding new events, photos, and stories regularly.',
                },
            ],
        },
    };

    return (
        <GuestLayout hideFooter hideNavigation>
            <Head
                title="How FamTree Works - Simple Steps to Preserve Your Legacy"
                meta={[
                    {
                        name: 'description',
                        content: 'Learn how FamTree works in simple steps. Build your family tree, connect with relatives, preserve memories, and celebrate heritage.',
                    },
                    {
                        name: 'keywords',
                        content: 'how family tree works, genealogy steps, heritage preservation guide, family connections',
                    },
                    {
                        property: 'og:title',
                        content: 'How FamTree Works - Simple Steps',
                    },
                    {
                        property: 'og:description',
                        content: 'Discover how to build your family tree and preserve your heritage in simple steps.',
                    },
                    {
                        property: 'og:type',
                        content: 'website',
                    },
                    {
                        property: 'og:url',
                        content: 'https://famtree.com/how-it-works',
                    },
                    {
                        property: 'og:image',
                        content: 'https://famtree.com/og-image-how-it-works.jpg',
                    },
                    {
                        name: 'canonical',
                        content: 'https://famtree.com/how-it-works',
                    },
                ]}
            />

            <HomeHeader />
            <FloatingNavDock />
            <FloatingSocialDock />

            <section className="how-it-works-hero">
                <div className="how-it-works-hero-content">
                    <div className="hero-badge">
                        <i className="bi-gear-fill"></i>
                        <span>How It Works</span>
                    </div>

                    <h1 className="how-it-works-title">
                        Building Your Legacy,
                        <span className="gradient-text"> Made Simple</span>
                    </h1>

                    <p className="how-it-works-description">
                        Preserving your family heritage has never been easier. Explore our simple process,
                        discover key benefits, and learn best practices for creating a meaningful family tree.
                    </p>

                    <div className="process-cards">
                        {processCards.map((card, index) => (
                            <div
                                key={card.id}
                                className="process-card"
                                onClick={() => setOpenModal(card.id)}
                                style={{
                                    '--card-color': card.color,
                                    animationDelay: `${index * 0.1}s`,
                                } as React.CSSProperties}
                            >
                                <div className="card-icon">
                                    <i className={card.icon}></i>
                                </div>
                                <h3>{card.title}</h3>
                                <p>{card.subtitle}</p>
                                <div className="card-arrow">
                                    <i className="bi-arrow-right"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Background decoration */}
                <div className="how-it-works-background">
                    <div className="bg-shape shape-1"></div>
                    <div className="bg-shape shape-2"></div>
                    <div className="bg-shape shape-3"></div>
                </div>
            </section>

            {/* Process Modals */}
            {openModal && (
                <ProcessModal
                    isOpen={true}
                    onClose={() => setOpenModal(null)}
                    title={modalContent[openModal as keyof typeof modalContent].title}
                    description={modalContent[openModal as keyof typeof modalContent].description}
                    type={modalContent[openModal as keyof typeof modalContent].type}
                    items={modalContent[openModal as keyof typeof modalContent].items}
                />
            )}
        </GuestLayout>
    );
}
