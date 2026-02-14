import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Link2,
    CheckCircle,
    Clock,
    XCircle,
    Users,
    Zap,
    BarChart3,
} from 'lucide-react';

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

interface DistributionItem {
    relationship_type: string;
    count: number;
}

interface StatusBreakdown {
    accepted: number;
    pending: number;
    declined: number;
}

interface MonthlyConnection {
    month: string;
    count: number;
}

interface Props {
    distribution: DistributionItem[];
    statusBreakdown: StatusBreakdown;
    monthlyConnections: MonthlyConnection[];
    avgConnectionsPerUser: number;
}

export default function ConnectionsAnalytics({ distribution, statusBreakdown, monthlyConnections, avgConnectionsPerUser }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const maxDistribution = distribution.length > 0 ? Math.max(...distribution.map(d => d.count)) : 1;
    const totalStatus = statusBreakdown.accepted + statusBreakdown.pending + statusBreakdown.declined;
    const maxMonthly = monthlyConnections.length > 0 ? Math.max(...monthlyConnections.map(m => m.count)) : 1;

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
                            <Link2 size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                Connection Analytics
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            Analyze family connection patterns, statuses, and relationship distributions
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>Connection network insights</span>
                        </div>
                    </div>
                </div>

                {/* Status Breakdown Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
                    {[
                        { label: 'Accepted', value: statusBreakdown.accepted, icon: CheckCircle, color: THEME.success, lightColor: '#e8f5e9' },
                        { label: 'Pending', value: statusBreakdown.pending, icon: Clock, color: THEME.warning, lightColor: '#fff8e1' },
                        { label: 'Declined', value: statusBreakdown.declined, icon: XCircle, color: THEME.danger, lightColor: '#ffebee' },
                        { label: 'Avg Per User', value: avgConnectionsPerUser, icon: Users, color: THEME.primary, lightColor: '#e7f1ff' },
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                style={{
                                    background: '#FFFFFF',
                                    borderRadius: '18px',
                                    padding: '1.75rem',
                                    border: `2.5px solid ${item.lightColor}`,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = item.color;
                                    e.currentTarget.style.boxShadow = `0 20px 48px ${item.color}20`;
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = item.lightColor;
                                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: item.lightColor, borderRadius: '50%', opacity: 0.3, transform: 'translate(30%, -30%)' }} />
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: '0 0 1rem 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                        <p style={{ fontSize: '2rem', fontWeight: 800, color: item.color, margin: 0, lineHeight: 1 }}>{typeof item.value === 'number' && item.value % 1 !== 0 ? item.value.toFixed(1) : item.value.toLocaleString()}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '14px', backgroundColor: item.lightColor }}>
                                            <Icon size={28} color={item.color} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Distribution and Monthly Chart */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem', marginBottom: '2.5rem' }}>
                    {/* Relationship Type Distribution */}
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>Relationship Types</h2>
                        <p style={{ margin: '0 0 2rem 0', fontSize: '0.85rem', color: '#888' }}>Distribution by relationship type</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {distribution.length > 0 ? (
                                distribution.map((item, idx) => {
                                    const widthPercent = (item.count / maxDistribution) * 100;
                                    const colors = [THEME.primary, THEME.success, THEME.info, THEME.warning, THEME.danger, THEME.secondary];
                                    const color = colors[idx % colors.length];
                                    return (
                                        <div key={idx}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>
                                                    {item.relationship_type.replace(/_/g, ' ')}
                                                </span>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color }}>{item.count.toLocaleString()}</span>
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

                    {/* Monthly Connections Chart */}
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>Monthly Connections</h2>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#888' }}>New connections per month</p>
                        </div>
                        <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingTop: '1rem' }}>
                            {monthlyConnections.length > 0 ? (
                                monthlyConnections.map((item, i) => {
                                    const heightPercent = (item.count / maxMonthly) * 100;
                                    return (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', height: '100%', justifyContent: 'flex-end' }}>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: THEME.info }}>{item.count}</span>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: `${Math.max(heightPercent, 4)}%`,
                                                    background: `linear-gradient(180deg, ${THEME.info} 0%, #0bacce 100%)`,
                                                    borderRadius: '8px 8px 0 0',
                                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.info}30`;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                                title={`${item.month}: ${item.count} connections`}
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
                </div>
            </div>
        </AdminLayout>
    );
}
