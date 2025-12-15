import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useModal } from '@/Context/ModalContext';
import './HeroSection.css';

export default function HeroSection() {
    const [ctaHovered, setCtaHovered] = useState<'login' | 'register' | null>(null);
    const { openCtaModal } = useModal();

    return (
        <section className="hero-section">
            <div className="hero-background">
                <div className="hero-animation">
                    {/* Animated background shapes */}
                    <div className="animated-shape shape-1"></div>
                    <div className="animated-shape shape-2"></div>
                    <div className="animated-shape shape-3"></div>
                </div>
            </div>

            <div className="hero-content">
                <div className="hero-container">
                    <div className="hero-text">
                        <h1 className="hero-title pt-5">
                            Connect Your Family Across <span className="text-gradient">Generations</span>
                        </h1>

                        <p className="hero-subtitle">
                            Preserve your family's heritage, discover relatives you never knew existed,
                            and keep your legacy alive for generations to come.
                        </p>

                        <div className="hero-buttons">
                            <button
                                className="btn btn-primary btn-lg hero-btn"
                                onMouseEnter={() => setCtaHovered('register')}
                                onMouseLeave={() => setCtaHovered(null)}
                                onClick={() => openCtaModal('register')}
                            >
                                Start Your Family Tree
                                {ctaHovered === 'register' && <span className="btn-icon">→</span>}
                            </button>

                            <button
                                className="btn btn-outline btn-lg hero-btn"
                                onMouseEnter={() => setCtaHovered('login')}
                                onMouseLeave={() => setCtaHovered(null)}
                                onClick={() => router.visit('/families')}
                            >
                                {ctaHovered === 'login' && <span className="btn-icon">→</span>}
                                Explore Public Families
                            </button>
                        </div>

                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-number">50K+</span>
                                <span className="stat-label">Families</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">2M+</span>
                                <span className="stat-label">Members</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">100+</span>
                                <span className="stat-label">Countries</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-image-container">
                            <svg
                                viewBox="0 0 400 400"
                                className="hero-illustration"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* Family tree illustration SVG */}
                                <circle cx="200" cy="50" r="30" fill="var(--color-gold)" opacity="0.3" />
                                <circle cx="200" cy="50" r="25" fill="var(--color-gold)" opacity="0.2" />

                                <circle cx="100" cy="150" r="25" fill="var(--color-blue)" opacity="0.3" />
                                <circle cx="300" cy="150" r="25" fill="var(--color-blue)" opacity="0.3" />

                                <circle cx="50" cy="280" r="20" fill="var(--color-green)" opacity="0.2" />
                                <circle cx="150" cy="280" r="20" fill="var(--color-green)" opacity="0.2" />
                                <circle cx="250" cy="280" r="20" fill="var(--color-green)" opacity="0.2" />
                                <circle cx="350" cy="280" r="20" fill="var(--color-green)" opacity="0.2" />

                                {/* Connection lines */}
                                <line x1="200" y1="75" x2="100" y2="125" stroke="var(--color-gold)" strokeWidth="2" opacity="0.3" />
                                <line x1="200" y1="75" x2="300" y2="125" stroke="var(--color-gold)" strokeWidth="2" opacity="0.3" />
                                <line x1="100" y1="175" x2="50" y2="260" stroke="var(--color-blue)" strokeWidth="2" opacity="0.2" />
                                <line x1="100" y1="175" x2="150" y2="260" stroke="var(--color-blue)" strokeWidth="2" opacity="0.2" />
                                <line x1="300" y1="175" x2="250" y2="260" stroke="var(--color-blue)" strokeWidth="2" opacity="0.2" />
                                <line x1="300" y1="175" x2="350" y2="260" stroke="var(--color-blue)" strokeWidth="2" opacity="0.2" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
