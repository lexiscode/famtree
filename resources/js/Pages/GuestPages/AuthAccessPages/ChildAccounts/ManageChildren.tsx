import { useCallback, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Plus, Users, Edit, Trash2, Calendar, Lock, Zap, ArrowRight, Shield } from 'lucide-react';

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
            // In real implementation, this would call the delete endpoint
            // router.delete(route('child-accounts.destroy', { childId }));
        }
    }, []);

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }, []);

    return (
        <GuestLayout>
            <div className="family-tree-page">
                <div className="family-tree-container">
                    {/* Header */}
                    <div className="tree-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1 }}>
                                <h1 style={{ margin: '0 0 0.5rem 0', fontFamily: "'Playfair Display', serif", fontSize: '2.25rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                                    Child Accounts
                                </h1>
                                <p style={{ margin: 0, color: '#6C757D', fontSize: '1rem', lineHeight: 1.6 }}>
                                    Create and manage child accounts for family members
                                </p>
                            </div>
                            <Link href={route('child-accounts.create')} className="tree-action-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                <Plus size={18} />
                                Create Child Account
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="tree-stats" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #E9ECEF' }}>
                            <div className="tree-stat">
                                <div className="tree-stat-value">{childCount}</div>
                                <div className="tree-stat-label">Total Children</div>
                            </div>
                            <div className="tree-stat">
                                <div className="tree-stat-value">{childAccounts.filter(c => c.age && c.age >= 18).length}</div>
                                <div className="tree-stat-label">Coming of Age</div>
                            </div>
                            <div className="tree-stat">
                                <div className="tree-stat-value">{childAccounts.filter(c => !c.email).length}</div>
                                <div className="tree-stat-label">Awaiting Email</div>
                            </div>
                        </div>
                    </div>

                    {/* Child Accounts Grid */}
                    <div className="tree-visualization-wrapper" style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1.5rem 0', color: '#1a1a1a', fontSize: '1.5rem', fontWeight: 800 }}>
                            <Shield size={24} style={{ color: '#0052E8' }} />
                            Your Child Accounts
                        </h2>

                        {childAccounts.length === 0 ? (
                            <div className="tree-empty-state">
                                <div className="tree-empty-icon">👶</div>
                                <h3 className="tree-empty-title">No child accounts yet</h3>
                                <p className="tree-empty-text">
                                    Create child accounts for family members under 18. They can be upgraded when they come of age.
                                </p>
                                <Link href={route('child-accounts.create')} className="tree-empty-action" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                                    <Plus size={18} />
                                    Create Child Account
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.75rem' }}>
                                {childAccounts.map((child) => (
                                    <div key={child.id} style={{ background: '#FFFFFF', border: '2px solid #E9ECEF', borderRadius: '14px', padding: '1.75rem', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }} className="tree-member-card">
                                        {/* Profile Image */}
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                            {child.profile_image_url ? (
                                                <img src={child.profile_image_url} alt={child.full_name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #0052E8', boxShadow: '0 6px 20px rgba(0, 82, 232, 0.25)' }} />
                                            ) : (
                                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #0052E8, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 'bold', border: '4px solid #0052E8', boxShadow: '0 6px 20px rgba(0, 82, 232, 0.25)' }}>
                                                    {child.first_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Child Info */}
                                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 0.3rem 0' }}>
                                                {child.full_name}
                                            </h3>
                                            <p style={{ fontSize: '0.85rem', color: '#6C757D', margin: 0, fontWeight: 600 }}>
                                                @{child.username}
                                            </p>
                                        </div>

                                        {/* Age & Status */}
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            {child.age !== undefined && (
                                                <div style={{ background: 'rgba(0, 82, 232, 0.1)', color: '#0052E8', padding: '0.35rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', border: '1px solid rgba(0, 82, 232, 0.2)' }}>
                                                    {child.age} years old
                                                </div>
                                            )}
                                            {child.email ? (
                                                <div style={{ background: 'rgba(0, 217, 127, 0.1)', color: '#00D97F', padding: '0.35rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', border: '1px solid rgba(0, 217, 127, 0.2)' }}>
                                                    Email Set
                                                </div>
                                            ) : (
                                                <div style={{ background: 'rgba(255, 71, 87, 0.1)', color: '#FF4757', padding: '0.35rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', border: '1px solid rgba(255, 71, 87, 0.2)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <Lock size={12} />
                                                    No Email
                                                </div>
                                            )}
                                        </div>

                                        {/* Date of Birth */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#F8F9FA', borderRadius: '8px', marginBottom: '1rem', color: '#6C757D', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <Calendar size={16} style={{ color: '#0052E8' }} />
                                            {formatDate(child.date_of_birth)}
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '1rem', borderTop: '1px solid #E9ECEF' }}>
                                            <Link href={route('child-accounts.show', { childId: child.id })} style={{ flex: 1, padding: '0.65rem 0.75rem', background: 'rgba(0, 82, 232, 0.1)', color: '#0052E8', border: '1px solid #0052E8', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', textDecoration: 'none', textAlign: 'center', display: 'inline-block' }}>
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteChild(child.id, child.full_name)}
                                                disabled={loading}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.65rem 0.75rem',
                                                    background: 'rgba(255, 71, 87, 0.1)',
                                                    color: '#FF4757',
                                                    border: '1px solid #FF4757',
                                                    borderRadius: '8px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    cursor: loading ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    opacity: loading ? 0.6 : 1,
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(0, 82, 232, 0.08) 0%, rgba(0, 212, 255, 0.05) 100%)', border: '2px solid rgba(0, 82, 232, 0.15)', borderRadius: '14px', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                        <Shield size={20} style={{ color: '#0052E8', marginTop: '0.1rem', flexShrink: 0 }} />
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#1a1a1a' }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>About Child Accounts:</div>
                            <ul style={{ margin: 0, paddingLeft: '1.4rem', fontSize: '0.85rem' }}>
                                <li style={{ marginBottom: '0.3rem' }}>Child accounts are for family members under 18 years old</li>
                                <li style={{ marginBottom: '0.3rem' }}>You control the account until your child turns 18</li>
                                <li style={{ marginBottom: '0.3rem' }}>At 18, they can set their own email and change password</li>
                                <li>Child accounts are automatically connected as family relationships</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
