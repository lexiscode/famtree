import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import './Memorial.css';

interface Props {
    scheduledDate?: string | null;
}

export default function StatusChangePendingBanner({ scheduledDate }: Props) {
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = () => {
        if (!confirm('Are you sure you want to cancel the scheduled status change?')) {
            return;
        }

        setIsCancelling(true);
        router.post('/cancel-status-change', {}, {
            onFinish: () => setIsCancelling(false),
        });
    };

    const formattedDate = scheduledDate
        ? new Date(scheduledDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : null;

    const daysRemaining = scheduledDate
        ? Math.max(0, Math.ceil((new Date(scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

    return (
        <div className="status-pending-banner">
            <div className="banner-icon">⚠️</div>
            <div className="banner-content">
                <h3>Important Notice About Your Account</h3>
                <p>
                    Your account is scheduled to be converted to a memorial profile
                    {formattedDate && <> on <strong>{formattedDate}</strong></>}
                    {daysRemaining !== null && daysRemaining > 0 && (
                        <> ({daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining)</>
                    )}.
                </p>
                <p className="sub-text">
                    If this is a mistake, please click the button below to cancel this action.
                </p>
                <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="cancel-button"
                >
                    {isCancelling ? 'Cancelling...' : 'Cancel Status Change'}
                </button>
            </div>
        </div>
    );
}
