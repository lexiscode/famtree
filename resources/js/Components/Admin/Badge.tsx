import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    icon?: ReactNode;
}

const badgeStyles = {
    default: {
        background: '#E8E8E8',
        color: '#333',
    },
    primary: {
        background: 'rgba(0, 82, 232, 0.1)',
        color: '#0052E8',
    },
    success: {
        background: 'rgba(46, 204, 113, 0.1)',
        color: '#2ECC71',
    },
    warning: {
        background: 'rgba(243, 156, 18, 0.1)',
        color: '#F39C12',
    },
    danger: {
        background: 'rgba(255, 71, 87, 0.1)',
        color: '#FF4757',
    },
    info: {
        background: 'rgba(52, 152, 219, 0.1)',
        color: '#3498DB',
    },
};

export default function Badge({ children, variant = 'default', icon }: BadgeProps) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                ...badgeStyles[variant],
            }}
        >
            {icon && <span>{icon}</span>}
            {children}
        </span>
    );
}
