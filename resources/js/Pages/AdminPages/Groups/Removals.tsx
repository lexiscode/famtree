import { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    UserMinus,
    Clock,
    CheckCircle,
    Zap,
    Eye,
    AlertTriangle,
} from 'lucide-react';

interface Removal {
    id: number;
    status: string;
    reason: string | null;
    votes_count: number;
    expires_at: string | null;
    expires_at_formatted: string | null;
    target_user: {
        id: number;
        full_name: string;
        username: string;
    } | null;
    initiator: {
        id: number;
        full_name: string;
        username: string;
    } | null;
    class_set: {
        id: number;
        name: string;
    } | null;
    created_at: string;
    created_at_formatted: string;
}

interface PaginatedData {
    data: Removal[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total: number;
    pending: number;
}

interface Props {
    removals: PaginatedData;
    statistics: Statistics;
    perPage: number;
}

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    pending: { bg: '#fff8e1', border: '#ffc107', text: '#856404' },
    completed: { bg: '#e8f5e9', border: '#198754', text: '#155724' },
    cancelled: { bg: '#f3f4f6', border: '#6c757d', text: '#6c757d' },
};

export default function Removals({ removals, statistics, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const handlePageChange = (page: number) => {
        router.get(route('admin.removals.index'), { page, per_page: perPage }, { preserveScroll: true });
    };

    const getStatusBadge = (status: string) => {
        const config = statusColors[status] || { bg: '#f3f4f6', border: '#6c757d', text: '#6c757d' };
        return (
            <span
                style={{
                    display: 'inline-block',
                    paddingLeft: '0.6rem',
                    paddingRight: '0.6rem',
                    paddingTop: '0.45rem',
                    paddingBottom: '0.45rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    backgroundColor: config.bg,
                    color: config.text,
                    border: `1.5px solid ${config.border}`,
                    textTransform: 'capitalize',
                }}
            >
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Flash Messages */}
                {(flash?.success || flash?.error) && (
                    <div style={{
                        marginBottom: '2rem',
                        padding: '1.25rem 1.5rem',
                        borderRadius: '12px',
                        background: flash?.error ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)' : 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                        border: `1px solid ${flash?.error ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)'}`,
                        color: flash?.error ? '#DC2626' : '#16A34A',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                    }}>
                        {flash?.success || flash?.error}
                    </div>
                )}

                {/* Header */}
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
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '50%' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <UserMinus size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                Member Removals
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            Monitor and manage member removal requests across groups
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Real-time removal tracking dashboard
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem' }}>
                        {[
                            { label: 'Total Removals', value: statistics.total, icon: UserMinus, color: THEME.primary, lightColor: '#e7f1ff' },
                            { label: 'Pending', value: statistics.pending, icon: Clock, color: THEME.warning, lightColor: '#fff8e1' },
                        ].map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '18px',
                                        padding: '1.75rem',
                                        border: `2.5px solid ${stat.lightColor}`,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = stat.color;
                                        e.currentTarget.style.boxShadow = `0 20px 48px ${stat.color}20, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                        e.currentTarget.style.transform = 'translateY(-6px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = stat.lightColor;
                                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: stat.lightColor, borderRadius: '50%', opacity: 0.3, transform: 'translate(30%, -30%)' }} />
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                            <p style={{ fontSize: '2.25rem', fontWeight: 800, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '16px', backgroundColor: stat.lightColor, transition: 'all 0.3s ease' }}>
                                                <Icon size={36} color={stat.color} strokeWidth={1.5} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Removals Table */}
                <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '2px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    {removals.data.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        {['Class Set', 'Target User', 'Initiator', 'Reason', 'Status', 'Votes', 'Expires', 'Actions'].map((header) => (
                                            <th key={header} style={{ padding: '1.25rem', textAlign: header === 'Actions' ? 'center' : 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {removals.data.map((removal) => (
                                        <tr
                                            key={removal.id}
                                            style={{ borderBottom: '1.5px solid #E5E7EB', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: '#FFFFFF' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(13, 110, 253, 0.05)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27' }}>
                                                {removal.class_set?.name || 'N/A'}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>{removal.target_user?.full_name || 'Unknown'}</p>
                                                    <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>@{removal.target_user?.username || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>{removal.initiator?.full_name || 'Unknown'}</p>
                                                    <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>@{removal.initiator?.username || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', maxWidth: '200px' }}>
                                                <p style={{ fontSize: '0.92rem', color: '#4B5563', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                    {removal.reason || 'No reason provided'}
                                                </p>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>{getStatusBadge(removal.status)}</td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', fontWeight: 700, color: '#0a0e27' }}>
                                                {removal.votes_count}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {removal.expires_at_formatted || 'N/A'}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => router.get(route('admin.removals.show', removal.id))}
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                        paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.6rem', paddingBottom: '0.6rem',
                                                        background: '#e7f1ff', color: THEME.primary, border: '2.5px solid #cfe2ff', borderRadius: '10px',
                                                        fontSize: '0.87rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        letterSpacing: '0.3px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = THEME.primary; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.primary}35`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#e7f1ff'; e.currentTarget.style.color = THEME.primary; e.currentTarget.style.borderColor = '#cfe2ff'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                >
                                                    <Eye size={15} />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', background: '#F3F4F6', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <UserMinus size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>No removals found</p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>There are no member removal requests at this time</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {removals.last_page > 1 && (
                    <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '1.75rem 2rem', borderRadius: '16px', border: '2px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }}>
                        <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#4B5563', margin: 0 }}>
                            Showing <span style={{ fontWeight: 800, color: '#0a0e27' }}>{removals.from}</span> to{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{removals.to}</span> of{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{removals.total}</span> results
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {Array.from({ length: removals.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    style={{
                                        paddingLeft: '0.85rem', paddingRight: '0.85rem', paddingTop: '0.6rem', paddingBottom: '0.6rem', borderRadius: '10px', fontSize: '0.92rem', fontWeight: 700,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', border: `2.5px solid ${removals.current_page === page ? THEME.primary : '#e9ecef'}`,
                                        cursor: 'pointer', background: removals.current_page === page ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)` : '#f8f9fa',
                                        color: removals.current_page === page ? '#FFFFFF' : '#0a0e27', boxShadow: removals.current_page === page ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                        minWidth: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => { if (removals.current_page !== page) { e.currentTarget.style.background = '#e9ecef'; e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                                    onMouseLeave={(e) => { if (removals.current_page !== page) { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#e9ecef'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
