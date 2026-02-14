import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FileText,
    MessageSquare,
    Mic,
    Eye,
    MessageCircle,
    Heart,
    TrendingUp,
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

interface PostsByType {
    text: number;
    voice: number;
}

interface Engagement {
    avg_views: number;
    avg_comments: number;
    avg_reactions: number;
}

interface TopPost {
    id: number;
    content_preview: string;
    views_count: number;
    reactions_count: number;
    user_name: string;
}

interface MonthlyPost {
    month: string;
    count: number;
}

interface Props {
    postsByType: PostsByType;
    engagement: Engagement;
    topPosts: TopPost[];
    monthlyPosts: MonthlyPost[];
}

export default function ContentAnalytics({ postsByType, engagement, topPosts, monthlyPosts }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const totalPosts = postsByType.text + postsByType.voice;
    const maxMonthly = monthlyPosts.length > 0 ? Math.max(...monthlyPosts.map(m => m.count)) : 1;

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
                            <FileText size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                Content Analytics
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            Analyze content performance, engagement metrics, and posting trends
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>Content performance insights</span>
                        </div>
                    </div>
                </div>

                {/* Posts by Type and Engagement */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem', marginBottom: '2rem' }}>
                    {/* Posts by Type */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        {[
                            { label: 'Text Posts', value: postsByType.text, icon: MessageSquare, color: THEME.primary, lightColor: '#e7f1ff' },
                            { label: 'Voice Posts', value: postsByType.voice, icon: Mic, color: THEME.success, lightColor: '#e8f5e9' },
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
                                        <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: '0 0 0.5rem 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                            <p style={{ fontSize: '2.25rem', fontWeight: 800, color: item.color, margin: 0, lineHeight: 1 }}>{item.value.toLocaleString()}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '14px', backgroundColor: item.lightColor }}>
                                                <Icon size={28} color={item.color} strokeWidth={1.5} />
                                            </div>
                                        </div>
                                        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.8rem', color: '#888', fontWeight: 600 }}>
                                            {totalPosts > 0 ? Math.round((item.value / totalPosts) * 100) : 0}% of total
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Engagement Metrics */}
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>Engagement Metrics</h2>
                        <p style={{ margin: '0 0 2rem 0', fontSize: '0.85rem', color: '#888' }}>Average per post</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {[
                                { label: 'Avg Views', value: engagement.avg_views, icon: Eye, color: THEME.primary, lightColor: '#e7f1ff' },
                                { label: 'Avg Comments', value: engagement.avg_comments, icon: MessageCircle, color: THEME.info, lightColor: '#e0f7fa' },
                                { label: 'Avg Reactions', value: engagement.avg_reactions, icon: Heart, color: THEME.danger, lightColor: '#ffebee' },
                            ].map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: item.lightColor }}>
                                            <Icon size={22} color={item.color} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>{item.label}</p>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: item.color }}>{item.value.toLocaleString()}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Monthly Activity Chart */}
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
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>Monthly Post Activity</h2>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#888' }}>Posts created per month</p>
                    </div>
                    <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingTop: '1rem' }}>
                        {monthlyPosts.length > 0 ? (
                            monthlyPosts.map((item, i) => {
                                const heightPercent = (item.count / maxMonthly) * 100;
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', height: '100%', justifyContent: 'flex-end' }}>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: THEME.success }}>{item.count}</span>
                                        <div
                                            style={{
                                                width: '100%',
                                                height: `${Math.max(heightPercent, 4)}%`,
                                                background: `linear-gradient(180deg, ${THEME.success} 0%, #157347 100%)`,
                                                borderRadius: '8px 8px 0 0',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.success}30`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            title={`${item.month}: ${item.count} posts`}
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

                {/* Top Posts Table */}
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
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>Top Performing Posts</h2>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#888' }}>Highest engagement posts</p>
                    </div>
                    {topPosts.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        {['#', 'Content', 'Author', 'Views', 'Reactions'].map((header) => (
                                            <th key={header} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {topPosts.map((post, idx) => (
                                        <tr
                                            key={post.id}
                                            style={{ borderBottom: '1.5px solid #E5E7EB', transition: 'all 0.3s ease', background: '#FFFFFF' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                                        >
                                            <td style={{ padding: '1.2rem 1.25rem' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', background: idx < 3 ? THEME.primary : '#F3F4F6', color: idx < 3 ? '#FFFFFF' : '#6c757d', fontSize: '0.8rem', fontWeight: 800 }}>
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1.25rem', fontSize: '0.92rem', color: '#374151', fontWeight: 500, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {post.content_preview}
                                            </td>
                                            <td style={{ padding: '1.2rem 1.25rem', fontSize: '0.92rem', color: '#4B5563', fontWeight: 600 }}>{post.user_name}</td>
                                            <td style={{ padding: '1.2rem 1.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Eye size={14} color={THEME.primary} />
                                                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: THEME.primary }}>{post.views_count.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Heart size={14} color={THEME.danger} />
                                                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: THEME.danger }}>{post.reactions_count.toLocaleString()}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#999' }}>
                            <FileText size={40} color="#D1D5DB" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
                            <p style={{ margin: 0, fontSize: '0.95rem' }}>No posts data available</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
