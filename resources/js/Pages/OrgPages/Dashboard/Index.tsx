import OrgLayout from '@/Layouts/OrgLayout';
import {
    Users,
    FileText,
    Megaphone,
    FolderTree,
    UserCheck,
    TrendingUp,
    Clock,
    Plus,
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface Stats {
    followers: number;
    posts: number;
    broadcastsSent: number;
    activeGroups: number;
    totalMembers: number;
}

interface ActivityItem {
    id: number;
    action: string;
    description: string;
    account: string;
    timestamp: string;
}

interface Props {
    stats: Stats;
    recentActivity: ActivityItem[];
}

export default function Dashboard({ stats, recentActivity }: Props) {
    const statCards = [
        {
            label: 'Followers',
            value: stats.followers,
            icon: Users,
            color: '#8B5CF6',
            bg: 'rgba(139, 92, 246, 0.1)',
        },
        {
            label: 'Posts',
            value: stats.posts,
            icon: FileText,
            color: '#3B82F6',
            bg: 'rgba(59, 130, 246, 0.1)',
        },
        {
            label: 'Broadcasts Sent',
            value: stats.broadcastsSent,
            icon: Megaphone,
            color: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.1)',
        },
        {
            label: 'Active Groups',
            value: stats.activeGroups,
            icon: FolderTree,
            color: '#10B981',
            bg: 'rgba(16, 185, 129, 0.1)',
        },
        {
            label: 'Total Members',
            value: stats.totalMembers,
            icon: UserCheck,
            color: '#EC4899',
            bg: 'rgba(236, 72, 153, 0.1)',
        },
    ];

    const quickActions = [
        { label: 'Create Post', icon: Plus, route: 'org.posts.index', color: '#8B5CF6' },
        { label: 'Send Broadcast', icon: Megaphone, route: 'org.broadcasts.create', color: '#3B82F6' },
        { label: 'View Analytics', icon: TrendingUp, route: 'org.analytics.index', color: '#10B981' },
    ];

    return (
        <OrgLayout>
            <div>
                <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '0.5rem',
                }}>
                    Dashboard
                </h1>
                <p style={{ color: '#888', fontSize: '0.95rem', marginBottom: '2rem' }}>
                    Overview of your organization's activity
                </p>

                {/* Stat Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.25rem',
                    marginBottom: '2.5rem',
                }}>
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                style={{
                                    background: '#141425',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = `${card.color}33`;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '1rem',
                                }}>
                                    <div style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '10px',
                                        background: card.bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Icon size={20} color={card.color} />
                                    </div>
                                </div>
                                <p style={{
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    margin: '0 0 0.25rem 0',
                                }}>
                                    {card.value.toLocaleString()}
                                </p>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: '#888',
                                    margin: 0,
                                }}>
                                    {card.label}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Actions + Recent Activity */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr',
                    gap: '1.5rem',
                }}>
                    {/* Quick Actions */}
                    <div style={{
                        background: '#141425',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                    }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            marginBottom: '1.25rem',
                        }}>
                            Quick Actions
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {quickActions.map((action, index) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => router.visit(route(action.route))}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.875rem 1rem',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255, 255, 255, 0.06)',
                                            borderRadius: '10px',
                                            color: '#e0e0e0',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'left',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = `${action.color}15`;
                                            e.currentTarget.style.borderColor = `${action.color}33`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                                        }}
                                    >
                                        <Icon size={18} color={action.color} />
                                        {action.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div style={{
                        background: '#141425',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                    }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            marginBottom: '1.25rem',
                        }}>
                            Recent Activity
                        </h3>
                        {recentActivity.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {recentActivity.map((item) => (
                                    <div
                                        key={item.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '1rem',
                                            padding: '0.875rem 0',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <Clock size={14} color="#8B5CF6" />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                margin: '0 0 0.25rem',
                                                fontSize: '0.875rem',
                                                color: '#e0e0e0',
                                            }}>
                                                {item.description || item.action}
                                            </p>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '0.75rem',
                                                color: '#666',
                                            }}>
                                                {item.account} · {item.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                                No recent activity yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </OrgLayout>
    );
}
