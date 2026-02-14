import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    MessageSquare,
    Mail,
    Activity,
    Zap,
    Building2,
    Calendar,
} from 'lucide-react';

interface ClassSetChat {
    id: number;
    name: string;
    year: string | null;
    organization_name: string | null;
    member_count: number;
    messages_count: number;
    last_activity: string | null;
    last_activity_formatted: string | null;
}

interface PaginatedData {
    data: ClassSetChat[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total_conversations: number;
    total_messages: number;
    active_today: number;
}

interface Props {
    classSetChats: PaginatedData;
    statistics: Statistics;
    filters: Record<string, any>;
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

export default function ClassSetChats({ classSetChats, statistics, filters, search, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [searchQuery, setSearchQuery] = useState(search || '');
    const isInitialMount = useRef(true);

    const buildParams = useCallback(() => {
        return {
            search: searchQuery,
            per_page: perPage,
        };
    }, [searchQuery, perPage]);

    const handleSearch = useCallback(() => {
        router.get(route('admin.messaging.classSetChats'), buildParams(), { preserveScroll: true });
    }, [buildParams]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(route('admin.messaging.classSetChats'), buildParams(), { preserveScroll: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        router.get(route('admin.messaging.classSetChats'), { search: '', per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const handlePageChange = (page: number) => {
        router.get(route('admin.messaging.classSetChats'), { ...buildParams(), page }, { preserveScroll: true });
    };

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = classSetChats.current_page;
        const last = classSetChats.last_page;

        let start = Math.max(1, current - 2);
        let end = Math.min(last, current + 2);

        if (current <= 3) {
            end = Math.min(last, 5);
        }
        if (current >= last - 2) {
            start = Math.max(1, last - 4);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Flash Messages */}
                {flash?.success && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            background: '#e8f5e9',
                            border: `2px solid ${THEME.success}`,
                            color: THEME.success,
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            background: '#ffebee',
                            border: `2px solid ${THEME.danger}`,
                            color: THEME.danger,
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        <span>{flash.error}</span>
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
                            <Users size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Class Set Chats
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
                            Monitor and oversee all class set group conversations across organizations
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Class set messaging oversight
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ marginBottom: '3rem' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '1.75rem',
                        }}
                    >
                        {[
                            { label: 'Total Class Set Chats', value: statistics.total_conversations, icon: Users, color: THEME.primary, lightColor: '#e7f1ff' },
                            { label: 'Total Messages', value: statistics.total_messages, icon: Mail, color: THEME.success, lightColor: '#e8f5e9' },
                            { label: 'Active Today', value: statistics.active_today, icon: Activity, color: THEME.info, lightColor: '#e0f7fa' },
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
                                        <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {stat.label}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                            <p style={{ fontSize: '2.25rem', fontWeight: 800, color: stat.color, margin: 0, lineHeight: 1 }}>
                                                {stat.value}
                                            </p>
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
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div
                            style={{
                                flex: '1 1 320px',
                                minWidth: '280px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                background: '#FFFFFF',
                                border: '2.5px solid #e9ecef',
                                borderRadius: '14px',
                                padding: '0.85rem 1.25rem',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = THEME.primary;
                                e.currentTarget.style.boxShadow = `0 12px 28px ${THEME.primary}18, 0 2px 8px rgba(0, 0, 0, 0.03)`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e9ecef';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
                            }}
                        >
                            <Search size={20} color={THEME.primary} strokeWidth={2} />
                            <input
                                type="text"
                                placeholder="Search class set chats by name or organization..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '0.98rem',
                                    color: '#0a0e27',
                                    background: 'transparent',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            style={{
                                paddingLeft: '1.85rem',
                                paddingRight: '1.85rem',
                                paddingTop: '0.8rem',
                                paddingBottom: '0.8rem',
                                background: `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: '0.96rem',
                                letterSpacing: '0.3px',
                                boxShadow: '0 4px 12px rgba(13, 110, 253, 0.25)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = `0 16px 32px ${THEME.primary}40`;
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.25)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Search
                        </button>
                    </div>

                    {searchQuery && (
                        <button
                            onClick={handleReset}
                            style={{
                                marginTop: '1.25rem',
                                fontSize: '0.92rem',
                                color: THEME.primary,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 700,
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = `${THEME.primary}08`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'none';
                            }}
                        >
                            Reset all filters
                        </button>
                    )}
                </div>

                {/* Class Set Chats Table */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    {classSetChats.data.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        {['Class Set Name', 'Organization', 'Year', 'Members', 'Messages', 'Last Activity'].map((h) => (
                                            <th
                                                key={h}
                                                style={{
                                                    padding: '1.25rem',
                                                    textAlign: 'left',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 800,
                                                    color: '#374151',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {classSetChats.data.map((chat) => (
                                        <tr
                                            key={chat.id}
                                            style={{
                                                borderBottom: '1.5px solid #E5E7EB',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                background: '#FFFFFF',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#F9FAFB';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = '#FFFFFF';
                                            }}
                                        >
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                    <div
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '10px',
                                                            background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                                                            color: '#FFFFFF',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Users size={20} strokeWidth={2} />
                                                    </div>
                                                    <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                                        {chat.name}
                                                    </p>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                {chat.organization_name ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Building2 size={14} color={THEME.secondary} />
                                                        <span style={{ fontSize: '0.92rem', color: '#4B5563', fontWeight: 500 }}>
                                                            {chat.organization_name}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.85rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                {chat.year ? (
                                                    <span
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            padding: '0.45rem 0.75rem',
                                                            borderRadius: '8px',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 700,
                                                            backgroundColor: '#f0f7ff',
                                                            color: THEME.primary,
                                                            border: '1.5px solid #cfe2ff',
                                                        }}
                                                    >
                                                        <Calendar size={12} />
                                                        {chat.year}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '0.85rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Users size={14} color={THEME.primary} />
                                                    <span style={{ fontSize: '0.92rem', color: '#4B5563', fontWeight: 600 }}>
                                                        {chat.member_count}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <MessageSquare size={14} color={THEME.success} />
                                                    <span style={{ fontSize: '0.92rem', color: '#4B5563', fontWeight: 600 }}>
                                                        {chat.messages_count}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {chat.last_activity_formatted || 'No activity'}
                                            </td>
                                        </tr>
                                    ))}
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
                                <Users size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No class set chats found
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                Try adjusting your search criteria
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {classSetChats.last_page > 1 && (
                    <div
                        style={{
                            marginTop: '2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#FFFFFF',
                            padding: '1.75rem 2rem',
                            borderRadius: '16px',
                            border: '2px solid #E5E7EB',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                            flexWrap: 'wrap',
                            gap: '1rem',
                        }}
                    >
                        <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#4B5563', margin: 0 }}>
                            Showing <span style={{ fontWeight: 800, color: '#0a0e27' }}>{classSetChats.from}</span> to{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{classSetChats.to}</span> of{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{classSetChats.total}</span> results
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <button
                                onClick={() => handlePageChange(classSetChats.current_page - 1)}
                                disabled={classSetChats.current_page === 1}
                                style={{
                                    paddingLeft: '0.85rem',
                                    paddingRight: '0.85rem',
                                    paddingTop: '0.6rem',
                                    paddingBottom: '0.6rem',
                                    borderRadius: '10px',
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2.5px solid #e9ecef',
                                    cursor: classSetChats.current_page === 1 ? 'not-allowed' : 'pointer',
                                    background: classSetChats.current_page === 1 ? '#f9fafb' : '#f8f9fa',
                                    color: classSetChats.current_page === 1 ? '#adb5bd' : '#0a0e27',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (classSetChats.current_page !== 1) {
                                        e.currentTarget.style.background = '#e9ecef';
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (classSetChats.current_page !== 1) {
                                        e.currentTarget.style.background = '#f8f9fa';
                                        e.currentTarget.style.borderColor = '#e9ecef';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                <ChevronLeft size={16} />
                                Prev
                            </button>

                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    style={{
                                        paddingLeft: '0.85rem',
                                        paddingRight: '0.85rem',
                                        paddingTop: '0.6rem',
                                        paddingBottom: '0.6rem',
                                        borderRadius: '10px',
                                        fontSize: '0.92rem',
                                        fontWeight: 700,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: `2.5px solid ${page === classSetChats.current_page ? THEME.primary : '#e9ecef'}`,
                                        cursor: 'pointer',
                                        background: page === classSetChats.current_page ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)` : '#f8f9fa',
                                        color: page === classSetChats.current_page ? '#FFFFFF' : '#0a0e27',
                                        boxShadow: page === classSetChats.current_page ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                        minWidth: '44px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (page !== classSetChats.current_page) {
                                            e.currentTarget.style.background = '#e9ecef';
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (page !== classSetChats.current_page) {
                                            e.currentTarget.style.background = '#f8f9fa';
                                            e.currentTarget.style.borderColor = '#e9ecef';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(classSetChats.current_page + 1)}
                                disabled={classSetChats.current_page === classSetChats.last_page}
                                style={{
                                    paddingLeft: '0.85rem',
                                    paddingRight: '0.85rem',
                                    paddingTop: '0.6rem',
                                    paddingBottom: '0.6rem',
                                    borderRadius: '10px',
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2.5px solid #e9ecef',
                                    cursor: classSetChats.current_page === classSetChats.last_page ? 'not-allowed' : 'pointer',
                                    background: classSetChats.current_page === classSetChats.last_page ? '#f9fafb' : '#f8f9fa',
                                    color: classSetChats.current_page === classSetChats.last_page ? '#adb5bd' : '#0a0e27',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (classSetChats.current_page !== classSetChats.last_page) {
                                        e.currentTarget.style.background = '#e9ecef';
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (classSetChats.current_page !== classSetChats.last_page) {
                                        e.currentTarget.style.background = '#f8f9fa';
                                        e.currentTarget.style.borderColor = '#e9ecef';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
