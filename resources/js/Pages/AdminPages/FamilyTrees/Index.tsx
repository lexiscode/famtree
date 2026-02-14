import { useState, useCallback, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    GitBranch,
    Search,
    Filter,
    ChevronDown,
    ChevronRight,
    Eye,
    EyeOff,
    Users,
    Globe,
    Lock,
    GitMerge,
    Zap,
} from 'lucide-react';

interface FamilyTree {
    id: number;
    name: string;
    description: string | null;
    root_user: { id: number; full_name: string; username: string } | null;
    members_count: number;
    is_public: boolean;
    type: string;
    is_merged: boolean;
    created_at: string;
    created_at_formatted: string;
}

interface PaginatedData {
    data: FamilyTree[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total: number;
    public_trees: number;
    private_trees: number;
    merged: number;
}

interface Props {
    trees: PaginatedData;
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

export default function Index({ trees, statistics, filters, search, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [searchQuery, setSearchQuery] = useState(search);
    const [showFilters, setShowFilters] = useState(false);
    const [filterVisibility, setFilterVisibility] = useState(filters.visibility || '');
    const isInitialMount = useRef(true);

    const handleSearch = useCallback(() => {
        const filterObj: Record<string, any> = {};
        if (filterVisibility) {
            filterObj.visibility = filterVisibility;
        }

        router.get(
            route('admin.familyTrees.index'),
            {
                search: searchQuery,
                filters: filterObj,
                per_page: perPage,
            },
            { preserveScroll: true }
        );
    }, [searchQuery, filterVisibility, perPage]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timer = setTimeout(() => {
            const filterObj: Record<string, any> = {};
            if (filterVisibility) {
                filterObj.visibility = filterVisibility;
            }

            router.get(
                route('admin.familyTrees.index'),
                {
                    search: searchQuery,
                    filters: filterObj,
                    per_page: perPage,
                },
                { preserveScroll: true }
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [filterVisibility]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setFilterVisibility('');
        router.get(route('admin.familyTrees.index'), { search: '', filters: {}, per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = (page: number) => {
        const pageFilters: Record<string, any> = {};
        if (filterVisibility) {
            pageFilters.visibility = filterVisibility;
        }

        router.get(
            route('admin.familyTrees.index'),
            {
                page,
                search: searchQuery,
                filters: pageFilters,
                per_page: perPage,
            },
            { preserveScroll: true }
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
                            <GitBranch size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Family Trees
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
                            View and manage all family trees in the system with comprehensive filtering and insights
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Real-time family tree statistics and management
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
                            { label: 'Total Trees', value: statistics.total, icon: GitBranch, color: THEME.primary, lightColor: '#e7f1ff' },
                            { label: 'Public', value: statistics.public_trees, icon: Globe, color: THEME.success, lightColor: '#e8f5e9' },
                            { label: 'Private', value: statistics.private_trees, icon: Lock, color: THEME.warning, lightColor: '#fff8e1' },
                            { label: 'Merged', value: statistics.merged, icon: GitMerge, color: THEME.info, lightColor: '#e0f7fa' },
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
                                placeholder="Search by tree name or root user..."
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
                                    Visibility
                                </label>
                                <select
                                    value={filterVisibility}
                                    onChange={(e) => setFilterVisibility(e.target.value)}
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
                                    <option value="" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>All Trees</option>
                                    <option value="public" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Public</option>
                                    <option value="private" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Private</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {(searchQuery || filterVisibility) && (
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

                {/* Premium Family Trees Table */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    {trees.data.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Tree Name
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Root User
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Members
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Visibility
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Type
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Merged
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Date
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trees.data.map((tree) => (
                                        <tr
                                            key={tree.id}
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
                                                        {tree.name}
                                                    </p>
                                                    {tree.description && (
                                                        <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>
                                                            {tree.description.length > 50 ? tree.description.substring(0, 50) + '...' : tree.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                {tree.root_user ? (
                                                    <div>
                                                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a0e27', margin: 0 }}>
                                                            {tree.root_user.full_name}
                                                        </p>
                                                        <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>
                                                            @{tree.root_user.username}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.92rem', color: '#9CA3AF', fontStyle: 'italic' }}>No root user</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        paddingLeft: '0.6rem',
                                                        paddingRight: '0.6rem',
                                                        paddingTop: '0.45rem',
                                                        paddingBottom: '0.45rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 700,
                                                        backgroundColor: '#e7f1ff',
                                                        color: THEME.primary,
                                                        border: '1.5px solid #cfe2ff',
                                                    }}
                                                >
                                                    <Users size={14} />
                                                    {tree.members_count}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        paddingLeft: '0.75rem',
                                                        paddingRight: '0.75rem',
                                                        paddingTop: '0.5rem',
                                                        paddingBottom: '0.5rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600,
                                                        border: `1.5px solid ${tree.is_public ? '#b7eb8f' : '#ffe58f'}`,
                                                        backgroundColor: tree.is_public ? '#f6ffed' : '#fffbe6',
                                                        color: tree.is_public ? THEME.success : '#d48806',
                                                    }}
                                                >
                                                    {tree.is_public ? <Eye size={14} /> : <EyeOff size={14} />}
                                                    {tree.is_public ? 'Public' : 'Private'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#4B5563', fontWeight: 500, textTransform: 'capitalize' }}>
                                                {tree.type}
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
                                                        backgroundColor: tree.is_merged ? '#e0f7fa' : '#f3f4f6',
                                                        color: tree.is_merged ? THEME.info : '#6c757d',
                                                        border: `1.5px solid ${tree.is_merged ? '#b3e5fc' : '#e5e7eb'}`,
                                                    }}
                                                >
                                                    {tree.is_merged ? <GitMerge size={14} /> : null}
                                                    {tree.is_merged ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {tree.created_at_formatted}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => router.get(route('admin.familyTrees.show', tree.id))}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        paddingLeft: '1rem',
                                                        paddingRight: '1rem',
                                                        paddingTop: '0.6rem',
                                                        paddingBottom: '0.6rem',
                                                        background: '#e7f1ff',
                                                        color: THEME.primary,
                                                        border: '2.5px solid #cfe2ff',
                                                        borderRadius: '10px',
                                                        fontSize: '0.87rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        letterSpacing: '0.3px',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = THEME.primary;
                                                        e.currentTarget.style.color = '#FFFFFF';
                                                        e.currentTarget.style.borderColor = THEME.primary;
                                                        e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.primary}35`;
                                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#e7f1ff';
                                                        e.currentTarget.style.color = THEME.primary;
                                                        e.currentTarget.style.borderColor = '#cfe2ff';
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    View Details
                                                    <ChevronRight size={17} strokeWidth={2.5} />
                                                </button>
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
                                <GitBranch size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No family trees found
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    )}
                </div>

                {/* Premium Pagination */}
                {trees.last_page > 1 && (
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
                            Showing <span style={{ fontWeight: 800, color: '#0a0e27' }}>{trees.from}</span> to{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{trees.to}</span> of{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{trees.total}</span> results
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {Array.from({ length: trees.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    disabled={page === trees.current_page}
                                    style={{
                                        paddingLeft: '0.85rem',
                                        paddingRight: '0.85rem',
                                        paddingTop: '0.6rem',
                                        paddingBottom: '0.6rem',
                                        borderRadius: '10px',
                                        fontSize: '0.92rem',
                                        fontWeight: 700,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: `2.5px solid ${page === trees.current_page ? THEME.primary : '#e9ecef'}`,
                                        cursor: page === trees.current_page ? 'default' : 'pointer',
                                        background: page === trees.current_page ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)` : '#f8f9fa',
                                        color: page === trees.current_page ? '#FFFFFF' : '#0a0e27',
                                        boxShadow: page === trees.current_page ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                        minWidth: '44px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (page !== trees.current_page) {
                                            e.currentTarget.style.background = '#e9ecef';
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (page !== trees.current_page) {
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
