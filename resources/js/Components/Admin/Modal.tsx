import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    title: string;
    children: ReactNode;
    onClose: () => void;
    footer?: ReactNode;
}

export default function Modal({ isOpen, title, children, onClose, footer }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={onClose}
        >
            <div
                style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                    width: '100%',
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '2rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#0a0e27',
                        letterSpacing: '-0.3px',
                    }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#F0F2F7',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: '#888',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#E8EAF0';
                            e.currentTarget.style.color = '#0a0e27';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F0F2F7';
                            e.currentTarget.style.color = '#888';
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    flex: 1,
                    padding: '1.75rem 2rem',
                    overflowY: 'auto',
                }}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div style={{
                        padding: '1.75rem 2rem',
                        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end',
                        background: '#F9FAFC',
                    }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
