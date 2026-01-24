import { useCallback, useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { TreePine, ArrowLeft, Users, Lock, Globe, Shield, GitMerge } from 'lucide-react';
import FamilyGroupTreeVisualization from '@/Components/FamilyTree/FamilyGroupTreeVisualization';
import ProfileSidebar from '../Stories/ProfileSidebar';
import { UserProfile } from '@/types';
import './MyFamilyTree.css';
import '../../../../../css/connections.css';

interface TreeNode {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
    status: string;
    relationshipType: string;
    relationshipLabel: string;
    nodeColor: string;
}

interface TreeEdge {
    id: string;
    source: number;
    target: number;
    relationshipType: string;
    label: string;
    color: string;
}

interface FamilyContainer {
    id: number;
    name: string;
    rootUserId: number;
    nodes: TreeNode[];
    edges: TreeEdge[];
}

interface ContainerConnection {
    id: string;
    sourceContainerId: number;
    targetContainerId: number;
    connectionType: string;
    label: string;
}

interface FamilyGroupTreeData {
    familyTreeId: number;
    familyTreeUuid: string;
    familyName: string;
    mergedGroupName?: string;
    displayName: string;
    isMerged: boolean;
    containers: FamilyContainer[];
    containerConnections: ContainerConnection[];
}

interface TreeData {
    id: string;
    name: string;
    merged_group_name?: string;
    has_merged_trees: boolean;
    display_name: string;
    description?: string;
    is_public: boolean;
}

interface Props {
    user: UserProfile;
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
    tree: TreeData;
    treeData: FamilyGroupTreeData;
    isAdmin: boolean;
    isMember: boolean;
}

export default function FamilyGroupTree({
    user,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
    tree,
    treeData,
    isAdmin,
    isMember
}: Props) {
    const { props } = usePage();

    const totalMembers = treeData.containers.reduce(
        (sum, container) => sum + container.nodes.length,
        0
    );

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
                                <Link href={route('family-tree.show', tree.id)} className="detail-back-button">
                                    <ArrowLeft size={20} />
                                    <span>Back to Family Group</span>
                                </Link>

                                {/* Header */}
                                <div className="premium-tree-header">
                                    <div className="tree-header-main">
                                        <div className="tree-title-group">
                                            <div className="tree-icon-wrapper">
                                                <TreePine size={32} strokeWidth={2.5} />
                                            </div>
                                            <h1>{tree.display_name} - Family Tree</h1>
                                            {tree.has_merged_trees && tree.merged_group_name && (
                                                <p className="tree-description" style={{ color: '#F59E0B', fontWeight: 500 }}>
                                                    Unified Group: {tree.merged_group_name}
                                                </p>
                                            )}
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
                                            {treeData.isMerged && (
                                                <div className="meta-badge merged" style={{
                                                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                                    color: 'white'
                                                }}>
                                                    <GitMerge size={16} />
                                                    Merged Families
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

                                    {/* Stats Grid */}
                                    <div className="tree-stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-value">{totalMembers}</div>
                                            <div className="stat-label">Total Members</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{treeData.containers.length}</div>
                                            <div className="stat-label">{treeData.containers.length === 1 ? 'Family' : 'Families'}</div>
                                        </div>
                                        {treeData.isMerged && (
                                            <div className="stat-card">
                                                <div className="stat-value">{treeData.containerConnections.length}</div>
                                                <div className="stat-label">Merged Connections</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Family Tree Visualization */}
                                <div className="premium-section">
                                    <div className="section-header">
                                        <div className="section-icon">
                                            <Users size={24} />
                                        </div>
                                        <div className="section-title">
                                            <h2>Family Tree Visualization</h2>
                                            <p>
                                                {treeData.isMerged
                                                    ? `Showing ${treeData.containers.length} merged families`
                                                    : 'Showing your nuclear family tree'}
                                            </p>
                                        </div>
                                    </div>

                                    <FamilyGroupTreeVisualization treeData={treeData} />
                                </div>

                                {/* Family Containers Legend (for merged trees) */}
                                {treeData.isMerged && treeData.containers.length > 1 && (
                                    <div className="premium-section">
                                        <div className="section-header">
                                            <div className="section-icon">
                                                <GitMerge size={24} />
                                            </div>
                                            <div className="section-title">
                                                <h2>Merged Families</h2>
                                                <p>Families that have joined together</p>
                                            </div>
                                        </div>

                                        <div className="admins-grid">
                                            {treeData.containers.map((container, index) => (
                                                <div key={container.id} className="admin-card">
                                                    <div className="admin-info">
                                                        <div className={`admin-avatar ${index === 0 ? 'creator' : 'co-admin'}`}>
                                                            <TreePine size={24} />
                                                        </div>
                                                        <div className="admin-details">
                                                            <h3 className="admin-name">{container.name}</h3>
                                                            <p className="admin-role">
                                                                {container.nodes.length} {container.nodes.length === 1 ? 'member' : 'members'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="admin-granted">
                                                        {index === 0 ? 'Primary Family' : 'Merged Family'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
