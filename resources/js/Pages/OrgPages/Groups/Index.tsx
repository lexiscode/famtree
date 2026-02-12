import OrgLayout from '@/Layouts/OrgLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, FolderTree, Building, Layers, Users } from 'lucide-react';

interface ClassSet {
    id: number;
    name: string;
    year: string | null;
    memberCount: number;
    isActive: boolean;
}

interface Department {
    id: number;
    name: string;
    classSets: ClassSet[];
}

interface Faculty {
    id: number;
    name: string;
    departments: Department[];
}

interface Props {
    hierarchy: Faculty[];
}

export default function GroupsIndex({ hierarchy }: Props) {
    const [expandedFaculties, setExpandedFaculties] = useState<Set<number>>(
        new Set(hierarchy.map((f) => f.id))
    );
    const [expandedDepartments, setExpandedDepartments] = useState<Set<number>>(new Set());

    const toggleFaculty = (id: number) => {
        setExpandedFaculties((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleDepartment = (id: number) => {
        setExpandedDepartments((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const totalClassSets = hierarchy.reduce(
        (sum, f) => sum + f.departments.reduce((dSum, d) => dSum + d.classSets.length, 0),
        0
    );
    const totalMembers = hierarchy.reduce(
        (sum, f) => sum + f.departments.reduce(
            (dSum, d) => dSum + d.classSets.reduce((cSum, c) => cSum + c.memberCount, 0),
            0
        ),
        0
    );

    return (
        <OrgLayout>
            <div>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                        Groups
                    </h1>
                    <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                        {hierarchy.length} facult{hierarchy.length !== 1 ? 'ies' : 'y'} · {totalClassSets} class set{totalClassSets !== 1 ? 's' : ''} · {totalMembers.toLocaleString()} total member{totalMembers !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Hierarchy */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {hierarchy.length > 0 ? hierarchy.map((faculty) => {
                        const isFacultyExpanded = expandedFaculties.has(faculty.id);
                        const facultyMemberCount = faculty.departments.reduce(
                            (sum, d) => sum + d.classSets.reduce((cSum, c) => cSum + c.memberCount, 0),
                            0
                        );

                        return (
                            <div key={faculty.id} style={{
                                background: '#141425',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                            }}>
                                {/* Faculty Header */}
                                <button
                                    onClick={() => toggleFaculty(faculty.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1.25rem 1.5rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#e0e0e0',
                                        textAlign: 'left',
                                        transition: 'background 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {isFacultyExpanded
                                        ? <ChevronDown size={18} color="#8B5CF6" />
                                        : <ChevronRight size={18} color="#888" />
                                    }
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Building size={18} color="#8B5CF6" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                                            {faculty.name}
                                        </p>
                                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#666' }}>
                                            {faculty.departments.length} department{faculty.departments.length !== 1 ? 's' : ''} · {facultyMemberCount} member{facultyMemberCount !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </button>

                                {/* Departments */}
                                {isFacultyExpanded && (
                                    <div style={{
                                        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                                        padding: '0 1rem 1rem',
                                    }}>
                                        {faculty.departments.map((department) => {
                                            const isDeptExpanded = expandedDepartments.has(department.id);
                                            const deptMemberCount = department.classSets.reduce((sum, c) => sum + c.memberCount, 0);

                                            return (
                                                <div key={department.id} style={{ marginTop: '0.5rem' }}>
                                                    {/* Department Header */}
                                                    <button
                                                        onClick={() => toggleDepartment(department.id)}
                                                        style={{
                                                            width: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.75rem',
                                                            padding: '0.875rem 1rem',
                                                            background: 'rgba(255, 255, 255, 0.02)',
                                                            border: '1px solid rgba(255, 255, 255, 0.04)',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            color: '#e0e0e0',
                                                            textAlign: 'left',
                                                            transition: 'background 0.2s ease',
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; }}
                                                    >
                                                        {isDeptExpanded
                                                            ? <ChevronDown size={16} color="#8B5CF6" />
                                                            : <ChevronRight size={16} color="#666" />
                                                        }
                                                        <Layers size={16} color="#3B82F6" />
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500, color: '#e0e0e0' }}>
                                                                {department.name}
                                                            </p>
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                                            {department.classSets.length} set{department.classSets.length !== 1 ? 's' : ''} · {deptMemberCount} member{deptMemberCount !== 1 ? 's' : ''}
                                                        </span>
                                                    </button>

                                                    {/* ClassSets */}
                                                    {isDeptExpanded && department.classSets.length > 0 && (
                                                        <div style={{
                                                            marginTop: '0.5rem',
                                                            marginLeft: '2rem',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '0.35rem',
                                                        }}>
                                                            {department.classSets.map((classSet) => (
                                                                <div
                                                                    key={classSet.id}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.75rem',
                                                                        padding: '0.75rem 1rem',
                                                                        background: 'rgba(255, 255, 255, 0.01)',
                                                                        border: '1px solid rgba(255, 255, 255, 0.03)',
                                                                        borderRadius: '8px',
                                                                        transition: 'background 0.2s ease',
                                                                    }}
                                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)'; }}
                                                                >
                                                                    <Users size={14} color="#10B981" />
                                                                    <span style={{ flex: 1, fontSize: '0.875rem', color: '#e0e0e0' }}>
                                                                        {classSet.name}
                                                                    </span>
                                                                    {classSet.year && (
                                                                        <span style={{
                                                                            fontSize: '0.75rem',
                                                                            color: '#666',
                                                                            padding: '0.2rem 0.5rem',
                                                                            background: 'rgba(255, 255, 255, 0.03)',
                                                                            borderRadius: '4px',
                                                                        }}>
                                                                            {classSet.year}
                                                                        </span>
                                                                    )}
                                                                    <span style={{
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 600,
                                                                        color: classSet.isActive ? '#10B981' : '#666',
                                                                    }}>
                                                                        {classSet.memberCount} member{classSet.memberCount !== 1 ? 's' : ''}
                                                                    </span>
                                                                    <span style={{
                                                                        display: 'inline-block',
                                                                        width: '8px',
                                                                        height: '8px',
                                                                        borderRadius: '50%',
                                                                        background: classSet.isActive ? '#22C55E' : '#555',
                                                                        flexShrink: 0,
                                                                    }} title={classSet.isActive ? 'Active' : 'Inactive'} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {isDeptExpanded && department.classSets.length === 0 && (
                                                        <p style={{
                                                            marginLeft: '2rem',
                                                            marginTop: '0.5rem',
                                                            color: '#555',
                                                            fontSize: '0.8rem',
                                                            fontStyle: 'italic',
                                                        }}>
                                                            No class sets in this department.
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            background: '#141425',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}>
                            <FolderTree size={32} color="#555" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                                No groups have been set up yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </OrgLayout>
    );
}
