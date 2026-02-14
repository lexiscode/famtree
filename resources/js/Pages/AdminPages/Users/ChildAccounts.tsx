import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Plus,
    Trash2,
    Users,
    Shield,
    CheckCircle,
} from 'lucide-react';

interface ChildAccount {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    username: string;
    email: string;
    status: string;
    profile_image_url: string | null;
    two_fa_enabled: boolean;
    created_at: string;
    created_at_formatted: string;
    onboarding_completed: boolean;
}

interface UserDetail {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
}

interface ChildStats {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    with_2fa: number;
}

interface Props {
    user: UserDetail;
    childAccounts: ChildAccount[];
    childStats: ChildStats;
}

interface AvatarProps {
    imageUrl: string | null;
    fullName: string;
}

function ChildAvatar({ imageUrl, fullName }: AvatarProps) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={fullName}
                className="ap-avatar"
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div className="ap-avatar ap-avatar-indigo">
            {fullName.charAt(0).toUpperCase()}
        </div>
    );
}

export default function ChildAccounts({ user, childAccounts, childStats }: Props) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(route('admin.users.createChildAccount', user.id), formData, {
            onSuccess: () => {
                setFormData({ first_name: '', last_name: '', username: '', email: '', password: '' });
                setShowCreateForm(false);
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleDelete = (childId: number) => {
        if (confirm('Are you sure you want to delete this child account? This action cannot be undone.')) {
            router.delete(route('admin.users.deleteChildAccount', { parentId: user.id, childId }));
        }
    };

    return (
        <AdminLayout>
            <div>
                {/* Page Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Child Accounts</h1>
                    <p className="ap-page-subtitle">
                        Manage and create child accounts for {user.first_name} {user.last_name}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Accounts', value: childStats.total, icon: Users, color: 'indigo' },
                        { label: 'Active', value: childStats.active, icon: CheckCircle, color: 'green' },
                        { label: 'Inactive', value: childStats.inactive, icon: Users, color: 'gray' },
                        { label: 'Suspended', value: childStats.suspended, icon: Users, color: 'red' },
                        { label: '2FA Enabled', value: childStats.with_2fa, icon: Shield, color: 'blue' },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="ap-stat-card">
                                <div className="ap-stat-card-header">
                                    <span className="ap-stat-label">{stat.label}</span>
                                    <span className={`ap-stat-icon ${stat.color}`}>
                                        <Icon size={20} />
                                    </span>
                                </div>
                                <span className="ap-stat-value">{stat.value}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Create Button */}
                {!showCreateForm && (
                    <div className="ap-mb-xl">
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="ap-btn ap-btn-primary"
                        >
                            <Plus size={18} />
                            Create New Child Account
                        </button>
                    </div>
                )}

                {/* Create Form */}
                {showCreateForm && (
                    <div className="ap-card-lg">
                        <h3 className="ap-card-title ap-mb-xl">Create New Child Account</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="ap-form-row ap-mb-lg">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Password (min 8 chars)</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        minLength={8}
                                        className="ap-form-input"
                                    />
                                </div>
                            </div>

                            <div className="ap-flex ap-gap-sm">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="ap-btn ap-btn-primary"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Account'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setFormData({ first_name: '', last_name: '', username: '', email: '', password: '' });
                                    }}
                                    className="ap-btn ap-btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Child Accounts Table */}
                <div className="ap-table-wrap">
                    {childAccounts.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th className="center">Status</th>
                                        <th>Joined</th>
                                        <th className="center">2FA</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {childAccounts.map((child) => (
                                        <tr key={child.id}>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <ChildAvatar imageUrl={child.profile_image_url} fullName={child.full_name} />
                                                    <div>
                                                        <span className="ap-user-cell-name">{child.full_name}</span>
                                                        <span className="ap-user-cell-sub">@{child.username}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="secondary">{child.email}</td>
                                            <td className="center">
                                                <span className={
                                                    child.status === 'active'
                                                        ? 'ap-badge ap-badge-success'
                                                        : child.status === 'suspended'
                                                            ? 'ap-badge ap-badge-danger'
                                                            : 'ap-badge ap-badge-neutral'
                                                }>
                                                    {child.status.charAt(0).toUpperCase() + child.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="secondary">{child.created_at}</td>
                                            <td className="center">
                                                <span className={child.two_fa_enabled ? 'ap-badge ap-badge-success' : 'ap-badge ap-badge-neutral'}>
                                                    {child.two_fa_enabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="center">
                                                <div className="ap-flex ap-items-center ap-gap-sm ap-justify-center">
                                                    <button
                                                        onClick={() => router.get(route('admin.users.show', child.id))}
                                                        className="ap-btn ap-btn-primary ap-btn-sm"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(child.id)}
                                                        className="ap-btn ap-btn-danger ap-btn-sm"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Users size={40} />
                            </div>
                            <p className="ap-empty-title">No child accounts created yet</p>
                            <p className="ap-empty-text">Create one using the button above</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
