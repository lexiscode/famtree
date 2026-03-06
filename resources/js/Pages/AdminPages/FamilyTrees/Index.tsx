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
                { preserveScroll: true, preserveState: true }
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [filterVisibility, searchQuery]);

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
            <div>
                {/* Page Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Family Trees</h1>
                    <p className="ap-page-subtitle">
                        View and manage all family trees in the system with comprehensive filtering and insights
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Trees', value: statistics.total, icon: GitBranch, colorClass: 'indigo' },
                        { label: 'Public', value: statistics.public_trees, icon: Globe, colorClass: 'green' },
                        { label: 'Private', value: statistics.private_trees, icon: Lock, colorClass: 'amber' },
                        { label: 'Merged', value: statistics.merged, icon: GitMerge, colorClass: 'blue' },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="ap-stat-card">
                                <div className="ap-stat-card-header">
                                    <p className="ap-stat-label">{stat.label}</p>
                                    <div className={`ap-stat-icon ${stat.colorClass}`}>
                                        <Icon size={20} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <p className="ap-stat-value">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Search and Filters */}
                <div className="ap-filter-bar">
                    <div className="ap-search-bar">
                        <Search size={16} strokeWidth={2} />
                        <input
                            type="text"
                            placeholder="Search by tree name or root user..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        className={`ap-btn ${showFilters ? 'ap-btn-primary' : 'ap-btn-secondary'}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={16} strokeWidth={2} />
                        Filters
                        <ChevronDown size={14} className={showFilters ? 'ap-sidebar-chevron open' : 'ap-sidebar-chevron'} />
                    </button>
                </div>

                {showFilters && (
                    <div className="ap-filter-panel">
                        <div>
                            <label className="ap-filter-label">Visibility</label>
                            <select
                                className="ap-filter-select"
                                value={filterVisibility}
                                onChange={(e) => setFilterVisibility(e.target.value)}
                            >
                                <option value="">All Trees</option>
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                    </div>
                )}

                {(searchQuery || filterVisibility) && (
                    <button className="ap-reset-btn" onClick={handleReset}>
                        Reset all filters
                    </button>
                )}

                {/* Family Trees Table */}
                <div className="ap-table-wrap">
                    {trees.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Tree Name</th>
                                        <th>Root User</th>
                                        <th>Members</th>
                                        <th>Visibility</th>
                                        <th>Type</th>
                                        <th>Merged</th>
                                        <th>Date</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trees.data.map((tree) => (
                                        <tr key={tree.id}>
                                            <td>
                                                <div className="ap-user-cell-name">{tree.name}</div>
                                                {tree.description && (
                                                    <div className="ap-user-cell-sub">
                                                        {tree.description.length > 50 ? tree.description.substring(0, 50) + '...' : tree.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {tree.root_user ? (
                                                    <div>
                                                        <div className="ap-user-cell-name">{tree.root_user.full_name}</div>
                                                        <div className="ap-user-cell-sub">@{tree.root_user.username}</div>
                                                    </div>
                                                ) : (
                                                    <span className="ap-text-secondary">No root user</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="ap-badge ap-badge-primary">
                                                    <Users size={12} />
                                                    {tree.members_count}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`ap-badge ${tree.is_public ? 'ap-badge-success' : 'ap-badge-warning'}`}>
                                                    {tree.is_public ? <Eye size={12} /> : <EyeOff size={12} />}
                                                    {tree.is_public ? 'Public' : 'Private'}
                                                </span>
                                            </td>
                                            <td className="secondary ap-capitalize">{tree.type}</td>
                                            <td>
                                                <span className={`ap-badge ${tree.is_merged ? 'ap-badge-info' : 'ap-badge-neutral'}`}>
                                                    {tree.is_merged ? <GitMerge size={12} /> : null}
                                                    {tree.is_merged ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="secondary">{tree.created_at_formatted}</td>
                                            <td className="center">
                                                <button
                                                    className="ap-btn ap-btn-primary ap-btn-sm"
                                                    onClick={() => router.get(route('admin.familyTrees.show', tree.id))}
                                                >
                                                    View Details
                                                    <ChevronRight size={14} strokeWidth={2} />
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
                                <GitBranch size={28} strokeWidth={1.5} />
                            </div>
                            <p className="ap-empty-title">No family trees found</p>
                            <p className="ap-empty-text">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {trees.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{trees.from}</strong> to <strong>{trees.to}</strong> of <strong>{trees.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            {Array.from({ length: trees.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    disabled={page === trees.current_page}
                                    className={`ap-page-btn ${page === trees.current_page ? 'active' : ''}`}
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
