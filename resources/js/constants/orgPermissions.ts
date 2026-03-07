export const AVAILABLE_PERMISSIONS = [
    { key: 'manage_posts', label: 'Manage Posts' },
    { key: 'manage_broadcasts', label: 'Manage Broadcasts' },
    { key: 'manage_group_broadcasts', label: 'Manage Group Broadcasts' },
    { key: 'manage_staff', label: 'Manage Staff' },
    { key: 'view_analytics', label: 'View Analytics' },
    { key: 'manage_groups', label: 'Manage Groups' },
    { key: 'manage_org_groups', label: 'Manage Org Groups' },
    { key: 'manage_profile', label: 'Manage Profile' },
];

export const PERMISSION_TEMPLATES = [
    {
        name: 'Union Leader',
        description: 'For SUG presidents and union heads — can manage their group and send broadcasts',
        permissions: {
            manage_broadcasts: true,
            manage_group_broadcasts: true,
            manage_org_groups: true,
            manage_profile: true,
        },
        broadcastYearLimit: 5,
    },
    {
        name: 'Group Moderator',
        description: 'Can manage group membership and view analytics, but cannot broadcast',
        permissions: {
            manage_org_groups: true,
            view_analytics: true,
            manage_profile: true,
        },
        broadcastYearLimit: null,
    },
    {
        name: 'Content Manager',
        description: 'Can manage posts and broadcasts across the organization',
        permissions: {
            manage_posts: true,
            manage_broadcasts: true,
            manage_group_broadcasts: true,
            view_analytics: true,
            manage_profile: true,
        },
        broadcastYearLimit: null,
    },
    {
        name: 'Staff Admin',
        description: 'Full staff and role management access',
        permissions: {
            manage_staff: true,
            manage_groups: true,
            manage_org_groups: true,
            view_analytics: true,
            manage_profile: true,
        },
        broadcastYearLimit: null,
    },
];
