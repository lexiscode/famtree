import { usePage } from '@inertiajs/react';
import { Users, BarChart3, TrendingUp, AlertCircle, LogOut } from 'lucide-react';
import { router } from '@inertiajs/react';

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

export default function AdminDashboard() {
    const { auth, flash } = usePage<SharedProps>().props;

    const handleLogout = () => {
        router.post(route('admin.logout'));
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0F1F35 0%, #1a2f47 100%)',
            color: '#FFFFFF',
        }}>
            {/* Top Navigation */}
            <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderBottom: '1px solid rgba(0, 82, 232, 0.2)',
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backdropFilter: 'blur(10px)',
            }}>
                <div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        margin: '0 0 0.25rem 0',
                        color: '#FFFFFF',
                    }}>
                        Admin Dashboard
                    </h1>
                    <p style={{
                        fontSize: '0.9rem',
                        color: '#A0A0A0',
                        margin: 0,
                    }}>
                        Welcome, {auth?.admin?.username || 'Admin'}
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #FF4757 0%, #FF1744 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 71, 87, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>

            {/* Flash Messages */}
            {(flash?.success || flash?.error) && (
                <div style={{
                    margin: '2rem',
                    padding: '1rem',
                    background: flash?.error ? 'rgba(255, 71, 87, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                    border: `1px solid ${flash?.error ? 'rgba(255, 71, 87, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
                    borderRadius: '8px',
                    color: flash?.error ? '#FF6B7A' : '#4CAF50',
                }}>
                    {flash?.success || flash?.error}
                </div>
            )}

            {/* Main Content */}
            <div style={{
                padding: '2rem',
                maxWidth: '1400px',
                margin: '0 auto',
            }}>
                {/* Quick Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                }}>
                    {/* Users Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(0, 82, 232, 0.1) 0%, rgba(0, 82, 232, 0.05) 100%)',
                        border: '1px solid rgba(0, 82, 232, 0.2)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '50px',
                                height: '50px',
                                background: 'rgba(0, 82, 232, 0.2)',
                                borderRadius: '10px',
                            }}>
                                <Users size={24} color="#0052E8" />
                            </div>
                            <div>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: '#A0A0A0',
                                    margin: '0 0 0.5rem 0',
                                }}>
                                    Total Users
                                </p>
                                <p style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 700,
                                    margin: 0,
                                    color: '#0052E8',
                                }}>
                                    —
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '50px',
                                height: '50px',
                                background: 'rgba(255, 215, 0, 0.2)',
                                borderRadius: '10px',
                            }}>
                                <BarChart3 size={24} color="#FFD700" />
                            </div>
                            <div>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: '#A0A0A0',
                                    margin: '0 0 0.5rem 0',
                                }}>
                                    Analytics
                                </p>
                                <p style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 700,
                                    margin: 0,
                                    color: '#FFD700',
                                }}>
                                    —
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Growth Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '50px',
                                height: '50px',
                                background: 'rgba(0, 212, 255, 0.2)',
                                borderRadius: '10px',
                            }}>
                                <TrendingUp size={24} color="#00D4FF" />
                            </div>
                            <div>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: '#A0A0A0',
                                    margin: '0 0 0.5rem 0',
                                }}>
                                    Growth
                                </p>
                                <p style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 700,
                                    margin: 0,
                                    color: '#00D4FF',
                                }}>
                                    —
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Section */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(0, 82, 232, 0.05) 100%)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    borderRadius: '12px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '60px',
                        height: '60px',
                        background: 'rgba(255, 215, 0, 0.1)',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                    }}>
                        <AlertCircle size={32} color="#FFD700" />
                    </div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        margin: '0 0 0.5rem 0',
                    }}>
                        Dashboard Under Development
                    </h2>
                    <p style={{
                        fontSize: '1rem',
                        color: '#A0A0A0',
                        margin: '0 0 1.5rem 0',
                        maxWidth: '500px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}>
                        The admin dashboard is currently being built. Full functionality including user management, analytics, reports, and system monitoring will be available soon.
                    </p>
                    <p style={{
                        fontSize: '0.9rem',
                        color: '#707070',
                        margin: 0,
                    }}>
                        Check back soon for updates and new features!
                    </p>
                </div>
            </div>
        </div>
    );
}
