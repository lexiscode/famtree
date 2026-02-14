import { useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Trophy,
    Calendar,
    Target,
    TrendingUp,
    Plus,
    Eye,
    Pencil,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface Organization {
    id: number;
    name: string;
    logo_url: string | null;
}

interface Season {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    status: string;
    start_date: string;
    end_date: string;
    organization: Organization | null;
    fixtures_count: number;
    standings_count: number;
    created_at: string;
}

interface PaginatedData {
    data: Season[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total_seasons: number;
    active_seasons: number;
    total_fixtures: number;
    total_predictions: number;
}

interface Props {
    seasons: PaginatedData;
    statistics: Statistics;
    perPage: number;
}

export default function Index({ seasons, statistics, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const handlePageChange = useCallback(
        (page: number) => {
            router.get(route('admin.predictions.index'), { page, per_page: perPage }, { preserveScroll: true });
        },
        [perPage]
    );

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; color: string }> = {
            upcoming: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' },
            active: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' },
            completed: { bg: 'rgba(107, 114, 128, 0.15)', color: '#9CA3AF' },
        };
        const s = styles[status] || styles.upcoming;
        return (
            <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: s.bg, color: s.color }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = seasons.current_page;
        const last = seasons.last_page;
        let start = Math.max(1, current - 2);
        let end = Math.min(last, current + 2);
        if (current <= 3) end = Math.min(last, 5);
        if (current >= last - 2) start = Math.max(1, last - 4);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <AdminLayout>
            <div>
                {flash?.success && <div className="ap-flash ap-flash-success">{flash.success}</div>}
                {flash?.error && <div className="ap-flash ap-flash-error">{flash.error}</div>}

                <div className="ap-page-header">
                    <div>
                        <h1 className="ap-page-title">Prediction League</h1>
                        <p className="ap-page-subtitle">Manage prediction seasons, fixtures, and standings</p>
                    </div>
                    <button className="ap-btn ap-btn-primary" onClick={() => router.visit(route('admin.predictions.create'))}>
                        <Plus size={16} /> New Season
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="ap-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div className="ap-stat-card">
                        <div className="ap-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                            <Trophy size={20} color="#8B5CF6" />
                        </div>
                        <div className="ap-stat-info">
                            <span className="ap-stat-value">{statistics.total_seasons}</span>
                            <span className="ap-stat-label">Total Seasons</span>
                        </div>
                    </div>
                    <div className="ap-stat-card">
                        <div className="ap-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                            <TrendingUp size={20} color="#10B981" />
                        </div>
                        <div className="ap-stat-info">
                            <span className="ap-stat-value">{statistics.active_seasons}</span>
                            <span className="ap-stat-label">Active Seasons</span>
                        </div>
                    </div>
                    <div className="ap-stat-card">
                        <div className="ap-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                            <Calendar size={20} color="#3B82F6" />
                        </div>
                        <div className="ap-stat-info">
                            <span className="ap-stat-value">{statistics.total_fixtures}</span>
                            <span className="ap-stat-label">Total Fixtures</span>
                        </div>
                    </div>
                    <div className="ap-stat-card">
                        <div className="ap-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                            <Target size={20} color="#F59E0B" />
                        </div>
                        <div className="ap-stat-info">
                            <span className="ap-stat-value">{statistics.total_predictions}</span>
                            <span className="ap-stat-label">Total Predictions</span>
                        </div>
                    </div>
                </div>

                {/* Seasons Table */}
                <div className="ap-card">
                    <div className="ap-card-header">
                        <h3>Seasons</h3>
                    </div>
                    <div className="ap-table-container">
                        <table className="ap-table">
                            <thead>
                                <tr>
                                    <th>Season</th>
                                    <th>Organization</th>
                                    <th>Status</th>
                                    <th>Duration</th>
                                    <th>Fixtures</th>
                                    <th>Participants</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {seasons.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                            No prediction seasons yet. Create your first season to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    seasons.data.map((season) => (
                                        <tr key={season.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{season.name}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {season.organization?.logo_url && (
                                                        <img src={season.organization.logo_url} alt="" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                                                    )}
                                                    <span>{season.organization?.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(season.status)}</td>
                                            <td style={{ fontSize: '0.85rem', color: '#aaa' }}>
                                                {season.start_date} — {season.end_date}
                                            </td>
                                            <td>{season.fixtures_count}</td>
                                            <td>{season.standings_count}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-ghost"
                                                        onClick={() => router.visit(route('admin.predictions.show', season.id))}
                                                        title="View"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-ghost"
                                                        onClick={() => router.visit(route('admin.predictions.edit', season.id))}
                                                        title="Edit"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {seasons.last_page > 1 && (
                        <div className="ap-pagination">
                            <button
                                className="ap-btn ap-btn-sm ap-btn-ghost"
                                onClick={() => handlePageChange(seasons.current_page - 1)}
                                disabled={seasons.current_page === 1}
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    className={`ap-btn ap-btn-sm ${page === seasons.current_page ? 'ap-btn-primary' : 'ap-btn-ghost'}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                className="ap-btn ap-btn-sm ap-btn-ghost"
                                onClick={() => handlePageChange(seasons.current_page + 1)}
                                disabled={seasons.current_page === seasons.last_page}
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
