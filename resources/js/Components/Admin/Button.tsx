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
        border: '1px solid rgba(0, 82, 232, 0.2)',
        boxShadow: '0 4px 12px rgba(0, 82, 232, 0.25)',
    },
    secondary: {
        background: '#F5F7FA',
        color: '#555',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    },
    danger: {
        background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(220, 38, 38, 0.2)',
        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
    },
    success: {
        background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(22, 163, 74, 0.2)',
        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
    },
    ghost: {
        background: 'transparent',
        color: '#0052E8',
        border: '1px solid rgba(0, 82, 232, 0.3)',
        boxShadow: 'none',
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
                borderRadius: '10px',
                fontWeight: 600,
                letterSpacing: '0.3px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: disabled ? 0.5 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                width: fullWidth ? '100%' : 'auto',
                justifyContent: fullWidth ? 'center' : 'flex-start',
            } as any}
            onMouseEnter={(e) => {
                if (!disabled) {
                    const btn = e.currentTarget;
                    btn.style.transform = 'translateY(-3px)';
                    if (variant === 'primary') {
                        btn.style.boxShadow = '0 8px 20px rgba(0, 82, 232, 0.35)';
                    } else if (variant === 'danger') {
                        btn.style.boxShadow = '0 8px 20px rgba(220, 38, 38, 0.35)';
                    } else if (variant === 'success') {
                        btn.style.boxShadow = '0 8px 20px rgba(22, 163, 74, 0.35)';
                    } else if (variant === 'secondary') {
                        btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    } else if (variant === 'ghost') {
                        btn.style.background = 'rgba(0, 82, 232, 0.05)';
                    }
                }
            }}
            onMouseLeave={(e) => {
                const btn = e.currentTarget;
                btn.style.transform = 'translateY(0)';
                const baseStyles = variantStyles[variant];
                btn.style.boxShadow = baseStyles.boxShadow || 'none';
                if (variant === 'ghost') {
                    btn.style.background = 'transparent';
                }
            }}
        >
            {icon && iconPosition === 'left' && <span>{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span>{icon}</span>}
        </button>
    );
}
