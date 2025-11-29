import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    icon?: ReactNode;
}

const badgeStyles = {
    default: {
        background: '#F0F2F7',
        color: '#555',
        border: '1px solid rgba(0, 0, 0, 0.08)',
    },
    primary: {
        background: 'rgba(0, 82, 232, 0.12)',
        color: '#0052E8',
        border: '1px solid rgba(0, 82, 232, 0.3)',
    },
    success: {
        background: 'rgba(22, 163, 74, 0.12)',
        color: '#16A34A',
        border: '1px solid rgba(22, 163, 74, 0.3)',
    },
    warning: {
        background: 'rgba(245, 158, 11, 0.12)',
        color: '#F59E0B',
        border: '1px solid rgba(245, 158, 11, 0.3)',
    },
    danger: {
        background: 'rgba(220, 38, 38, 0.12)',
        color: '#DC2626',
        border: '1px solid rgba(220, 38, 38, 0.3)',
    },
    info: {
        background: 'rgba(59, 130, 246, 0.12)',
        color: '#3B82F6',
        border: '1px solid rgba(59, 130, 246, 0.3)',
    },
};

export default function Badge({ children, variant = 'default', icon }: BadgeProps) {
    const style = badgeStyles[variant];
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '24px',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.2px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                ...style,
            }}
        >
            {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
            {children}
        </span>
    );
}
