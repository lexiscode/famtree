import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users,
    BarChart3,
    TrendingUp,
    AlertCircle,
    Activity,
    MessageSquare,
    FileText,
    Clock,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react';

interface Metric {
    totalUsers: number;
    activeUsers: number;
    totalConnections: number;
    totalFamilyTrees: number;
    pendingReports: number;
}

interface GrowthData {
    date: string;
    count: number;
}

interface Stats {
    total: number;
    accepted: number;
    pending: number;
    declined: number;
}

interface ReportStats {
    total: number;
    pending: number;
    reviewing: number;
    resolved: number;
    dismissed: number;
}

interface ActivityLog {
    id: number;
    admin: string;
    action: string;
    description: string;
    timestamp: string;
}

interface Alert {
    type: 'warning' | 'alert';
    message: string;
    priority: 'high' | 'critical';
}

interface SharedProps {
    auth?: {
        admin?: {
            id: number;
            username: string;
            email: string;
        };
    };
    flash?: {
        success?: string;
        error?: string;
    };
    metrics?: Metric;
    userGrowth?: GrowthData[];
    connectionStats?: Stats;
    reportStats?: ReportStats;
    recentActivity?: ActivityLog[];
    alerts?: Alert[];
}

interface StatCard {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    color: string;
}

const StatCard = ({ title, value, icon, trend, color }: StatCard) => (
    <div style={{
        background: '#FFFFFF',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '14px',
        padding: '1.75rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
    }}
    onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = 'rgba(0, 82, 232, 0.2)';
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
    }}
    >
        <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200px',
            height: '200px',
            background: color === '#0052E8' ? 'rgba(0, 82, 232, 0.1)' : color === '#16A34A' ? 'rgba(22, 163, 74, 0.1)' : color === '#DC2626' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(155, 89, 182, 0.1)',
            borderRadius: '50%',
            pointerEvents: 'none',
        }} />
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            position: 'relative',
            zIndex: 2,
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                background: color,
                color: 'white',
                boxShadow: `0 4px 12px ${color}`,
            }}>
                {icon}
            </div>
            {trend && (
                <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: trend.includes('+') ? '#16A34A' : '#DC2626',
                    background: trend.includes('+') ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '24px',
                    border: trend.includes('+') ? '1px solid rgba(22, 163, 74, 0.3)' : '1px solid rgba(220, 38, 38, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                }}>
                    {trend.includes('+') ? '↑' : '↓'} {trend}
                </span>
            )}
        </div>
        <h3 style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#888',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            position: 'relative',
            zIndex: 2,
        }}>
            {title}
        </h3>
        <p style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0a0e27',
            position: 'relative',
            zIndex: 2,
        }}>
            {value}
        </p>
    </div>
);

