import { Heart, Skull } from 'lucide-react';

interface StatusBadgeProps {
    status: 'alive' | 'deceased';
    deathDate?: string | null;
    compact?: boolean;
    onClick?: () => void;
    clickable?: boolean;
}

export default function StatusBadge({
    status,
    deathDate,
    compact = false,
    onClick,
    clickable = false,
}: StatusBadgeProps) {
    const isAlive = status === 'alive';

    const formatDeathDate = (dateStr: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const handleClick = () => {
        if (clickable && onClick) {
            onClick();
        }
    };

    return (
        <div
            className={`status-badge ${isAlive ? 'status-badge-alive' : 'status-badge-deceased'} ${clickable ? 'cursor-pointer' : ''}`}
            onClick={handleClick}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={(e) => {
                if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                    handleClick();
                }
            }}
        >
            <span className="status-badge-icon">
                {isAlive ? (
                    <Heart size={compact ? 14 : 16} fill="currentColor" />
                ) : (
                    <Skull size={compact ? 14 : 16} />
                )}
            </span>
            <span>{isAlive ? 'Alive' : 'Deceased'}</span>
            {!isAlive && deathDate && (
                <span style={{ fontSize: compact ? '0.65rem' : '0.75rem', opacity: 0.8 }}>
                    ({formatDeathDate(deathDate)})
                </span>
            )}
        </div>
    );
}
