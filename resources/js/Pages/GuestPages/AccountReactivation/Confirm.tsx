import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import './AccountReactivation.css';

interface Props {
    token: string;
    user: {
        first_name: string;
        last_name: string;
    };
}

export default function Confirm({ token, user }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = () => {
        setIsSubmitting(true);
        router.post(`/reactivate/${token}`, {}, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reactivate Account" />

            <div className="reactivation-page">
                <div className="reactivation-container">
                    <div className="welcome-icon">🎉</div>
                    <h1>Welcome Back, {user.first_name}!</h1>

                    <div className="message-section">
                        <p className="main-message">
                            We're glad to see you! Your account was marked as a memorial, but it looks like that was a mistake.
                        </p>
                        <p className="sub-message">
                            Click the button below to reactivate your account and restore full access to your profile, family tree, and connections.
                        </p>
                    </div>

                    <div className="info-box">
                        <h3>What will happen:</h3>
                        <ul>
                            <li>Your profile will be restored to normal status</li>
                            <li>You'll be able to send and receive messages</li>
                            <li>Your family tree and connections will be accessible again</li>
                            <li>Any memorial messages will be preserved in your activity log</li>
                        </ul>
                    </div>

                    <div className="action-section">
                        <button
                            className="reactivate-button"
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Reactivating...' : 'Reactivate My Account'}
                        </button>
                    </div>

                    <p className="note">
                        This verification link is valid for 24 hours. If you didn't request this, please ignore this page.
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
