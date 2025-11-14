import { useCallback, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Plus, Calendar, Lock, Shield, Eye, Trash2 } from 'lucide-react';

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
        <GuestLayout>
            <div className="child-accounts-page">
                <div className="container-lg" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Header */}
                    <div className="child-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                            <div>
                                <h1 className="child-header-title">Child Accounts</h1>
                                <p className="child-header-subtitle">Create and manage child accounts for family members</p>
                            </div>
                            <Link href={route('child-accounts.create')} className="child-action-btn">
                                <Plus size={18} />
                                Create Child Account
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="child-stats">
                            <div className="child-stat-card">
                                <div className="child-stat-value">{childCount}</div>
                                <div className="child-stat-label">Total Children</div>
                            </div>
                            <div className="child-stat-card">
                                <div className="child-stat-value">{comingOfAgeCount}</div>
                                <div className="child-stat-label">Coming of Age</div>
                            </div>
                            <div className="child-stat-card">
                                <div className="child-stat-value">{awaitingEmailCount}</div>
                                <div className="child-stat-label">Awaiting Email</div>
                            </div>
                        </div>
                    </div>

                    {/* Child Accounts Section */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 className="child-section-title">
                            <Shield size={24} />
                            Your Child Accounts
                        </h2>

                        {childAccounts.length === 0 ? (
                            <div className="child-empty-state">
                                <div className="child-empty-icon">👶</div>
                                <h3 className="child-empty-title">No child accounts yet</h3>
                                <p className="child-empty-text">
                                    Create child accounts for family members under 18. They can be upgraded when they come of age.
                                </p>
                                <Link href={route('child-accounts.create')} className="child-empty-action">
                                    <Plus size={18} />
                                    Create Your First Child Account
                                </Link>
                            </div>
                        ) : (
                            <div className="child-card-grid">
                                {childAccounts.map((child) => (
                                    <div key={child.id} className="child-card">
                                        {/* Profile Image */}
                                        <div className="child-avatar-container">
                                            {child.profile_image_url ? (
                                                <img
                                                    src={child.profile_image_url}
                                                    alt={child.full_name}
                                                    className="child-avatar"
                                                />
                                            ) : (
                                                <div className="child-avatar-fallback">
                                                    {child.first_name.charAt(0)}{child.last_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Child Info */}
                                        <div className="child-card-info">
                                            <h3 className="child-card-name">{child.full_name}</h3>
                                            <p className="child-card-username">@{child.username}</p>
                                        </div>

                                        {/* Age & Status Badges */}
                                        <div className="child-badge-container">
                                            {child.age !== undefined && (
                                                <span className="child-badge child-badge-age">
                                                    {child.age} years old
                                                </span>
                                            )}
                                            {child.email ? (
                                                <span className="child-badge child-badge-success">
                                                    Email Set
                                                </span>
                                            ) : (
                                                <span className="child-badge child-badge-danger">
                                                    <Lock size={12} />
                                                    No Email
                                                </span>
                                            )}
                                        </div>

                                        {/* Date of Birth */}
                                        <div className="child-card-dob">
                                            <Calendar size={16} />
                                            {formatDate(child.date_of_birth)}
                                        </div>

                                        {/* Actions */}
                                        <div className="child-card-actions">
                                            <Link
                                                href={route('child-accounts.show', { childId: child.id })}
                                                className="child-card-btn child-card-btn-primary"
                                            >
                                                <Eye size={16} />
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteChild(child.id, child.full_name)}
                                                disabled={loading}
                                                className="child-card-btn child-card-btn-danger"
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
                    <div className="child-info-alert">
                        <Shield size={20} />
                        <div>
                            <div className="child-alert-title">About Child Accounts:</div>
                            <ul className="child-alert-list">
                                <li>Child accounts are for family members under 18 years old</li>
                                <li>You control the account until your child turns 18</li>
                                <li>At 18, they can set their own email and change password</li>
                                <li>Child accounts are automatically connected as family relationships</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
