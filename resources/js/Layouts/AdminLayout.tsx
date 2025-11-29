import { ReactNode, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import {
    Menu,
    X,
    LayoutDashboard,
    Users,
    FileText,
    BarChart3,
    Settings,
    LogOut,
    ChevronDown,
    Bell,
    Search,
    Zap,
    Command,
} from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
}

interface SharedProps {
    auth?: {
        admin?: {
            id: number;
            username: string;
            email: string;
        };
    };
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { auth } = usePage<SharedProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const handleLogout = () => {
        router.post(route('admin.logout'));
    };

    const navigationItems = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: route('admin.dashboard'),
            active: route().current('admin.dashboard'),
        },
        {
            label: 'Users',
            icon: Users,
            href: '#',
            active: false,
            badge: null,
        },
        {
            label: 'Reports',
            icon: FileText,
            href: '#',
            active: false,
            badge: '3',
        },
        {
            label: 'Analytics',
            icon: BarChart3,
            href: '#',
            active: false,
        },
        {
            label: 'Settings',
            icon: Settings,
            href: '#',
            active: false,
        },
    ];

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #FAFBFC 0%, #F0F2F7 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
        }}>
            {/* Sidebar */}
            <aside style={{
                width: sidebarOpen ? '260px' : '80px',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFB 100%)',
                borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto',
                zIndex: 40,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            }}>
                {/* Logo Section */}
                <div style={{
                    padding: sidebarOpen ? '1.75rem 1.5rem' : '1.75rem 1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        minWidth: 0,
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            flexShrink: 0,
                        }}>
                            <Zap size={22} />
                        </div>
                        {sidebarOpen && (
                            <div style={{ minWidth: 0 }}>
                                <h1 style={{
                                    margin: 0,
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    color: '#0a0e27',
                                    letterSpacing: '-0.3px',
                                }}>
                                    FamTree
                                </h1>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.75rem',
                                    color: '#999',
                                    fontWeight: 500,
                                }}>
                                    Admin Panel
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            background: 'rgba(0, 82, 232, 0.08)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            color: '#0052E8',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 82, 232, 0.12)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 82, 232, 0.08)';
                        }}
                    >
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{
                    flex: 1,
                    padding: '1.25rem 0.5rem',
                    overflowY: 'auto',
                    overscrollBehavior: 'contain',
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                    }}>
                        {navigationItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <a
                                    key={index}
                                    href={item.href}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.875rem',
                                        padding: sidebarOpen ? '0.875rem 1rem' : '0.875rem 1rem',
                                        margin: '0',
                                        borderRadius: '10px',
                                        color: item.active ? '#0052E8' : '#555',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem',
                                        fontWeight: item.active ? 600 : 500,
                                        background: item.active ? 'linear-gradient(135deg, rgba(0, 82, 232, 0.1) 0%, rgba(0, 82, 232, 0.05) 100%)' : 'transparent',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        borderLeft: '2px solid ' + (item.active ? '#0052E8' : 'transparent'),
                                        paddingLeft: sidebarOpen ? (item.active ? '0.875rem' : '1rem') : '1rem',
                                        whiteSpace: 'nowrap',
                                        justifyContent: sidebarOpen ? 'flex-start' : 'center',
                                        position: 'relative',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!item.active) {
                                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
                                            e.currentTarget.style.color = '#0a0e27';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!item.active) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = '#555';
                                        }
                                    }}
                                    title={!sidebarOpen ? item.label : ''}
                                >
                                    <Icon size={18} style={{ flexShrink: 0 }} />
                                    {sidebarOpen && (
                                        <>
                                            <span style={{ flex: 1 }}>{item.label}</span>
                                            {item.badge && (
                                                <span style={{
                                                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    padding: '0.25rem 0.5rem',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    minWidth: '20px',
                                                    textAlign: 'center',
                                                    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                                                }}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </a>
                            );
                        })}
                    </div>
                </nav>

                {/* Admin Profile Section */}
                <div style={{
                    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                    padding: '1rem 0.5rem',
                    background: 'rgba(0, 82, 232, 0.03)',
                }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.875rem 1rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, rgba(0, 82, 232, 0.08) 0%, rgba(0, 82, 232, 0.04) 100%)',
                            transition: 'all 0.2s ease',
                            border: '1px solid rgba(0, 82, 232, 0.15)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 82, 232, 0.12) 0%, rgba(0, 82, 232, 0.08) 100%)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 82, 232, 0.08) 0%, rgba(0, 82, 232, 0.04) 100%)';
                        }}
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(0, 82, 232, 0.3)',
                            flexShrink: 0,
                        }}>
                            {auth?.admin?.username?.[0]?.toUpperCase() || 'A'}
                        </div>
                        {sidebarOpen && (
                            <>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        color: '#0a0e27',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {auth?.admin?.username}
                                    </p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.8rem',
                                        color: '#999',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        Administrator
                                    </p>
                                </div>
                                <ChevronDown size={16} style={{
                                    color: '#0052E8',
                                    transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                                    transition: 'transform 0.2s ease',
                                    flexShrink: 0,
                                }} />
                            </>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    {profileDropdownOpen && sidebarOpen && (
                        <div style={{
                            marginTop: '0.75rem',
                            borderRadius: '10px',
                            background: '#FFFFFF',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            overflow: 'hidden',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                        }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#FF6B6B',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 107, 107, 0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: sidebarOpen ? '260px' : '80px',
                transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Top Navigation */}
                <header style={{
                    background: '#FFFFFF',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    padding: '1rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        flex: 1,
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            background: '#F5F7FA',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            borderRadius: '10px',
                            padding: '0.75rem 1.25rem',
                            flex: '0 1 320px',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FFFFFF';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 82, 232, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(0, 82, 232, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F5F7FA';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                        }}
                        >
                            <Search size={18} style={{ color: '#999' }} />
                            <input
                                type="text"
                                placeholder="Search users, reports..."
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    background: 'none',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    color: '#333',
                                    fontFamily: 'inherit',
                                }}
                            />
                            <kbd style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                background: 'rgba(0, 0, 0, 0.06)',
                                borderRadius: '4px',
                                color: '#999',
                                border: '1px solid rgba(0, 0, 0, 0.12)',
                                fontWeight: 500,
                            }}>⌘K</kbd>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.75rem',
                    }}>
                        {/* Notifications */}
                        <button style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: '#555',
                            display: 'flex',
                            alignItems: 'center',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#0052E8'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#555'}
                        >
                            <Bell size={20} />
                            <span style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                width: '10px',
                                height: '10px',
                                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
                                borderRadius: '50%',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 2px 6px rgba(255, 107, 107, 0.4)',
                            }} />
                        </button>

                        {/* Admin User Menu */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            paddingLeft: '1.75rem',
                            borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                boxShadow: '0 4px 12px rgba(0, 82, 232, 0.3)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 82, 232, 0.4)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 82, 232, 0.3)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                            >
                                {auth?.admin?.username?.[0]?.toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{
                    flex: 1,
                    padding: '2rem 2.5rem',
                    overflowY: 'auto',
                    overscrollBehavior: 'contain',
                }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
