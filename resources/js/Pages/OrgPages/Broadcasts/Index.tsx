import OrgLayout from '@/Layouts/OrgLayout';
import { router } from '@inertiajs/react';
import { Plus, Megaphone, ChevronLeft, ChevronRight, Filter, ShieldCheck, Flag, Tag, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface BroadcastCreator {
    display_name: string | null;
    username: string;
}

interface Broadcast {
    id: number;
    uuid: string;
    title: string | null;
    message: string;
    category: string;
    priority: string;
    target_type: string;
    schedule_type: string;
    status: string;
    requires_approval: boolean;
    approval_status: string | null;
    is_flagged: boolean;
    sent_to_count: number;
    created_at: string;
    creator: BroadcastCreator;
}

interface PaginatedBroadcasts {
    data: Broadcast[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    broadcasts: PaginatedBroadcasts;
    isLimitedAccess: boolean;
    pendingApprovalCount: number;
    categories: Record<string, string>;
    priorities: Record<string, string>;
    filters: Record<string, string>;
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    draft: { color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.15)', label: 'Draft' },
    pending: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', label: 'Pending' },
    sent: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)', label: 'Sent' },
    partially_sent: { color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)', label: 'Partial' },
    cancelled: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Cancelled' },
};

const categoryColors: Record<string, string> = {
    announcement: '#3B82F6',
    event: '#8B5CF6',
    urgent: '#EF4444',
    reminder: '#F59E0B',
    academic: '#06B6D4',
    general: '#6B7280',
};

const priorityConfig: Record<string, { color: string; label: string }> = {
    normal: { color: '#6B7280', label: 'Normal' },
    high: { color: '#F59E0B', label: 'High' },
    critical: { color: '#EF4444', label: 'Critical' },
};

const approvalConfig: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', label: 'Awaiting Approval' },
    approved: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)', label: 'Approved' },
    rejected: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Rejected' },
};

