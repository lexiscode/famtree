import { ReactNode, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/../css/org-layout.css';
import { useFlashToast } from '@/hooks/useFlashToast';
import {
    Menu,
    X,
    LayoutDashboard,
    FileText,
    Megaphone,
    BarChart3,
    Building2,
    Users,
    Shield,
    FolderTree,
    UsersRound,
    Heart,
    ScrollText,
    LogOut,
    ChevronDown,
} from 'lucide-react';

interface OrgLayoutProps {
    children: ReactNode;
}

interface OrgOrganization {
    id: number;
    name: string;
    short_name: string;
    slug: string;
    logo_url: string | null;
}

interface OrgAccount {
    id: number;
    uuid: string;
    username: string;
    email: string;
    role: string;
    display_name: string | null;
    is_owner: boolean;
    permissions: Record<string, boolean>;
    broadcast_year_limit: number | null;
    linked_org_group_id: number | null;
    linked_org_group_name: string | null;
    organization: OrgOrganization | null;
}

interface SharedProps {
    auth?: {
        org?: OrgAccount;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function OrgLayout({ children }: OrgLayoutProps) {
    const { auth, flash } = usePage<SharedProps>().props;
    const org = auth?.org;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    useFlashToast();

    const canAccess = (permission: string): boolean => {
        if (!org) return false;
        if (org.is_owner) return true;
        // Special: broadcasts accessible with either manage_broadcasts or manage_group_broadcasts
        if (permission === 'manage_broadcasts') {
            return !!org.permissions?.['manage_broadcasts'] || !!org.permissions?.['manage_group_broadcasts'];
        }
        // Special: org groups accessible with manage_org_groups OR having a linked group
        if (permission === 'manage_org_groups') {
            return !!org.permissions?.['manage_org_groups'] || !!org.linked_org_group_id;
        }
        return !!org.permissions?.[permission];
    };

    const handleLogout = () => {
        router.post(route('org.logout'));
    };

    const navigationItems = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: route('org.dashboard'),
            active: route().current('org.dashboard'),
        },
        {
            label: 'Posts',
            icon: FileText,
            href: route('org.posts.index'),
            active: route().current('org.posts.*'),
        },
        {
            label: 'Broadcasts',
            icon: Megaphone,
            href: route('org.broadcasts.index'),
            active: route().current('org.broadcasts.*'),
        },
        {
            label: 'Analytics',
            icon: BarChart3,
            href: route('org.analytics.index'),
            active: route().current('org.analytics.*'),
        },
        {
            label: 'Activity Logs',
            icon: ScrollText,
            href: route('org.activity-logs.index'),
            active: route().current('org.activity-logs.*'),
        },
        {
            label: 'Profile',
            icon: Building2,
            href: route('org.profile.show'),
            active: route().current('org.profile.*'),
        },
        {
            label: 'Staff',
            icon: Users,
            href: route('org.staff.index'),
            active: route().current('org.staff.*'),
        },
        {
            label: 'Roles',
            icon: Shield,
            href: route('org.roles.index'),
            active: route().current('org.roles.*'),
        },
        {
            label: 'Groups',
            icon: FolderTree,
            href: route('org.groups.index'),
            active: route().current('org.groups.*'),
        },
        {
            label: 'Org Groups',
            icon: UsersRound,
            href: route('org.org-groups.index'),
            active: route().current('org.org-groups.*'),
        },
        {
            label: 'Followers',
            icon: Heart,
            href: route('org.followers.index'),
            active: route().current('org.followers.*'),
        },
    ];

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#0c0c1d',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
            color: '#e0e0e0',
        }}>
            {/* Sidebar */}
            <aside className="org-sidebar" style={{
                width: sidebarOpen ? '260px' : '80px',
                background: 'linear-gradient(180deg, #141425 0%, #0e0e1e 100%)',
                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto',
                zIndex: 40,
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Logo Section */}
                <div style={{
                    padding: sidebarOpen ? '1.75rem 1.5rem' : '1.75rem 1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
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
                        {org?.organization?.logo_url ? (
                            <img
                                src={org.organization.logo_url}
                                alt={org.organization.short_name}
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    objectFit: 'cover',
                                    flexShrink: 0,
                                    border: '2px solid rgba(139, 92, 246, 0.3)',
                                }}
                            />
                        ) : (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1.25rem',
                                flexShrink: 0,
                            }}>
                                <Building2 size={22} />
                            </div>
                        )}
                        {sidebarOpen && (
                            <div style={{ minWidth: 0 }}>
                                <h1 style={{
                                    margin: 0,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    letterSpacing: '-0.3px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {org?.organization?.short_name || org?.organization?.name || 'Organization'}
                                </h1>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.75rem',
                                    color: '#8B5CF6',
                                    fontWeight: 500,
                                }}>
                                    Org Dashboard
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            color: '#8B5CF6',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; }}
                    >
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="org-sidebar-nav" style={{
                    flex: 1,
                    padding: '1.25rem 0.5rem',
                    overflowY: 'auto',
                    overscrollBehavior: 'contain',
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
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
                                        padding: '0.8rem 1rem',
                                        borderRadius: '10px',
                                        color: item.active ? '#8B5CF6' : '#888',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: item.active ? 600 : 500,
                                        background: item.active ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        borderLeft: '2px solid ' + (item.active ? '#8B5CF6' : 'transparent'),
                                        whiteSpace: 'nowrap',
                                        justifyContent: sidebarOpen ? 'flex-start' : 'center',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!item.active) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                            e.currentTarget.style.color = '#e0e0e0';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!item.active) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = '#888';
                                        }
                                    }}
                                    title={!sidebarOpen ? item.label : ''}
                                >
                                    <Icon size={18} style={{ flexShrink: 0 }} />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </a>
                            );
                        })}
                    </div>
                </nav>

                {/* Account Section */}
                <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    padding: '1rem 0.5rem',
                    background: 'rgba(139, 92, 246, 0.03)',
                }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.875rem 1rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            background: 'rgba(139, 92, 246, 0.08)',
                            transition: 'all 0.2s ease',
                            border: '1px solid rgba(139, 92, 246, 0.15)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.14)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)'; }}
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            flexShrink: 0,
                        }}>
                            {org?.display_name?.[0]?.toUpperCase() || org?.username?.[0]?.toUpperCase() || 'O'}
                        </div>
                        {sidebarOpen && (
                            <>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        color: '#ffffff',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {org?.display_name || org?.username}
                                    </p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.75rem',
                                        color: '#8B5CF6',
                                        textTransform: 'capitalize',
                                    }}>
                                        {org?.role}
                                    </p>
                                </div>
                                <ChevronDown size={16} style={{
                                    color: '#8B5CF6',
                                    transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                                    transition: 'transform 0.2s ease',
                                    flexShrink: 0,
                                }} />
                            </>
                        )}
                    </div>

                    {profileDropdownOpen && sidebarOpen && (
                        <div style={{
                            marginTop: '0.75rem',
                            borderRadius: '10px',
                            background: '#1e1e35',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            overflow: 'hidden',
                        }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#FF6B6B',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
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
                height: '100vh',
                overflow: 'hidden',
            }}>
                {/* Top Bar */}
                <header style={{
                    background: '#141425',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    padding: '1rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            color: '#ffffff',
                        }}>
                            {org?.organization?.name || 'Organization'}
                        </h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    </div>
                </header>

                {/* Page Content */}
                <div className="org-main-content" style={{
                    flex: 1,
                    padding: '2rem 2.5rem',
                    overflowY: 'auto',
                    overscrollBehavior: 'contain',
                }}>
                    {children}
                </div>
            </main>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={true}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </div>
    );
}
