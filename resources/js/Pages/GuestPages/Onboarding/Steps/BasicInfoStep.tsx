import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, User, Calendar, Phone } from 'lucide-react';

interface BasicInfoStepProps {
    onComplete: (progress: any) => void;
    data: Record<string, any> | null | undefined;
    user?: {
        id: number;
        first_name: string;
        last_name: string;
        bio: string | null;
        date_of_birth: string | null;
        address: string | null;
        phone: string | null;
    };
}

export default function BasicInfoStep({ onComplete, data, user }: BasicInfoStepProps) {
    const [formData, setFormData] = useState({
        first_name: data?.first_name || user?.first_name || '',
        last_name: data?.last_name || user?.last_name || '',
        phone: data?.phone || user?.phone || '',
        bio: data?.bio || user?.bio || '',
        date_of_birth: data?.date_of_birth || user?.date_of_birth || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            <h3>Let's start with your basic information</h3>
            <p>This helps us personalize your FamTree experience and connect you with family members.</p>
            {user && (
                <div style={{
                    backgroundColor: 'rgba(0, 212, 255, 0.08)',
                    borderLeft: '4px solid rgba(0, 212, 255, 0.5)',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    fontSize: '0.875rem',
                    color: '#555',
                }}>
                    Your name has been pre-filled from your registration. Feel free to update if needed.
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Name Row */}
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="first_name" className="form-label">
                                First Name <span className="required">*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User
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
                                    className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="John"
                                    disabled={isSubmitting}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                            {errors.first_name && (
                                <div className="error-message">
                                    <AlertCircle size={16} />
                                    {errors.first_name}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="last_name" className="form-label">
                                Last Name <span className="required">*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User
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
                                    className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    disabled={isSubmitting}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                            {errors.last_name && (
                                <div className="error-message">
                                    <AlertCircle size={16} />
                                    {errors.last_name}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Phone Number */}
                <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                        Phone Number
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Phone
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
                            type="tel"
                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 000-0000"
                            disabled={isSubmitting}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                    {errors.phone && (
                        <div className="error-message">
                            <AlertCircle size={16} />
                            {errors.phone}
                        </div>
                    )}
                </div>

                {/* Date of Birth */}
                <div className="form-group">
                    <label htmlFor="date_of_birth" className="form-label">
                        Date of Birth
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Calendar
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
                            type="date"
                            className="form-control"
                            id="date_of_birth"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>

                {/* Bio */}
                <div className="form-group">
                    <label htmlFor="bio" className="form-label">
                        About You
                    </label>
                    <textarea
                        className="form-control"
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us a bit about yourself... (Optional)"
                        rows={4}
                        maxLength={500}
                        disabled={isSubmitting}
                        style={{ paddingTop: '12px' }}
                    />
                    <div className="char-count">
                        {formData.bio.length}/500 characters
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
