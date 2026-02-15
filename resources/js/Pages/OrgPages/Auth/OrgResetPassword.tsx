import { useState } from 'react';
import { AlertTriangle, Lock, Building2 } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

interface Props {
    token: string;
    email: string;
}

interface SharedProps extends Props {
    flash?: {
        error?: string;
        success?: string;
    };
}

export default function OrgResetPassword() {
    const { token, email, flash } = usePage<SharedProps>().props;
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !passwordConfirm) {
            setError('Both password fields are required.');
            return;
        }

        if (password !== passwordConfirm) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        setError(null);

        router.post(route('org.reset-password'), {
            token,
            email,
            password,
            password_confirmation: passwordConfirm,
        }, {
            onError: (errors: Record<string, string>) => {
                setLoading(false);
                const errorMessage = Object.values(errors)[0] || 'Failed to reset password. Please try again.';
                setError(errorMessage);
            },
        });
    };

    const inputStyle = (focused: boolean): React.CSSProperties => ({
        width: '100%',
        paddingLeft: '40px',
        paddingRight: '12px',
        paddingTop: '10px',
        paddingBottom: '10px',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '8px',
        background: '#1e1e35',
        color: '#FFFFFF',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
        outline: 'none',
    });

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0c0c1d 0%, #1a0a2e 50%, #0c0c1d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
        }}>
            <div style={{ width: '100%', maxWidth: '450px' }}>
                {/* Logo/Brand Section */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '70px',
                        height: '70px',
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
                    }}>
                        <Lock size={36} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: '1.875rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        margin: '0 0 0.5rem 0',
                    }}>
                        Create New Password
                    </h1>
                    <p style={{
                        fontSize: '0.95rem',
                        color: '#A0A0A0',
                        margin: 0,
                    }}>
                        Enter a new password for your organization account
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: '#141425',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    padding: '2.5rem',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                }}>
                    {/* Error Messages */}
                    {(flash?.error || error) && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            gap: '0.75rem',
                        }}>
                            <AlertTriangle size={20} color="#EF4444" />
                            <p style={{
                                fontSize: '0.9rem',
                                color: '#EF4444',
                                margin: 0,
                            }}>
                                {error || flash?.error}
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* New Password */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: '#E0E0E0',
                                marginBottom: '0.5rem',
                            }}>
                                New Password
                            </label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#8B5CF6' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={inputStyle(false)}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#8B5CF6';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                            <p style={{
                                fontSize: '0.8rem',
                                color: '#707070',
                                margin: '0.5rem 0 0 0',
                            }}>
                                Must be at least 8 characters long
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: '#E0E0E0',
                                marginBottom: '0.5rem',
                            }}>
                                Confirm Password
                            </label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#8B5CF6' }} />
                                <input
                                    type="password"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    placeholder="••••••••"
                                    style={inputStyle(false)}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#8B5CF6';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: loading
                                    ? 'rgba(139, 92, 246, 0.5)'
                                    : 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: loading ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.3)',
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                                }
                            }}
                        >
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p style={{
                    textAlign: 'center',
                    color: '#555',
                    fontSize: '0.85rem',
                    marginTop: '2rem',
                }}>
                    Remember your password?{' '}
                    <a
                        href={route('org.login')}
                        style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: 600 }}
                    >
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}
