import { useCallback, useState } from 'react';
import { Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Plus, Globe, Lock, Users, Calendar, Shield, Crown, Sparkles, TreePine, TrendingUp, MessageCircle } from 'lucide-react';
import ProfileSidebar from '../Stories/ProfileSidebar';
import TreeChatWindow from '@/Components/FamilyTree/TreeChatWindow';
import { UserProfile } from '@/types';
import './Index.css';
import '../../../../../css/connections.css';

interface Admin {
    id: number;
    name: string;
    role: 'creator' | 'co_admin';
}

interface TreeData {
    id: string; // This is actually the UUID from the backend
    name: string;
    description?: string;
    is_public: boolean;
    is_nuclear_family: boolean;
    member_count: number;
    admins: Admin[];
    created_at: string;
}

interface Props {
    user: UserProfile;
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
    hasCreatedTree: boolean;
    adminTrees: TreeData[];
    memberTrees: TreeData[];
}

export default function Index({
    user,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
    hasCreatedTree,
    adminTrees,
    memberTrees
}: Props) {
    const [showChat, setShowChat] = useState(false);
    const [isChatMinimized, setIsChatMinimized] = useState(false);
    const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }, []);

    // Get all trees user is part of (for chat selection)
    const allUserTrees = [...adminTrees, ...memberTrees];
    const hasAnyTree = allUserTrees.length > 0;

    // Open chat with a specific tree
    const openChatWithTree = useCallback((tree: TreeData) => {
        setSelectedTree(tree);
        setShowChat(true);
    }, []);

    // Open chat (use first available tree if none selected)
    const openChat = useCallback(() => {
        if (!selectedTree && allUserTrees.length > 0) {
            setSelectedTree(allUserTrees[0]);
        }
        setShowChat(true);
    }, [selectedTree, allUserTrees]);

    const TreeCard = ({ tree, isAdmin = false }: { tree: TreeData; isAdmin?: boolean }) => {
        const creatorAdmin = tree.admins?.find((a) => a.role === 'creator');

        return (
            <Link
                href={route('family-tree.show', tree.id)}
                className="modern-tree-card"
            >
                <div className="card-glow"></div>

                <div className="card-header">
                    <div className="card-icon">
                        <TreePine size={24} strokeWidth={2.5} />
                    </div>
                    <div className="card-badges">
                        {tree.is_public ? (
                            <span className="badge badge-public">
                                <Globe size={14} />
                                Public
                            </span>
                        ) : (
                            <span className="badge badge-private">
                                <Lock size={14} />
                                Private
                            </span>
                        )}
                        {isAdmin && (
                            <span className="badge badge-admin">
                                <Shield size={14} />
                                Admin
                            </span>
                        )}
                    </div>
                </div>

                <div className="card-content">
                    <h3 className="card-title">{tree.name}</h3>
                    {tree.description && (
                        <p className="card-description">{tree.description}</p>
                    )}
                </div>

                <div className="card-stats">
                    <div className="stat-item">
                        <Users size={16} />
                        <span>{tree.member_count}</span>
                    </div>
                    <div className="stat-item">
                        <Shield size={16} />
                        <span>{tree.admins?.length || 0}</span>
                    </div>
                    <div className="stat-item">
                        <Calendar size={16} />
                        <span>{formatDate(tree.created_at)}</span>
                    </div>
                </div>

                {!isAdmin && creatorAdmin && (
                    <div className="card-footer">
                        <div className="creator-badge">
                            <Crown size={14} />
                            <span>Created by {creatorAdmin.name}</span>
                        </div>
                    </div>
                )}

                <div className="card-arrow">
                    <span>View Tree</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </Link>
        );
    };

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
                    <div className="premium-family-tree-page">
                {/* Hero Section */}
                <div className="hero-section">
                    <div className="hero-background">
                        <div className="gradient-orb orb-1"></div>
                        <div className="gradient-orb orb-2"></div>
                        <div className="gradient-orb orb-3"></div>
                    </div>

                    <div className="hero-content">
                        <div className="hero-text">
                            <div className="hero-badge">
                                <Sparkles size={16} />
                                <span>Family Tree Management</span>
                            </div>
                            <h1 className="hero-title">
                                Your Family
                                <span className="gradient-text"> Heritage</span>
                            </h1>
                            <p className="hero-subtitle">
                                Create, manage, and preserve your family legacy for generations to come
                            </p>
                        </div>
                        {!hasCreatedTree && (
                            <Link href={route('family-tree.create')} className="cta-button">
                                <Plus size={20} strokeWidth={2.5} />
                                <span>Create New Tree</span>
                                <div className="button-glow"></div>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="trees-container">
                    {/* Admin Trees Section */}
                    {adminTrees.length > 0 && (
                        <section className="trees-section">
                            <div className="section-header">
                                <div className="section-title">
                                    <div className="title-icon">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h2>Trees You Manage</h2>
                                        <p>Family trees where you have administrative access</p>
                                    </div>
                                </div>
                                <div className="section-count">
                                    <TrendingUp size={16} />
                                    <span>{adminTrees.length} {adminTrees.length === 1 ? 'Tree' : 'Trees'}</span>
                                </div>
                            </div>

                            <div className="trees-grid">
                                {adminTrees.map((tree) => (
                                    <TreeCard key={tree.id} tree={tree} isAdmin={true} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Member Trees Section */}
                    {memberTrees.length > 0 && (
                        <section className="trees-section">
                            <div className="section-header">
                                <div className="section-title">
                                    <div className="title-icon member">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h2>Trees You're Part Of</h2>
                                        <p>Family trees where you are a member</p>
                                    </div>
                                </div>
                                <div className="section-count member">
                                    <Users size={16} />
                                    <span>{memberTrees.length} {memberTrees.length === 1 ? 'Tree' : 'Trees'}</span>
                                </div>
                            </div>

                            <div className="trees-grid">
                                {memberTrees.map((tree) => (
                                    <TreeCard key={tree.id} tree={tree} isAdmin={false} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Empty State */}
                    {adminTrees.length === 0 && memberTrees.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-content">
                                <div className="empty-icon">
                                    <TreePine size={64} strokeWidth={1.5} />
                                </div>
                                <h3>Start Your Family Journey</h3>
                                <p>Create your first family tree and begin documenting your heritage. Connect with relatives, preserve memories, and build your family's legacy.</p>
                                <Link href={route('family-tree.create')} className="empty-cta">
                                    <Sparkles size={18} />
                                    <span>Create Your First Tree</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
                </div>
            </div>
            </div>

            {/* Floating Chat Button */}
            {hasAnyTree && !showChat && (
                <button
                    onClick={openChat}
                    className="floating-chat-btn"
                    title="Open Family Tree Chat"
                >
                    <MessageCircle size={24} />
                    <span className="chat-btn-pulse"></span>
                </button>
            )}

            {/* Tree Chat Window */}
            {showChat && selectedTree && user && (
                <TreeChatWindow
                    treeId={selectedTree.id}
                    treeName={selectedTree.name}
                    currentUserId={user.id}
                    onClose={() => setShowChat(false)}
                    isMinimized={isChatMinimized}
                    onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
                />
            )}
        </AuthAccessLayout>
    );
}
