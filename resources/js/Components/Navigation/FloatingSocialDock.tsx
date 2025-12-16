import { useState } from 'react';
import './FloatingSocialDock.css';

export default function FloatingSocialDock() {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const socialItems = [
        {
            id: 'facebook',
            label: 'Follow us on Facebook',
            icon: 'bi-facebook',
            url: 'https://facebook.com/famtreeapp',
            color: '#1877F2',
        },
        {
            id: 'instagram',
            label: 'Follow us on Instagram',
            icon: 'bi-instagram',
            url: 'https://instagram.com/famtreeapp',
            color: '#E4405F',
        },
        {
            id: 'twitter',
            label: 'Follow us on Twitter',
            icon: 'bi-twitter',
            url: 'https://twitter.com/famtreeapp',
            color: '#1DA1F2',
        },
        {
            id: 'linkedin',
            label: 'Connect on LinkedIn',
            icon: 'bi-linkedin',
            url: 'https://linkedin.com/company/famtree',
            color: '#0A66C2',
        },
    ];

    const handleSocialClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="floating-social-dock">
            <div className="social-dock-container">
                {socialItems.map((item) => (
                    <div
                        key={item.id}
                        className="social-dock-item"
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => handleSocialClick(item.url)}
                        style={{
                            '--social-color': item.color,
                        } as React.CSSProperties}
                    >
                        <div className="social-dock-icon">
                            <i className={`${item.icon} social-icon`}></i>
                        </div>
                        {hoveredItem === item.id && (
                            <div className="social-dock-tooltip">
                                {item.label}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
