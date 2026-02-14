import { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Mail,
    Inbox,
    Eye,
    CheckCircle,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface Submission {
    id: number;
    name: string;
    email: string;
    subject: string;
    status: string;
    created_at: string;
    created_at_formatted: string;
}

interface PaginatedData {
    data: Submission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    submissions: PaginatedData;
    statistics: {
        total: number;
        unread: number;
        read: number;
        responded: number;
    };
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

const statusConfig: Record<string, { bg: string; border: string; color: string }> = {
    new: { bg: '#fff3cd', border: THEME.warning, color: '#856404' },
    unread: { bg: '#fff3cd', border: THEME.warning, color: '#856404' },
    read: { bg: '#d1ecf1', border: THEME.info, color: '#0c5460' },
    responded: { bg: '#d4edda', border: THEME.success, color: THEME.success },
};

export default function Index({ submissions, statistics, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const handlePageChange = useCallback(
        (page: number) => {
            router.get(
                route('admin.contact.index'),
                { page, per_page: perPage },
                { preserveScroll: true }
            );
        },
        [perPage]
    );

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status] || statusConfig.new;
        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    paddingLeft: '0.75rem',
                    paddingRight: '0.75rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: `1.5px solid ${config.border}`,
                    backgroundColor: config.bg,
                    color: config.color,
                }}
            >
                <span
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: config.border,
                    }}
                />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = submissions.current_page;
        const last = submissions.last_page;

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

                {/* Premium Header Section with Gradient Background */}
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
                            <Mail size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Contact Submissions
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
                            Review and respond to contact form submissions from visitors
                        </p>
                    </div>
                </div>

                {/* Premium Stats Grid */}
                <div style={{ marginBottom: '3rem' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1.75rem',
                        }}
                    >
                        {[
                            { label: 'Total', value: statistics.total, icon: Inbox, color: THEME.primary, lightColor: '#e7f1ff' },
                            { label: 'Unread', value: statistics.unread, icon: Mail, color: '#856404', lightColor: '#fff3cd' },
                            { label: 'Read', value: statistics.read, icon: Eye, color: '#0c5460', lightColor: '#d1ecf1' },
                            { label: 'Responded', value: statistics.responded, icon: CheckCircle, color: THEME.success, lightColor: '#e8f5e9' },
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
                                    {/* Background accent */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '100px',
                                            height: '100px',
                                            background: stat.lightColor,
                                            borderRadius: '50%',
                                            opacity: 0.3,
                                            transform: 'translate(30%, -30%)',
                                        }}
                                    />

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {stat.label}
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                            <p
                                                style={{
                                                    fontSize: '2.25rem',
                                                    fontWeight: 800,
                                                    color: stat.color,
                                                    margin: 0,
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {stat.value}
                                            </p>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '72px',
                                                    height: '72px',
                                                    borderRadius: '16px',
                                                    backgroundColor: stat.lightColor,
                                                    transition: 'all 0.3s ease',
                                                }}
                                            >
                                                <Icon size={36} color={stat.color} strokeWidth={1.5} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Contact Submissions Table */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    {submissions.data.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Name
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Email
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Subject
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Status
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Date
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.data.map((submission) => (
                                        <tr
                                            key={submission.id}
                                            style={{
                                                borderBottom: '1.5px solid #E5E7EB',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                background: '#FFFFFF',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#F9FAFB';
                                                e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(13, 110, 253, 0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = '#FFFFFF';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {/* Name */}
                                            <td style={{ padding: '1.2rem 1rem' }}>
                                                <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                                    {submission.name}
                                                </p>
                                            </td>

                                            {/* Email */}
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.95rem', color: '#4B5563', fontWeight: 500 }}>
                                                {submission.email}
                                            </td>

                                            {/* Subject */}
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#4B5563', fontWeight: 500 }}>
                                                {submission.subject}
                                            </td>

                                            {/* Status */}
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                {getStatusBadge(submission.status)}
                                            </td>

                                            {/* Date */}
                                            <td style={{ padding: '1.2rem 1rem', fontSize: '0.92rem', color: '#6B7280', fontWeight: 500 }}>
                                                {submission.created_at_formatted}
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => router.get(route('admin.contact.show', submission.id))}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        paddingLeft: '1rem',
                                                        paddingRight: '1rem',
                                                        paddingTop: '0.6rem',
                                                        paddingBottom: '0.6rem',
                                                        background: '#e7f1ff',
                                                        color: THEME.primary,
                                                        border: '2.5px solid #cfe2ff',
                                                        borderRadius: '10px',
                                                        fontSize: '0.87rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        letterSpacing: '0.3px',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = THEME.primary;
                                                        e.currentTarget.style.color = '#FFFFFF';
                                                        e.currentTarget.style.borderColor = THEME.primary;
                                                        e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.primary}35`;
                                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#e7f1ff';
                                                        e.currentTarget.style.color = THEME.primary;
                                                        e.currentTarget.style.borderColor = '#cfe2ff';
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    <MessageSquare size={15} strokeWidth={2.5} />
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
                                <Mail size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No contact submissions found
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                Submissions will appear here when visitors use the contact form
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {submissions.last_page > 1 && (
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
                            Showing <span style={{ fontWeight: 800, color: '#0a0e27' }}>{submissions.from}</span> to{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{submissions.to}</span> of{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{submissions.total}</span> results
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(submissions.current_page - 1)}
                                disabled={submissions.current_page === 1}
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
                                    cursor: submissions.current_page === 1 ? 'not-allowed' : 'pointer',
                                    background: submissions.current_page === 1 ? '#f9fafb' : '#f8f9fa',
                                    color: submissions.current_page === 1 ? '#adb5bd' : '#0a0e27',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (submissions.current_page !== 1) {
                                        e.currentTarget.style.background = '#e9ecef';
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (submissions.current_page !== 1) {
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

                            {/* Page Numbers */}
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
                                        border: `2.5px solid ${page === submissions.current_page ? THEME.primary : '#e9ecef'}`,
                                        cursor: 'pointer',
                                        background: page === submissions.current_page ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)` : '#f8f9fa',
                                        color: page === submissions.current_page ? '#FFFFFF' : '#0a0e27',
                                        boxShadow: page === submissions.current_page ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                        minWidth: '44px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (page !== submissions.current_page) {
                                            e.currentTarget.style.background = '#e9ecef';
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (page !== submissions.current_page) {
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

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(submissions.current_page + 1)}
                                disabled={submissions.current_page === submissions.last_page}
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
                                    cursor: submissions.current_page === submissions.last_page ? 'not-allowed' : 'pointer',
                                    background: submissions.current_page === submissions.last_page ? '#f9fafb' : '#f8f9fa',
                                    color: submissions.current_page === submissions.last_page ? '#adb5bd' : '#0a0e27',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (submissions.current_page !== submissions.last_page) {
                                        e.currentTarget.style.background = '#e9ecef';
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (submissions.current_page !== submissions.last_page) {
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
