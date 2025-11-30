import { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, AlertTriangle, CheckCircle, Lock, Eye } from 'lucide-react';

interface UserActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    actionType: 'suspend' | 'ban' | 'deactivate' | 'schedule-delete' | 'reset-password' | 'disable-2fa' | 'enable-2fa' | 'complete-onboarding' | 'reset-onboarding' | 'unsuspend';
    userName: string;
}

// Bootstrap theme colors
const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

const actionConfig = {
    suspend: {
        title: 'Suspend User Account',
        message: 'This will prevent the user from logging in and accessing their account.',
        confirmText: 'Suspend Account',
        isDangerous: true,
        hasReason: true,
    },
    unsuspend: {
        title: 'Reactivate User Account',
        message: 'This will allow the user to access their account again.',
        confirmText: 'Reactivate Account',
        isDangerous: false,
        hasReason: false,
    },
    deactivate: {
        title: 'Deactivate User Account',
        message: 'This will mark the account as inactive but it can be reactivated later.',
        confirmText: 'Deactivate Account',
        isDangerous: false,
        hasReason: false,
    },
    ban: {
        title: 'Ban User Account',
        message: 'This action cannot be easily undone. The user account will be deleted from the system.',
        confirmText: 'Ban User',
        isDangerous: true,
        hasReason: true,
    },
    'schedule-delete': {
        title: 'Schedule Account Deletion',
        message: 'The user will be notified that their account is scheduled for deletion. They can cancel before the deletion date.',
        confirmText: 'Schedule Deletion',
        isDangerous: true,
        hasReason: false,
        hasDays: true,
    },
    'reset-password': {
        title: 'Reset User Password',
        message: 'A password reset link will be sent to the user\'s email address.',
        confirmText: 'Send Reset Link',
        isDangerous: false,
        hasReason: false,
    },
    'disable-2fa': {
        title: 'Disable Two-Factor Authentication',
        message: 'The user will need to re-enable 2FA if they want to use it again.',
        confirmText: 'Disable 2FA',
        isDangerous: false,
        hasReason: false,
    },
    'enable-2fa': {
        title: 'Require Two-Factor Authentication',
        message: 'The user will be required to complete 2FA setup on their next login.',
        confirmText: 'Enable 2FA',
        isDangerous: false,
        hasReason: false,
    },
    'complete-onboarding': {
        title: 'Mark Onboarding as Complete',
        message: 'This will mark the user\'s onboarding process as complete.',
        confirmText: 'Mark Complete',
        isDangerous: false,
        hasReason: false,
    },
    'reset-onboarding': {
        title: 'Reset Onboarding Process',
        message: 'The user will need to complete the onboarding process again.',
        confirmText: 'Reset Onboarding',
        isDangerous: false,
        hasReason: false,
    },
};

export default function UserActionModal({ isOpen, onClose, userId, actionType, userName }: UserActionModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [days, setDays] = useState('30');
    const [confirmed, setConfirmed] = useState(false);

    const config = actionConfig[actionType];

    const handleConfirm = () => {
        if (!confirmed) return;

        setIsLoading(true);

        const data: Record<string, any> = {};
        if (config.hasReason && reason) {
            data.reason = reason;
        }
        if (config.hasDays && days) {
            data.days = parseInt(days);
        }

        router.post(route(`admin.users.${actionType}`, userId), data, {
            onSuccess: () => {
                setIsLoading(false);
                onClose();
                setReason('');
                setDays('30');
                setConfirmed(false);
            },
            onError: () => {
                setIsLoading(false);
            },
        });
    };

    if (!isOpen) return null;

    const headerColor = config.isDangerous ? THEME.danger : THEME.primary;
    const headerBgColor = config.isDangerous ? '#ffebee' : '#e7f1ff';
    const headerBorderColor = config.isDangerous ? '#ffcdd2' : '#cce5ff';

    const getIcon = () => {
        if (config.isDangerous) return <AlertTriangle size={20} color={headerColor} />;
        if (actionType === 'reset-password') return <Lock size={20} color={headerColor} />;
        if (actionType.includes('2fa')) return <Eye size={20} color={headerColor} />;
        return <CheckCircle size={20} color={headerColor} />;
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)', maxWidth: '500px', width: '90%', marginLeft: 'auto', marginRight: 'auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderBottom: `2px solid ${headerBorderColor}`, background: headerBgColor }}>
                    {getIcon()}
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                        {config.title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            marginLeft: 'auto',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6c757d',
                            padding: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#0a0e27';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#6c757d';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Message */}
                    <p style={{ fontSize: '0.95rem', color: '#666', margin: 0, lineHeight: '1.6' }}>
                        {config.message}
                    </p>

                    {/* User Name */}
                    <div style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '10px', border: '1.5px solid #E5E7EB' }}>
                        <p style={{ fontSize: '0.85rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 500 }}>User:</p>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>{userName}</p>
                    </div>

                    {/* Reason Input */}
                    {config.hasReason && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#0a0e27', marginBottom: '0.5rem' }}>
                                Reason (Optional)
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Why are you performing this action?"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '1.5px solid #E5E7EB',
                                    borderRadius: '10px',
                                    fontSize: '0.95rem',
                                    fontFamily: 'inherit',
                                    resize: 'none',
                                    transition: 'all 0.3s',
                                    boxSizing: 'border-box',
                                    background: '#FFFFFF',
                                    color: '#0a0e27',
                                }}
                                rows={3}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = THEME.primary;
                                    e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}20`;
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Days Input */}
                    {config.hasDays && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#0a0e27', marginBottom: '0.5rem' }}>
                                Days Until Deletion
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="365"
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '1.5px solid #E5E7EB',
                                    borderRadius: '10px',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s',
                                    boxSizing: 'border-box',
                                    background: '#FFFFFF',
                                    color: '#0a0e27',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = THEME.primary;
                                    e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}20`;
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Confirmation Checkbox */}
                    {config.isDangerous && (
                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.75rem',
                                padding: '1rem',
                                background: '#ffebee',
                                borderRadius: '10px',
                                border: '1.5px solid #ffcdd2',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#ffdddd';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffebee';
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                                style={{
                                    marginTop: '0.25rem',
                                    cursor: 'pointer',
                                    width: '18px',
                                    height: '18px',
                                }}
                            />
                            <span style={{ fontSize: '0.9rem', color: '#c41c3b', fontWeight: 500, lineHeight: '1.5' }}>
                                I understand this action and want to proceed
                            </span>
                        </label>
                    )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', borderTop: '1.5px solid #E5E7EB', background: '#F9FAFB' }}>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            background: '#FFFFFF',
                            border: '1.5px solid #E5E7EB',
                            color: '#0a0e27',
                            borderRadius: '10px',
                            fontWeight: 600,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s',
                            opacity: isLoading ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.background = '#E5E7EB';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.background = '#FFFFFF';
                            }
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || (config.isDangerous && !confirmed)}
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            background: config.isDangerous ? THEME.danger : THEME.primary,
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 600,
                            cursor: isLoading || (config.isDangerous && !confirmed) ? 'not-allowed' : 'pointer',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s',
                            opacity: isLoading || (config.isDangerous && !confirmed) ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading && !(config.isDangerous && !confirmed)) {
                                e.currentTarget.style.boxShadow = `0 8px 24px ${config.isDangerous ? THEME.danger : THEME.primary}40`;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading && !(config.isDangerous && !confirmed)) {
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {isLoading ? 'Processing...' : config.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
