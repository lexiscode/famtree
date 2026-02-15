import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import UserActionModal from '@/Components/AdminComponents/UserActionModal';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, Users, Lock, CheckCircle, AlertCircle, Clock, MoreVertical } from 'lucide-react';

interface UserDetail {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone: string | null;
    address: string | null;
    bio: string | null;
    date_of_birth: string | null;
    death_date: string | null;
    gender: string | null;
    status: string;
    profile_image_url: string | null;
    two_fa_enabled: boolean;
    onboarding_completed: boolean;
    is_child_account: boolean;
    parent_user_id: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    scheduled_deletion_at: string | null;
    childrenCount: number;
    connectionsCount: number;
}

interface Props {
    user: UserDetail;
}

const statusConfig = {
    active: { badgeClass: 'ap-badge-success', label: 'Active', icon: CheckCircle },
    inactive: { badgeClass: 'ap-badge-neutral', label: 'Inactive', icon: Clock },
    suspended: { badgeClass: 'ap-badge-danger', label: 'Suspended', icon: AlertCircle },
};

interface AvatarProps {
    imageUrl: string | null;
    fullName: string;
    size?: 'small' | 'large';
}

function UserAvatar({ imageUrl, fullName, size = 'small' }: AvatarProps) {
    const [imageError, setImageError] = useState(false);

    const sizeClass = size === 'large' ? 'ap-avatar-xl' : 'ap-avatar-lg';

    if (imageUrl && !imageError) {
        return (
            <div className={`ap-avatar ${sizeClass}`}>
                <img src={imageUrl} alt={fullName} onError={() => setImageError(true)} />
            </div>
        );
    }

    return (
        <div className={`ap-avatar ${sizeClass} ap-avatar-indigo`}>
            {fullName.charAt(0).toUpperCase()}
        </div>
    );
}

