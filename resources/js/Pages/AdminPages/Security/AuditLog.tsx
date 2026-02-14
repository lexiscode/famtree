import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FileText,
    Search,
    Filter,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Shield,
    Clock,
    Zap,
    ArrowLeft,
} from 'lucide-react';

interface LogEntry {
    id: number;
    admin_name: string;
    action_type: string;
    resource_type: string;
    description: string;
    ip_address: string;
    created_at: string;
    created_at_formatted: string;
}

interface PaginatedData {
    data: LogEntry[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    logs: PaginatedData;
    filters: Record<string, any>;
    search: string;
    perPage: number;
}

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

const actionTypeColors: Record<string, { bg: string; border: string; text: string }> = {
    create: { bg: '#e8f5e9', border: '#198754', text: '#155724' },
    update: { bg: '#e7f1ff', border: '#0d6efd', text: '#084298' },
    delete: { bg: '#ffebee', border: '#dc3545', text: '#842029' },
    login: { bg: '#e0f7fa', border: '#0dcaf0', text: '#0c5460' },
    logout: { bg: '#f3f4f6', border: '#6c757d', text: '#6c757d' },
    export: { bg: '#fff8e1', border: '#ffc107', text: '#856404' },
    default: { bg: '#f3f4f6', border: '#6c757d', text: '#6c757d' },
};

export default function AuditLog({ logs, filters, search, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterActionType, setFilterActionType] = useState(filters?.action_type || '');
    const [filterResourceType, setFilterResourceType] = useState(filters?.resource_type || '');
    const isInitialMount = useRef(true);

    const buildParams = useCallback(() => {
        const filterObj: Record<string, any> = {};
        if (filterActionType) filterObj.action_type = filterActionType;
        if (filterResourceType) filterObj.resource_type = filterResourceType;
        return {
            search: searchQuery,
            filters: filterObj,
            per_page: perPage,
        };
    }, [searchQuery, filterActionType, filterResourceType, perPage]);

    const handleSearch = useCallback(() => {
        router.get(route('admin.security.auditLog'), buildParams(), { preserveScroll: true });
    }, [buildParams]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(route('admin.security.auditLog'), buildParams(), { preserveScroll: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [filterActionType, filterResourceType]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setFilterActionType('');
        setFilterResourceType('');
        router.get(route('admin.security.auditLog'), { search: '', filters: {}, per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = useCallback((page: number) => {
        router.get(route('admin.security.auditLog'), { ...buildParams(), page }, { preserveScroll: true });
    }, [buildParams]);

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = logs.current_page;
        const last = logs.last_page;
        let start = Math.max(1, current - 2);
        let end = Math.min(last, current + 2);
        if (current <= 3) end = Math.min(last, 5);
        if (current >= last - 2) start = Math.max(1, last - 4);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const getActionBadge = (actionType: string) => {
        const config = actionTypeColors[actionType.toLowerCase()] || actionTypeColors.default;
        return (
            <span style={{
                display: 'inline-block',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                backgroundColor: config.bg,
                color: config.text,
                border: `1.5px solid ${config.border}`,
                textTransform: 'capitalize',
            }}>
                {actionType}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Flash Messages */}
                {flash?.success && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        background: '#e8f5e9',
                        border: `2px solid ${THEME.success}`,
                        color: THEME.success,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                    }}>
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        background: '#ffebee',
                        border: `2px solid ${THEME.danger}`,
                        color: THEME.danger,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                    }}>
                        {flash.error}
                    </div>
                )}

                {/* Gradient Header */}
                <div
                    style={{
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                        borderRadius: '20px',
                        padding: '2.5rem',
                        color: '#FFFFFF',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 16px 48px rgba(13, 110, 253, 0.20)',
                    }}
                >
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '50%' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <FileText size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                Admin Audit Log
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            Track and review all administrative actions and system events
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Complete audit trail for compliance and accountability
                            </span>
                        </div>
                    </div>
                </div>

                {/* Back to Security Dashboard */}
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => router.get(route('admin.security.dashboard'))}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.7rem 1.25rem',
                            background: '#FFFFFF',
                            color: THEME.primary,
                            border: `2px solid #E5E7EB`,
                            borderRadius: '12px',
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = THEME.primary;
                            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <ArrowLeft size={16} strokeWidth={2.5} />
                        Back to Security
                    </button>
                </div>

                {/* Search and Filters */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div
                            style={{
                                flex: '1 1 320px',
                                minWidth: '280px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                background: '#FFFFFF',
                                border: '2.5px solid #e9ecef',
                                borderRadius: '14px',
                                padding: '0.85rem 1.25rem',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = THEME.primary;
                                e.currentTarget.style.boxShadow = `0 12px 28px ${THEME.primary}18, 0 2px 8px rgba(0, 0, 0, 0.03)`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e9ecef';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
                            }}
                        >
                            <Search size={20} color={THEME.primary} strokeWidth={2} />
                            <input
                                type="text"
                                placeholder="Search by description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.98rem', color: '#0a0e27', background: 'transparent', fontFamily: 'inherit' }}
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            style={{
                                padding: '0.8rem 1.85rem',
                                background: `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: '0.96rem',
                                letterSpacing: '0.3px',
                                boxShadow: `0 4px 12px ${THEME.primary}25`,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = `0 16px 32px ${THEME.primary}40`;
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}25`;
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Search
                        </button>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                padding: '0.8rem 1.4rem',
                                background: showFilters ? `linear-gradient(135deg, ${THEME.primary}10, #0a58ca08)` : '#FFFFFF',
                                color: showFilters ? THEME.primary : '#6c757d',
                                border: `2.5px solid ${showFilters ? THEME.primary : '#e9ecef'}`,
                                borderRadius: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: '0.96rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                letterSpacing: '0.3px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                            }}
                            onMouseEnter={(e) => {
                                if (!showFilters) {
                                    e.currentTarget.style.borderColor = THEME.primary;
                                    e.currentTarget.style.color = THEME.primary;
                                    e.currentTarget.style.background = `${THEME.primary}08`;
                                    e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.primary}20`;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!showFilters) {
                                    e.currentTarget.style.borderColor = '#e9ecef';
                                    e.currentTarget.style.color = '#6c757d';
                                    e.currentTarget.style.background = '#FFFFFF';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
                                }
                            }}
                        >
                            <Filter size={18} strokeWidth={2.5} />
                            Filters
                            <ChevronDown size={16} style={{ transform: showFilters ? 'rotate(180deg)' : '', transition: 'transform 0.4s ease' }} />
                        </button>
                    </div>

                    {showFilters && (
                        <div
                            style={{
                                background: '#FFFFFF',
                                border: '2px solid #E5E7EB',
                                borderRadius: '16px',
                                padding: '2rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: '1.75rem',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                            }}
                        >
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Action Type
                                </label>
                                <select
                                    value={filterActionType}
                                    onChange={(e) => setFilterActionType(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.96rem', color: '#0a0e27', cursor: 'pointer', backgroundColor: '#FFFFFF', fontWeight: 600 }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <option value="">All Actions</option>
                                    <option value="create">Create</option>
                                    <option value="update">Update</option>
                                    <option value="delete">Delete</option>
                                    <option value="login">Login</option>
                                    <option value="logout">Logout</option>
                                    <option value="export">Export</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Resource Type
                                </label>
                                <select
                                    value={filterResourceType}
                                    onChange={(e) => setFilterResourceType(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.96rem', color: '#0a0e27', cursor: 'pointer', backgroundColor: '#FFFFFF', fontWeight: 600 }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <option value="">All Resources</option>
                                    <option value="user">User</option>
                                    <option value="organization">Organization</option>
                                    <option value="post">Post</option>
                                    <option value="report">Report</option>
                                    <option value="settings">Settings</option>
                                    <option value="blog">Blog</option>
                                    <option value="family_tree">Family Tree</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {(searchQuery || filterActionType || filterResourceType) && (
                        <button
                            onClick={handleReset}
                            style={{ marginTop: '1.25rem', fontSize: '0.92rem', color: THEME.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: '0.5rem 1rem', borderRadius: '8px', letterSpacing: '0.3px' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#0a58ca'; e.currentTarget.style.background = `${THEME.primary}08`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = THEME.primary; e.currentTarget.style.background = 'none'; }}
                        >
                            Reset all filters
                        </button>
                    )}
                </div>

                {/* Audit Log Table */}
                <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '2px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    {logs.data.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        {['Admin', 'Action', 'Resource', 'Description', 'IP Address', 'Date'].map((h) => (
                                            <th key={h} style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.data.map((log) => (
                                        <tr
                                            key={log.id}
                                            style={{
                                                borderBottom: '1.5px solid #E5E7EB',
                                                background: '#FFFFFF',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                                        >
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '10px',
                                                        background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                                                        color: '#FFFFFF',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 700,
                                                        fontSize: '0.85rem',
                                                    }}>
                                                        {log.admin_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27' }}>
                                                        {log.admin_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                {getActionBadge(log.action_type)}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.35rem 0.75rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    backgroundColor: '#f0f7ff',
                                                    color: THEME.primary,
                                                    border: '1.5px solid #cfe2ff',
                                                    textTransform: 'capitalize',
                                                }}>
                                                    {log.resource_type.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', maxWidth: '250px' }}>
                                                <p style={{ fontSize: '0.92rem', color: '#4B5563', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                    {log.description}
                                                </p>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.35rem 0.75rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#374151',
                                                    fontFamily: 'monospace',
                                                }}>
                                                    {log.ip_address}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.92rem', fontWeight: 500 }}>
                                                    <Clock size={14} />
                                                    {log.created_at_formatted}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', background: '#F3F4F6', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <FileText size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No audit log entries found
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div
                        style={{
                            marginTop: '2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#FFFFFF',
                            padding: '1.75rem 2rem',
                            borderRadius: '16px',
                            border: '2px solid #E5E7EB',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                            flexWrap: 'wrap',
                            gap: '1rem',
                        }}
                    >
                        <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#4B5563', margin: 0 }}>
                            Showing <span style={{ fontWeight: 800, color: '#0a0e27' }}>{logs.from}</span> to{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{logs.to}</span> of{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{logs.total}</span> results
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(logs.current_page - 1)}
                                disabled={logs.current_page === 1}
                                style={{
                                    padding: '0.6rem 0.85rem',
                                    borderRadius: '10px',
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2.5px solid #e9ecef',
                                    cursor: logs.current_page === 1 ? 'not-allowed' : 'pointer',
                                    background: logs.current_page === 1 ? '#f9fafb' : '#f8f9fa',
                                    color: logs.current_page === 1 ? '#adb5bd' : '#0a0e27',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (logs.current_page !== 1) {
                                        e.currentTarget.style.background = '#e9ecef';
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (logs.current_page !== 1) {
                                        e.currentTarget.style.background = '#f8f9fa';
                                        e.currentTarget.style.borderColor = '#e9ecef';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                <ChevronLeft size={16} />
                                Prev
                            </button>

                            {/* Page Numbers */}
                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    style={{
                                        padding: '0.6rem 0.85rem',
                                        borderRadius: '10px',
                                        fontSize: '0.92rem',
                                        fontWeight: 700,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: `2.5px solid ${page === logs.current_page ? THEME.primary : '#e9ecef'}`,
                                        cursor: 'pointer',
                                        background: page === logs.current_page ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)` : '#f8f9fa',
                                        color: page === logs.current_page ? '#FFFFFF' : '#0a0e27',
                                        boxShadow: page === logs.current_page ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                        minWidth: '44px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (page !== logs.current_page) {
                                            e.currentTarget.style.background = '#e9ecef';
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (page !== logs.current_page) {
                                            e.currentTarget.style.background = '#f8f9fa';
                                            e.currentTarget.style.borderColor = '#e9ecef';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(logs.current_page + 1)}
                                disabled={logs.current_page === logs.last_page}
                                style={{
                                    padding: '0.6rem 0.85rem',
                                    borderRadius: '10px',
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2.5px solid #e9ecef',
                                    cursor: logs.current_page === logs.last_page ? 'not-allowed' : 'pointer',
                                    background: logs.current_page === logs.last_page ? '#f9fafb' : '#f8f9fa',
                                    color: logs.current_page === logs.last_page ? '#adb5bd' : '#0a0e27',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (logs.current_page !== logs.last_page) {
                                        e.currentTarget.style.background = '#e9ecef';
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (logs.current_page !== logs.last_page) {
                                        e.currentTarget.style.background = '#f8f9fa';
                                        e.currentTarget.style.borderColor = '#e9ecef';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
