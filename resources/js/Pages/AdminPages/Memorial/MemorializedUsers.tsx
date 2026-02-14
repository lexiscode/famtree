import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    Heart,
    Users,
    Calendar,
    MessageSquare,
    Zap,
} from 'lucide-react';

interface MemorializedUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    profile_image_url: string | null;
    memorialized_at: string;
    memorialized_by_name: string;
    memorial_messages_count: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: MemorializedUser[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface Statistics {
    total: number;
}

interface Props {
    users: PaginatedData;
    statistics: Statistics;
    search: string;
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

function UserAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={name}
                style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', display: 'block' }}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div
            style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)', color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem',
            }}
        >
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function MemorializedUsers({ users, statistics, search, perPage }: Props) {
    const [searchQuery, setSearchQuery] = useState(search || '');

    const handleSearch = useCallback(() => {
        router.get(
            route('admin.memorial.memorialized'),
            { search: searchQuery, per_page: perPage },
            { preserveScroll: true }
        );
    }, [searchQuery, perPage]);

    const handlePageChange = (page: number) => {
        router.get(
            route('admin.memorial.memorialized'),
            { page, search: searchQuery, per_page: perPage },
            { preserveScroll: true }
        );
    };

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
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
                            <Heart size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                Memorialized Users
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            View all memorialized user accounts and their memorial messages
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                {statistics.total} total memorialized accounts
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem' }}>
                        <div
                            style={{
                                background: '#FFFFFF', borderRadius: '18px', padding: '1.75rem', border: '2.5px solid #e7f1ff',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 20px 48px ${THEME.primary}20, 0 2px 12px rgba(0, 0, 0, 0.04)`; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e7f1ff'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: '#e7f1ff', borderRadius: '50%', opacity: 0.3, transform: 'translate(30%, -30%)' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Memorialized</p>
                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                    <p style={{ fontSize: '2.25rem', fontWeight: 800, color: THEME.primary, margin: 0, lineHeight: 1 }}>{statistics.total}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '16px', backgroundColor: '#e7f1ff' }}>
                                        <Heart size={36} color={THEME.primary} strokeWidth={1.5} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div
                            style={{
                                flex: '1 1 320px', minWidth: '280px', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                background: '#FFFFFF', border: '2.5px solid #e9ecef', borderRadius: '14px', padding: '0.85rem 1.25rem',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 12px 28px ${THEME.primary}18, 0 2px 8px rgba(0, 0, 0, 0.03)`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e9ecef'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)'; }}
                        >
                            <Search size={20} color={THEME.primary} strokeWidth={2} />
                            <input
                                type="text"
                                placeholder="Search by name or username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.98rem', color: '#0a0e27', background: 'transparent', fontFamily: 'inherit' }}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            style={{
                                paddingLeft: '1.85rem', paddingRight: '1.85rem', paddingTop: '0.8rem', paddingBottom: '0.8rem',
                                background: `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`, color: '#FFFFFF', border: 'none', borderRadius: '14px',
                                fontWeight: 700, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', fontSize: '0.96rem',
                                letterSpacing: '0.3px', boxShadow: '0 4px 12px rgba(13, 110, 253, 0.25)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 16px 32px ${THEME.primary}40`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '2px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    {users.data.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        {['User', 'Memorialized Date', 'Memorialized By', 'Messages'].map((header) => (
                                            <th key={header} style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            style={{ borderBottom: '1.5px solid #E5E7EB', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: '#FFFFFF' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(13, 110, 253, 0.05)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                    <UserAvatar imageUrl={user.profile_image_url} name={`${user.first_name} ${user.last_name}`} />
                                                    <div>
                                                        <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>{user.first_name} {user.last_name}</p>
                                                        <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>@{user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Calendar size={14} color="#6B7280" />
                                                    <span style={{ fontSize: '0.92rem', color: '#4B5563', fontWeight: 500 }}>{new Date(user.memorialized_at).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#4B5563', fontWeight: 500 }}>{user.memorialized_by_name}</td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <MessageSquare size={14} color="#6B7280" />
                                                    <span style={{ fontSize: '0.92rem', color: '#4B5563', fontWeight: 600 }}>{user.memorial_messages_count}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', background: '#F3F4F6', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Heart size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>No memorialized users found</p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '1.75rem 2rem', borderRadius: '16px', border: '2px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }}>
                        <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#4B5563', margin: 0 }}>
                            Showing <span style={{ fontWeight: 800, color: '#0a0e27' }}>{users.from}</span> to{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{users.to}</span> of{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{users.total}</span> results
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {users.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => { if (link.url) { const url = new URL(link.url, window.location.origin); handlePageChange(parseInt(url.searchParams.get('page') || '1')); } }}
                                    disabled={!link.url}
                                    style={{
                                        paddingLeft: '0.85rem', paddingRight: '0.85rem', paddingTop: '0.6rem', paddingBottom: '0.6rem', borderRadius: '10px', fontSize: '0.92rem', fontWeight: 700,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', border: `2.5px solid ${link.active ? THEME.primary : '#e9ecef'}`,
                                        cursor: link.url ? 'pointer' : 'not-allowed', background: link.active ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)` : link.url ? '#f8f9fa' : '#f9fafb',
                                        color: link.active ? '#FFFFFF' : link.url ? '#0a0e27' : '#adb5bd', boxShadow: link.active ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                        minWidth: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => { if (link.url && !link.active) { e.currentTarget.style.background = '#e9ecef'; e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                                    onMouseLeave={(e) => { if (link.url && !link.active) { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#e9ecef'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
