import { useState } from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import HomeHeader from '@/Components/Navigation/HomeHeader';
import FloatingNavDock from '@/Components/Navigation/FloatingNavDock';
import FloatingSocialDock from '@/Components/Navigation/FloatingSocialDock';
import InfoModal from './components/InfoModal';
import './AboutNew.css';

export default function About() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const infoCards = [
        {
            id: 'mission',
            icon: 'bi-bullseye',
            title: 'Our Mission',
            subtitle: 'Why we exist',
            color: '#FFD700',
        },
        {
            id: 'story',
            icon: 'bi-book',
            title: 'Our Story',
            subtitle: 'How we started',
            color: '#FF6B00',
        },
        {
            id: 'team',
            icon: 'bi-people-fill',
            title: 'Our Team',
            subtitle: 'Who we are',
            color: '#FFD700',
        },
        {
            id: 'values',
            icon: 'bi-heart-fill',
            title: 'Our Values',
            subtitle: 'What drives us',
            color: '#FF6B00',
        },
    ];

    const modalContent = {
        mission: {
            title: 'Our Mission',
            content: (
                <>
                    <p>
                        At FamTree, we believe every family has a story worth preserving. We're on a mission to
                        empower families across Africa to digitally document, connect, and celebrate their heritage
                        in ways that were never possible before.
                    </p>
                    <p>
                        We understand that family connections are the foundation of our identity. That's why we've
                        built FamTree as a sanctuary where memories, stories, and relationships can be safely
                        preserved and shared across generations.
                    </p>
                    <div className="mission-points">
                        <div className="point">
                            <i className="bi-check-circle-fill"></i>
                            <span>Preserve family heritage digitally</span>
                        </div>
                        <div className="point">
                            <i className="bi-check-circle-fill"></i>
                            <span>Connect relatives worldwide</span>
                        </div>
                        <div className="point">
                            <i className="bi-check-circle-fill"></i>
                            <span>Share stories across generations</span>
                        </div>
                    </div>
                </>
            ),
        },
        story: {
            title: 'Our Story',
            content: (
                <>
                    <div className="story-section">
                        <h3>The Problem We Saw</h3>
                        <p>
                            FamTree was born from a simple observation: in an increasingly digital world, many families were losing
                            touch with their heritage. Photo albums were being lost, stories were being forgotten, and the connections
                            between generations were slowly disappearing.
                        </p>
                    </div>
                    <div className="story-section">
                        <h3>Our Solution</h3>
                        <p>
                            We realized that digital tools existed for everything from banking to social connections, but nothing
                            truly honored the complexity and beauty of family relationships. That's why we built FamTree —
                            a platform designed specifically for families to preserve their legacy, tell their stories, and stay
                            connected across continents and generations.
                        </p>
                    </div>
                </>
            ),
        },
        team: {
            title: 'Our Team',
            content: (
                <div className="team-grid-modal">
                    <div className="team-member">
                        <div className="member-avatar">👩‍💼</div>
                        <h3>Chioma Adeleke</h3>
                        <p className="role">Founder & CEO</p>
                        <p className="bio">Genealogy enthusiast with 10+ years of family tree research experience.</p>
                    </div>
                    <div className="team-member">
                        <div className="member-avatar">👨‍💻</div>
                        <h3>Tunde Okafor</h3>
                        <p className="role">Head of Technology</p>
                        <p className="bio">Full-stack developer passionate about heritage preservation technology.</p>
                    </div>
                    <div className="team-member">
                        <div className="member-avatar">👩‍🔬</div>
                        <h3>Zainab Ibrahim</h3>
                        <p className="role">Head of Community</p>
                        <p className="bio">Cultural advocate ensuring every family story is honored and preserved.</p>
                    </div>
                    <div className="team-member">
                        <div className="member-avatar">👨‍🎓</div>
                        <h3>Emeka Nwachukwu</h3>
                        <p className="role">Product Manager</p>
                        <p className="bio">Dedicated to creating intuitive experiences for family connections.</p>
                    </div>
                </div>
            ),
        },
        values: {
            title: 'Our Values',
            content: (
                <div className="values-grid-modal">
                    <div className="value-item">
                        <i className="bi-gem"></i>
                        <h3>Legacy First</h3>
                        <p>Every decision is guided by what's best for preserving family heritage.</p>
                    </div>
                    <div className="value-item">
                        <i className="bi-shield-lock-fill"></i>
                        <h3>Privacy & Security</h3>
                        <p>Your family's stories are sacred. We protect them with the highest standards.</p>
                    </div>
                    <div className="value-item">
                        <i className="bi-globe"></i>
                        <h3>Inclusivity</h3>
                        <p>FamTree is for families everywhere, honoring all cultures and traditions.</p>
                    </div>
                    <div className="value-item">
                        <i className="bi-lightbulb-fill"></i>
                        <h3>Innovation</h3>
                        <p>We're constantly innovating to make heritage preservation easier and richer.</p>
                    </div>
                </div>
            ),
        },
    };

    return (
        <GuestLayout hideFooter hideNavigation>
            <Head
                title="About FamTree - Our Mission & Team"
                meta={[
                    {
                        name: 'description',
                        content: 'Learn about FamTree\'s mission to connect families and preserve heritage. Meet our team of dedicated professionals building the future of family genealogy.',
                    },
                    {
                        name: 'keywords',
                        content: 'about FamTree, family heritage, genealogy platform, team, mission',
                    },
                    {
                        property: 'og:title',
                        content: 'About FamTree - Our Mission & Team',
                    },
                    {
                        property: 'og:description',
                        content: 'Discover our mission to connect families and preserve heritage across generations.',
                    },
                    {
                        property: 'og:type',
                        content: 'website',
                    },
                    {
                        property: 'og:url',
                        content: 'https://famtree.com/about',
                    },
                    {
                        property: 'og:image',
                        content: 'https://famtree.com/og-image-about.jpg',
                    },
                    {
                        name: 'canonical',
                        content: 'https://famtree.com/about',
                    },
                ]}
            />

            <HomeHeader />
            <FloatingNavDock />
            <FloatingSocialDock />

            <section className="about-hero">
                <div className="about-hero-content">
                    <div className="hero-badge">
                        <i className="bi-diagram-3-fill"></i>
                        <span>About FamTree</span>
                    </div>

                    <h1 className="about-title">
                        Connecting Generations,
                        <span className="gradient-text"> Preserving Heritage</span>
                    </h1>

                    <p className="about-description">
                        We're building the world's most trusted platform for family heritage preservation,
                        helping millions of families stay connected across continents and generations.
                    </p>

                    <div className="info-cards">
                        {infoCards.map((card, index) => (
                            <div
                                key={card.id}
                                className="info-card"
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
                <div className="about-background">
                    <div className="bg-shape shape-1"></div>
                    <div className="bg-shape shape-2"></div>
                    <div className="bg-shape shape-3"></div>
                </div>
            </section>

            {/* Modals */}
            {openModal && (
                <InfoModal
                    isOpen={true}
                    onClose={() => setOpenModal(null)}
                    title={modalContent[openModal as keyof typeof modalContent].title}
                    content={modalContent[openModal as keyof typeof modalContent].content}
                />
            )}
        </GuestLayout>
    );
}
