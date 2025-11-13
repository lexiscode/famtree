import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

interface FamilyStatusStepProps {
    onComplete: (progress: any) => void;
    data: Record<string, any> | null | undefined;
}

export default function FamilyStatusStep({ onComplete, data }: FamilyStatusStepProps) {
    const [formData, setFormData] = useState({
        family_status: data?.family_status || '',
        number_of_siblings: data?.number_of_siblings || '',
        number_of_children: data?.number_of_children || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const familyStatuses = [
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.post(route('onboarding.save.family-status'), formData, {
            onSuccess: (page) => {
                setIsSubmitting(false);
                // @ts-ignore
                onComplete(page.props.progress);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setErrors(errors as Record<string, string>);
            },
        });
    };

    return (
        <div className="family-status-step">
            <h3 className="h4 mb-4 fw-bold">Tell us about your family</h3>

            <form onSubmit={handleSubmit}>
                {/* Family Status */}
                <div className="mb-4">
                    <label htmlFor="family_status" className="form-label fw-semibold">
                        Family Status *
                    </label>
                    <select
                        className={`form-select ${errors.family_status ? 'is-invalid' : ''}`}
                        id="family_status"
                        name="family_status"
                        value={formData.family_status}
                        onChange={handleChange}
                        disabled={isSubmitting}
                    >
                        <option value="">Select your family status</option>
                        {familyStatuses.map(status => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                    {errors.family_status && (
                        <div className="invalid-feedback d-block mt-2">
                            <AlertCircle size={16} className="me-1" style={{ display: 'inline' }} />
                            {errors.family_status}
                        </div>
                    )}
                </div>

                {/* Number of Siblings */}
                <div className="mb-4">
                    <label htmlFor="number_of_siblings" className="form-label fw-semibold">
                        Number of Siblings (Optional)
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="number_of_siblings"
                        name="number_of_siblings"
                        value={formData.number_of_siblings}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Number of Children */}
                <div className="mb-4">
                    <label htmlFor="number_of_children" className="form-label fw-semibold">
                        Number of Children (Optional)
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="number_of_children"
                        name="number_of_children"
                        value={formData.number_of_children}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Submit Button */}
                <div className="mt-5 d-flex gap-3">
                    <button
                        type="submit"
                        className="btn btn-primary flex-grow-1"
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
