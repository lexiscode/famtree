import { useState } from 'react';
import { AlertTriangle, ArrowLeft, Mail, CheckCircle, Building2 } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

interface SharedProps {
    flash?: {
        error?: string;
        success?: string;
    };
}

export default function OrgForgotPassword() {
    const { flash } = usePage<SharedProps>().props;
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required.');
            return;
        }

        setLoading(true);
        setError(null);

        router.post(route('org.send-password-reset'), {
            email,
        }, {
            onError: (errors: Record<string, string>) => {
                setLoading(false);
                const errorMessage = Object.values(errors)[0] || 'Failed to send reset link. Please try again.';
                setError(errorMessage);
            },
            onSuccess: () => {
                setLoading(false);
                setSubmitted(true);
            },
        });
    };

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
                {/* Back Button */}
                <a
                    href={route('org.login')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#8B5CF6',
                        textDecoration: 'none',
                        marginBottom: '2rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#A78BFA'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#8B5CF6'}
                >
                    <ArrowLeft size={18} />
                    Back to Login
                </a>

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
                        <Mail size={36} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: '1.875rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        margin: '0 0 0.5rem 0',
                    }}>
                        Reset Password
                    </h1>
                    <p style={{
                        fontSize: '0.95rem',
                        color: '#A0A0A0',
                        margin: 0,
                    }}>
                        Enter your email to receive reset instructions
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
                    {submitted ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '60px',
                                height: '60px',
                                background: 'rgba(34, 197, 94, 0.1)',
                                borderRadius: '50%',
                                marginBottom: '1.5rem',
                            }}>
                                <CheckCircle size={32} color="#22C55E" />
                            </div>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#FFFFFF',
                                margin: '0 0 0.75rem 0',
                            }}>
                                Check Your Email
                            </h2>
                            <p style={{
                                fontSize: '0.9rem',
                                color: '#A0A0A0',
                                margin: '0 0 1.5rem 0',
                                lineHeight: '1.5',
                            }}>
                                We've sent a password reset link to <strong style={{ color: '#E0E0E0' }}>{email}</strong>. Check your inbox and click the link to reset your password.
                            </p>
                            <p style={{
                                fontSize: '0.85rem',
                                color: '#707070',
                                margin: '0 0 1.5rem 0',
                            }}>
                                The link will expire in 60 minutes.
                            </p>
                            <a
                                href={route('org.login')}
                                style={{
                                    display: 'inline-block',
                                    padding: '12px 32px',
                                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                                    color: '#FFFFFF',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                                }}
                            >
                                Back to Login
                            </a>
                        </div>
                    ) : (
                        <>
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
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        color: '#E0E0E0',
                                        marginBottom: '0.5rem',
                                    }}>
                                        Email Address
                                    </label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: '12px', color: '#8B5CF6' }} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            style={{
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
                                            }}
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
                                    {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                                </button>
                            </form>
                        </>
                    )}
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
