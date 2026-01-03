import { useCallback, useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Users, Edit, Trash2, Lock, Globe, CheckCircle, Shield, Crown, TreePine, ArrowLeft, Copy, Check, X, AlertTriangle, UserPlus } from 'lucide-react';
import TreeConnectionManager from '@/Components/FamilyTree/TreeConnectionManager';
import ProfileSidebar from '../Stories/ProfileSidebar';
import { UserProfile } from '@/types';
import './MyFamilyTree.css';
import '../../../../../css/connections.css';

interface Admin {
    id: number;
    name: string;
    role: 'creator' | 'co_admin';
    granted_at: string;
}

interface TreeMember {
    id: number;
    name: string;
    profile_image_url?: string;
    nuclear_family_role?: 'spouse' | 'child' | 'extended' | 'merged' | null;
    can_add_members: boolean;
    added_at: string;
}

interface AvailableMember {
    user_id: number;
    name: string;
    profile_image_url?: string;
    role: 'spouse' | 'child';
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
    user: UserProfile;
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
    tree: TreeData;
    admins: Admin[];
    members: TreeMember[];
    pendingRequests: TreeConnection[];
    sentRequests: TreeConnection[];
    availableMembers: AvailableMember[];
    isAdmin: boolean;
    isMember: boolean;
    canAddMembers: boolean;
}

