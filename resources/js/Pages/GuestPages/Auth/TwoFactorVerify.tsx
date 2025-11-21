import { useState } from 'react';
import { AlertTriangle, ArrowLeft, Shield } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';

interface SharedProps {
    flash?: {
        error?: string;
        info?: string;
    };
}

export default function TwoFactorVerify() {
    const { flash } = usePage<SharedProps>().props;
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!code || code.length < 6) {
            setError('Please enter a valid code (6+ characters)');
            return;
        }

        setLoading(true);
        setError(null);

        router.post(route('auth.verify-2fa'), {
            code: code.toUpperCase(),
        }, {
            onError: (errors: Record<string, string>) => {
                setLoading(false);
                const errorMessage = Object.values(errors)[0] || 'Invalid 2FA code. Please try again.';
                setError(errorMessage);
            },
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1f3a 0%, #16213e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: '#0f172a',
                borderRadius: '12px',
                border: '1px solid rgba(0, 82, 232, 0.2)',
                padding: '2.5rem',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                        borderRadius: '12px',
                        marginBottom: '1rem',
                    }}>
                        <Shield size={32} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        margin: '0 0 0.5rem 0',
                    }}>
                        Two-Factor Authentication
                    </h1>
                    <p style={{
                        fontSize: '0.9rem',
                        color: '#B0B0B0',
                        margin: 0,
                    }}>
                        Enter the code from your authenticator app
                    </p>
                </div>

                {/* Flash Messages */}
                {(flash?.error || flash?.info || error) && (
                    <div style={{
                        background: error || flash?.error
                            ? 'rgba(255, 71, 87, 0.1)'
                            : 'rgba(33, 150, 243, 0.1)',
                        border: `1px solid ${error || flash?.error ? 'rgba(255, 71, 87, 0.3)' : 'rgba(33, 150, 243, 0.3)'}`,
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                    }}>
                        <AlertTriangle
                            size={20}
                            color={error || flash?.error ? '#FF4757' : '#2196F3'}
                            style={{ flexShrink: 0, marginTop: '0.25rem' }}
                        />
                        <div style={{ color: error || flash?.error ? '#FF9999' : '#64B5F6' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>
                                {error || flash?.error || flash?.info}
                            </p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            color: '#FFFFFF',
                            marginBottom: '0.5rem',
                        }}>
                            6-Digit Code or Backup Code
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value.toUpperCase());
                                setError(null);
                            }}
                            placeholder="000000"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(0, 82, 232, 0.3)',
                                background: 'rgba(20, 30, 60, 0.8)',
                                color: '#FFFFFF',
                                fontSize: '1.1rem',
                                textAlign: 'center',
                                letterSpacing: '0.25rem',
                                fontFamily: 'monospace',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(0, 82, 232, 0.6)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 82, 232, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(0, 82, 232, 0.3)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            required
                            autoFocus
                        />
                        <p style={{
                            fontSize: '0.8rem',
                            color: '#6B7280',
                            marginTop: '0.5rem',
                            margin: '0.5rem 0 0 0',
                        }}>
                            Use a code from your authenticator app or a backup code
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: loading
                                ? 'rgba(0, 82, 232, 0.5)'
                                : 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                            color: '#FFFFFF',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 82, 232, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {loading ? 'Verifying...' : 'Verify Code'}
                    </button>
                </form>

                {/* Back Button */}
                <button
                    onClick={() => window.history.back()}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(0, 82, 232, 0.3)',
                        background: 'transparent',
                        color: '#87CEEB',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(0, 82, 232, 0.6)';
                        e.currentTarget.style.background = 'rgba(0, 82, 232, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(0, 82, 232, 0.3)';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                {/* Info Box */}
                <div style={{
                    background: 'rgba(0, 82, 232, 0.05)',
                    border: '1px solid rgba(0, 82, 232, 0.1)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1.5rem',
                    fontSize: '0.8rem',
                    color: '#B0B0B0',
                    lineHeight: '1.5',
                }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500, color: '#87CEEB' }}>
                        Don't have access to your authenticator?
                    </p>
                    <p style={{ margin: 0 }}>
                        Use one of your backup codes instead. Backup codes are 8 characters long.
                    </p>
                </div>
            </div>
        </div>
    );
}
