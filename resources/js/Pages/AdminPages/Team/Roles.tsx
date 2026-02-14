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

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

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
    color: string;
    lightColor: string;
    permissions: string[];
}

const ROLES: RoleDefinition[] = [
    {
        key: 'super_admin',
        label: 'Super Admin',
        description: 'Full unrestricted access to all sections and features of the admin panel. Can manage team members, system settings, and all platform data.',
        icon: Crown,
        color: THEME.primary,
        lightColor: '#e7f1ff',
        permissions: [...PERMISSIONS],
    },
    {
        key: 'content_moderator',
        label: 'Content Moderator',
        description: 'Manages user-generated content, moderates posts, reviews reports, oversees blog content, and handles contact submissions.',
        icon: FileEdit,
        color: THEME.warning,
        lightColor: '#fff8e1',
        permissions: ['Dashboard', 'Content', 'Reports', 'Blog', 'Contact'],
    },
    {
        key: 'user_manager',
        label: 'User Manager',
        description: 'Handles user account management, reviews user reports, and manages memorial and deceased verification processes.',
        icon: UserCog,
        color: THEME.success,
        lightColor: '#e8f5e9',
        permissions: ['Dashboard', 'Users', 'Reports', 'Memorial'],
    },
    {
        key: 'system_analyst',
        label: 'System Analyst',
        description: 'Monitors platform analytics, system health, security audits, and performance metrics to ensure smooth operations.',
        icon: BarChart3,
        color: THEME.info,
        lightColor: '#e0f7fa',
        permissions: ['Dashboard', 'Analytics', 'System', 'Security'],
    },
    {
        key: 'support_team',
        label: 'Support Team',
        description: 'Provides user support, manages contact submissions, reviews user reports, and assists with basic user account issues.',
        icon: HeadphonesIcon,
        color: '#6f42c1',
        lightColor: '#f3e8ff',
        permissions: ['Dashboard', 'Users', 'Contact', 'Reports'],
    },
];

