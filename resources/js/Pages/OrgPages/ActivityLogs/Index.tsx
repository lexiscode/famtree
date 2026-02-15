import OrgLayout from '@/Layouts/OrgLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ScrollText,
    Search,
    X,
    LogIn,
    LogOut,
    AlertTriangle,
    Eye,
    FileText,
    Trash2,
    Megaphone,
    UserPlus,
    Users,
    UserMinus,
    Shield,
    Activity,
    ChevronLeft,
    ChevronRight,
    Edit,
} from 'lucide-react';

interface ActivityLog {
    id: number;
    action_type: string;
    resource_type: string | null;
    description: string;
    account_name: string;
    account_id: number | null;
    ip_address: string | null;
    created_at: string;
    created_at_human: string;
}

interface FilterOptions {
    action_types: string[];
    accounts: { id: number; name: string }[];
}

interface PaginatedLogs {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    logs: PaginatedLogs;
    filters: Record<string, string | undefined>;
    filterOptions: FilterOptions;
}

const ACTION_CONFIG: Record<string, { color: string; bg: string; icon: React.ComponentType<{ size?: number }> }> = {
    login: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)', icon: LogIn },
    logout: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', icon: LogOut },
    failed_login: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', icon: AlertTriangle },
    page_access: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)', icon: Eye },
    post_created: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', icon: FileText },
    post_updated: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', icon: Edit },
    post_deleted: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', icon: Trash2 },
    broadcast_created: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)', icon: Megaphone },
    broadcast_updated: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)', icon: Megaphone },
    broadcast_cancelled: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', icon: Megaphone },
    staff_created: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)', icon: UserPlus },
    staff_updated: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', icon: Users },
    staff_deleted: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', icon: UserMinus },
    role_created: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)', icon: Shield },
    role_updated: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', icon: Shield },
    role_deleted: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', icon: Shield },
};

const DEFAULT_CONFIG = { color: '#888', bg: 'rgba(136, 136, 136, 0.15)', icon: Activity };

function getActionConfig(actionType: string) {
    return ACTION_CONFIG[actionType] || DEFAULT_CONFIG;
}

function formatActionLabel(actionType: string): string {
    return actionType.replace(/_/g, ' ');
}

