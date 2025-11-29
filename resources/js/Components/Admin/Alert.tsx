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
        background: '#D5F4E6',
        border: '1px solid #A9DFBF',
        color: '#196F3D',
        icon: CheckCircle,
    },
    error: {
        background: '#FADBD8',
        border: '1px solid #F5B7B1',
        color: '#C0392B',
        icon: AlertCircle,
    },
    warning: {
        background: '#FCF3CF',
        border: '1px solid #F9E79F',
        color: '#7D6608',
        icon: AlertTriangle,
    },
    info: {
        background: '#D6EAF8',
        border: '1px solid #AED6F1',
        color: '#154360',
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
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                color: style.color,
                display: 'flex',
                gap: '1rem',
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                flex: 1,
            }}>
                <Icon size={20} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                <div>
                    {title && (
                        <p style={{
                            margin: '0 0 0.5rem 0',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                        }}>
                            {title}
                        </p>
                    )}
                    <p style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
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
                        padding: '0',
                        fontSize: '1.5rem',
                        lineHeight: 1,
                        opacity: 0.7,
                        transition: 'opacity 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                    ×
                </button>
            )}
        </div>
    );
}
