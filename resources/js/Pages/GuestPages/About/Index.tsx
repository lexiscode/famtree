import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useInView } from 'react-intersection-observer';
import './About.css';

export default function About() {
    const { ref: headerRef, inView: headerInView } = useInView({ threshold: 0.3, triggerOnce: true });
    const { ref: missionRef, inView: missionInView } = useInView({ threshold: 0.3, triggerOnce: true });
    const { ref: storyRef, inView: storyInView } = useInView({ threshold: 0.3, triggerOnce: true });
    const { ref: visionRef, inView: visionInView } = useInView({ threshold: 0.3, triggerOnce: true });
    const { ref: teamRef, inView: teamInView } = useInView({ threshold: 0.3, triggerOnce: true });
    const { ref: valuesRef, inView: valuesInView } = useInView({ threshold: 0.3, triggerOnce: true });

    const teamMembers = [
        {
            id: 1,
            name: 'Chioma Adeleke',
            role: 'Founder & CEO',
            bio: 'Genealogy enthusiast with 10+ years of family tree research experience.',
            image: '👩‍💼',
        },
        {
            id: 2,
            name: 'Tunde Okafor',
            role: 'Head of Technology',
            bio: 'Full-stack developer passionate about heritage preservation technology.',
            image: '👨‍💻',
        },
        {
            id: 3,
            name: 'Zainab Ibrahim',
            role: 'Head of Community',
            bio: 'Cultural advocate ensuring every family story is honored and preserved.',
            image: '👩‍🔬',
        },
        {
            id: 4,
            name: 'Emeka Nwachukwu',
            role: 'Product Manager',
            bio: 'Dedicated to creating intuitive experiences for family connections.',
            image: '👨‍🎓',
        },
    ];

    return (
        <GuestLayout>
            <Head title="About FamTree - Our Mission & Team" />

            {/* Page Header */}
            <section className="about-header" ref={headerRef}>
                <div className={`about-header-content ${headerInView ? 'in-view' : ''}`}>
                    <h1>About FamTree</h1>
                    <p>Connecting generations, preserving heritage, honoring family bonds.</p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="about-mission" ref={missionRef}>
                <div className={`about-container ${missionInView ? 'in-view' : ''}`}>
                    <div className="mission-grid">
                        <div className="mission-text">
                            <h2>Our Mission</h2>
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
                        </div>
                        <div className="mission-icon">
                            <div className="icon-circle">🌳</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="about-story" ref={storyRef}>
                <div className={`about-container ${storyInView ? 'in-view' : ''}`}>
                    <div className="story-header">
                        <div className="story-icon">📖</div>
                        <h2>Why We Started FamTree</h2>
                    </div>
                    <div className="story-content">
                        <div className="story-card">
                            <div className="story-number">01</div>
                            <h3>The Problem We Saw</h3>
                            <p className="story-text">
                                FamTree was born from a simple observation: in an increasingly digital world, many families were losing
                                touch with their heritage. Photo albums were being lost, stories were being forgotten, and the connections
                                between generations were slowly disappearing.
                            </p>
                        </div>
                        <div className="story-card">
                            <div className="story-number">02</div>
                            <h3>Our Solution</h3>
                            <p className="story-text">
                                We realized that digital tools existed for everything from banking to social connections, but nothing
                                truly honored the complexity and beauty of family relationships. That's why we built FamTree —
                                a platform designed specifically for families to preserve their legacy, tell their stories, and stay
                                connected across continents and generations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="about-vision" ref={visionRef}>
                <div className={`about-container ${visionInView ? 'in-view' : ''}`}>
                    <h2>Vision 2030</h2>
                    <p className="vision-subtitle">
                        To become Africa's largest digital family heritage platform, preserving and celebrating millions of family
                        stories.
                    </p>

                    <div className="vision-timeline">
                        <div className="timeline-item">
                            <div className="timeline-year">2024</div>
                            <div className="timeline-content">
                                <h4>Foundation</h4>
                                <p>Launch MVP with core family tree and sharing features</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-year">2025</div>
                            <div className="timeline-content">
                                <h4>Expansion</h4>
                                <p>Reach 50,000+ families, add AI heritage summaries</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-year">2026-2027</div>
                            <div className="timeline-content">
                                <h4>Scale</h4>
                                <p>500,000+ families, partnerships with cultural institutions</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-year">2028-2030</div>
                            <div className="timeline-content">
                                <h4>Legacy</h4>
                                <p>Become the definitive platform for African family heritage</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="about-team" ref={teamRef}>
                <div className={`about-container ${teamInView ? 'in-view' : ''}`}>
                    <h2>Our Team</h2>
                    <p className="team-subtitle">
                        Passionate individuals dedicated to connecting families and preserving heritage.
                    </p>

                    <div className="team-grid">
                        {teamMembers.map((member, index) => (
                            <div key={member.id} className={`team-card ${teamInView ? 'in-view' : ''}`} style={{ transitionDelay: `${index * 100}ms` }}>
                                <div className="team-image">{member.image}</div>
                                <h3>{member.name}</h3>
                                <p className="team-role">{member.role}</p>
                                <p className="team-bio">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-values" ref={valuesRef}>
                <div className={`about-container ${valuesInView ? 'in-view' : ''}`}>
                    <h2>Our Values</h2>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">💎</div>
                            <h3>Legacy First</h3>
                            <p>Every decision is guided by what's best for preserving family heritage.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🔒</div>
                            <h3>Privacy & Security</h3>
                            <p>Your family's stories are sacred. We protect them with the highest standards.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🌍</div>
                            <h3>Inclusivity</h3>
                            <p>FamTree is for families everywhere, honoring all cultures and traditions.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">💡</div>
                            <h3>Innovation</h3>
                            <p>We're constantly innovating to make heritage preservation easier and richer.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta">
                <div className="about-container">
                    <h2>Ready to Join the Movement?</h2>
                    <p>Start preserving your family's legacy today with FamTree.</p>
                    <button className="cta-btn">
                        <span>Create Your Family Space</span>
                        <span>→</span>
                    </button>
                </div>
            </section>
        </GuestLayout>
    );
}
