interface Props {
    value: 'female' | 'male';
    onChange: (track: 'female' | 'male') => void;
}

export default function GenderTrackToggle({ value, onChange }: Props) {
    return (
        <div className="gender-toggle">
            <button
                className={value === 'female' ? 'active' : ''}
                onClick={() => onChange('female')}
            >
                Female
            </button>
            <button
                className={value === 'male' ? 'active' : ''}
                onClick={() => onChange('male')}
            >
                Male
            </button>
        </div>
    );
}
