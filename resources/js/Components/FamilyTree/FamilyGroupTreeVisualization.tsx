import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Users, Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

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

interface Props {
    treeData: FamilyGroupTreeData;
}

interface NodePosition {
    x: number;
    y: number;
    level: number;
}

interface ContainerLayout {
    id: number;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    nodePositions: Record<number, NodePosition>;
    rootUserId: number;
    nodes: TreeNode[];
    filteredNodes: TreeNode[];
    edges: TreeEdge[];
    spouseId: number | null;
    childrenIds: number[];
}

// Container colors for merged families
const containerColors = [
    { bg: 'rgba(102, 126, 234, 0.1)', border: '#667eea', label: '#667eea' },
    { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', label: '#F59E0B' },
    { bg: 'rgba(16, 185, 129, 0.1)', border: '#10B981', label: '#10B981' },
    { bg: 'rgba(139, 92, 246, 0.1)', border: '#8B5CF6', label: '#8B5CF6' },
    { bg: 'rgba(236, 72, 153, 0.1)', border: '#EC4899', label: '#EC4899' },
];

const FamilyGroupTreeVisualization: React.FC<Props> = ({ treeData }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);

    // Calculate node positions within a container with inverted triangle for parents
    // Only shows parents and their direct children (no grandchildren)
    const calculateContainerNodePositions = useCallback((nodes: TreeNode[], rootUserId: number): {
        positions: Record<number, NodePosition>;
        width: number;
        height: number;
        spouseId: number | null;
        childrenIds: number[];
        filteredNodes: TreeNode[];
    } => {
        const positions: Record<number, NodePosition> = {};

        // Find the root user and spouse
        const rootNode = nodes.find(n => n.id === rootUserId);
        const spouseNode = nodes.find(n => ['wife', 'husband', 'partner'].includes(n.relationshipType));
        const children = nodes.filter(n => ['son', 'daughter', 'child'].includes(n.relationshipType));

        // Filter nodes to only include parents and their direct children (exclude grandchildren and other extended family)
        const filteredNodes = nodes.filter(n =>
            n.id === rootUserId ||
            ['wife', 'husband', 'partner', 'son', 'daughter', 'child'].includes(n.relationshipType)
        );

        const nodeWidth = 120;
        const levelHeight = 160;
        const parentSpacing = 100;

        // Level 0: Parents (husband and wife side by side)
        const parentY = 0;

        if (rootNode && spouseNode) {
            // Position parents side by side, centered
            positions[rootUserId] = { x: -parentSpacing / 2, y: parentY, level: 0 };
            positions[spouseNode.id] = { x: parentSpacing / 2, y: parentY, level: 0 };
        } else if (rootNode) {
            // Only root user, center them
            positions[rootUserId] = { x: 0, y: parentY, level: 0 };
        }

        // Level 1: Children (centered below parents)
        const childrenY = levelHeight;
        if (children.length > 0) {
            const childrenWidth = children.length * nodeWidth;
            children.forEach((child, index) => {
                const x = (index * nodeWidth) - (childrenWidth / 2) + (nodeWidth / 2);
                positions[child.id] = { x, y: childrenY, level: 1 };
            });
        }

        // Calculate dimensions based on actual content
        const allX = Object.values(positions).map(p => p.x);
        const allY = Object.values(positions).map(p => p.y);
        const minX = Math.min(...allX, 0);
        const maxX = Math.max(...allX, 0);
        const minY = Math.min(...allY, 0);
        const maxY = Math.max(...allY, 0);

        // Normalize positions to start from 0
        Object.keys(positions).forEach(key => {
            positions[Number(key)].x -= minX;
            positions[Number(key)].y -= minY;
        });

        // Dynamic padding based on content - space for node radius + labels
        const horizontalPadding = 60; // Space for node (40 radius) + some margin
        const verticalPadding = 60;
        const labelSpace = 50; // Space for name labels below bottom nodes

        return {
            positions,
            width: maxX - minX + horizontalPadding * 2,
            height: maxY - minY + verticalPadding * 2 + labelSpace,
            spouseId: spouseNode?.id ?? null,
            childrenIds: children.map(c => c.id),
            filteredNodes
        };
    }, []);

    // Calculate layout for all containers
    const { containerLayouts, svgDimensions } = useMemo(() => {
        if (!treeData || treeData.containers.length === 0) {
            return { containerLayouts: [], svgDimensions: { width: 800, height: 600 } };
        }

        const layouts: ContainerLayout[] = [];
        const containerGap = 80;
        let currentX = 30;

        treeData.containers.forEach((container) => {
            const { positions, width, height, spouseId, childrenIds, filteredNodes } = calculateContainerNodePositions(
                container.nodes,
                container.rootUserId
            );

            // Use calculated dimensions directly - only set small minimum for empty/tiny trees
            const containerWidth = Math.max(width, 200);
            const containerHeight = Math.max(height, 150);

            layouts.push({
                id: container.id,
                name: container.name,
                x: currentX,
                y: 30,
                width: containerWidth,
                height: containerHeight,
                nodePositions: positions,
                rootUserId: container.rootUserId,
                nodes: container.nodes,
                filteredNodes,
                edges: container.edges,
                spouseId,
                childrenIds
            });

            currentX += containerWidth + containerGap;
        });

        const maxHeight = Math.max(...layouts.map(l => l.height + 60));
        const totalWidth = currentX;

        return {
            containerLayouts: layouts,
            svgDimensions: {
                width: Math.max(totalWidth, 400),
                height: Math.max(maxHeight, 300)
            }
        };
    }, [treeData, calculateContainerNodePositions]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Don't start dragging if clicking on interactive elements (text links, clickable areas)
        const target = e.target as SVGElement | HTMLElement;
        const tagName = target.tagName?.toLowerCase();
        const isClickable = target.getAttribute?.('data-clickable') === 'true';
        const hasClickableParent = (target as Element).closest?.('[data-clickable="true"]');

        if (tagName === 'text' || isClickable || hasClickableParent) {
            return;
        }
        if (e.button === 0) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    }, [pan]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);
    const handleZoomIn = useCallback(() => setZoom(prev => Math.min(prev + 0.2, 3)), []);
    const handleZoomOut = useCallback(() => setZoom(prev => Math.max(prev - 0.2, 0.3)), []);
    const handleReset = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;
        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Error toggling fullscreen:', err);
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleNodeClick = useCallback((username: string) => {
        window.location.href = `/profile/${username}`;
    }, []);

    const handleAvatarClick = useCallback((username: string) => {
        window.location.href = `/profile/${username}/tree`;
    }, []);

    if (!treeData || treeData.containers.length === 0) {
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
                    No Family Members Yet
                </h3>
                <p style={{ fontSize: '1rem', color: '#6C757D' }}>
                    Add members to your family tree to see the visualization
                </p>
            </div>
        );
    }

    const { width, height } = svgDimensions;

    // Render the inverted triangle connection between parents and children
    const renderParentChildConnections = (container: ContainerLayout, padding: number, headerHeight: number) => {
        const rootPos = container.nodePositions[container.rootUserId];
        const spousePos = container.spouseId ? container.nodePositions[container.spouseId] : null;

        if (!rootPos || container.childrenIds.length === 0) return null;

        const nodeRadius = 40;
        const rootX = container.x + padding + rootPos.x;
        const rootY = container.y + headerHeight + padding + rootPos.y;

        const spouseX = spousePos ? container.x + padding + spousePos.x : rootX;
        const spouseY = spousePos ? container.y + headerHeight + padding + spousePos.y : rootY;

        // Calculate the junction point (tip of inverted triangle)
        const junctionX = (rootX + spouseX) / 2;
        const junctionY = rootY + nodeRadius + 50; // 50px below parents

        // Get all children positions
        const childPositions = container.childrenIds.map(childId => {
            const childPos = container.nodePositions[childId];
            return {
                id: childId,
                x: container.x + padding + childPos.x,
                y: container.y + headerHeight + padding + childPos.y
            };
        });

        // Find the edge colors for parent-child relationships
        const parentChildEdge = container.edges.find(e =>
            container.childrenIds.includes(e.target) &&
            (e.source === container.rootUserId || e.source === container.spouseId)
        );
        const connectionColor = parentChildEdge?.color || '#38BDF8';

        return (
            <g key="parent-child-connections">
                {/* Horizontal line between husband and wife */}
                {spousePos && (
                    <g>
                        {/* Glow effect */}
                        <line
                            x1={rootX}
                            y1={rootY}
                            x2={spouseX}
                            y2={spouseY}
                            stroke="#EC4899"
                            strokeWidth="6"
                            opacity="0.3"
                            filter="blur(4px)"
                        />
                        {/* Main line */}
                        <line
                            x1={rootX}
                            y1={rootY}
                            x2={spouseX}
                            y2={spouseY}
                            stroke="#EC4899"
                            strokeWidth="3"
                            opacity="0.9"
                        />
                        {/* Heart symbol in the middle */}
                        <text
                            x={(rootX + spouseX) / 2}
                            y={rootY - 5}
                            textAnchor="middle"
                            fontSize="16"
                            fill="#EC4899"
                        >
                            ♥
                        </text>
                    </g>
                )}

                {/* Lines from both parents to junction point (inverted triangle) */}
                <g>
                    {/* Line from root/husband to junction */}
                    <path
                        d={`M ${rootX} ${rootY + nodeRadius} L ${junctionX} ${junctionY}`}
                        stroke={connectionColor}
                        strokeWidth="3"
                        fill="none"
                        opacity="0.8"
                    />

                    {/* Line from spouse/wife to junction (if spouse exists) */}
                    {spousePos && (
                        <path
                            d={`M ${spouseX} ${spouseY + nodeRadius} L ${junctionX} ${junctionY}`}
                            stroke={connectionColor}
                            strokeWidth="3"
                            fill="none"
                            opacity="0.8"
                        />
                    )}

                    {/* Junction point (small circle) */}
                    <circle
                        cx={junctionX}
                        cy={junctionY}
                        r={6}
                        fill={connectionColor}
                        stroke="#0F172A"
                        strokeWidth="2"
                    />
                </g>

                {/* Lines from junction to each child */}
                {childPositions.map((child, index) => {
                    const childNode = container.filteredNodes.find(n => n.id === child.id);
                    const childEdge = container.edges.find(e => e.target === child.id);
                    const childColor = childEdge?.color || connectionColor;
                    const childLabel = childNode?.relationshipType || '';

                    return (
                        <g key={`child-connection-${child.id}`}>
                            {/* Vertical line from junction down */}
                            <path
                                d={`M ${junctionX} ${junctionY} L ${junctionX} ${junctionY + 30} L ${child.x} ${child.y - nodeRadius}`}
                                stroke={childColor}
                                strokeWidth="2"
                                fill="none"
                                opacity="0.7"
                            />

                            {/* Label for relationship */}
                            <g>
                                <rect
                                    x={(junctionX + child.x) / 2 - 30}
                                    y={(junctionY + 30 + child.y - nodeRadius) / 2 - 10}
                                    width="60"
                                    height="20"
                                    fill="rgba(15, 23, 42, 0.9)"
                                    stroke={childColor}
                                    strokeWidth="1"
                                    rx="10"
                                />
                                <text
                                    x={(junctionX + child.x) / 2}
                                    y={(junctionY + 30 + child.y - nodeRadius) / 2 + 4}
                                    textAnchor="middle"
                                    fontSize="9"
                                    fontWeight="600"
                                    fill={childColor}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {childLabel}
                                </text>
                            </g>
                        </g>
                    );
                })}
            </g>
        );
    };


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
                {[
                    { onClick: handleZoomIn, icon: ZoomIn, label: 'Zoom In', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                    { onClick: handleZoomOut, icon: ZoomOut, label: 'Zoom Out', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                    { onClick: handleReset, icon: RefreshCw, label: 'Reset', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
                ].map((btn, i) => (
                    <button
                        key={i}
                        onClick={btn.onClick}
                        style={{
                            background: btn.gradient,
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            transition: 'all 0.2s',
                            gap: '4px',
                            minWidth: '60px'
                        }}
                    >
                        <btn.icon size={20} />
                        <span style={{ fontSize: '10px', fontWeight: 600 }}>{btn.label}</span>
                    </button>
                ))}
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
                        cursor: 'pointer',
                        color: 'white',
                        transition: 'all 0.2s',
                        gap: '4px',
                        minWidth: '60px'
                    }}
                >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>{isFullscreen ? 'Exit' : 'Expand'}</span>
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
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="xMidYMid meet"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'center',
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                    }}
                >
                    <defs>
                        <linearGradient id="gradient-root" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
                        </linearGradient>
                        <linearGradient id="gradient-spouse" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#F472B6', stopOpacity: 1 }} />
                        </linearGradient>
                        <linearGradient id="gradient-merge" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#D97706', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>

                    {/* Draw container connections (for merged families) */}
                    {treeData.containerConnections.map((connection) => {
                        const sourceContainer = containerLayouts.find(c => c.id === connection.sourceContainerId);
                        const targetContainer = containerLayouts.find(c => c.id === connection.targetContainerId);

                        if (!sourceContainer || !targetContainer) return null;

                        const x1 = sourceContainer.x + sourceContainer.width;
                        const y1 = sourceContainer.y + sourceContainer.height / 2;
                        const x2 = targetContainer.x;
                        const y2 = targetContainer.y + targetContainer.height / 2;
                        const midX = (x1 + x2) / 2;

                        return (
                            <g key={connection.id}>
                                <path
                                    d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                                    stroke="#F59E0B"
                                    strokeWidth="8"
                                    fill="none"
                                    opacity="0.3"
                                    filter="blur(8px)"
                                />
                                <path
                                    d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                                    stroke="url(#gradient-merge)"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray="12,6"
                                    opacity="0.9"
                                />
                                <g>
                                    <rect
                                        x={midX - 45}
                                        y={(y1 + y2) / 2 - 15}
                                        width="90"
                                        height="30"
                                        fill="rgba(15, 23, 42, 0.95)"
                                        stroke="#F59E0B"
                                        strokeWidth="2"
                                        rx="15"
                                    />
                                    <text
                                        x={midX}
                                        y={(y1 + y2) / 2 + 4}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="700"
                                        fill="#F59E0B"
                                    >
                                        {connection.label}
                                    </text>
                                </g>
                            </g>
                        );
                    })}

                    {/* Draw containers */}
                    {containerLayouts.map((container, containerIndex) => {
                        const colorScheme = containerColors[containerIndex % containerColors.length];
                        const padding = 50;
                        const headerHeight = 60;

                        return (
                            <g key={`container-${container.id}`}>
                                {/* Container background */}
                                <rect
                                    x={container.x}
                                    y={container.y}
                                    width={container.width}
                                    height={container.height}
                                    fill={colorScheme.bg}
                                    stroke={colorScheme.border}
                                    strokeWidth="3"
                                    rx="20"
                                    ry="20"
                                    style={{ filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.3))' }}
                                />

                                {/* Container header */}
                                <rect
                                    x={container.x}
                                    y={container.y}
                                    width={container.width}
                                    height="45"
                                    fill={colorScheme.border}
                                    rx="20"
                                    ry="20"
                                />
                                <rect
                                    x={container.x}
                                    y={container.y + 25}
                                    width={container.width}
                                    height="20"
                                    fill={colorScheme.border}
                                />
                                <text
                                    x={container.x + container.width / 2}
                                    y={container.y + 28}
                                    textAnchor="middle"
                                    fontSize="16"
                                    fontWeight="800"
                                    fill="white"
                                >
                                    {container.name}
                                </text>

                                {/* Draw parent-to-children connections (inverted triangle) */}
                                {renderParentChildConnections(container, padding, headerHeight)}

                                {/* Draw nodes (only parents and direct children) */}
                                <g>
                                    {container.filteredNodes.map((node) => {
                                        const pos = container.nodePositions[node.id];
                                        if (!pos) return null;

                                        const x = container.x + padding + pos.x;
                                        const y = container.y + headerHeight + padding + pos.y;
                                        const isRoot = node.id === container.rootUserId;
                                        const isSpouse = node.id === container.spouseId;
                                        const isHovered = hoveredNode === node.id;
                                        const radius = isRoot || isSpouse ? 40 : 35;

                                        return (
                                            <g
                                                key={`node-${node.id}`}
                                                onMouseEnter={() => setHoveredNode(node.id)}
                                                onMouseLeave={() => setHoveredNode(null)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {/* Glow effect */}
                                                {(isRoot || isSpouse || isHovered) && (
                                                    <circle
                                                        cx={x}
                                                        cy={y}
                                                        r={radius + 8}
                                                        fill={isRoot ? '#667eea' : isSpouse ? '#EC4899' : node.nodeColor}
                                                        opacity="0.3"
                                                        filter="blur(10px)"
                                                    />
                                                )}

                                                {/* Node circle */}
                                                <circle
                                                    cx={x}
                                                    cy={y}
                                                    r={radius}
                                                    fill={isRoot ? 'url(#gradient-root)' : isSpouse ? 'url(#gradient-spouse)' : node.nodeColor}
                                                    stroke={isHovered ? '#FFFFFF' : isRoot ? '#764ba2' : isSpouse ? '#F472B6' : '#38BDF8'}
                                                    strokeWidth={isHovered ? 3 : 2}
                                                    style={{ transition: 'all 0.3s ease', filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' }}
                                                />

                                                {/* Clip path for image */}
                                                <defs>
                                                    <clipPath id={`clip-group-${node.id}`}>
                                                        <circle cx={x} cy={y} r={radius - 3} />
                                                    </clipPath>
                                                </defs>

                                                {/* Profile image or initial */}
                                                {node.profileImage ? (
                                                    <image
                                                        href={node.profileImage}
                                                        x={x - radius + 3}
                                                        y={y - radius + 3}
                                                        width={radius * 2 - 6}
                                                        height={radius * 2 - 6}
                                                        clipPath={`url(#clip-group-${node.id})`}
                                                        preserveAspectRatio="xMidYMid slice"
                                                    />
                                                ) : (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        fontSize={isRoot || isSpouse ? 24 : 20}
                                                        fontWeight="800"
                                                        fill={isRoot || isSpouse ? '#FFFFFF' : '#0F172A'}
                                                    >
                                                        {node.name.charAt(0).toUpperCase()}
                                                    </text>
                                                )}

                                                {/* Clickable overlay for avatar - navigates to user's tree */}
                                                <circle
                                                    cx={x}
                                                    cy={y}
                                                    r={radius}
                                                    fill="transparent"
                                                    data-clickable="true"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        handleAvatarClick(node.username);
                                                    }}
                                                >
                                                    <title>View {node.name.split(' ')[0]}'s family tree</title>
                                                </circle>

                                                {/* Name label - clickable link to profile */}
                                                <g
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        handleNodeClick(node.username);
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                    data-clickable="true"
                                                >
                                                    {/* Invisible larger hit area for easier clicking */}
                                                    <rect
                                                        x={x - 40}
                                                        y={y + radius + 5}
                                                        width="80"
                                                        height="22"
                                                        fill="transparent"
                                                        data-clickable="true"
                                                    />
                                                    <text
                                                        x={x}
                                                        y={y + radius + 18}
                                                        textAnchor="middle"
                                                        fontSize="12"
                                                        fontWeight="700"
                                                        fill="#38BDF8"
                                                        data-clickable="true"
                                                        style={{
                                                            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                                                            cursor: 'pointer',
                                                            textDecoration: 'underline',
                                                            textUnderlineOffset: '2px',
                                                            pointerEvents: 'auto'
                                                        }}
                                                    >
                                                        {node.name.split(' ')[0]}
                                                    </text>
                                                </g>

                                                {/* Role label for parents */}
                                                {(isRoot || isSpouse) && (
                                                    <text
                                                        x={x}
                                                        y={y - radius - 10}
                                                        textAnchor="middle"
                                                        fontSize="10"
                                                        fontWeight="600"
                                                        fill={isRoot ? '#667eea' : '#EC4899'}
                                                        style={{ textTransform: 'capitalize' }}
                                                    >
                                                        {node.relationshipType === 'root' ? 'You' : node.relationshipType}
                                                    </text>
                                                )}
                                            </g>
                                        );
                                    })}
                                </g>
                            </g>
                        );
                    })}
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
                    {treeData.containers.length} {treeData.containers.length === 1 ? 'Family' : 'Families'}
                    {treeData.isMerged && ' (Merged)'}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Drag to pan • Use buttons to zoom
                </div>
            </div>
        </div>
    );
};

export default FamilyGroupTreeVisualization;