export default function Show({ user }: Props) {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');
    const [openModal, setOpenModal] = useState<string | null>(null);
    const [showActions, setShowActions] = useState(false);

    const statusConfig_ = statusConfig[user.account_status as keyof typeof statusConfig] || statusConfig.inactive;
    const StatusIcon = statusConfig_.icon;

    const getAvailableActions = () => {
        const actions: { label: string; type: any; color: string; isDangerous: boolean }[] = [];
        if (user.account_status === 'active') {
            actions.push({ label: 'Suspend', type: 'suspend', color: '#DC2626', isDangerous: true });
            actions.push({ label: 'Deactivate', type: 'deactivate', color: '#6B7280', isDangerous: false });
        }
        if (user.account_status === 'suspended') {
            actions.push({ label: 'Unsuspend', type: 'unsuspend', color: '#16A34A', isDangerous: false });
        }
        if (!user.deleted_at) {
            actions.push({ label: 'Ban User', type: 'ban', color: '#DC2626', isDangerous: true });
        }
        if (!user.scheduled_deletion_at && !user.deleted_at) {
            actions.push({ label: 'Schedule Deletion', type: 'schedule-delete', color: '#DC2626', isDangerous: true });
        }
        if (user.scheduled_deletion_at && !user.deleted_at) {
            actions.push({ label: 'Cancel Deletion', type: 'cancel-delete', color: '#0052E8', isDangerous: false });
        }
        return actions;
    };

    const getSecurityActions = () => {
        const actions: { label: string; type: any; btnClass: string }[] = [];
        actions.push({ label: 'Reset Password', type: 'reset-password', btnClass: 'ap-btn ap-btn-primary ap-btn-sm' });
        if (user.two_fa_enabled) {
            actions.push({ label: 'Disable 2FA', type: 'disable-2fa', btnClass: 'ap-btn ap-btn-danger ap-btn-sm' });
        } else {
            actions.push({ label: 'Enable 2FA', type: 'enable-2fa', btnClass: 'ap-btn ap-btn-success ap-btn-sm' });
        }
        if (!user.onboarding_completed) {
            actions.push({ label: 'Complete Onboarding', type: 'complete-onboarding', btnClass: 'ap-btn ap-btn-success ap-btn-sm' });
        } else {
            actions.push({ label: 'Reset Onboarding', type: 'reset-onboarding', btnClass: 'ap-btn ap-btn-danger ap-btn-sm' });
        }
        return actions;
    };

    return (
        <AdminLayout>
            <div>
                {/* Back Button + Header */}
                <button className="ap-back-btn" onClick={() => router.get(route('admin.users.index'))}>
                    <ArrowLeft size={16} />
                    Back to Users
                </button>

                <div className="ap-page-header">
                    <h1 className="ap-page-title">User Details</h1>
                    <p className="ap-page-subtitle">View and manage user account information</p>
                </div>

                {/* User Header Card */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-flex ap-items-start ap-justify-between ap-gap-lg ap-flex-wrap">
                        <div className="ap-flex ap-items-center ap-gap-lg ap-flex-1">
                            <UserAvatar imageUrl={user.profile_image_url} fullName={`${user.first_name} ${user.last_name}`} size="large" />
                            <div className="ap-flex-1">
                                <h2 className="ap-page-title">{user.first_name} {user.last_name}</h2>
                                <p className="ap-page-subtitle">@{user.username}</p>
                                <div className="ap-mt-sm">
                                    <span className={`ap-badge ${statusConfig_.badgeClass}`}>
                                        <StatusIcon size={12} />
                                        {statusConfig_.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="ap-flex-col ap-items-end ap-gap-md">
                            <div className="ap-card">
                                <p className="ap-stat-label">Joined</p>
                                <p className="ap-font-semibold">{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="ap-dropdown">
                                <button className="ap-btn ap-btn-secondary ap-btn-icon" onClick={() => setShowActions(!showActions)}>
                                    <MoreVertical size={16} />
                                </button>
                                {showActions && (
                                    <div className="ap-dropdown-menu">
                                        {getAvailableActions().map((action) => (
                                            <button
                                                key={action.type}
                                                className={`ap-dropdown-item ${action.isDangerous ? 'danger' : ''}`}
                                                onClick={() => {
                                                    setOpenModal(action.type);
                                                    setShowActions(false);
                                                }}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Account Type', value: user.is_child_account ? 'Child' : 'Primary', colorClass: 'indigo' },
                        { label: '2FA Status', value: user.two_fa_enabled ? 'Enabled' : 'Disabled', colorClass: user.two_fa_enabled ? 'green' : 'blue' },
                        { label: 'Connections', value: user.connectionsCount.toString(), colorClass: 'blue', clickable: true },
                        { label: 'Child Accounts', value: user.childrenCount.toString(), colorClass: 'indigo', clickable: true },
                    ].map((stat, idx) => (
                        <div
                            key={idx}
                            className={`ap-stat-card ${stat.clickable ? 'ap-cursor-pointer' : ''}`}
                            onClick={() => {
                                if (stat.clickable) {
                                    if (stat.label === 'Child Accounts') {
                                        router.get(route('admin.users.childAccounts', user.id));
                                    } else if (stat.label === 'Connections') {
                                        router.get(route('admin.users.connections', user.id));
                                    }
                                }
                            }}
                        >
                            <div className="ap-stat-card-header">
                                <div className={`ap-stat-icon ${stat.colorClass}`}>
                                    <Users size={20} />
                                </div>
                            </div>
                            <p className="ap-stat-label">{stat.label}</p>
                            <p className="ap-stat-value">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="ap-tabs">
                    {(['profile', 'security', 'activity'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`ap-tab ${activeTab === tab ? 'active' : ''}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="ap-card ap-card-lg">
                        <div className="ap-form-row">
                            {[
                                { label: 'Email Address', value: user.email, icon: Mail },
                                { label: 'Phone', value: user.phone || 'Not provided', icon: Phone },
                                { label: 'Date of Birth', value: user.date_of_birth || 'Not provided', icon: Calendar },
                                { label: 'Gender', value: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified', icon: Users },
                            ].map((field, idx) => {
                                const Icon = field.icon;
                                return (
                                    <div key={idx} className="ap-mb-lg">
                                        <p className="ap-filter-label">{field.label}</p>
                                        <div className="ap-detail-row">
                                            <Icon size={16} className="ap-shrink-0" />
                                            <span className="ap-detail-value">{field.value}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {user.address && (
                            <div className="ap-mb-lg">
                                <p className="ap-filter-label">Address</p>
                                <div className="ap-detail-row">
                                    <MapPin size={16} className="ap-shrink-0" />
                                    <span className="ap-detail-value">{user.address}</span>
                                </div>
                            </div>
                        )}
                        {user.bio && (
                            <div>
                                <p className="ap-filter-label">Bio</p>
                                <div className="ap-detail-row">
                                    <span className="ap-detail-value">{user.bio}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="ap-card ap-card-lg">
                        <div className="ap-section">
                            <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                                <Shield size={18} />
                                Two-Factor Authentication
                            </h3>
                            <div className="ap-detail-row">
                                <span className="ap-detail-label">Status</span>
                                <span className={`ap-badge ${user.two_fa_enabled ? 'ap-badge-success' : 'ap-badge-neutral'}`}>
                                    {user.two_fa_enabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>

                        <hr className="ap-divider" />

                        <div className="ap-section">
                            <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                                <Lock size={18} />
                                Password Management
                            </h3>
                            <button className="ap-btn ap-btn-primary" onClick={() => setOpenModal('reset-password')}>
                                Reset Password
                            </button>
                        </div>

                        <hr className="ap-divider" />

                        <div className="ap-section">
                            <h3 className="ap-section-title">Account Actions</h3>
                            <div className="ap-flex ap-gap-sm ap-flex-wrap">
                                {getSecurityActions().map((action) => (
                                    <button
                                        key={action.type}
                                        className={action.btnClass}
                                        onClick={() => setOpenModal(action.type)}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {user.deleted_at && (
                            <div className="ap-alert ap-alert-danger ap-mt-lg">
                                <AlertCircle size={16} />
                                <div>
                                    <p className="ap-alert-title">Account Deleted</p>
                                    <p className="ap-alert-text">
                                        This account was deleted on <strong>{new Date(user.deleted_at).toLocaleDateString()}</strong>
                                    </p>
                                </div>
                            </div>
                        )}

                        {user.scheduled_deletion_at && (
                            <div className="ap-alert ap-alert-warning ap-mt-lg">
                                <Clock size={16} />
                                <div>
                                    <p className="ap-alert-title">Scheduled for Deletion</p>
                                    <p className="ap-alert-text">
                                        Scheduled for deletion on <strong>{new Date(user.scheduled_deletion_at).toLocaleDateString()}</strong>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <div className="ap-card ap-card-lg">
                        {[
                            { label: 'Account Created', value: new Date(user.created_at).toLocaleDateString() + ' at ' + new Date(user.created_at).toLocaleTimeString(), icon: Calendar },
                            { label: 'Last Updated', value: new Date(user.updated_at).toLocaleDateString() + ' at ' + new Date(user.updated_at).toLocaleTimeString(), icon: Calendar },
                            { label: 'Onboarding Status', value: user.onboarding_completed ? 'Completed' : 'Incomplete', icon: CheckCircle },
                        ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div key={idx} className="ap-detail-row">
                                    <span className="ap-detail-label ap-flex ap-items-center ap-gap-sm">
                                        <Icon size={14} />
                                        {item.label}
                                    </span>
                                    <span className="ap-detail-value">{item.value}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Action Modal */}
                {openModal && (
                    <UserActionModal
                        isOpen={!!openModal}
                        onClose={() => setOpenModal(null)}
                        userId={user.id}
                        actionType={openModal as any}
                        userName={`${user.first_name} ${user.last_name}`}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
