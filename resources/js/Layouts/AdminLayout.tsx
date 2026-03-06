import { ReactNode, useState, useCallback, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFlashToast } from '@/hooks/useFlashToast';
import {
    Menu,
    X,
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
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
    Trophy,
    Sparkles,
    Crown,
    Gamepad2,
    PanelLeft,
    type LucideIcon,
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

interface NavItem {
    label: string;
    icon: LucideIcon;
    href: string;
    active: boolean;
}

interface NavGroup {
    label: string;
    icon: LucideIcon;
    items: NavItem[];
    active: boolean;
}

type NavEntry = NavItem | NavGroup;

function isNavGroup(entry: NavEntry): entry is NavGroup {
    return 'items' in entry;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { auth } = usePage<SharedProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    useFlashToast();

    const handleLogout = useCallback(() => {
        router.post(route('admin.logout'));
    }, []);

    const toggleGroup = useCallback((label: string) => {
        setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
    }, []);

    const navigation: NavEntry[] = [
        // Standalone: Dashboard
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: route('admin.dashboard'),
            active: route().current('admin.dashboard'),
        },

        // Group: User Management
        {
            label: 'User Management',
            icon: Users,
            active: route().current('admin.users.*') || route().current('admin.organizations.*') || route().current('admin.orgCategories.*') || route().current('admin.reservedUsernames.*') || route().current('admin.claimRequests.*'),
            items: [
                { label: 'Users', icon: Users, href: route('admin.users.index'), active: route().current('admin.users.*') },
                { label: 'Organizations', icon: Building2, href: route('admin.organizations.index'), active: route().current('admin.organizations.*') || route().current('admin.orgCategories.*') },
                { label: 'Reserved Names', icon: Crown, href: route('admin.reservedUsernames.index'), active: route().current('admin.reservedUsernames.*') },
                { label: 'Claim Requests', icon: Shield, href: route('admin.claimRequests.index'), active: route().current('admin.claimRequests.*') },
            ],
        },

        // Group: Content
        {
            label: 'Content',
            icon: Image,
            active: route().current('admin.content.*') || route().current('admin.blog.*') || route().current('admin.publicPages.*'),
            items: [
                { label: 'Posts & Media', icon: Image, href: route('admin.content.posts'), active: route().current('admin.content.*') },
                { label: 'Blog', icon: BookOpen, href: route('admin.blog.index'), active: route().current('admin.blog.*') },
                { label: 'Public Pages', icon: Globe, href: route('admin.publicPages.index'), active: route().current('admin.publicPages.*') },
            ],
        },

        // Group: Community
        {
            label: 'Community',
            icon: GitBranch,
            active: route().current('admin.familyTrees.*') || route().current('admin.connections.*') || route().current('admin.elections.*') || route().current('admin.removals.*') || route().current('admin.messaging.*') || route().current('admin.memorial.*'),
            items: [
                { label: 'Family Trees', icon: GitBranch, href: route('admin.familyTrees.index'), active: route().current('admin.familyTrees.*') || route().current('admin.connections.*') },
                { label: 'Groups', icon: Vote, href: route('admin.elections.index'), active: route().current('admin.elections.*') || route().current('admin.removals.*') },
                { label: 'Messaging', icon: MessageSquare, href: route('admin.messaging.conversations'), active: route().current('admin.messaging.*') },
                { label: 'Memorial', icon: Heart, href: route('admin.memorial.verifications'), active: route().current('admin.memorial.*') },
            ],
        },

        // Group: Games & Activities
        {
            label: 'Games',
            icon: Gamepad2,
            active: route().current('admin.predictions.*') || route().current('admin.glam.*'),
            items: [
                { label: 'Predictions', icon: Trophy, href: route('admin.predictions.index'), active: route().current('admin.predictions.*') },
                { label: 'Glam Squad', icon: Sparkles, href: route('admin.glam.index'), active: route().current('admin.glam.*') },
            ],
        },

        // Group: Analytics & Reports
        {
            label: 'Insights',
            icon: BarChart3,
            active: route().current('admin.analytics.*') || route().current('admin.reports.*') || route().current('admin.blocks.*') || route().current('admin.security.*'),
            items: [
                { label: 'Analytics', icon: BarChart3, href: route('admin.analytics.overview'), active: route().current('admin.analytics.*') },
                { label: 'Reports', icon: AlertTriangle, href: route('admin.reports.index'), active: route().current('admin.reports.*') || route().current('admin.blocks.*') },
                { label: 'Security', icon: Shield, href: route('admin.security.dashboard'), active: route().current('admin.security.*') },
            ],
        },

        // Group: Communication
        {
            label: 'Communication',
            icon: BellRing,
            active: route().current('admin.notifications.*') || route().current('admin.emails.*') || route().current('admin.contact.*'),
            items: [
                { label: 'Notifications', icon: BellRing, href: route('admin.notifications.broadcast'), active: route().current('admin.notifications.*') || route().current('admin.emails.*') },
                { label: 'Contact', icon: Mail, href: route('admin.contact.index'), active: route().current('admin.contact.*') },
            ],
        },

        // Group: System
        {
            label: 'System',
            icon: Server,
            active: route().current('admin.system.*') || route().current('admin.settings.*') || route().current('admin.team.*'),
            items: [
                { label: 'Health', icon: Server, href: route('admin.system.health'), active: route().current('admin.system.*') },
                { label: 'Settings', icon: Settings, href: route('admin.settings.index'), active: route().current('admin.settings.*') },
                { label: 'Team', icon: UserCog, href: route('admin.team.index'), active: route().current('admin.team.*') },
            ],
        },
    ];

    // Auto-expand groups that have an active item
    useEffect(() => {
        const initial: Record<string, boolean> = {};
        navigation.forEach(entry => {
            if (isNavGroup(entry) && entry.active) {
                initial[entry.label] = true;
            }
        });
        setExpandedGroups(prev => ({ ...prev, ...initial }));
    }, []);

    return (
        <div className="ap-layout">
            {/* Sidebar */}
            <aside className={`ap-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
                {/* Logo */}
                <div className="ap-sidebar-logo">
                    <div className="ap-sidebar-logo-inner">
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
                    <button
                        className="ap-sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {sidebarOpen ? <PanelLeft size={16} /> : <Menu size={16} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="ap-sidebar-nav">
                    <div className="ap-sidebar-nav-list">
                        {navigation.map((entry, idx) => {
                            if (isNavGroup(entry)) {
                                const isExpanded = expandedGroups[entry.label];
                                const GroupIcon = entry.icon;

                                if (!sidebarOpen) {
                                    // Collapsed: show first active item or first item icon
                                    const activeItem = entry.items.find(i => i.active) || entry.items[0];
                                    const ActiveIcon = activeItem.icon;
                                    return (
                                        <a
                                            key={idx}
                                            href={activeItem.href}
                                            className={`ap-nav-item ${entry.active ? 'active' : ''}`}
                                            title={entry.label}
                                        >
                                            <GroupIcon size={18} className="ap-nav-icon" />
                                        </a>
                                    );
                                }

                                return (
                                    <div key={idx} className="ap-nav-group">
                                        <button
                                            className={`ap-nav-group-toggle ${entry.active ? 'active' : ''}`}
                                            onClick={() => toggleGroup(entry.label)}
                                        >
                                            <GroupIcon size={18} className="ap-nav-icon" />
                                            <span className="ap-nav-label">{entry.label}</span>
                                            <ChevronRight
                                                size={14}
                                                className={`ap-nav-chevron ${isExpanded ? 'expanded' : ''}`}
                                            />
                                        </button>
                                        <div className={`ap-nav-group-items ${isExpanded ? 'open' : ''}`}>
                                            {entry.items.map((item, subIdx) => {
                                                const SubIcon = item.icon;
                                                return (
                                                    <a
                                                        key={subIdx}
                                                        href={item.href}
                                                        className={`ap-nav-subitem ${item.active ? 'active' : ''}`}
                                                    >
                                                        <SubIcon size={15} className="ap-nav-icon" />
                                                        <span className="ap-nav-label">{item.label}</span>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            // Standalone item
                            const Icon = entry.icon;
                            return (
                                <a
                                    key={idx}
                                    href={entry.href}
                                    className={`ap-nav-item ${entry.active ? 'active' : ''}`}
                                    title={!sidebarOpen ? entry.label : undefined}
                                >
                                    <Icon size={18} className="ap-nav-icon" />
                                    {sidebarOpen && <span className="ap-nav-label">{entry.label}</span>}
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
                        <input type="text" placeholder="Search anything..." />
                        <kbd className="ap-topbar-kbd">&#8984;K</kbd>
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
