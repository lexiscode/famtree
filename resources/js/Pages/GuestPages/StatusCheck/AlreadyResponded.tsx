import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import './StatusCheck.css';

interface Props {
    inactiveUser: {
        first_name: string;
        last_name: string;
    };
}

export default function AlreadyResponded({ inactiveUser }: Props) {
    return (
        <GuestLayout>
            <Head title="Already Responded" />

            <div className="status-check-page">
                <div className="status-check-container already-responded">
                    <div className="info-icon">ℹ️</div>
                    <h1>Already Responded</h1>
                    <p className="message">
                        You have already submitted your response about {inactiveUser.first_name} {inactiveUser.last_name}.
                    </p>
                    <p className="sub-message">
                        Thank you for your input. Only one response per family member is allowed to ensure fair and accurate results.
                    </p>
                    <div className="actions">
                        <Link href="/" className="home-button">
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
