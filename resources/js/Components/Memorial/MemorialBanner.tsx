import React from 'react';
import './Memorial.css';

interface Props {
    firstName: string;
    lastName: string;
    deathDate?: string | null;
    memorializedAt?: string | null;
}

export default function MemorialBanner({ firstName, lastName, deathDate, memorializedAt }: Props) {
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return null;
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return null;
        }
    };

    const formattedDeathDate = formatDate(deathDate);
    const formattedMemorialDate = formatDate(memorializedAt);

    return (
        <div className="memorial-banner">
            <div className="memorial-candle">🕯️</div>
            <div className="memorial-content">
                <h2 className="memorial-title">In Loving Memory</h2>
                <p className="memorial-name">{firstName} {lastName}</p>
                {formattedDeathDate && (
                    <p className="memorial-date">{formattedDeathDate}</p>
                )}
                <p className="memorial-message">
                    Their memory lives on through the stories and connections shared here.
                </p>
            </div>
            <div className="memorial-candle">🕯️</div>
        </div>
    );
}