export default function BroadcastsIndex({ broadcasts, isLimitedAccess, pendingApprovalCount, categories, priorities, filters }: Props) {
    const [showFilters, setShowFilters] = useState(Object.keys(filters).length > 0);

    const handlePageChange = (page: number) => {
        router.visit(route('org.broadcasts.index', { ...filters, page }));
    };

    const applyFilter = (key: string, value: string) => {
        const newFilters = { ...filters };
        if (value) {
            newFilters[key] = value;
        } else {
            delete newFilters[key];
        }
        router.visit(route('org.broadcasts.index', newFilters));
    };

    const clearFilters = () => {
        router.visit(route('org.broadcasts.index'));
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    const selectStyle: React.CSSProperties = {
        background: '#1e1e35',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '8px',
        padding: '0.5rem 0.75rem',
        color: '#e0e0e0',
        fontSize: '0.8rem',
        outline: 'none',
        cursor: 'pointer',
        minWidth: '130px',
    };

    return (
        <OrgLayout>
            <div>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                            Broadcasts
                        </h1>
                        <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                            {broadcasts.total} total broadcast{broadcasts.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1rem',
                                background: showFilters ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.04)',
                                color: showFilters ? '#8B5CF6' : '#888',
                                border: `1px solid ${showFilters ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <Filter size={15} />
                            Filters
                            {hasActiveFilters && (
                                <span style={{
                                    background: '#8B5CF6',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                }}>
                                    {Object.keys(filters).length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => router.visit(route('org.broadcasts.create'))}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                        >
                            <Plus size={18} />
                            Create Broadcast
                        </button>
                    </div>
                </div>

                {/* Pending Approval Banner */}
                {!isLimitedAccess && pendingApprovalCount > 0 && (
                    <div
                        style={{
                            background: 'rgba(245, 158, 11, 0.08)',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            borderRadius: '10px',
                            padding: '1rem 1.25rem',
                            marginBottom: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                        }}
                        onClick={() => applyFilter('approval_status', 'pending')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <ShieldCheck size={20} color="#F59E0B" />
                            <div>
                                <p style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                                    {pendingApprovalCount} broadcast{pendingApprovalCount !== 1 ? 's' : ''} pending approval
                                </p>
                                <p style={{ color: '#888', fontSize: '0.8rem', margin: '0.15rem 0 0' }}>
                                    Click to review and approve or reject
                                </p>
                            </div>
                        </div>
                        <ChevronRight size={18} color="#F59E0B" />
                    </div>
                )}

                {/* Filter Bar */}
                {showFilters && (
                    <div style={{
                        background: '#141425',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '10px',
                        padding: '1rem 1.25rem',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                    }}>
                        <select
                            value={filters.category || ''}
                            onChange={(e) => applyFilter('category', e.target.value)}
                            style={selectStyle}
                        >
                            <option value="">All Categories</option>
                            {Object.entries(categories).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>

                        <select
                            value={filters.status || ''}
                            onChange={(e) => applyFilter('status', e.target.value)}
                            style={selectStyle}
                        >
                            <option value="">All Statuses</option>
                            {Object.entries(statusConfig).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.label}</option>
                            ))}
                        </select>

                        <select
                            value={filters.priority || ''}
                            onChange={(e) => applyFilter('priority', e.target.value)}
                            style={selectStyle}
                        >
                            <option value="">All Priorities</option>
                            {Object.entries(priorities).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>

                        {!isLimitedAccess && (
                            <select
                                value={filters.approval_status ?? ''}
                                onChange={(e) => applyFilter('approval_status', e.target.value)}
                                style={selectStyle}
                            >
                                <option value="">All Approvals</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        )}

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '8px',
                                    padding: '0.5rem 0.75rem',
                                    color: '#EF4444',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                )}

                {/* Broadcasts List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {broadcasts.data.length > 0 ? broadcasts.data.map((broadcast) => {
                        const status = statusConfig[broadcast.status] || statusConfig.draft;
                        const catColor = categoryColors[broadcast.category] || categoryColors.general;
                        const pri = priorityConfig[broadcast.priority] || priorityConfig.normal;

                        return (
                            <div
                                key={broadcast.id}
                                style={{
                                    background: '#141425',
                                    border: `1px solid ${broadcast.is_flagged ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                }}
                                onClick={() => router.visit(route('org.broadcasts.show', { broadcast: broadcast.id }))}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = broadcast.is_flagged
                                        ? 'rgba(239, 68, 68, 0.4)'
                                        : 'rgba(139, 92, 246, 0.3)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = broadcast.is_flagged
                                        ? 'rgba(239, 68, 68, 0.25)'
                                        : 'rgba(255, 255, 255, 0.06)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {/* Flagged indicator */}
                                {broadcast.is_flagged && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        background: 'rgba(239, 68, 68, 0.12)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        color: '#EF4444',
                                        fontWeight: 600,
                                    }}>
                                        <Flag size={11} />
                                        Flagged
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '0.75rem',
                                }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                                            {/* Category badge */}
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '5px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                color: catColor,
                                                background: `${catColor}15`,
                                            }}>
                                                <Tag size={10} />
                                                {categories[broadcast.category] || broadcast.category}
                                            </span>

                                            {/* Priority badge (only for high/critical) */}
                                            {broadcast.priority !== 'normal' && (
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '5px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    color: pri.color,
                                                    background: `${pri.color}15`,
                                                }}>
                                                    <AlertTriangle size={10} />
                                                    {pri.label}
                                                </span>
                                            )}

                                            {/* Approval badge */}
                                            {broadcast.requires_approval && broadcast.approval_status && (
                                                <span style={{
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '5px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    color: approvalConfig[broadcast.approval_status]?.color || '#888',
                                                    background: approvalConfig[broadcast.approval_status]?.bg || 'transparent',
                                                }}>
                                                    {approvalConfig[broadcast.approval_status]?.label || broadcast.approval_status}
                                                </span>
                                            )}
                                        </div>
                                        <h3 style={{
                                            fontSize: '1.05rem',
                                            fontWeight: 600,
                                            color: '#ffffff',
                                            margin: '0 0 0.5rem',
                                        }}>
                                            {broadcast.title || 'Untitled Broadcast'}
                                        </h3>
                                        <div
                                            dangerouslySetInnerHTML={{ __html: broadcast.message }}
                                            style={{
                                                color: '#888',
                                                fontSize: '0.875rem',
                                                margin: 0,
                                                lineHeight: 1.6,
                                                wordBreak: 'break-word',
                                                maxHeight: '3.2em',
                                                overflow: 'hidden',
                                            }}
                                        />
                                    </div>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: status.color,
                                        background: status.bg,
                                        flexShrink: 0,
                                        marginLeft: '1rem',
                                    }}>
                                        {status.label}
                                    </span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '1.5rem',
                                    alignItems: 'center',
                                    color: '#666',
                                    fontSize: '0.8rem',
                                }}>
                                    <span>Target: {broadcast.target_type === 'all_groups' ? 'All Groups' : 'Selected Groups'}</span>
                                    <span>Schedule: {broadcast.schedule_type}</span>
                                    <span>Sent to: {broadcast.sent_to_count}</span>
                                    <span style={{ marginLeft: 'auto' }}>
                                        By {broadcast.creator.display_name || broadcast.creator.username} · {new Date(broadcast.created_at).toLocaleDateString()}
                                    </span>
                                </div>
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
                            <Megaphone size={32} color="#555" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                                {hasActiveFilters
                                    ? 'No broadcasts match your filters.'
                                    : 'No broadcasts yet. Create your first broadcast to reach your followers.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {broadcasts.last_page > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginTop: '2rem',
                    }}>
                        <button
                            onClick={() => handlePageChange(broadcasts.current_page - 1)}
                            disabled={broadcasts.current_page === 1}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 1rem',
                                background: broadcasts.current_page === 1 ? 'rgba(255,255,255,0.03)' : 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '8px',
                                color: broadcasts.current_page === 1 ? '#555' : '#8B5CF6',
                                fontSize: '0.85rem',
                                cursor: broadcasts.current_page === 1 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>
                        <span style={{ color: '#888', fontSize: '0.85rem' }}>
                            Page {broadcasts.current_page} of {broadcasts.last_page}
                        </span>
                        <button
                            onClick={() => handlePageChange(broadcasts.current_page + 1)}
                            disabled={broadcasts.current_page === broadcasts.last_page}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 1rem',
                                background: broadcasts.current_page === broadcasts.last_page ? 'rgba(255,255,255,0.03)' : 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '8px',
                                color: broadcasts.current_page === broadcasts.last_page ? '#555' : '#8B5CF6',
                                fontSize: '0.85rem',
                                cursor: broadcasts.current_page === broadcasts.last_page ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </OrgLayout>
    );
}
