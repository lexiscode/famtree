import { useEffect, useRef } from 'react';
import './InfoModal.css';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: React.ReactNode;
}

export default function InfoModal({ isOpen, onClose, title, content }: InfoModalProps) {
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
            className="info-modal-overlay"
            ref={modalRef}
            onClick={handleBackdropClick}
        >
            <div className="info-modal">
                <div className="info-modal-header">
                    <h2>{title}</h2>
                    <button
                        className="info-modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <i className="bi-x-lg"></i>
                    </button>
                </div>
                <div className="info-modal-content">
                    {content}
                </div>
            </div>
        </div>
    );
}
