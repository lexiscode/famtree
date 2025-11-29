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
        border: '1px solid #E8E8E8',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(-4px)';
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '1rem',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: color,
                color: 'white',
            }}>
                {icon}
            </div>
            {trend && (
                <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: trend.includes('+') ? '#2ECC71' : '#E74C3C',
                    background: trend.includes('+') ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                }}>
                    {trend}
                </span>
            )}
        </div>
        <h3 style={{
            margin: '0 0 0.5rem 0',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#999',
        }}>
            {title}
        </h3>
        <p style={{
            margin: 0,
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1a1a1a',
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
                    marginBottom: '1.5rem',
                    padding: '1rem 1.25rem',
                    borderRadius: '8px',
                    background: flash?.error ? '#FADBD8' : '#D5F4E6',
                    border: `1px solid ${flash?.error ? '#F5B7B1' : '#A9DFBF'}`,
                    color: flash?.error ? '#C0392B' : '#196F3D',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                }}>
                    {flash?.success || flash?.error}
                </div>
            )}

            {/* Page Header */}
            <div style={{
                marginBottom: '2rem',
            }}>
                <h1 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#1a1a1a',
                }}>
                    Welcome back, {auth?.admin?.username}
                </h1>
                <p style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    color: '#999',
                }}>
                    Here's what's happening with your platform today
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem',
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
                gap: '1.5rem',
                marginBottom: '2rem',
            }}>
                {/* Activity Chart */}
                <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E8E8E8',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem',
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: '#1a1a1a',
                        }}>
                            Activity Overview
                        </h2>
                        <select style={{
                            background: '#F5F5F5',
                            border: '1px solid #E0E0E0',
                            borderRadius: '6px',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.9rem',
                            color: '#666',
                            cursor: 'pointer',
                        }}>
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last 90 days</option>
                        </select>
                    </div>
                    <div style={{
                        height: '250px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-around',
                        gap: '0.75rem',
                    }}>
                        {[65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                            <div
                                key={i}
                                style={{
                                    flex: 1,
                                    height: `${height}%`,
                                    background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                                    borderRadius: '6px 6px 0 0',
                                    opacity: 0.7 + (i * 0.05),
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = String(0.7 + (i * 0.05));
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                                title={`Day ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* System Health */}
                <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E8E8E8',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}>
                    <h2 style={{
                        margin: '0 0 1.5rem 0',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#1a1a1a',
                    }}>
                        System Health
                    </h2>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                    }}>
                        {[
                            { label: 'Server Status', value: '99.8%', color: '#2ECC71' },
                            { label: 'Database', value: '98.5%', color: '#2ECC71' },
                            { label: 'API Response', value: '245ms', color: '#3498DB' },
                            { label: 'Memory Usage', value: '62%', color: '#F39C12' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.5rem',
                                }}>
                                    <span style={{
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        color: '#666',
                                    }}>
                                        {item.label}
                                    </span>
                                    <span style={{
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        color: item.color,
                                    }}>
                                        {item.value}
                                    </span>
                                </div>
                                <div style={{
                                    height: '6px',
                                    background: '#E8E8E8',
                                    borderRadius: '3px',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        height: '100%',
                                        background: item.color,
                                        width: item.label === 'API Response' ? '90%' : item.label === 'Memory Usage' ? '62%' : item.value.includes('99') ? '99.8%' : '98.5%',
                                        borderRadius: '3px',
                                        transition: 'width 0.3s ease',
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
                border: '1px solid #E8E8E8',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}>
                <h2 style={{
                    margin: '0 0 1.5rem 0',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#1a1a1a',
                }}>
                    Recent Activities
                </h2>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}>
                    {recentActivities.map((activity) => (
                        <div
                            key={activity.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: '#F9F9F9',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#F0F0F0';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#F9F9F9';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'rgba(0, 82, 232, 0.1)',
                                color: '#0052E8',
                            }}>
                                {activity.icon}
                            </div>
                            <div style={{
                                flex: 1,
                            }}>
                                <p style={{
                                    margin: '0 0 0.25rem 0',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    color: '#1a1a1a',
                                }}>
                                    {activity.description}
                                </p>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.85rem',
                                    color: '#999',
                                }}>
                                    {activity.user}
                                </p>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#999',
                                fontSize: '0.85rem',
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
