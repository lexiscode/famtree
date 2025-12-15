import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useModal } from '@/Context/ModalContext';
import './FloatingNavDock.css';

export default function FloatingNavDock() {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const { openCtaModal } = useModal();

    const navItems = [
        {
            id: 'about',
            label: 'About Us',
            icon: 'bi-info-circle-fill',
            path: '/about',
        },
        {
            id: 'features',
            label: 'Features',
            icon: 'bi-stars',
            path: '/features',
        },
        {
            id: 'how-it-works',
            label: 'How It Works',
            icon: 'bi-gear-fill',
            path: '/how-it-works',
        },
        {
            id: 'blog',
            label: 'Blog',
            icon: 'bi-journal-text',
            path: '/blog',
        },
        {
            id: 'contact',
            label: 'Contact',
            icon: 'bi-envelope-fill',
            path: '/contact',
        },
    ];

    const handleNavClick = (path: string) => {
        router.visit(path);
    };

    return (
        <div className="floating-nav-dock">
            <div className="nav-dock-container">
                {navItems.map((item) => (
                    <div
                        key={item.id}
                        className="nav-dock-item"
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => handleNavClick(item.path)}
                    >
                        <div className="nav-dock-icon">
                            <i className={`${item.icon} nav-icon`}></i>
                        </div>
                        {hoveredItem === item.id && (
                            <div className="nav-dock-tooltip">
                                {item.label}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
