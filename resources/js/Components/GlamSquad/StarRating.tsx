import { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
    value: number;
    onChange: (stars: number) => void;
    size?: number;
    readonly?: boolean;
}

export default function StarRating({ value, onChange, size = 28, readonly = false }: Props) {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={`star ${star <= value ? 'active' : ''} ${star <= hovered ? 'hovered' : ''}`}
                    fill={star <= (hovered || value) ? 'currentColor' : 'none'}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    onClick={() => !readonly && onChange(star)}
                    style={{ cursor: readonly ? 'default' : 'pointer' }}
                />
            ))}
        </div>
    );
}
