import { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    onClick?: () => void;
    disabled?: boolean;
    fullWidth?: boolean;
}

const variantStyles = {
    primary: {
        background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
        color: '#FFFFFF',
        border: 'none',
    },
    secondary: {
        background: '#F5F5F5',
        color: '#333',
        border: '1px solid #E0E0E0',
    },
    danger: {
        background: '#FF4757',
        color: '#FFFFFF',
        border: 'none',
    },
    success: {
        background: '#2ECC71',
        color: '#FFFFFF',
        border: 'none',
    },
    ghost: {
        background: 'transparent',
        color: '#0052E8',
        border: '1px solid #0052E8',
    },
};

const sizeStyles = {
    sm: {
        padding: '0.5rem 0.75rem',
        fontSize: '0.85rem',
        gap: '0.5rem',
    },
    md: {
        padding: '0.75rem 1rem',
        fontSize: '0.95rem',
        gap: '0.5rem',
    },
    lg: {
        padding: '1rem 1.5rem',
        fontSize: '1rem',
        gap: '0.75rem',
    },
};

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    onClick,
    disabled = false,
    fullWidth = false,
}: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                ...variantStyles[variant],
                ...sizeStyles[size],
                borderRadius: '8px',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.6 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                width: fullWidth ? '100%' : 'auto',
                justifyContent: fullWidth ? 'center' : 'flex-start',
                ...(!disabled && {
                    ':hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                }),
            } as any}
            onMouseEnter={(e) => {
                if (!disabled) {
                    const btn = e.currentTarget;
                    btn.style.transform = 'translateY(-2px)';
                    if (variant !== 'ghost') {
                        btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }
                }
            }}
            onMouseLeave={(e) => {
                const btn = e.currentTarget;
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            }}
        >
            {icon && iconPosition === 'left' && <span>{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span>{icon}</span>}
        </button>
    );
}
