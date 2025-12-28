import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Users, Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

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

interface TreeData {
    nodes: Node[];
    edges: Edge[];
    rootUserId: number;
}

interface Props {
    treeData: TreeData;
}

interface NodePosition {
    x: number;
    y: number;
    level: number;
}

const ConnectionTreeVisualization: React.FC<Props> = ({ treeData }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);

    // Calculate node positions using a hierarchical tree layout
    const { nodePositions, svgDimensions } = useMemo(() => {
        if (!treeData || treeData.nodes.length === 0) {
            return { nodePositions: {}, svgDimensions: { width: 800, height: 600 } };
        }

        const positions: Record<number, NodePosition> = {};
        const { nodes, edges, rootUserId } = treeData;

        // Map relationship types to vertical levels
        const getRelationshipLevel = (relationshipType: string): number => {
            const levelMap: Record<string, number> = {
                // Grandparents (2 levels above)
                'grandmother': -2,
                'grandfather': -2,
                'grandparent': -2,

                // Parents (1 level above)
                'mother': -1,
                'father': -1,
                'parent': -1,

                // Root user and siblings (same level)
                'root': 0,
                'brother': 0,
                'sister': 0,
                'sibling': 0,

                // Spouse (same level as root)
                'husband': 0,
                'wife': 0,
                'partner': 0,

                // Children (1 level below)
                'son': 1,
                'daughter': 1,
                'child': 1,

                // Grandchildren (2 levels below)
                'grandson': 2,
                'granddaughter': 2,
                'grandchild': 2,

                // Extended family at appropriate levels
                'aunt': -1,
                'uncle': -1,
                'nephew': 1,
                'niece': 1,
                'cousin': 0,
            };

            return levelMap[relationshipType] ?? 0;
        };

        // Group nodes by their calculated level based on relationship type
        const levelMap: Record<number, number[]> = {};

        nodes.forEach(node => {
            const level = getRelationshipLevel(node.relationshipType);

            if (!levelMap[level]) {
                levelMap[level] = [];
            }
            levelMap[level].push(node.id);
        });

        // Calculate positions
        const levelHeight = 200;
        const nodeWidth = 180;
        const levels = Object.keys(levelMap).map(Number).sort((a, b) => a - b);

        levels.forEach(level => {
            const nodesInLevel = levelMap[level];
            const y = level * levelHeight;

            // Special handling for level 0 (root user and siblings)
            if (level === 0) {
                // Separate nodes by type
                const rootNode = nodesInLevel.find(id => {
                    const node = nodes.find(n => n.id === id);
                    return node?.relationshipType === 'root';
                });

                const brothers = nodesInLevel.filter(id => {
                    const node = nodes.find(n => n.id === id);
                    return node?.relationshipType === 'brother';
                });

                const sisters = nodesInLevel.filter(id => {
                    const node = nodes.find(n => n.id === id);
                    return node?.relationshipType === 'sister';
                });

                const others = nodesInLevel.filter(id => {
                    const node = nodes.find(n => n.id === id);
                    return node && !['root', 'brother', 'sister'].includes(node.relationshipType);
                });

                // Position root user at center (x = 0)
                if (rootNode) {
                    positions[rootNode] = { x: 0, y, level };
                }

                // Position sisters on the LEFT (negative x)
                sisters.forEach((nodeId, index) => {
                    const x = -(index + 1) * nodeWidth;
                    positions[nodeId] = { x, y, level };
                });

                // Position brothers on the RIGHT (positive x)
                brothers.forEach((nodeId, index) => {
                    const x = (index + 1) * nodeWidth;
                    positions[nodeId] = { x, y, level };
                });

                // Position other level 0 relatives (spouse, cousin, etc.)
                // Place them after brothers on the right
                others.forEach((nodeId, index) => {
                    const x = (brothers.length + index + 1) * nodeWidth;
                    positions[nodeId] = { x, y, level };
                });
            } else {
                // Standard positioning for other levels
                const levelWidth = nodesInLevel.length * nodeWidth;
                nodesInLevel.forEach((nodeId, index) => {
                    const x = (index * nodeWidth) - (levelWidth / 2) + (nodeWidth / 2);
                    positions[nodeId] = { x, y, level };
                });
            }
        });

        // Calculate SVG dimensions
        const allX = Object.values(positions).map(p => p.x);
        const allY = Object.values(positions).map(p => p.y);
        const minX = Math.min(...allX);
        const maxX = Math.max(...allX);
        const minY = Math.min(...allY);
        const maxY = Math.max(...allY);

        const padding = 150;
        const width = Math.max(maxX - minX + padding * 2, 1000);
        const height = Math.max(maxY - minY + padding * 2, 700);

        return {
            nodePositions: positions,
            svgDimensions: { width, height, minX, maxX, minY, maxY, padding }
        };
    }, [treeData]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 0) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    }, [pan]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + 0.2, 3));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - 0.2, 0.3));
    }, []);

    const handleReset = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;

        try {
            if (!document.fullscreenElement) {
                // Enter fullscreen
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                // Exit fullscreen
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Error toggling fullscreen:', err);
        }
    }, []);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    if (!treeData || treeData.nodes.length === 0) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                border: '2px dashed rgba(102, 126, 234, 0.3)',
                borderRadius: '16px',
                padding: '4rem 2rem',
                textAlign: 'center',
                color: '#64748B'
            }}>
                <Users size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1a1a1a' }}>
                    No Connections Yet
                </h3>
                <p style={{ fontSize: '1rem', color: '#6C757D' }}>
                    Start adding connections to see your family tree visualization
                </p>
            </div>
        );
    }

    const { width, height, minX, maxY, minY, padding } = svgDimensions;
    const viewBoxWidth = width;
    const viewBoxHeight = height;

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: isFullscreen ? '100vh' : '700px',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                borderRadius: isFullscreen ? 0 : '16px',
                overflow: 'hidden',
                border: isFullscreen ? 'none' : '1px solid rgba(102, 126, 234, 0.2)',
                boxShadow: isFullscreen ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
        >
            {/* Controls */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 10,
                display: 'flex',
                gap: '12px',
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}>
                <button
                    onClick={handleZoomIn}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        transition: 'all 0.2s',
                        gap: '4px',
                        minWidth: '60px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <ZoomIn size={20} />
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>Zoom In</span>
                </button>
                <button
                    onClick={handleZoomOut}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        transition: 'all 0.2s',
                        gap: '4px',
                        minWidth: '60px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <ZoomOut size={20} />
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>Zoom Out</span>
                </button>
                <button
                    onClick={handleReset}
                    style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        transition: 'all 0.2s',
                        gap: '4px',
                        minWidth: '60px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <RefreshCw size={20} />
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>Reset</span>
                </button>
                <button
                    onClick={toggleFullscreen}
                    style={{
                        background: isFullscreen
                            ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                            : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        transition: 'all 0.2s',
                        gap: '4px',
                        minWidth: '60px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = isFullscreen
                            ? '0 4px 12px rgba(239, 68, 68, 0.5)'
                            : '0 4px 12px rgba(245, 158, 11, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>
                        {isFullscreen ? 'Exit' : 'Expand'}
                    </span>
                </button>
            </div>

            {/* SVG Canvas */}
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    overflow: 'hidden'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'center',
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                    }}
                >
                    {/* Draw edges - only show connections to the root user */}
                    <g>
                        {treeData.edges
                            .filter(edge => edge.source === treeData.rootUserId || edge.target === treeData.rootUserId)
                            .map((edge) => {
                                const sourcePos = nodePositions[edge.source];
                                const targetPos = nodePositions[edge.target];

                                if (!sourcePos || !targetPos) return null;

                                const x1 = sourcePos.x - (minX || 0) + padding;
                                const y1 = sourcePos.y - (minY || 0) + padding;
                                const x2 = targetPos.x - (minX || 0) + padding;
                                const y2 = targetPos.y - (minY || 0) + padding;

                                // Use cubic bezier curve for smooth connections
                                const midY = (y1 + y2) / 2;

                                return (
                                    <g key={edge.id}>
                                        {/* Glow effect */}
                                        <path
                                            d={`M ${x1} ${y1 + 60} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2 - 60}`}
                                            stroke={edge.color}
                                            strokeWidth="4"
                                            fill="none"
                                            opacity="0.3"
                                            filter="blur(8px)"
                                        />
                                        {/* Main line */}
                                        <path
                                            d={`M ${x1} ${y1 + 60} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2 - 60}`}
                                            stroke={edge.color}
                                            strokeWidth="3"
                                            fill="none"
                                            opacity="0.9"
                                            strokeLinecap="round"
                                        />
                                        {/* Relationship label */}
                                        <g>
                                            <rect
                                                x={(x1 + x2) / 2 - 50}
                                                y={midY - 15}
                                                width="100"
                                                height="30"
                                                fill="rgba(15, 23, 42, 0.95)"
                                                stroke={edge.color}
                                                strokeWidth="2"
                                                rx="15"
                                                ry="15"
                                            />
                                            <text
                                                x={(x1 + x2) / 2}
                                                y={midY + 4}
                                                textAnchor="middle"
                                                fontSize="11"
                                                fontWeight="700"
                                                fill={edge.color}
                                                style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                            >
                                                {edge.label}
                                            </text>
                                        </g>
                                    </g>
                                );
                            })}
                    </g>

                    {/* Draw nodes */}
                    <g>
                        {treeData.nodes.map((node) => {
                            const pos = nodePositions[node.id];
                            if (!pos) return null;

                            const x = pos.x - (minX || 0) + padding;
                            const y = pos.y - (minY || 0) + padding;
                            const isRoot = node.id === treeData.rootUserId;
                            const isHovered = hoveredNode === node.id;
                            const radius = isRoot ? 60 : 50;

                            return (
                                <g
                                    key={`node-${node.id}`}
                                    onMouseEnter={() => setHoveredNode(node.id)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {/* Glow effect */}
                                    {(isRoot || isHovered) && (
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r={radius + 10}
                                            fill={isRoot ? '#667eea' : node.nodeColor}
                                            opacity="0.3"
                                            filter="blur(15px)"
                                        />
                                    )}
                                    {/* Outer ring */}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={radius}
                                        fill={isRoot ? 'url(#gradient-root)' : node.nodeColor}
                                        stroke={isHovered ? '#FFFFFF' : isRoot ? '#764ba2' : '#38BDF8'}
                                        strokeWidth={isHovered ? 4 : 3}
                                        style={{
                                            transition: 'all 0.3s ease',
                                            filter: `drop-shadow(0 ${isHovered ? 12 : 8}px ${isHovered ? 24 : 16}px rgba(0, 0, 0, 0.4))`
                                        }}
                                    />
                                    {/* Clip path for circular image */}
                                    <defs>
                                        <clipPath id={`clip-${node.id}`}>
                                            <circle cx={x} cy={y} r={radius - 5} />
                                        </clipPath>
                                    </defs>

                                    {/* Profile image or initial */}
                                    {node.profileImage ? (
                                        <>
                                            <image
                                                href={node.profileImage}
                                                x={x - radius + 5}
                                                y={y - radius + 5}
                                                width={radius * 2 - 10}
                                                height={radius * 2 - 10}
                                                clipPath={`url(#clip-${node.id})`}
                                                preserveAspectRatio="xMidYMid slice"
                                            />
                                        </>
                                    ) : (
                                        <text
                                            x={x}
                                            y={y}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fontSize={isRoot ? 32 : 24}
                                            fontWeight="800"
                                            fill={isRoot ? '#FFFFFF' : '#0F172A'}
                                        >
                                            {node.name.charAt(0).toUpperCase()}
                                        </text>
                                    )}
                                    {/* Name label */}
                                    <text
                                        x={x}
                                        y={y + radius + 25}
                                        textAnchor="middle"
                                        fontSize="14"
                                        fontWeight="700"
                                        fill="#FFFFFF"
                                        style={{
                                            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                                        }}
                                    >
                                        {node.name.split(' ')[0]}
                                    </text>
                                    {/* Relationship badge */}
                                   
                                </g>
                            );
                        })}
                    </g>

                    {/* Gradients */}
                    <defs>
                        <linearGradient id="gradient-root" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Legend */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '15px 20px',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                color: 'white',
                fontSize: '12px',
                fontWeight: 600
            }}>
                <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 700 }}>
                    {treeData.nodes.length} Connection{treeData.nodes.length !== 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Drag to pan • Scroll to zoom
                </div>
            </div>
        </div>
    );
};

export default ConnectionTreeVisualization;
