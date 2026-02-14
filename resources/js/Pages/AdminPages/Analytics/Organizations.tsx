import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Building2,
    Users,
    FileText,
    Heart,
    TrendingUp,
    Zap,
    Tag,
} from 'lucide-react';

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

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

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {(flash?.success || flash?.error) && (
                    <div
                        style={{
                            marginBottom: '2rem',
                            padding: '1.25rem 1.5rem',
                            borderRadius: '12px',
                            background: flash?.error
                                ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                            border: `1px solid ${flash?.error ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)'}`,
                            color: flash?.error ? '#DC2626' : '#16A34A',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                        }}
                    >
                        {flash?.success || flash?.error}
                    </div>
                )}

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
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <Building2 size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                Organization Analytics
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            Track organization growth, engagement, and category trends
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Total Followers: {totalFollowers.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Growth Chart */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        padding: '2rem',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        marginBottom: '2rem',
                    }}
                >
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>Organization Growth</h2>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#888' }}>New organizations per month</p>
                    </div>
                    <div style={{ height: '260px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingTop: '1rem' }}>
                        {growth.length > 0 ? (
                            growth.map((item, i) => {
                                const heightPercent = (item.count / maxGrowth) * 100;
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', height: '100%', justifyContent: 'flex-end' }}>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: THEME.primary }}>{item.count}</span>
                                        <div
                                            style={{
                                                width: '100%',
                                                height: `${Math.max(heightPercent, 4)}%`,
                                                background: `linear-gradient(180deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                                borderRadius: '8px 8px 0 0',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.primary}30`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            title={`${item.month}: ${item.count} organizations`}
                                        />
                                        <span style={{ fontSize: '0.68rem', color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.month}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No data available</div>
                        )}
                    </div>
                </div>

                {/* Top Organizations and Category Distribution */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.75rem' }}>
                    {/* Top Organizations Table */}
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            overflow: 'hidden',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <div style={{ padding: '2rem 2rem 1rem 2rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>Top Organizations</h2>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#888' }}>By total engagement</p>
                        </div>
                        {topOrganizations.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                            {['#', 'Organization', 'Followers', 'Posts', 'Staff'].map((header) => (
                                                <th key={header} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topOrganizations.map((org, idx) => (
                                            <tr
                                                key={org.id}
                                                style={{ borderBottom: '1.5px solid #E5E7EB', transition: 'all 0.3s ease', background: '#FFFFFF' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                                            >
                                                <td style={{ padding: '1.2rem 1.25rem' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', background: idx < 3 ? THEME.primary : '#F3F4F6', color: idx < 3 ? '#FFFFFF' : '#6c757d', fontSize: '0.8rem', fontWeight: 800 }}>
                                                        {idx + 1}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.2rem 1.25rem', fontSize: '0.95rem', fontWeight: 700, color: '#0a0e27' }}>{org.name}</td>
                                                <td style={{ padding: '1.2rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Heart size={14} color={THEME.danger} />
                                                        <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#4B5563' }}>{org.followers_count.toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.2rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <FileText size={14} color={THEME.primary} />
                                                        <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#4B5563' }}>{org.posts_count.toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.2rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Users size={14} color={THEME.success} />
                                                        <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#4B5563' }}>{org.staff_count.toLocaleString()}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#999' }}>
                                <Building2 size={40} color="#D1D5DB" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
                                <p style={{ margin: 0, fontSize: '0.95rem' }}>No organizations data available</p>
                            </div>
                        )}
                    </div>

                    {/* Category Distribution */}
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>Category Distribution</h2>
                        <p style={{ margin: '0 0 2rem 0', fontSize: '0.85rem', color: '#888' }}>Organizations by category</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {categoryDistribution.length > 0 ? (
                                categoryDistribution.map((item, idx) => {
                                    const widthPercent = (item.count / maxCategory) * 100;
                                    const colors = [THEME.primary, THEME.success, THEME.info, THEME.warning, '#e91e63', THEME.secondary];
                                    const color = colors[idx % colors.length];
                                    return (
                                        <div key={idx}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Tag size={14} color={color} />
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>{item.category}</span>
                                                </div>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color }}>{item.count}</span>
                                            </div>
                                            <div style={{ height: '8px', background: '#F0F2F7', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        width: `${widthPercent}%`,
                                                        background: color,
                                                        borderRadius: '4px',
                                                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No data available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
