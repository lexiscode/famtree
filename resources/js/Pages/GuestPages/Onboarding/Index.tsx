import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import OnboardingProgress from '@/Components/Onboarding/OnboardingProgress';
import BasicInfoStep from './Steps/BasicInfoStep';
import FamilyStatusStep from './Steps/FamilyStatusStep';
import LocationInfoStep from './Steps/LocationInfoStep';
import ProfileImageStep from './Steps/ProfileImageStep';
import EducationWorkStep from './Steps/EducationWorkStep';
import SiblingsSearchStep from './Steps/SiblingsSearchStep';
import CompleteStep from './Steps/CompleteStep';

interface OnboardingData {
    user: {
        id: number;
        first_name: string;
        last_name: string;
        bio: string | null;
        date_of_birth: string | null;
        address: string | null;
    };
    steps: Array<{
        name: string;
        completed: boolean;
        data: Record<string, any> | null;
    }>;
    family_info: any;
    progress: {
        current_step: string;
        completed_count: number;
        total_count: number;
        progress_percentage: number;
        is_complete: boolean;
    };
}

interface Props {
    onboarding: OnboardingData;
    progress: any;
}

export default function OnboardingIndex({ onboarding, progress }: Props) {
    const [currentStep, setCurrentStep] = useState<string>(onboarding?.progress?.current_step || 'basic_info');
    const [progressData, setProgressData] = useState(onboarding?.progress || {});

    const handleStepComplete = (newProgress: any) => {
        setProgressData(newProgress);

        // Navigate to the next incomplete step returned from the server
        if (newProgress && newProgress.current_step) {
            setCurrentStep(newProgress.current_step);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 'basic_info':
                return <BasicInfoStep onComplete={handleStepComplete} data={onboarding.steps.find(s => s.name === 'basic_info')?.data} user={onboarding.user} />;
            case 'family_status':
                return <FamilyStatusStep onComplete={handleStepComplete} data={onboarding.steps.find(s => s.name === 'family_status')?.data} />;
            case 'location_info':
                return <LocationInfoStep onComplete={handleStepComplete} data={onboarding.steps.find(s => s.name === 'location_info')?.data} />;
            case 'profile_image':
                return <ProfileImageStep onComplete={handleStepComplete} data={onboarding.steps.find(s => s.name === 'profile_image')?.data} />;
            case 'education_work':
                return <EducationWorkStep onComplete={handleStepComplete} data={onboarding.steps.find(s => s.name === 'education_work')?.data} />;
            case 'siblings_search':
                return <SiblingsSearchStep onComplete={handleStepComplete} data={onboarding.steps.find(s => s.name === 'siblings_search')?.data} />;
            case 'complete':
                return <CompleteStep onComplete={handleStepComplete} />;
            default:
                return <BasicInfoStep onComplete={handleStepComplete} data={null} user={onboarding.user} />;
        }
    };

    return (
        <AuthAccessLayout>
            <div className="onboarding-container">
                <div className="onboarding-wrapper">
                    {/* Header */}
                    <div className="onboarding-header">
                        <h1>
                            Welcome to <span className="brand-text">FamTree</span>
                        </h1>
                        <p>Complete these steps to set up your profile and start exploring your family connections.</p>
                    </div>

                    {/* Progress Bar */}
                    <OnboardingProgress
                        completedCount={progressData.completed_count || 0}
                        totalCount={progressData.total_count || 0}
                        progressPercentage={progressData.progress_percentage || 0}
                    />

                    {/* Steps Container */}
                    <div className="onboarding-card">
                        <div className="step-content">
                            {renderStep()}
                        </div>
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
