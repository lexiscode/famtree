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
            background: '#F8F9FA',
        }}>
            {/* Sidebar */}
            <aside style={{
                width: sidebarOpen ? '280px' : '80px',
                background: '#FFFFFF',
                borderRight: '1px solid #E8E8E8',
                transition: 'width 0.3s ease',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto',
                zIndex: 40,
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Logo Section */}
                <div style={{
                    padding: '1.5rem 1rem',
                    borderBottom: '1px solid #E8E8E8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    {sidebarOpen && (
                        <h1 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            margin: 0,
                            color: '#1a1a1a',
                        }}>
                            FamTree
                        </h1>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#666',
                            transition: 'color 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{
                    flex: 1,
                    padding: '1rem 0.5rem',
                    overflowY: 'auto',
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
                                    gap: '0.75rem',
                                    padding: '0.875rem 0.75rem',
                                    margin: '0.25rem 0',
                                    borderRadius: '8px',
                                    color: item.active ? '#0052E8' : '#666',
                                    textDecoration: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: item.active ? 600 : 500,
                                    background: item.active ? 'rgba(0, 82, 232, 0.08)' : 'transparent',
                                    transition: 'all 0.2s ease',
                                    borderLeft: item.active ? '3px solid #0052E8' : '3px solid transparent',
                                    paddingLeft: item.active ? '0.625rem' : '0.75rem',
                                    whiteSpace: sidebarOpen ? 'nowrap' : 'normal',
                                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                                    position: 'relative',
                                }}
                                onMouseEnter={(e) => {
                                    if (!item.active) {
                                        e.currentTarget.style.background = '#F5F5F5';
                                        e.currentTarget.style.color = '#1a1a1a';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!item.active) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#666';
                                    }
                                }}
                                title={!sidebarOpen ? item.label : ''}
                            >
                                <Icon size={18} style={{ minWidth: '18px' }} />
                                {sidebarOpen && (
                                    <>
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <span style={{
                                                marginLeft: 'auto',
                                                background: '#FF4757',
                                                color: 'white',
                                                borderRadius: '12px',
                                                padding: '0.25rem 0.5rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                            }}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </a>
                        );
                    })}
                </nav>

                {/* Admin Profile Section */}
                <div style={{
                    borderTop: '1px solid #E8E8E8',
                    padding: '1rem 0.5rem',
                }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.875rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: '#F5F5F5',
                            transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#EEEEEE'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#F5F5F5'}
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 700,
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
                                        color: '#1a1a1a',
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
                                        Admin
                                    </p>
                                </div>
                                <ChevronDown size={16} style={{
                                    color: '#999',
                                    transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                                    transition: 'transform 0.2s ease',
                                }} />
                            </>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    {profileDropdownOpen && sidebarOpen && (
                        <div style={{
                            marginTop: '0.5rem',
                            borderRadius: '8px',
                            background: '#F9F9F9',
                            border: '1px solid #E8E8E8',
                            overflow: 'hidden',
                        }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#FF4757',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'background 0.2s ease',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#F0F0F0'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: sidebarOpen ? '280px' : '80px',
                transition: 'margin-left 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Top Navigation */}
                <header style={{
                    background: '#FFFFFF',
                    borderBottom: '1px solid #E8E8E8',
                    padding: '1rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
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
                            gap: '0.5rem',
                            background: '#F5F5F5',
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px',
                            padding: '0.5rem 1rem',
                            flex: '0 1 300px',
                        }}>
                            <Search size={18} style={{ color: '#999' }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    background: 'none',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    color: '#333',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                    }}>
                        {/* Notifications */}
                        <button style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            position: 'relative',
                            transition: 'color 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                        >
                            <Bell size={20} />
                            <span style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                width: '8px',
                                height: '8px',
                                background: '#FF4757',
                                borderRadius: '50%',
                            }} />
                        </button>

                        {/* Admin User Menu */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            paddingLeft: '1.5rem',
                            borderLeft: '1px solid #E8E8E8',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                            }}>
                                {auth?.admin?.username?.[0]?.toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto',
                }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
