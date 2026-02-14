import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    FileText,
    Eye,
    MessageSquare,
    Heart,
    Pin,
    Building2,
    ChevronRight,
    Zap,
    Trash2,
} from 'lucide-react';

interface Organization {
    name: string;
    logo_url: string | null;
}

interface Creator {
    username: string;
}

interface OrgPost {
    id: number;
    organization: Organization;
    creator: Creator;
    type: string;
    content: string;
    views_count: number;
    comments_count: number;
    reactions_count: number;
    is_pinned: boolean;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: OrgPost[];
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
    pinned: number;
}

interface Props {
    orgPosts: PaginatedData;
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

function OrgAvatar({ logoUrl, name }: { logoUrl: string | null; name: string }) {
    const [imageError, setImageError] = useState(false);

    if (logoUrl && !imageError) {
        return (
            <img
                src={logoUrl}
                alt={name}
                style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', display: 'block' }}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #FF6B35 0%, #E85D26 100%)',
            color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.9rem',
        }}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function OrgPosts({ orgPosts, statistics, search, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [searchQuery, setSearchQuery] = useState(search || '');
    const isInitialMount = useRef(true);

    const handleSearch = useCallback(() => {
        router.get(route('admin.content.orgPosts'), { search: searchQuery, per_page: perPage }, { preserveScroll: true });
    }, [searchQuery, perPage]);

    const handlePageChange = (page: number) => {
        router.get(route('admin.content.orgPosts'), { page, search: searchQuery, per_page: perPage }, { preserveScroll: true });
    };

    const handleDelete = (postId: number) => {
        if (confirm('Are you sure you want to delete this organization post?')) {
            router.delete(route('admin.content.orgPosts.delete', postId), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Flash Messages */}
                {(flash?.success || flash?.error) && (
                    <div style={{
                        marginBottom: '2rem', padding: '1.25rem 1.5rem', borderRadius: '12px',
                        background: flash?.error ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)' : 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                        border: `1px solid ${flash?.error ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)'}`,
                        color: flash?.error ? '#DC2626' : '#16A34A', fontSize: '0.95rem', fontWeight: 500,
                    }}>
                        {flash?.success || flash?.error}
                    </div>
                )}

                {/* Header */}
                <div
                    style={{
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #FF6B35 0%, #E85D26 100%)',
                        borderRadius: '20px', padding: '2.5rem', color: '#FFFFFF',
                        position: 'relative', overflow: 'hidden',
                        boxShadow: '0 16px 48px rgba(255, 107, 53, 0.20)',
                    }}
                >
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '50%' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <Building2 size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                Organization Posts
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            Manage and moderate posts created by organizations
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Organization content overview
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem' }}>
                        {[
                            { label: 'Total Org Posts', value: statistics.total, icon: FileText, color: THEME.primary, lightColor: '#e7f1ff' },
                            { label: 'Pinned Posts', value: statistics.pinned, icon: Pin, color: THEME.warning, lightColor: '#fff8e1' },
                        ].map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        background: '#FFFFFF', borderRadius: '18px', padding: '1.75rem',
                                        border: `2.5px solid ${stat.lightColor}`,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = stat.color; e.currentTarget.style.boxShadow = `0 20px 48px ${stat.color}20`; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = stat.lightColor; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: stat.lightColor, borderRadius: '50%', opacity: 0.3, transform: 'translate(30%, -30%)' }} />
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                            <p style={{ fontSize: '2.25rem', fontWeight: 800, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '16px', backgroundColor: stat.lightColor }}>
                                                <Icon size={36} color={stat.color} strokeWidth={1.5} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div
                            style={{
                                flex: '1 1 320px', minWidth: '280px', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                background: '#FFFFFF', border: '2.5px solid #e9ecef', borderRadius: '14px', padding: '0.85rem 1.25rem',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = THEME.primary; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e9ecef'; }}
                        >
                            <Search size={20} color={THEME.primary} strokeWidth={2} />
                            <input
                                type="text"
                                placeholder="Search org posts by content or organization..."
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
                                background: `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                color: '#FFFFFF', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', fontSize: '0.96rem',
                                boxShadow: '0 4px 12px rgba(13, 110, 253, 0.25)',
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
                    {orgPosts.data.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        {['Organization', 'Content', 'Creator', 'Type', 'Engagement', 'Status', 'Date', 'Actions'].map((h) => (
                                            <th key={h} style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orgPosts.data.map((post) => (
                                        <tr
                                            key={post.id}
                                            style={{ borderBottom: '1.5px solid #E5E7EB', background: '#FFFFFF', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                                        >
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                    <OrgAvatar logoUrl={post.organization.logo_url} name={post.organization.name} />
                                                    <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>{post.organization.name}</p>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', maxWidth: '220px' }}>
                                                <p style={{ fontSize: '0.92rem', color: '#4B5563', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                    {post.content}
                                                </p>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                @{post.creator.username}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <span style={{
                                                    display: 'inline-block', padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                                                    backgroundColor: '#e7f1ff', color: THEME.primary, textTransform: 'capitalize',
                                                    border: '1.5px solid #cfe2ff',
                                                }}>
                                                    {post.type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>
                                                        <Eye size={14} color={THEME.secondary} /> {post.views_count}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>
                                                        <MessageSquare size={14} color={THEME.secondary} /> {post.comments_count}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>
                                                        <Heart size={14} color={THEME.secondary} /> {post.reactions_count}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                {post.is_pinned ? (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                        padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                                                        backgroundColor: '#fff8e1', color: '#F57F17', border: '1.5px solid #ffecb3',
                                                    }}>
                                                        <Pin size={14} /> Pinned
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '0.85rem', color: '#9CA3AF', fontWeight: 500 }}>--</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {post.created_at}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => router.get(route('admin.content.orgPosts.show', post.id))}
                                                        style={{
                                                            padding: '0.5rem 0.85rem', background: '#e7f1ff', color: THEME.primary,
                                                            border: '1.5px solid #cfe2ff', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                                                            cursor: 'pointer', transition: 'all 0.3s',
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = THEME.primary; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.primary; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#e7f1ff'; e.currentTarget.style.color = THEME.primary; e.currentTarget.style.borderColor = '#cfe2ff'; }}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        style={{
                                                            padding: '0.5rem 0.85rem', background: '#ffebee', color: THEME.danger,
                                                            border: '1.5px solid #ffcdd2', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                                                            cursor: 'pointer', transition: 'all 0.3s',
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = THEME.danger; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.danger; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#ffebee'; e.currentTarget.style.color = THEME.danger; e.currentTarget.style.borderColor = '#ffcdd2'; }}
                                                    >
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
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', background: '#F3F4F6', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Building2 size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>No organization posts found</p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {orgPosts.last_page > 1 && (
                    <div style={{
                        marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: '#FFFFFF', padding: '1.75rem 2rem', borderRadius: '16px', border: '2px solid #E5E7EB',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    }}>
                        <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#4B5563', margin: 0 }}>
                            Showing <span style={{ fontWeight: 800, color: '#0a0e27' }}>{orgPosts.from}</span> to{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{orgPosts.to}</span> of{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{orgPosts.total}</span> results
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {orgPosts.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (link.url) {
                                            const url = new URL(link.url, window.location.origin);
                                            const page = url.searchParams.get('page') || '1';
                                            handlePageChange(parseInt(page));
                                        }
                                    }}
                                    disabled={!link.url}
                                    style={{
                                        paddingLeft: '0.85rem', paddingRight: '0.85rem', paddingTop: '0.6rem', paddingBottom: '0.6rem',
                                        borderRadius: '10px', fontSize: '0.92rem', fontWeight: 700,
                                        border: `2.5px solid ${link.active ? THEME.primary : '#e9ecef'}`,
                                        cursor: link.url ? 'pointer' : 'not-allowed',
                                        background: link.active ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)` : link.url ? '#f8f9fa' : '#f9fafb',
                                        color: link.active ? '#FFFFFF' : link.url ? '#0a0e27' : '#adb5bd',
                                        boxShadow: link.active ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                        minWidth: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                    onMouseEnter={(e) => { if (link.url && !link.active) { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                                    onMouseLeave={(e) => { if (link.url && !link.active) { e.currentTarget.style.borderColor = '#e9ecef'; e.currentTarget.style.transform = 'translateY(0)'; } }}
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
