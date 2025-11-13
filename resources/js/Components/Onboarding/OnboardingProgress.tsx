import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface OnboardingProgressProps {
    completedCount: number;
    totalCount: number;
    progressPercentage: number;
}

const steps = [
    { name: 'Basic Info', id: 'basic_info' },
    { name: 'Family Status', id: 'family_status' },
    { name: 'Location', id: 'location_info' },
    { name: 'Education', id: 'education_work' },
    { name: 'Siblings', id: 'siblings_search' },
    { name: 'Complete', id: 'complete' },
];

export default function OnboardingProgress({
    completedCount,
    totalCount,
    progressPercentage,
}: OnboardingProgressProps) {
    return (
        <div className="onboarding-progress">
            {/* Progress Bar */}
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">Progress</span>
                    <span className="text-muted">{completedCount} of {totalCount}</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                    <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${progressPercentage}%` }}
                        aria-valuenow={Math.round(progressPercentage)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    />
                </div>
            </div>

            {/* Step Indicators */}
            <div className="step-indicators mt-4">
                <div className="d-flex justify-content-between align-items-center">
                    {steps.map((step, index) => (
                        <div key={step.id} className="text-center flex-grow-1 position-relative">
                            <div className="mb-2">
                                {index < completedCount ? (
                                    <div
                                        className="d-inline-flex align-items-center justify-content-center"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            backgroundColor: '#10B981',
                                        }}
                                    >
                                        <CheckCircle size={20} className="text-white" />
                                    </div>
                                ) : (
                                    <div
                                        className="d-inline-flex align-items-center justify-content-center"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            backgroundColor: index < completedCount ? '#10B981' : '#e5e7eb',
                                            border: index === completedCount ? '2px solid #0052E8' : 'none',
                                        }}
                                    >
                                        <span className={index < completedCount ? 'text-white' : 'text-muted'}>
                                            {index + 1}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="small text-muted mb-0">{step.name}</p>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '18px',
                                        left: '50%',
                                        width: 'calc(100% - 36px)',
                                        height: '2px',
                                        backgroundColor: index < completedCount ? '#10B981' : '#e5e7eb',
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
