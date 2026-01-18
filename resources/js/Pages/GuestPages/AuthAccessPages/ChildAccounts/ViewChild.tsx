import { useCallback, PropsWithChildren } from 'react';
import { router, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Mail, Shield, User, TreePine } from 'lucide-react';
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
    email?: string | null;
    date_of_birth: string;
    age?: number | null;
    profile_image_url?: string;
    status: string;
    parent_user_id?: number;
}

interface Props {
    child: Child;
}

// Child Accounts Layout (no header/footer)
function ChildAccountsLayout({ children }: PropsWithChildren) {
    const { isCtaModalOpen, ctaModalTab, closeCtaModal } = useModal();

    return (
        <div className="child-accounts-layout">
            {/* Floating Home Logo - Top Left */}
            <Link href="/" className="auth-floating-home-logo" title="Go to Home">
                <TreePine size={24} />
            </Link>

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

export default function ViewChild({ child }: Props) {
    const handleGoBack = useCallback(() => {
        router.visit(route('child-accounts.index'));
    }, []);

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }, []);

    const canComeOfAge = child.age !== null && child.age >= 18;

    return (
        <ModalProvider>
            <ChildAccountsLayout>
                <div className="child-accounts-page">
                    <div className="child-accounts-container">
                        {/* Back Button */}
                        <button
                            onClick={handleGoBack}
                            className="child-back-button"
                        >
                            <ArrowLeft size={20} />
                            Back to Child Accounts
                        </button>

                        {/* View Child Container */}
                        <div className="child-view-container">
                            {/* Header with Avatar */}
                            <div className="child-view-header">
                                <div className="child-view-avatar">
                                    {child.profile_image_url ? (
                                        <img
                                            src={child.profile_image_url}
                                            alt={child.full_name}
                                            className="child-view-avatar-image"
                                        />
                                    ) : (
                                        <div className="child-view-avatar-fallback">
                                            {child.first_name.charAt(0)}{child.last_name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="child-view-header-info">
                                    <h1 className="child-view-title">{child.full_name}</h1>
                                    <p className="child-view-username">@{child.username}</p>
                                    <div className="child-view-status-badge">
                                        <Shield size={14} />
                                        Child Account
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="child-view-stats">
                                <div className="child-view-stat-item">
                                    <div className="child-view-stat-label">Current Age</div>
                                    <div className="child-view-stat-value">
                                        {child.age !== null ? `${child.age} years` : 'Unknown'}
                                    </div>
                                </div>
                                <div className="child-view-stat-item">
                                    <div className="child-view-stat-label">Email Status</div>
                                    <div className="child-view-stat-value">
                                        {child.email ? 'Set' : 'Not Set'}
                                    </div>
                                </div>
                            </div>

                            {/* Account Information Card */}
                            <div className="child-view-section">
                                <h2 className="child-view-section-title">
                                    <User size={20} />
                                    Account Information
                                </h2>
                                <div className="child-view-fields">
                                    <div className="child-view-field">
                                        <div className="child-view-field-label">First Name</div>
                                        <div className="child-view-field-value">{child.first_name}</div>
                                    </div>
                                    <div className="child-view-field">
                                        <div className="child-view-field-label">Last Name</div>
                                        <div className="child-view-field-value">{child.last_name}</div>
                                    </div>
                                    <div className="child-view-field">
                                        <div className="child-view-field-label">Username</div>
                                        <div className="child-view-field-value">{child.username}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Birth & Age Information */}
                            <div className="child-view-section">
                                <h2 className="child-view-section-title">
                                    <Calendar size={20} />
                                    Birth & Age Information
                                </h2>
                                <div className="child-view-fields">
                                    <div className="child-view-field">
                                        <div className="child-view-field-label">Date of Birth</div>
                                        <div className="child-view-field-value">
                                            {formatDate(child.date_of_birth)}
                                        </div>
                                    </div>
                                    <div className="child-view-field">
                                        <div className="child-view-field-label">Current Age</div>
                                        <div className="child-view-field-value">
                                            {child.age !== null ? `${child.age} years old` : 'Unknown'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Email Information */}
                            <div className="child-view-section">
                                <h2 className="child-view-section-title">
                                    <Mail size={20} />
                                    Email Information
                                </h2>
                                {child.email ? (
                                    <div className="child-view-fields">
                                        <div className="child-view-field">
                                            <div className="child-view-field-label">Email Address</div>
                                            <div className="child-view-field-value">{child.email}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="child-view-info-box">
                                        <Mail size={18} />
                                        <div>
                                            <div className="child-view-info-title">Email Not Set</div>
                                            <p className="child-view-info-text">
                                                Your child can set their email address once they turn 18 years old.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Age Eligibility Notice */}
                            {canComeOfAge && (
                                <div className="child-view-coming-of-age-box">
                                    <Shield size={20} />
                                    <div>
                                        <div className="child-view-coming-of-age-title">Ready for Email Setup</div>
                                        <p className="child-view-coming-of-age-text">
                                            Your child has reached 18 years old and can now set up their own email address. They can do this the next time they log in.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Account Status Information */}
                            <div className="child-view-section">
                                <h2 className="child-view-section-title">
                                    <Shield size={20} />
                                    Account Status
                                </h2>
                                <div className="child-view-fields">
                                    <div className="child-view-field">
                                        <div className="child-view-field-label">Status</div>
                                        <div className="child-view-field-value">
                                            <span className="child-view-status-indicator">
                                                {child.status === 'alive' ? '✓ Alive' : '🕊️ Deceased'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="child-view-field">
                                        <div className="child-view-field-label">Account Type</div>
                                        <div className="child-view-field-value">Child Account</div>
                                    </div>
                                </div>
                            </div>

                            {/* Information Box */}
                            <div className="child-view-information-box">
                                <Shield size={18} />
                                <div>
                                    <div className="child-view-info-title">About Child Accounts</div>
                                    <ul className="child-view-info-list">
                                        <li>Child accounts require parental oversight and control</li>
                                        <li>You can view and manage account information at any time</li>
                                        <li>When they turn 18, they gain full control of their account</li>
                                        <li>Email setup becomes available once they reach age 18</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleGoBack}
                                className="child-view-back-btn"
                            >
                                <ArrowLeft size={18} />
                                Back to Child Accounts
                            </button>
                        </div>
                    </div>
                </div>
            </ChildAccountsLayout>
        </ModalProvider>
    );
}
