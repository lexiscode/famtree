import { useCallback, useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Users, Plus, Edit, Trash2, Download, Share2, Lock, Globe, Home, CheckCircle, XCircle, Network, Shield, Crown } from 'lucide-react';
import TreeConnectionManager from '@/Components/FamilyTree/TreeConnectionManager';
import './MyFamilyTree.css';

interface Admin {
    id: number;
    name: string;
    role: 'creator' | 'co_admin';
    granted_at: string;
}

interface TreeMember {
    id: number;
    name: string;
    nuclear_family_role?: 'spouse' | 'child' | 'extended' | 'merged' | null;
    can_add_members: boolean;
    added_at: string;
}

interface TreeConnection {
    id: number;
    requester_tree_id: number;
    recipient_tree_id: number;
    status: 'pending' | 'accepted' | 'declined';
    requested_at: string;
    accepted_at?: string;
    message?: string;
    requester_tree?: {
        id: number;
        tree_name: string;
    };
    recipient_tree?: {
        id: number;
        tree_name: string;
    };
    requested_by?: {
        id: number;
        first_name: string;
        last_name: string;
    };
}

interface TreeData {
    id: number;
    name: string;
    description?: string;
    is_public: boolean;
    is_nuclear_family: boolean;
    created_at: string;
}

interface Props {
    tree: TreeData;
    admins: Admin[];
    members: TreeMember[];
    pendingRequests: TreeConnection[];
    sentRequests: TreeConnection[];
    isAdmin: boolean;
    isMember: boolean;
    canAddMembers: boolean;
}

