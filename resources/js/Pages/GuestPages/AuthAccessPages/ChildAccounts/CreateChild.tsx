import { useCallback, useState, PropsWithChildren } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Info, Lightbulb } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ModalProvider } from '@/Context/ModalContext';
import CTAModal from '@/Components/Modal/CTAModal';
import { useModal } from '@/Context/ModalContext';

interface Props {
    parentName: string;
}

// Child Accounts Layout (no header/footer)
function ChildAccountsLayout({ children }: PropsWithChildren) {
    const { isCtaModalOpen, ctaModalTab, closeCtaModal } = useModal();

    return (
        <div className="child-accounts-layout">
            <main className="child-accounts-main-content">
                {children}
            </main>
            <CTAModal
                isOpen={isCtaModalOpen}
                onClose={closeCtaModal}
                initialTab={ctaModalTab}
            />
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={true}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </div>
    );
}

export default function CreateChild({ parentName }: Props) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        date_of_birth: '',
        gender: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const isFormValid = formData.first_name.trim() && formData.last_name.trim() && formData.username.trim() && formData.date_of_birth && formData.gender;

    return (
        <ModalProvider>
            <ChildAccountsLayout>
                <div className="child-accounts-page">
                    <div className="child-accounts-container">
                        {/* Back Button */}
                        <button
                            onClick={handleCancel}
                            className="child-back-button"
                        >
                            <ArrowLeft size={20} />
                            Back to Child Accounts
                        </button>

                        {/* Form Container */}
                        <div className="child-create-form-container">
                            <div className="child-create-header">
                                <h1 className="child-create-title">Create Child Account</h1>
                                <p className="child-create-subtitle">Set up a new account for a family member under 18</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Info Box */}
                                <div className="child-create-info-box">
                                    <Info size={20} />
                                    <div>
                                        <strong>Creating an account as {parentName}</strong>. A temporary password will be generated and shown after creation.
                                    </div>
                                </div>

                                {/* First Name */}
                                <div className="child-create-form-group">
                                    <label className="child-create-label">First Name *</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        className="child-create-input"
                                        placeholder="e.g., John"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.first_name && (
                                        <div className="child-create-error">{errors.first_name}</div>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div className="child-create-form-group">
                                    <label className="child-create-label">Last Name *</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        className="child-create-input"
                                        placeholder="e.g., Smith"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.last_name && (
                                        <div className="child-create-error">{errors.last_name}</div>
                                    )}
                                </div>

                                {/* Username */}
                                <div className="child-create-form-group">
                                    <label className="child-create-label">Username *</label>
                                    <input
                                        type="text"
                                        name="username"
                                        className="child-create-input"
                                        placeholder="e.g., john_smith"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.username && (
                                        <div className="child-create-error">{errors.username}</div>
                                    )}
                                    <div className="child-create-help">Must be unique and at least 3 characters long</div>
                                </div>

                                {/* Gender */}
                                <div className="child-create-form-group">
                                    <label className="child-create-label">Gender *</label>
                                    <select
                                        name="gender"
                                        className="child-create-input"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                    {errors.gender && (
                                        <div className="child-create-error">{errors.gender}</div>
                                    )}
                                </div>

                                {/* Date of Birth */}
                                <div className="child-create-form-group">
                                    <label className="child-create-label">Date of Birth *</label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        className="child-create-input"
                                        value={formData.date_of_birth}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.date_of_birth && (
                                        <div className="child-create-error">{errors.date_of_birth}</div>
                                    )}
                                    <div className="child-create-help">Child must be under 18 years old</div>
                                </div>

                                {/* Tips Box */}
                                <div className="child-create-tips-box">
                                    <Lightbulb size={22} />
                                    <div>
                                        <div className="child-create-tips-title">After creating the account:</div>
                                        <ul className="child-create-tips-list">
                                            <li>You'll receive a temporary password</li>
                                            <li>Share the username and temporary password with your child</li>
                                            <li>They can log in and change their password</li>
                                            <li>At 18, they can set their own email address</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="child-create-actions">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="child-create-btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="child-create-btn-submit"
                                        disabled={loading || !isFormValid}
                                    >
                                        {loading ? 'Creating Account...' : 'Create Child Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </ChildAccountsLayout>
        </ModalProvider>
    );
}
