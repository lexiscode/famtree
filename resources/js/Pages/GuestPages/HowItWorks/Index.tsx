import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useInView } from 'react-intersection-observer';
import './HowItWorks.css';

export default function HowItWorks() {
    const { ref: headerRef, inView: headerInView } = useInView({ threshold: 0.3, triggerOnce: true });
    const { ref: stepsRef, inView: stepsInView } = useInView({ threshold: 0.3, triggerOnce: true });
    const { ref: ctaRef, inView: ctaInView } = useInView({ threshold: 0.3, triggerOnce: true });

    const steps = [
        {
            id: 1,
            title: 'Sign Up',
            description: 'Choose your family name, location, and create a secure account in minutes.',
            details: ['Create your family profile', 'Set privacy preferences', 'Customize family settings'],
            icon: '📝',
        },
        {
            id: 2,
            title: 'Build Your Family Base',
            description: 'Add your immediate family members - parents, siblings, and children.',
            details: ['Add family members', 'Define relationships', 'Upload photos and bios'],
            icon: '👨‍👩‍👧‍👦',
        },
        {
            id: 3,
            title: 'Link Families',
            description: 'Connect with other family branches through marriages and relationships.',
            details: ['Add extended family', 'Link in-laws and relatives', 'Build complete family tree'],
            icon: '🔗',
        },
        {
            id: 4,
            title: 'Preserve Legacy',
            description: 'Upload stories, photos, documents, and create lasting digital memories.',
            details: ['Share family stories', 'Upload multimedia', 'Create memorial pages'],
            icon: '📚',
        },
        {
            id: 5,
            title: 'Invite & Connect',
            description: 'Invite relatives to join, verify connections, and grow your family tree together.',
            details: ['Send invitations', 'Verify relationships', 'Collaborate on family history'],
            icon: '🎉',
        },
    ];

    return (
        <GuestLayout>
            <Head title="How FamTree Works - 5 Simple Steps" />

            {/* Header */}
            <section className="hiw-header" ref={headerRef}>
                <div className={`hiw-header-content ${headerInView ? 'in-view' : ''}`}>
                    <h1>How FamTree Works</h1>
                    <p>Five simple steps to preserve your family's legacy forever.</p>
                </div>
            </section>

            {/* Steps Timeline */}
            <section className="hiw-timeline" ref={stepsRef}>
                <div className={`hiw-container ${stepsInView ? 'in-view' : ''}`}>
                    <div className="timeline-line"></div>

                    {steps.map((step, index) => (
                        <div key={step.id} className={`timeline-step step-${step.id} ${index % 2 === 0 ? 'left' : 'right'}`}>
                            <div className="step-connector">
                                <div className="step-dot">
                                    <span className="step-number">{step.id}</span>
                                </div>
                            </div>

                            <div className="step-content">
                                <div className="step-card">
                                    <div className="step-icon">{step.icon}</div>
                                    <h2>{step.title}</h2>
                                    <p className="step-description">{step.description}</p>
                                    <ul className="step-details">
                                        {step.details.map((detail, idx) => (
                                            <li key={idx}>
                                                <span className="detail-icon">✓</span>
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="hiw-benefits">
                <div className="hiw-container">
                    <h2>Why Choose FamTree?</h2>
                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <div className="benefit-icon">⚡</div>
                            <h3>Fast & Easy</h3>
                            <p>Get started in minutes, not hours. Simple and intuitive interface.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">🔒</div>
                            <h3>Secure & Private</h3>
                            <p>Enterprise-grade security keeps your family's stories safe and private.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">🌍</div>
                            <h3>Connect Globally</h3>
                            <p>Stay connected with family members across continents and time zones.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">♾️</div>
                            <h3>Forever Preserved</h3>
                            <p>Your family's legacy is preserved safely for generations to come.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="hiw-cta" ref={ctaRef}>
                <div className={`hiw-container ${ctaInView ? 'in-view' : ''}`}>
                    <h2>Ready to Start Your Journey?</h2>
                    <p>Begin preserving your family's legacy today. It's free, easy, and secure.</p>
                    <div className="hiw-cta-buttons">
                        <button className="cta-btn cta-btn-primary">
                            <span>Create Your Family Space</span>
                            <span>→</span>
                        </button>
                        <button className="cta-btn cta-btn-secondary">
                            Watch Video Tutorial
                        </button>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
