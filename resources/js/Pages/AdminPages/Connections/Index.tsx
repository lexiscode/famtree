import { useState, useCallback, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Link,
    Search,
    Filter,
    ChevronDown,
    Users,
    CheckCircle,
    Clock,
    AlertTriangle,
    Heart,
    Zap,
} from 'lucide-react';

interface Connection {
    id: number;
    user_one: { id: number; full_name: string; username: string };
    user_two: { id: number; full_name: string; username: string };
    relationship_type: string;
    status: string;
    is_divorced: boolean;
    connected_at: string;
    connected_at_formatted: string;
}

interface PaginatedData {
    data: Connection[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total: number;
    accepted: number;
    pending: number;
    divorced: number;
}

interface Props {
    connections: PaginatedData;
    statistics: Statistics;
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

const statusConfig: Record<string, { bg: string; border: string; text: string; label: string; icon: any }> = {
    accepted: { bg: '#e8f5e9', border: '#b7eb8f', text: '#198754', label: 'Accepted', icon: CheckCircle },
    pending: { bg: '#fff8e1', border: '#ffe58f', text: '#d48806', label: 'Pending', icon: Clock },
    rejected: { bg: '#ffebee', border: '#ffcdd2', text: '#dc3545', label: 'Rejected', icon: AlertTriangle },
};

export default function Index({ connections, statistics, filters, search, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [searchQuery, setSearchQuery] = useState(search);
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState(filters.status || '');
    const [filterRelationship, setFilterRelationship] = useState(filters.relationship_type || '');
    const isInitialMount = useRef(true);

    const handleSearch = useCallback(() => {
        const filterObj: Record<string, any> = {};
        if (filterStatus) {
            filterObj.status = filterStatus;
        }
        if (filterRelationship) {
            filterObj.relationship_type = filterRelationship;
        }

        router.get(
            route('admin.connections.index'),
            {
                search: searchQuery,
                filters: filterObj,
                per_page: perPage,
            },
            { preserveScroll: true }
        );
    }, [searchQuery, filterStatus, filterRelationship, perPage]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timer = setTimeout(() => {
            const filterObj: Record<string, any> = {};
            if (filterStatus) {
                filterObj.status = filterStatus;
            }
            if (filterRelationship) {
                filterObj.relationship_type = filterRelationship;
            }

            router.get(
                route('admin.connections.index'),
                {
                    search: searchQuery,
                    filters: filterObj,
                    per_page: perPage,
                },
                { preserveScroll: true }
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [filterStatus, filterRelationship]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setFilterStatus('');
        setFilterRelationship('');
        router.get(route('admin.connections.index'), { search: '', filters: {}, per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = (page: number) => {
        const pageFilters: Record<string, any> = {};
        if (filterStatus) {
            pageFilters.status = filterStatus;
        }
        if (filterRelationship) {
            pageFilters.relationship_type = filterRelationship;
        }

        router.get(
            route('admin.connections.index'),
            {
                page,
                search: searchQuery,
                filters: pageFilters,
                per_page: perPage,
            },
            { preserveScroll: true }
        );
    };

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status] || { bg: '#f3f4f6', border: '#e5e7eb', text: '#6c757d', label: status, icon: Clock };
        const Icon = config.icon;
        return (
            <div
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    paddingLeft: '0.75rem',
                    paddingRight: '0.75rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: `1.5px solid ${config.border}`,
                    backgroundColor: config.bg,
                    color: config.text,
                }}
            >
                <Icon size={14} />
                <span style={{ textTransform: 'capitalize' }}>{config.label}</span>
            </div>
        );
    };

    const getRelationshipBadge = (type: string) => {
        const colorMap: Record<string, { bg: string; text: string; border: string }> = {
            spouse: { bg: '#fce4ec', text: '#c62828', border: '#f8bbd0' },
            wife: { bg: '#fce4ec', text: '#c62828', border: '#f8bbd0' },
            husband: { bg: '#fce4ec', text: '#c62828', border: '#f8bbd0' },
            partner: { bg: '#fce4ec', text: '#c62828', border: '#f8bbd0' },
            parent: { bg: '#e7f1ff', text: '#0d6efd', border: '#cfe2ff' },
            father: { bg: '#e7f1ff', text: '#0d6efd', border: '#cfe2ff' },
            mother: { bg: '#e7f1ff', text: '#0d6efd', border: '#cfe2ff' },
            child: { bg: '#e0f7fa', text: '#00838f', border: '#b2ebf2' },
            son: { bg: '#e0f7fa', text: '#00838f', border: '#b2ebf2' },
            daughter: { bg: '#e0f7fa', text: '#00838f', border: '#b2ebf2' },
            sibling: { bg: '#f3e5f5', text: '#7b1fa2', border: '#e1bee7' },
            brother: { bg: '#f3e5f5', text: '#7b1fa2', border: '#e1bee7' },
            sister: { bg: '#f3e5f5', text: '#7b1fa2', border: '#e1bee7' },
        };

        const colors = colorMap[type.toLowerCase()] || { bg: '#f3f4f6', text: '#6c757d', border: '#e5e7eb' };

        return (
            <span
                style={{
                    display: 'inline-block',
                    paddingLeft: '0.75rem',
                    paddingRight: '0.75rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: colors.bg,
                    color: colors.text,
                    border: `1.5px solid ${colors.border}`,
                    textTransform: 'capitalize',
                }}
            >
                {type.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Premium Header Section with Gradient Background */}
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
                    {/* Background decoration */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-40px',
                            right: '-40px',
                            width: '200px',
                            height: '200px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '50%',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-60px',
                            left: '-60px',
                            width: '300px',
                            height: '300px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '50%',
                        }}
                    />

                    {/* Header Content */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <Link size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Connections
                            </h1>
                        </div>
                        <p
                            style={{
                                fontSize: '1.05rem',
                                color: 'rgba(255, 255, 255, 0.95)',
                                marginTop: '0.75rem',
                                margin: 0,
                                maxWidth: '600px',
                                lineHeight: 1.6,
                                fontWeight: 500,
                            }}
                        >
                            Monitor and manage all user connections and relationships across the platform
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Real-time connection statistics and management
                            </span>
                        </div>
                    </div>
                </div>

                {/* Premium Stats Grid */}
                <div style={{ marginBottom: '3rem' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '1.75rem',
                        }}
                    >
                        {[
                            { label: 'Total', value: statistics.total, icon: Link, color: THEME.primary, lightColor: '#e7f1ff' },
                            { label: 'Accepted', value: statistics.accepted, icon: CheckCircle, color: THEME.success, lightColor: '#e8f5e9' },
                            { label: 'Pending', value: statistics.pending, icon: Clock, color: THEME.warning, lightColor: '#fff8e1' },
                            { label: 'Divorced', value: statistics.divorced, icon: Heart, color: THEME.danger, lightColor: '#ffebee' },
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
                                    {/* Background accent */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '100px',
                                            height: '100px',
                                            background: stat.lightColor,
                                            borderRadius: '50%',
                                            opacity: 0.3,
                                            transform: 'translate(30%, -30%)',
                                        }}
                                    />

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {stat.label}
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                            <p
                                                style={{
                                                    fontSize: '2.25rem',
                                                    fontWeight: 800,
                                                    color: stat.color,
                                                    margin: 0,
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {stat.value}
                                            </p>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '72px',
                                                    height: '72px',
                                                    borderRadius: '16px',
                                                    backgroundColor: stat.lightColor,
                                                    transition: 'all 0.3s ease',
                                                }}
                                            >
                                                <Icon size={36} color={stat.color} strokeWidth={1.5} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Premium Search and Filters Section */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Premium Search Input */}
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
                                placeholder="Search by user name or username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '0.98rem',
                                    color: '#0a0e27',
                                    background: 'transparent',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            style={{
                                paddingLeft: '1.85rem',
                                paddingRight: '1.85rem',
                                paddingTop: '0.8rem',
                                paddingBottom: '0.8rem',
                                background: `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: '0.96rem',
                                letterSpacing: '0.3px',
                                boxShadow: '0 4px 12px rgba(13, 110, 253, 0.25)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = `0 16px 32px ${THEME.primary}40`;
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.25)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Search
                        </button>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                paddingLeft: '1.4rem',
                                paddingRight: '1.4rem',
                                paddingTop: '0.8rem',
                                paddingBottom: '0.8rem',
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

                    {/* Filter Options */}
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
                                animation: 'fadeIn 0.3s ease-out',
                            }}
                        >
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Status
                                </label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{
                                        width: '100%',
                                        paddingLeft: '1rem',
                                        paddingRight: '0.75rem',
                                        paddingTop: '0.75rem',
                                        paddingBottom: '0.75rem',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '10px',
                                        fontSize: '0.96rem',
                                        color: '#0a0e27',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: '#FFFFFF',
                                        fontWeight: 600,
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`;
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <option value="" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>All Statuses</option>
                                    <option value="accepted" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Accepted</option>
                                    <option value="pending" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Pending</option>
                                    <option value="rejected" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Rejected</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Relationship Type
                                </label>
                                <select
                                    value={filterRelationship}
                                    onChange={(e) => setFilterRelationship(e.target.value)}
                                    style={{
                                        width: '100%',
                                        paddingLeft: '1rem',
                                        paddingRight: '0.75rem',
                                        paddingTop: '0.75rem',
                                        paddingBottom: '0.75rem',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '10px',
                                        fontSize: '0.96rem',
                                        color: '#0a0e27',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: '#FFFFFF',
                                        fontWeight: 600,
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`;
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <option value="" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>All Types</option>
                                    <option value="spouse" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Spouse</option>
                                    <option value="parent" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Parent</option>
                                    <option value="child" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Child</option>
                                    <option value="sibling" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Sibling</option>
                                    <option value="father" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Father</option>
                                    <option value="mother" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Mother</option>
                                    <option value="son" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Son</option>
                                    <option value="daughter" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Daughter</option>
                                    <option value="brother" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Brother</option>
                                    <option value="sister" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Sister</option>
                                    <option value="husband" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Husband</option>
                                    <option value="wife" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Wife</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {(searchQuery || filterStatus || filterRelationship) && (
                        <button
                            onClick={handleReset}
                            style={{
                                marginTop: '1.25rem',
                                fontSize: '0.92rem',
                                color: THEME.primary,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 700,
                                transition: 'all 0.3s ease',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                letterSpacing: '0.3px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#0a58ca';
                                e.currentTarget.style.background = `${THEME.primary}08`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = THEME.primary;
                                e.currentTarget.style.background = 'none';
                            }}
                        >
                            Reset all filters
                        </button>
                    )}
                </div>

                {/* Premium Connections Table */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    {connections.data.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            User 1
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            User 2
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Relationship
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Status
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Divorced
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {connections.data.map((connection) => (
                                        <tr
                                            key={connection.id}
                                            style={{
                                                borderBottom: '1.5px solid #E5E7EB',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                background: '#FFFFFF',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#F9FAFB';
                                                e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(13, 110, 253, 0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = '#FFFFFF';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                                        {connection.user_one.full_name}
                                                    </p>
                                                    <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>
                                                        @{connection.user_one.username}
                                                    </p>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                                        {connection.user_two.full_name}
                                                    </p>
                                                    <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>
                                                        @{connection.user_two.username}
                                                    </p>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                {getRelationshipBadge(connection.relationship_type)}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                {getStatusBadge(connection.status)}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        paddingLeft: '0.6rem',
                                                        paddingRight: '0.6rem',
                                                        paddingTop: '0.45rem',
                                                        paddingBottom: '0.45rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 700,
                                                        backgroundColor: connection.is_divorced ? '#ffebee' : '#f3f4f6',
                                                        color: connection.is_divorced ? THEME.danger : '#6c757d',
                                                        border: `1.5px solid ${connection.is_divorced ? '#ffcdd2' : '#e5e7eb'}`,
                                                    }}
                                                >
                                                    {connection.is_divorced ? (
                                                        <>
                                                            <AlertTriangle size={14} />
                                                            Yes
                                                        </>
                                                    ) : (
                                                        'No'
                                                    )}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {connection.connected_at_formatted}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: '#F3F4F6',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                }}
                            >
                                <Link size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No connections found
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    )}
                </div>

                {/* Premium Pagination */}
                {connections.last_page > 1 && (
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
                            Showing <span style={{ fontWeight: 800, color: '#0a0e27' }}>{connections.from}</span> to{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{connections.to}</span> of{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{connections.total}</span> results
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {Array.from({ length: connections.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    disabled={page === connections.current_page}
                                    style={{
                                        paddingLeft: '0.85rem',
                                        paddingRight: '0.85rem',
                                        paddingTop: '0.6rem',
                                        paddingBottom: '0.6rem',
                                        borderRadius: '10px',
                                        fontSize: '0.92rem',
                                        fontWeight: 700,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: `2.5px solid ${page === connections.current_page ? THEME.primary : '#e9ecef'}`,
                                        cursor: page === connections.current_page ? 'default' : 'pointer',
                                        background: page === connections.current_page ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)` : '#f8f9fa',
                                        color: page === connections.current_page ? '#FFFFFF' : '#0a0e27',
                                        boxShadow: page === connections.current_page ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                        minWidth: '44px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (page !== connections.current_page) {
                                            e.currentTarget.style.background = '#e9ecef';
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (page !== connections.current_page) {
                                            e.currentTarget.style.background = '#f8f9fa';
                                            e.currentTarget.style.borderColor = '#e9ecef';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