export default function MyFamilyTree({ tree, admins, members, pendingRequests, sentRequests, isAdmin, isMember, canAddMembers }: Props) {
    const { props } = usePage();
    const { auth } = props;
    const user = auth?.user;

    const [loading, setLoading] = useState(false);

    const handleRemoveMember = useCallback(
        (memberId: number, memberName: string) => {
            if (confirm(`Are you sure you want to remove ${memberName} from the tree?`)) {
                setLoading(true);
                router.delete(
                    route('family-tree.remove-member', { treeId: tree.id, userId: memberId }),
                    {
                        onSuccess: () => {
                            setLoading(false);
                        },
                        onError: () => {
                            setLoading(false);
                        },
                    }
                );
            }
        },
        [tree.id]
    );

    const handleDeleteTree = useCallback(() => {
        if (confirm('Are you sure you want to delete this entire family tree? This action cannot be undone.')) {
            setLoading(true);
            router.delete(route('family-tree.destroy', { treeId: tree.id }), {
                onSuccess: () => {
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                },
            });
        }
    }, [tree.id]);

    const handleExportTree = useCallback(() => {
        const data = {
            tree: tree,
            admins: admins,
            members: members,
        };
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
        element.setAttribute('download', `${tree.name.replace(/\s+/g, '_')}_${new Date().getTime()}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }, [tree, admins, members]);

    return (
        <AuthAccessLayout>
            <div className="family-tree-page">
                <div className="family-tree-container">
                    {/* Premium Header */}
                    <div className="tree-header">
                        <div className="tree-header-top">
                            <div className="tree-title-section">
                                <h1>{tree.name}</h1>
                                {tree.description && <p>{tree.description}</p>}
                            </div>
                            <div className="tree-badges">
                                {tree.is_public ? (
                                    <div className="tree-badge public">
                                        <Globe size={16} />
                                        Public
                                    </div>
                                ) : (
                                    <div className="tree-badge private">
                                        <Lock size={16} />
                                        Private
                                    </div>
                                )}
                                {isAdmin && (
                                    <div className="tree-badge owner">
                                        <Shield size={16} />
                                        Admin
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isAdmin && (
                            <div className="tree-header-actions">
                                <Link href={route('family-tree.edit', { treeId: tree.id })} className="tree-action-btn secondary">
                                    <Edit size={18} />
                                    Edit
                                </Link>
                                <button className="tree-action-btn secondary" onClick={handleExportTree}>
                                    <Download size={18} />
                                    Export
                                </button>
                                <button className="tree-action-btn danger" onClick={handleDeleteTree} disabled={loading}>
                                    <Trash2 size={18} />
                                    Delete
                                </button>
                            </div>
                        )}

                        {/* Statistics Grid */}
                        <div className="tree-stats">
                            <div className="tree-stat">
                                <div className="tree-stat-value">{members.length}</div>
                                <div className="tree-stat-label">Total Members</div>
                            </div>
                            <div className="tree-stat">
                                <div className="tree-stat-value">{admins.length}</div>
                                <div className="tree-stat-label">Admins</div>
                            </div>
                            <div className="tree-stat">
                                <div className="tree-stat-value">{new Date(tree.created_at).getFullYear()}</div>
                                <div className="tree-stat-label">Created</div>
                            </div>
                            <div className="tree-stat">
                                <div className="tree-stat-value">{admins.find(a => a.role === 'creator')?.name?.split(' ')[0] || 'Unknown'}</div>
                                <div className="tree-stat-label">Creator</div>
                            </div>
                        </div>
                    </div>

                    {/* Admins Section */}
                    <div className="tree-visualization-wrapper">
                        <h2>
                            <Shield size={24} />
                            Tree Administrators
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {admins.map((admin) => (
                                <div key={admin.id} style={{ background: 'linear-gradient(135deg, #F0F6FF 0%, rgba(0, 212, 255, 0.05) 100%)', borderRadius: '12px', border: '1px solid rgba(0, 82, 232, 0.1)', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: admin.role === 'creator' ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'linear-gradient(135deg, #0052E8, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            {admin.role === 'creator' ? <Crown size={20} /> : <Shield size={20} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1a1a1a' }}>{admin.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6C757D', marginTop: '0.2rem', textTransform: 'capitalize' }}>
                                                {admin.role === 'creator' ? 'Creator' : 'Co-Admin'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                                        Granted: {new Date(admin.granted_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Members Grid */}
                    <div className="tree-visualization-wrapper">
                        <h2>
                            <Users size={24} />
                            Family Members
                        </h2>

                        {members.length === 0 ? (
                            <div className="tree-empty-state">
                                <div className="tree-empty-icon">👥</div>
                                <h3 className="tree-empty-title">No members in your tree</h3>
                                <p className="tree-empty-text">Start building your family tree by inviting members or adding connections.</p>
                                {isAdmin && (
                                    <Link href={route('family-tree.index')} className="tree-empty-action">
                                        <Plus size={18} />
                                        Back to Trees
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="tree-members-container">
                                {members.map((member) => (
                                    <div key={member.id} className="tree-member-card">
                                        <div className="tree-member-avatar" style={{ background: 'linear-gradient(135deg, #0052E8, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'white', fontWeight: 'bold' }}>
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="tree-member-name">{member.name}</div>

                                        {member.nuclear_family_role && (
                                            <div className="tree-member-relation" style={{
                                                background: member.nuclear_family_role === 'spouse' ? 'rgba(236, 72, 153, 0.1)' :
                                                            member.nuclear_family_role === 'child' ? 'rgba(59, 130, 246, 0.1)' :
                                                            member.nuclear_family_role === 'merged' ? 'rgba(16, 185, 129, 0.1)' :
                                                            'rgba(156, 163, 175, 0.1)',
                                                color: member.nuclear_family_role === 'spouse' ? '#ec4899' :
                                                       member.nuclear_family_role === 'child' ? '#3b82f6' :
                                                       member.nuclear_family_role === 'merged' ? '#10b981' :
                                                       '#6b7280',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '6px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                textTransform: 'capitalize',
                                                marginTop: '0.5rem'
                                            }}>
                                                {member.nuclear_family_role}
                                            </div>
                                        )}

                                        {member.can_add_members && (
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#10b981',
                                                marginTop: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                justifyContent: 'center'
                                            }}>
                                                <CheckCircle size={14} />
                                                Can add members
                                            </div>
                                        )}

                                        {isAdmin && member.id !== user?.id && (
                                            <div className="tree-member-action">
                                                <Link href={route('profile.view', { userId: member.id })} className="tree-member-action-btn">
                                                    View Profile
                                                </Link>
                                                <button className="tree-member-action-btn danger" onClick={() => handleRemoveMember(member.id, member.name)} disabled={loading}>
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                        {!isAdmin && member.id !== user?.id && (
                                            <div className="tree-member-action">
                                                <Link href={route('profile.view', { userId: member.id })} className="tree-member-action-btn" style={{ flex: 1 }}>
                                                    View Profile
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tree Connection Manager */}
                    <TreeConnectionManager
                        treeId={tree.id}
                        treeName={tree.name}
                        pendingRequests={pendingRequests}
                        sentRequests={sentRequests}
                        acceptedConnections={[]}
                        isAdmin={isAdmin}
                    />
                </div>
            </div>
        </AuthAccessLayout>
    );
}
