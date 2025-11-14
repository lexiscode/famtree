import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, Heart, Users } from 'lucide-react';

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
        { value: 'single', label: 'Single', icon: '💫' },
        { value: 'married', label: 'Married', icon: '💕' },
        { value: 'divorced', label: 'Divorced', icon: '🤝' },
        { value: 'widowed', label: 'Widowed', icon: '🕊️' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: '❓' },
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
            <h3>Tell us about your family</h3>
            <p>This helps us understand your family structure and find connections.</p>

            <form onSubmit={handleSubmit}>
                {/* Family Status */}
                <div className="form-group">
                    <label htmlFor="family_status" className="form-label">
                        Current Family Status <span className="required">*</span>
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
                                {status.icon} {status.label}
                            </option>
                        ))}
                    </select>
                    {errors.family_status && (
                        <div className="error-message">
                            <AlertCircle size={16} />
                            {errors.family_status}
                        </div>
                    )}
                </div>

                {/* Numbers Row */}
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="number_of_siblings" className="form-label">
                                Number of Siblings
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Users
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
                                    type="number"
                                    className="form-control"
                                    id="number_of_siblings"
                                    name="number_of_siblings"
                                    value={formData.number_of_siblings}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="0"
                                    disabled={isSubmitting}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="number_of_children" className="form-label">
                                Number of Children
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Heart
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
                                    type="number"
                                    className="form-control"
                                    id="number_of_children"
                                    name="number_of_children"
                                    value={formData.number_of_children}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="0"
                                    disabled={isSubmitting}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
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
