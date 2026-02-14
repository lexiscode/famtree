import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Users, CheckCircle, Clock, Send, Inbox, Link2 } from 'lucide-react';

interface Connection {
    id: number;
    connection_type: 'sent' | 'received';
    other_user: {
        id: number;
        first_name: string;
        last_name: string;
        full_name: string;
        username: string;
        email: string;
        profile_image_url: string | null;
    };
    relationship_type: string;
    status: string;
    requested_at: string;
    requested_at_formatted: string;
    accepted_at: string | null;
    accepted_at_formatted: string;
    created_at: string;
    created_at_formatted: string;
}

interface UserDetail {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
}

interface ConnectionStats {
    total: number;
    accepted: number;
    pending: number;
    sent: number;
    received: number;
}

interface Props {
    user: UserDetail;
    connections: Connection[];
    stats: ConnectionStats;
}

interface AvatarProps {
    imageUrl: string | null;
    fullName: string;
}

function ConnectionAvatar({ imageUrl, fullName }: AvatarProps) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <div className="ap-avatar ap-avatar-lg">
                <img src={imageUrl} alt={fullName} onError={() => setImageError(true)} />
            </div>
        );
    }

    return (
        <div className="ap-avatar ap-avatar-lg ap-avatar-indigo">
            {fullName.charAt(0).toUpperCase()}
        </div>
    );
}

export default function Connections({ user, connections, stats }: Props) {
    const [filterStatus, setFilterStatus] = useState<'all' | 'accepted' | 'pending'>('all');

    const filteredConnections = connections.filter(conn => {
        if (filterStatus === 'all') return true;
        return conn.status === filterStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return { className: 'ap-badge ap-badge-success', label: 'Connected' };
            case 'pending':
                return { className: 'ap-badge ap-badge-warning', label: 'Pending' };
            default:
                return { className: 'ap-badge ap-badge-neutral', label: 'Unknown' };
        }
    };

    const handleRemoveConnection = (connectionId: number) => {
        if (confirm('Are you sure you want to remove this connection?')) {
            router.delete(route('admin.users.removeConnection', { id: user.id, connectionId }), {
                onSuccess: () => {
                    // The page will reload automatically
                },
            });
        }
    };

    return (
        <AdminLayout>
            {/* Back Button + Header */}
            <button className="ap-back-btn" onClick={() => router.get(route('admin.users.show', user.id))}>
                <ArrowLeft size={16} />
                Back to User
            </button>

            <div className="ap-page-header">
                <h1 className="ap-page-title">Connections</h1>
                <p className="ap-page-subtitle">View and manage all connections for {user.first_name} {user.last_name}</p>
            </div>

            {/* Stats */}
            <div className="ap-stats-grid">
                {[
                    { label: 'Total Connections', value: stats.total, icon: Users, colorClass: 'indigo' },
                    { label: 'Connected', value: stats.accepted, icon: CheckCircle, colorClass: 'green' },
                    { label: 'Pending', value: stats.pending, icon: Clock, colorClass: 'amber' },
                    { label: 'Sent', value: stats.sent, icon: Send, colorClass: 'blue' },
                    { label: 'Received', value: stats.received, icon: Inbox, colorClass: 'purple' },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div className={`ap-stat-icon ${stat.colorClass}`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                            <p className="ap-stat-label">{stat.label}</p>
                            <p className="ap-stat-value">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Filter Buttons */}
            <div className="ap-filter-bar">
                {(['all', 'accepted', 'pending'] as const).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setFilterStatus(filter)}
                        className={`ap-btn ${filterStatus === filter ? 'ap-btn-primary' : 'ap-btn-secondary'} ap-capitalize`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Connections Table */}
            <div className="ap-table-wrap">
                {filteredConnections.length > 0 ? (
                    <div className="ap-table-scroll">
                        <table className="ap-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Relationship</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredConnections.map((conn) => {
                                    const badge = getStatusBadge(conn.status);
                                    return (
                                        <tr key={conn.id}>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <ConnectionAvatar imageUrl={conn.other_user.profile_image_url} fullName={conn.other_user.full_name} />
                                                    <div>
                                                        <p className="ap-user-cell-name">{conn.other_user.full_name}</p>
                                                        <p className="ap-user-cell-sub">@{conn.other_user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="secondary">
                                                {conn.relationship_type || 'Not specified'}
                                            </td>
                                            <td>
                                                <span className={`ap-badge ${conn.connection_type === 'sent' ? 'ap-badge-info' : 'ap-badge-primary'} ap-capitalize`}>
                                                    {conn.connection_type}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={badge.className}>{badge.label}</span>
                                            </td>
                                            <td className="secondary">
                                                {conn.status === 'accepted' ? conn.accepted_at_formatted : conn.requested_at_formatted}
                                            </td>
                                            <td>
                                                <div className="ap-flex ap-gap-sm">
                                                    <button
                                                        className="ap-btn ap-btn-primary ap-btn-sm"
                                                        onClick={() => router.get(route('admin.users.show', conn.other_user.id))}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className="ap-btn ap-btn-danger ap-btn-sm"
                                                        onClick={() => handleRemoveConnection(conn.id)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="ap-empty">
                        <div className="ap-empty-icon">
                            <Link2 size={28} />
                        </div>
                        <p className="ap-empty-title">No connections found</p>
                        <p className="ap-empty-text">
                            This user doesn't have any {filterStatus !== 'all' ? filterStatus : ''} connections yet
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
