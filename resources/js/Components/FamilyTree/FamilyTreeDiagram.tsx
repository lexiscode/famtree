import React, { useMemo } from 'react';

interface Member {
    id: number;
    name: string;
    profile_image_url?: string;
}

interface Connection {
    from: number;
    to: number;
    relationship: string;
}

interface Props {
    members: Member[];
    connections: Connection[];
    rootUserId: number;
}

const getRelationshipColor = (relationship: string): string => {
    const relationshipColors: Record<string, string> = {
        mother: '#A7F3D0',      // Green for parents
        father: '#A7F3D0',      // Green for parents
        child: '#FCA5AC',       // Red for children
        son: '#FCA5AC',         // Red for children
        daughter: '#FCA5AC',    // Red for children
        wife: '#FFD699',        // Orange for spouses
        husband: '#FFD699',     // Orange for spouses
        partner: '#FFD699',     // Orange for spouses
        brother: '#38BDF8',     // Blue for siblings
        sister: '#38BDF8',      // Blue for siblings
        sibling: '#38BDF8',     // Blue for siblings
        grandmother: '#C084FC', // Purple for grandparents
        grandfather: '#C084FC', // Purple for grandparents
        grandchild: '#FB923C',  // Amber for grandchildren
        grandson: '#FB923C',    // Amber for grandchildren
        granddaughter: '#FB923C',// Amber for grandchildren
        aunt: '#A78BFA',        // Indigo for extended family
        uncle: '#A78BFA',       // Indigo for extended family
        niece: '#A78BFA',       // Indigo for extended family
        nephew: '#A78BFA',      // Indigo for extended family
        cousin: '#93C5FD',      // Light blue for cousins
    };
    return relationshipColors[relationship.toLowerCase()] || '#CBD5E1';
};

