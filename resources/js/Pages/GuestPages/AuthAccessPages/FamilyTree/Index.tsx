import { useCallback } from 'react';
import { Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Plus, Globe, Lock, Users, Calendar, ArrowRight } from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface TreeData {
    id: number;
    name: string;
    description?: string;
    is_public: boolean;
    member_count: number;
    created_at: string;
    created_by?: User;
}

interface Props {
    myTrees: TreeData[];
    memberTrees: TreeData[];
}

export default function Index({ myTrees, memberTrees }: Props) {
    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }, []);

    const TreeCard = ({ tree, isOwner = false }: { tree: TreeData; isOwner?: boolean }) => (
        <Link href={route('family-tree.show', { treeId: tree.id })} className="tree-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="tree-card-header">
                <h3 className="tree-card-title">{tree.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {tree.is_public ? (
                        <div className="tree-card-badge public">
                            <Globe size={14} />
                        </div>
                    ) : (
                        <div className="tree-card-badge private">
                            <Lock size={14} />
                        </div>
                    )}
                    {isOwner && <div className="tree-card-badge owner">Owner</div>}
                </div>
            </div>

            {tree.description && <p className="tree-card-description">{tree.description}</p>}

            <div className="tree-card-stats">
                <div className="tree-card-stat">
                    <Users size={16} />
                    <span>{tree.member_count} member{tree.member_count !== 1 ? 's' : ''}</span>
                </div>
                <div className="tree-card-stat">
                    <Calendar size={16} />
                    <span>{formatDate(tree.created_at)}</span>
                </div>
            </div>

            {!isOwner && tree.created_by && (
                <div className="tree-card-creator">
                    Created by <strong>{tree.created_by.name}</strong>
                </div>
            )}

            <div className="tree-card-action">
                View Tree
                <ArrowRight size={16} />
            </div>
        </Link>
    );

    return (
        <GuestLayout>
            <div className="family-tree-page">
                <div className="family-tree-container">
                    {/* Page Header */}
                    <div className="tree-header" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                            <div>
                                <h1 style={{ margin: '0 0 0.5rem 0', fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700 }}>
                                    Family Trees
                                </h1>
                                <p style={{ margin: 0, color: '#6C757D', fontSize: '0.95rem' }}>Create and manage your family trees</p>
                            </div>
                            <Link href={route('family-tree.create')} className="tree-action-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                                <Plus size={18} />
                                Create Tree
                            </Link>
                        </div>
                    </div>

                    {/* My Trees Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={24} style={{ color: '#0052E8' }} />
                            My Trees ({myTrees.length})
                        </h2>

                        {myTrees.length === 0 ? (
                            <div className="tree-empty-state">
                                <div className="tree-empty-icon">🌳</div>
                                <h3 className="tree-empty-title">No family trees yet</h3>
                                <p className="tree-empty-text">Create your first family tree to get started.</p>
                                <Link href={route('family-tree.create')} className="tree-empty-action" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                                    <Plus size={18} />
                                    Create First Tree
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {myTrees.map((tree) => (
                                    <TreeCard key={tree.id} tree={tree} isOwner={true} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Member Trees Section */}
                    {memberTrees.length > 0 && (
                        <div>
                            <h2 style={{ marginBottom: '1rem', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={24} style={{ color: '#00D97F' }} />
                                Trees I'm Part Of ({memberTrees.length})
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {memberTrees.map((tree) => (
                                    <TreeCard key={tree.id} tree={tree} isOwner={false} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .tree-card {
                    background: var(--tree-white);
                    border: 2px solid var(--tree-border);
                    border-radius: 12px;
                    padding: 1.5rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .tree-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, var(--tree-primary), var(--tree-info));
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .tree-card:hover {
                    border-color: var(--tree-primary);
                    box-shadow: var(--tree-shadow-hover);
                    transform: translateY(-4px);
                }

                .tree-card:hover::before {
                    transform: scaleX(1);
                }

                .tree-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.75rem;
                    gap: 1rem;
                }

                .tree-card-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0;
                }

                .tree-card-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.4rem 0.75rem;
                    background: var(--tree-primary-light);
                    color: var(--tree-primary);
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .tree-card-badge.public {
                    background: rgba(0, 217, 127, 0.1);
                    color: var(--tree-success);
                }

                .tree-card-badge.private {
                    background: rgba(255, 71, 87, 0.1);
                    color: var(--tree-danger);
                }

                .tree-card-badge.owner {
                    background: rgba(255, 215, 0, 0.1);
                    color: #FFD700;
                }

                .tree-card-description {
                    font-size: 0.85rem;
                    color: #6C757D;
                    margin: 0 0 0.75rem 0;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .tree-card-stats {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid var(--tree-border);
                }

                .tree-card-stat {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    color: #6C757D;
                }

                .tree-card-stat svg {
                    color: var(--tree-primary);
                }

                .tree-card-creator {
                    font-size: 0.8rem;
                    color: #6C757D;
                    margin-bottom: 0.75rem;
                }

                .tree-card-action {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: var(--tree-primary);
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.2s ease;
                }

                .tree-card:hover .tree-card-action {
                    gap: 0.25rem;
                }
            `}</style>
        </GuestLayout>
    );
}
