import { useCallback } from 'react';
import { Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Plus, Globe, Lock, Users, Calendar, ArrowRight, Sparkles, Zap } from 'lucide-react';
import './Index.css';

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
        <Link href={route('family-tree.show', { treeId: tree.id })} className="tree-card">
            <div className="tree-card-header">
                <h3 className="tree-card-title">{tree.name}</h3>
                <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}>
                    {tree.is_public ? (
                        <div className="tree-card-badge public">
                            <Globe size={16} />
                            <span>Public</span>
                        </div>
                    ) : (
                        <div className="tree-card-badge private">
                            <Lock size={16} />
                            <span>Private</span>
                        </div>
                    )}
                    {isOwner && (
                        <div className="tree-card-badge owner">
                            <Sparkles size={16} />
                            <span>Owner</span>
                        </div>
                    )}
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
                <span>View Tree</span>
                <ArrowRight size={16} />
            </div>
        </Link>
    );

    return (
        <AuthAccessLayout>
            <div className="family-tree-page">
                <div className="family-tree-container">
                    {/* Page Header */}
                    <div className="tree-header" style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1 }}>
                                <h1 style={{ margin: '0 0 0.5rem 0', fontFamily: "'Playfair Display', serif", fontSize: '2.25rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                                    Your Family Trees
                                </h1>
                                <p style={{ margin: 0, color: '#6C757D', fontSize: '1rem', lineHeight: 1.6 }}>
                                    Create and manage family trees to connect with relatives
                                </p>
                            </div>
                            <Link href={route('family-tree.create')} className="tree-action-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                <Plus size={18} />
                                Create Tree
                            </Link>
                        </div>
                    </div>

                    {/* My Trees Section */}
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Zap size={24} style={{ color: '#0052E8' }} />
                            <h2 style={{ margin: 0, color: '#faf8f8ff', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
                                My Trees
                            </h2>
                            <span style={{ background: 'linear-gradient(135deg, #0052E8, #00D4FF)', color: 'white', padding: '0.35rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, marginLeft: '0.5rem' }}>
                                {myTrees.length}
                            </span>
                        </div>

                        {myTrees.length === 0 ? (
                            <div className="tree-empty-state">
                                <div className="tree-empty-icon">🌳</div>
                                <h3 className="tree-empty-title">No family trees yet</h3>
                                <p className="tree-empty-text">Create your first family tree to start connecting with your relatives and building your family history.</p>
                                <Link href={route('family-tree.create')} className="tree-empty-action" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                                    <Plus size={18} />
                                    Create First Tree
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.75rem' }}>
                                {myTrees.map((tree) => (
                                    <TreeCard key={tree.id} tree={tree} isOwner={true} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Member Trees Section */}
                    {memberTrees.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <Users size={24} style={{ color: '#00D97F' }} />
                                <h2 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
                                    Trees I'm Part Of
                                </h2>
                                <span style={{ background: 'linear-gradient(135deg, #00D97F, #00E8A0)', color: 'white', padding: '0.35rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, marginLeft: '0.5rem' }}>
                                    {memberTrees.length}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.75rem' }}>
                                {memberTrees.map((tree) => (
                                    <TreeCard key={tree.id} tree={tree} isOwner={false} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty Suggestion Box */}
                    {myTrees.length === 0 && memberTrees.length === 0 && (
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgba(0, 82, 232, 0.08) 0%, rgba(0, 212, 255, 0.05) 100%)',
                                border: '2px dashed rgba(0, 82, 232, 0.2)',
                                borderRadius: '14px',
                                padding: '2.5rem',
                                textAlign: 'center',
                                marginTop: '3rem',
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8f2f2ff', marginBottom: '0.75rem' }}>
                                Start Your Family Journey
                            </h3>
                            <p style={{ color: '#6C757D', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                                Create your first family tree today and connect with your relatives. Share your family history, build relationships, and keep your family story alive.
                            </p>
                            <Link href={route('family-tree.create')} className="tree-empty-action" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                                <Sparkles size={18} />
                                Create Your First Tree
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
