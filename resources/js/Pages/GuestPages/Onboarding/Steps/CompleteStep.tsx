import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';

interface CompleteStepProps {
    onComplete: (progress: any) => void;
}

export default function CompleteStep({ onComplete }: CompleteStepProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(route('onboarding.complete'), {}, {
            onSuccess: (page) => {
                setIsSubmitting(false);
                // @ts-ignore
                onComplete(page.props.progress);
                // Redirect to dashboard after a brief delay
                setTimeout(() => {
                    router.visit(route('home'));
                }, 1500);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <div className="complete-step text-center">
            <div className="mb-5">
                <div
                    className="d-inline-flex align-items-center justify-content-center"
                    style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        backgroundColor: '#D1FAE5',
                    }}
                >
                    <CheckCircle size={60} style={{ color: '#10B981' }} />
                </div>
            </div>

            <h3 className="h3 fw-bold mb-3">You're all set!</h3>
            <p className="text-muted mb-5 fs-5">
                Your profile has been successfully created. You can now start exploring your family tree,
                connecting with relatives, and building your genealogical records.
            </p>

            <div className="alert alert-info mb-5" role="alert">
                <p className="mb-0">
                    💡 <strong>Tip:</strong> You can update your profile information at any time in your account settings.
                </p>
            </div>

            <form onSubmit={handleComplete}>
                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                            />
                            Setting up your account...
                        </>
                    ) : (
                        'Go to Dashboard'
                    )}
                </button>
            </form>
        </div>
    );
}
