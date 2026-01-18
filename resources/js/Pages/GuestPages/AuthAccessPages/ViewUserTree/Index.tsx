import { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { ArrowLeft, Users, Network, Info } from 'lucide-react';
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
}

interface Owner {
    id: number;
    name: string;
    username: string;
    profile_image_url: string | null;
    status: string;
}

interface Props {
    connectionTreeData: ConnectionTreeData;
    owner: Owner;
    isOwnTree: boolean;
}

export default function Index({ connectionTreeData, owner, isOwnTree }: Props) {
    // Count unique relationship types
    const relationshipStats = useMemo(() => {
        const types: Record<string, number> = {};
        connectionTreeData.edges.forEach(edge => {
            types[edge.relationshipType] = (types[edge.relationshipType] || 0) + 1;
        });
        return Object.entries(types).sort((a, b) => b[1] - a[1]);
    }, [connectionTreeData]);

    return (
        <AuthAccessLayout>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                padding: '2rem 1rem',
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <Link
                            href={route('profile.view', { username: owner.username })}
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
                            Back to {isOwnTree ? 'Your' : `${owner.name}'s`} Profile
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
                                    {isOwnTree ? 'Your' : `${owner.name}'s`} Family Tree
                                </h1>
                                <p style={{
                                    margin: 0,
                                    color: '#94A3B8',
                                    fontSize: '1.1rem',
                                    lineHeight: 1.6
                                }}>
                                    {isOwnTree
                                        ? 'Visualize your family connections in an interactive tree format'
                                        : `Explore ${owner.name}'s family connections in an interactive tree format`
                                    }
                                </p>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'center'
                            }}>
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
                                            {connectionTreeData.nodes.length}
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
                                <strong>Interactive Tree:</strong> Use your mouse to drag and pan around the tree. Zoom in/out with the controls, and hover over nodes to see details. Click fullscreen for a better view.
                            </p>
                        </div>
                    </div>

                    {/* Main Visualization */}
                    <div style={{ marginBottom: '2rem' }}>
                        <ConnectionTreeVisualization treeData={connectionTreeData} />
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
                            href={route('profile.view', { username: owner.username })}
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
                            Back to Profile
                        </Link>

                        {isOwnTree && (
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
                        )}
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
