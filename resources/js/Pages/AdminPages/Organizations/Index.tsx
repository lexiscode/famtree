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
                className="ap-avatar"
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div className="ap-avatar ap-avatar-indigo">
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
            <div>
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="ap-flash ap-flash-success">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="ap-flash ap-flash-error">{flash.error}</div>
                )}

                {/* Page Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Organizations</h1>
                    <p className="ap-page-subtitle">Manage and monitor all registered organizations across the platform</p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Organizations', value: statistics.total, color: 'indigo' },
                        { label: 'Active', value: statistics.active, color: 'green' },
                        { label: 'Inactive', value: statistics.inactive, color: 'red' },
                    ].map((stat, idx) => (
                        <div key={idx} className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <span className="ap-stat-label">{stat.label}</span>
                                <span className={`ap-stat-icon ${stat.color}`}>
                                    <Building2 size={20} />
                                </span>
                            </div>
                            <span className="ap-stat-value">{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* Search and Filters Section */}
                <div className="ap-filter-bar">
                    <div className="ap-search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search organizations by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`ap-btn ${showFilters ? 'ap-btn-primary' : 'ap-btn-secondary'} ap-btn-sm`}
                    >
                        <Filter size={18} />
                        Filters
                    </button>

                    <button
                        onClick={() => router.get(route('admin.organizations.create'))}
                        className="ap-btn ap-btn-success ap-btn-sm"
                    >
                        <Plus size={18} />
                        Create Organization
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="ap-filter-panel">
                        <div className="ap-form-group">
                            <label className="ap-filter-label">Category</label>
                            <select
                                value={filterCategoryId}
                                onChange={(e) => setFilterCategoryId(e.target.value)}
                                className="ap-filter-select"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="ap-form-group">
                            <label className="ap-filter-label">Status</label>
                            <select
                                value={filterIsActive}
                                onChange={(e) => setFilterIsActive(e.target.value)}
                                className="ap-filter-select"
                            >
                                <option value="">All Statuses</option>
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>

                        <div className="ap-flex ap-items-end">
                            <button onClick={handleReset} className="ap-reset-btn">
                                <RefreshCw size={16} />
                                Reset
                            </button>
                        </div>
                    </div>
                )}

                {(searchQuery || filterCategoryId || filterIsActive !== '') && (
                    <button onClick={handleReset} className="ap-btn ap-btn-ghost ap-btn-sm ap-mb-lg">
                        <X size={14} />
                        Reset all filters
                    </button>
                )}

                {/* Organizations Table */}
                <div className="ap-table-wrap">
                    {organizations.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Organization</th>
                                        <th>Category</th>
                                        <th>Location</th>
                                        <th className="center">Staff</th>
                                        <th className="center">Followers</th>
                                        <th className="center">Posts</th>
                                        <th className="center">Status</th>
                                        <th className="center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizations.data.map((org) => (
                                        <tr key={org.id}>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <OrgAvatar logoUrl={org.logo_url} name={org.name} />
                                                    <div>
                                                        <span className="ap-user-cell-name">{org.name}</span>
                                                        <span className="ap-user-cell-sub">{org.short_name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="ap-badge ap-badge-primary">{org.category_name}</span>
                                            </td>
                                            <td>
                                                <div className="ap-flex ap-items-center ap-gap-sm">
                                                    <MapPin size={14} />
                                                    <span className="ap-text-secondary">{org.city}{org.state ? `, ${org.state}` : ''}</span>
                                                </div>
                                            </td>
                                            <td className="center">
                                                <div className="ap-flex ap-items-center ap-gap-sm ap-justify-center">
                                                    <Users size={14} />
                                                    {org.org_accounts_count}
                                                </div>
                                            </td>
                                            <td className="center">
                                                <div className="ap-flex ap-items-center ap-gap-sm ap-justify-center">
                                                    <Heart size={14} />
                                                    {org.followers_count}
                                                </div>
                                            </td>
                                            <td className="center">
                                                <div className="ap-flex ap-items-center ap-gap-sm ap-justify-center">
                                                    <FileText size={14} />
                                                    {org.org_posts_count}
                                                </div>
                                            </td>
                                            <td className="center">
                                                <span className={org.is_active ? 'ap-badge ap-badge-success' : 'ap-badge ap-badge-danger'}>
                                                    {org.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="center">
                                                <button
                                                    onClick={() => router.get(route('admin.organizations.show', org.uuid))}
                                                    className="ap-btn ap-btn-primary ap-btn-sm"
                                                >
                                                    View
                                                    <ChevronRight size={17} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Building2 size={40} />
                            </div>
                            <p className="ap-empty-title">No organizations found</p>
                            <p className="ap-empty-text">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {organizations.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{organizations.from}</strong> to{' '}
                            <strong>{organizations.to}</strong> of{' '}
                            <strong>{organizations.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            <button
                                onClick={() => handlePageChange(organizations.current_page - 1)}
                                disabled={organizations.current_page === 1}
                                className="ap-page-btn"
                            >
                                <ChevronLeft size={16} />
                                Prev
                            </button>

                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`ap-page-btn ${page === organizations.current_page ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(organizations.current_page + 1)}
                                disabled={organizations.current_page === organizations.last_page}
                                className="ap-page-btn"
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
