import { useEffect, useRef } from 'react';
import './ProcessModal.css';

interface ProcessItem {
    icon: string;
    title: string;
    description: string;
    details?: string[];
}

interface ProcessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    type: 'steps' | 'grid';
    items: ProcessItem[];
}

export default function ProcessModal({ isOpen, onClose, title, description, type, items }: ProcessModalProps) {
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
            className="process-modal-overlay"
            ref={modalRef}
            onClick={handleBackdropClick}
        >
            <div className="process-modal">
                <div className="process-modal-header">
                    <div>
                        <h2>{title}</h2>
                        <p className="process-modal-description">{description}</p>
                    </div>
                    <button
                        className="process-modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <i className="bi-x-lg"></i>
                    </button>
                </div>
                <div className="process-modal-content">
                    {type === 'steps' ? (
                        <div className="process-steps-list">
                            {items.map((item, index) => (
                                <div key={index} className="process-step-item">
                                    <div className="step-number-badge">{index + 1}</div>
                                    <div className="step-icon-wrapper">
                                        <div className="step-icon">
                                            <i className={item.icon}></i>
                                        </div>
                                    </div>
                                    <div className="step-content">
                                        <h3>{item.title}</h3>
                                        <p className="step-description">{item.description}</p>
                                        {item.details && item.details.length > 0 && (
                                            <ul className="step-details">
                                                {item.details.map((detail, idx) => (
                                                    <li key={idx}>
                                                        <i className="bi-check-circle-fill"></i>
                                                        <span>{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="process-grid-list">
                            {items.map((item, index) => (
                                <div key={index} className="process-grid-item">
                                    <div className="grid-icon">
                                        <i className={item.icon}></i>
                                    </div>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
