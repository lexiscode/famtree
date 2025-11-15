import { useCallback, useState, PropsWithChildren } from 'react';
import { router } from '@inertiajs/react';
import { Copy, Eye, EyeOff, CheckCircle, Home, ArrowLeft } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ModalProvider } from '@/Context/ModalContext';
import CTAModal from '@/Components/Modal/CTAModal';
import { useModal } from '@/Context/ModalContext';

interface Child {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    username: string;
}

interface Props {
    child: Child;
    temporaryPassword: string;
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

export default function ChildCredentials({ child, temporaryPassword }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopyToClipboard = useCallback((text: string, fieldName: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        });
    }, []);

    const handleContinue = useCallback(() => {
        router.get(route('child-accounts.index'));
    }, []);

    return (
        <ModalProvider>
            <ChildAccountsLayout>
                <div className="child-accounts-page">
                    <div className="child-accounts-container">
                        {/* Back Button */}
                        <button
                            onClick={handleContinue}
                            className="child-back-button"
                        >
                            <ArrowLeft size={20} />
                            Back to Child Accounts
                        </button>

                        {/* Success Container */}
                        <div className="child-credentials-container">
                            {/* Success Header */}
                            <div className="child-credentials-header">
                                <div className="child-credentials-success-icon">
                                    <CheckCircle size={48} />
                                </div>
                                <h1 className="child-credentials-title">Account Created Successfully!</h1>
                                <p className="child-credentials-subtitle">
                                    Here are the login credentials for {child.full_name}
                                </p>
                            </div>

                            {/* Next Steps Box */}
                            <div className="child-credentials-success-box">
                                <CheckCircle size={20} />
                                <div>
                                    <div className="child-credentials-box-title">Next Steps:</div>
                                    <ul className="child-credentials-list">
                                        <li>Save these credentials in a secure location</li>
                                        <li>Share the username and password with your child</li>
                                        <li>Your child should change the password after first login</li>
                                        <li>At age 18, they can set their own email address</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Credentials Section */}
                            <div className="child-credentials-inputs">
                                {/* Username */}
                                <div className="child-create-form-group">
                                    <label className="child-create-label">Username</label>
                                    <div className="child-credentials-input-wrapper">
                                        <input
                                            type="text"
                                            value={child.username}
                                            readOnly
                                            className="child-create-input"
                                        />
                                        <button
                                            onClick={() => handleCopyToClipboard(child.username, 'username')}
                                            className="child-credentials-copy-btn"
                                            title="Copy username"
                                        >
                                            {copiedField === 'username' ? (
                                                <CheckCircle size={18} />
                                            ) : (
                                                <Copy size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Temporary Password */}
                                <div className="child-create-form-group">
                                    <label className="child-create-label">Temporary Password</label>
                                    <div className="child-credentials-input-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={temporaryPassword}
                                            readOnly
                                            className="child-create-input"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="child-credentials-toggle-btn"
                                            title={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleCopyToClipboard(temporaryPassword, 'password')}
                                            className="child-credentials-copy-btn"
                                            title="Copy password"
                                        >
                                            {copiedField === 'password' ? (
                                                <CheckCircle size={18} />
                                            ) : (
                                                <Copy size={18} />
                                            )}
                                        </button>
                                    </div>
                                    <div className="child-create-help">
                                        Share this temporary password with {child.first_name}. They should change it on first login.
                                    </div>
                                </div>
                            </div>

                            {/* Warning Box */}
                            <div className="child-credentials-warning-box">
                                <div>
                                    <div className="child-credentials-warning-title">Important:</div>
                                    <ul className="child-credentials-warning-list">
                                        <li>This temporary password can only be viewed once</li>
                                        <li>If you lose it, you'll need to create a new account</li>
                                        <li>Keep this information secure and private</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Account Details Box */}
                            <div className="child-credentials-details-box">
                                <div className="child-credentials-details-title">Child Account Details:</div>
                                <div className="child-credentials-details-content">
                                    <div className="child-credentials-detail-item">
                                        <span className="child-credentials-detail-label">Name:</span>
                                        <span className="child-credentials-detail-value">{child.full_name}</span>
                                    </div>
                                    <div className="child-credentials-detail-item">
                                        <span className="child-credentials-detail-label">Account Type:</span>
                                        <span className="child-credentials-detail-value">Child Account (requires parental oversight)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="child-create-actions">
                                <button
                                    onClick={handleContinue}
                                    className="child-create-btn-submit"
                                    style={{ width: '100%' }}
                                >
                                    <Home size={18} />
                                    Back to Child Accounts
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ChildAccountsLayout>
        </ModalProvider>
    );
}
