import { useInView } from 'react-intersection-observer';
import './HowItWorksSection.css';

export default function HowItWorksSection() {
    const { ref, inView } = useInView({
        threshold: 0.2,
        triggerOnce: true,
    });

    const steps = [
        {
            number: '01',
            title: 'Create Your Account',
            description:
                'Sign up in seconds and start building your family tree. Add yourself as the root and invite family members to join.',
            features: ['Easy registration', 'Privacy controls', 'Email verification'],
        },
        {
            number: '02',
            title: 'Add Family Members',
            description:
                'Build your family tree by adding relatives. Upload photos, dates, and personal stories for each person.',
            features: ['Drag-and-drop interface', 'Bulk import', 'Photo gallery'],
        },
        {
            number: '03',
            title: 'Connect & Share',
            description:
                'Invite relatives to join your family tree and collaborate. Control who sees what with privacy settings.',
            features: ['Share with family', 'Collaboration tools', 'Activity timeline'],
        },
    ];

    return (
        <section className="how-it-works-section" ref={ref}>
            <div className="how-it-works-container">
                <div className={`how-header ${inView ? 'in-view' : ''}`}>
                    <h2>How It Works</h2>
                    <p>Get started with FamTree in three simple steps</p>
                </div>

                <div className={`how-steps ${inView ? 'in-view' : ''}`}>
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="step-card"
                            style={{
                                transitionDelay: inView ? `${index * 150}ms` : '0ms',
                            }}
                        >
                            <div className="step-number">{step.number}</div>

                            {index < steps.length - 1 && <div className="step-connector"></div>}

                            <div className="step-content">
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>

                                <ul className="step-features">
                                    {step.features.map((feature, idx) => (
                                        <li key={idx}>
                                            <span className="feature-checkmark">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`how-cta ${inView ? 'in-view' : ''}`}>
                    <p>Ready to preserve your family's story?</p>
                    <button className="btn btn-primary btn-lg">Get Started Now</button>
                </div>
            </div>
        </section>
    );
}
