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

export default function ThankYou({ inactiveUser }: Props) {
    return (
        <GuestLayout>
            <Head title="Thank You" />

            <div className="status-check-page">
                <div className="status-check-container thank-you">
                    <div className="thank-you-icon">🙏</div>
                    <h1>Thank You</h1>
                    <p className="message">
                        We appreciate you taking the time to respond about {inactiveUser.first_name} {inactiveUser.last_name}.
                    </p>
                    <p className="sub-message">
                        Your response has been recorded and will help us handle their account appropriately and with care.
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