export default function Roles() {
    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Premium Header Section with Gradient Background */}
                <div
                    style={{
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                        borderRadius: '20px',
                        padding: '2.5rem',
                        color: '#FFFFFF',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 16px 48px rgba(13, 110, 253, 0.20)',
                    }}
                >
                    {/* Background decoration */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-40px',
                            right: '-40px',
                            width: '200px',
                            height: '200px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '50%',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-60px',
                            left: '-60px',
                            width: '300px',
                            height: '300px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '50%',
                        }}
                    />

                    {/* Header Content */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <Shield size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Roles & Permissions
                            </h1>
                        </div>
                        <p
                            style={{
                                fontSize: '1.05rem',
                                color: 'rgba(255, 255, 255, 0.95)',
                                margin: 0,
                                maxWidth: '600px',
                                lineHeight: 1.6,
                                fontWeight: 500,
                            }}
                        >
                            Overview of admin roles and their access permissions across different sections of the platform
                        </p>
                    </div>
                </div>

                {/* Role Cards Grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                        gap: '1.75rem',
                        marginBottom: '3rem',
                    }}
                >
                    {ROLES.map((role) => {
                        const Icon = role.icon;
                        return (
                            <div
                                key={role.key}
                                style={{
                                    background: '#FFFFFF',
                                    borderRadius: '18px',
                                    border: `2.5px solid ${role.lightColor}`,
                                    overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                    position: 'relative',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = role.color;
                                    e.currentTarget.style.boxShadow = `0 20px 48px ${role.color}20, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = role.lightColor;
                                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {/* Card Header */}
                                <div
                                    style={{
                                        padding: '1.75rem 1.75rem 1.25rem',
                                        borderBottom: `1.5px solid ${role.lightColor}`,
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Background accent */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '120px',
                                            height: '120px',
                                            background: role.lightColor,
                                            borderRadius: '50%',
                                            opacity: 0.4,
                                            transform: 'translate(30%, -30%)',
                                        }}
                                    />

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '14px',
                                                    backgroundColor: role.lightColor,
                                                }}
                                            >
                                                <Icon size={24} color={role.color} strokeWidth={2} />
                                            </div>
                                            <div>
                                                <h3
                                                    style={{
                                                        margin: 0,
                                                        fontSize: '1.15rem',
                                                        fontWeight: 800,
                                                        color: '#0a0e27',
                                                    }}
                                                >
                                                    {role.label}
                                                </h3>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        marginTop: '0.25rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        color: role.color,
                                                        background: role.lightColor,
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '6px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                    }}
                                                >
                                                    {role.permissions.length} / {PERMISSIONS.length} sections
                                                </span>
                                            </div>
                                        </div>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: '0.88rem',
                                                color: '#6c757d',
                                                lineHeight: 1.55,
                                                fontWeight: 500,
                                            }}
                                        >
                                            {role.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Permissions List */}
                                <div style={{ padding: '1.25rem 1.75rem 1.75rem' }}>
                                    <p
                                        style={{
                                            margin: '0 0 0.85rem 0',
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            color: '#374151',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}
                                    >
                                        Section Access
                                    </p>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '0.45rem',
                                        }}
                                    >
                                        {PERMISSIONS.map((perm) => {
                                            const hasAccess = role.permissions.includes(perm);
                                            return (
                                                <div
                                                    key={perm}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.45rem',
                                                        padding: '0.35rem 0.5rem',
                                                        borderRadius: '8px',
                                                        background: hasAccess ? '#f0fdf4' : '#fafafa',
                                                        transition: 'background 0.2s ease',
                                                    }}
                                                >
                                                    {hasAccess ? (
                                                        <CheckCircle size={15} color={THEME.success} strokeWidth={2.5} />
                                                    ) : (
                                                        <XCircle size={15} color="#d1d5db" strokeWidth={2} />
                                                    )}
                                                    <span
                                                        style={{
                                                            fontSize: '0.82rem',
                                                            fontWeight: hasAccess ? 600 : 500,
                                                            color: hasAccess ? '#0a0e27' : '#9ca3af',
                                                        }}
                                                    >
                                                        {perm}
                                                    </span>
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
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <div style={{ padding: '1.75rem 2rem 1rem' }}>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: '1.25rem',
                                fontWeight: 800,
                                color: '#0a0e27',
                            }}
                        >
                            Permission Matrix
                        </h2>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#6c757d', fontWeight: 500 }}>
                            Complete overview of role access across all admin sections
                        </p>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB', borderTop: '2px solid #E5E7EB' }}>
                                    <th
                                        style={{
                                            padding: '1.25rem 1.5rem',
                                            textAlign: 'left',
                                            fontSize: '0.85rem',
                                            fontWeight: 800,
                                            color: '#374151',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            position: 'sticky',
                                            left: 0,
                                            background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                                            zIndex: 1,
                                            minWidth: '160px',
                                        }}
                                    >
                                        Section
                                    </th>
                                    {ROLES.map((role) => (
                                        <th
                                            key={role.key}
                                            style={{
                                                padding: '1.25rem 1rem',
                                                textAlign: 'center',
                                                fontSize: '0.8rem',
                                                fontWeight: 800,
                                                color: role.color,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                minWidth: '120px',
                                            }}
                                        >
                                            {role.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PERMISSIONS.map((perm, idx) => (
                                    <tr
                                        key={perm}
                                        style={{
                                            borderBottom: '1.5px solid #E5E7EB',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            background: idx % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#F0F4FF';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = idx % 2 === 0 ? '#FFFFFF' : '#FAFBFC';
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: '1rem 1.5rem',
                                                fontSize: '0.94rem',
                                                fontWeight: 700,
                                                color: '#0a0e27',
                                                position: 'sticky',
                                                left: 0,
                                                background: 'inherit',
                                                zIndex: 1,
                                            }}
                                        >
                                            {perm}
                                        </td>
                                        {ROLES.map((role) => {
                                            const hasAccess = role.permissions.includes(perm);
                                            return (
                                                <td
                                                    key={role.key}
                                                    style={{
                                                        padding: '1rem',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {hasAccess ? (
                                                        <CheckCircle size={20} color={THEME.success} strokeWidth={2.5} />
                                                    ) : (
                                                        <XCircle size={20} color="#d1d5db" strokeWidth={1.5} />
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
