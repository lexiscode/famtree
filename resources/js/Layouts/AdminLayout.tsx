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
    Building2,
    Image,
    AlertTriangle,
    BookOpen,
    Mail,
    Heart,
    MessageSquare,
    GitBranch,
    Vote,
    Shield,
    BellRing,
    Server,
    Globe,
    UserCog,
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
        { label: 'Dashboard', icon: LayoutDashboard, href: route('admin.dashboard'), active: route().current('admin.dashboard') },
        { label: 'Users', icon: Users, href: route('admin.users.index'), active: route().current('admin.users.*') },
        { label: 'Organizations', icon: Building2, href: route('admin.organizations.index'), active: route().current('admin.organizations.*') || route().current('admin.orgCategories.*') },
        { label: 'Content', icon: Image, href: route('admin.content.posts'), active: route().current('admin.content.*') },
        { label: 'Reports', icon: AlertTriangle, href: route('admin.reports.index'), active: route().current('admin.reports.*') || route().current('admin.blocks.*') },
        { label: 'Blog', icon: BookOpen, href: route('admin.blog.index'), active: route().current('admin.blog.*') },
        { label: 'Contact', icon: Mail, href: route('admin.contact.index'), active: route().current('admin.contact.*') },
        { label: 'Memorial', icon: Heart, href: route('admin.memorial.verifications'), active: route().current('admin.memorial.*') },
        { label: 'Messaging', icon: MessageSquare, href: route('admin.messaging.conversations'), active: route().current('admin.messaging.*') },
        { label: 'Family Trees', icon: GitBranch, href: route('admin.familyTrees.index'), active: route().current('admin.familyTrees.*') || route().current('admin.connections.*') },
        { label: 'Groups', icon: Vote, href: route('admin.elections.index'), active: route().current('admin.elections.*') || route().current('admin.removals.*') },
        { label: 'Analytics', icon: BarChart3, href: route('admin.analytics.overview'), active: route().current('admin.analytics.*') },
        { label: 'Security', icon: Shield, href: route('admin.security.dashboard'), active: route().current('admin.security.*') },
        { label: 'Notifications', icon: BellRing, href: route('admin.notifications.broadcast'), active: route().current('admin.notifications.*') || route().current('admin.emails.*') },
        { label: 'System', icon: Server, href: route('admin.system.health'), active: route().current('admin.system.*') },
        { label: 'Public Pages', icon: Globe, href: route('admin.publicPages.index'), active: route().current('admin.publicPages.*') },
        { label: 'Settings', icon: Settings, href: route('admin.settings.index'), active: route().current('admin.settings.*') },
        { label: 'Team', icon: UserCog, href: route('admin.team.index'), active: route().current('admin.team.*') },
    ];

    return (
        <div className="ap-layout">
            {/* Sidebar */}
            <aside className={`ap-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
                {/* Logo */}
                <div className="ap-sidebar-logo">
                    <div className="ap-flex ap-items-center ap-gap-md" style={{ minWidth: 0 }}>
                        <div className="ap-sidebar-logo-icon">
                            <Zap size={18} />
                        </div>
                        {sidebarOpen && (
                            <div className="ap-sidebar-logo-text">
                                <h1>FamTree</h1>
                                <p>Admin Panel</p>
                            </div>
                        )}
                    </div>
                    <button className="ap-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="ap-sidebar-nav">
                    <div className="ap-sidebar-nav-list">
                        {navigationItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <a
                                    key={index}
                                    href={item.href}
                                    className={`ap-nav-item ${item.active ? 'active' : ''}`}
                                    title={!sidebarOpen ? item.label : undefined}
                                >
                                    <Icon size={18} className="ap-nav-icon" />
                                    {sidebarOpen && <span className="ap-nav-label">{item.label}</span>}
                                </a>
                            );
                        })}
                    </div>
                </nav>

                {/* Admin Profile */}
                <div className="ap-sidebar-profile">
                    <button
                        className="ap-sidebar-profile-btn"
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    >
                        <div className="ap-sidebar-avatar">
                            {auth?.admin?.username?.[0]?.toUpperCase() || 'A'}
                        </div>
                        {sidebarOpen && (
                            <>
                                <div className="ap-sidebar-profile-info ap-flex-1" style={{ minWidth: 0 }}>
                                    <p className="ap-truncate">{auth?.admin?.username}</p>
                                    <p>Administrator</p>
                                </div>
                                <ChevronDown size={14} className={`ap-sidebar-chevron ${profileDropdownOpen ? 'open' : ''}`} />
                            </>
                        )}
                    </button>

                    {profileDropdownOpen && sidebarOpen && (
                        <div className="ap-sidebar-dropdown">
                            <button className="ap-sidebar-dropdown-btn" onClick={handleLogout}>
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className={`ap-main ${sidebarOpen ? '' : 'ap-sidebar-collapsed'}`}>
                {/* Topbar */}
                <header className="ap-topbar">
                    <div className="ap-topbar-search">
                        <Search size={16} />
                        <input type="text" placeholder="Search..." />
                        <kbd className="ap-topbar-kbd">⌘K</kbd>
                    </div>

                    <div className="ap-topbar-right">
                        <button className="ap-topbar-icon-btn">
                            <Bell size={18} />
                            <span className="ap-topbar-dot" />
                        </button>
                        <div className="ap-topbar-divider" />
                        <div className="ap-topbar-avatar">
                            {auth?.admin?.username?.[0]?.toUpperCase() || 'A'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="ap-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
