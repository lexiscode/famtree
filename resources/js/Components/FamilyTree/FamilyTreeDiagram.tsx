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
        if (members.length === 0 || !members.some(m => m.name)) {
            return null;
        }

        // Calculate positions for nodes using a simple layout algorithm
        const nodePositions: Record<number, { x: number; y: number; level: number }> = {};

        // Simple grid layout - place all members in a horizontal line
        const nodeWidth = 180;

        members.forEach((member, index) => {
            const x = index * nodeWidth + 100;
            const y = 100;
            nodePositions[member.id] = { x, y, level: 0 };
        });

        return { nodePositions };
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
        <div style={{ width: '100%', overflowX: 'auto', overflowY: 'visible' }}>
            <svg
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                style={{
                    minWidth: `${Math.max(svgWidth, 600)}px`,
                    height: `${svgHeight}px`,
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    display: 'block',
                }}
                preserveAspectRatio="xMidYMid meet"
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
                                strokeOpacity="0.8"
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                            />
                            {/* Relationship label background */}
                            <rect
                                x={(x1 + x2) / 2 - 40}
                                y={(y1 + y2) / 2 - 10}
                                width="80"
                                height="20"
                                fill="rgba(15, 23, 42, 0.95)"
                                rx="4"
                                ry="4"
                            />
                            {/* Relationship label */}
                            <text
                                x={(x1 + x2) / 2}
                                y={(y1 + y2) / 2 + 4}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="700"
                                fill={color}
                                style={{
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    pointerEvents: 'none',
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
                                fill={isRoot ? '#0052E8' : 'rgba(59, 130, 246, 0.9)'}
                                stroke={isRoot ? '#38BDF8' : '#38BDF8'}
                                strokeWidth={isRoot ? 3 : 2}
                                style={{
                                    filter: isRoot
                                        ? 'drop-shadow(0 8px 24px rgba(0, 82, 232, 0.5))'
                                        : 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.4))',
                                }}
                            />

                            {/* Inner circle */}
                            <circle
                                cx={x}
                                cy={y}
                                r={isRoot ? 35 : 28}
                                fill={isRoot ? '#38BDF8' : '#E0F2FE'}
                            />

                            {/* Member initial text */}
                            <text
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={isRoot ? '24' : '16'}
                                fontWeight="800"
                                fill={isRoot ? '#FFFFFF' : '#0052E8'}
                                style={{ pointerEvents: 'none' }}
                            >
                                {member.name?.charAt(0)?.toUpperCase() || '?'}
                            </text>

                            {/* Member name label below node */}
                            <text
                                x={x}
                                y={y + (isRoot ? 75 : 70)}
                                textAnchor="middle"
                                fontSize="13"
                                fontWeight="700"
                                fill="#FFFFFF"
                                style={{
                                    pointerEvents: 'none',
                                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                                }}
                            >
                                {member.name?.split(' ')[0] || 'Unknown'}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default FamilyTreeDiagram;
