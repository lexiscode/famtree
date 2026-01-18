import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import './AccountReactivation.css';

interface Props {
    message: string;
}

export default function Invalid({ message }: Props) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleRequestNew = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        router.post('/request-reactivation', { email }, {
            onSuccess: () => setSubmitted(true),
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <GuestLayout>
            <Head title="Invalid Link" />

            <div className="reactivation-page">
                <div className="reactivation-container invalid">
                    <div className="error-icon">⚠️</div>
                    <h1>Link Expired or Invalid</h1>

                    <p className="error-message">{message}</p>

                    {!submitted ? (
                        <>
                            <p className="help-text">
                                If your account has been memorialized and you need to reactivate it, you can request a new verification link below.
                            </p>

                            <form onSubmit={handleRequestNew} className="request-form">
                                <div className="form-group">
                                    <label htmlFor="email">Your Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="request-button"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Sending...' : 'Request New Link'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="success-message">
                            <div className="success-icon">✓</div>
                            <p>If an account with that email exists and is memorialized, a reactivation link has been sent.</p>
                            <p className="check-email">Please check your email inbox.</p>
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
