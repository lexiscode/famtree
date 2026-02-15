import OrgLayout from '@/Layouts/OrgLayout';
import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, FolderTree, Building, Layers, Users, Shield, ShieldOff, UserMinus, UserPlus, AlertTriangle, X } from 'lucide-react';

interface Member {
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_image: string | null;
    is_admin: boolean;
    is_muted: boolean;
}

interface ClassSet {
    id: number;
    uuid: string;
    name: string;
    year: string | null;
    memberCount: number;
    isActive: boolean;
    members: Member[];
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
    const [expandedClassSets, setExpandedClassSets] = useState<Set<number>>(new Set());
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        action: string;
        classSetId: number;
        member: Member;
    } | null>(null);

    const toggleFaculty = (id: number) => {
        setExpandedFaculties((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleDepartment = (id: number) => {
        setExpandedDepartments((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleClassSet = (id: number) => {
        setExpandedClassSets((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const requestAction = (action: string, classSetId: number, member: Member) => {
        setConfirmDialog({ action, classSetId, member });
    };

    const dismissConfirm = useCallback(() => {
        setConfirmDialog(null);
    }, []);

    const executeAction = useCallback(() => {
        if (!confirmDialog) return;
        const { action, classSetId, member } = confirmDialog;
        const key = `${action}-${classSetId}-${member.id}`;
        setActionLoading(key);
        setConfirmDialog(null);

        const routeName = action === 'force-remove'
            ? 'org.groups.force-remove'
            : action === 'appoint-admin'
                ? 'org.groups.appoint-admin'
                : 'org.groups.remove-admin';

        router.post(route(routeName, { classSetId, userId: member.id }), {}, {
            preserveScroll: true,
            onFinish: () => setActionLoading(null),
        });
    }, [confirmDialog]);

    // Close dialog on Escape key
    useEffect(() => {
        if (!confirmDialog) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismissConfirm(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [confirmDialog, dismissConfirm]);

    const getConfirmInfo = (action: string, member: Member) => {
        const name = `${member.first_name} ${member.last_name}`;
        if (action === 'force-remove') return {
            title: 'Remove Member',
            message: `Are you sure you want to remove ${name} from this group? This action cannot be undone.`,
            confirmLabel: 'Remove',
            confirmColor: '#EF4444',
            confirmBg: 'rgba(239, 68, 68, 0.15)',
            icon: UserMinus,
        };
        if (action === 'appoint-admin') return {
            title: 'Appoint Admin',
            message: `Are you sure you want to make ${name} a group admin? They will be able to initiate member removals and moderate the group.`,
            confirmLabel: 'Make Admin',
            confirmColor: '#3B82F6',
            confirmBg: 'rgba(59, 130, 246, 0.15)',
            icon: Shield,
        };
        return {
            title: 'Remove Admin',
            message: `Are you sure you want to remove admin privileges from ${name}? They will become a regular group member.`,
            confirmLabel: 'Remove Admin',
            confirmColor: '#F59E0B',
            confirmBg: 'rgba(245, 158, 11, 0.15)',
            icon: ShieldOff,
        };
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

    const btnStyle = (color: string, bg: string) => ({
        padding: '3px 10px', borderRadius: '6px', border: `1px solid ${color}33`,
        background: bg, color, fontSize: '0.7rem', fontWeight: 600 as const,
        cursor: 'pointer', display: 'flex' as const, alignItems: 'center' as const, gap: '4px',
        opacity: actionLoading ? 0.6 : 1,
    });

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
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '1.25rem 1.5rem', background: 'none', border: 'none',
                                        cursor: 'pointer', color: '#e0e0e0', textAlign: 'left',
                                        transition: 'background 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {isFacultyExpanded ? <ChevronDown size={18} color="#8B5CF6" /> : <ChevronRight size={18} color="#888" />}
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '8px',
                                        background: 'rgba(139, 92, 246, 0.1)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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
                                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)', padding: '0 1rem 1rem' }}>
                                        {faculty.departments.map((department) => {
                                            const isDeptExpanded = expandedDepartments.has(department.id);
                                            const deptMemberCount = department.classSets.reduce((sum, c) => sum + c.memberCount, 0);

                                            return (
                                                <div key={department.id} style={{ marginTop: '0.5rem' }}>
                                                    <button
                                                        onClick={() => toggleDepartment(department.id)}
                                                        style={{
                                                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                            padding: '0.875rem 1rem', background: 'rgba(255, 255, 255, 0.02)',
                                                            border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px',
                                                            cursor: 'pointer', color: '#e0e0e0', textAlign: 'left',
                                                            transition: 'background 0.2s ease',
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; }}
                                                    >
                                                        {isDeptExpanded ? <ChevronDown size={16} color="#8B5CF6" /> : <ChevronRight size={16} color="#666" />}
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
                                                        <div style={{ marginTop: '0.5rem', marginLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                            {department.classSets.map((classSet) => {
                                                                const isExpanded = expandedClassSets.has(classSet.id);
                                                                return (
                                                                    <div key={classSet.id}>
                                                                        <div
                                                                            style={{
                                                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                                                padding: '0.75rem 1rem',
                                                                                background: 'rgba(255, 255, 255, 0.01)',
                                                                                border: '1px solid rgba(255, 255, 255, 0.03)',
                                                                                borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
                                                                                cursor: 'pointer',
                                                                                transition: 'background 0.2s ease',
                                                                            }}
                                                                            onClick={() => toggleClassSet(classSet.id)}
                                                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                                                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)'; }}
                                                                        >
                                                                            {isExpanded ? <ChevronDown size={14} color="#10B981" /> : <ChevronRight size={14} color="#10B981" />}
                                                                            <Users size={14} color="#10B981" />
                                                                            <span style={{ flex: 1, fontSize: '0.875rem', color: '#e0e0e0' }}>
                                                                                {classSet.name}
                                                                            </span>
                                                                            {classSet.year && (
                                                                                <span style={{
                                                                                    fontSize: '0.75rem', color: '#666',
                                                                                    padding: '0.2rem 0.5rem', background: 'rgba(255, 255, 255, 0.03)',
                                                                                    borderRadius: '4px',
                                                                                }}>
                                                                                    {classSet.year}
                                                                                </span>
                                                                            )}
                                                                            <span style={{
                                                                                fontSize: '0.75rem', fontWeight: 600,
                                                                                color: classSet.isActive ? '#10B981' : '#666',
                                                                            }}>
                                                                                {classSet.memberCount} member{classSet.memberCount !== 1 ? 's' : ''}
                                                                            </span>
                                                                            <span style={{
                                                                                display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                                                                                background: classSet.isActive ? '#22C55E' : '#555', flexShrink: 0,
                                                                            }} title={classSet.isActive ? 'Active' : 'Inactive'} />
                                                                        </div>

                                                                        {/* Member List */}
                                                                        {isExpanded && classSet.members && classSet.members.length > 0 && (
                                                                            <div style={{
                                                                                background: 'rgba(255, 255, 255, 0.01)',
                                                                                border: '1px solid rgba(255, 255, 255, 0.03)',
                                                                                borderTop: 'none',
                                                                                borderRadius: '0 0 8px 8px',
                                                                                padding: '8px',
                                                                            }}>
                                                                                {classSet.members.map((member) => {
                                                                                    const loadKey = (action: string) => `${action}-${classSet.id}-${member.id}`;
                                                                                    return (
                                                                                        <div key={member.id} style={{
                                                                                            display: 'flex', alignItems: 'center', gap: '8px',
                                                                                            padding: '6px 8px', borderRadius: '6px',
                                                                                            transition: 'background 0.15s',
                                                                                        }}
                                                                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                                                                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                                                        >
                                                                                            <div style={{
                                                                                                width: '28px', height: '28px', borderRadius: '50%',
                                                                                                background: 'rgba(139, 92, 246, 0.15)', display: 'flex',
                                                                                                alignItems: 'center', justifyContent: 'center',
                                                                                                fontSize: '0.7rem', fontWeight: 600, color: '#8B5CF6',
                                                                                                overflow: 'hidden', flexShrink: 0,
                                                                                            }}>
                                                                                                {member.profile_image
                                                                                                    ? <img src={member.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                                                    : member.first_name.charAt(0)}
                                                                                            </div>
                                                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                                                <span style={{ fontSize: '0.82rem', color: '#e0e0e0' }}>
                                                                                                    {member.first_name} {member.last_name}
                                                                                                </span>
                                                                                                {member.is_admin && (
                                                                                                    <span style={{
                                                                                                        marginLeft: '6px', fontSize: '0.6rem', fontWeight: 700,
                                                                                                        color: '#F59E0B', background: 'rgba(245, 158, 11, 0.12)',
                                                                                                        padding: '1px 5px', borderRadius: '4px',
                                                                                                    }}>ADMIN</span>
                                                                                                )}
                                                                                                {member.is_muted && (
                                                                                                    <span style={{
                                                                                                        marginLeft: '4px', fontSize: '0.6rem', fontWeight: 700,
                                                                                                        color: '#EF4444', background: 'rgba(239, 68, 68, 0.12)',
                                                                                                        padding: '1px 5px', borderRadius: '4px',
                                                                                                    }}>MUTED</span>
                                                                                                )}
                                                                                            </div>
                                                                                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                                                                {member.is_admin ? (
                                                                                                    <button
                                                                                                        onClick={(e) => { e.stopPropagation(); requestAction('remove-admin', classSet.id, member); }}
                                                                                                        disabled={!!actionLoading}
                                                                                                        style={btnStyle('#F59E0B', 'rgba(245, 158, 11, 0.08)')}
                                                                                                        title="Remove admin"
                                                                                                    >
                                                                                                        <ShieldOff size={11} /> Remove Admin
                                                                                                    </button>
                                                                                                ) : (
                                                                                                    <button
                                                                                                        onClick={(e) => { e.stopPropagation(); requestAction('appoint-admin', classSet.id, member); }}
                                                                                                        disabled={!!actionLoading}
                                                                                                        style={btnStyle('#3B82F6', 'rgba(59, 130, 246, 0.08)')}
                                                                                                        title="Appoint admin"
                                                                                                    >
                                                                                                        <Shield size={11} /> Make Admin
                                                                                                    </button>
                                                                                                )}
                                                                                                <button
                                                                                                    onClick={(e) => { e.stopPropagation(); requestAction('force-remove', classSet.id, member); }}
                                                                                                    disabled={!!actionLoading}
                                                                                                    style={btnStyle('#EF4444', 'rgba(239, 68, 68, 0.08)')}
                                                                                                    title="Force remove member"
                                                                                                >
                                                                                                    <UserMinus size={11} /> Remove
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                        {isExpanded && (!classSet.members || classSet.members.length === 0) && (
                                                                            <div style={{
                                                                                background: 'rgba(255, 255, 255, 0.01)',
                                                                                border: '1px solid rgba(255, 255, 255, 0.03)',
                                                                                borderTop: 'none', borderRadius: '0 0 8px 8px',
                                                                                padding: '12px', textAlign: 'center',
                                                                                color: '#555', fontSize: '0.8rem', fontStyle: 'italic',
                                                                            }}>
                                                                                No members in this group.
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {isDeptExpanded && department.classSets.length === 0 && (
                                                        <p style={{
                                                            marginLeft: '2rem', marginTop: '0.5rem',
                                                            color: '#555', fontSize: '0.8rem', fontStyle: 'italic',
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
                            textAlign: 'center', padding: '3rem', background: '#141425',
                            borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}>
                            <FolderTree size={32} color="#555" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                                No groups have been set up yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog && (() => {
                const info = getConfirmInfo(confirmDialog.action, confirmDialog.member);
                const Icon = info.icon;
                return (
                    <div
                        onClick={dismissConfirm}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '1rem',
                            animation: 'fadeIn 0.15s ease-out',
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#1a1a2e',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '16px',
                                padding: '1.75rem',
                                width: '100%',
                                maxWidth: '400px',
                                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
                                animation: 'slideUp 0.2s ease-out',
                            }}
                        >
                            {/* Icon + Close */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: info.confirmBg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={22} color={info.confirmColor} />
                                </div>
                                <button
                                    onClick={dismissConfirm}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)', border: 'none',
                                        borderRadius: '8px', padding: '6px', cursor: 'pointer',
                                        color: '#888', display: 'flex',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#ccc'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#888'; }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Title */}
                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                                {info.title}
                            </h3>

                            {/* Message */}
                            <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#999', lineHeight: 1.5 }}>
                                {info.message}
                            </p>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={dismissConfirm}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '10px',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        color: '#ccc', fontSize: '0.85rem', fontWeight: 500,
                                        cursor: 'pointer', transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeAction}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '10px',
                                        background: info.confirmBg,
                                        border: `1px solid ${info.confirmColor}33`,
                                        color: info.confirmColor, fontSize: '0.85rem', fontWeight: 600,
                                        cursor: 'pointer', transition: 'all 0.15s ease',
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = `${info.confirmColor}30`; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = info.confirmBg; }}
                                >
                                    <Icon size={14} />
                                    {info.confirmLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Dialog animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </OrgLayout>
    );
}
