import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Users, CheckCircle, Clock, Send, Inbox, Link2, MessageSquare } from 'lucide-react';

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

// Bootstrap theme colors
const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

// Avatar component with image and fallback to initials
interface AvatarProps {
    imageUrl: string | null;
    fullName: string;
}

function ConnectionAvatar({ imageUrl, fullName }: AvatarProps) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={fullName}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    display: 'block',
                }}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div
            style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
            }}
        >
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
                return { bg: '#E8F5E9', text: THEME.success, label: 'Connected', icon: CheckCircle };
            case 'pending':
                return { bg: '#FFF3E0', text: '#FF9800', label: 'Pending', icon: Clock };
            default:
                return { bg: '#F3F4F6', text: '#6c757d', label: 'Unknown', icon: Users };
        }
    };

    const getConnectionTypeIcon = (type: 'sent' | 'received') => {
        return type === 'sent' ? Send : Inbox;
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
            <div style={{ paddingBottom: '2rem' }}>
                {/* Premium Header Section with Gradient Background */}
                <div
                    style={{
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                        borderRadius: '20px',
                        padding: '2.5rem',
                        color: '#FFFFFF',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 16px 48px rgba(6, 182, 212, 0.20)',
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
                            <Link2 size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Connections
                            </h1>
                        </div>
                        <p
                            style={{
                                fontSize: '1.05rem',
                                color: 'rgba(255, 255, 255, 0.95)',
                                marginTop: '0.75rem',
                                margin: 0,
                                maxWidth: '600px',
                                lineHeight: 1.6,
                                fontWeight: 500,
                            }}
                        >
                            View and manage all connections for {user.first_name} {user.last_name}
                        </p>
                    </div>
                </div>

                {/* Premium Statistics */}
                <div style={{ paddingLeft: '2rem', paddingRight: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
                    {[
                        { label: 'Total Connections', value: stats.total, icon: Users, color: THEME.primary },
                        { label: 'Connected', value: stats.accepted, icon: CheckCircle, color: THEME.success },
                        { label: 'Pending', value: stats.pending, icon: Clock, color: THEME.warning },
                        { label: 'Sent', value: stats.sent, icon: Send, color: THEME.info },
                        { label: 'Received', value: stats.received, icon: Inbox, color: '#9C27B0' },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={idx}
                                style={{
                                    background: '#FFFFFF',
                                    border: `2.5px solid ${stat.color}20`,
                                    borderRadius: '16px',
                                    padding: '1.75rem',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = stat.color;
                                    e.currentTarget.style.boxShadow = `0 16px 40px ${stat.color}25, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = `${stat.color}20`;
                                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {/* Background accent */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '80px',
                                        height: '80px',
                                        background: `${stat.color}10`,
                                        borderRadius: '50%',
                                        transform: 'translate(30%, -30%)',
                                    }}
                                />

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                                            <p style={{ fontSize: '1.9rem', fontWeight: 800, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '14px', backgroundColor: `${stat.color}15` }}>
                                            <Icon size={30} color={stat.color} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Premium Filter Buttons */}
                <div style={{ paddingLeft: '2rem', paddingRight: '2rem', marginBottom: '2.5rem', display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                    {(['all', 'accepted', 'pending'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setFilterStatus(filter)}
                            style={{
                                padding: '0.65rem 1.25rem',
                                border: filterStatus === filter ? `2.5px solid ${THEME.primary}` : '2px solid #E5E7EB',
                                background: filterStatus === filter ? `linear-gradient(135deg, ${THEME.primary} 0%, #0891b2 100%)` : '#FFFFFF',
                                color: filterStatus === filter ? '#FFFFFF' : '#0a0e27',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.92rem',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                textTransform: 'capitalize',
                                boxShadow: filterStatus === filter ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                letterSpacing: '0.3px',
                            }}
                            onMouseEnter={(e) => {
                                if (filterStatus !== filter) {
                                    e.currentTarget.style.borderColor = THEME.primary;
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}20`;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (filterStatus !== filter) {
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                                }
                            }}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Premium Connections List */}
                <div style={{ marginLeft: '2rem', marginRight: '2rem', background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    {filteredConnections.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Relationship</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredConnections.map((conn, idx) => {
                                        const badge = getStatusBadge(conn.status);
                                        const TypeIcon = getConnectionTypeIcon(conn.connection_type);
                                        return (
                                            <tr
                                                key={conn.id}
                                                style={{
                                                    borderBottom: '1.5px solid #E5E7EB',
                                                    background: '#FFFFFF',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#F9FAFB';
                                                    e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(6, 182, 212, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = '#FFFFFF';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <td style={{ padding: '1.2rem 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <ConnectionAvatar imageUrl={conn.other_user.profile_image_url} fullName={conn.other_user.full_name} />
                                                        <div>
                                                            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a0e27', margin: 0 }}>{conn.other_user.full_name}</p>
                                                            <p style={{ fontSize: '0.85rem', color: '#888', margin: 0, marginTop: '0.25rem' }}>@{conn.other_user.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.95rem', color: '#666' }}>
                                                    {conn.relationship_type || 'Not specified'}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <TypeIcon size={16} color={conn.connection_type === 'sent' ? THEME.info : '#9C27B0'} />
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a0e27', textTransform: 'capitalize' }}>
                                                            {conn.connection_type}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            padding: '0.5rem 0.75rem',
                                                            borderRadius: '8px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600,
                                                            backgroundColor: badge.bg,
                                                            color: badge.text,
                                                        }}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.95rem', color: '#666' }}>
                                                    {conn.status === 'accepted' ? conn.accepted_at_formatted : conn.requested_at_formatted}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        <button
                                                            onClick={() => router.get(route('admin.users.show', conn.other_user.id))}
                                                            style={{
                                                                padding: '0.4rem 0.8rem',
                                                                background: 'transparent',
                                                                border: `1.5px solid ${THEME.primary}`,
                                                                borderRadius: '6px',
                                                                color: THEME.primary,
                                                                fontSize: '0.9rem',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = THEME.primary;
                                                                e.currentTarget.style.color = '#FFFFFF';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'transparent';
                                                                e.currentTarget.style.color = THEME.primary;
                                                            }}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveConnection(conn.id)}
                                                            style={{
                                                                padding: '0.4rem 0.8rem',
                                                                background: 'transparent',
                                                                border: `1.5px solid ${THEME.danger}`,
                                                                borderRadius: '6px',
                                                                color: THEME.danger,
                                                                fontSize: '0.9rem',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = THEME.danger;
                                                                e.currentTarget.style.color = '#FFFFFF';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'transparent';
                                                                e.currentTarget.style.color = THEME.danger;
                                                            }}
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
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: '#F3F4F6',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                }}
                            >
                                <Link2 size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No connections found
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                This user doesn't have any {filterStatus !== 'all' ? filterStatus : ''} connections yet
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
