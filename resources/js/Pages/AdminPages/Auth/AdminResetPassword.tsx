import { useState } from 'react';
import { AlertTriangle, Lock } from 'lucide-react';
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

export default function AdminResetPassword() {
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

        router.post(route('admin.reset-password'), {
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

    return (
        <div className="ap-auth-page">
            <div className="ap-auth-container">
                {/* Logo/Brand Section */}
                <div className="ap-auth-brand">
                    <div className="ap-auth-logo">
                        <Lock size={24} color="white" />
                    </div>
                    <h1>Create New Password</h1>
                    <p>Enter a new password for your admin account</p>
                </div>

                {/* Card */}
                <div className="ap-auth-card">
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
                        {/* Password Field */}
                        <div>
                            <label className="ap-auth-label">
                                New Password
                            </label>
                            <div className="ap-auth-input-wrap">
                                <Lock size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="ap-auth-input"
                                />
                            </div>
                            <p className="ap-auth-hint">
                                Must be at least 8 characters long
                            </p>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="ap-auth-label">
                                Confirm Password
                            </label>
                            <div className="ap-auth-input-wrap">
                                <Lock size={18} />
                                <input
                                    type="password"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    placeholder="••••••••"
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
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
