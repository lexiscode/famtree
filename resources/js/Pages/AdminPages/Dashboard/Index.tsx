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
} from 'lucide-react';

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
            background: color.includes('82') ? 'rgba(0, 82, 232, 0.05)' : color.includes('46') ? 'rgba(46, 204, 113, 0.05)' : color.includes('255') ? 'rgba(255, 107, 107, 0.05)' : 'rgba(155, 89, 182, 0.05)',
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
    const { auth, flash } = usePage<SharedProps>().props;

    const statCards = [
        {
            title: 'Total Users',
            value: '2,547',
            icon: <Users size={24} />,
            trend: '+12.5%',
            color: 'rgba(0, 82, 232, 0.2)',
        },
        {
            title: 'Active Users',
            value: '1,842',
            icon: <Activity size={24} />,
            trend: '+8.2%',
            color: 'rgba(46, 204, 113, 0.2)',
        },
        {
            title: 'Reports',
            value: '24',
            icon: <AlertCircle size={24} />,
            trend: '-3.1%',
            color: 'rgba(255, 107, 107, 0.2)',
        },
        {
            title: 'Messages',
            value: '8,392',
            icon: <MessageSquare size={24} />,
            trend: '+5.6%',
            color: 'rgba(155, 89, 182, 0.2)',
        },
    ];

    const recentActivities = [
        {
            id: 1,
            type: 'user_signup',
            description: 'New user registered',
            user: 'John Doe',
            time: '2 hours ago',
            icon: <Users size={16} />,
        },
        {
            id: 2,
            type: 'report_filed',
            description: 'User report filed',
            user: 'Jane Smith',
            time: '4 hours ago',
            icon: <FileText size={16} />,
        },
        {
            id: 3,
            type: 'content_deleted',
            description: 'Inappropriate post removed',
            user: 'System',
            time: '6 hours ago',
            icon: <AlertCircle size={16} />,
        },
        {
            id: 4,
            type: 'user_signup',
            description: 'New user registered',
            user: 'Michael Johnson',
            time: '1 day ago',
            icon: <Users size={16} />,
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
                        {[65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                            <div
                                key={i}
                                style={{
                                    flex: 1,
                                    height: `${height}%`,
                                    background: 'linear-gradient(180deg, #0052E8 0%, #0040B8 100%)',
                                    borderRadius: '8px 8px 0 0',
                                    opacity: 0.6 + (i * 0.06),
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0, 82, 232, 0.1)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 82, 232, 0.25)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = String(0.6 + (i * 0.06));
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 82, 232, 0.1)';
                                }}
                                title={`Day ${i + 1}: ${Math.floor(height * 12)} events`}
                            />
                        ))}
                    </div>
                </div>

                {/* System Health */}
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
                            System Health
                        </h2>
                        <p style={{
                            margin: '0.5rem 0 0 0',
                            fontSize: '0.85rem',
                            color: '#888',
                        }}>
                            Infrastructure monitoring
                        </p>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.75rem',
                        marginTop: '2rem',
                    }}>
                        {[
                            { label: 'Server Status', value: '99.8%', color: '#16A34A', percentage: 99.8 },
                            { label: 'Database', value: '98.5%', color: '#16A34A', percentage: 98.5 },
                            { label: 'API Response', value: '245ms', color: '#3B82F6', percentage: 90 },
                            { label: 'Memory Usage', value: '62%', color: '#F59E0B', percentage: 62 },
                        ].map((item, i) => (
                            <div key={i}>
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
                                        {item.label}
                                    </span>
                                    <span style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 700,
                                        color: item.color,
                                        background: `${item.color}15`,
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '8px',
                                    }}>
                                        {item.value}
                                    </span>
                                </div>
                                <div style={{
                                    height: '8px',
                                    background: '#F0F2F7',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                                }}>
                                    <div style={{
                                        height: '100%',
                                        background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}dd 100%)`,
                                        width: `${item.percentage}%`,
                                        borderRadius: '4px',
                                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: `0 0 12px ${item.color}40`,
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
                        Recent Activities
                    </h2>
                    <p style={{
                        margin: '0.5rem 0 0 0',
                        fontSize: '0.85rem',
                        color: '#888',
                    }}>
                        Latest platform events and changes
                    </p>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                }}>
                    {recentActivities.map((activity) => (
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
                                {activity.icon}
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
                                    {activity.user}
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
                                {activity.time}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
