import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BarChart3,
    Users,
    FileText,
    Link2,
    Building2,
    TrendingUp,
    TrendingDown,
    Zap,
    MessageSquare,
    Mic,
    Image,
} from 'lucide-react';

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

interface Metrics {
    total_users: number;
    total_posts: number;
    total_connections: number;
    total_organizations: number;
    user_growth_percent: number;
    post_growth_percent: number;
}

interface GrowthItem {
    month: string;
    count: number;
}

interface ContentBreakdown {
    text: number;
    voice: number;
    image: number;
}

interface Props {
    metrics: Metrics;
    userGrowth: GrowthItem[];
    contentBreakdown: ContentBreakdown;
}

export default function Overview({ metrics, userGrowth, contentBreakdown }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const totalContent = contentBreakdown.text + contentBreakdown.voice + contentBreakdown.image;
    const textPercent = totalContent > 0 ? Math.round((contentBreakdown.text / totalContent) * 100) : 0;
    const voicePercent = totalContent > 0 ? Math.round((contentBreakdown.voice / totalContent) * 100) : 0;
    const imagePercent = totalContent > 0 ? Math.round((contentBreakdown.image / totalContent) * 100) : 0;

    const metricCards = [
        {
            label: 'Total Users',
            value: metrics.total_users,
            icon: Users,
            color: THEME.primary,
            lightColor: '#e7f1ff',
            growth: metrics.user_growth_percent,
        },
        {
            label: 'Total Posts',
            value: metrics.total_posts,
            icon: FileText,
            color: THEME.success,
            lightColor: '#e8f5e9',
            growth: metrics.post_growth_percent,
        },
        {
            label: 'Total Connections',
            value: metrics.total_connections,
            icon: Link2,
            color: THEME.info,
            lightColor: '#e0f7fa',
            growth: null,
        },
        {
            label: 'Total Organizations',
            value: metrics.total_organizations,
            icon: Building2,
            color: THEME.warning,
            lightColor: '#fff8e1',
            growth: null,
        },
    ];

    const maxGrowth = userGrowth.length > 0 ? Math.max(...userGrowth.map(g => g.count)) : 1;

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Flash Messages */}
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
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
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
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <BarChart3 size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Analytics Overview
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
                            Monitor key platform metrics, user growth, and content performance at a glance
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Real-time platform analytics and insights
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metric Cards */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.75rem',
                        marginBottom: '3rem',
                    }}
                >
                    {metricCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={idx}
                                style={{
                                    background: '#FFFFFF',
                                    borderRadius: '18px',
                                    padding: '1.75rem',
                                    border: `2.5px solid ${card.lightColor}`,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = card.color;
                                    e.currentTarget.style.boxShadow = `0 20px 48px ${card.color}20, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = card.lightColor;
                                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '100px',
                                        height: '100px',
                                        background: card.lightColor,
                                        borderRadius: '50%',
                                        opacity: 0.3,
                                        transform: 'translate(30%, -30%)',
                                    }}
                                />
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {card.label}
                                        </p>
                                        {card.growth !== null && (
                                            <div
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '6px',
                                                    background: card.growth >= 0 ? '#e8f5e9' : '#ffebee',
                                                    color: card.growth >= 0 ? THEME.success : THEME.danger,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                }}
                                            >
                                                {card.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {card.growth >= 0 ? '+' : ''}{card.growth}%
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                        <p
                                            style={{
                                                fontSize: '2.25rem',
                                                fontWeight: 800,
                                                color: card.color,
                                                margin: 0,
                                                lineHeight: 1,
                                            }}
                                        >
                                            {card.value.toLocaleString()}
                                        </p>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '72px',
                                                height: '72px',
                                                borderRadius: '16px',
                                                backgroundColor: card.lightColor,
                                            }}
                                        >
                                            <Icon size={36} color={card.color} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.75rem', marginBottom: '2.5rem' }}>
                    {/* User Growth Chart */}
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
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>
                                User Growth
                            </h2>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#888' }}>
                                Monthly new user registrations
                            </p>
                        </div>
                        <div
                            style={{
                                height: '280px',
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '0.5rem',
                                paddingTop: '1rem',
                            }}
                        >
                            {userGrowth.length > 0 ? (
                                userGrowth.map((item, i) => {
                                    const heightPercent = (item.count / maxGrowth) * 100;
                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                height: '100%',
                                                justifyContent: 'flex-end',
                                            }}
                                        >
                                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: THEME.primary }}>
                                                {item.count}
                                            </span>
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
                                                title={`${item.month}: ${item.count} users`}
                                            />
                                            <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                {item.month}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.9rem' }}>
                                    No data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Breakdown */}
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
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>
                                Content Breakdown
                            </h2>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#888' }}>
                                Posts by content type
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                            {[
                                { label: 'Text Posts', value: contentBreakdown.text, percent: textPercent, color: THEME.primary, lightColor: '#e7f1ff', icon: MessageSquare },
                                { label: 'Voice Posts', value: contentBreakdown.voice, percent: voicePercent, color: THEME.success, lightColor: '#e8f5e9', icon: Mic },
                                { label: 'Image Posts', value: contentBreakdown.image, percent: imagePercent, color: THEME.info, lightColor: '#e0f7fa', icon: Image },
                            ].map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '10px',
                                                        backgroundColor: item.lightColor,
                                                    }}
                                                >
                                                    <Icon size={18} color={item.color} />
                                                </div>
                                                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151' }}>
                                                    {item.label}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '1rem', fontWeight: 800, color: item.color }}>
                                                    {item.value.toLocaleString()}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        color: item.color,
                                                        background: item.lightColor,
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: '6px',
                                                    }}
                                                >
                                                    {item.percent}%
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                height: '10px',
                                                background: '#F0F2F7',
                                                borderRadius: '5px',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${item.percent}%`,
                                                    background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}cc 100%)`,
                                                    borderRadius: '5px',
                                                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div
                            style={{
                                marginTop: '2rem',
                                padding: '1rem',
                                background: '#F9FAFB',
                                borderRadius: '12px',
                                textAlign: 'center',
                            }}
                        >
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>
                                Total Content: <span style={{ color: '#0a0e27', fontWeight: 800 }}>{totalContent.toLocaleString()}</span> posts
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
