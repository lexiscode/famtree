import { useState } from 'react';
import { LogIn, AlertTriangle, Lock, Mail, Building2 } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

interface SharedProps {
    flash?: {
        error?: string;
        success?: string;
    };
}

export default function OrgLogin() {
    const { flash } = usePage<SharedProps>().props;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }

        setLoading(true);
        setError(null);

        router.post(route('org.login'), {
            email,
            password,
            remember: rememberMe,
        }, {
            onError: (errors: Record<string, string>) => {
                setLoading(false);
                const errorMessage = Object.values(errors)[0] || 'Login failed. Please try again.';
                setError(errorMessage);
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
                        <Building2 size={36} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: '1.875rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        margin: '0 0 0.5rem 0',
                    }}>
                        Organization Portal
                    </h1>
                    <p style={{
                        fontSize: '0.95rem',
                        color: '#A0A0A0',
                        margin: 0,
                    }}>
                        Manage your organization on FamTree
                    </p>
                </div>

                {/* Login Card */}
                <div style={{
                    background: '#141425',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    padding: '2.5rem',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                }}>
                    {/* Flash Messages */}
                    {(flash?.error || flash?.success || error) && (
                        <div style={{
                            background: error || flash?.error
                                ? 'rgba(239, 68, 68, 0.1)'
                                : 'rgba(34, 197, 94, 0.1)',
                            border: `1px solid ${error || flash?.error ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            gap: '0.75rem',
                        }}>
                            {error || flash?.error ? (
                                <AlertTriangle size={20} color="#EF4444" />
                            ) : null}
                            <p style={{
                                fontSize: '0.9rem',
                                color: error || flash?.error ? '#EF4444' : '#22C55E',
                                margin: 0,
                            }}>
                                {error || flash?.error || flash?.success}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email Field */}
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
                                    placeholder="admin@organization.famtree.test"
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

                        {/* Password Field */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: '#E0E0E0',
                                marginBottom: '0.5rem',
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#8B5CF6' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
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

                        {/* Remember Me */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                            fontSize: '0.85rem',
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#A0A0A0',
                                cursor: 'pointer',
                                userSelect: 'none',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        cursor: 'pointer',
                                        accentColor: '#8B5CF6',
                                    }}
                                />
                                Remember me
                            </label>
                            <a
                                href={route('org.forgot-password')}
                                style={{
                                    color: '#8B5CF6',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    transition: 'color 0.3s ease',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#A78BFA'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#8B5CF6'}
                            >
                                Forgot Password?
                            </a>
                        </div>

                        {/* Login Button */}
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
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
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
                            <LogIn size={20} />
                            {loading ? 'Logging in...' : 'Login'}
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
                    Organization access only • Contact admin for account setup
                </p>
            </div>
        </div>
    );
}
