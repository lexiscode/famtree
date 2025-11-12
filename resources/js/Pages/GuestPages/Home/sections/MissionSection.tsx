import { useInView } from 'react-intersection-observer';
import './MissionSection.css';

export default function MissionSection() {
    const { ref, inView } = useInView({
        threshold: 0.2,
        triggerOnce: true,
    });

    const values = [
        {
            icon: '🌍',
            title: 'Preserve Heritage',
            description:
                'Protect family history and cultural heritage for future generations by creating a digital record of your family tree.',
        },
        {
            icon: '🤝',
            title: 'Connect Families',
            description:
                'Discover distant relatives and build meaningful connections with people who share your family story.',
        },
        {
            icon: '📚',
            title: 'Share Stories',
            description:
                'Document and share family memories, stories, and photos in one secure place accessible to all family members.',
        },
        {
            icon: '🔐',
            title: 'Privacy First',
            description:
                'Control exactly who sees your family information with granular privacy settings and secure data storage.',
        },
    ];

    return (
        <section className="mission-section" ref={ref}>
            <div className="mission-container">
                <div className={`mission-header ${inView ? 'in-view' : ''}`}>
                    <h2>Our Mission</h2>
                    <p className="mission-subtitle">
                        FamTree makes it easy to preserve and share your family's story across generations
                    </p>
                </div>

                <div className={`mission-content ${inView ? 'in-view' : ''}`}>
                    <div className="mission-text-left">
                        <p>
                            We believe every family has a unique story worth preserving. In an increasingly
                            digital world, families are scattered across continents, yet connected by bonds that
                            transcend distance. FamTree provides the platform to document, celebrate, and preserve
                            these connections.
                        </p>
                    </div>

                    <div className="mission-text-right">
                        <p>
                            Our vision is to become the world's most trusted platform for family history,
                            enabling millions of families to preserve their heritage and build stronger connections
                            across generations.
                        </p>
                    </div>
                </div>

                <div className={`mission-values ${inView ? 'in-view' : ''}`}>
                    {values.map((value, index) => (
                        <div
                            key={index}
                            className={`value-card card-${index + 1} ${inView ? 'in-view' : ''}`}
                            style={{
                                transitionDelay: inView ? `${index * 100}ms` : '0ms',
                            }}
                        >
                            <div className="value-icon">{value.icon}</div>
                            <h3>{value.title}</h3>
                            <p>{value.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
