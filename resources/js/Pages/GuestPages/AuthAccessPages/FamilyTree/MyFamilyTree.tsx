import { useCallback, useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Users, Plus, Edit, Trash2, Download, Share2, Lock, Globe, Home, CheckCircle, XCircle } from 'lucide-react';
import './MyFamilyTree.css';

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
            members: members,
            connections: connections,
        };
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
        element.setAttribute('download', `${tree.name.replace(/\s+/g, '_')}_${new Date().getTime()}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }, [tree, members, connections]);

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
                                {isOwner && (
                                    <div className="tree-badge owner">
                                        <Home size={16} />
                                        Owner
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isOwner && (
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
                                <div className="tree-stat-value">{stats.member_count}</div>
                                <div className="tree-stat-label">Total Members</div>
                            </div>
                            <div className="tree-stat">
                                <div className="tree-stat-value">{connections.length}</div>
                                <div className="tree-stat-label">Relationships</div>
                            </div>
                            <div className="tree-stat">
                                <div className="tree-stat-value">{new Date(stats.created_at).getFullYear()}</div>
                                <div className="tree-stat-label">Created</div>
                            </div>
                            <div className="tree-stat">
                                <div className="tree-stat-value">{stats.created_by?.name?.split(' ')[0] || 'Unknown'}</div>
                                <div className="tree-stat-label">Creator</div>
                            </div>
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
                                {isOwner && (
                                    <Link href={route('family-tree.index')} className="tree-empty-action">
                                        <Plus size={18} />
                                        Back to Trees
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="tree-members-container">
                                {members.map((member) => {
                                    const memberConnection = connections.find(
                                        (c) => (c.from === tree.root_user_id && c.to === member.id) || (c.from === member.id && c.to === tree.root_user_id)
                                    );

                                    return (
                                        <div key={member.id} className="tree-member-card">
                                            {member.profile_image_url ? (
                                                <img src={member.profile_image_url} alt={member.name} className="tree-member-avatar" />
                                            ) : (
                                                <div className="tree-member-avatar" style={{ background: 'linear-gradient(135deg, #0052E8, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'white', fontWeight: 'bold' }}>
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="tree-member-name">{member.name}</div>
                                            <div className="tree-member-username">@{member.username}</div>

                                            {memberConnection && (
                                                <div className="tree-member-relation">
                                                    {memberConnection.relationship}
                                                </div>
                                            )}

                                            <div className={`tree-member-status ${member.status === 'alive' ? 'alive' : 'deceased'}`}>
                                                {member.status === 'alive' ? (
                                                    <>
                                                        <CheckCircle size={16} />
                                                        Alive
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle size={16} />
                                                        Deceased
                                                    </>
                                                )}
                                            </div>

                                            {isOwner && member.id !== user?.id && (
                                                <div className="tree-member-action">
                                                    <Link href={route('profile.view', { userId: member.id })} className="tree-member-action-btn">
                                                        View Profile
                                                    </Link>
                                                    <button className="tree-member-action-btn danger" onClick={() => handleRemoveMember(member.id, member.name)} disabled={loading}>
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                            {!isOwner && member.id !== user?.id && (
                                                <div className="tree-member-action">
                                                    <Link href={route('profile.view', { userId: member.id })} className="tree-member-action-btn" style={{ flex: 1 }}>
                                                        View Profile
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Relationships Section */}
                    {members.length > 1 && connections.length > 0 && (
                        <div className="tree-visualization-wrapper" style={{ marginBottom: '2.5rem' }}>
                            <h2>
                                <Share2 size={24} />
                                Key Relationships
                            </h2>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {connections.slice(0, 5).map((connection, idx) => {
                                    const fromMember = members.find((m) => m.id === connection.from);
                                    const toMember = members.find((m) => m.id === connection.to);

                                    return fromMember && toMember ? (
                                        <div key={idx} style={{ padding: '1rem', background: 'linear-gradient(135deg, #F0F6FF 0%, rgba(0, 212, 255, 0.05) 100%)', borderRadius: '12px', border: '1px solid rgba(0, 82, 232, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #0052E8, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0 }}>
                                                {fromMember.name.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1a1a1a' }}>
                                                    {fromMember.name}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#6C757D', marginTop: '0.2rem' }}>
                                                    <span style={{ background: 'rgba(0, 82, 232, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', color: '#0052E8', fontWeight: '600' }}>
                                                        {connection.relationship}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1a1a1a' }}>
                                                    {toMember.name}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#6C757D', marginTop: '0.2rem' }}>
                                                    @{toMember.username}
                                                </div>
                                            </div>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #00D97F, #00E8A0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0 }}>
                                                {toMember.name.charAt(0)}
                                            </div>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
