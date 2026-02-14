import { useState } from 'react';
import { AlertTriangle, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

interface SharedProps {
    flash?: {
        error?: string;
        success?: string;
    };
}

export default function AdminForgotPassword() {
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

        router.post(route('admin.send-password-reset'), {
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
        <div className="ap-auth-page">
            <div className="ap-auth-container">
                {/* Back Button */}
                <a
                    href={route('admin.login')}
                    className="ap-auth-link ap-flex ap-items-center ap-gap-sm ap-mb-lg"
                >
                    <ArrowLeft size={18} />
                    Back to Login
                </a>

                {/* Logo/Brand Section */}
                <div className="ap-auth-brand">
                    <div className="ap-auth-logo">
                        <Mail size={24} color="white" />
                    </div>
                    <h1>Reset Password</h1>
                    <p>Enter your email to receive reset instructions</p>
                </div>

                {/* Card */}
                <div className="ap-auth-card">
                    {submitted ? (
                        <div className="ap-text-center">
                            <div className="ap-auth-success-icon">
                                <CheckCircle size={24} color="#34D399" />
                            </div>
                            <h2 className="ap-auth-success-title">
                                Check Your Email
                            </h2>
                            <p className="ap-auth-success-text">
                                We've sent a password reset link to <strong>{email}</strong>. Check your inbox and click the link to reset your password.
                            </p>
                            <p className="ap-auth-success-hint">
                                The link will expire in 60 minutes.
                            </p>
                            <a
                                href={route('admin.login')}
                                className="ap-auth-success-btn"
                            >
                                Back to Login
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* Flash Messages */}
                            {(flash?.error || error) && (
                                <div className="ap-auth-flash error">
                                    <AlertTriangle size={18} />
                                    <p className="ap-mb-0">
                                        {error || flash?.error}
                                    </p>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                {/* Email Field */}
                                <div>
                                    <label className="ap-auth-label">
                                        Email Address
                                    </label>
                                    <div className="ap-auth-input-wrap">
                                        <Mail size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="admin@example.com"
                                            className="ap-auth-input"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="ap-auth-submit"
                                >
                                    {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
