import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Building2,
    Users,
    FileText,
    Heart,
    Tag,
} from 'lucide-react';

interface GrowthItem {
    month: string;
    count: number;
}

interface TopOrganization {
    id: number;
    name: string;
    followers_count: number;
    posts_count: number;
    staff_count: number;
}

interface CategoryDistribution {
    category: string;
    count: number;
}

interface Props {
    growth: GrowthItem[];
    topOrganizations: TopOrganization[];
    categoryDistribution: CategoryDistribution[];
    totalFollowers: number;
}

export default function OrganizationsAnalytics({ growth, topOrganizations, categoryDistribution, totalFollowers }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const maxGrowth = growth.length > 0 ? Math.max(...growth.map(g => g.count)) : 1;
    const maxCategory = categoryDistribution.length > 0 ? Math.max(...categoryDistribution.map(c => c.count)) : 1;

    const barColorClasses = ['indigo', 'green', 'blue', 'amber', 'red', 'purple'];

    return (
        <AdminLayout>
            <div>
{/* Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Organization Analytics</h1>
                    <p className="ap-page-subtitle">
                        Track organization growth, engagement, and category trends.
                        Total Followers: {totalFollowers.toLocaleString()}
                    </p>
                </div>

                {/* Growth Chart */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-card-header">
                        <div>
                            <h2 className="ap-card-title">Organization Growth</h2>
                            <p className="ap-card-subtitle">New organizations per month</p>
                        </div>
                    </div>
                    <div className="ap-chart-bars">
                        {growth.length > 0 ? (
                            growth.map((item, i) => {
                                const heightPercent = (item.count / maxGrowth) * 100;
                                return (
                                    <div key={i} className="ap-chart-bar-col">
                                        <span className="ap-text-xs ap-font-semibold">{item.count}</span>
                                        <div
                                            className="ap-chart-bar"
                                            style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                            title={`${item.month}: ${item.count} organizations`}
                                        />
                                        <span className="ap-text-xs ap-text-secondary ap-nowrap">{item.month}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="ap-empty">
                                <p className="ap-empty-text">No data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Organizations and Category Distribution */}
                <div className="ap-grid-2">
                    {/* Top Organizations Table */}
                    <div className="ap-table-wrap">
                        <div className="ap-card-header">
                            <div>
                                <h2 className="ap-card-title">Top Organizations</h2>
                                <p className="ap-card-subtitle">By total engagement</p>
                            </div>
                        </div>
                        {topOrganizations.length > 0 ? (
                            <div className="ap-table-scroll">
                                <table className="ap-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Organization</th>
                                            <th>Followers</th>
                                            <th>Posts</th>
                                            <th>Staff</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topOrganizations.map((org, idx) => (
                                            <tr key={org.id}>
                                                <td>
                                                    <span className={`ap-badge ${idx < 3 ? 'ap-badge-primary' : 'ap-badge-neutral'}`}>
                                                        {idx + 1}
                                                    </span>
                                                </td>
                                                <td className="ap-font-semibold">{org.name}</td>
                                                <td>
                                                    <div className="ap-flex ap-items-center ap-gap-xs">
                                                        <Heart size={14} className="ap-icon-danger" />
                                                        <span>{org.followers_count.toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="ap-flex ap-items-center ap-gap-xs">
                                                        <FileText size={14} className="ap-icon-primary" />
                                                        <span>{org.posts_count.toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="ap-flex ap-items-center ap-gap-xs">
                                                        <Users size={14} className="ap-icon-success" />
                                                        <span>{org.staff_count.toLocaleString()}</span>
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
                                    <Building2 size={24} />
                                </div>
                                <p className="ap-empty-title">No organizations data available</p>
                            </div>
                        )}
                    </div>

                    {/* Category Distribution */}
                    <div className="ap-card ap-card-lg">
                        <h2 className="ap-card-title">Category Distribution</h2>
                        <p className="ap-card-subtitle ap-mb-xl">Organizations by category</p>

                        <div className="ap-flex-col ap-gap-lg">
                            {categoryDistribution.length > 0 ? (
                                categoryDistribution.map((item, idx) => {
                                    const widthPercent = (item.count / maxCategory) * 100;
                                    const colorClass = barColorClasses[idx % barColorClasses.length];
                                    return (
                                        <div key={idx} className="ap-progress-wrap ap-mb-0">
                                            <div className="ap-progress-header">
                                                <div className="ap-flex ap-items-center ap-gap-sm">
                                                    <Tag size={14} className={`ap-icon-${colorClass === 'indigo' ? 'primary' : colorClass === 'green' ? 'success' : colorClass === 'blue' ? 'info' : colorClass === 'amber' ? 'warning' : colorClass === 'red' ? 'danger' : 'primary'}`} />
                                                    <span className="ap-progress-label ap-font-semibold">{item.category}</span>
                                                </div>
                                                <span className="ap-progress-value">{item.count}</span>
                                            </div>
                                            <div className="ap-progress-track">
                                                <div
                                                    className={`ap-progress-bar ${colorClass}`}
                                                    style={{ width: `${widthPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="ap-empty">
                                    <p className="ap-empty-text">No data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
