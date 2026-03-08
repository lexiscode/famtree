import OrgLayout from '@/Layouts/OrgLayout';
import { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    Plus, X, Edit2, Trash2, UserPlus, UserMinus, Crown, Search,
    ChevronDown, ChevronRight, Users, Shield, Clock, RotateCcw,
    Star, Award, Briefcase, Megaphone, Palette, User,
    History, AlertTriangle, Ban, ShieldOff, Zap, Inbox, Check,
    XCircle, Play, Trash, Settings, PauseCircle, PlayCircle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
interface GroupMember {
    id: number;
    user_id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_image: string | null;
    role: string;
    role_label: string;
    is_leader: boolean;
    joined_at: string;
}

interface OrgGroup {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    is_active: boolean;
    is_suspended: boolean;
    suspension_reason: string | null;
    max_members: number | null;
    allow_join_requests: boolean;
    active_members_count: number;
    pending_join_requests_count: number;
    members: GroupMember[];
    parent_group_id: number | null;
    created_at: string;
}

interface JoinRequest {
    id: number;
    user: { id: number; uuid: string; first_name: string; last_name: string; username: string; profile_image: string | null };
    message: string | null;
    created_at: string;
}

interface BanRecord {
    id: number;
    user: { id: number; uuid: string; first_name: string; last_name: string; username: string; profile_image: string | null };
    reason: string | null;
    banned_at: string;
    expires_at: string | null;
    is_active: boolean;
}

interface AutoRule {
    id: number;
    rule_type: string;
    rule_type_label: string;
    target_id: number | null;
    target_name: string | null;
    is_active: boolean;
    last_run_count: number;
    last_run_at: string | null;
}

interface RuleTarget {
    id: number;
    name: string;
}

interface SearchUser {
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_image: string | null;
}

interface TermRecord {
    id: number;
    user: { id: number; first_name: string; last_name: string; username: string; profile_image: string | null };
    role: string;
    role_label: string;
    term_name: string | null;
    started_at: string;
    ended_at: string | null;
    is_current: boolean;
    handover_notes: string | null;
}

interface Props {
    groups: OrgGroup[];
    isLimitedAccess?: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────
const GROUP_TYPES = [
    { value: 'sug', label: 'Student Union (SUG)' },
    { value: 'faculty_union', label: 'Faculty Union' },
    { value: 'hall_committee', label: 'Hall Committee' },
    { value: 'departmental_rep', label: 'Departmental Rep' },
    { value: 'custom', label: 'Custom Group' },
];

const LEADERSHIP_ROLES = [
    { value: 'president', label: 'President', icon: Crown, color: '#F59E0B' },
    { value: 'vice_president', label: 'Vice President', icon: Star, color: '#8B5CF6' },
    { value: 'secretary', label: 'Secretary', icon: Briefcase, color: '#3B82F6' },
    { value: 'treasurer', label: 'Treasurer', icon: Award, color: '#10B981' },
    { value: 'pro', label: 'PRO', icon: Megaphone, color: '#EC4899' },
    { value: 'social_director', label: 'Social Director', icon: Palette, color: '#F97316' },
    { value: 'member', label: 'Member', icon: User, color: '#6B7280' },
];

const getRoleInfo = (role: string) => LEADERSHIP_ROLES.find(r => r.value === role) || LEADERSHIP_ROLES[6];
const getTypeLabel = (type: string) => GROUP_TYPES.find(t => t.value === type)?.label || type;

// ─── Shared Styles ──────────────────────────────────────────────────
const cardBg = '#141425';
const cardBorder = '1px solid rgba(255, 255, 255, 0.06)';
const inputStyle: React.CSSProperties = {
    width: '100%', background: '#1e1e35', border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: '10px', padding: '0.8rem 1rem', color: '#ffffff', fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.2s ease',
};
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#a0a0b8', marginBottom: '0.4rem',
    textTransform: 'uppercase', letterSpacing: '0.04em',
};

// ─── Component ──────────────────────────────────────────────────────
export default function OrgGroupsIndex({ groups, isLimitedAccess }: Props) {
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState<OrgGroup | null>(null);
    const [addingMemberTo, setAddingMemberTo] = useState<OrgGroup | null>(null);
    const [changingRole, setChangingRole] = useState<{ group: OrgGroup; member: GroupMember } | null>(null);
    const [handoverGroup, setHandoverGroup] = useState<OrgGroup | null>(null);
    const [termHistoryGroup, setTermHistoryGroup] = useState<OrgGroup | null>(null);
    const [termHistory, setTermHistory] = useState<TermRecord[]>([]);
    const [termHistoryLoading, setTermHistoryLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{ action: string; group: OrgGroup; member?: GroupMember } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Create/Edit form
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formType, setFormType] = useState('custom');
    const [formMaxMembers, setFormMaxMembers] = useState('');

    // Add member form
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
    const [memberRole, setMemberRole] = useState('member');
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Change role form
    const [newRole, setNewRole] = useState('member');

    // Handover form
    const [termName, setTermName] = useState('');
    const [handoverNotes, setHandoverNotes] = useState('');

    // Join requests
    const [joinRequestsGroup, setJoinRequestsGroup] = useState<OrgGroup | null>(null);
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);

    // Bans
    const [bansGroup, setBansGroup] = useState<OrgGroup | null>(null);
    const [bans, setBans] = useState<BanRecord[]>([]);
    const [bansLoading, setBansLoading] = useState(false);
    const [banningMember, setBanningMember] = useState<{ group: OrgGroup; member: GroupMember } | null>(null);
    const [banReason, setBanReason] = useState('');
    const [banExpiry, setBanExpiry] = useState('');

    // Auto-membership rules
    const [autoRulesGroup, setAutoRulesGroup] = useState<OrgGroup | null>(null);
    const [autoRules, setAutoRules] = useState<AutoRule[]>([]);
    const [autoRulesLoading, setAutoRulesLoading] = useState(false);
    const [showCreateRule, setShowCreateRule] = useState(false);
    const [ruleType, setRuleType] = useState('class_set');
    const [ruleTargets, setRuleTargets] = useState<RuleTarget[]>([]);
    const [ruleTargetId, setRuleTargetId] = useState<number | null>(null);
    const [ruleTargetName, setRuleTargetName] = useState('');
    const [formAllowJoinRequests, setFormAllowJoinRequests] = useState(false);

    // Suspension
    const [suspendingGroup, setSuspendingGroup] = useState<OrgGroup | null>(null);
    const [suspendReason, setSuspendReason] = useState('');

    // ─── Toggle expand ──────────────────────────────────────────────
    const toggleGroup = (id: number) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // ─── Create Group ───────────────────────────────────────────────
    const resetForm = () => {
        setFormName(''); setFormDescription(''); setFormType('custom'); setFormMaxMembers(''); setFormAllowJoinRequests(false);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) return;
        setSubmitting(true);
        router.post(route('org.org-groups.store'), {
            name: formName, description: formDescription || null, type: formType,
            max_members: formMaxMembers ? parseInt(formMaxMembers) : null,
            allow_join_requests: formAllowJoinRequests,
        }, {
            onSuccess: () => { setShowCreateModal(false); resetForm(); setSubmitting(false); },
            onError: () => setSubmitting(false),
        });
    };

    // ─── Edit Group ─────────────────────────────────────────────────
    const openEdit = (group: OrgGroup) => {
        setEditingGroup(group);
        setFormName(group.name);
        setFormDescription(group.description || '');
        setFormType(group.type);
        setFormMaxMembers(group.max_members?.toString() || '');
        setFormAllowJoinRequests(group.allow_join_requests);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGroup || !formName.trim()) return;
        setSubmitting(true);
        router.put(route('org.org-groups.update', { id: editingGroup.id }), {
            name: formName, description: formDescription || null, type: formType,
            max_members: formMaxMembers ? parseInt(formMaxMembers) : null,
            allow_join_requests: formAllowJoinRequests,
        }, {
            onSuccess: () => { setEditingGroup(null); resetForm(); setSubmitting(false); },
            onError: () => setSubmitting(false),
        });
    };

    // ─── Delete Group ───────────────────────────────────────────────
    const handleDelete = () => {
        if (!confirmDialog || confirmDialog.action !== 'delete-group') return;
        setSubmitting(true);
        router.delete(route('org.org-groups.destroy', { id: confirmDialog.group.id }), {
            onSuccess: () => { setConfirmDialog(null); setSubmitting(false); },
            onError: () => setSubmitting(false),
        });
    };

    // ─── Search Users ───────────────────────────────────────────────
    useEffect(() => {
        if (!addingMemberTo || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearchLoading(true);
            fetch(route('org.org-groups.search-users', { groupId: addingMemberTo.id }) + `?q=${encodeURIComponent(searchQuery)}`)
                .then(r => r.json())
                .then(data => { setSearchResults(data); setSearchLoading(false); })
                .catch(() => setSearchLoading(false));
        }, 300);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchQuery, addingMemberTo]);

    // ─── Add Member ─────────────────────────────────────────────────
    const handleAddMember = () => {
        if (!addingMemberTo || !selectedUser) return;
        setSubmitting(true);
        router.post(route('org.org-groups.add-member', { groupId: addingMemberTo.id }), {
            user_id: selectedUser.id, role: memberRole,
        }, {
            onSuccess: () => {
                setAddingMemberTo(null); setSelectedUser(null); setSearchQuery('');
                setSearchResults([]); setMemberRole('member'); setSubmitting(false);
            },
            onError: () => setSubmitting(false),
        });
    };

    // ─── Remove Member ──────────────────────────────────────────────
    const handleRemoveMember = () => {
        if (!confirmDialog || confirmDialog.action !== 'remove-member' || !confirmDialog.member) return;
        setSubmitting(true);
        router.delete(route('org.org-groups.remove-member', {
            groupId: confirmDialog.group.id, userId: confirmDialog.member.user_id,
        }), {
            onSuccess: () => { setConfirmDialog(null); setSubmitting(false); },
            onError: () => setSubmitting(false),
        });
    };

    // ─── Change Role ────────────────────────────────────────────────
    const openChangeRole = (group: OrgGroup, member: GroupMember) => {
        setChangingRole({ group, member });
        setNewRole(member.role);
    };

    const handleChangeRole = () => {
        if (!changingRole) return;
        setSubmitting(true);
        router.put(route('org.org-groups.update-role', {
            groupId: changingRole.group.id, userId: changingRole.member.user_id,
        }), { role: newRole }, {
            onSuccess: () => { setChangingRole(null); setSubmitting(false); },
            onError: () => setSubmitting(false),
        });
    };

    // ─── Handover ───────────────────────────────────────────────────
    const handleHandover = (e: React.FormEvent) => {
        e.preventDefault();
        if (!handoverGroup || !termName.trim()) return;
        setSubmitting(true);
        router.post(route('org.org-groups.handover', { groupId: handoverGroup.id }), {
            term_name: termName, notes: handoverNotes || null,
        }, {
            onSuccess: () => {
                setHandoverGroup(null); setTermName(''); setHandoverNotes(''); setSubmitting(false);
            },
            onError: () => setSubmitting(false),
        });
    };

    // ─── Term History ───────────────────────────────────────────────
    const openTermHistory = (group: OrgGroup) => {
        setTermHistoryGroup(group);
        setTermHistoryLoading(true);
        fetch(route('org.org-groups.term-history', { groupId: group.id }))
            .then(r => r.json())
            .then(data => { setTermHistory(data.terms); setTermHistoryLoading(false); })
            .catch(() => setTermHistoryLoading(false));
    };

    // ─── Escape key ─────────────────────────────────────────────────
    const dismissConfirm = useCallback(() => setConfirmDialog(null), []);
    useEffect(() => {
        if (!confirmDialog) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismissConfirm(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [confirmDialog, dismissConfirm]);

    // ─── Join Requests ─────────────────────────────────────────────
    const loadJoinRequests = (group: OrgGroup) => {
        setJoinRequestsGroup(group);
        setJoinRequestsLoading(true);
        fetch(route('org.org-groups.join-requests', { groupId: group.id }))
            .then(r => r.json())
            .then(data => { setJoinRequests(data); setJoinRequestsLoading(false); })
            .catch(() => setJoinRequestsLoading(false));
    };

    const handleApproveJoin = (groupId: number, requestId: number) => {
        setSubmitting(true);
        router.post(route('org.org-groups.approve-join', { groupId, requestId }), {}, {
            onSuccess: () => { setJoinRequestsGroup(null); setSubmitting(false); },
            onError: () => setSubmitting(false),
        });
    };

    const handleRejectJoin = (groupId: number, requestId: number) => {
        setSubmitting(true);
        router.post(route('org.org-groups.reject-join', { groupId, requestId }), {}, {
            onSuccess: () => { setJoinRequestsGroup(null); setSubmitting(false); },
            onError: () => setSubmitting(false),
        });
    };

    // ─── Bans ────────────────────────────────────────────────────
    const loadBans = (group: OrgGroup) => {
        setBansGroup(group);
        setBansLoading(true);
        fetch(route('org.org-groups.bans', { groupId: group.id }))
            .then(r => r.json())
            .then(data => { setBans(data); setBansLoading(false); })
            .catch(() => setBansLoading(false));
    };

    const handleBan = () => {
        if (!banningMember || !banReason.trim()) return;
        setSubmitting(true);
        router.post(route('org.org-groups.ban', {
            groupId: banningMember.group.id, userId: banningMember.member.user_id,
        }), {
            reason: banReason,
            expires_at: banExpiry || null,
        }, {
            onSuccess: () => { setBanningMember(null); setBanReason(''); setBanExpiry(''); setSubmitting(false); },
            onError: () => setSubmitting(false),
        });
    };

    const handleUnban = (groupId: number, userId: number) => {
        router.delete(route('org.org-groups.unban', { groupId, userId }));
    };

    // ─── Auto Rules ──────────────────────────────────────────────
    const loadAutoRules = (group: OrgGroup) => {
        setAutoRulesGroup(group);
        setAutoRulesLoading(true);
        fetch(route('org.org-groups.auto-rules', { groupId: group.id }))
            .then(r => r.json())
            .then(data => { setAutoRules(data); setAutoRulesLoading(false); })
            .catch(() => setAutoRulesLoading(false));
    };

    const loadRuleTargets = (type: string, groupId: number) => {
        setRuleType(type);
        if (type === 'all_followers') {
            setRuleTargets([]);
            setRuleTargetId(null);
            setRuleTargetName('All Org Followers');
            return;
        }
        fetch(route('org.org-groups.auto-rule-targets', { groupId }) + `?rule_type=${type}`)
            .then(r => r.json())
            .then(data => setRuleTargets(data));
    };

    const handleCreateRule = () => {
        if (!autoRulesGroup) return;
        setSubmitting(true);
        router.post(route('org.org-groups.create-auto-rule', { groupId: autoRulesGroup.id }), {
            rule_type: ruleType,
            target_id: ruleTargetId,
            target_name: ruleTargetName,
        }, {
            onSuccess: () => {
                setShowCreateRule(false);
                setRuleTargetId(null);
                setRuleTargetName('');
                setSubmitting(false);
                loadAutoRules(autoRulesGroup);
            },
            onError: () => setSubmitting(false),
        });
    };

    const handleDeleteRule = (groupId: number, ruleId: number) => {
        if (!confirm('Delete this auto-membership rule?')) return;
        router.delete(route('org.org-groups.delete-auto-rule', { groupId, ruleId }), {
            onSuccess: () => { if (autoRulesGroup) loadAutoRules(autoRulesGroup); },
        });
    };

    const handleExecuteRule = (groupId: number, ruleId: number) => {
        setSubmitting(true);
        router.post(route('org.org-groups.execute-auto-rule', { groupId, ruleId }), {}, {
            onSuccess: () => { setSubmitting(false); if (autoRulesGroup) loadAutoRules(autoRulesGroup); },
            onError: () => setSubmitting(false),
        });
    };

    // ─── Suspend / Unsuspend ───────────────────────────────────────
    const handleSuspend = () => {
        if (!suspendingGroup || !suspendReason.trim()) return;
        setSubmitting(true);
        router.post(route('org.org-groups.suspend', { id: suspendingGroup.id }), {
            reason: suspendReason,
        }, {
            onSuccess: () => { setSuspendingGroup(null); setSuspendReason(''); setSubmitting(false); },
            onError: () => setSubmitting(false),
        });
    };

    const handleUnsuspend = (groupId: number) => {
        router.post(route('org.org-groups.unsuspend', { id: groupId }));
    };

    // ─── Stats ──────────────────────────────────────────────────────
    const totalMembers = groups.reduce((s, g) => s + g.active_members_count, 0);
    const activeGroups = groups.filter(g => g.is_active).length;

    // ─── Render ─────────────────────────────────────────────────────
    return (
        <OrgLayout>
            <div>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.5rem' }}>
                            Org Groups
                        </h1>
                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
                            {groups.length} group{groups.length !== 1 ? 's' : ''} &middot; {activeGroups} active &middot; {totalMembers.toLocaleString()} total member{totalMembers !== 1 ? 's' : ''}
                        </p>
                    </div>
                    {!isLimitedAccess && (
                        <button
                            onClick={() => { resetForm(); setShowCreateModal(true); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                color: '#fff', border: 'none', borderRadius: '10px',
                                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                                transition: 'opacity 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        >
                            <Plus size={18} /> Create Group
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Groups', value: groups.length, color: '#8B5CF6', icon: Users },
                        { label: 'Active Groups', value: activeGroups, color: '#22C55E', icon: Shield },
                        { label: 'Total Members', value: totalMembers, color: '#3B82F6', icon: UserPlus },
                        { label: 'Leaders', value: groups.reduce((s, g) => s + g.members.filter(m => m.is_leader).length, 0), color: '#F59E0B', icon: Crown },
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} style={{
                                background: cardBg, border: cardBorder, borderRadius: '14px',
                                padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
                            }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: `${stat.color}18`, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={20} color={stat.color} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                                        {stat.value}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Groups List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {groups.length > 0 ? groups.map(group => {
                        const isExpanded = expandedGroups.has(group.id);
                        const leaders = group.members.filter(m => m.is_leader);
                        const regularMembers = group.members.filter(m => !m.is_leader);

                        return (
                            <div key={group.id} style={{
                                background: cardBg, border: cardBorder, borderRadius: '14px',
                                overflow: 'hidden', transition: 'border-color 0.2s',
                            }}>
                                {/* Group Header */}
                                <div
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                        padding: '1.25rem 1.5rem', cursor: 'pointer',
                                        transition: 'background 0.15s',
                                    }}
                                    onClick={() => toggleGroup(group.id)}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {isExpanded
                                        ? <ChevronDown size={18} color="#8B5CF6" />
                                        : <ChevronRight size={18} color="#888" />
                                    }
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Users size={20} color="#fff" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                                                {group.name}
                                            </p>
                                            <span style={{
                                                fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                                                borderRadius: '6px', color: '#8B5CF6',
                                                background: 'rgba(139, 92, 246, 0.12)',
                                                textTransform: 'uppercase', letterSpacing: '0.03em',
                                            }}>
                                                {getTypeLabel(group.type)}
                                            </span>
                                            <span style={{
                                                display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                                                background: group.is_suspended ? '#EF4444' : group.is_active ? '#22C55E' : '#555',
                                            }} title={group.is_suspended ? 'Suspended' : group.is_active ? 'Active' : 'Inactive'} />
                                            {group.is_suspended && (
                                                <span style={{
                                                    fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem',
                                                    borderRadius: '4px', color: '#EF4444',
                                                    background: 'rgba(239,68,68,0.12)',
                                                    textTransform: 'uppercase',
                                                }}>
                                                    Suspended
                                                </span>
                                            )}
                                            {group.parent_group_id && (
                                                <span style={{
                                                    fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem',
                                                    borderRadius: '4px', color: '#F59E0B',
                                                    background: 'rgba(245,158,11,0.12)',
                                                    textTransform: 'uppercase',
                                                }}>
                                                    Alumni
                                                </span>
                                            )}
                                        </div>
                                        {group.description && (
                                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {group.description}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                        <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>
                                            {group.active_members_count} member{group.active_members_count !== 1 ? 's' : ''}
                                        </span>
                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '0.3rem' }} onClick={e => e.stopPropagation()}>
                                            {!group.parent_group_id && (
                                                <button onClick={() => {
                                                    setAddingMemberTo(group); setSelectedUser(null);
                                                    setSearchQuery(''); setSearchResults([]);
                                                    setMemberRole('member');
                                                }}
                                                    style={iconBtnStyle('#3B82F6')} title="Add member"
                                                >
                                                    <UserPlus size={14} />
                                                </button>
                                            )}
                                            {!isLimitedAccess && (
                                                <>
                                                    <button onClick={() => openEdit(group)}
                                                        style={iconBtnStyle('#8B5CF6')} title="Edit group"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    {!group.parent_group_id && (
                                                        <>
                                                            <button onClick={() => openTermHistory(group)}
                                                                style={iconBtnStyle('#F59E0B')} title="Term history"
                                                            >
                                                                <History size={14} />
                                                            </button>
                                                            <button onClick={() => setHandoverGroup(group)}
                                                                style={iconBtnStyle('#10B981')} title="Handover leadership"
                                                            >
                                                                <RotateCcw size={14} />
                                                            </button>
                                                            <button onClick={() => loadAutoRules(group)}
                                                                style={iconBtnStyle('#06B6D4')} title="Auto-membership rules"
                                                            >
                                                                <Zap size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button onClick={() => loadBans(group)}
                                                        style={iconBtnStyle('#F97316')} title="View bans"
                                                    >
                                                        <Ban size={14} />
                                                    </button>
                                                    {group.is_suspended ? (
                                                        <button onClick={() => handleUnsuspend(group.id)}
                                                            style={iconBtnStyle('#22C55E')} title="Unsuspend group"
                                                        >
                                                            <PlayCircle size={14} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => setSuspendingGroup(group)}
                                                            style={iconBtnStyle('#EF4444')} title="Suspend group"
                                                        >
                                                            <PauseCircle size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setConfirmDialog({ action: 'delete-group', group })}
                                                        style={iconBtnStyle('#EF4444')} title="Delete group"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                            {/* Join requests button (for all access levels) */}
                                            {group.pending_join_requests_count > 0 && (
                                                <button onClick={() => loadJoinRequests(group)}
                                                    style={{ ...iconBtnStyle('#F59E0B'), position: 'relative' }} title="Join requests"
                                                >
                                                    <Inbox size={14} />
                                                    <span style={{
                                                        position: 'absolute', top: '-4px', right: '-4px',
                                                        background: '#F59E0B', color: '#000', borderRadius: '50%',
                                                        width: '16px', height: '16px', fontSize: '0.65rem',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 800,
                                                    }}>
                                                        {group.pending_join_requests_count}
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded: Members */}
                                {isExpanded && (
                                    <div style={{
                                        borderTop: '1px solid rgba(255,255,255,0.04)',
                                        padding: '1rem 1.5rem',
                                    }}>
                                        {/* Leaders Section */}
                                        {leaders.length > 0 && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <p style={{
                                                    fontSize: '0.7rem', fontWeight: 700, color: '#F59E0B',
                                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                                    margin: '0 0 0.6rem',
                                                }}>
                                                    Leadership
                                                </p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
                                                    {leaders.map(member => (
                                                        <MemberCard
                                                            key={member.id}
                                                            member={member}
                                                            group={group}
                                                            onChangeRole={() => openChangeRole(group, member)}
                                                            onRemove={() => setConfirmDialog({ action: 'remove-member', group, member })}
                                                            onBan={!isLimitedAccess ? () => setBanningMember({ group, member }) : undefined}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Regular Members Section */}
                                        {regularMembers.length > 0 && (
                                            <div>
                                                <p style={{
                                                    fontSize: '0.7rem', fontWeight: 700, color: '#888',
                                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                                    margin: '0 0 0.6rem',
                                                }}>
                                                    Members ({regularMembers.length})
                                                </p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
                                                    {regularMembers.map(member => (
                                                        <MemberCard
                                                            key={member.id}
                                                            member={member}
                                                            group={group}
                                                            onChangeRole={() => openChangeRole(group, member)}
                                                            onRemove={() => setConfirmDialog({ action: 'remove-member', group, member })}
                                                            onBan={!isLimitedAccess ? () => setBanningMember({ group, member }) : undefined}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {group.members.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#555', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                                No members yet. Add members using the + button above.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div style={{
                            textAlign: 'center', padding: '4rem 2rem', background: cardBg,
                            borderRadius: '14px', border: cardBorder,
                        }}>
                            <Users size={40} color="#555" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#888', fontSize: '1rem', margin: '0 0 0.5rem', fontWeight: 500 }}>
                                No org groups yet
                            </p>
                            <p style={{ color: '#555', fontSize: '0.85rem', margin: 0 }}>
                                Create your first group to get started — like a Student Union or Faculty Committee.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Create / Edit Modal ──────────────────────────────── */}
            {(showCreateModal || editingGroup) && (
                <ModalOverlay onClose={() => { setShowCreateModal(false); setEditingGroup(null); resetForm(); }}>
                    <form onSubmit={editingGroup ? handleEdit : handleCreate}>
                        <ModalHeader
                            title={editingGroup ? `Edit: ${editingGroup.name}` : 'Create New Group'}
                            onClose={() => { setShowCreateModal(false); setEditingGroup(null); resetForm(); }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label style={labelStyle}>Group Name *</label>
                                <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                                    placeholder="e.g. Student Union Government" style={inputStyle} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)}
                                    placeholder="Brief description of the group's purpose..."
                                    rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={labelStyle}>Type *</label>
                                    <select value={formType} onChange={e => setFormType(e.target.value)}
                                        style={{ ...inputStyle, cursor: 'pointer' }}>
                                        {GROUP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Max Members</label>
                                    <input type="number" value={formMaxMembers} onChange={e => setFormMaxMembers(e.target.value)}
                                        placeholder="Unlimited" min={2} style={inputStyle} />
                                </div>
                            </div>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                cursor: 'pointer', padding: '0.6rem 0.8rem',
                                background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <input type="checkbox" checked={formAllowJoinRequests}
                                    onChange={e => setFormAllowJoinRequests(e.target.checked)}
                                    style={{ width: '16px', height: '16px', accentColor: '#8B5CF6', cursor: 'pointer' }} />
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: '#e0e0e0', fontWeight: 500 }}>Allow Join Requests</span>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#666' }}>
                                        Users can request to join this group from the app
                                    </p>
                                </div>
                            </label>
                        </div>
                        <ModalActions onClose={() => { setShowCreateModal(false); setEditingGroup(null); resetForm(); }}
                            submitLabel={editingGroup ? 'Save Changes' : 'Create Group'}
                            submitting={submitting} canSubmit={!!formName.trim()} />
                    </form>
                </ModalOverlay>
            )}

            {/* ── Add Member Modal ─────────────────────────────────── */}
            {addingMemberTo && (
                <ModalOverlay onClose={() => setAddingMemberTo(null)}>
                    <ModalHeader title={`Add Member to ${addingMemberTo.name}`} onClose={() => setAddingMemberTo(null)} />

                    {/* Search */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Search User</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSelectedUser(null); }}
                                placeholder="Search by username or name..."
                                style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                                autoFocus />
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#555', margin: '0.3rem 0 0' }}>
                            Only users who follow this org or belong to a group within it can be added.
                        </p>
                    </div>

                    {/* Search Results */}
                    {searchQuery.length >= 2 && !selectedUser && (
                        <div style={{
                            maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem',
                            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
                            background: '#1a1a2e',
                        }}>
                            {searchLoading ? (
                                <p style={{ padding: '1rem', color: '#888', textAlign: 'center', fontSize: '0.85rem', margin: 0 }}>
                                    Searching...
                                </p>
                            ) : searchResults.length > 0 ? searchResults.map(user => (
                                <div key={user.id} onClick={() => setSelectedUser(user)} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.65rem 1rem', cursor: 'pointer', transition: 'background 0.15s',
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <Avatar name={user.first_name} image={user.profile_image} size={30} />
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#e0e0e0', fontWeight: 500 }}>
                                            {user.first_name} {user.last_name}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#666' }}>
                                            @{user.username}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ padding: '1rem', color: '#666', textAlign: 'center', fontSize: '0.85rem', margin: 0 }}>
                                    No eligible users found.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Selected User */}
                    {selectedUser && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.75rem 1rem', background: 'rgba(139,92,246,0.08)',
                            border: '1px solid rgba(139,92,246,0.25)', borderRadius: '10px',
                            marginBottom: '1rem',
                        }}>
                            <Avatar name={selectedUser.first_name} image={selectedUser.profile_image} size={34} />
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#e0e0e0', fontWeight: 600 }}>
                                    {selectedUser.first_name} {selectedUser.last_name}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#8B5CF6' }}>@{selectedUser.username}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} style={{
                                background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px',
                            }}>
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Role Selection */}
                    {selectedUser && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Assign Role</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                                {LEADERSHIP_ROLES.map(r => {
                                    const Icon = r.icon;
                                    const isSelected = memberRole === r.value;
                                    return (
                                        <button key={r.value} type="button" onClick={() => setMemberRole(r.value)} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.55rem 0.75rem', borderRadius: '8px',
                                            background: isSelected ? `${r.color}18` : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${isSelected ? `${r.color}40` : 'rgba(255,255,255,0.06)'}`,
                                            color: isSelected ? r.color : '#888', fontSize: '0.8rem', fontWeight: 500,
                                            cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' as const,
                                        }}>
                                            <Icon size={14} />
                                            {r.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <CancelBtn onClick={() => setAddingMemberTo(null)} />
                        <PrimaryBtn onClick={handleAddMember} disabled={!selectedUser || submitting}
                            label={submitting ? 'Adding...' : 'Add Member'} />
                    </div>
                </ModalOverlay>
            )}

            {/* ── Change Role Modal ────────────────────────────────── */}
            {changingRole && (
                <ModalOverlay onClose={() => setChangingRole(null)}>
                    <ModalHeader
                        title={`Change Role: ${changingRole.member.first_name} ${changingRole.member.last_name}`}
                        onClose={() => setChangingRole(null)}
                    />
                    <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                        Current role: <span style={{ color: getRoleInfo(changingRole.member.role).color, fontWeight: 600 }}>
                            {changingRole.member.role_label}
                        </span>
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', marginBottom: '1.25rem' }}>
                        {LEADERSHIP_ROLES.map(r => {
                            const Icon = r.icon;
                            const isSelected = newRole === r.value;
                            return (
                                <button key={r.value} type="button" onClick={() => setNewRole(r.value)} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.6rem 0.75rem', borderRadius: '8px',
                                    background: isSelected ? `${r.color}18` : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${isSelected ? `${r.color}40` : 'rgba(255,255,255,0.06)'}`,
                                    color: isSelected ? r.color : '#888', fontSize: '0.8rem', fontWeight: 500,
                                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' as const,
                                }}>
                                    <Icon size={14} />
                                    {r.label}
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <CancelBtn onClick={() => setChangingRole(null)} />
                        <PrimaryBtn onClick={handleChangeRole}
                            disabled={submitting || newRole === changingRole.member.role}
                            label={submitting ? 'Updating...' : 'Update Role'} />
                    </div>
                </ModalOverlay>
            )}

            {/* ── Handover Modal ───────────────────────────────────── */}
            {handoverGroup && (
                <ModalOverlay onClose={() => setHandoverGroup(null)}>
                    <form onSubmit={handleHandover}>
                        <ModalHeader title={`Leadership Handover: ${handoverGroup.name}`} onClose={() => setHandoverGroup(null)} />
                        <div style={{
                            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                            borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem',
                            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                        }}>
                            <AlertTriangle size={16} color="#F59E0B" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#F59E0B', lineHeight: 1.5 }}>
                                This will end all current leadership terms and demote all leaders to regular members. You can then assign new leaders.
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Term Name *</label>
                                <input type="text" value={termName} onChange={e => setTermName(e.target.value)}
                                    placeholder="e.g. 2025/2026" style={inputStyle} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Handover Notes</label>
                                <textarea value={handoverNotes} onChange={e => setHandoverNotes(e.target.value)}
                                    placeholder="Any notes about this handover..." rows={3}
                                    style={{ ...inputStyle, resize: 'vertical' as const }} />
                            </div>
                        </div>
                        <ModalActions onClose={() => setHandoverGroup(null)}
                            submitLabel={submitting ? 'Processing...' : 'Complete Handover'}
                            submitting={submitting} canSubmit={!!termName.trim()} />
                    </form>
                </ModalOverlay>
            )}

            {/* ── Term History Modal ───────────────────────────────── */}
            {termHistoryGroup && (
                <ModalOverlay onClose={() => setTermHistoryGroup(null)} wide>
                    <ModalHeader title={`Term History: ${termHistoryGroup.name}`} onClose={() => setTermHistoryGroup(null)} />
                    {termHistoryLoading ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '2rem', fontSize: '0.9rem' }}>Loading...</p>
                    ) : termHistory.length > 0 ? (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Person', 'Role', 'Term', 'Period', 'Status'].map(h => (
                                            <th key={h} style={{
                                                padding: '0.7rem 0.8rem', textAlign: 'left', fontSize: '0.7rem',
                                                fontWeight: 600, color: '#888', textTransform: 'uppercase',
                                                letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)',
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {termHistory.map(term => {
                                        const ri = getRoleInfo(term.role);
                                        return (
                                            <tr key={term.id} style={{ transition: 'background 0.15s' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <td style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Avatar name={term.user.first_name} image={term.user.profile_image} size={26} />
                                                        <span style={{ fontSize: '0.82rem', color: '#e0e0e0' }}>
                                                            {term.user.first_name} {term.user.last_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                    <span style={{
                                                        fontSize: '0.72rem', fontWeight: 600, color: ri.color,
                                                        background: `${ri.color}15`, padding: '0.15rem 0.45rem',
                                                        borderRadius: '5px',
                                                    }}>
                                                        {term.role_label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.8rem', color: '#888' }}>
                                                    {term.term_name || '—'}
                                                </td>
                                                <td style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.78rem', color: '#666' }}>
                                                    {new Date(term.started_at).toLocaleDateString()} — {term.ended_at ? new Date(term.ended_at).toLocaleDateString() : 'Present'}
                                                </td>
                                                <td style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                    <span style={{
                                                        fontSize: '0.68rem', fontWeight: 600,
                                                        color: term.is_current ? '#22C55E' : '#888',
                                                        background: term.is_current ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
                                                        padding: '0.15rem 0.4rem', borderRadius: '5px',
                                                    }}>
                                                        {term.is_current ? 'Current' : 'Ended'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ color: '#666', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
                            No leadership history yet.
                        </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <CancelBtn onClick={() => setTermHistoryGroup(null)} label="Close" />
                    </div>
                </ModalOverlay>
            )}

            {/* ── Join Requests Modal ──────────────────────────────── */}
            {joinRequestsGroup && (
                <ModalOverlay onClose={() => setJoinRequestsGroup(null)}>
                    <ModalHeader title={`Join Requests: ${joinRequestsGroup.name}`} onClose={() => setJoinRequestsGroup(null)} />
                    {joinRequestsLoading ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '2rem', fontSize: '0.9rem' }}>Loading...</p>
                    ) : joinRequests.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {joinRequests.map(req => (
                                <div key={req.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px',
                                }}>
                                    <Avatar name={req.user.first_name} image={req.user.profile_image} size={36} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#e0e0e0', fontWeight: 500 }}>
                                            {req.user.first_name} {req.user.last_name}
                                        </p>
                                        <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#666' }}>@{req.user.username}</p>
                                        {req.message && (
                                            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#888', fontStyle: 'italic' }}>
                                                "{req.message}"
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                                        <button onClick={() => handleApproveJoin(joinRequestsGroup.id, req.id)}
                                            disabled={submitting}
                                            style={{
                                                ...tinyBtnStyle('#22C55E'), padding: '6px 10px',
                                                fontSize: '0.72rem', fontWeight: 600, gap: '3px',
                                                display: 'flex', alignItems: 'center',
                                            }} title="Approve">
                                            <Check size={12} /> Approve
                                        </button>
                                        <button onClick={() => handleRejectJoin(joinRequestsGroup.id, req.id)}
                                            disabled={submitting}
                                            style={{
                                                ...tinyBtnStyle('#EF4444'), padding: '6px 10px',
                                                fontSize: '0.72rem', fontWeight: 600, gap: '3px',
                                                display: 'flex', alignItems: 'center',
                                            }} title="Reject">
                                            <XCircle size={12} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#666', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
                            No pending join requests.
                        </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <CancelBtn onClick={() => setJoinRequestsGroup(null)} label="Close" />
                    </div>
                </ModalOverlay>
            )}

            {/* ── Bans Management Modal ──────────────────────────────── */}
            {bansGroup && (
                <ModalOverlay onClose={() => setBansGroup(null)} wide>
                    <ModalHeader title={`Banned Users: ${bansGroup.name}`} onClose={() => setBansGroup(null)} />
                    {bansLoading ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '2rem', fontSize: '0.9rem' }}>Loading...</p>
                    ) : bans.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {bans.map(ban => (
                                <div key={ban.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.04)',
                                    border: '1px solid rgba(239,68,68,0.1)', borderRadius: '10px',
                                }}>
                                    <Avatar name={ban.user.first_name} image={ban.user.profile_image} size={36} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#e0e0e0', fontWeight: 500 }}>
                                            {ban.user.first_name} {ban.user.last_name}
                                        </p>
                                        <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#666' }}>@{ban.user.username}</p>
                                        {ban.reason && (
                                            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#EF4444' }}>
                                                Reason: {ban.reason}
                                            </p>
                                        )}
                                        <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: '#555' }}>
                                            Banned {new Date(ban.banned_at).toLocaleDateString()}
                                            {ban.expires_at ? ` · Expires ${new Date(ban.expires_at).toLocaleDateString()}` : ' · Permanent'}
                                            {ban.expires_at && !ban.is_active && (
                                                <span style={{ color: '#22C55E', fontWeight: 600 }}> (Expired)</span>
                                            )}
                                        </p>
                                    </div>
                                    <button onClick={() => handleUnban(bansGroup.id, ban.user.id)}
                                        style={{
                                            ...tinyBtnStyle('#22C55E'), padding: '6px 10px',
                                            fontSize: '0.72rem', fontWeight: 600, gap: '3px',
                                            display: 'flex', alignItems: 'center', flexShrink: 0,
                                        }} title="Unban">
                                        <ShieldOff size={12} /> Unban
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#666', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
                            No banned users.
                        </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <CancelBtn onClick={() => setBansGroup(null)} label="Close" />
                    </div>
                </ModalOverlay>
            )}

            {/* ── Ban Member Modal ──────────────────────────────── */}
            {banningMember && (
                <ModalOverlay onClose={() => { setBanningMember(null); setBanReason(''); setBanExpiry(''); }}>
                    <ModalHeader
                        title={`Ban: ${banningMember.member.first_name} ${banningMember.member.last_name}`}
                        onClose={() => { setBanningMember(null); setBanReason(''); setBanExpiry(''); }}
                    />
                    <div style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem',
                        display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                    }}>
                        <AlertTriangle size={16} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#EF4444', lineHeight: 1.5 }}>
                            This will remove the user from the group and prevent them from rejoining. Any pending join requests will also be rejected.
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Reason *</label>
                            <textarea value={banReason} onChange={e => setBanReason(e.target.value)}
                                placeholder="Reason for banning this user..."
                                rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Expiry Date (optional)</label>
                            <input type="date" value={banExpiry} onChange={e => setBanExpiry(e.target.value)}
                                style={inputStyle}
                                min={new Date().toISOString().split('T')[0]} />
                            <p style={{ fontSize: '0.7rem', color: '#555', margin: '0.3rem 0 0' }}>
                                Leave empty for a permanent ban.
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <CancelBtn onClick={() => { setBanningMember(null); setBanReason(''); setBanExpiry(''); }} />
                        <button onClick={handleBan} disabled={submitting || !banReason.trim()} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '0.6rem 1.25rem', borderRadius: '10px',
                            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#EF4444', fontSize: '0.85rem', fontWeight: 600,
                            cursor: submitting || !banReason.trim() ? 'not-allowed' : 'pointer',
                            opacity: submitting || !banReason.trim() ? 0.6 : 1, transition: 'all 0.15s',
                        }}
                            onMouseEnter={e => { if (banReason.trim()) e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                        >
                            <Ban size={14} />
                            {submitting ? 'Banning...' : 'Ban User'}
                        </button>
                    </div>
                </ModalOverlay>
            )}

            {/* ── Suspend Group Modal ──────────────────────────────── */}
            {suspendingGroup && (
                <ModalOverlay onClose={() => { setSuspendingGroup(null); setSuspendReason(''); }}>
                    <ModalHeader
                        title={`Suspend: ${suspendingGroup.name}`}
                        onClose={() => { setSuspendingGroup(null); setSuspendReason(''); }}
                    />
                    <div style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem',
                        display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                    }}>
                        <AlertTriangle size={16} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#EF4444', lineHeight: 1.5 }}>
                            Suspending a group will disable broadcasts, new messages, and polls for this group. Members remain but the group becomes read-only.
                        </p>
                    </div>
                    <div>
                        <label style={labelStyle}>Suspension Reason *</label>
                        <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
                            placeholder="Reason for suspending this group..."
                            rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <CancelBtn onClick={() => { setSuspendingGroup(null); setSuspendReason(''); }} />
                        <button onClick={handleSuspend} disabled={submitting || !suspendReason.trim()} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '0.6rem 1.25rem', borderRadius: '10px',
                            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#EF4444', fontSize: '0.85rem', fontWeight: 600,
                            cursor: submitting || !suspendReason.trim() ? 'not-allowed' : 'pointer',
                            opacity: submitting || !suspendReason.trim() ? 0.6 : 1, transition: 'all 0.15s',
                        }}
                            onMouseEnter={e => { if (suspendReason.trim()) e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                        >
                            <PauseCircle size={14} />
                            {submitting ? 'Suspending...' : 'Suspend Group'}
                        </button>
                    </div>
                </ModalOverlay>
            )}

            {/* ── Auto-membership Rules Modal ─────────────────────── */}
            {autoRulesGroup && (
                <ModalOverlay onClose={() => { setAutoRulesGroup(null); setShowCreateRule(false); }} wide>
                    <ModalHeader title={`Auto-membership Rules: ${autoRulesGroup.name}`}
                        onClose={() => { setAutoRulesGroup(null); setShowCreateRule(false); }} />

                    {!showCreateRule && (
                        <button onClick={() => { setShowCreateRule(true); setRuleType('class_set'); setRuleTargets([]); setRuleTargetId(null); setRuleTargetName(''); loadRuleTargets('class_set', autoRulesGroup.id); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.6rem 1rem', marginBottom: '1rem',
                                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
                                borderRadius: '10px', color: '#8B5CF6', fontSize: '0.82rem', fontWeight: 600,
                                cursor: 'pointer', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.18)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; }}
                        >
                            <Plus size={14} /> New Rule
                        </button>
                    )}

                    {/* Create Rule Form */}
                    {showCreateRule && (
                        <div style={{
                            background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)',
                            borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem',
                        }}>
                            <p style={{ margin: '0 0 0.8rem', fontSize: '0.85rem', fontWeight: 600, color: '#e0e0e0' }}>
                                Create Auto-membership Rule
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <div>
                                    <label style={labelStyle}>Rule Type</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                                        {[
                                            { value: 'class_set', label: 'Class Set' },
                                            { value: 'faculty', label: 'Faculty' },
                                            { value: 'all_followers', label: 'All Followers' },
                                        ].map(rt => (
                                            <button key={rt.value} type="button"
                                                onClick={() => loadRuleTargets(rt.value, autoRulesGroup.id)}
                                                style={{
                                                    padding: '0.55rem 0.5rem', borderRadius: '8px',
                                                    background: ruleType === rt.value ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${ruleType === rt.value ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.06)'}`,
                                                    color: ruleType === rt.value ? '#8B5CF6' : '#888',
                                                    fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                {rt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {ruleType !== 'all_followers' && (
                                    <div>
                                        <label style={labelStyle}>Select Target</label>
                                        {ruleTargets.length > 0 ? (
                                            <select
                                                value={ruleTargetId ?? ''}
                                                onChange={e => {
                                                    const id = parseInt(e.target.value);
                                                    setRuleTargetId(id);
                                                    const target = ruleTargets.find(t => t.id === id);
                                                    setRuleTargetName(target?.name || '');
                                                }}
                                                style={{ ...inputStyle, cursor: 'pointer' }}
                                            >
                                                <option value="">Select...</option>
                                                {ruleTargets.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p style={{ color: '#666', fontSize: '0.8rem', margin: 0, fontStyle: 'italic' }}>
                                                Loading targets...
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <CancelBtn onClick={() => setShowCreateRule(false)} />
                                <PrimaryBtn onClick={handleCreateRule}
                                    disabled={submitting || (ruleType !== 'all_followers' && !ruleTargetId)}
                                    label={submitting ? 'Creating...' : 'Create Rule'} />
                            </div>
                        </div>
                    )}

                    {/* Rules list */}
                    {autoRulesLoading ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '2rem', fontSize: '0.9rem' }}>Loading...</p>
                    ) : autoRules.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {autoRules.map(rule => (
                                <div key={rule.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px',
                                }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        background: 'rgba(6,182,212,0.12)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <Zap size={16} color="#06B6D4" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#e0e0e0', fontWeight: 500 }}>
                                            {rule.rule_type_label}
                                            {rule.target_name && <span style={{ color: '#8B5CF6' }}> — {rule.target_name}</span>}
                                        </p>
                                        <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#555' }}>
                                            {rule.last_run_at
                                                ? `Last run: ${new Date(rule.last_run_at).toLocaleDateString()} (${rule.last_run_count} added)`
                                                : 'Never executed'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                                        <button onClick={() => handleExecuteRule(autoRulesGroup.id, rule.id)}
                                            disabled={submitting}
                                            style={{
                                                ...tinyBtnStyle('#22C55E'), padding: '6px 10px',
                                                fontSize: '0.72rem', fontWeight: 600, gap: '3px',
                                                display: 'flex', alignItems: 'center',
                                            }} title="Execute rule now">
                                            <Play size={12} /> Run
                                        </button>
                                        <button onClick={() => handleDeleteRule(autoRulesGroup.id, rule.id)}
                                            style={{
                                                ...tinyBtnStyle('#EF4444'), padding: '6px 10px',
                                                fontSize: '0.72rem', fontWeight: 600, gap: '3px',
                                                display: 'flex', alignItems: 'center',
                                            }} title="Delete rule">
                                            <Trash size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#666', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
                            No auto-membership rules yet. Create one to automatically add users to this group.
                        </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <CancelBtn onClick={() => { setAutoRulesGroup(null); setShowCreateRule(false); }} label="Close" />
                    </div>
                </ModalOverlay>
            )}

            {/* ── Confirmation Dialog ──────────────────────────────── */}
            {confirmDialog && (() => {
                const isDelete = confirmDialog.action === 'delete-group';
                const title = isDelete ? 'Delete Group' : 'Remove Member';
                const message = isDelete
                    ? `Are you sure you want to delete "${confirmDialog.group.name}"? All members and leadership history will be permanently removed.`
                    : `Are you sure you want to remove ${confirmDialog.member?.first_name} ${confirmDialog.member?.last_name} from ${confirmDialog.group.name}?`;
                const onConfirm = isDelete ? handleDelete : handleRemoveMember;
                const Icon = isDelete ? Trash2 : UserMinus;

                return (
                    <div onClick={dismissConfirm} style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                        animation: 'fadeIn 0.15s ease-out',
                    }}>
                        <div onClick={e => e.stopPropagation()} style={{
                            background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '400px',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.5)', animation: 'slideUp 0.2s ease-out',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: 'rgba(239,68,68,0.15)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={22} color="#EF4444" />
                                </div>
                                <button onClick={dismissConfirm} style={{
                                    background: 'rgba(255,255,255,0.05)', border: 'none',
                                    borderRadius: '8px', padding: '6px', cursor: 'pointer',
                                    color: '#888', display: 'flex', transition: 'all 0.15s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#ccc'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#888'; }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>{title}</h3>
                            <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#999', lineHeight: 1.5 }}>{message}</p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <CancelBtn onClick={dismissConfirm} />
                                <button onClick={onConfirm} disabled={submitting} style={{
                                    padding: '0.6rem 1.25rem', borderRadius: '10px',
                                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                                    color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px',
                                    opacity: submitting ? 0.6 : 1,
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                                >
                                    <Icon size={14} />
                                    {submitting ? 'Processing...' : title}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(10px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
            `}</style>
        </OrgLayout>
    );
}

// ─── Sub-components ──────────────────────────────────────────────────

function Avatar({ name, image, size = 30 }: { name: string; image: string | null; size?: number }) {
    return (
        <div style={{
            width: `${size}px`, height: `${size}px`, borderRadius: '50%',
            background: 'rgba(139,92,246,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: `${size * 0.4}px`, fontWeight: 600, color: '#8B5CF6',
            overflow: 'hidden', flexShrink: 0,
        }}>
            {image
                ? <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : name.charAt(0).toUpperCase()
            }
        </div>
    );
}

function MemberCard({ member, group, onChangeRole, onRemove, onBan }: {
    member: GroupMember; group: OrgGroup;
    onChangeRole: () => void; onRemove: () => void; onBan?: () => void;
}) {
    const ri = getRoleInfo(member.role);
    const Icon = ri.icon;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            padding: '0.6rem 0.8rem', borderRadius: '10px',
            background: member.is_leader ? `${ri.color}08` : 'rgba(255,255,255,0.015)',
            border: `1px solid ${member.is_leader ? `${ri.color}15` : 'rgba(255,255,255,0.04)'}`,
            transition: 'background 0.15s',
        }}
            onMouseEnter={e => { e.currentTarget.style.background = member.is_leader ? `${ri.color}12` : 'rgba(255,255,255,0.035)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = member.is_leader ? `${ri.color}08` : 'rgba(255,255,255,0.015)'; }}
        >
            <Avatar name={member.first_name} image={member.profile_image} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#e0e0e0', fontWeight: 500 }}>
                        {member.first_name} {member.last_name}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1px' }}>
                    <span style={{ fontSize: '0.68rem', color: '#666' }}>@{member.username}</span>
                    <span style={{
                        fontSize: '0.6rem', fontWeight: 700, color: ri.color,
                        background: `${ri.color}15`, padding: '0.5px 5px', borderRadius: '4px',
                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                    }}>
                        <Icon size={9} /> {member.role_label}
                    </span>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                <button onClick={onChangeRole} style={tinyBtnStyle('#8B5CF6')} title="Change role">
                    <Crown size={12} />
                </button>
                {onBan && (
                    <button onClick={onBan} style={tinyBtnStyle('#F97316')} title="Ban member">
                        <Ban size={12} />
                    </button>
                )}
                <button onClick={onRemove} style={tinyBtnStyle('#EF4444')} title="Remove">
                    <UserMinus size={12} />
                </button>
            </div>
        </div>
    );
}

function ModalOverlay({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem',
            animation: 'fadeIn 0.15s ease-out',
        }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{
                background: '#141425', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', padding: '2rem', width: '100%',
                maxWidth: wide ? '680px' : '520px', maxHeight: '85vh', overflowY: 'auto',
                scrollbarWidth: 'none' as const, animation: 'slideUp 0.2s ease-out',
            }}>
                {children}
            </div>
        </div>
    );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={20} />
            </button>
        </div>
    );
}

function ModalActions({ onClose, submitLabel, submitting, canSubmit }: {
    onClose: () => void; submitLabel: string; submitting: boolean; canSubmit: boolean;
}) {
    return (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <CancelBtn onClick={onClose} />
            <button type="submit" disabled={submitting || !canSubmit} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                color: '#fff', border: 'none', borderRadius: '10px',
                fontWeight: 600, fontSize: '0.9rem',
                cursor: submitting || !canSubmit ? 'not-allowed' : 'pointer',
                opacity: submitting || !canSubmit ? 0.6 : 1,
            }}>
                {submitLabel}
            </button>
        </div>
    );
}

function CancelBtn({ onClick, label = 'Cancel' }: { onClick: () => void; label?: string }) {
    return (
        <button type="button" onClick={onClick} style={{
            padding: '0.6rem 1.25rem', borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#ccc', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.15s',
        }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        >
            {label}
        </button>
    );
}

function PrimaryBtn({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
    return (
        <button type="button" onClick={onClick} disabled={disabled} style={{
            padding: '0.6rem 1.25rem', borderRadius: '10px',
            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
            border: 'none', color: '#fff', fontSize: '0.85rem', fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1, transition: 'opacity 0.15s',
        }}>
            {label}
        </button>
    );
}

function iconBtnStyle(color: string): React.CSSProperties {
    return {
        background: `${color}15`, border: 'none', borderRadius: '8px',
        padding: '0.45rem', cursor: 'pointer', color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
    };
}

function tinyBtnStyle(color: string): React.CSSProperties {
    return {
        background: `${color}10`, border: 'none', borderRadius: '6px',
        padding: '4px', cursor: 'pointer', color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
    };
}
