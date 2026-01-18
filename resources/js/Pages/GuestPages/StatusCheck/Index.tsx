import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import './StatusCheck.css';

interface Props {
    verification: {
        uuid: string;
    };
    inactiveUser: {
        first_name: string;
        last_name: string;
        profile_image_url: string | null;
    };
}

export default function StatusCheck({ verification, inactiveUser }: Props) {
    const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!selectedResponse) return;

        setIsSubmitting(true);
        router.post(
            `/status-check/${verification.uuid}`,
            { response: selectedResponse },
            {
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const fullName = `${inactiveUser.first_name} ${inactiveUser.last_name}`;

    return (
        <GuestLayout>
            <Head title="Status Check" />

            <div className="status-check-page">
                <div className="status-check-container">
                    <div className="status-check-header">
                        <div className="user-avatar">
                            {inactiveUser.profile_image_url ? (
                                <img
                                    src={inactiveUser.profile_image_url}
                                    alt={fullName}
                                    className="avatar-image"
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    {inactiveUser.first_name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <h1>A Gentle Check-In</h1>
                        <p className="subtitle">About {fullName}</p>
                    </div>

                    <div className="status-check-content">
                        <div className="message-box">
                            <p>
                                We've noticed that <strong>{fullName}</strong> hasn't been active on FamTree for quite some time.
                            </p>
                            <p>
                                As a close family member, we wanted to gently check in with you to understand if everything is okay with {inactiveUser.first_name}.
                            </p>
                            <p className="note">
                                We understand this might be a sensitive topic. Your response will help us ensure that {inactiveUser.first_name}'s account is handled appropriately.
                            </p>
                        </div>

                        <div className="response-options">
                            <h3>Please select the most appropriate response:</h3>

                            <div className="options-grid">
                                <button
                                    className={`option-card ${selectedResponse === 'alive' ? 'selected alive' : ''}`}
                                    onClick={() => setSelectedResponse('alive')}
                                >
                                    <div className="option-icon">✓</div>
                                    <div className="option-title">They're doing well</div>
                                    <div className="option-desc">
                                        {inactiveUser.first_name} is alive and well, just not using FamTree
                                    </div>
                                </button>

                                <button
                                    className={`option-card ${selectedResponse === 'deceased' ? 'selected deceased' : ''}`}
                                    onClick={() => setSelectedResponse('deceased')}
                                >
                                    <div className="option-icon">🕯️</div>
                                    <div className="option-title">They have passed away</div>
                                    <div className="option-desc">
                                        {inactiveUser.first_name} has unfortunately passed away
                                    </div>
                                </button>

                                <button
                                    className={`option-card ${selectedResponse === 'unknown' ? 'selected unknown' : ''}`}
                                    onClick={() => setSelectedResponse('unknown')}
                                >
                                    <div className="option-icon">?</div>
                                    <div className="option-title">I'm not sure</div>
                                    <div className="option-desc">
                                        I don't have current information about {inactiveUser.first_name}
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="submit-section">
                            <button
                                className="submit-button"
                                onClick={handleSubmit}
                                disabled={!selectedResponse || isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Response'}
                            </button>
                            <p className="privacy-note">
                                Your response is confidential and will only be used to determine the appropriate action for this account.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