export default function MyFamilyTree({
    user,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
    tree,
    admins,
    members,
    pendingRequests,
    sentRequests,
    availableMembers,
    isAdmin,
    isMember,
    canAddMembers
}: Props) {
    const { props } = usePage();
    const { auth } = props;
    const authUser = auth?.user;

    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<{ id: number; name: string } | null>(null);

    const handleRemoveMember = useCallback(
        (memberId: number, memberName: string) => {
            setMemberToRemove({ id: memberId, name: memberName });
            setShowRemoveDialog(true);
        },
        []
    );

    const confirmRemoveMember = useCallback(() => {
        if (!memberToRemove) return;

        setLoading(true);
        setShowRemoveDialog(false);
        router.delete(
            route('family-tree.remove-member', { familyTree: tree.id, userId: memberToRemove.id }),
            {
                onSuccess: () => {
                    setLoading(false);
                    setMemberToRemove(null);
                },
                onError: () => {
                    setLoading(false);
                },
            }
        );
    }, [tree.id, memberToRemove]);

    const cancelRemoveMember = useCallback(() => {
        setShowRemoveDialog(false);
        setMemberToRemove(null);
    }, []);

    const handleDeleteTree = useCallback(() => {
        if (confirm('Are you sure you want to delete this entire family tree? This action cannot be undone.')) {
            setLoading(true);
            router.delete(route('family-tree.destroy', tree.id), {
                onSuccess: () => {
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                },
            });
        }
    }, [tree.id]);

    const handleCopyUUID = useCallback(() => {
        navigator.clipboard.writeText(tree.id).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [tree.id]);

    const handleAddMember = useCallback(
        (userId: number, memberName: string) => {
            setLoading(true);
            router.post(
                route('family-tree.add-member', { familyTree: tree.id }),
                { user_id: userId },
                {
                    onSuccess: () => {
                        setLoading(false);
                    },
                    onError: () => {
                        setLoading(false);
                    },
                }
            );
        },
        [tree.id]
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const creatorAdmin = admins.find((a) => a.role === 'creator');

    return (
        <AuthAccessLayout>
            <div className="connections-page">
                <div className="connections-grid-layout">
                {/* Left Sidebar - Profile */}
                {user && (
                    <div className="connections-left-sidebar">
                        <ProfileSidebar
                            user={user}
                            connectionCount={connectionCount}
                            pendingRequestCount={pendingRequestCount}
                            sentRequestCount={sentRequestCount}
                            unreadNotificationCount={unreadNotificationCount}
                        />
                    </div>
                )}

                {/* Center Content */}
                <div className="connections-center-content">
                    <div className="premium-family-tree-detail">
                {/* Animated Background */}
                <div className="detail-background">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                </div>

                <div className="detail-container">
                    {/* Back Button */}
                    <Link href={route('family-tree.index')} className="detail-back-button">
                        <ArrowLeft size={20} />
                        <span>Back to Trees</span>
                    </Link>

                    {/* Premium Header */}
                    <div className="premium-tree-header">
                        <div className="tree-header-main">
                            <div className="tree-title-group">
                                <div className="tree-icon-wrapper">
                                    <TreePine size={32} strokeWidth={2.5} />
                                </div>
                                <h1>{tree.name}</h1>
                                {tree.description && <p className="tree-description">{tree.description}</p>}
                            </div>

                            <div className="tree-meta-badges">
                                {tree.is_public ? (
                                    <div className="meta-badge public">
                                        <Globe size={16} />
                                        Public
                                    </div>
                                ) : (
                                    <div className="meta-badge private">
                                        <Lock size={16} />
                                        Private
                                    </div>
                                )}
                                {isAdmin && (
                                    <div className="meta-badge admin">
                                        <Shield size={16} />
                                        Admin
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isAdmin && (
                            <div className="tree-actions">
                                <Link href={route('family-tree.edit', tree.id)} className="action-btn secondary">
                                    <Edit size={18} />
                                    Edit Tree
                                </Link>
                                <button className="action-btn danger" onClick={handleDeleteTree} disabled={loading}>
                                    <Trash2 size={18} />
                                    Delete Tree
                                </button>
                            </div>
                        )}

                        {/* Stats Grid */}
                        <div className="tree-stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">{members.length}</div>
                                <div className="stat-label">Total Members</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{admins.length}</div>
                                <div className="stat-label">Administrators</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{new Date(tree.created_at).getFullYear()}</div>
                                <div className="stat-label">Created Year</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{creatorAdmin?.name?.split(' ')[0] || 'Unknown'}</div>
                                <div className="stat-label">Creator</div>
                            </div>
                        </div>

                        {/* Tree UUID Card */}
                        <div className="tree-uuid-card">
                            <div className="uuid-header">
                                <div className="uuid-icon">
                                    <TreePine size={20} />
                                </div>
                                <div className="uuid-content">
                                    <h4 className="uuid-title">Tree ID (UUID)</h4>
                                    <p className="uuid-subtitle">Share this ID to receive connection requests</p>
                                </div>
                            </div>
                            <div className="uuid-display-wrapper">
                                <div className="uuid-display">
                                    <code className="uuid-code">{tree.id}</code>
                                </div>
                                <button
                                    onClick={handleCopyUUID}
                                    className={`uuid-copy-btn ${copied ? 'copied' : ''}`}
                                    title="Copy UUID"
                                >
                                    {copied ? (
                                        <>
                                            <Check size={18} />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tree Administrators Section */}
                    <div className="premium-section">
                        <div className="section-header">
                            <div className="section-icon">
                                <Shield size={24} />
                            </div>
                            <div className="section-title">
                                <h2>Tree Administrators</h2>
                                <p>Manage and oversee this family tree</p>
                            </div>
                        </div>

                        <div className="admins-grid">
                            {admins.map((admin) => (
                                <div key={admin.id} className="admin-card">
                                    <div className="admin-info">
                                        <div className={`admin-avatar ${admin.role === 'creator' ? 'creator' : 'co-admin'}`}>
                                            {admin.role === 'creator' ? <Crown size={24} /> : <Shield size={24} />}
                                        </div>
                                        <div className="admin-details">
                                            <h3 className="admin-name">{admin.name}</h3>
                                            <p className="admin-role">{admin.role === 'creator' ? 'Tree Creator' : 'Co-Administrator'}</p>
                                        </div>
                                    </div>
                                    <div className="admin-granted">Granted: {formatDate(admin.granted_at)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Family Members Section */}
                    <div className="premium-section">
                        <div className="section-header">
                            <div className="section-icon">
                                <Users size={24} />
                            </div>
                            <div className="section-title">
                                <h2>Family Members</h2>
                                <p>{members.length} {members.length === 1 ? 'member' : 'members'} in this tree</p>
                            </div>
                        </div>

                        {members.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">👥</div>
                                <h3 className="empty-title">No Members Yet</h3>
                                <p className="empty-text">
                                    Start building your family tree by inviting members or adding connections.
                                </p>
                                {isAdmin && (
                                    <Link href={route('family-tree.index')} className="empty-action">
                                        <ArrowLeft size={18} />
                                        Back to Trees
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="members-grid">
                                {members.map((member) => (
                                    <div key={member.id} className="member-card">
                                        <div className="member-avatar">
                                            {member.profile_image_url ? (
                                                <img
                                                    src={member.profile_image_url}
                                                    alt={member.name}
                                                    className="member-avatar-img"
                                                />
                                            ) : (
                                                <div className="member-avatar-fallback">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="member-name">{member.name}</h3>

                                        {member.nuclear_family_role && (
                                            <span className={`member-role-badge ${member.nuclear_family_role}`}>
                                                {member.nuclear_family_role}
                                            </span>
                                        )}

                                        {member.can_add_members && (
                                            <div className="member-can-add">
                                                <CheckCircle size={14} />
                                                Can add members
                                            </div>
                                        )}

                                        {member.id !== authUser?.id && (
                                            <div className="member-actions">
                                                <Link
                                                    href={route('profile.view', { userId: member.id })}
                                                    className="member-action-btn primary"
                                                >
                                                    View Profile
                                                </Link>
                                                {isAdmin && (
                                                    <button
                                                        className="member-action-btn danger"
                                                        onClick={() => handleRemoveMember(member.id, member.name)}
                                                        disabled={loading}
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Available Members to Add */}
                    {isAdmin && availableMembers.length > 0 && (
                        <div className="premium-section">
                            <div className="section-header">
                                <div className="section-icon">
                                    <UserPlus size={24} />
                                </div>
                                <div className="section-title">
                                    <h2>Available Family Members</h2>
                                    <p>Add your nuclear family members to this tree</p>
                                </div>
                            </div>

                            <div className="members-grid">
                                {availableMembers.map((member) => (
                                    <div key={member.user_id} className="member-card available">
                                        <div className="member-avatar">
                                            {member.profile_image_url ? (
                                                <img
                                                    src={member.profile_image_url}
                                                    alt={member.name}
                                                    className="member-avatar-img"
                                                />
                                            ) : (
                                                <div className="member-avatar-fallback">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="member-name">{member.name}</h3>

                                        <span className={`member-role-badge ${member.role}`}>
                                            {member.role}
                                        </span>

                                        <div className="member-actions">
                                            <button
                                                className="member-action-btn primary full-width"
                                                onClick={() => handleAddMember(member.user_id, member.name)}
                                                disabled={loading}
                                            >
                                                <UserPlus size={16} />
                                                {loading ? 'Adding...' : 'Add to Tree'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                </div>
            </div>
            </div>

            {/* Remove Member Confirmation Dialog */}
            {showRemoveDialog && memberToRemove && (
                <div className="dialog-overlay" onClick={cancelRemoveMember}>
                    <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
                        <div className="dialog-header">
                            <div className="dialog-icon-wrapper danger">
                                <AlertTriangle size={32} />
                            </div>
                            <button className="dialog-close-btn" onClick={cancelRemoveMember}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="dialog-content">
                            <h3 className="dialog-title">Remove Family Member?</h3>
                            <p className="dialog-message">
                                Are you sure you want to remove <strong>{memberToRemove.name}</strong> from this family tree?
                                This action cannot be undone.
                            </p>
                        </div>

                        <div className="dialog-actions">
                            <button
                                className="dialog-btn dialog-btn-cancel"
                                onClick={cancelRemoveMember}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="dialog-btn dialog-btn-danger"
                                onClick={confirmRemoveMember}
                                disabled={loading}
                            >
                                <Trash2 size={18} />
                                {loading ? 'Removing...' : 'Remove Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthAccessLayout>
    );
}
