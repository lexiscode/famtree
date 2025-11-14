import { useCallback, useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Users, Plus, Edit, Trash2, Download, Share2, Lock, Globe, Home, LogOut } from 'lucide-react';

interface User {
    id: number;
    name: string;
    username: string;
    profile_image_url?: string;
    status: string;
}

interface TreeMember extends User {
    added_at: string;
    added_by: {
        id: number;
        name: string;
    };
}

interface Connection {
    from: number;
    to: number;
    relationship: string;
}

interface TreeData {
    id: number;
    name: string;
    description?: string;
    is_public: boolean;
    root_user_id: number;
    created_by_user_id: number;
    created_at: string;
    updated_at: string;
    is_owner?: boolean;
}

interface Stats {
    tree_id: number;
    member_count: number;
    tree_name: string;
    is_public: boolean;
    created_at: string;
    created_by: {
        id: number;
        name: string;
    };
}

interface Props {
    tree: TreeData;
    members: TreeMember[];
    connections: Connection[];
    stats: Stats;
    isOwner: boolean;
    isMember: boolean;
}

export default function MyFamilyTree({ tree, members, connections, stats, isOwner, isMember }: Props) {
    const { props } = usePage();
    const { auth } = props;
    const user = auth?.user;

    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TreeMember | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAddMember = useCallback(() => {
        setShowAddMemberModal(true);
    }, []);

    const handleRemoveMember = useCallback(
        (memberId: number) => {
            if (confirm('Are you sure you want to remove this member from the tree?')) {
                setLoading(true);
                router.delete(
                    route('family-tree.remove-member', { treeId: tree.id, userId: memberId }),
                    {
                        onSuccess: () => {
                            setLoading(false);
                        },
                        onError: () => {
                            setLoading(false);
                            alert('Failed to remove member. Please try again.');
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
                    alert('Failed to delete tree. Please try again.');
                },
            });
        }
    }, [tree.id]);

    const handleExportTree = useCallback(() => {
        // Export as JSON for now
        const data = {
            tree: tree,
            members: members,
            connections: connections,
        };
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
        element.setAttribute('download', `${tree.name.replace(/\s+/g, '_')}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }, [tree, members, connections]);

    const relationshipColor = (relationship: string) => {
        switch (relationship.toLowerCase()) {
            case 'father':
            case 'mother':
                return 'success';
            case 'son':
            case 'daughter':
                return 'info';
            case 'brother':
            case 'sister':
                return 'warning';
            default:
                return 'primary';
        }
    };

    return (
        <GuestLayout>
            <div className="family-tree-page">
                <div className="family-tree-container">
                    {/* Header Section */}
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
                                {isOwner && (
                                    <div className="tree-badge" style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#FFD700' }}>
                                        <Home size={16} />
                                        Owner
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isOwner && (
                            <div className="tree-header-actions">
                                <button className="tree-action-btn" onClick={handleAddMember} disabled={loading}>
                                    <Plus size={18} />
                                    Add Member
                                </button>
                                <Link href={route('family-tree.edit', { treeId: tree.id })} className="tree-action-btn secondary">
                                    <Edit size={18} />
                                    Edit
                                </Link>
                                <button className="tree-action-btn secondary" onClick={handleExportTree}>
                                    <Download size={18} />
                                    Export
                                </button>
                                <button className="tree-action-btn secondary" onClick={handleDeleteTree} disabled={loading} style={{ color: '#FF4757', borderColor: '#FF4757' }}>
                                    <Trash2 size={18} />
                                    Delete
                                </button>
                            </div>
                        )}

                        {/* Statistics */}
                        <div className="tree-stats">
                            <div className="tree-stat">
                                <div className="tree-stat-value">{stats.member_count}</div>
                                <div className="tree-stat-label">Members</div>
                            </div>
                            <div className="tree-stat">
                                <div className="tree-stat-value">{connections.length}</div>
                                <div className="tree-stat-label">Connections</div>
                            </div>
                            <div className="tree-stat">
                                <div className="tree-stat-value">{new Date(stats.created_at).getFullYear()}</div>
                                <div className="tree-stat-label">Created</div>
                            </div>
                            <div className="tree-stat">
                                <div className="tree-stat-value">{stats.created_by.name.split(' ')[0]}</div>
                                <div className="tree-stat-label">Creator</div>
                            </div>
                        </div>
                    </div>

                    {/* Tree Visualization */}
                    <div className="tree-visualization-wrapper">
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={24} style={{ color: '#0052E8' }} />
                            Family Members
                        </h2>

                        {members.length === 0 ? (
                            <div className="tree-empty-state">
                                <div className="tree-empty-icon">👥</div>
                                <h3 className="tree-empty-title">No members yet</h3>
                                <p className="tree-empty-text">Start building your family tree by adding members.</p>
                                {isOwner && (
                                    <button className="tree-empty-action" onClick={handleAddMember}>
                                        <Plus size={18} />
                                        Add First Member
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="tree-members-container">
                                {members.map((member) => (
                                    <div key={member.id} className="tree-member-card">
                                        {member.profile_image_url ? (
                                            <img src={member.profile_image_url} alt={member.name} className="tree-member-avatar" />
                                        ) : (
                                            <div className="tree-member-avatar" style={{ background: '#E8F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="tree-member-name">{member.name}</div>
                                        <div className="tree-member-username">@{member.username}</div>

                                        {/* Find relationship to root user */}
                                        {connections.find((c) => (c.from === tree.root_user_id && c.to === member.id) || (c.from === member.id && c.to === tree.root_user_id)) && (
                                            <div className={`tree-member-relation`} style={{ background: `rgba(0, ${member.status === 'alive' ? '217, 127' : '0, 0'}, 0.1)`, color: member.status === 'alive' ? '#00D97F' : '#FF4757' }}>
                                                {connections.find((c) => c.to === member.id)?.relationship || 'Related'}
                                            </div>
                                        )}

                                        <div className={`tree-member-status ${member.status === 'alive' ? 'alive' : 'deceased'}`}>
                                            {member.status === 'alive' ? '✓ Alive' : '✗ Deceased'}
                                        </div>

                                        {isOwner && member.id !== user?.id && (
                                            <div className="tree-member-action">
                                                <Link href={route('profile.view', { userId: member.id })} className="tree-member-action-btn">
                                                    View Profile
                                                </Link>
                                                <button className="tree-member-action-btn danger" onClick={() => handleRemoveMember(member.id)} disabled={loading}>
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                        {!isOwner && member.id !== user?.id && (
                                            <Link href={route('profile.view', { userId: member.id })} className="tree-member-action-btn" style={{ display: 'block', textAlign: 'center' }}>
                                                View Profile
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Hierarchy View */}
                    {members.length > 0 && (
                        <div className="tree-hierarchy">
                            <div style={{ marginBottom: '1rem' }}>
                                <h2 style={{ color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Home size={24} style={{ color: '#0052E8' }} />
                                    Tree Relationships
                                </h2>
                            </div>

                            {connections.length > 0 ? (
                                connections.slice(0, 10).map((connection, idx) => {
                                    const fromMember = members.find((m) => m.id === connection.from);
                                    const toMember = members.find((m) => m.id === connection.to);

                                    return (
                                        fromMember &&
                                        toMember && (
                                            <div key={idx} className="tree-level" style={{ borderLeftColor: `var(--tree-${relationshipColor(connection.relationship)})` }}>
                                                <div className="tree-level-title">
                                                    <span style={{ color: '#1a1a1a' }}>
                                                        {fromMember.name} → {connection.relationship} → {toMember.name}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    );
                                })
                            ) : (
                                <div className="tree-level">
                                    <p style={{ color: '#6C757D', margin: 0 }}>No explicit relationships defined yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Member Modal */}
            {showAddMemberModal && (
                <div className="tree-modal-overlay" onClick={() => setShowAddMemberModal(false)}>
                    <div className="tree-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="tree-modal-title">Add Member to Family Tree</h3>
                        <p style={{ color: '#6C757D', marginBottom: '1rem' }}>
                            You can add members by inviting them or searching from your connections.
                        </p>
                        <div style={{ marginBottom: '1rem' }}>
                            <input type="text" className="tree-form-input" placeholder="Search by name or username..." style={{ marginBottom: '0.75rem' }} />
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {/* Connection list would go here */}
                                <p style={{ color: '#6C757D', textAlign: 'center', padding: '1rem' }}>
                                    Connect with other users to add them to your tree.
                                </p>
                            </div>
                        </div>
                        <div className="tree-modal-actions">
                            <button className="tree-modal-btn secondary" onClick={() => setShowAddMemberModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GuestLayout>
    );
}
