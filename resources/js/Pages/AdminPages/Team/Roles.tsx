import AdminLayout from '@/Layouts/AdminLayout';
import {
    Shield,
    CheckCircle,
    XCircle,
    Crown,
    FileEdit,
    UserCog,
    BarChart3,
    HeadphonesIcon,
} from 'lucide-react';

const PERMISSIONS = [
    'Dashboard',
    'Users',
    'Organizations',
    'Content',
    'Reports',
    'Blog',
    'Contact',
    'Memorial',
    'Messaging',
    'Family Trees',
    'Groups',
    'Analytics',
    'Security',
    'Notifications',
    'System',
    'Public Pages',
    'Settings',
    'Team',
];

interface RoleDefinition {
    key: string;
    label: string;
    description: string;
    icon: any;
    permissions: string[];
}

const ROLES: RoleDefinition[] = [
    {
        key: 'super_admin',
        label: 'Super Admin',
        description: 'Full unrestricted access to all sections and features of the admin panel. Can manage team members, system settings, and all platform data.',
        icon: Crown,
        permissions: [...PERMISSIONS],
    },
    {
        key: 'content_moderator',
        label: 'Content Moderator',
        description: 'Manages user-generated content, moderates posts, reviews reports, oversees blog content, and handles contact submissions.',
        icon: FileEdit,
        permissions: ['Dashboard', 'Content', 'Reports', 'Blog', 'Contact'],
    },
    {
        key: 'user_manager',
        label: 'User Manager',
        description: 'Handles user account management, reviews user reports, and manages memorial and deceased verification processes.',
        icon: UserCog,
        permissions: ['Dashboard', 'Users', 'Reports', 'Memorial'],
    },
    {
        key: 'system_analyst',
        label: 'System Analyst',
        description: 'Monitors platform analytics, system health, security audits, and performance metrics to ensure smooth operations.',
        icon: BarChart3,
        permissions: ['Dashboard', 'Analytics', 'System', 'Security'],
    },
    {
        key: 'support_team',
        label: 'Support Team',
        description: 'Provides user support, manages contact submissions, reviews user reports, and assists with basic user account issues.',
        icon: HeadphonesIcon,
        permissions: ['Dashboard', 'Users', 'Contact', 'Reports'],
    },
];

export default function Roles() {
    return (
        <AdminLayout>
            <div>
                {/* Page Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Roles & Permissions</h1>
                    <p className="ap-page-subtitle">Overview of admin roles and their access permissions across different sections of the platform</p>
                </div>

                {/* Role Cards Grid */}
                <div className="ap-stats-grid ap-mb-xl">
                    {ROLES.map((role) => {
                        const Icon = role.icon;
                        return (
                            <div key={role.key} className="ap-card ap-card-lg">
                                <div className="ap-card-header">
                                    <div className="ap-flex ap-items-center ap-gap-sm">
                                        <Icon size={20} className="ap-icon-primary" />
                                        <h3 className="ap-card-title">{role.label}</h3>
                                    </div>
                                    <span className="ap-badge ap-badge-primary">
                                        {role.permissions.length} / {PERMISSIONS.length} sections
                                    </span>
                                </div>
                                <p className="ap-text-secondary ap-text-sm ap-mb-lg">
                                    {role.description}
                                </p>

                                <div>
                                    <p className="ap-form-label">Section Access</p>
                                    <div className="ap-permission-grid">
                                        {PERMISSIONS.map((perm) => {
                                            const hasAccess = role.permissions.includes(perm);
                                            return (
                                                <div
                                                    key={perm}
                                                    className={`ap-permission-item ${hasAccess ? 'granted' : 'denied'}`}
                                                >
                                                    {hasAccess ? (
                                                        <CheckCircle size={15} className="ap-icon-success" />
                                                    ) : (
                                                        <XCircle size={15} className="ap-text-tertiary" />
                                                    )}
                                                    <span>{perm}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Permission Matrix Table */}
                <div className="ap-table-wrap">
                    <div className="ap-card-header" style={{ padding: '1.25rem 1rem 0.75rem' }}>
                        <div>
                            <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                                <Shield size={18} className="ap-icon-primary" />
                                Permission Matrix
                            </h3>
                            <p className="ap-text-secondary ap-text-sm">
                                Complete overview of role access across all admin sections
                            </p>
                        </div>
                    </div>
                    <div className="ap-table-scroll">
                        <table className="ap-table">
                            <thead>
                                <tr>
                                    <th>Section</th>
                                    {ROLES.map((role) => (
                                        <th key={role.key} className="center">{role.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PERMISSIONS.map((perm) => (
                                    <tr key={perm}>
                                        <td className="ap-font-semibold">{perm}</td>
                                        {ROLES.map((role) => {
                                            const hasAccess = role.permissions.includes(perm);
                                            return (
                                                <td key={role.key} className="center">
                                                    {hasAccess ? (
                                                        <CheckCircle size={18} className="ap-icon-success" />
                                                    ) : (
                                                        <XCircle size={18} className="ap-text-tertiary" />
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
