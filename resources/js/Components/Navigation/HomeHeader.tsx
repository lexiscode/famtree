import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useModal } from '@/Context/ModalContext';
import './HomeHeader.css';

export default function HomeHeader() {
    const [authHovered, setAuthHovered] = useState<'login' | 'signup' | null>(null);
    const { openCtaModal } = useModal();

    return (
        <div className="home-header">
            {/* Logo */}
            <div className="home-logo" onClick={() => router.visit('/')}>
                <div className="logo-icon">
                    <i className="bi-diagram-3-fill"></i>
                </div>
                <span className="logo-text">FamTree</span>
            </div>

            {/* Auth Buttons */}
            <div className="home-auth-buttons">
                <button
                    className="auth-btn auth-btn-login"
                    onMouseEnter={() => setAuthHovered('login')}
                    onMouseLeave={() => setAuthHovered(null)}
                    onClick={() => openCtaModal('login')}
                >
                    <i className="bi-box-arrow-in-right auth-btn-icon"></i>
                    <span className="auth-btn-text">Login</span>
                    {authHovered === 'login' && (
                        <div className="auth-btn-glow"></div>
                    )}
                </button>
            </div>
        </div>
    );
}
