import React from 'react';
import { CheckCircle } from 'lucide-react';

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
            {/* Progress Bar with Info */}
            <div className="progress-bar-container">
                <div className="progress-info">
                    <span className="progress-info-label">Your Progress</span>
                    <span className="progress-info-percentage">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-bar-fill"
                        role="progressbar"
                        style={{ width: `${progressPercentage}%` }}
                        aria-valuenow={Math.round(progressPercentage)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    />
                </div>
            </div>

            {/* Step Indicators */}
            <div className="step-indicators">
                {steps.map((step, index) => {
                    const isCompleted = index < completedCount;
                    const isActive = index === completedCount;
                    const isPending = index > completedCount;

                    return (
                        <div
                            key={step.id}
                            className={`step-indicator ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                        >
                            <div className="step-circle">
                                {isCompleted ? (
                                    <CheckCircle size={22} fill="currentColor" />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>
                            <div className="step-label">{step.name}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