export default function AdminDashboard() {
    const { auth, flash, metrics, userGrowth, connectionStats, reportStats, recentActivity, alerts } = usePage<SharedProps>().props;

    // Build stat cards from real data
    const statCards = [
        {
            title: 'Total Users',
            value: (metrics?.totalUsers || 0).toLocaleString(),
            icon: <Users size={24} />,
            color: '#0052E8',
        },
        {
            title: 'Active Users',
            value: (metrics?.activeUsers || 0).toLocaleString(),
            icon: <Activity size={24} />,
            color: '#16A34A',
        },
        {
            title: 'Pending Reports',
            value: (metrics?.pendingReports || 0).toString(),
            icon: <AlertCircle size={24} />,
            color: '#DC2626',
        },
        {
            title: 'Family Trees',
            value: (metrics?.totalFamilyTrees || 0).toLocaleString(),
            icon: <BarChart3 size={24} />,
            color: '#9B59B6',
        },
    ];

    return (
        <AdminLayout>
            {/* Flash Messages */}
            {(flash?.success || flash?.error) && (
                <div style={{
                    marginBottom: '2rem',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '12px',
                    background: flash?.error ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)' : 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                    border: `1px solid ${flash?.error ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)'}`,
                    color: flash?.error ? '#DC2626' : '#16A34A',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: flash?.error ? '0 4px 12px rgba(220, 38, 38, 0.1)' : '0 4px 12px rgba(22, 163, 74, 0.1)',
                }}>
                    <span style={{
                        fontSize: '1.25rem',
                    }}>
                        {flash?.error ? '⚠️' : '✓'}
                    </span>
                    {flash?.success || flash?.error}
                </div>
            )}

            {/* Page Header */}
            <div style={{
                marginBottom: '2.5rem',
            }}>
                <h1 style={{
                    margin: '0 0 0.75rem 0',
                    fontSize: '2.25rem',
                    fontWeight: 800,
                    color: '#0a0e27',
                    letterSpacing: '-0.8px',
                }}>
                    Welcome back, {auth?.admin?.username}
                </h1>
                <p style={{
                    margin: 0,
                    fontSize: '1rem',
                    color: '#888',
                    fontWeight: 400,
                }}>
                    Here's what's happening with your platform today
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.75rem',
                marginBottom: '2.5rem',
            }}>
                {statCards.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        trend={stat.trend}
                        color={stat.color}
                    />
                ))}
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.75rem',
                marginBottom: '2.5rem',
            }}>
                {/* Activity Chart */}
                <div style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '14px',
                    padding: '2rem',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s ease',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '2rem',
                    }}>
                        <div>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#0a0e27',
                            }}>
                                Activity Overview
                            </h2>
                            <p style={{
                                margin: '0.5rem 0 0 0',
                                fontSize: '0.85rem',
                                color: '#888',
                            }}>
                                User engagement trends
                            </p>
                        </div>
                        <select style={{
                            background: '#F5F7FA',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            borderRadius: '8px',
                            padding: '0.65rem 1rem',
                            fontSize: '0.9rem',
                            color: '#555',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.2s ease',
                            width: '150px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FFFFFF';
                            e.currentTarget.style.borderColor = 'rgba(0, 82, 232, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F5F7FA';
                            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                        }}
                        >
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last 90 days</option>
                        </select>
                    </div>
                    <div style={{
                        height: '280px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-around',
                        gap: '0.75rem',
                        paddingTop: '1rem',
                    }}>
                        {userGrowth && userGrowth.length > 0 ? (
                            (() => {
                                const maxCount = Math.max(...userGrowth.map(d => d.count)) || 1;
                                return userGrowth.map((item, i) => {
                                    const heightPercent = (item.count / maxCount) * 100;
                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                flex: 1,
                                                height: `${heightPercent}%`,
                                                minHeight: '20px',
                                                background: 'linear-gradient(180deg, #0052E8 0%, #0040B8 100%)',
                                                borderRadius: '8px 8px 0 0',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 8px rgba(0, 82, 232, 0.1)',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-8px)';
                                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 82, 232, 0.25)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 82, 232, 0.1)';
                                            }}
                                            title={`${item.date}: ${item.count} new users`}
                                        />
                                    );
                                });
                            })()
                        ) : (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#999',
                                fontSize: '0.9rem',
                            }}>
                                No data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistics */}
                <div style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '14px',
                    padding: '2rem',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                }}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: '#0a0e27',
                        }}>
                            Platform Statistics
                        </h2>
                        <p style={{
                            margin: '0.5rem 0 0 0',
                            fontSize: '0.85rem',
                            color: '#888',
                        }}>
                            User connections & reports overview
                        </p>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.75rem',
                        marginTop: '2rem',
                    }}>
                        {/* Connections Stats */}
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.75rem',
                            }}>
                                <span style={{
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    color: '#555',
                                }}>
                                    Accepted Connections
                                </span>
                                <span style={{
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    color: '#16A34A',
                                    background: 'rgba(22, 163, 74, 0.15)',
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '8px',
                                }}>
                                    {connectionStats?.accepted || 0} / {connectionStats?.total || 0}
                                </span>
                            </div>
                            <div style={{
                                height: '8px',
                                background: '#F0F2F7',
                                borderRadius: '4px',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #16A34A 0%, #15803d 100%)',
                                    width: `${connectionStats ? (connectionStats.accepted / connectionStats.total) * 100 : 0}%`,
                                    borderRadius: '4px',
                                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                }} />
                            </div>
                        </div>

                        {/* Reports Stats */}
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.75rem',
                            }}>
                                <span style={{
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    color: '#555',
                                }}>
                                    Resolved Reports
                                </span>
                                <span style={{
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    color: '#0052E8',
                                    background: 'rgba(0, 82, 232, 0.15)',
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '8px',
                                }}>
                                    {reportStats?.resolved || 0} / {reportStats?.total || 0}
                                </span>
                            </div>
                            <div style={{
                                height: '8px',
                                background: '#F0F2F7',
                                borderRadius: '4px',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #0052E8 0%, #0040B8 100%)',
                                    width: `${reportStats ? (reportStats.resolved / reportStats.total) * 100 : 0}%`,
                                    borderRadius: '4px',
                                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                }} />
                            </div>
                        </div>

                        {/* Pending Reports Alert */}
                        {reportStats && reportStats.pending > 0 && (
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(255, 193, 7, 0.1)',
                                border: '1px solid rgba(255, 193, 7, 0.3)',
                                borderRadius: '8px',
                                display: 'flex',
                                gap: '0.75rem',
                                alignItems: 'flex-start',
                            }}>
                                <AlertTriangle size={18} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#92400e', fontSize: '0.9rem' }}>
                                        {reportStats.pending} Pending Reports
                                    </p>
                                    <p style={{ margin: '0.25rem 0 0 0', color: '#b45309', fontSize: '0.85rem' }}>
                                        Requires review and action
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            {alerts && alerts.length > 0 && (
                <div style={{
                    marginBottom: '2.5rem',
                }}>
                    <h3 style={{
                        margin: '0 0 1rem 0',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#0a0e27',
                    }}>
                        Active Alerts
                    </h3>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}>
                        {alerts.map((alert, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '12px',
                                    border: `1px solid ${alert.type === 'alert' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                                    background: alert.type === 'alert' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'flex-start',
                                }}
                            >
                                {alert.type === 'alert' ? (
                                    <AlertTriangle size={20} style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }} />
                                ) : (
                                    <AlertTriangle size={20} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }} />
                                )}
                                <div>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        color: alert.type === 'alert' ? '#DC2626' : '#92400e',
                                    }}>
                                        {alert.priority === 'critical' ? '🚨' : '⚠️'} {alert.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activities */}
            <div style={{
                background: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '14px',
                padding: '2rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            }}>
                <div style={{
                    marginBottom: '2rem',
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#0a0e27',
                    }}>
                        Recent Admin Activities
                    </h2>
                    <p style={{
                        margin: '0.5rem 0 0 0',
                        fontSize: '0.85rem',
                        color: '#888',
                    }}>
                        Latest admin actions and system events
                    </p>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                }}>
                    {recentActivity && recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                            <div
                                key={activity.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.25rem',
                                    padding: '1.25rem 1.5rem',
                                    background: '#F9FAFC',
                                    border: '1px solid rgba(0, 0, 0, 0.04)',
                                    borderRadius: '10px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#F0F4F9';
                                    e.currentTarget.style.borderColor = 'rgba(0, 82, 232, 0.15)';
                                    e.currentTarget.style.transform = 'translateX(6px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 82, 232, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#F9FAFC';
                                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.04)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, rgba(0, 82, 232, 0.15) 0%, rgba(0, 82, 232, 0.08) 100%)',
                                    color: '#0052E8',
                                    flexShrink: 0,
                                }}>
                                    <CheckCircle size={20} />
                                </div>
                                <div style={{
                                    flex: 1,
                                    minWidth: 0,
                                }}>
                                    <p style={{
                                        margin: '0 0 0.35rem 0',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        color: '#0a0e27',
                                    }}>
                                        {activity.description}
                                    </p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.85rem',
                                        color: '#888',
                                    }}>
                                        By {activity.admin} • {activity.action}
                                    </p>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#AAA',
                                    fontSize: '0.85rem',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                }}>
                                    <Clock size={14} />
                                    {activity.timestamp}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: '#999',
                        }}>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>No recent activities</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
