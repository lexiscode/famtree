import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { router } from '@inertiajs/react';
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
    shouldBlur?: boolean;
    spouseGroupId?: number | null;
}

interface Edge {
    id: string;
    source: number;
    target: number;
    relationshipType: string;
    label: string;
    color: string;
    isDivorced?: boolean;
}

interface SpouseGroup {
    spouseId: number;
    isDivorced: boolean;
    childIds: number[];
}

interface ParentOtherSpouse {
    spouseId: number;
    isDivorced: boolean;
    childIds: number[];
}

interface ParentFamilyUnit {
    parentId: number;
    siblings: number[];
    parents: number[];
    otherSpouses: ParentOtherSpouse[];
}

interface ParentConnection {
    parent1Id: number;
    parent2Id: number;
    isDivorced: boolean;
}

interface TreeData {
    nodes: Node[];
    edges: Edge[];
    rootUserId: number;
    spouseGroups?: SpouseGroup[];
    parentFamilyUnits?: ParentFamilyUnit[];
    parentConnection?: ParentConnection | null;
}

interface Props {
    treeData: TreeData;
    onAvatarClick?: (userId: number, shouldBlur: boolean) => void;
}

interface NodePosition {
    x: number;
    y: number;
    level: number;
}

// Abbreviation mapping for relationship labels
const getAbbreviation = (label: string): string => {
    const map: Record<string, string> = {
        'wife': 'W', 'husband': 'H', 'son': 'S', 'daughter': 'D',
        'mother': 'M', 'father': 'F', 'brother': 'Br', 'sister': 'Si',
        'grandson': 'GS', 'granddaughter': 'GD', 'grandmother': 'GM', 'grandfather': 'GF',
        'aunt': 'Au', 'uncle': 'Un', 'nephew': 'Ne', 'niece': 'Ni',
        'cousin': 'Co', 'partner': 'P', 'parent': 'Pa', 'child': 'Ch',
        'sibling': 'Sb', 'grandparent': 'GP', 'grandchild': 'GC',
        'ex_wife': 'PS', 'ex_husband': 'PS', 'ex_partner': 'PS',
        'ex wife': 'PS', 'ex husband': 'PS', 'ex partner': 'PS',
        'prev. spouse': 'PS', 'prev spouse': 'PS',
        'step_mother': 'SM', 'step_father': 'SF',
        'step_brother': 'StBr', 'step_sister': 'StSi',
        'step_sibling': 'StSb', 'step_parent': 'SP',
        'step mother': 'SM', 'step father': 'SF',
        'step brother': 'StBr', 'step sister': 'StSi',
    };
    return map[label.toLowerCase()] || label.charAt(0).toUpperCase();
};

const capitalizeLabel = (label: string): string => {
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
};

