import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    GitBranch,
    Users,
    Eye,
    EyeOff,
    GitMerge,
    Shield,
    MessageSquare,
    Calendar,
    Trash2,
    Clock,
    Mail,
    User,
} from 'lucide-react';

interface TreeMember {
    id: number;
    full_name: string;
    username: string;
    role: string;
    joined_at: string;
}

interface TreeAdmin {
    id: number;
    full_name: string;
    username: string;
}

interface TreeDetail {
    id: number;
    name: string;
    description: string | null;
    is_public: boolean;
    type: string;
    is_merged: boolean;
    root_user: { id: number; full_name: string; username: string; email: string } | null;
    members: TreeMember[];
    admins: TreeAdmin[];
    chat_stats: { message_count: number; last_activity: string | null };
    created_at: string;
}

interface Props {
    tree: TreeDetail;
}

export default function Show({ tree }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleToggleVisibility = () => {
        router.post(route('admin.familyTrees.toggleVisibility', tree.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        router.delete(route('admin.familyTrees.destroy', tree.id), {
            onSuccess: () => {
                setShowDeleteConfirm(false);
            },
        });
    };

    return (
        <AdminLayout>
            <div>
                {/* Back Button + Header */}
                <button
                    className="ap-back-btn"
                    onClick={() => router.get(route('admin.familyTrees.index'))}
                >
                    <ArrowLeft size={16} strokeWidth={2} />
                    Back to Family Trees
                </button>

                <div className="ap-page-header">
                    <h1 className="ap-page-title">Family Tree Details</h1>
                    <p className="ap-page-subtitle">View and manage family tree information</p>
                </div>

                {/* Tree Info Card */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-flex ap-items-start ap-justify-between ap-gap-lg ap-flex-wrap">
                        <div className="ap-flex ap-items-center ap-gap-lg ap-flex-1">
                            <div className="ap-avatar ap-avatar-xl ap-avatar-indigo">
                                <GitBranch size={28} strokeWidth={1.5} />
                            </div>
                            <div className="ap-flex-1">
                                <h2 className="ap-page-title">{tree.name}</h2>
                                {tree.description && (
                                    <p className="ap-page-subtitle ap-mt-sm">{tree.description}</p>
                                )}
                                <div className="ap-meta-row">
                                    <span className={`ap-badge ${tree.is_public ? 'ap-badge-success' : 'ap-badge-warning'}`}>
                                        {tree.is_public ? <Eye size={12} /> : <EyeOff size={12} />}
                                        {tree.is_public ? 'Public' : 'Private'}
                                    </span>
                                    <span className="ap-badge ap-badge-primary ap-capitalize">
                                        {tree.type}
                                    </span>
                                    {tree.is_merged && (
                                        <span className="ap-badge ap-badge-info">
                                            <GitMerge size={12} />
                                            Merged
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="ap-card">
                            <p className="ap-stat-label">Created</p>
                            <p className="ap-stat-value">{new Date(tree.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Members', value: tree.members.length, icon: Users, colorClass: 'indigo' },
                        { label: 'Tree Admins', value: tree.admins.length, icon: Shield, colorClass: 'green' },
                        { label: 'Chat Messages', value: tree.chat_stats.message_count, icon: MessageSquare, colorClass: 'blue' },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="ap-stat-card">
                                <div className="ap-stat-card-header">
                                    <p className="ap-stat-label">{stat.label}</p>
                                    <div className={`ap-stat-icon ${stat.colorClass}`}>
                                        <Icon size={20} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <p className="ap-stat-value">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Root User Card */}
                {tree.root_user && (
                    <div className="ap-card ap-card-lg ap-mb-xl">
                        <div className="ap-card-header">
                            <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                                <User size={18} />
                                Root User
                            </h3>
                        </div>
                        <div className="ap-form-row">
                            {[
                                { label: 'Full Name', value: tree.root_user.full_name },
                                { label: 'Username', value: `@${tree.root_user.username}` },
                                { label: 'Email', value: tree.root_user.email },
                            ].map((field, idx) => (
                                <div key={idx}>
                                    <div className="ap-detail-row">
                                        <span className="ap-detail-label">{field.label}</span>
                                        <span className="ap-detail-value">{field.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Members Table */}
                <div className="ap-section">
                    <div className="ap-table-wrap">
                        <div className="ap-card-header ap-card-header-sm">
                            <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                                <Users size={18} />
                                Members ({tree.members.length})
                            </h3>
                        </div>

                        {tree.members.length > 0 ? (
                            <div className="ap-table-scroll">
                                <table className="ap-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Username</th>
                                            <th>Role</th>
                                            <th>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tree.members.map((member) => (
                                            <tr key={member.id}>
                                                <td>
                                                    <span className="ap-font-semibold">{member.full_name}</span>
                                                </td>
                                                <td className="secondary">@{member.username}</td>
                                                <td>
                                                    <span className={`ap-badge ${member.role === 'admin' ? 'ap-badge-primary' : 'ap-badge-neutral'}`}>
                                                        {member.role}
                                                    </span>
                                                </td>
                                                <td className="secondary">{member.joined_at}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="ap-empty">
                                <div className="ap-empty-icon">
                                    <Users size={28} strokeWidth={1.5} />
                                </div>
                                <p className="ap-empty-title">No members found</p>
                                <p className="ap-empty-text">This tree does not have any members yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Admins List */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-card-header">
                        <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                            <Shield size={18} />
                            Tree Admins ({tree.admins.length})
                        </h3>
                    </div>

                    {tree.admins.length > 0 ? (
                        <div className="ap-scroll-list">
                            {tree.admins.map((admin) => (
                                <div key={admin.id} className="ap-list-item">
                                    <div className="ap-avatar ap-avatar-md ap-avatar-indigo">
                                        {admin.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="ap-user-cell-name">{admin.full_name}</p>
                                        <p className="ap-user-cell-sub">@{admin.username}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="ap-text-secondary ap-text-sm">No admins assigned to this tree</p>
                    )}
                </div>

                {/* Chat Statistics Card */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-card-header">
                        <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                            <MessageSquare size={18} />
                            Chat Statistics
                        </h3>
                    </div>
                    <div className="ap-form-row">
                        <div className="ap-detail-row">
                            <span className="ap-detail-label">Total Messages</span>
                            <span className="ap-detail-value ap-font-semibold">{tree.chat_stats.message_count}</span>
                        </div>
                        <div className="ap-detail-row">
                            <span className="ap-detail-label">Last Activity</span>
                            <span className="ap-detail-value">
                                {tree.chat_stats.last_activity ? new Date(tree.chat_stats.last_activity).toLocaleString() : 'No activity yet'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="ap-flex ap-gap-md ap-flex-wrap">
                    <button
                        className={`ap-btn ${tree.is_public ? 'ap-btn-warning' : 'ap-btn-success'}`}
                        onClick={handleToggleVisibility}
                    >
                        {tree.is_public ? <EyeOff size={16} /> : <Eye size={16} />}
                        {tree.is_public ? 'Make Private' : 'Make Public'}
                    </button>

                    <button
                        className="ap-btn ap-btn-danger"
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        <Trash2 size={16} />
                        Delete Tree
                    </button>
                </div>

                {/* Delete Confirmation Dialog */}
                {showDeleteConfirm && (
                    <div className="ap-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                        <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="ap-text-center ap-mb-xl">
                                <div className="ap-empty-icon ap-empty-icon-inline">
                                    <Trash2 size={28} />
                                </div>
                                <h3 className="ap-modal-title">Delete Family Tree</h3>
                                <p className="ap-modal-subtitle">
                                    Are you sure you want to delete <strong>{tree.name}</strong>? This action cannot be undone and will remove all associated data.
                                </p>
                            </div>
                            <div className="ap-modal-footer">
                                <button
                                    className="ap-btn ap-btn-secondary"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="ap-btn ap-btn-danger"
                                    onClick={handleDelete}
                                >
                                    Delete Tree
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
