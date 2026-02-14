import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Building2,
    Search,
    Filter,
    Plus,
    MapPin,
    Users,
    FileText,
    Heart,
    ChevronLeft,
    ChevronRight,
    X,
    RefreshCw,
} from 'lucide-react';

interface Organization {
    id: number;
    uuid: string;
    name: string;
    short_name: string;
    slug: string;
    logo_url: string | null;
    city: string;
    state: string;
    country: string;
    is_active: boolean;
    category_name: string;
    org_accounts_count: number;
    followers_count: number;
    org_posts_count: number;
    faculties_count: number;
    created_at: string;
    created_at_formatted: string;
}

interface PaginatedData {
    data: Organization[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total: number;
    active: number;
    inactive: number;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    organizations: PaginatedData;
    statistics: Statistics;
    categories: Category[];
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

interface OrgAvatarProps {
    logoUrl: string | null;
    name: string;
}

function OrgAvatar({ logoUrl, name }: OrgAvatarProps) {
    const [imageError, setImageError] = useState(false);

    if (logoUrl && !imageError) {
        return (
            <img
                src={logoUrl}
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

export default function Index({ organizations, statistics, categories, filters, search, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterCategoryId, setFilterCategoryId] = useState(filters.category_id ? String(filters.category_id) : '');
    const [filterIsActive, setFilterIsActive] = useState(filters.is_active !== undefined ? String(filters.is_active) : '');
    const isInitialMount = useRef(true);

    const buildFilterObj = useCallback(() => {
        const filterObj: Record<string, any> = {};
        if (filterCategoryId) {
            filterObj.category_id = filterCategoryId;
        }
        if (filterIsActive !== '') {
            filterObj.is_active = filterIsActive;
        }
        return filterObj;
    }, [filterCategoryId, filterIsActive]);

    const handleSearch = useCallback(() => {
        router.get(
            route('admin.organizations.index'),
            {
                search: searchQuery,
                filters: buildFilterObj(),
                per_page: perPage,
            },
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
                route('admin.organizations.index'),
                {
                    search: searchQuery,
                    filters: buildFilterObj(),
                    per_page: perPage,
                },
                { preserveScroll: true }
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, filterCategoryId, filterIsActive]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setFilterCategoryId('');
        setFilterIsActive('');
        router.get(route('admin.organizations.index'), { search: '', filters: {}, per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = (page: number) => {
        router.get(
            route('admin.organizations.index'),
            {
                page,
                search: searchQuery,
                filters: buildFilterObj(),
                per_page: perPage,
            },
            { preserveScroll: true }
        );
    };

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = organizations.current_page;
        const last = organizations.last_page;

        let start = Math.max(1, current - 2);
        let end = Math.min(last, current + 2);

        if (current <= 3) {
            end = Math.min(last, 5);
        }
        if (current >= last - 2) {
            start = Math.max(1, last - 4);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Flash Messages */}
                {flash?.success && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            background: '#e8f5e9',
                            border: `2px solid ${THEME.success}`,
                            color: THEME.success,
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            background: '#ffebee',
                            border: `2px solid ${THEME.danger}`,
                            color: THEME.danger,
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        <span>{flash.error}</span>
                    </div>
                )}

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
                            <Building2 size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Organizations
                            </h1>
                        </div>
                        <p
                            style={{
                                fontSize: '1.05rem',
                                color: 'rgba(255, 255, 255, 0.95)',
                                margin: 0,
                                maxWidth: '600px',
                                lineHeight: 1.6,
                                fontWeight: 500,
                            }}
                        >
                            Manage and monitor all registered organizations across the platform
                        </p>
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
                            { label: 'Total Organizations', value: statistics.total, color: THEME.primary, lightColor: '#e7f1ff' },
                            { label: 'Active', value: statistics.active, color: THEME.success, lightColor: '#e8f5e9' },
                            { label: 'Inactive', value: statistics.inactive, color: THEME.danger, lightColor: '#ffebee' },
                        ].map((stat, idx) => (
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
                                            <Building2 size={36} color={stat.color} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search and Filters Section */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Search Input */}
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
                                placeholder="Search organizations by name..."
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

                        {/* Filter Toggle Button */}
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
                        </button>

                        {/* Create Organization Button */}
                        <button
                            onClick={() => router.get(route('admin.organizations.create'))}
                            style={{
                                paddingLeft: '1.85rem',
                                paddingRight: '1.85rem',
                                paddingTop: '0.8rem',
                                paddingBottom: '0.8rem',
                                background: `linear-gradient(135deg, ${THEME.success} 0%, #157347 100%)`,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: '0.96rem',
                                letterSpacing: '0.3px',
                                boxShadow: '0 4px 12px rgba(25, 135, 84, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 16px 32px rgba(25, 135, 84, 0.40)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 135, 84, 0.25)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Plus size={18} strokeWidth={2.5} />
                            Create Organization
                        </button>
                    </div>

                    {/* Filter Panel */}
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
                                    Category
                                </label>
                                <select
                                    value={filterCategoryId}
                                    onChange={(e) => setFilterCategoryId(e.target.value)}
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
                                    <option value="" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={String(category.id)} style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Status
                                </label>
                                <select
                                    value={filterIsActive}
                                    onChange={(e) => setFilterIsActive(e.target.value)}
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
                                    <option value="1" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Active</option>
                                    <option value="0" style={{ backgroundColor: '#FFFFFF', color: '#0a0e27' }}>Inactive</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button
                                    onClick={handleReset}
                                    style={{
                                        paddingLeft: '1.4rem',
                                        paddingRight: '1.4rem',
                                        paddingTop: '0.75rem',
                                        paddingBottom: '0.75rem',
                                        background: '#FFFFFF',
                                        color: THEME.secondary,
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '10px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        fontSize: '0.96rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = THEME.danger;
                                        e.currentTarget.style.color = THEME.danger;
                                        e.currentTarget.style.background = '#ffebee';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                        e.currentTarget.style.color = THEME.secondary;
                                        e.currentTarget.style.background = '#FFFFFF';
                                    }}
                                >
                                    <RefreshCw size={16} />
                                    Reset
                                </button>
                            </div>
                        </div>
                    )}

                    {(searchQuery || filterCategoryId || filterIsActive !== '') && (
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
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
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
                            <X size={14} />
                            Reset all filters
                        </button>
                    )}
                </div>

                {/* Organizations Table */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    {organizations.data.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Organization
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Category
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Location
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Staff
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Followers
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Posts
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Status
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizations.data.map((org) => (
                                        <tr
                                            key={org.id}
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
                                            {/* Organization Name + Logo */}
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                    <OrgAvatar logoUrl={org.logo_url} name={org.name} />
                                                    <div>
                                                        <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                                            {org.name}
                                                        </p>
                                                        <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>
                                                            {org.short_name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category Badge */}
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        paddingLeft: '0.75rem',
                                                        paddingRight: '0.75rem',
                                                        paddingTop: '0.45rem',
                                                        paddingBottom: '0.45rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 700,
                                                        backgroundColor: '#f0f7ff',
                                                        color: THEME.primary,
                                                        border: '1.5px solid #cfe2ff',
                                                    }}
                                                >
                                                    {org.category_name}
                                                </span>
                                            </td>

                                            {/* Location */}
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <MapPin size={14} color={THEME.secondary} />
                                                    <span style={{ fontSize: '0.92rem', color: '#4B5563', fontWeight: 500 }}>
                                                        {org.city}{org.state ? `, ${org.state}` : ''}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Staff Count */}
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                                    <Users size={14} color={THEME.primary} />
                                                    <span style={{ fontSize: '0.92rem', color: '#4B5563', fontWeight: 600 }}>
                                                        {org.org_accounts_count}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Followers Count */}
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                                    <Heart size={14} color={THEME.danger} />
                                                    <span style={{ fontSize: '0.92rem', color: '#4B5563', fontWeight: 600 }}>
                                                        {org.followers_count}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Posts Count */}
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                                    <FileText size={14} color={THEME.warning} />
                                                    <span style={{ fontSize: '0.92rem', color: '#4B5563', fontWeight: 600 }}>
                                                        {org.org_posts_count}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
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
                                                        border: `1.5px solid ${org.is_active ? THEME.success : THEME.danger}`,
                                                        backgroundColor: org.is_active ? '#e8f5e9' : '#ffebee',
                                                        color: org.is_active ? THEME.success : THEME.danger,
                                                    }}
                                                >
                                                    <span style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        backgroundColor: org.is_active ? THEME.success : THEME.danger,
                                                    }} />
                                                    {org.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            {/* View Button */}
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => router.get(route('admin.organizations.show', org.uuid))}
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
                                                    View
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
                                <Building2 size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No organizations found
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {organizations.last_page > 1 && (
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
                            Showing <span style={{ fontWeight: 800, color: '#0a0e27' }}>{organizations.from}</span> to{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{organizations.to}</span> of{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{organizations.total}</span> results
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(organizations.current_page - 1)}
                                disabled={organizations.current_page === 1}
                                style={{
                                    paddingLeft: '0.85rem',
                                    paddingRight: '0.85rem',
                                    paddingTop: '0.6rem',
                                    paddingBottom: '0.6rem',
                                    borderRadius: '10px',
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2.5px solid #e9ecef',
                                    cursor: organizations.current_page === 1 ? 'not-allowed' : 'pointer',
                                    background: organizations.current_page === 1 ? '#f9fafb' : '#f8f9fa',
                                    color: organizations.current_page === 1 ? '#adb5bd' : '#0a0e27',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (organizations.current_page !== 1) {
                                        e.currentTarget.style.background = '#e9ecef';
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (organizations.current_page !== 1) {
                                        e.currentTarget.style.background = '#f8f9fa';
                                        e.currentTarget.style.borderColor = '#e9ecef';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
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
                                        paddingLeft: '0.85rem',
                                        paddingRight: '0.85rem',
                                        paddingTop: '0.6rem',
                                        paddingBottom: '0.6rem',
                                        borderRadius: '10px',
                                        fontSize: '0.92rem',
                                        fontWeight: 700,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: `2.5px solid ${page === organizations.current_page ? THEME.primary : '#e9ecef'}`,
                                        cursor: 'pointer',
                                        background: page === organizations.current_page ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)` : '#f8f9fa',
                                        color: page === organizations.current_page ? '#FFFFFF' : '#0a0e27',
                                        boxShadow: page === organizations.current_page ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                        minWidth: '44px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (page !== organizations.current_page) {
                                            e.currentTarget.style.background = '#e9ecef';
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (page !== organizations.current_page) {
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

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(organizations.current_page + 1)}
                                disabled={organizations.current_page === organizations.last_page}
                                style={{
                                    paddingLeft: '0.85rem',
                                    paddingRight: '0.85rem',
                                    paddingTop: '0.6rem',
                                    paddingBottom: '0.6rem',
                                    borderRadius: '10px',
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2.5px solid #e9ecef',
                                    cursor: organizations.current_page === organizations.last_page ? 'not-allowed' : 'pointer',
                                    background: organizations.current_page === organizations.last_page ? '#f9fafb' : '#f8f9fa',
                                    color: organizations.current_page === organizations.last_page ? '#adb5bd' : '#0a0e27',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (organizations.current_page !== organizations.last_page) {
                                        e.currentTarget.style.background = '#e9ecef';
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (organizations.current_page !== organizations.last_page) {
                                        e.currentTarget.style.background = '#f8f9fa';
                                        e.currentTarget.style.borderColor = '#e9ecef';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
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
