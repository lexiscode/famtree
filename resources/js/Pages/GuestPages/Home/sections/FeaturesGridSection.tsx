import { useInView } from 'react-intersection-observer';
import './FeaturesGridSection.css';

export default function FeaturesGridSection() {
    const { ref, inView } = useInView({
        threshold: 0.2,
        triggerOnce: true,
    });

    const features = [
        {
            icon: '🌳',
            title: 'Visual Family Tree',
            description:
                'See your entire family lineage in a beautiful, interactive tree format. Navigate generations with ease.',
        },
        {
            icon: '📸',
            title: 'Photo Gallery',
            description:
                'Store and organize unlimited family photos. Add captions, dates, and memories to each image.',
        },
        {
            icon: '🗂️',
            title: 'Document Storage',
            description:
                'Upload birth certificates, marriage records, and other important documents. Keep everything organized.',
        },
        {
            icon: '👥',
            title: 'Family Collaboration',
            description:
                'Invite family members to contribute information. Collaborate on building a complete family history.',
        },
        {
            icon: '🔐',
            title: 'Privacy Controls',
            description:
                'Choose exactly who can see each person in your tree. Keep sensitive information private or public.',
        },
        {
            icon: '📱',
            title: 'Mobile App',
            description:
                'Access your family tree anywhere. Sync across all your devices seamlessly and offline access available.',
        },
    ];

    return (
        <section className="features-section" ref={ref}>
            <div className="features-container">
                <div className={`features-header ${inView ? 'in-view' : ''}`}>
                    <h2>Powerful Features</h2>
                    <p>Everything you need to build and share your family tree</p>
                </div>

                <div className={`features-grid ${inView ? 'in-view' : ''}`}>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card"
                            style={{
                                transitionDelay: inView ? `${index * 50}ms` : '0ms',
                            }}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
