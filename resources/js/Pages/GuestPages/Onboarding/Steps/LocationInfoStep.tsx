import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

interface LocationInfoStepProps {
    onComplete: (progress: any) => void;
    data: Record<string, any> | null | undefined;
}

export default function LocationInfoStep({ onComplete, data }: LocationInfoStepProps) {
    const [formData, setFormData] = useState({
        address: data?.address || '',
        city: data?.city || '',
        state_province: data?.state_province || '',
        country: data?.country || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        router.post(route('onboarding.save.location-info'), formData, {
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
        <div className="location-info-step">
            <h3 className="h4 mb-4 fw-bold">Where are you from?</h3>

            <form onSubmit={handleSubmit}>
                {/* Address */}
                <div className="mb-4">
                    <label htmlFor="address" className="form-label fw-semibold">
                        Address (Optional)
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Main Street"
                        disabled={isSubmitting}
                    />
                </div>

                {/* City */}
                <div className="mb-4">
                    <label htmlFor="city" className="form-label fw-semibold">
                        City (Optional)
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="New York"
                        disabled={isSubmitting}
                    />
                </div>

                {/* State/Province */}
                <div className="mb-4">
                    <label htmlFor="state_province" className="form-label fw-semibold">
                        State/Province (Optional)
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="state_province"
                        name="state_province"
                        value={formData.state_province}
                        onChange={handleChange}
                        placeholder="New York"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Country */}
                <div className="mb-4">
                    <label htmlFor="country" className="form-label fw-semibold">
                        Country *
                    </label>
                    <input
                        type="text"
                        className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="United States"
                        disabled={isSubmitting}
                    />
                    {errors.country && (
                        <div className="invalid-feedback d-block mt-2">
                            <AlertCircle size={16} className="me-1" style={{ display: 'inline' }} />
                            {errors.country}
                        </div>
                    )}
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
