import { useMemo, useState, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { ArrowLeft, Users, Network, Info, RotateCcw, Loader2 } from 'lucide-react';
import ConnectionTreeVisualization from '@/Components/FamilyTree/ConnectionTreeVisualization';

interface Node {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
    status: string;
    relationshipType: string;
    relationshipLabel: string;
    nodeColor: string;
}

interface Edge {
    id: string;
    source: number;
    target: number;
    relationshipType: string;
    label: string;
    color: string;
}

interface ConnectionTreeData {
    nodes: Node[];
    edges: Edge[];
    rootUserId: number;
    spouseGroups?: Array<{
        spouseId: number;
        isDivorced: boolean;
        childIds: number[];
    }>;
    parentFamilyUnits?: Array<{
        parentId: number;
        siblings: number[];
        parents: number[];
        otherSpouses: Array<{
            spouseId: number;
            isDivorced: boolean;
            childIds: number[];
        }>;
    }>;
    parentConnection?: {
        parent1Id: number;
        parent2Id: number;
        isDivorced: boolean;
    } | null;
    viewerNode?: {
        id: number;
        relationshipType: string;
    };
    isUpwardTree?: boolean;
}

interface User {
    id: number;
    name: string;
    username: string;
    profile_image_url: string | null;
    status: string;
}

interface Props {
    connectionTreeData: ConnectionTreeData;
    user: User;
    hasPaternal: boolean;
    hasMaternal: boolean;
}

export default function Index({ connectionTreeData, user, hasPaternal, hasMaternal }: Props) {
    // State for current tree data (can switch to view other users' trees)
    const [currentTreeData, setCurrentTreeData] = useState<ConnectionTreeData>(connectionTreeData);
    const [currentOwner, setCurrentOwner] = useState<User>(user);
    const [isLoading, setIsLoading] = useState(false);
    const [currentHasPaternal, setCurrentHasPaternal] = useState(hasPaternal);
    const [currentHasMaternal, setCurrentHasMaternal] = useState(hasMaternal);
    const [isExpandedView, setIsExpandedView] = useState(false);
    const [viewHistory, setViewHistory] = useState<Array<{ treeData: ConnectionTreeData; owner: User; hasPaternal: boolean; hasMaternal: boolean }>>([]);

    // Check if viewing own tree
    const isOwnTree = currentOwner.id === user.id;
    const isScopedView = !!currentTreeData.viewerNode;

    // Count unique relationship types
    const relationshipStats = useMemo(() => {
        const types: Record<string, number> = {};
        currentTreeData.edges.forEach(edge => {
            types[edge.relationshipType] = (types[edge.relationshipType] || 0) + 1;
        });
        return Object.entries(types).sort((a, b) => b[1] - a[1]);
    }, [currentTreeData]);

    // Handle avatar click to switch to another user's tree
    const handleAvatarClick = useCallback(async (userId: number, shouldBlur: boolean) => {
        if (shouldBlur || isLoading) return;

        // Don't reload if clicking on current root user
        if (userId === currentTreeData.rootUserId) return;

        // If clicking the auth user's own node (in a scoped tree), reset to own tree
        if (userId === user.id) {
            setCurrentTreeData(connectionTreeData);
            setCurrentOwner(user);
            setCurrentHasPaternal(hasPaternal);
            setCurrentHasMaternal(hasMaternal);
            setIsExpandedView(false);
            setViewHistory([]);
            return;
        }

        setIsLoading(true);

        try {
            // Find the clicked node to get its relationshipType as a hint
            const clickedNode = currentTreeData.nodes.find(n => n.id === userId);
            const hint = clickedNode?.relationshipType || '';
            const url = `/api/tree/${userId}${hint ? `?relationshipHint=${encodeURIComponent(hint)}` : ''}`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to load tree data');
                setIsLoading(false);
                return;
            }

            const data = await response.json();

            if (data.success) {
                // Save current state to history for back navigation
                setViewHistory(prev => [...prev, { treeData: currentTreeData, owner: currentOwner, hasPaternal: currentHasPaternal, hasMaternal: currentHasMaternal }]);

                // Update to new tree
                setCurrentTreeData(data.connectionTreeData);
                setCurrentOwner(data.owner);
                setCurrentHasPaternal(data.hasPaternal ?? false);
                setCurrentHasMaternal(data.hasMaternal ?? false);
            }
        } catch (error) {
            console.error('Error fetching tree data:', error);
            alert('Failed to load tree data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [currentTreeData, currentOwner, isLoading, user.id, connectionTreeData, user, hasPaternal, hasMaternal, currentHasPaternal, currentHasMaternal]);

    // Handle going back to previous tree view
    const handleGoBack = useCallback(() => {
        if (viewHistory.length === 0) return;

        const previousState = viewHistory[viewHistory.length - 1];
        setCurrentTreeData(previousState.treeData);
        setCurrentOwner(previousState.owner);
        setCurrentHasPaternal(previousState.hasPaternal);
        setCurrentHasMaternal(previousState.hasMaternal);
        setIsExpandedView(false);
        setViewHistory(prev => prev.slice(0, -1));
    }, [viewHistory]);

    // Handle resetting to own tree
    const handleResetToOwnTree = useCallback(() => {
        setCurrentTreeData(connectionTreeData);
        setCurrentOwner(user);
        setCurrentHasPaternal(hasPaternal);
        setCurrentHasMaternal(hasMaternal);
        setIsExpandedView(false);
        setViewHistory([]);
    }, [connectionTreeData, user, hasPaternal, hasMaternal]);

    // Handle expanded view (paternal/maternal lineage)
    const handleExpandedView = useCallback(async (side: 'paternal' | 'maternal') => {
        if (isLoading) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/api/tree-expanded-view?userId=${currentOwner.id}&side=${side}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to load expanded view');
                setIsLoading(false);
                return;
            }

            const data = await response.json();

            if (data.success) {
                // Save current state to history
                setViewHistory(prev => [...prev, { treeData: currentTreeData, owner: currentOwner, hasPaternal: currentHasPaternal, hasMaternal: currentHasMaternal }]);

                // Update to ancestor's tree
                setCurrentTreeData(data.connectionTreeData);
                setCurrentOwner(data.owner);
                setCurrentHasPaternal(data.hasPaternal ?? false);
                setCurrentHasMaternal(data.hasMaternal ?? false);
                setIsExpandedView(true);
            }
        } catch (error) {
            console.error('Error fetching expanded view:', error);
            alert('Failed to load expanded view. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [currentTreeData, currentOwner, isLoading, currentHasPaternal, currentHasMaternal]);

    return (
        <AuthAccessLayout>
            {/* Add keyframes for spinner */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                padding: '2rem 1rem',
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <Link
                            href={route('home')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#94A3B8',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                marginBottom: '1.5rem',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                        >
                            <ArrowLeft size={18} />
                            Back to Profile
                        </Link>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: '1.5rem',
                            marginBottom: '1rem'
                        }}>
                            <div>
                                <h1 style={{
                                    margin: '0 0 0.5rem 0',
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    letterSpacing: '-0.5px'
                                }}>
                                    {isOwnTree ? 'Your Connection Tree' : `${currentOwner.name}'s Family`}
                                </h1>
                                <p style={{
                                    margin: 0,
                                    color: '#94A3B8',
                                    fontSize: '1.1rem',
                                    lineHeight: 1.6
                                }}>
                                    {isOwnTree
                                        ? 'Visualize your family connections in an interactive tree format'
                                        : isScopedView
                                            ? `Viewing ${currentOwner.name}'s immediate family (spouses, children, grandchildren)`
                                            : `Viewing ${currentOwner.name}'s family connections from their perspective`
                                    }
                                </p>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'center'
                            }}>
                                {/* Back/Reset buttons when viewing another user's tree */}
                                {!isOwnTree && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {viewHistory.length > 0 && (
                                            <button
                                                onClick={handleGoBack}
                                                disabled={isLoading}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    background: 'rgba(148, 163, 184, 0.2)',
                                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                                    borderRadius: '8px',
                                                    color: '#94A3B8',
                                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 500,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <ArrowLeft size={16} />
                                                Back
                                            </button>
                                        )}
                                        <button
                                            onClick={handleResetToOwnTree}
                                            disabled={isLoading}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(102, 126, 234, 0.2)',
                                                border: '1px solid rgba(102, 126, 234, 0.3)',
                                                borderRadius: '8px',
                                                color: '#667eea',
                                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: 500,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <RotateCcw size={16} />
                                            My Tree
                                        </button>
                                    </div>
                                )}
                                <div style={{
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    border: '2px solid rgba(102, 126, 234, 0.3)',
                                    borderRadius: '12px',
                                    padding: '0.75rem 1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <Users size={20} style={{ color: '#667eea' }} />
                                    <div>
                                        <div style={{
                                            fontSize: '1.5rem',
                                            fontWeight: 800,
                                            color: '#FFFFFF',
                                            lineHeight: 1
                                        }}>
                                            {currentTreeData.nodes.length}
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#94A3B8',
                                            marginTop: '0.25rem'
                                        }}>
                                            Connections
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Banner */}
                        <div style={{
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            borderRadius: '12px',
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <Info size={20} style={{ color: '#38BDF8', flexShrink: 0 }} />
                            <p style={{
                                margin: 0,
                                color: '#E2E8F0',
                                fontSize: '0.9rem',
                                lineHeight: 1.5
                            }}>
                                <strong>Interactive Tree:</strong> Use your mouse to drag and pan around the tree. Zoom in/out with the controls, and hover over nodes to see details. <strong>Click on a name</strong> to view their profile, or <strong>click on an avatar</strong> to switch to their tree view.
                            </p>
                        </div>
                    </div>

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(15, 23, 42, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            backdropFilter: 'blur(4px)'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <Loader2 size={48} style={{ color: '#667eea', animation: 'spin 1s linear infinite' }} />
                                <p style={{ color: '#E2E8F0', fontSize: '1.1rem', margin: 0 }}>
                                    Loading tree...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Main Visualization */}
                    <div style={{ marginBottom: '2rem' }}>
                        <ConnectionTreeVisualization
                            treeData={currentTreeData}
                            onAvatarClick={handleAvatarClick}
                            hasPaternal={currentHasPaternal}
                            hasMaternal={currentHasMaternal}
                            onExpandedView={handleExpandedView}
                            disableNodeClicks={isExpandedView}
                            onBackToDefault={isExpandedView ? handleResetToOwnTree : undefined}
                        />
                    </div>

                    {/* Stats Section */}
                    {relationshipStats.length > 0 && (
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.6)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            borderRadius: '16px',
                            padding: '2rem',
                            marginBottom: '2rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '1.5rem'
                            }}>
                                <Network size={24} style={{ color: '#667eea' }} />
                                <h2 style={{
                                    margin: 0,
                                    color: '#FFFFFF',
                                    fontSize: '1.5rem',
                                    fontWeight: 800,
                                    letterSpacing: '-0.3px'
                                }}>
                                    Relationship Breakdown
                                </h2>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '1rem'
                            }}>
                                {relationshipStats.map(([type, count]) => (
                                    <div
                                        key={type}
                                        style={{
                                            background: 'rgba(102, 126, 234, 0.1)',
                                            border: '1px solid rgba(102, 126, 234, 0.2)',
                                            borderRadius: '12px',
                                            padding: '1rem',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                                            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                                            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '2rem',
                                            fontWeight: 800,
                                            color: '#667eea',
                                            lineHeight: 1,
                                            marginBottom: '0.5rem'
                                        }}>
                                            {count}
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: '#E2E8F0',
                                            textTransform: 'capitalize'
                                        }}>
                                            {type.replace('_', ' ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <Link
                            href={route('connections.index')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.85rem 1.5rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            <Users size={18} />
                            View All Connections
                        </Link>

                        <Link
                            href={route('connections.create')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.85rem 1.5rem',
                                background: 'rgba(102, 126, 234, 0.2)',
                                border: '2px solid rgba(102, 126, 234, 0.4)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.3)';
                                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.6)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Users size={18} />
                            Add New Connection
                        </Link>
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
