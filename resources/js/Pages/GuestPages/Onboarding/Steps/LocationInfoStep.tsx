import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, MapPin, Globe } from 'lucide-react';

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
            <h3>Where are you from?</h3>
            <p>Share your location to help find family members in your area and communities.</p>

            <form onSubmit={handleSubmit}>
                {/* Country - Most Important */}
                <div className="form-group">
                    <label htmlFor="country" className="form-label">
                        Country <span className="required">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Globe
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
                            className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="United States"
                            disabled={isSubmitting}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                    {errors.country && (
                        <div className="error-message">
                            <AlertCircle size={16} />
                            {errors.country}
                        </div>
                    )}
                </div>

                {/* State/Province and City Row */}
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="state_province" className="form-label">
                                State/Province
                            </label>
                            <div style={{ position: 'relative' }}>
                                <MapPin
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
                                    id="state_province"
                                    name="state_province"
                                    value={formData.state_province}
                                    onChange={handleChange}
                                    placeholder="New York"
                                    disabled={isSubmitting}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="city" className="form-label">
                                City
                            </label>
                            <div style={{ position: 'relative' }}>
                                <MapPin
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
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="New York"
                                    disabled={isSubmitting}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="form-group">
                    <label htmlFor="address" className="form-label">
                        Street Address
                    </label>
                    <div style={{ position: 'relative' }}>
                        <MapPin
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
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="123 Main Street"
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
