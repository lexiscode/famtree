import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircle, Zap, Settings } from 'lucide-react';

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
        <div className="completion-screen">
            <div className="completion-icon">
                <CheckCircle size={60} fill="currentColor" />
            </div>

            <h3>You're all set! 🎉</h3>
            <p>
                Your profile has been successfully created. You can now start exploring your family tree,
                connecting with relatives, and building your genealogical records.
            </p>

            <div className="alert-tip">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <Zap size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#06B6D4' }} />
                    <div>
                        <strong>Quick tips to get started:</strong>
                        <ul style={{ marginTop: '0.5rem', marginBottom: '0', paddingLeft: '1.5rem' }}>
                            <li>Complete your profile picture to increase family matches</li>
                            <li>Invite family members to collaborate on your tree</li>
                            <li>Update your preferences in settings anytime</li>
                        </ul>
                    </div>
                </div>
            </div>

            <form onSubmit={handleComplete}>
                <button
                    type="submit"
                    className="btn btn-primary btn-full-width"
                    style={{ height: '56px', fontSize: '1.0625rem' }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            Setting up your account...
                        </>
                    ) : (
                        <>
                            <Zap size={20} style={{ marginRight: '0.5rem' }} />
                            Explore FamTree
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
