import { useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Sparkles, Calendar, Image, Star, Users, Plus, Eye, Pencil,
} from 'lucide-react';

interface Season {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    status: string;
    start_date: string;
    end_date: string;
    challenges_count: number;
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
    total_challenges: number;
    total_entries: number;
    total_votes: number;
    total_members: number;
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
            router.get(route('admin.glam.index'), { page, per_page: perPage }, { preserveScroll: true });
        },
        [perPage]
    );

    const statusBadgeMap: Record<string, string> = {
        upcoming: 'ap-badge-info',
        active: 'ap-badge-success',
        completed: 'ap-badge-neutral',
    };

    return (
        <AdminLayout>
            <div>

<div className="ap-page-header">
                    <div className="ap-page-header-row">
                        <div>
                            <h1 className="ap-page-title">Glam Squad</h1>
                            <p className="ap-page-subtitle">Manage fashion challenge seasons, challenges, and squads</p>
                        </div>
                        <div className="ap-page-header-actions">
                            <button className="ap-btn ap-btn-secondary" onClick={() => router.visit(route('admin.glam.squads'))}>
                                <Users size={16} /> Squads
                            </button>
                            <button className="ap-btn ap-btn-primary" onClick={() => router.visit(route('admin.glam.create'))}>
                                <Plus size={16} /> New Season
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid ap-mb-lg">
                    {[
                        { label: 'Total Seasons', value: statistics.total_seasons, icon: Sparkles, colorClass: 'purple' },
                        { label: 'Active Seasons', value: statistics.active_seasons, icon: Calendar, colorClass: 'green' },
                        { label: 'Total Challenges', value: statistics.total_challenges, icon: Image, colorClass: 'blue' },
                        { label: 'Total Entries', value: statistics.total_entries, icon: Star, colorClass: 'amber' },
                        { label: 'Total Votes', value: statistics.total_votes, icon: Star, colorClass: 'pink' },
                        { label: 'Total Members', value: statistics.total_members, icon: Users, colorClass: 'cyan' },
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

                {/* Seasons Table */}
                <div className="ap-table-wrap">
                    {seasons.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Season</th>
                                        <th>Status</th>
                                        <th>Duration</th>
                                        <th className="center">Challenges</th>
                                        <th className="center">Participants</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {seasons.data.map((season) => (
                                        <tr key={season.id}>
                                            <td>
                                                <span className="ap-font-semibold">{season.name}</span>
                                            </td>
                                            <td>
                                                <span className={`ap-badge ${statusBadgeMap[season.status] || 'ap-badge-neutral'} ap-capitalize`}>
                                                    {season.status}
                                                </span>
                                            </td>
                                            <td className="ap-text-secondary ap-text-sm">
                                                {season.start_date} — {season.end_date}
                                            </td>
                                            <td className="center">{season.challenges_count}</td>
                                            <td className="center">{season.standings_count}</td>
                                            <td className="center">
                                                <div className="ap-flex ap-items-center ap-justify-center ap-gap-xs">
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-primary"
                                                        onClick={() => router.visit(route('admin.glam.show', season.id))}
                                                    >
                                                        <Eye size={14} /> View
                                                    </button>
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-secondary"
                                                        onClick={() => router.visit(route('admin.glam.edit', season.id))}
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Sparkles size={28} strokeWidth={1.5} />
                            </div>
                            <p className="ap-empty-title">No glam seasons yet</p>
                            <p className="ap-empty-text">Create your first season to get started with fashion challenges.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {seasons.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{seasons.from}</strong> to <strong>{seasons.to}</strong> of <strong>{seasons.total}</strong> seasons
                        </p>
                        <div className="ap-pagination-btns">
                            {Array.from({ length: seasons.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    disabled={seasons.current_page === page}
                                    className={`ap-page-btn ${seasons.current_page === page ? 'active' : ''}`}
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