const FamilyTreeDiagram: React.FC<Props> = ({ members, connections, rootUserId }) => {
    const diagramData = useMemo(() => {
        if (members.length === 0 || !members.some(m => m.name)) return null;

        // Calculate positions for nodes using a simple layout algorithm
        const nodePositions: Record<number, { x: number; y: number; level: number }> = {};
        const visited = new Set<number>();

        // BFS to assign levels
        const queue: Array<{ id: number; level: number }> = [{ id: rootUserId, level: 0 }];
        const levelCounts: Record<number, number> = {};

        while (queue.length > 0) {
            const { id, level } = queue.shift()!;
            if (visited.has(id)) continue;
            visited.add(id);

            if (!levelCounts[level]) levelCounts[level] = 0;
            levelCounts[level]++;

            // Find connected members
            connections.forEach((conn) => {
                if (conn.from === id && !visited.has(conn.to)) {
                    queue.push({ id: conn.to, level: level + 1 });
                } else if (conn.to === id && !visited.has(conn.from)) {
                    queue.push({ id: conn.from, level: level - 1 });
                }
            });
        }

        // Calculate X and Y positions
        visited.clear();
        const positionCounters: Record<number, number> = {};

        const assignPosition = (id: number, level: number): void => {
            if (visited.has(id)) return;
            visited.add(id);

            if (!positionCounters[level]) positionCounters[level] = 0;

            const nodeWidth = 140;
            const levelCount = levelCounts[level] || 1;
            const totalWidth = Math.max(members.length * nodeWidth, 800);
            const x = (positionCounters[level] * totalWidth) / Math.max(levelCount, 1) + 70;
            const y = level * 200 + 50;

            nodePositions[id] = { x, y, level };
            positionCounters[level]++;

            // Recursively position connected nodes
            connections.forEach((conn) => {
                if (conn.from === id && !visited.has(conn.to)) {
                    assignPosition(conn.to, level + 1);
                } else if (conn.to === id && !visited.has(conn.from)) {
                    assignPosition(conn.from, level - 1);
                }
            });
        };

        assignPosition(rootUserId, 0);

        return { nodePositions, levelCounts };
    }, [members, connections, rootUserId]);

    if (!diagramData) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                No family members to display
            </div>
        );
    }

    const { nodePositions } = diagramData;
    const positions = Object.values(nodePositions);

    if (positions.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                No family members to display
            </div>
        );
    }

    const minX = Math.min(...positions.map((p) => p.x));
    const maxX = Math.max(...positions.map((p) => p.x));
    const minY = Math.min(...positions.map((p) => p.y));
    const maxY = Math.max(...positions.map((p) => p.y));

    const padding = 60;
    const svgWidth = Math.max(maxX - minX + padding * 2, 600);
    const svgHeight = Math.max(maxY - minY + padding * 2, 400);

    return (
        <div style={{ overflowX: 'auto', width: '100%' }}>
            <svg
                width={svgWidth}
                height={svgHeight}
                style={{
                    minWidth: '100%',
                    height: 'auto',
                    background: 'transparent',
                    display: 'block',
                }}
            >
                {/* Draw connections */}
                {connections.map((conn, idx) => {
                    const fromPos = nodePositions[conn.from];
                    const toPos = nodePositions[conn.to];

                    if (!fromPos || !toPos) return null;

                    const x1 = fromPos.x - minX + padding;
                    const y1 = fromPos.y - minY + padding;
                    const x2 = toPos.x - minX + padding;
                    const y2 = toPos.y - minY + padding;

                    const color = getRelationshipColor(conn.relationship);

                    return (
                        <g key={`conn-${idx}`}>
                            {/* Connection line */}
                            <path
                                d={`M ${x1} ${y1 + 50} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2}, ${x2} ${y2 - 50}`}
                                stroke={color}
                                strokeWidth="3"
                                fill="none"
                                strokeOpacity="0.6"
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                            />
                            {/* Relationship label */}
                            <text
                                x={(x1 + x2) / 2}
                                y={(y1 + y2) / 2}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="700"
                                fill={color}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.9)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                {conn.relationship}
                            </text>
                        </g>
                    );
                })}

                {/* Draw nodes */}
                {members.map((member) => {
                    const pos = nodePositions[member.id];
                    if (!pos) return null;

                    const x = pos.x - minX + padding;
                    const y = pos.y - minY + padding;
                    const isRoot = member.id === rootUserId;

                    return (
                        <g key={`node-${member.id}`}>
                            {/* Node circle background */}
                            <circle
                                cx={x}
                                cy={y}
                                r={isRoot ? 55 : 45}
                                fill={isRoot ? '#0052E8' : 'rgba(59, 130, 246, 0.8)'}
                                stroke={isRoot ? '#38BDF8' : '#38BDF8'}
                                strokeWidth={isRoot ? 3 : 2}
                                style={{
                                    filter: isRoot
                                        ? 'drop-shadow(0 8px 24px rgba(0, 82, 232, 0.4))'
                                        : 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3))',
                                }}
                            />

                            {/* Initial circle */}
                            <circle
                                cx={x}
                                cy={y}
                                r={isRoot ? 35 : 28}
                                fill={isRoot ? '#38BDF8' : '#E0F2FE'}
                                style={{
                                    fontSize: isRoot ? '24px' : '18px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            />

                            {/* Member initial text */}
                            <text
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={isRoot ? '20' : '14'}
                                fontWeight="800"
                                fill={isRoot ? '#FFFFFF' : '#0052E8'}
                                style={{ pointerEvents: 'none' }}
                            >
                                {member.name.charAt(0).toUpperCase()}
                            </text>

                            {/* Member name label below node */}
                            <text
                                x={x}
                                y={y + (isRoot ? 70 : 65)}
                                textAnchor="middle"
                                fontSize="12"
                                fontWeight="700"
                                fill="#E2E8F0"
                                style={{
                                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                    maxWidth: '120px',
                                }}
                            >
                                {member.name.split(' ')[0]}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default FamilyTreeDiagram;
