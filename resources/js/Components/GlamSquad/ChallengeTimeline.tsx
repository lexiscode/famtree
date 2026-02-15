interface Props {
    status: string;
}

const STEPS = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'submissions_open', label: 'Submissions' },
    { key: 'voting_open', label: 'Voting' },
    { key: 'completed', label: 'Results' },
];

export default function ChallengeTimeline({ status }: Props) {
    const currentIdx = STEPS.findIndex(s => s.key === status);

    return (
        <div className="challenge-timeline">
            {STEPS.map((step, idx) => (
                <div key={step.key} className="timeline-step">
                    {idx < STEPS.length - 1 && (
                        <div className={`step-line ${idx < currentIdx ? 'completed' : ''}`} />
                    )}
                    <div className={`step-dot ${idx === currentIdx ? 'active' : idx < currentIdx ? 'completed' : ''}`} />
                    <span className="step-label">{step.label}</span>
                </div>
            ))}
        </div>
    );
}
