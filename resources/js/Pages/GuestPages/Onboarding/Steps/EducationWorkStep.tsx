import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { BookOpen, Briefcase } from 'lucide-react';

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
        { value: 'high_school', label: '🎓 High School' },
        { value: 'associates', label: '📚 Associate\'s Degree' },
        { value: 'bachelors', label: '🎯 Bachelor\'s Degree' },
        { value: 'masters', label: '📖 Master\'s Degree' },
        { value: 'phd', label: '🏆 PhD' },
        { value: 'other', label: '✨ Other' },
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
            <h3>Tell us about your background</h3>
            <p>Share your educational and professional background to complete your profile.</p>

            <form onSubmit={handleSubmit}>
                {/* Education Level */}
                <div className="form-group">
                    <label htmlFor="education_level" className="form-label">
                        Education Level
                    </label>
                    <div style={{ position: 'relative' }}>
                        <BookOpen
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '12px',
                                top: '15px',
                                color: '#9CA3AF',
                                pointerEvents: 'none',
                                zIndex: 1
                            }}
                        />
                        <select
                            className="form-select"
                            id="education_level"
                            name="education_level"
                            value={formData.education_level}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            style={{ paddingLeft: '40px' }}
                        >
                            <option value="">Select education level</option>
                            {educationLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Current Occupation */}
                <div className="form-group">
                    <label htmlFor="current_occupation" className="form-label">
                        Current Occupation
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Briefcase
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '12px',
                                top: '15px',
                                color: '#9CA3AF',
                                pointerEvents: 'none'
                            }}
                        />
                        <input
                            type="text"
                            className="form-control"
                            id="current_occupation"
                            name="current_occupation"
                            value={formData.current_occupation}
                            onChange={handleChange}
                            placeholder="e.g., Software Engineer, Teacher, etc."
                            disabled={isSubmitting}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="btn-group">
                    <button
                        type="submit"
                        className="btn btn-primary btn-full-width"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                Saving...
                            </>
                        ) : (
                            'Continue to Next Step'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
