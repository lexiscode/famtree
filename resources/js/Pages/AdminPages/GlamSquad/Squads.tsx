import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Users, Eye } from 'lucide-react';

interface Squad {
    id: number;
    uuid: string;
    name: string;
    gender_track: string;
    squad_number: number;
    member_cap: number;
    members_count: number;
    is_active: boolean;
}

interface Props {
    squads: Squad[];
}

export default function Squads({ squads }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const [filter, setFilter] = useState<'all' | 'female' | 'male' | 'mixed'>('all');

    const filtered = filter === 'all' ? squads : squads.filter(s => s.gender_track === filter);

    const trackBadgeMap: Record<string, string> = {
        female: 'ap-badge-danger',
        male: 'ap-badge-info',
        mixed: 'ap-badge-warning',
    };

    return (
        <AdminLayout>
            <div>

<button className="ap-back-btn ap-mb-md" onClick={() => router.visit(route('admin.glam.index'))}>
                    <ArrowLeft size={16} /> Back to Glam Squad
                </button>

                <div className="ap-page-header">
                    <div className="ap-page-header-row">
                        <div>
                            <h1 className="ap-page-title">Squads</h1>
                            <p className="ap-page-subtitle">View and manage all glam squads</p>
                        </div>
                        <div className="ap-flex ap-gap-xs">
                            {(['all', 'female', 'male', 'mixed'] as const).map(f => (
                                <button
                                    key={f}
                                    className={`ap-btn ap-btn-sm ${filter === f ? 'ap-btn-primary' : 'ap-btn-secondary'}`}
                                    onClick={() => setFilter(f)}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="ap-table-wrap">
                    {filtered.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Squad Name</th>
                                        <th>Track</th>
                                        <th className="center">Members</th>
                                        <th className="center">Cap</th>
                                        <th>Status</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(squad => (
                                        <tr key={squad.id}>
                                            <td><span className="ap-font-semibold">{squad.name}</span></td>
                                            <td>
                                                <span className={`ap-badge ${trackBadgeMap[squad.gender_track] || 'ap-badge-neutral'} ap-capitalize`}>
                                                    {squad.gender_track}
                                                </span>
                                            </td>
                                            <td className="center">{squad.members_count}</td>
                                            <td className="center">{squad.member_cap}</td>
                                            <td>
                                                <span className={`ap-badge ${squad.is_active ? 'ap-badge-success' : 'ap-badge-neutral'}`}>
                                                    {squad.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="center">
                                                <button
                                                    className="ap-btn ap-btn-sm ap-btn-primary"
                                                    onClick={() => router.visit(route('admin.glam.showSquad', squad.id))}
                                                >
                                                    <Eye size={14} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon"><Users size={28} strokeWidth={1.5} /></div>
                            <p className="ap-empty-title">No squads yet</p>
                            <p className="ap-empty-text">Squads are automatically created when users join the Glam Squad feature.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
