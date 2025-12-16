import { useEffect, useRef } from 'react';
import './FeatureModal.css';

interface Feature {
    icon: string;
    title: string;
    description: string;
}

interface FeatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    features: Feature[];
}

export default function FeatureModal({ isOpen, onClose, title, description, features }: FeatureModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === modalRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="feature-modal-overlay"
            ref={modalRef}
            onClick={handleBackdropClick}
        >
            <div className="feature-modal">
                <div className="feature-modal-header">
                    <div>
                        <h2>{title}</h2>
                        <p className="feature-modal-description">{description}</p>
                    </div>
                    <button
                        className="feature-modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <i className="bi-x-lg"></i>
                    </button>
                </div>
                <div className="feature-modal-content">
                    <div className="features-list">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-item">
                                <div className="feature-icon">
                                    <i className={feature.icon}></i>
                                </div>
                                <div className="feature-text">
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
