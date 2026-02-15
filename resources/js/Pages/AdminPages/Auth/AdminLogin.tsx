import { useState } from 'react';
import { LogIn, AlertTriangle, Lock, Mail } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

interface SharedProps {
    flash?: {
        error?: string;
        success?: string;
    };
}

export default function AdminLogin() {
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

        router.post(route('admin.login'), {
            email,
            password,
            rememberMe,
        }, {
            onError: (errors: Record<string, string>) => {
                setLoading(false);
                const errorMessage = Object.values(errors)[0] || 'Login failed. Please try again.';
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
                    <h1>Admin Portal</h1>
                    <p>FamTree Administration Dashboard</p>
                </div>

                {/* Login Card */}
                <div className="ap-auth-card">
                    {/* Flash Messages */}
                    {(flash?.error || flash?.success || error) && (
                        <div className={`ap-auth-flash ${error || flash?.error ? 'error' : 'success'}`}>
                            {error || flash?.error ? (
                                <AlertTriangle size={18} />
                            ) : null}
                            <p className="ap-mb-0">
                                {error || flash?.error || flash?.success}
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

                        {/* Password Field */}
                        <div>
                            <label className="ap-auth-label">
                                Password
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
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="ap-auth-row">
                            <label className="ap-auth-remember">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Remember me
                            </label>
                            <a
                                href={route('admin.forgot-password')}
                                className="ap-auth-link"
                            >
                                Forgot password?
                            </a>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="ap-auth-submit"
                        >
                            <LogIn size={18} />
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="ap-auth-footer">
                    Admin access only &bull; Unauthorized access is prohibited
                </p>
            </div>
        </div>
    );
}
