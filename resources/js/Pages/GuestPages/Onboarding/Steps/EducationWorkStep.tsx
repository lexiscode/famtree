import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';

interface EducationWorkStepProps {
    onComplete: (progress: any) => void;
    data: Record<string, any> | null | undefined;
}

export default function EducationWorkStep({ onComplete, data }: EducationWorkStepProps) {
    const [formData, setFormData] = useState({
        education_level: data?.education_level || '',
        current_occupation: data?.current_occupation || '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const educationLevels = [
        { value: 'high_school', label: 'High School' },
        { value: 'associates', label: "Associate's Degree" },
        { value: 'bachelors', label: "Bachelor's Degree" },
        { value: 'masters', label: "Master's Degree" },
        { value: 'phd', label: 'PhD' },
        { value: 'other', label: 'Other' },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(route('onboarding.save.education-work'), formData, {
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
        <div className="education-work-step">
            <h3 className="h4 mb-4 fw-bold">Tell us about your background</h3>

            <form onSubmit={handleSubmit}>
                {/* Education Level */}
                <div className="mb-4">
                    <label htmlFor="education_level" className="form-label fw-semibold">
                        Education Level (Optional)
                    </label>
                    <select
                        className="form-select"
                        id="education_level"
                        name="education_level"
                        value={formData.education_level}
                        onChange={handleChange}
                        disabled={isSubmitting}
                    >
                        <option value="">Select education level</option>
                        {educationLevels.map(level => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Current Occupation */}
                <div className="mb-4">
                    <label htmlFor="current_occupation" className="form-label fw-semibold">
                        Current Occupation (Optional)
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="current_occupation"
                        name="current_occupation"
                        value={formData.current_occupation}
                        onChange={handleChange}
                        placeholder="e.g., Software Engineer, Teacher, etc."
                        disabled={isSubmitting}
                    />
                </div>

                {/* Submit Button */}
                <div className="mt-5">
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                />
                                Saving...
                            </>
                        ) : (
                            'Continue'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
