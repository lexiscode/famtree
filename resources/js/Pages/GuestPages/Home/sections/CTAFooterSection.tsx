import { useInView } from 'react-intersection-observer';
import { useRef, useEffect, useState } from 'react';
import './CTAFooterSection.css';

export default function CTAFooterSection() {
    const { ref, inView } = useInView({
        threshold: 0.3,
        triggerOnce: true,
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section className="cta-footer-section" ref={ref}>
            <canvas ref={canvasRef} className="cta-canvas"></canvas>

            <div className={`cta-wrapper ${inView ? 'in-view' : ''}`}>
                {/* Left Decorative Element */}
                <div className="cta-decor cta-decor-left"></div>

                <div className="cta-main-content">
                    {/* Badge */}
                    <div className="cta-badge">
                        <span className="cta-badge-icon">⭐</span>
                        <span>Join Thousands of Happy Families</span>
                    </div>

                    {/* Main Heading */}
                    <h2 className="cta-title">
                        Ready to Preserve Your
                        <span className="cta-title-highlight">Family's Legacy?</span>
                    </h2>

                    {/* Description */}
                    <p className="cta-description">
                        Connect generations, preserve memories, and keep your family's story alive.
                        Start your free family tree in minutes—no credit card required.
                    </p>

                    {/* Trust Indicators */}
                    <div className="cta-trust-row">
                        <div className="trust-item">
                            <div className="trust-icon">✓</div>
                            <div className="trust-text">
                                <div className="trust-label">Free Forever</div>
                                <div className="trust-sub">No credit card</div>
                            </div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon">✓</div>
                            <div className="trust-text">
                                <div className="trust-label">Secure & Private</div>
                                <div className="trust-sub">End-to-end encrypted</div>
                            </div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon">✓</div>
                            <div className="trust-text">
                                <div className="trust-label">Unlimited Members</div>
                                <div className="trust-sub">Add your whole family</div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="cta-actions">
                        <button className="cta-btn cta-btn-primary">
                            <span className="btn-icon">→</span>
                            Create Free Account
                        </button>
                        <button className="cta-btn cta-btn-secondary">
                            Watch Demo
                        </button>
                    </div>

                    {/* Social Proof */}
                    <div className="cta-social-proof">
                        <div className="proof-text">Join 5,000+ families already preserving their legacy</div>
                    </div>
                </div>

                {/* Right Decorative Element */}
                <div className="cta-decor cta-decor-right"></div>
            </div>

            {/* Floating Elements */}
            <div className="floating-element floating-element-1"></div>
            <div className="floating-element floating-element-2"></div>
            <div className="floating-element floating-element-3"></div>
        </section>
    );
}