const ConnectionTreeVisualization: React.FC<Props> = ({ treeData, onAvatarClick }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);
    const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

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

                // Ex-spouse (same level as root)
                'ex_wife': 0,
                'ex_husband': 0,
                'ex_partner': 0,

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

                // Step relationships
                'step_mother': -1,
                'step_father': -1,
                'step_parent': -1,
                'step_brother': 0,
                'step_sister': 0,
                'step_sibling': 0,
            };

            return levelMap[relationshipType] ?? 0;
        };

        // Pre-collect node IDs managed by parentFamilyUnits (positioned separately in Phase 2)
        const parentFamilyUnitNodeIds = new Set<number>();
        if (treeData.parentFamilyUnits) {
            treeData.parentFamilyUnits.forEach(unit => {
                unit.siblings.forEach(id => parentFamilyUnitNodeIds.add(id));
                unit.parents.forEach(id => parentFamilyUnitNodeIds.add(id));
                unit.otherSpouses.forEach(os => {
                    parentFamilyUnitNodeIds.add(os.spouseId);
                    os.childIds.forEach(id => parentFamilyUnitNodeIds.add(id));
                });
            });
        }

        // Group nodes by their calculated level based on relationship type
        const levelMap: Record<number, number[]> = {};

        nodes.forEach(node => {
            // Skip nodes that belong to parentFamilyUnits (positioned in Phase 2)
            if (parentFamilyUnitNodeIds.has(node.id)) return;

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
        let rootYOffset = 0; // tracks how far root was pushed down (for siblings gap)

        levels.forEach(level => {
            const nodesInLevel = levelMap[level];
            const y = level * levelHeight;

            // Special handling for level 0 (root user, spouses, and siblings)
            if (level === 0) {
                // Separate nodes by type
                const rootNode = nodesInLevel.find(id => {
                    const node = nodes.find(n => n.id === id);
                    return node?.relationshipType === 'root';
                });

                // Siblings (brothers + sisters combined)
                const siblings = nodesInLevel.filter(id => {
                    const node = nodes.find(n => n.id === id);
                    return node && ['brother', 'sister', 'sibling'].includes(node.relationshipType);
                });

                // Active spouses go to the right
                const activeSpouses = nodesInLevel.filter(id => {
                    const node = nodes.find(n => n.id === id);
                    return node && ['wife', 'husband', 'partner'].includes(node.relationshipType);
                });

                // Divorced spouses go to the left
                const divorcedSpouses = nodesInLevel.filter(id => {
                    const node = nodes.find(n => n.id === id);
                    return node && ['ex_wife', 'ex_husband', 'ex_partner'].includes(node.relationshipType);
                });

                const others = nodesInLevel.filter(id => {
                    const node = nodes.find(n => n.id === id);
                    return node && !['root', 'brother', 'sister', 'sibling', 'wife', 'husband', 'partner', 'ex_wife', 'ex_husband', 'ex_partner'].includes(node.relationshipType);
                });

                // Push root (and spouses) down when siblings exist, to give more room
                // for the sibling connection line label. Track the offset so level 1
                // children can be shifted by the same amount, preserving their gap.
                rootYOffset = siblings.length > 0 ? 60 : 0;
                const rootY = y + rootYOffset;

                // Position root user at center (x = 0)
                if (rootNode) {
                    positions[rootNode] = { x: 0, y: rootY, level };
                }

                // Position active spouses to the RIGHT of root (closest)
                activeSpouses.forEach((nodeId, index) => {
                    const x = (index + 1) * nodeWidth;
                    positions[nodeId] = { x, y: rootY, level };
                });

                // Position divorced spouses to the LEFT of root
                divorcedSpouses.forEach((nodeId, index) => {
                    const x = -(index + 1) * nodeWidth;
                    positions[nodeId] = { x, y: rootY, level };
                });

                // Position siblings on a dedicated row between root and parents
                // Centered above Michael (x=0), forming a horizontal bar
                if (siblings.length > 0) {
                    const siblingRowY = y - 160; // between root (0) and parents
                    const siblingSpacing = 160;
                    const totalSiblingWidth = (siblings.length - 1) * siblingSpacing;

                    siblings.forEach((nodeId, index) => {
                        const x = (index * siblingSpacing) - (totalSiblingWidth / 2);
                        positions[nodeId] = { x, y: siblingRowY, level };
                    });
                }

                // Position other level 0 relatives (cousin, etc.)
                others.forEach((nodeId, index) => {
                    const x = (activeSpouses.length + index + 1) * nodeWidth;
                    positions[nodeId] = { x, y, level };
                });
            } else if (level === 1 && treeData.spouseGroups && treeData.spouseGroups.length > 0) {
                // Group children by spouseGroupId and center each group under midpoint of root + spouse
                // Apply rootYOffset so children shift down with the root, preserving their gap
                const childY = y + rootYOffset;
                const rootPos = positions[rootUserId];
                const childSpacing = 160; // spacing between children within a group
                const groupGap = 80; // minimum gap between separate groups
                const rowDropOffset = 200; // vertical offset when pushing a group to a lower row

                if (rootPos) {
                    const grouped: Record<number, number[]> = {};
                    const ungrouped: number[] = [];

                    nodesInLevel.forEach(nodeId => {
                        const node = nodes.find(n => n.id === nodeId);
                        if (node?.spouseGroupId) {
                            if (!grouped[node.spouseGroupId]) {
                                grouped[node.spouseGroupId] = [];
                            }
                            grouped[node.spouseGroupId].push(nodeId);
                        } else {
                            ungrouped.push(nodeId);
                        }
                    });

                    // First pass: position each group biased toward the spouse's side (slanted outward)
                    const groupBounds: { spouseId: number; childIds: number[]; minX: number; maxX: number; centerX: number; rowY: number }[] = [];

                    Object.entries(grouped).forEach(([spouseIdStr, childIds]) => {
                        const spouseId = Number(spouseIdStr);
                        const spousePos = positions[spouseId];
                        // Center children directly under the spouse so groups fan fully outward
                        const centerX = spousePos ? spousePos.x : rootPos.x;
                        const groupWidth = (childIds.length - 1) * childSpacing;

                        childIds.forEach((childId, index) => {
                            const x = centerX + (index * childSpacing) - (groupWidth / 2);
                            positions[childId] = { x, y: childY, level };
                        });

                        const xs = childIds.map(id => positions[id].x);
                        groupBounds.push({
                            spouseId,
                            childIds,
                            minX: Math.min(...xs),
                            maxX: Math.max(...xs),
                            centerX,
                            rowY: childY,
                        });
                    });

                    // Second pass: resolve overlaps by pushing groups to lower rows
                    // Sort groups by center position (left to right)
                    groupBounds.sort((a, b) => a.centerX - b.centerX);

                    for (let i = 1; i < groupBounds.length; i++) {
                        const prev = groupBounds[i - 1];
                        const curr = groupBounds[i];
                        const overlap = (prev.maxX + groupGap) - curr.minX;

                        if (overlap > 0) {
                            // Push the current group down to a lower row instead of shifting horizontally
                            const newY = prev.rowY + rowDropOffset;
                            curr.rowY = newY;
                            curr.childIds.forEach(childId => {
                                positions[childId].y = newY;
                            });
                        }
                    }

                    // Position ungrouped children centered under root
                    if (ungrouped.length > 0) {
                        const groupWidth = (ungrouped.length - 1) * childSpacing;
                        ungrouped.forEach((childId, index) => {
                            const x = rootPos.x + (index * childSpacing) - (groupWidth / 2);
                            positions[childId] = { x, y: childY, level };
                        });
                    }
                } else {
                    // Fallback: standard positioning
                    const levelWidth = nodesInLevel.length * nodeWidth;
                    nodesInLevel.forEach((nodeId, index) => {
                        const x = (index * nodeWidth) - (levelWidth / 2) + (nodeWidth / 2);
                        positions[nodeId] = { x, y: childY, level };
                    });
                }
            } else if (level === -1) {
                // Parents level: center above root (x=0) with spacing
                // Sort so the parent with otherSpouses goes to the RIGHT position,
                // keeping the co-parent to the LEFT. This places the "bridge" parent
                // (e.g. Michael) between the co-parent and other spouses.
                const parentSpacing = 180;
                const parentY = -350; // well above siblings (-160)

                if (treeData.parentFamilyUnits) {
                    const parentWithOtherSpouses = treeData.parentFamilyUnits.find(u =>
                        u.otherSpouses && u.otherSpouses.length > 0
                    );
                    if (parentWithOtherSpouses) {
                        nodesInLevel.sort((a, b) => {
                            if (a === parentWithOtherSpouses.parentId) return 1;  // goes right
                            if (b === parentWithOtherSpouses.parentId) return -1;
                            return 0;
                        });
                    }
                }

                const totalParentWidth = (nodesInLevel.length - 1) * parentSpacing;
                nodesInLevel.forEach((nodeId, index) => {
                    const x = (index * parentSpacing) - (totalParentWidth / 2);
                    positions[nodeId] = { x, y: parentY, level };
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

        // Phase 2: Position parentFamilyUnit nodes relative to their parent node
        if (treeData.parentFamilyUnits) {
            treeData.parentFamilyUnits.forEach(unit => {
                const parentPos = positions[unit.parentId];
                if (!parentPos) return;

                const pfuSpacing = 160;

                // Uncle/Aunt (parent's siblings): horizontal row ABOVE the parent
                if (unit.siblings.length > 0) {
                    const uncleAuntY = parentPos.y - 160;
                    const totalWidth = (unit.siblings.length - 1) * pfuSpacing;
                    unit.siblings.forEach((sibId, index) => {
                        const x = parentPos.x + (index * pfuSpacing) - (totalWidth / 2);
                        positions[sibId] = { x, y: uncleAuntY, level: -1 };
                    });
                }

                // Grandparents (parent's parents): V-shape above uncle/aunt row
                if (unit.parents.length > 0) {
                    const gpY = parentPos.y - 350;
                    const gpSpacing = 180;
                    const totalGpWidth = (unit.parents.length - 1) * gpSpacing;
                    unit.parents.forEach((gpId, index) => {
                        const x = parentPos.x + (index * gpSpacing) - (totalGpWidth / 2);
                        positions[gpId] = { x, y: gpY, level: -2 };
                    });
                }

                // Other spouses of parent: to the RIGHT of the parent
                // This places them on the opposite side from the co-parent,
                // so the "bridge" parent sits between co-parent and other spouses.
                let rightmostXAtParentY = parentPos.x;
                Object.values(positions).forEach(pos => {
                    if (Math.abs(pos.y - parentPos.y) < 10 && pos.x > rightmostXAtParentY) {
                        rightmostXAtParentY = pos.x;
                    }
                });
                let nextSpouseX = rightmostXAtParentY + nodeWidth;
                unit.otherSpouses.forEach(os => {
                    positions[os.spouseId] = { x: nextSpouseX, y: parentPos.y, level: parentPos.level };

                    // Step-siblings: below the other spouse, creating a slanted V-shape
                    if (os.childIds.length > 0) {
                        const stepSibY = parentPos.y + 200;
                        const totalStepWidth = (os.childIds.length - 1) * pfuSpacing;
                        const stepCenterX = nextSpouseX; // centered under the other spouse
                        os.childIds.forEach((childId, index) => {
                            const x = stepCenterX + (index * pfuSpacing) - (totalStepWidth / 2);
                            positions[childId] = { x, y: stepSibY, level: 0 };
                        });
                    }

                    nextSpouseX += nodeWidth;
                });
            });
        }

        // Phase 3: Resolve overlaps between step-sibling groups and other nodes
        // Step-siblings are positioned to the RIGHT of the main tree. Ensure they
        // don't collide with siblings or other nodes by shifting the group further right.
        if (treeData.parentFamilyUnits) {
            const minNodeGap = 150; // minimum center-to-center distance to avoid overlap
            const yProximity = 130; // nodes within this vertical distance can collide

            treeData.parentFamilyUnits.forEach(unit => {
                unit.otherSpouses.forEach(os => {
                    if (os.childIds.length === 0) return;

                    const groupIds = new Set([os.spouseId, ...os.childIds]);

                    // Get the leftmost step-sibling X and their Y level
                    const stepXs = os.childIds.filter(id => positions[id]).map(id => positions[id].x);
                    if (stepXs.length === 0) return;
                    const minStepX = Math.min(...stepXs);
                    const stepY = positions[os.childIds[0]].y;

                    // Find the rightmost non-group node at a similar Y level (to the left of group)
                    let rightmostNearbyX = -Infinity;
                    Object.entries(positions).forEach(([idStr, pos]) => {
                        const id = Number(idStr);
                        if (groupIds.has(id)) return;
                        if (Math.abs(pos.y - stepY) < yProximity && pos.x < minStepX) {
                            rightmostNearbyX = Math.max(rightmostNearbyX, pos.x);
                        }
                    });

                    if (rightmostNearbyX > -Infinity) {
                        // The leftmost step-sibling must be at least minNodeGap to the right
                        const requiredMinX = rightmostNearbyX + minNodeGap;
                        if (minStepX < requiredMinX) {
                            const shift = requiredMinX - minStepX;
                            groupIds.forEach(id => {
                                if (positions[id]) positions[id].x += shift;
                            });
                        }
                    }
                });
            });
        }

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

    // Handle click on node name to navigate to profile
    const handleNodeClick = useCallback((username: string, shouldBlur: boolean) => {
        if (shouldBlur) return; // Don't navigate for blurred nodes
        window.location.href = `/profile/${username}`;
    }, []);

    // Handle click on avatar to switch tree view
    const handleAvatarClick = useCallback((userId: number, shouldBlur: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        if (shouldBlur) return; // Don't switch for blurred nodes
        if (onAvatarClick) {
            onAvatarClick(userId, shouldBlur);
        }
    }, [onAvatarClick]);

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
                    {/* Draw edges - show connections to root user and grandchildren through children */}
                    <g>
                        {(() => {
                            // Collect child IDs that belong to a spouse group (these get inverted triangle rendering)
                            const spouseGroupChildIds = new Set<number>();
                            if (treeData.spouseGroups) {
                                treeData.spouseGroups.forEach(group => {
                                    group.childIds.forEach(id => spouseGroupChildIds.add(id));
                                });
                            }

                            // Collect sibling and parent IDs (rendered by custom family unit section)
                            const siblingIds = new Set(treeData.nodes.filter(n => ['brother', 'sister', 'sibling'].includes(n.relationshipType)).map(n => n.id));
                            const parentIds = new Set(treeData.nodes.filter(n => ['father', 'mother', 'parent'].includes(n.relationshipType)).map(n => n.id));
                            const hasFamilyUnit = siblingIds.size > 0 || parentIds.size > 0;

                            // Collect parent family unit node IDs (rendered by parent family unit section)
                            const pfuNodeIds = new Set<number>();
                            if (treeData.parentFamilyUnits) {
                                treeData.parentFamilyUnits.forEach(unit => {
                                    unit.siblings.forEach(id => pfuNodeIds.add(id));
                                    unit.parents.forEach(id => pfuNodeIds.add(id));
                                    unit.otherSpouses.forEach(os => {
                                        pfuNodeIds.add(os.spouseId);
                                        os.childIds.forEach(id => pfuNodeIds.add(id));
                                    });
                                });
                            }

                            return treeData.edges
                                .filter(edge => {
                                    // Skip edges involving parent family unit nodes (rendered separately)
                                    if (pfuNodeIds.has(edge.source) || pfuNodeIds.has(edge.target)) {
                                        return false;
                                    }

                                    // Skip all edges involving siblings or parents (rendered by family unit section)
                                    if (hasFamilyUnit) {
                                        if (siblingIds.has(edge.source) || siblingIds.has(edge.target) ||
                                            parentIds.has(edge.source) || parentIds.has(edge.target)) {
                                            return false;
                                        }
                                    }

                                    // Skip root → child edges when child belongs to a spouse group
                                    // (these are rendered as inverted triangles instead)
                                    if (edge.source === treeData.rootUserId && spouseGroupChildIds.has(edge.target)) {
                                        const targetNode = treeData.nodes.find(n => n.id === edge.target);
                                        if (targetNode && ['son', 'daughter', 'child'].includes(targetNode.relationshipType)) {
                                            return false;
                                        }
                                    }

                                    // Check if this is a direct root -> grandchild edge (skip these, show through parent instead)
                                    if (edge.source === treeData.rootUserId) {
                                        const targetNode = treeData.nodes.find(n => n.id === edge.target);
                                        if (targetNode && ['grandson', 'granddaughter', 'grandchild'].includes(targetNode.relationshipType)) {
                                            const hasChildParent = treeData.edges.some(e =>
                                                e.target === edge.target &&
                                                e.source !== treeData.rootUserId &&
                                                treeData.nodes.find(n => n.id === e.source && ['son', 'daughter', 'child'].includes(n.relationshipType))
                                            );
                                            if (hasChildParent) {
                                                return false;
                                            }
                                        }
                                        return true;
                                    }

                                    // Show edges where target is root user
                                    if (edge.target === treeData.rootUserId) {
                                        return true;
                                    }

                                    // Show grandchildren edges (child -> grandchild connections)
                                    const targetNode = treeData.nodes.find(n => n.id === edge.target);
                                    if (targetNode && ['grandson', 'granddaughter', 'grandchild'].includes(targetNode.relationshipType)) {
                                        const sourceNode = treeData.nodes.find(n => n.id === edge.source);
                                        if (sourceNode && ['son', 'daughter', 'child'].includes(sourceNode.relationshipType)) {
                                            return true;
                                        }
                                    }

                                    return false;
                                })
                                .map((edge) => {
                                    const sourcePos = nodePositions[edge.source];
                                    const targetPos = nodePositions[edge.target];

                                    if (!sourcePos || !targetPos) return null;

                                    const x1 = sourcePos.x - (minX || 0) + padding;
                                    const y1 = sourcePos.y - (minY || 0) + padding;
                                    const x2 = targetPos.x - (minX || 0) + padding;
                                    const y2 = targetPos.y - (minY || 0) + padding;

                                    const midY = (y1 + y2) / 2;
                                    const abbr = getAbbreviation(edge.label);
                                    const fullLabel = capitalizeLabel(edge.label);
                                    const cx = (x1 + x2) / 2;
                                    const badgeW = abbr.length > 1 ? 36 : 26;
                                    const isEdgeHovered = hoveredEdge === edge.id;
                                    const tooltipW = Math.max(fullLabel.length * 7.5 + 24, 70);

                                    const edgeIsDivorced = edge.isDivorced || false;

                                    return (
                                        <g key={edge.id}>
                                            {/* Glow effect */}
                                            <path
                                                d={`M ${x1} ${y1 + 60} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2 - 60}`}
                                                stroke={edge.color}
                                                strokeWidth="4"
                                                fill="none"
                                                opacity={edgeIsDivorced ? 0.1 : 0.3}
                                                filter="blur(8px)"
                                            />
                                            {/* Main line */}
                                            <path
                                                d={`M ${x1} ${y1 + 60} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2 - 60}`}
                                                stroke={edge.color}
                                                strokeWidth="3"
                                                fill="none"
                                                opacity={edgeIsDivorced ? 0.5 : 0.9}
                                                strokeLinecap="round"
                                                strokeDasharray={edgeIsDivorced ? '8,6' : undefined}
                                            />
                                            {/* Abbreviated relationship badge with hover tooltip */}
                                            <g
                                                onMouseEnter={() => setHoveredEdge(edge.id)}
                                                onMouseLeave={() => setHoveredEdge(null)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {isEdgeHovered && (
                                                    <circle
                                                        cx={cx}
                                                        cy={midY}
                                                        r="20"
                                                        fill={edge.color}
                                                        opacity="0.2"
                                                        filter="blur(8px)"
                                                    />
                                                )}
                                                <rect
                                                    x={cx - badgeW / 2}
                                                    y={midY - 12}
                                                    width={badgeW}
                                                    height={24}
                                                    fill="rgba(15, 23, 42, 0.95)"
                                                    stroke={edge.color}
                                                    strokeWidth={isEdgeHovered ? '2' : '1.5'}
                                                    rx="12"
                                                    ry="12"
                                                />
                                                <text
                                                    x={cx}
                                                    y={midY + 4}
                                                    textAnchor="middle"
                                                    fontSize="11"
                                                    fontWeight="700"
                                                    fill={edge.color}
                                                    style={{ letterSpacing: '0.5px' }}
                                                >
                                                    {abbr}
                                                </text>
                                                {isEdgeHovered && (
                                                    <g>
                                                        <rect
                                                            x={cx - tooltipW / 2}
                                                            y={midY - 44}
                                                            width={tooltipW}
                                                            height={26}
                                                            fill={edge.color}
                                                            rx="13"
                                                            ry="13"
                                                            opacity="0.12"
                                                            filter="blur(6px)"
                                                        />
                                                        <rect
                                                            x={cx - tooltipW / 2}
                                                            y={midY - 44}
                                                            width={tooltipW}
                                                            height={26}
                                                            fill="rgba(15, 23, 42, 0.98)"
                                                            stroke={edge.color}
                                                            strokeWidth="1"
                                                            rx="13"
                                                            ry="13"
                                                        />
                                                        <text
                                                            x={cx}
                                                            y={midY - 27}
                                                            textAnchor="middle"
                                                            fontSize="11"
                                                            fontWeight="600"
                                                            fill={edge.color}
                                                            style={{ letterSpacing: '0.3px' }}
                                                        >
                                                            {fullLabel}
                                                        </text>
                                                    </g>
                                                )}
                                            </g>
                                        </g>
                                    );
                                });
                        })()}
                    </g>

                    {/* Inverted triangle connections for spouse groups */}
                    {treeData.spouseGroups && treeData.spouseGroups.map((group) => {
                        if (group.childIds.length === 0) return null;

                        const rootPos = nodePositions[treeData.rootUserId];
                        const spousePos = nodePositions[group.spouseId];
                        if (!rootPos || !spousePos) return null;

                        // Convert to SVG coordinates
                        const rootX = rootPos.x - (minX || 0) + padding;
                        const rootY = rootPos.y - (minY || 0) + padding;
                        const spouseX = spousePos.x - (minX || 0) + padding;
                        const spouseY = spousePos.y - (minY || 0) + padding;

                        const parentY = rootY + 60; // bottom of parent nodes

                        // Get child positions
                        const childPositions = group.childIds
                            .map(childId => {
                                const pos = nodePositions[childId];
                                if (!pos) return null;
                                return {
                                    id: childId,
                                    x: pos.x - (minX || 0) + padding,
                                    y: pos.y - (minY || 0) + padding,
                                };
                            })
                            .filter(Boolean) as { id: number; x: number; y: number }[];

                        if (childPositions.length === 0) return null;

                        // Junction point: centered horizontally over the children, not the parents
                        // This creates the slanted triangle effect
                        const childCenterX = childPositions.reduce((sum, c) => sum + c.x, 0) / childPositions.length;
                        const midX = childCenterX;
                        const childTopY = Math.min(...childPositions.map(c => c.y)) - 60;
                        const junctionY = childTopY - 30;

                        // Parent-to-child lines are always solid — divorce only affects the spouse-to-spouse edge
                        const lineColor = group.isDivorced ? '#38BDF8' : '#667eea';
                        const lineOpacity = group.isDivorced ? 0.8 : 0.85;
                        const glowOpacity = group.isDivorced ? 0.15 : 0.2;

                        // Calculate horizontal span of children for the horizontal fan bar
                        const childXs = childPositions.map(c => c.x);
                        const minChildX = Math.min(...childXs);
                        const maxChildX = Math.max(...childXs);

                        return (
                            <g key={`spouse-group-${group.spouseId}`}>
                                {/* Inverted triangle: two lines from each parent converging at junction */}
                                {/* Line from root node down to junction */}
                                <line
                                    x1={rootX} y1={parentY}
                                    x2={midX} y2={junctionY}
                                    stroke={lineColor}
                                    strokeWidth="4"
                                    opacity={glowOpacity}
                                    filter="blur(6px)"
                                />
                                <line
                                    x1={rootX} y1={parentY}
                                    x2={midX} y2={junctionY}
                                    stroke={lineColor}
                                    strokeWidth="2.5"
                                    opacity={lineOpacity}
                                    strokeLinecap="round"
                                />

                                {/* Line from spouse node down to junction */}
                                <line
                                    x1={spouseX} y1={parentY}
                                    x2={midX} y2={junctionY}
                                    stroke={lineColor}
                                    strokeWidth="4"
                                    opacity={glowOpacity}
                                    filter="blur(6px)"
                                />
                                <line
                                    x1={spouseX} y1={parentY}
                                    x2={midX} y2={junctionY}
                                    stroke={lineColor}
                                    strokeWidth="2.5"
                                    opacity={lineOpacity}
                                    strokeLinecap="round"
                                />

                                {/* Junction circle at convergence point */}
                                <circle
                                    cx={midX}
                                    cy={junctionY}
                                    r="5"
                                    fill={lineColor}
                                    opacity={lineOpacity}
                                />

                                {/* Horizontal bar spanning all children (if more than one child) */}
                                {childPositions.length > 1 && (
                                    <>
                                        {/* Glow */}
                                        <line
                                            x1={minChildX} y1={junctionY}
                                            x2={maxChildX} y2={junctionY}
                                            stroke={lineColor}
                                            strokeWidth="4"
                                            opacity={glowOpacity}
                                            filter="blur(6px)"
                                        />
                                        {/* Main line */}
                                        <line
                                            x1={minChildX} y1={junctionY}
                                            x2={maxChildX} y2={junctionY}
                                            stroke={lineColor}
                                            strokeWidth="2.5"
                                            opacity={lineOpacity}
                                            strokeLinecap="round"
                                        />
                                    </>
                                )}

                                {/* Vertical lines from horizontal bar down to each child with abbrev badges */}
                                {childPositions.map(child => {
                                    const childNode = treeData.nodes.find(n => n.id === child.id);
                                    const label = childNode?.relationshipType || '';
                                    const abbr = getAbbreviation(label);
                                    const fullLabel = capitalizeLabel(label);
                                    const badgeW = abbr.length > 1 ? 36 : 26;
                                    const badgeMidY = (junctionY + (child.y - 60)) / 2;
                                    const tooltipW = Math.max(fullLabel.length * 7.5 + 24, 70);
                                    const edgeId = `group-child-${child.id}`;
                                    const isEdgeHovered = hoveredEdge === edgeId;

                                    return (
                                        <g key={edgeId}>
                                            {/* Glow */}
                                            <line
                                                x1={child.x} y1={junctionY}
                                                x2={child.x} y2={child.y - 60}
                                                stroke={lineColor}
                                                strokeWidth="4"
                                                opacity={glowOpacity}
                                                filter="blur(6px)"
                                            />
                                            {/* Main line */}
                                            <line
                                                x1={child.x} y1={junctionY}
                                                x2={child.x} y2={child.y - 60}
                                                stroke={lineColor}
                                                strokeWidth="2.5"
                                                opacity={lineOpacity}
                                                strokeLinecap="round"
                                            />
                                            {/* Abbreviation badge */}
                                            <g
                                                onMouseEnter={() => setHoveredEdge(edgeId)}
                                                onMouseLeave={() => setHoveredEdge(null)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {isEdgeHovered && (
                                                    <circle
                                                        cx={child.x}
                                                        cy={badgeMidY}
                                                        r="20"
                                                        fill={lineColor}
                                                        opacity="0.2"
                                                        filter="blur(8px)"
                                                    />
                                                )}
                                                <rect
                                                    x={child.x - badgeW / 2}
                                                    y={badgeMidY - 12}
                                                    width={badgeW}
                                                    height={24}
                                                    fill="rgba(15, 23, 42, 0.95)"
                                                    stroke={lineColor}
                                                    strokeWidth={isEdgeHovered ? '2' : '1.5'}
                                                    rx="12"
                                                    ry="12"
                                                />
                                                <text
                                                    x={child.x}
                                                    y={badgeMidY + 4}
                                                    textAnchor="middle"
                                                    fontSize="11"
                                                    fontWeight="700"
                                                    fill={lineColor}
                                                    style={{ letterSpacing: '0.5px' }}
                                                >
                                                    {abbr}
                                                </text>
                                                {isEdgeHovered && (
                                                    <g>
                                                        <rect
                                                            x={child.x - tooltipW / 2}
                                                            y={badgeMidY - 44}
                                                            width={tooltipW}
                                                            height={26}
                                                            fill={lineColor}
                                                            rx="13"
                                                            ry="13"
                                                            opacity="0.12"
                                                            filter="blur(6px)"
                                                        />
                                                        <rect
                                                            x={child.x - tooltipW / 2}
                                                            y={badgeMidY - 44}
                                                            width={tooltipW}
                                                            height={26}
                                                            fill="rgba(15, 23, 42, 0.98)"
                                                            stroke={lineColor}
                                                            strokeWidth="1"
                                                            rx="13"
                                                            ry="13"
                                                        />
                                                        <text
                                                            x={child.x}
                                                            y={badgeMidY - 27}
                                                            textAnchor="middle"
                                                            fontSize="11"
                                                            fontWeight="600"
                                                            fill={lineColor}
                                                            style={{ letterSpacing: '0.3px' }}
                                                        >
                                                            {fullLabel}
                                                        </text>
                                                    </g>
                                                )}
                                            </g>
                                        </g>
                                    );
                                })}
                            </g>
                        );
                    })}

                    {/* Family unit: Michael → siblings bar → parents inverted triangle */}
                    {(() => {
                        const siblingNodes = treeData.nodes.filter(n => ['brother', 'sister', 'sibling'].includes(n.relationshipType));
                        const parentNodes = treeData.nodes.filter(n => ['father', 'mother', 'parent'].includes(n.relationshipType));

                        // Only render if there are siblings or parents
                        if (siblingNodes.length === 0 && parentNodes.length === 0) return null;

                        const rootPos = nodePositions[treeData.rootUserId];
                        if (!rootPos) return null;

                        const rootX = rootPos.x - (minX || 0) + padding;
                        const rootY = rootPos.y - (minY || 0) + padding;
                        const rootTopY = rootY - 60; // top of root node

                        // Get sibling positions
                        const siblingPositions = siblingNodes.map(n => {
                            const pos = nodePositions[n.id];
                            if (!pos) return null;
                            return {
                                id: n.id,
                                x: pos.x - (minX || 0) + padding,
                                y: pos.y - (minY || 0) + padding,
                                relationshipType: n.relationshipType,
                            };
                        }).filter(Boolean) as { id: number; x: number; y: number; relationshipType: string }[];

                        // Get parent positions
                        const parentPositions = parentNodes.map(n => {
                            const pos = nodePositions[n.id];
                            if (!pos) return null;
                            return {
                                id: n.id,
                                x: pos.x - (minX || 0) + padding,
                                y: pos.y - (minY || 0) + padding,
                            };
                        }).filter(Boolean) as { id: number; x: number; y: number }[];

                        const familyUnitColor = '#8B5CF6'; // Purple for family unit
                        const familyUnitOpacity = 0.85;
                        const glowOpacity = 0.2;

                        // Calculate the sibling bar bounds and midpoint
                        let junctionX = rootX; // default: directly above Michael
                        let junctionY = rootTopY - 40;
                        let barMinX = junctionX;
                        let barMaxX = junctionX;

                        if (siblingPositions.length > 0) {
                            const siblingXs = siblingPositions.map(s => s.x);
                            barMinX = Math.min(...siblingXs);
                            barMaxX = Math.max(...siblingXs);
                            // The bar extends to include Michael's vertical line connection point
                            // Junction is at the midpoint of all siblings
                            junctionX = (barMinX + barMaxX) / 2;
                            junctionY = siblingPositions[0].y; // siblings are all on the same row
                        }

                        return (
                            <g>
                                {/* 1. Vertical line from root up to the junction/siblings row (only if siblings exist) */}
                                {siblingPositions.length > 0 && (
                                    <>
                                        <line
                                            x1={rootX} y1={rootTopY}
                                            x2={rootX} y2={junctionY}
                                            stroke={familyUnitColor}
                                            strokeWidth="4"
                                            opacity={glowOpacity}
                                            filter="blur(6px)"
                                        />
                                        <line
                                            x1={rootX} y1={rootTopY}
                                            x2={rootX} y2={junctionY}
                                            stroke={familyUnitColor}
                                            strokeWidth="2.5"
                                            opacity={familyUnitOpacity}
                                            strokeLinecap="round"
                                        />
                                        {/* Sibling badge on root's vertical line */}
                                        {(() => {
                                            const sbMidY = (rootTopY + junctionY) / 2;
                                            const sbEdgeId = 'family-sibling-link';
                                            const isSbHovered = hoveredEdge === sbEdgeId;
                                            const sbTooltipW = 70;
                                            return (
                                                <g
                                                    onMouseEnter={() => setHoveredEdge(sbEdgeId)}
                                                    onMouseLeave={() => setHoveredEdge(null)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {isSbHovered && (
                                                        <circle cx={rootX} cy={sbMidY} r="20" fill={familyUnitColor} opacity="0.2" filter="blur(8px)" />
                                                    )}
                                                    <rect
                                                        x={rootX - 18} y={sbMidY - 12}
                                                        width={36} height={24}
                                                        fill="rgba(15, 23, 42, 0.95)"
                                                        stroke={familyUnitColor}
                                                        strokeWidth={isSbHovered ? '2' : '1.5'}
                                                        rx="12" ry="12"
                                                    />
                                                    <text x={rootX} y={sbMidY + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={familyUnitColor} style={{ letterSpacing: '0.5px' }}>
                                                        Sb
                                                    </text>
                                                    {isSbHovered && (
                                                        <g>
                                                            <rect x={rootX - sbTooltipW / 2} y={sbMidY - 44} width={sbTooltipW} height={26} fill={familyUnitColor} rx="13" ry="13" opacity="0.12" filter="blur(6px)" />
                                                            <rect x={rootX - sbTooltipW / 2} y={sbMidY - 44} width={sbTooltipW} height={26} fill="rgba(15, 23, 42, 0.98)" stroke={familyUnitColor} strokeWidth="1" rx="13" ry="13" />
                                                            <text x={rootX} y={sbMidY - 27} textAnchor="middle" fontSize="11" fontWeight="600" fill={familyUnitColor} style={{ letterSpacing: '0.3px' }}>Sibling</text>
                                                        </g>
                                                    )}
                                                </g>
                                            );
                                        })()}
                                    </>
                                )}

                                {/* 2. Horizontal bar connecting all siblings (and passing through junction) */}
                                {siblingPositions.length > 0 && (
                                    <>
                                        {/* Extend bar to include rootX if it's not already within range */}
                                        <line
                                            x1={Math.min(barMinX, rootX)} y1={junctionY}
                                            x2={Math.max(barMaxX, rootX)} y2={junctionY}
                                            stroke={familyUnitColor}
                                            strokeWidth="4"
                                            opacity={glowOpacity}
                                            filter="blur(6px)"
                                        />
                                        <line
                                            x1={Math.min(barMinX, rootX)} y1={junctionY}
                                            x2={Math.max(barMaxX, rootX)} y2={junctionY}
                                            stroke={familyUnitColor}
                                            strokeWidth="2.5"
                                            opacity={familyUnitOpacity}
                                            strokeLinecap="round"
                                        />

                                        {/* Junction circle where Michael's line meets the bar */}
                                        <circle
                                            cx={rootX}
                                            cy={junctionY}
                                            r="5"
                                            fill={familyUnitColor}
                                            opacity={familyUnitOpacity}
                                        />

                                        {/* Abbreviation badges on sibling vertical stubs (bar to sibling node) */}
                                        {siblingPositions.map(sib => {
                                            const label = sib.relationshipType;
                                            const abbr = getAbbreviation(label);
                                            const fullLabel = capitalizeLabel(label);
                                            const badgeW = abbr.length > 1 ? 36 : 26;
                                            // Short vertical stub from bar down to sibling node
                                            const stubTopY = junctionY;
                                            const stubBottomY = sib.y - 55;
                                            const badgeMidY = (stubTopY + stubBottomY) / 2;
                                            const tooltipW = Math.max(fullLabel.length * 7.5 + 24, 70);
                                            const edgeId = `family-sib-${sib.id}`;
                                            const isEdgeHovered = hoveredEdge === edgeId;

                                            return (
                                                <g key={edgeId}>
                                                    {/* Vertical stub from bar to sibling */}
                                                    <line
                                                        x1={sib.x} y1={stubTopY}
                                                        x2={sib.x} y2={stubBottomY}
                                                        stroke={familyUnitColor}
                                                        strokeWidth="4"
                                                        opacity={glowOpacity}
                                                        filter="blur(6px)"
                                                    />
                                                    <line
                                                        x1={sib.x} y1={stubTopY}
                                                        x2={sib.x} y2={stubBottomY}
                                                        stroke={familyUnitColor}
                                                        strokeWidth="2.5"
                                                        opacity={familyUnitOpacity}
                                                        strokeLinecap="round"
                                                    />
                                                    {/* Badge */}
                                                    <g
                                                        onMouseEnter={() => setHoveredEdge(edgeId)}
                                                        onMouseLeave={() => setHoveredEdge(null)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {isEdgeHovered && (
                                                            <circle cx={sib.x} cy={badgeMidY} r="20" fill={familyUnitColor} opacity="0.2" filter="blur(8px)" />
                                                        )}
                                                        <rect
                                                            x={sib.x - badgeW / 2} y={badgeMidY - 12}
                                                            width={badgeW} height={24}
                                                            fill="rgba(15, 23, 42, 0.95)"
                                                            stroke={familyUnitColor}
                                                            strokeWidth={isEdgeHovered ? '2' : '1.5'}
                                                            rx="12" ry="12"
                                                        />
                                                        <text x={sib.x} y={badgeMidY + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={familyUnitColor} style={{ letterSpacing: '0.5px' }}>
                                                            {abbr}
                                                        </text>
                                                        {isEdgeHovered && (
                                                            <g>
                                                                <rect x={sib.x - tooltipW / 2} y={badgeMidY - 44} width={tooltipW} height={26} fill={familyUnitColor} rx="13" ry="13" opacity="0.12" filter="blur(6px)" />
                                                                <rect x={sib.x - tooltipW / 2} y={badgeMidY - 44} width={tooltipW} height={26} fill="rgba(15, 23, 42, 0.98)" stroke={familyUnitColor} strokeWidth="1" rx="13" ry="13" />
                                                                <text x={sib.x} y={badgeMidY - 27} textAnchor="middle" fontSize="11" fontWeight="600" fill={familyUnitColor} style={{ letterSpacing: '0.3px' }}>{fullLabel}</text>
                                                            </g>
                                                        )}
                                                    </g>
                                                </g>
                                            );
                                        })}
                                    </>
                                )}

                                {/* 3. Parents inverted triangle down to junction (if siblings) or root top (if no siblings) */}
                                {parentPositions.length > 0 && (() => {
                                    const triangleTargetX = rootX;
                                    const triangleTargetY = siblingPositions.length > 0 ? junctionY : rootTopY;

                                    const parentColor = '#3B82F6'; // Blue for parent connections

                                    return (
                                        <g>

                                            {/* Lines from each parent down to the triangle junction */}
                                            {parentPositions.map(par => {
                                                const parBottomY = par.y + 60;
                                                const label = treeData.nodes.find(n => n.id === par.id)?.relationshipType || '';
                                                const abbr = getAbbreviation(label);
                                                const fullLabel = capitalizeLabel(label);
                                                const badgeW = abbr.length > 1 ? 36 : 26;
                                                const midLineX = (par.x + triangleTargetX) / 2;
                                                const midLineY = (parBottomY + triangleTargetY) / 2;
                                                const tooltipW = Math.max(fullLabel.length * 7.5 + 24, 70);
                                                const edgeId = `family-par-${par.id}`;
                                                const isEdgeHovered = hoveredEdge === edgeId;

                                                return (
                                                    <g key={edgeId}>
                                                        {/* Glow */}
                                                        <line
                                                            x1={par.x} y1={parBottomY}
                                                            x2={triangleTargetX} y2={triangleTargetY}
                                                            stroke={parentColor}
                                                            strokeWidth="4"
                                                            opacity={0.15}
                                                            filter="blur(6px)"
                                                        />
                                                        {/* Main line */}
                                                        <line
                                                            x1={par.x} y1={parBottomY}
                                                            x2={triangleTargetX} y2={triangleTargetY}
                                                            stroke={parentColor}
                                                            strokeWidth="2.5"
                                                            opacity={0.85}
                                                            strokeLinecap="round"
                                                        />
                                                        {/* Badge */}
                                                        <g
                                                            onMouseEnter={() => setHoveredEdge(edgeId)}
                                                            onMouseLeave={() => setHoveredEdge(null)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            {isEdgeHovered && (
                                                                <circle cx={midLineX} cy={midLineY} r="20" fill={parentColor} opacity="0.2" filter="blur(8px)" />
                                                            )}
                                                            <rect
                                                                x={midLineX - badgeW / 2} y={midLineY - 12}
                                                                width={badgeW} height={24}
                                                                fill="rgba(15, 23, 42, 0.95)"
                                                                stroke={parentColor}
                                                                strokeWidth={isEdgeHovered ? '2' : '1.5'}
                                                                rx="12" ry="12"
                                                            />
                                                            <text x={midLineX} y={midLineY + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={parentColor} style={{ letterSpacing: '0.5px' }}>
                                                                {abbr}
                                                            </text>
                                                            {isEdgeHovered && (
                                                                <g>
                                                                    <rect x={midLineX - tooltipW / 2} y={midLineY - 44} width={tooltipW} height={26} fill={parentColor} rx="13" ry="13" opacity="0.12" filter="blur(6px)" />
                                                                    <rect x={midLineX - tooltipW / 2} y={midLineY - 44} width={tooltipW} height={26} fill="rgba(15, 23, 42, 0.98)" stroke={parentColor} strokeWidth="1" rx="13" ry="13" />
                                                                    <text x={midLineX} y={midLineY - 27} textAnchor="middle" fontSize="11" fontWeight="600" fill={parentColor} style={{ letterSpacing: '0.3px' }}>{fullLabel}</text>
                                                                </g>
                                                            )}
                                                        </g>
                                                    </g>
                                                );
                                            })}
                                        </g>
                                    );
                                })()}
                            </g>
                        );
                    })()}

                    {/* Parent Family Units: extended family through parents */}
                    {treeData.parentFamilyUnits && treeData.parentFamilyUnits.map((unit) => {
                        const parentPos = nodePositions[unit.parentId];
                        if (!parentPos) return null;

                        const parX = parentPos.x - (minX || 0) + padding;
                        const parY = parentPos.y - (minY || 0) + padding;
                        const parBottomY = parY + 55;
                        const parTopY = parY - 55;

                        const pfuColor = '#6366F1'; // Indigo for extended family
                        const pfuOpacity = 0.85;
                        const pfuGlow = 0.2;

                        // Get uncle/aunt positions
                        const uncleAuntPositions = unit.siblings.map(id => {
                            const pos = nodePositions[id];
                            if (!pos) return null;
                            const node = treeData.nodes.find(n => n.id === id);
                            return {
                                id,
                                x: pos.x - (minX || 0) + padding,
                                y: pos.y - (minY || 0) + padding,
                                relationshipType: node?.relationshipType || '',
                            };
                        }).filter(Boolean) as { id: number; x: number; y: number; relationshipType: string }[];

                        // Get grandparent positions
                        const grandparentPositions = unit.parents.map(id => {
                            const pos = nodePositions[id];
                            if (!pos) return null;
                            const node = treeData.nodes.find(n => n.id === id);
                            return {
                                id,
                                x: pos.x - (minX || 0) + padding,
                                y: pos.y - (minY || 0) + padding,
                                relationshipType: node?.relationshipType || '',
                            };
                        }).filter(Boolean) as { id: number; x: number; y: number; relationshipType: string }[];

                        // Calculate uncle/aunt bar
                        let uaJunctionY = parTopY - 40;
                        let uaBarMinX = parX;
                        let uaBarMaxX = parX;
                        if (uncleAuntPositions.length > 0) {
                            const uaXs = uncleAuntPositions.map(u => u.x);
                            uaBarMinX = Math.min(...uaXs);
                            uaBarMaxX = Math.max(...uaXs);
                            uaJunctionY = uncleAuntPositions[0].y;
                        }

                        return (
                            <g key={`pfu-${unit.parentId}`}>
                                {/* Uncle/Aunt T-shape: vertical from parent up to horizontal bar */}
                                {uncleAuntPositions.length > 0 && (
                                    <g>
                                        {/* Vertical line from parent up to uncle/aunt row */}
                                        <line x1={parX} y1={parTopY} x2={parX} y2={uaJunctionY} stroke={pfuColor} strokeWidth="4" opacity={pfuGlow} filter="blur(6px)" />
                                        <line x1={parX} y1={parTopY} x2={parX} y2={uaJunctionY} stroke={pfuColor} strokeWidth="2.5" opacity={pfuOpacity} strokeLinecap="round" />

                                        {/* Horizontal bar */}
                                        <line x1={Math.min(uaBarMinX, parX)} y1={uaJunctionY} x2={Math.max(uaBarMaxX, parX)} y2={uaJunctionY} stroke={pfuColor} strokeWidth="4" opacity={pfuGlow} filter="blur(6px)" />
                                        <line x1={Math.min(uaBarMinX, parX)} y1={uaJunctionY} x2={Math.max(uaBarMaxX, parX)} y2={uaJunctionY} stroke={pfuColor} strokeWidth="2.5" opacity={pfuOpacity} strokeLinecap="round" />

                                        {/* Junction circle */}
                                        <circle cx={parX} cy={uaJunctionY} r="5" fill={pfuColor} opacity={pfuOpacity} />

                                        {/* Vertical stubs to each uncle/aunt with badges */}
                                        {uncleAuntPositions.map(ua => {
                                            const label = ua.relationshipType;
                                            const abbr = getAbbreviation(label);
                                            const fullLabel = capitalizeLabel(label);
                                            const badgeW = abbr.length > 2 ? 42 : abbr.length > 1 ? 36 : 26;
                                            const stubBottomY = ua.y - 55;
                                            const badgeMidY = (uaJunctionY + stubBottomY) / 2;
                                            const tooltipW = Math.max(fullLabel.length * 7.5 + 24, 70);
                                            const edgeId = `pfu-ua-${ua.id}`;
                                            const isEdgeHovered = hoveredEdge === edgeId;

                                            return (
                                                <g key={edgeId}>
                                                    <line x1={ua.x} y1={uaJunctionY} x2={ua.x} y2={stubBottomY} stroke={pfuColor} strokeWidth="4" opacity={pfuGlow} filter="blur(6px)" />
                                                    <line x1={ua.x} y1={uaJunctionY} x2={ua.x} y2={stubBottomY} stroke={pfuColor} strokeWidth="2.5" opacity={pfuOpacity} strokeLinecap="round" />
                                                    <g onMouseEnter={() => setHoveredEdge(edgeId)} onMouseLeave={() => setHoveredEdge(null)} style={{ cursor: 'pointer' }}>
                                                        {isEdgeHovered && <circle cx={ua.x} cy={badgeMidY} r="20" fill={pfuColor} opacity="0.2" filter="blur(8px)" />}
                                                        <rect x={ua.x - badgeW / 2} y={badgeMidY - 12} width={badgeW} height={24} fill="rgba(15, 23, 42, 0.95)" stroke={pfuColor} strokeWidth={isEdgeHovered ? '2' : '1.5'} rx="12" ry="12" />
                                                        <text x={ua.x} y={badgeMidY + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={pfuColor} style={{ letterSpacing: '0.5px' }}>{abbr}</text>
                                                        {isEdgeHovered && (
                                                            <g>
                                                                <rect x={ua.x - tooltipW / 2} y={badgeMidY - 44} width={tooltipW} height={26} fill={pfuColor} rx="13" ry="13" opacity="0.12" filter="blur(6px)" />
                                                                <rect x={ua.x - tooltipW / 2} y={badgeMidY - 44} width={tooltipW} height={26} fill="rgba(15, 23, 42, 0.98)" stroke={pfuColor} strokeWidth="1" rx="13" ry="13" />
                                                                <text x={ua.x} y={badgeMidY - 27} textAnchor="middle" fontSize="11" fontWeight="600" fill={pfuColor} style={{ letterSpacing: '0.3px' }}>{fullLabel}</text>
                                                            </g>
                                                        )}
                                                    </g>
                                                </g>
                                            );
                                        })}
                                    </g>
                                )}

                                {/* Grandparents V-shape: lines from each grandparent down to junction */}
                                {grandparentPositions.length > 0 && (() => {
                                    const gpTargetX = parX;
                                    const gpTargetY = uncleAuntPositions.length > 0 ? uaJunctionY : parTopY - 40;
                                    const gpColor = '#7C3AED'; // Violet for grandparents

                                    return (
                                        <g>
                                            {grandparentPositions.map(gp => {
                                                const gpBottomY = gp.y + 60;
                                                const label = gp.relationshipType;
                                                const abbr = getAbbreviation(label);
                                                const fullLabel = capitalizeLabel(label);
                                                const badgeW = abbr.length > 2 ? 42 : abbr.length > 1 ? 36 : 26;
                                                const midX = (gp.x + gpTargetX) / 2;
                                                const midY = (gpBottomY + gpTargetY) / 2;
                                                const tooltipW = Math.max(fullLabel.length * 7.5 + 24, 70);
                                                const edgeId = `pfu-gp-${gp.id}`;
                                                const isEdgeHovered = hoveredEdge === edgeId;

                                                return (
                                                    <g key={edgeId}>
                                                        <line x1={gp.x} y1={gpBottomY} x2={gpTargetX} y2={gpTargetY} stroke={gpColor} strokeWidth="4" opacity={0.15} filter="blur(6px)" />
                                                        <line x1={gp.x} y1={gpBottomY} x2={gpTargetX} y2={gpTargetY} stroke={gpColor} strokeWidth="2.5" opacity={0.85} strokeLinecap="round" />
                                                        <g onMouseEnter={() => setHoveredEdge(edgeId)} onMouseLeave={() => setHoveredEdge(null)} style={{ cursor: 'pointer' }}>
                                                            {isEdgeHovered && <circle cx={midX} cy={midY} r="20" fill={gpColor} opacity="0.2" filter="blur(8px)" />}
                                                            <rect x={midX - badgeW / 2} y={midY - 12} width={badgeW} height={24} fill="rgba(15, 23, 42, 0.95)" stroke={gpColor} strokeWidth={isEdgeHovered ? '2' : '1.5'} rx="12" ry="12" />
                                                            <text x={midX} y={midY + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={gpColor} style={{ letterSpacing: '0.5px' }}>{abbr}</text>
                                                            {isEdgeHovered && (
                                                                <g>
                                                                    <rect x={midX - tooltipW / 2} y={midY - 44} width={tooltipW} height={26} fill={gpColor} rx="13" ry="13" opacity="0.12" filter="blur(6px)" />
                                                                    <rect x={midX - tooltipW / 2} y={midY - 44} width={tooltipW} height={26} fill="rgba(15, 23, 42, 0.98)" stroke={gpColor} strokeWidth="1" rx="13" ry="13" />
                                                                    <text x={midX} y={midY - 27} textAnchor="middle" fontSize="11" fontWeight="600" fill={gpColor} style={{ letterSpacing: '0.3px' }}>{fullLabel}</text>
                                                                </g>
                                                            )}
                                                        </g>
                                                    </g>
                                                );
                                            })}
                                        </g>
                                    );
                                })()}

                                {/* Other spouses of parent + step-sibling inverted triangles */}
                                {unit.otherSpouses.map(os => {
                                    const spousePos = nodePositions[os.spouseId];
                                    if (!spousePos) return null;

                                    const spX = spousePos.x - (minX || 0) + padding;
                                    const spY = spousePos.y - (minY || 0) + padding;

                                    const spouseNode = treeData.nodes.find(n => n.id === os.spouseId);
                                    const spouseLabel = spouseNode?.relationshipType || '';
                                    const spouseAbbr = getAbbreviation(spouseLabel);
                                    const spouseFullLabel = capitalizeLabel(spouseLabel);
                                    const spouseBadgeW = spouseAbbr.length > 2 ? 42 : spouseAbbr.length > 1 ? 36 : 26;
                                    const midSpX = (parX + spX) / 2;
                                    const spTooltipW = Math.max(spouseFullLabel.length * 7.5 + 24, 70);
                                    const spEdgeId = `pfu-sp-${os.spouseId}`;
                                    const isSpHovered = hoveredEdge === spEdgeId;

                                    const spouseLineColor = os.isDivorced ? '#9CA3AF' : '#F472B6';
                                    const spouseLineOpacity = os.isDivorced ? 0.5 : 0.85;

                                    // Step-sibling positions
                                    const stepChildPositions = os.childIds
                                        .map(childId => {
                                            const pos = nodePositions[childId];
                                            if (!pos) return null;
                                            const node = treeData.nodes.find(n => n.id === childId);
                                            return {
                                                id: childId,
                                                x: pos.x - (minX || 0) + padding,
                                                y: pos.y - (minY || 0) + padding,
                                                relationshipType: node?.relationshipType || '',
                                            };
                                        })
                                        .filter(Boolean) as { id: number; x: number; y: number; relationshipType: string }[];

                                    // Determine line endpoints: from inner edges of both nodes
                                    const lineX1 = Math.min(parX, spX) + 60;
                                    const lineX2 = Math.max(parX, spX) - 60;

                                    return (
                                        <g key={`pfu-os-${os.spouseId}`}>
                                            {/* Horizontal line from parent to other spouse */}
                                            <line x1={lineX1} y1={parY} x2={lineX2} y2={spY} stroke={spouseLineColor} strokeWidth="4" opacity={pfuGlow} filter="blur(6px)" />
                                            <line
                                                x1={lineX1} y1={parY} x2={lineX2} y2={spY}
                                                stroke={spouseLineColor} strokeWidth="2.5" opacity={spouseLineOpacity}
                                                strokeLinecap="round"
                                                strokeDasharray={os.isDivorced ? '8,6' : undefined}
                                            />
                                            {/* Spouse badge */}
                                            <g onMouseEnter={() => setHoveredEdge(spEdgeId)} onMouseLeave={() => setHoveredEdge(null)} style={{ cursor: 'pointer' }}>
                                                {isSpHovered && <circle cx={midSpX} cy={parY} r="20" fill={spouseLineColor} opacity="0.2" filter="blur(8px)" />}
                                                <rect x={midSpX - spouseBadgeW / 2} y={parY - 12} width={spouseBadgeW} height={24} fill="rgba(15, 23, 42, 0.95)" stroke={spouseLineColor} strokeWidth={isSpHovered ? '2' : '1.5'} rx="12" ry="12" />
                                                <text x={midSpX} y={parY + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={spouseLineColor} style={{ letterSpacing: '0.5px' }}>{spouseAbbr}</text>
                                                {isSpHovered && (
                                                    <g>
                                                        <rect x={midSpX - spTooltipW / 2} y={parY - 44} width={spTooltipW} height={26} fill={spouseLineColor} rx="13" ry="13" opacity="0.12" filter="blur(6px)" />
                                                        <rect x={midSpX - spTooltipW / 2} y={parY - 44} width={spTooltipW} height={26} fill="rgba(15, 23, 42, 0.98)" stroke={spouseLineColor} strokeWidth="1" rx="13" ry="13" />
                                                        <text x={midSpX} y={parY - 27} textAnchor="middle" fontSize="11" fontWeight="600" fill={spouseLineColor} style={{ letterSpacing: '0.3px' }}>{spouseFullLabel}</text>
                                                    </g>
                                                )}
                                            </g>

                                            {/* Inverted triangle for step-siblings */}
                                            {stepChildPositions.length > 0 && (() => {
                                                const stepColor = '#8B5CF6';
                                                const stepOpacity = 0.85;
                                                const stepGlow = 0.2;
                                                const stepParentY = spY + 60;

                                                const childCenterX = stepChildPositions.reduce((sum, c) => sum + c.x, 0) / stepChildPositions.length;
                                                const childTopY = Math.min(...stepChildPositions.map(c => c.y)) - 60;
                                                const junctionY = childTopY - 30;

                                                const childXs = stepChildPositions.map(c => c.x);
                                                const minStepChildX = Math.min(...childXs);
                                                const maxStepChildX = Math.max(...childXs);

                                                return (
                                                    <g>
                                                        {/* Line from parent down to junction (inverted triangle) */}
                                                        <line x1={parX} y1={parBottomY} x2={childCenterX} y2={junctionY} stroke={stepColor} strokeWidth="4" opacity={stepGlow} filter="blur(6px)" />
                                                        <line x1={parX} y1={parBottomY} x2={childCenterX} y2={junctionY} stroke={stepColor} strokeWidth="2.5" opacity={stepOpacity} strokeLinecap="round" />

                                                        {/* Line from step-parent down to junction (inverted triangle) */}
                                                        <line x1={spX} y1={stepParentY} x2={childCenterX} y2={junctionY} stroke={stepColor} strokeWidth="4" opacity={stepGlow} filter="blur(6px)" />
                                                        <line x1={spX} y1={stepParentY} x2={childCenterX} y2={junctionY} stroke={stepColor} strokeWidth="2.5" opacity={stepOpacity} strokeLinecap="round" />

                                                        {/* Junction circle */}
                                                        <circle cx={childCenterX} cy={junctionY} r="5" fill={stepColor} opacity={stepOpacity} />

                                                        {/* Horizontal bar if multiple children */}
                                                        {stepChildPositions.length > 1 && (
                                                            <>
                                                                <line x1={minStepChildX} y1={junctionY} x2={maxStepChildX} y2={junctionY} stroke={stepColor} strokeWidth="4" opacity={stepGlow} filter="blur(6px)" />
                                                                <line x1={minStepChildX} y1={junctionY} x2={maxStepChildX} y2={junctionY} stroke={stepColor} strokeWidth="2.5" opacity={stepOpacity} strokeLinecap="round" />
                                                            </>
                                                        )}

                                                        {/* Vertical lines to each step-child with badges */}
                                                        {stepChildPositions.map(child => {
                                                            const label = child.relationshipType;
                                                            const abbr = getAbbreviation(label);
                                                            const fullLabel = capitalizeLabel(label);
                                                            const badgeW = abbr.length > 2 ? 42 : abbr.length > 1 ? 36 : 26;
                                                            const badgeMidY = (junctionY + (child.y - 60)) / 2;
                                                            const tooltipW = Math.max(fullLabel.length * 7.5 + 24, 70);
                                                            const edgeId = `pfu-step-${child.id}`;
                                                            const isEdgeHovered = hoveredEdge === edgeId;

                                                            return (
                                                                <g key={edgeId}>
                                                                    <line x1={child.x} y1={junctionY} x2={child.x} y2={child.y - 60} stroke={stepColor} strokeWidth="4" opacity={stepGlow} filter="blur(6px)" />
                                                                    <line x1={child.x} y1={junctionY} x2={child.x} y2={child.y - 60} stroke={stepColor} strokeWidth="2.5" opacity={stepOpacity} strokeLinecap="round" />
                                                                    <g onMouseEnter={() => setHoveredEdge(edgeId)} onMouseLeave={() => setHoveredEdge(null)} style={{ cursor: 'pointer' }}>
                                                                        {isEdgeHovered && <circle cx={child.x} cy={badgeMidY} r="20" fill={stepColor} opacity="0.2" filter="blur(8px)" />}
                                                                        <rect x={child.x - badgeW / 2} y={badgeMidY - 12} width={badgeW} height={24} fill="rgba(15, 23, 42, 0.95)" stroke={stepColor} strokeWidth={isEdgeHovered ? '2' : '1.5'} rx="12" ry="12" />
                                                                        <text x={child.x} y={badgeMidY + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={stepColor} style={{ letterSpacing: '0.5px' }}>{abbr}</text>
                                                                        {isEdgeHovered && (
                                                                            <g>
                                                                                <rect x={child.x - tooltipW / 2} y={badgeMidY - 44} width={tooltipW} height={26} fill={stepColor} rx="13" ry="13" opacity="0.12" filter="blur(6px)" />
                                                                                <rect x={child.x - tooltipW / 2} y={badgeMidY - 44} width={tooltipW} height={26} fill="rgba(15, 23, 42, 0.98)" stroke={stepColor} strokeWidth="1" rx="13" ry="13" />
                                                                                <text x={child.x} y={badgeMidY - 27} textAnchor="middle" fontSize="11" fontWeight="600" fill={stepColor} style={{ letterSpacing: '0.3px' }}>{fullLabel}</text>
                                                                            </g>
                                                                        )}
                                                                    </g>
                                                                </g>
                                                            );
                                                        })}
                                                    </g>
                                                );
                                            })()}
                                        </g>
                                    );
                                })}
                            </g>
                        );
                    })}

                    {/* Draw nodes */}
                    <g>
                        {treeData.nodes.map((node) => {
                            const pos = nodePositions[node.id];
                            if (!pos) return null;

                            const x = pos.x - (minX || 0) + padding;
                            const y = pos.y - (minY || 0) + padding;
                            const isRoot = node.id === treeData.rootUserId;
                            const isHovered = hoveredNode === node.id && !node.shouldBlur;
                            const radius = isRoot ? 60 : 50;
                            const shouldBlur = node.shouldBlur || false;

                            return (
                                <g
                                    key={`node-${node.id}`}
                                    onMouseEnter={() => !shouldBlur && setHoveredNode(node.id)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    style={{ cursor: shouldBlur ? 'not-allowed' : 'pointer', opacity: shouldBlur ? 0.6 : 1 }}
                                >
                                    {/* Glow effect */}
                                    {(isRoot || isHovered) && !shouldBlur && (
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
                                            filter: shouldBlur
                                                ? 'blur(8px) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))'
                                                : `drop-shadow(0 ${isHovered ? 12 : 8}px ${isHovered ? 24 : 16}px rgba(0, 0, 0, 0.4))`
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
                                                style={{
                                                    filter: shouldBlur ? 'blur(8px)' : 'none'
                                                }}
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
                                            style={{
                                                filter: shouldBlur ? 'blur(4px)' : 'none'
                                            }}
                                        >
                                            {shouldBlur ? '█' : node.name.charAt(0).toUpperCase()}
                                        </text>
                                    )}
                                    {/* Clickable overlay for avatar - switches to this user's tree */}
                                    {onAvatarClick && (
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r={radius}
                                            fill="transparent"
                                            onClick={(e) => handleAvatarClick(node.id, shouldBlur, e)}
                                            style={{
                                                cursor: shouldBlur ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <title>{shouldBlur ? 'This user has hidden their tree' : `Click to view ${node.name.split(' ')[0]}'s tree`}</title>
                                        </circle>
                                    )}
                                    {/* Name label - clickable */}
                                    <text
                                        x={x}
                                        y={y + radius + 25}
                                        textAnchor="middle"
                                        fontSize="14"
                                        fontWeight="700"
                                        fill={shouldBlur ? '#FFFFFF' : '#38BDF8'}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNodeClick(node.username, shouldBlur);
                                        }}
                                        style={{
                                            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                                            filter: shouldBlur ? 'blur(4px)' : 'none',
                                            cursor: shouldBlur ? 'not-allowed' : 'pointer',
                                            textDecoration: shouldBlur ? 'none' : 'underline',
                                            textUnderlineOffset: '3px'
                                        }}
                                    >
                                        {shouldBlur ? '████████' : node.name.split(' ')[0]}
                                    </text>
                                    {/* Blurred badge */}
                                    {shouldBlur && (
                                        <title>This user has hidden their nuclear family details</title>
                                    )}
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
                {treeData.edges.some(e => e.isDivorced) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <svg width="30" height="8">
                            <line x1="0" y1="4" x2="30" y2="4" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4,3" opacity="0.6" />
                        </svg>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Divorced</span>
                    </div>
                )}
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Drag to pan • Scroll to zoom
                </div>
            </div>
        </div>
    );
};

export default ConnectionTreeVisualization;
