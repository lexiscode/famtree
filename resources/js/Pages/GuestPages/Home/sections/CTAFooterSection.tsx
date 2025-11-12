import { useInView } from 'react-intersection-observer';
import './CTAFooterSection.css';

export default function CTAFooterSection() {
    const { ref, inView } = useInView({
        threshold: 0.3,
        triggerOnce: true,
    });

    return (
        <section className="cta-footer-section" ref={ref}>
            <div className={`cta-content ${inView ? 'in-view' : ''}`}>
                <h2>Ready to Preserve Your Family's Legacy?</h2>
                <p>
                    Join thousands of families already using FamTree to connect across generations.
                    Start building your family tree today—it only takes a few minutes.
                </p>

                <div className="cta-buttons">
                    <button className="btn btn-primary btn-lg">
                        Create Free Account
                    </button>
                    <button className="btn btn-outline btn-lg">
                        Learn More
                    </button>
                </div>

                <div className="cta-features">
                    <div className="cta-feature">
                        <span className="cta-feature-icon">✓</span>
                        <span>Free to start, no credit card required</span>
                    </div>
                    <div className="cta-feature">
                        <span className="cta-feature-icon">✓</span>
                        <span>Unlimited family members</span>
                    </div>
                    <div className="cta-feature">
                        <span className="cta-feature-icon">✓</span>
                        <span>Secure & private by default</span>
                    </div>
                </div>
            </div>

            {/* Decorative background */}
            <div className="cta-background">
                <div className="cta-shape shape-1"></div>
                <div className="cta-shape shape-2"></div>
            </div>
        </section>
    );
}
