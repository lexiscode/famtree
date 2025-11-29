import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type?: AlertType;
    title?: string;
    children: ReactNode;
    onClose?: () => void;
}

const alertStyles = {
    success: {
        background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
        border: '1px solid rgba(22, 163, 74, 0.3)',
        color: '#16A34A',
        icon: CheckCircle,
    },
    error: {
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
        border: '1px solid rgba(220, 38, 38, 0.3)',
        color: '#DC2626',
        icon: AlertCircle,
    },
    warning: {
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        color: '#F59E0B',
        icon: AlertTriangle,
    },
    info: {
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        color: '#3B82F6',
        icon: Info,
    },
};

export default function Alert({ type = 'info', title, children, onClose }: AlertProps) {
    const style = alertStyles[type];
    const Icon = style.icon;

    return (
        <div
            style={{
                background: style.background,
                border: style.border,
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                color: style.color,
                display: 'flex',
                gap: '1rem',
                boxShadow: `0 4px 12px ${style.color}15`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem',
                flex: 1,
            }}>
                <Icon size={20} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                <div>
                    {title && (
                        <p style={{
                            margin: '0 0 0.5rem 0',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                        }}>
                            {title}
                        </p>
                    )}
                    <p style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        opacity: 0.9,
                    }}>
                        {children}
                    </p>
                </div>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        fontSize: '1.25rem',
                        lineHeight: 1,
                        opacity: 0.6,
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                >
                    ×
                </button>
            )}
        </div>
    );
}
