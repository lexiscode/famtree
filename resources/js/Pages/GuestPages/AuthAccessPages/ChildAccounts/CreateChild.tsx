import { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { ArrowLeft, Info, Lightbulb } from 'lucide-react';

interface Props {
    parentName: string;
}

export default function CreateChild({ parentName }: Props) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        date_of_birth: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setLoading(true);
            setErrors({});

            router.post(route('child-accounts.store'), formData, {
                onSuccess: () => {
                    setLoading(false);
                },
                onError: (errors) => {
                    setLoading(false);
                    setErrors(errors as Record<string, string>);
                },
            });
        },
        [formData]
    );

    const handleCancel = useCallback(() => {
        router.get(route('child-accounts.index'));
    }, []);

    const isFormValid = formData.first_name.trim() && formData.last_name.trim() && formData.username.trim() && formData.date_of_birth;

    return (
        <GuestLayout>
            <div className="child-accounts-page">
                <div className="container-lg" style={{ maxWidth: '700px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Back Button */}
                    <button
                        onClick={handleCancel}
                        className="child-back-btn"
                    >
                        <ArrowLeft size={18} />
                        Back to Child Accounts
                    </button>

                    {/* Form Container */}
                    <div className="child-form-container">
                        <h1 className="child-form-title">Create Child Account</h1>
                        <p className="child-form-subtitle">Set up a new account for a family member under 18</p>

                        <form onSubmit={handleSubmit}>
                            {/* Info Box */}
                            <div className="child-info-alert" style={{ marginBottom: '2rem' }}>
                                <Info size={20} />
                                <div>
                                    <strong>Creating an account as {parentName}</strong>. A temporary password will be generated and shown after creation.
                                </div>
                            </div>

                            {/* First Name */}
                            <div className="child-form-group">
                                <label className="child-form-label">First Name *</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    className="child-form-input"
                                    placeholder="e.g., John"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.first_name && (
                                    <div className="child-error-alert">{errors.first_name}</div>
                                )}
                            </div>

                            {/* Last Name */}
                            <div className="child-form-group">
                                <label className="child-form-label">Last Name *</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    className="child-form-input"
                                    placeholder="e.g., Smith"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.last_name && (
                                    <div className="child-error-alert">{errors.last_name}</div>
                                )}
                            </div>

                            {/* Username */}
                            <div className="child-form-group">
                                <label className="child-form-label">Username *</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="child-form-input"
                                    placeholder="e.g., john_smith"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.username && (
                                    <div className="child-error-alert">{errors.username}</div>
                                )}
                                <div className="child-form-help">Must be unique and at least 3 characters long</div>
                            </div>

                            {/* Date of Birth */}
                            <div className="child-form-group">
                                <label className="child-form-label">Date of Birth *</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    className="child-form-input"
                                    value={formData.date_of_birth}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.date_of_birth && (
                                    <div className="child-error-alert">{errors.date_of_birth}</div>
                                )}
                                <div className="child-form-help">Child must be under 18 years old</div>
                            </div>

                            {/* Tips Box */}
                            <div className="child-tips-alert">
                                <Lightbulb size={22} />
                                <div>
                                    <div className="child-alert-title">After creating the account:</div>
                                    <ul className="child-alert-list">
                                        <li>You'll receive a temporary password</li>
                                        <li>Share the username and temporary password with your child</li>
                                        <li>They can log in and change their password</li>
                                        <li>At 18, they can set their own email address</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="child-form-actions">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="child-form-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="child-form-submit"
                                    disabled={loading || !isFormValid}
                                >
                                    {loading ? 'Creating Account...' : 'Create Child Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
