import { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { ArrowLeft, Info, AlertCircle, Lightbulb } from 'lucide-react';

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

    return (
        <GuestLayout>
            <div className="family-tree-page">
                <div className="family-tree-container">
                    {/* Back Button */}
                    <button
                        onClick={handleCancel}
                        style={{
                            marginBottom: '2rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            color: '#0052E8',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            transition: 'all 0.3s ease',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 82, 232, 0.08)';
                            e.currentTarget.style.transform = 'translateX(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.transform = 'none';
                        }}
                    >
                        <ArrowLeft size={18} />
                        Back to Child Accounts
                    </button>

                    {/* Form Container */}
                    <div className="tree-form-container">
                        <h1 className="tree-form-title">Create Child Account</h1>
                        <p className="tree-form-subtitle">Set up a new account for a family member under 18</p>

                        <form onSubmit={handleSubmit}>
                            {/* Info Box */}
                            <div style={{ background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(0, 82, 232, 0.05) 100%)', border: '2px solid rgba(0, 82, 232, 0.15)', borderRadius: '10px', padding: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                                <Info size={20} style={{ color: '#0052E8', marginTop: '0.1rem', flexShrink: 0 }} />
                                <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#1a1a1a' }}>
                                    <strong>Creating an account as {parentName}</strong>. A temporary password will be generated and shown after creation.
                                </div>
                            </div>

                            {/* First Name */}
                            <div className="tree-form-group">
                                <label className="tree-form-label">First Name *</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    className="tree-form-input"
                                    placeholder="e.g., John"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.first_name && <div className="tree-error-alert" style={{ marginTop: '0.65rem', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{errors.first_name}</div>}
                            </div>

                            {/* Last Name */}
                            <div className="tree-form-group">
                                <label className="tree-form-label">Last Name *</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    className="tree-form-input"
                                    placeholder="e.g., Smith"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.last_name && <div className="tree-error-alert" style={{ marginTop: '0.65rem', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{errors.last_name}</div>}
                            </div>

                            {/* Username */}
                            <div className="tree-form-group">
                                <label className="tree-form-label">Username *</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="tree-form-input"
                                    placeholder="e.g., john_smith"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.username && <div className="tree-error-alert" style={{ marginTop: '0.65rem', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{errors.username}</div>}
                                <div className="tree-form-help">Must be unique and at least 3 characters long</div>
                            </div>

                            {/* Date of Birth */}
                            <div className="tree-form-group">
                                <label className="tree-form-label">Date of Birth *</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    className="tree-form-input"
                                    value={formData.date_of_birth}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.date_of_birth && <div className="tree-error-alert" style={{ marginTop: '0.65rem', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{errors.date_of_birth}</div>}
                                <div className="tree-form-help">Child must be under 18 years old</div>
                            </div>

                            {/* Tips Box */}
                            <div style={{ background: 'rgba(0, 82, 232, 0.08)', border: '2px solid rgba(0, 82, 232, 0.15)', borderRadius: '10px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                                <Lightbulb size={22} style={{ color: '#0052E8', marginTop: '0.1rem', flexShrink: 0 }} />
                                <div style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#1a1a1a' }}>
                                    <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>After creating the account:</div>
                                    <ul style={{ margin: 0, paddingLeft: '1.4rem' }}>
                                        <li style={{ marginBottom: '0.4rem' }}>You'll receive a temporary password</li>
                                        <li style={{ marginBottom: '0.4rem' }}>Share the username and temporary password with your child</li>
                                        <li style={{ marginBottom: '0.4rem' }}>They can log in and change their password</li>
                                        <li>At 18, they can set their own email address</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="tree-form-actions">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="tree-form-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="tree-form-submit"
                                    disabled={loading || !formData.first_name.trim() || !formData.last_name.trim() || !formData.username.trim() || !formData.date_of_birth}
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
