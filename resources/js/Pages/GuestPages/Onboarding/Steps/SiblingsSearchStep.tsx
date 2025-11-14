import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Users, Sparkles } from 'lucide-react';

interface SiblingsSearchStepProps {
    onComplete: (progress: any) => void;
    data: Record<string, any> | null | undefined;
}

export default function SiblingsSearchStep({ onComplete, data }: SiblingsSearchStepProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedOption, setSelectedOption] = useState<'search' | 'skip' | null>(null);

    const handleSubmit = async (shouldSearch: boolean) => {
        setIsSubmitting(true);
        setSelectedOption(shouldSearch ? 'search' : 'skip');

        router.post(route('onboarding.save.siblings-search'), { searched: shouldSearch }, {
            onSuccess: (page) => {
                setIsSubmitting(false);
                // @ts-ignore
                onComplete(page.props.progress);
            },
            onError: () => {
                setIsSubmitting(false);
                setSelectedOption(null);
            },
        });
    };

    return (
        <div className="siblings-search-step">
            <h3>Want to find your siblings?</h3>
            <p>FamTree uses advanced matching to help you discover and connect with your siblings based on shared family information.</p>

            <div className="choice-cards">
                {/* Search Yes Option */}
                <div className={`choice-card ${selectedOption === 'search' ? 'selected' : ''}`}>
                    <div className="choice-icon" style={{ backgroundColor: '#E3F2FD' }}>
                        <Sparkles size={28} style={{ color: '#0052E8' }} />
                    </div>
                    <h5 className="choice-title">Yes, find my siblings</h5>
                    <p className="choice-description">
                        Let us discover your siblings through our intelligent matching algorithm
                    </p>
                    <button
                        type="button"
                        className="btn btn-primary btn-full-width"
                        onClick={() => handleSubmit(true)}
                        disabled={isSubmitting}
                        style={{ marginTop: '1.25rem' }}
                    >
                        {isSubmitting && selectedOption === 'search' ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                Processing...
                            </>
                        ) : (
                            'Continue'
                        )}
                    </button>
                </div>

                {/* Skip Option */}
                <div className={`choice-card ${selectedOption === 'skip' ? 'selected' : ''}`}>
                    <div className="choice-icon" style={{ backgroundColor: '#F3E8FF' }}>
                        <Users size={28} style={{ color: '#7C3AED' }} />
                    </div>
                    <h5 className="choice-title">Skip for now</h5>
                    <p className="choice-description">
                        I'll explore this feature later and find siblings anytime
                    </p>
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-full-width"
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting}
                        style={{ marginTop: '1.25rem' }}
                    >
                        {isSubmitting && selectedOption === 'skip' ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                Processing...
                            </>
                        ) : (
                            'Skip'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
