import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { Users, Search } from 'lucide-react';

interface SiblingsSearchStepProps {
    onComplete: (progress: any) => void;
    data: Record<string, any> | null | undefined;
}

export default function SiblingsSearchStep({ onComplete, data }: SiblingsSearchStepProps) {
    const [formData, setFormData] = useState({
        searched: data?.searched ?? false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (shouldSearch: boolean) => {
        setIsSubmitting(true);

        router.post(route('onboarding.save.siblings-search'), { searched: shouldSearch }, {
            onSuccess: (page) => {
                setIsSubmitting(false);
                // @ts-ignore
                onComplete(page.props.progress);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <div className="siblings-search-step">
            <h3 className="h4 mb-4 fw-bold">Want to find your siblings?</h3>
            <p className="text-muted mb-5">
                FamTree can help you discover and connect with your siblings based on shared family information.
            </p>

            <div className="row gap-3">
                {/* Search Yes Option */}
                <div className="col-md-6">
                    <div
                        className="card border-0 shadow-sm cursor-pointer h-100"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSubmit(true)}
                    >
                        <div className="card-body text-center py-5">
                            <div className="mb-4">
                                <div
                                    className="d-inline-flex align-items-center justify-content-center"
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '12px',
                                        backgroundColor: '#0052E8',
                                    }}
                                >
                                    <Search size={32} className="text-white" />
                                </div>
                            </div>
                            <h5 className="card-title fw-semibold">Yes, find my siblings</h5>
                            <p className="card-text text-muted small">
                                Help us discover your siblings through our matching algorithm
                            </p>
                            <button
                                type="button"
                                className="btn btn-primary w-100 mt-4"
                                onClick={() => handleSubmit(true)}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        Processing...
                                    </>
                                ) : (
                                    'Continue'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Skip Option */}
                <div className="col-md-6">
                    <div
                        className="card border-0 shadow-sm cursor-pointer h-100"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSubmit(false)}
                    >
                        <div className="card-body text-center py-5">
                            <div className="mb-4">
                                <div
                                    className="d-inline-flex align-items-center justify-content-center"
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '12px',
                                        backgroundColor: '#e5e7eb',
                                    }}
                                >
                                    <Users size={32} className="text-muted" />
                                </div>
                            </div>
                            <h5 className="card-title fw-semibold">Skip for now</h5>
                            <p className="card-text text-muted small">
                                I'll explore this feature later
                            </p>
                            <button
                                type="button"
                                className="btn btn-outline-secondary w-100 mt-4"
                                onClick={() => handleSubmit(false)}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        Processing...
                                    </>
                                ) : (
                                    'Skip'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
