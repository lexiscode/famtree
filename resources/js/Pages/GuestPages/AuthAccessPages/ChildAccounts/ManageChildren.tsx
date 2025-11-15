import { useCallback, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Plus, Calendar, Lock, Shield, Eye, Trash2, ArrowLeft } from 'lucide-react';
import { PropsWithChildren } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ModalProvider } from '@/Context/ModalContext';
import CTAModal from '@/Components/Modal/CTAModal';
import { useModal } from '@/Context/ModalContext';

interface ChildAccount {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    username: string;
    email?: string;
    date_of_birth: string;
    profile_image_url?: string;
    status: string;
    age?: number;
    created_at: string;
}

interface Props {
    childAccounts: ChildAccount[];
    childCount: number;
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

export default function ManageChildren({ childAccounts, childCount }: Props) {
    const { props } = usePage();
    const { auth } = props;
    const user = auth?.user;

    const [loading, setLoading] = useState(false);

    const handleDeleteChild = useCallback((childId: number, childName: string) => {
        if (confirm(`Are you sure you want to delete ${childName}'s account? This action cannot be undone.`)) {
            setLoading(true);
            router.delete(route('child-accounts.destroy', { childId }), {
                onSuccess: () => setLoading(false),
                onError: () => setLoading(false),
            });
        }
    }, []);

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }, []);

    const comingOfAgeCount = childAccounts.filter(c => c.age && c.age >= 18).length;
    const awaitingEmailCount = childAccounts.filter(c => !c.email).length;

    return (
        <ModalProvider>
            <ChildAccountsLayout>
                <div className="child-accounts-page">
                    <div className="child-accounts-container">
                        {/* Back Button */}
                        <button
                            onClick={() => router.visit(route('dashboard'))}
                            className="child-back-button"
                        >
                            <ArrowLeft size={20} />
                            Back to Dashboard
                        </button>

                        {/* Header */}
                        <div className="child-header-section">
                            <div className="child-header-content">
                                <div>
                                    <h1 className="child-page-title">Child Accounts</h1>
                                    <p className="child-page-subtitle">Create and manage child accounts for family members</p>
                                </div>
                                <Link href={route('child-accounts.create')} className="child-create-btn">
                                    <Plus size={18} />
                                    Create Child Account
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="child-stats-grid">
                                <div className="child-stat-box">
                                    <div className="child-stat-value">{childCount}</div>
                                    <div className="child-stat-label">Total Children</div>
                                </div>
                                <div className="child-stat-box">
                                    <div className="child-stat-value">{comingOfAgeCount}</div>
                                    <div className="child-stat-label">Coming of Age</div>
                                </div>
                                <div className="child-stat-box">
                                    <div className="child-stat-value">{awaitingEmailCount}</div>
                                    <div className="child-stat-label">Awaiting Email</div>
                                </div>
                            </div>
                        </div>

                        {/* Child Accounts Section */}
                        <div className="child-content-section">
                            <h2 className="child-section-heading">
                                <Shield size={24} />
                                Your Child Accounts
                            </h2>

                            {childAccounts.length === 0 ? (
                                <div className="child-empty-container">
                                    <div className="child-empty-icon">👶</div>
                                    <h3 className="child-empty-heading">No child accounts yet</h3>
                                    <p className="child-empty-description">
                                        Create child accounts for family members under 18. They can be upgraded when they come of age.
                                    </p>
                                    <Link href={route('child-accounts.create')} className="child-empty-btn">
                                        <Plus size={18} />
                                        Create Your First Child Account
                                    </Link>
                                </div>
                            ) : (
                                <div className="child-cards-grid">
                                    {childAccounts.map((child) => (
                                        <div key={child.id} className="child-card-item">
                                            {/* Profile Image */}
                                            <div className="child-card-avatar">
                                                {child.profile_image_url ? (
                                                    <img
                                                        src={child.profile_image_url}
                                                        alt={child.full_name}
                                                        className="child-card-image"
                                                    />
                                                ) : (
                                                    <div className="child-card-avatar-fallback">
                                                        {child.first_name.charAt(0)}{child.last_name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Child Info */}
                                            <div className="child-card-details">
                                                <h3 className="child-card-title">{child.full_name}</h3>
                                                <p className="child-card-username">@{child.username}</p>
                                            </div>

                                            {/* Age & Status Badges */}
                                            <div className="child-card-badges">
                                                {child.age !== undefined && (
                                                    <span className="child-badge-item">
                                                        {child.age} years old
                                                    </span>
                                                )}
                                                {child.email ? (
                                                    <span className="child-badge-item child-badge-success">
                                                        Email Set
                                                    </span>
                                                ) : (
                                                    <span className="child-badge-item child-badge-warning">
                                                        <Lock size={12} />
                                                        No Email
                                                    </span>
                                                )}
                                            </div>

                                            {/* Date of Birth */}
                                            <div className="child-card-date">
                                                <Calendar size={16} />
                                                {formatDate(child.date_of_birth)}
                                            </div>

                                            {/* Actions */}
                                            <div className="child-card-footer">
                                                <Link
                                                    href={route('child-accounts.show', { childId: child.id })}
                                                    className="child-btn-view"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteChild(child.id, child.full_name)}
                                                    disabled={loading}
                                                    className="child-btn-delete"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info Box */}
                        <div className="child-info-box">
                            <Shield size={20} />
                            <div>
                                <div className="child-info-title">About Child Accounts:</div>
                                <ul className="child-info-list">
                                    <li>Child accounts are for family members under 18 years old</li>
                                    <li>You control the account until your child turns 18</li>
                                    <li>At 18, they can set their own email and change password</li>
                                    <li>Child accounts are automatically connected as family relationships</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </ChildAccountsLayout>
        </ModalProvider>
    );
}
