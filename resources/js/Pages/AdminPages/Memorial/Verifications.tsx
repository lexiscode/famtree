import { useState, useCallback, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    ChevronDown,
    Filter,
    ShieldCheck,
    CheckCircle,
    AlertCircle,
    Clock,
    ChevronRight,
    Zap,
    XCircle,
    Eye,
} from 'lucide-react';

interface User {
    name: string;
    username: string;
    profile_image_url: string | null;
}

interface Verification {
    id: number;
    uuid: string;
    user: User;
    stage: string;
    status: string;
    created_at: string;
    created_at_formatted: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: Verification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface Statistics {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
}

interface Props {
    verifications: PaginatedData;
    statistics: Statistics;
    search: string;
    filters: Record<string, any>;
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

const stageColors: Record<string, { bg: string; border: string; text: string }> = {
    reengagement: { bg: '#fff8e1', border: '#ffc107', text: '#856404' },
    family_check: { bg: '#e0f7fa', border: '#0dcaf0', text: '#0c5460' },
    final_review: { bg: '#e8f5e9', border: '#198754', text: '#155724' },
};

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    pending: { bg: '#fff8e1', border: '#ffc107', text: '#856404' },
    in_progress: { bg: '#e7f1ff', border: '#0d6efd', text: '#084298' },
    completed: { bg: '#e8f5e9', border: '#198754', text: '#155724' },
    cancelled: { bg: '#ffebee', border: '#dc3545', text: '#842029' },
};

function UserAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={name}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    display: 'block',
                }}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div
            style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
            }}
        >
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function Verifications({ verifications, statistics, search, filters, perPage }: Props) {
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStage, setFilterStage] = useState(filters.stage || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || '');
    const isInitialMount = useRef(true);

    const buildFilterObj = useCallback(() => {
        const filterObj: Record<string, any> = {};
        if (filterStage) filterObj.stage = filterStage;
        if (filterStatus) filterObj.status = filterStatus;
        return filterObj;
    }, [filterStage, filterStatus]);

    const handleSearch = useCallback(() => {
        router.get(
            route('admin.memorial.verifications'),
            { search: searchQuery, filters: buildFilterObj(), per_page: perPage },
            { preserveScroll: true }
        );
    }, [searchQuery, buildFilterObj, perPage]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(
                route('admin.memorial.verifications'),
                { search: searchQuery, filters: buildFilterObj(), per_page: perPage },
                { preserveScroll: true }
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [filterStage, filterStatus]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setFilterStage('');
        setFilterStatus('');
        router.get(route('admin.memorial.verifications'), { search: '', filters: {}, per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = (page: number) => {
        router.get(
            route('admin.memorial.verifications'),
            { page, search: searchQuery, filters: buildFilterObj(), per_page: perPage },
            { preserveScroll: true }
        );
    };

    const getStageBadge = (stage: string) => {
        const config = stageColors[stage] || { bg: '#f3f4f6', border: '#6c757d', text: '#6c757d' };
        return (
            <span
                style={{
                    display: 'inline-block',
                    paddingLeft: '0.6rem',
                    paddingRight: '0.6rem',
                    paddingTop: '0.45rem',
                    paddingBottom: '0.45rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    backgroundColor: config.bg,
                    color: config.text,
                    border: `1.5px solid ${config.border}`,
                    textTransform: 'capitalize',
                }}
            >
                {stage.replace(/_/g, ' ')}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const config = statusColors[status] || { bg: '#f3f4f6', border: '#6c757d', text: '#6c757d' };
        return (
            <span
                style={{
                    display: 'inline-block',
                    paddingLeft: '0.6rem',
                    paddingRight: '0.6rem',
                    paddingTop: '0.45rem',
                    paddingBottom: '0.45rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    backgroundColor: config.bg,
                    color: config.text,
                    border: `1.5px solid ${config.border}`,
                    textTransform: 'capitalize',
                }}
            >
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Header */}
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
                            <ShieldCheck size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                Deceased Verifications
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            Manage and monitor deceased user verification requests and their progress
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Real-time verification tracking and management
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem' }}>
                        {[
                            { label: 'Total Verifications', value: statistics.total, icon: ShieldCheck, color: THEME.primary, lightColor: '#e7f1ff' },
                            { label: 'Pending', value: statistics.pending, icon: Clock, color: THEME.warning, lightColor: '#fff8e1' },
                            { label: 'Completed', value: statistics.completed, icon: CheckCircle, color: THEME.success, lightColor: '#e8f5e9' },
                            { label: 'Cancelled', value: statistics.cancelled, icon: XCircle, color: THEME.danger, lightColor: '#ffebee' },
                        ].map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '18px',
                                        padding: '1.75rem',
                                        border: `2.5px solid ${stat.lightColor}`,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = stat.color;
                                        e.currentTarget.style.boxShadow = `0 20px 48px ${stat.color}20, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                        e.currentTarget.style.transform = 'translateY(-6px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = stat.lightColor;
                                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: stat.lightColor, borderRadius: '50%', opacity: 0.3, transform: 'translate(30%, -30%)' }} />
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                            <p style={{ fontSize: '2.25rem', fontWeight: 800, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '16px', backgroundColor: stat.lightColor, transition: 'all 0.3s ease' }}>
                                                <Icon size={36} color={stat.color} strokeWidth={1.5} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 12px 28px ${THEME.primary}18, 0 2px 8px rgba(0, 0, 0, 0.03)`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e9ecef'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)'; }}
                        >
                            <Search size={20} color={THEME.primary} strokeWidth={2} />
                            <input
                                type="text"
                                placeholder="Search by user name or username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.98rem', color: '#0a0e27', background: 'transparent', fontFamily: 'inherit' }}
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            style={{
                                paddingLeft: '1.85rem', paddingRight: '1.85rem', paddingTop: '0.8rem', paddingBottom: '0.8rem',
                                background: `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`, color: '#FFFFFF', border: 'none', borderRadius: '14px',
                                fontWeight: 700, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', fontSize: '0.96rem', letterSpacing: '0.3px',
                                boxShadow: '0 4px 12px rgba(13, 110, 253, 0.25)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 16px 32px ${THEME.primary}40`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            Search
                        </button>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                paddingLeft: '1.4rem', paddingRight: '1.4rem', paddingTop: '0.8rem', paddingBottom: '0.8rem',
                                background: showFilters ? `linear-gradient(135deg, ${THEME.primary}10, #0a58ca08)` : '#FFFFFF',
                                color: showFilters ? THEME.primary : '#6c757d',
                                border: `2.5px solid ${showFilters ? THEME.primary : '#e9ecef'}`, borderRadius: '14px', fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', fontSize: '0.96rem',
                                display: 'flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '0.3px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                            }}
                            onMouseEnter={(e) => { if (!showFilters) { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.color = THEME.primary; e.currentTarget.style.background = `${THEME.primary}08`; e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.primary}20`; } }}
                            onMouseLeave={(e) => { if (!showFilters) { e.currentTarget.style.borderColor = '#e9ecef'; e.currentTarget.style.color = '#6c757d'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)'; } }}
                        >
                            <Filter size={18} strokeWidth={2.5} />
                            Filters
                            <ChevronDown size={16} style={{ transform: showFilters ? 'rotate(180deg)' : '', transition: 'transform 0.4s ease' }} />
                        </button>
                    </div>

                    {showFilters && (
                        <div
                            style={{
                                background: '#FFFFFF', border: '2px solid #E5E7EB', borderRadius: '16px', padding: '2rem',
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)', animation: 'fadeIn 0.3s ease-out',
                            }}
                        >
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stage</label>
                                <select
                                    value={filterStage}
                                    onChange={(e) => setFilterStage(e.target.value)}
                                    style={{ width: '100%', paddingLeft: '1rem', paddingRight: '0.75rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.96rem', color: '#0a0e27', cursor: 'pointer', transition: 'all 0.3s ease', backgroundColor: '#FFFFFF', fontWeight: 600 }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <option value="">All Stages</option>
                                    <option value="reengagement">Reengagement</option>
                                    <option value="family_check">Family Check</option>
                                    <option value="final_review">Final Review</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{ width: '100%', paddingLeft: '1rem', paddingRight: '0.75rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.96rem', color: '#0a0e27', cursor: 'pointer', transition: 'all 0.3s ease', backgroundColor: '#FFFFFF', fontWeight: 600 }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {(searchQuery || filterStage || filterStatus) && (
                        <button
                            onClick={handleReset}
                            style={{ marginTop: '1.25rem', fontSize: '0.92rem', color: THEME.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, transition: 'all 0.3s ease', padding: '0.5rem 1rem', borderRadius: '8px', letterSpacing: '0.3px' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#0a58ca'; e.currentTarget.style.background = `${THEME.primary}08`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = THEME.primary; e.currentTarget.style.background = 'none'; }}
                        >
                            Reset all filters
                        </button>
                    )}
                </div>

                {/* Table */}
                <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '2px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    {verifications.data.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        {['User', 'Stage', 'Status', 'Created', 'Actions'].map((header) => (
                                            <th key={header} style={{ padding: '1.25rem', textAlign: header === 'Actions' ? 'center' : 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {verifications.data.map((v) => (
                                        <tr
                                            key={v.id}
                                            style={{ borderBottom: '1.5px solid #E5E7EB', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: '#FFFFFF' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(13, 110, 253, 0.05)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                    <UserAvatar imageUrl={v.user.profile_image_url} name={v.user.name} />
                                                    <div>
                                                        <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>{v.user.name}</p>
                                                        <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>@{v.user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>{getStageBadge(v.stage)}</td>
                                            <td style={{ padding: '1.2rem 1rem' }}>{getStatusBadge(v.status)}</td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>{v.created_at_formatted}</td>
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => router.get(route('admin.memorial.verifications.show', v.uuid))}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                            paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.6rem', paddingBottom: '0.6rem',
                                                            background: '#e7f1ff', color: THEME.primary, border: '2.5px solid #cfe2ff', borderRadius: '10px',
                                                            fontSize: '0.87rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            letterSpacing: '0.3px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = THEME.primary; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.primary}35`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#e7f1ff'; e.currentTarget.style.color = THEME.primary; e.currentTarget.style.borderColor = '#cfe2ff'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                    >
                                                        <Eye size={15} />
                                                        View
                                                    </button>
                                                    {v.status !== 'cancelled' && v.status !== 'completed' && (
                                                        <button
                                                            onClick={() => router.post(route('admin.memorial.verifications.cancel', v.uuid), {}, { preserveScroll: true })}
                                                            style={{
                                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                                paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.6rem', paddingBottom: '0.6rem',
                                                                background: '#ffebee', color: THEME.danger, border: `2.5px solid #f5c6cb`, borderRadius: '10px',
                                                                fontSize: '0.87rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                letterSpacing: '0.3px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                            }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = THEME.danger; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.danger; e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.danger}35`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffebee'; e.currentTarget.style.color = THEME.danger; e.currentTarget.style.borderColor = '#f5c6cb'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                        >
                                                            <XCircle size={15} />
                                                            Cancel
                                                        </button>
                                                    )}
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
                                <ShieldCheck size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>No verifications found</p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {verifications.last_page > 1 && (
                    <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '1.75rem 2rem', borderRadius: '16px', border: '2px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }}>
                        <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#4B5563', margin: 0 }}>
                            Showing <span style={{ fontWeight: 800, color: '#0a0e27' }}>{verifications.from}</span> to{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{verifications.to}</span> of{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{verifications.total}</span> results
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {verifications.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => { if (link.url) { const url = new URL(link.url, window.location.origin); handlePageChange(parseInt(url.searchParams.get('page') || '1')); } }}
                                    disabled={!link.url}
                                    style={{
                                        paddingLeft: '0.85rem', paddingRight: '0.85rem', paddingTop: '0.6rem', paddingBottom: '0.6rem', borderRadius: '10px', fontSize: '0.92rem', fontWeight: 700,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', border: `2.5px solid ${link.active ? THEME.primary : '#e9ecef'}`,
                                        cursor: link.url ? 'pointer' : 'not-allowed', background: link.active ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)` : link.url ? '#f8f9fa' : '#f9fafb',
                                        color: link.active ? '#FFFFFF' : link.url ? '#0a0e27' : '#adb5bd', boxShadow: link.active ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                        minWidth: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => { if (link.url && !link.active) { e.currentTarget.style.background = '#e9ecef'; e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                                    onMouseLeave={(e) => { if (link.url && !link.active) { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#e9ecef'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
