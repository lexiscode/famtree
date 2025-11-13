import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

interface BasicInfoStepProps {
    onComplete: (progress: any) => void;
    data: Record<string, any> | null | undefined;
}

export default function BasicInfoStep({ onComplete, data }: BasicInfoStepProps) {
    const [formData, setFormData] = useState({
        first_name: data?.first_name || '',
        last_name: data?.last_name || '',
        bio: data?.bio || '',
        date_of_birth: data?.date_of_birth || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
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

        router.post(route('onboarding.save.basic-info'), formData, {
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
        <div className="basic-info-step">
            <h3 className="h4 mb-4 fw-bold">Let's start with your basic information</h3>

            <form onSubmit={handleSubmit}>
                {/* First Name */}
                <div className="mb-4">
                    <label htmlFor="first_name" className="form-label fw-semibold">
                        First Name *
                    </label>
                    <input
                        type="text"
                        className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="John"
                        disabled={isSubmitting}
                    />
                    {errors.first_name && (
                        <div className="invalid-feedback d-block mt-2">
                            <AlertCircle size={16} className="me-1" style={{ display: 'inline' }} />
                            {errors.first_name}
                        </div>
                    )}
                </div>

                {/* Last Name */}
                <div className="mb-4">
                    <label htmlFor="last_name" className="form-label fw-semibold">
                        Last Name *
                    </label>
                    <input
                        type="text"
                        className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Doe"
                        disabled={isSubmitting}
                    />
                    {errors.last_name && (
                        <div className="invalid-feedback d-block mt-2">
                            <AlertCircle size={16} className="me-1" style={{ display: 'inline' }} />
                            {errors.last_name}
                        </div>
                    )}
                </div>

                {/* Date of Birth */}
                <div className="mb-4">
                    <label htmlFor="date_of_birth" className="form-label fw-semibold">
                        Date of Birth
                    </label>
                    <input
                        type="date"
                        className="form-control"
                        id="date_of_birth"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Bio */}
                <div className="mb-4">
                    <label htmlFor="bio" className="form-label fw-semibold">
                        About You (Optional)
                    </label>
                    <textarea
                        className="form-control"
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us a bit about yourself..."
                        rows={3}
                        maxLength={500}
                        disabled={isSubmitting}
                    />
                    <small className="text-muted d-block mt-1">
                        {formData.bio.length}/500 characters
                    </small>
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