export default function ActivityLogsIndex({ logs, filters, filterOptions }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [actionType, setActionType] = useState(filters.action_type || '');
    const [accountId, setAccountId] = useState(filters.account_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const applyFilters = (overrides: Record<string, string> = {}) => {
        const params: Record<string, string> = {};
        const merged = {
            search,
            action_type: actionType,
            account_id: accountId,
            date_from: dateFrom,
            date_to: dateTo,
            ...overrides,
        };

        Object.entries(merged).forEach(([key, value]) => {
            if (value) params[key] = value;
        });

        router.get(route('org.activity-logs.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setActionType('');
        setAccountId('');
        setDateFrom('');
        setDateTo('');
        router.get(route('org.activity-logs.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const goToPage = (page: number) => {
        const params: Record<string, string> = { page: String(page) };
        if (search) params.search = search;
        if (actionType) params.action_type = actionType;
        if (accountId) params.account_id = accountId;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        router.get(route('org.activity-logs.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = !!(filters.search || filters.action_type || filters.account_id || filters.date_from || filters.date_to);

    const inputStyle: React.CSSProperties = {
        background: '#1e1e35',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '8px',
        padding: '0.625rem 0.875rem',
        color: '#ffffff',
        fontSize: '0.875rem',
        outline: 'none',
        width: '100%',
    };

    const selectStyle: React.CSSProperties = {
        ...inputStyle,
        cursor: 'pointer',
        appearance: 'none' as const,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        paddingRight: '2rem',
    };

    return (
        <OrgLayout>
            <div>
                {/* Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                        Activity Logs
                    </h1>
                    <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                        {logs.total} total log{logs.total !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Filters */}
                <div style={{
                    background: '#141425',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '0.75rem',
                        alignItems: 'end',
                    }}>
                        {/* Search */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#888', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Search
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(); }}
                                    placeholder="Search descriptions..."
                                    style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                                />
                            </div>
                        </div>

                        {/* Action Type */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#888', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Action Type
                            </label>
                            <select
                                value={actionType}
                                onChange={(e) => { setActionType(e.target.value); applyFilters({ action_type: e.target.value }); }}
                                style={selectStyle}
                            >
                                <option value="">All Actions</option>
                                {filterOptions.action_types.map((type) => (
                                    <option key={type} value={type}>{formatActionLabel(type)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Account */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#888', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Account
                            </label>
                            <select
                                value={accountId}
                                onChange={(e) => { setAccountId(e.target.value); applyFilters({ account_id: e.target.value }); }}
                                style={selectStyle}
                            >
                                <option value="">All Accounts</option>
                                {filterOptions.accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date From */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#888', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                From
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => { setDateFrom(e.target.value); applyFilters({ date_from: e.target.value }); }}
                                style={inputStyle}
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#888', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                To
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => { setDateTo(e.target.value); applyFilters({ date_to: e.target.value }); }}
                                style={inputStyle}
                            />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                            <button
                                onClick={() => applyFilters()}
                                style={{
                                    padding: '0.625rem 1rem',
                                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <Search size={14} />
                                Search
                            </button>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    style={{
                                        padding: '0.625rem 0.875rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: '#888',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <X size={14} />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div style={{
                    background: '#141425',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                }}>
                    {logs.data.length > 0 ? (
                        <>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            {['Action Type', 'Description', 'Account', 'IP Address', 'Time'].map((header) => (
                                                <th
                                                    key={header}
                                                    style={{
                                                        padding: '1rem',
                                                        textAlign: 'left',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        color: '#888',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.data.map((log) => {
                                            const config = getActionConfig(log.action_type);
                                            const Icon = config.icon;
                                            return (
                                                <tr
                                                    key={log.id}
                                                    style={{ transition: 'background 0.2s ease' }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    <td style={{
                                                        padding: '1rem',
                                                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            padding: '0.3rem 0.65rem',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            color: config.color,
                                                            background: config.bg,
                                                            textTransform: 'capitalize',
                                                        }}>
                                                            <Icon size={13} />
                                                            {formatActionLabel(log.action_type)}
                                                        </span>
                                                    </td>
                                                    <td style={{
                                                        padding: '1rem',
                                                        fontSize: '0.875rem',
                                                        color: '#e0e0e0',
                                                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                        maxWidth: '400px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        {log.description}
                                                    </td>
                                                    <td style={{
                                                        padding: '1rem',
                                                        fontSize: '0.875rem',
                                                        color: '#888',
                                                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        {log.account_name}
                                                    </td>
                                                    <td style={{
                                                        padding: '1rem',
                                                        fontSize: '0.8rem',
                                                        color: '#666',
                                                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        {log.ip_address || '--'}
                                                    </td>
                                                    <td style={{
                                                        padding: '1rem',
                                                        fontSize: '0.8rem',
                                                        color: '#666',
                                                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        <span title={new Date(log.created_at).toLocaleString()}>
                                                            {log.created_at_human}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {logs.last_page > 1 && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem 1.25rem',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                                        Page {logs.current_page} of {logs.last_page} ({logs.total} total)
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => goToPage(logs.current_page - 1)}
                                            disabled={logs.current_page <= 1}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                padding: '0.5rem 0.875rem',
                                                background: logs.current_page <= 1 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(139, 92, 246, 0.1)',
                                                color: logs.current_page <= 1 ? '#555' : '#8B5CF6',
                                                border: '1px solid ' + (logs.current_page <= 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(139, 92, 246, 0.2)'),
                                                borderRadius: '8px',
                                                fontWeight: 600,
                                                fontSize: '0.8rem',
                                                cursor: logs.current_page <= 1 ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            <ChevronLeft size={14} />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => goToPage(logs.current_page + 1)}
                                            disabled={logs.current_page >= logs.last_page}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                padding: '0.5rem 0.875rem',
                                                background: logs.current_page >= logs.last_page ? 'rgba(255, 255, 255, 0.03)' : 'rgba(139, 92, 246, 0.1)',
                                                color: logs.current_page >= logs.last_page ? '#555' : '#8B5CF6',
                                                border: '1px solid ' + (logs.current_page >= logs.last_page ? 'rgba(255, 255, 255, 0.05)' : 'rgba(139, 92, 246, 0.2)'),
                                                borderRadius: '8px',
                                                fontWeight: 600,
                                                fontSize: '0.8rem',
                                                cursor: logs.current_page >= logs.last_page ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            Next
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                        }}>
                            <ScrollText size={32} color="#555" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                                {hasActiveFilters
                                    ? 'No activity logs match your filters.'
                                    : 'No activity logs yet.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </OrgLayout>
    );
}
