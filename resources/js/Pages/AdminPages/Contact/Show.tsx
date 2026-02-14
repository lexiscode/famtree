import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Mail,
    User,
    FileText,
    Clock,
    Send,
    Loader2,
    Trash2,
    Eye,
    MessageSquare,
} from 'lucide-react';

interface Props {
    submission: {
        id: number;
        name: string;
        email: string;
        subject: string;
        message: string;
        status: string;
        admin_response: string | null;
        created_at: string;
    };
}

interface SharedProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

const statusConfig: Record<string, { bg: string; border: string; color: string; label: string }> = {
    new: { bg: '#fff3cd', border: THEME.warning, color: '#856404', label: 'New' },
    unread: { bg: '#fff3cd', border: THEME.warning, color: '#856404', label: 'Unread' },
    read: { bg: '#d1ecf1', border: THEME.info, color: '#0c5460', label: 'Read' },
    responded: { bg: '#d4edda', border: THEME.success, color: THEME.success, label: 'Responded' },
};

export default function Show({ submission }: Props) {
    const { flash } = usePage<SharedProps>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [response, setResponse] = useState('');

    const handleBack = () => {
        router.get(route('admin.contact.index'));
    };

    const handleMarkRead = () => {
        router.post(route('admin.contact.markRead', submission.id), {}, {
            preserveScroll: true,
        });
    };

    const handleRespond = (e: React.FormEvent) => {
        e.preventDefault();
        if (!response.trim()) return;
        setIsSubmitting(true);
        router.post(
            route('admin.contact.respond', submission.id),
            { response },
            {
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
                onSuccess: () => setResponse(''),
            }
        );
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
            router.delete(route('admin.contact.destroy', submission.id));
        }
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        e.currentTarget.style.borderColor = THEME.primary;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`;
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.boxShadow = 'none';
    };

    const config = statusConfig[submission.status] || statusConfig.new;

    return (
        <AdminLayout>
            <div>
                {/* Flash Messages */}
                {(flash?.success || flash?.error) && (
                    <div
                        style={{
                            marginBottom: '2rem',
                            padding: '1.25rem 1.5rem',
                            borderRadius: '12px',
                            background: flash?.error
                                ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(25, 135, 84, 0.1) 0%, rgba(25, 135, 84, 0.05) 100%)',
                            border: `1px solid ${flash?.error ? 'rgba(220, 38, 38, 0.3)' : 'rgba(25, 135, 84, 0.3)'}`,
                            color: flash?.error ? THEME.danger : THEME.success,
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: flash?.error
                                ? '0 4px 12px rgba(220, 38, 38, 0.1)'
                                : '0 4px 12px rgba(25, 135, 84, 0.1)',
                        }}
                    >
                        {flash?.success || flash?.error}
                    </div>
                )}

                {/* Page Header */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <button
                            onClick={handleBack}
                            style={{
                                background: '#E7F5FF',
                                border: '2px solid #cfe2ff',
                                padding: '0.65rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                color: THEME.primary,
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = THEME.primary;
                                e.currentTarget.style.color = '#FFFFFF';
                                e.currentTarget.style.borderColor = THEME.primary;
                                e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.primary}30`;
                                e.currentTarget.style.transform = 'translateX(-3px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#E7F5FF';
                                e.currentTarget.style.color = THEME.primary;
                                e.currentTarget.style.borderColor = '#cfe2ff';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>
                                Contact Submission
                            </h1>
                            <p style={{ fontSize: '0.98rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>
                                View details and respond to this submission
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {submission.status !== 'read' && submission.status !== 'responded' && (
                            <button
                                onClick={handleMarkRead}
                                style={{
                                    paddingLeft: '1.25rem',
                                    paddingRight: '1.25rem',
                                    paddingTop: '0.7rem',
                                    paddingBottom: '0.7rem',
                                    background: '#d1ecf1',
                                    color: '#0c5460',
                                    border: `2px solid ${THEME.info}`,
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = THEME.info;
                                    e.currentTarget.style.color = '#FFFFFF';
                                    e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.info}40`;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#d1ecf1';
                                    e.currentTarget.style.color = '#0c5460';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <Eye size={16} />
                                Mark as Read
                            </button>
                        )}

                        <button
                            onClick={handleDelete}
                            style={{
                                paddingLeft: '1.25rem',
                                paddingRight: '1.25rem',
                                paddingTop: '0.7rem',
                                paddingBottom: '0.7rem',
                                background: '#ffebee',
                                color: THEME.danger,
                                border: `2px solid #f5c6cb`,
                                borderRadius: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = THEME.danger;
                                e.currentTarget.style.color = '#FFFFFF';
                                e.currentTarget.style.borderColor = THEME.danger;
                                e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.danger}40`;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffebee';
                                e.currentTarget.style.color = THEME.danger;
                                e.currentTarget.style.borderColor = '#f5c6cb';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Submission Details Card */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        border: '2px solid #E5E7EB',
                        padding: '2.5rem',
                        marginBottom: '2rem',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    {/* Status Badge */}
                    <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <h3
                            style={{
                                fontSize: '1.15rem',
                                fontWeight: 800,
                                color: '#0a0e27',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.85rem',
                                letterSpacing: '-0.3px',
                            }}
                        >
                            <div
                                style={{
                                    padding: '0.6rem',
                                    background: '#E7F1FF',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Mail size={22} color={THEME.primary} strokeWidth={2.5} />
                            </div>
                            Submission Details
                        </h3>
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                paddingLeft: '0.85rem',
                                paddingRight: '0.85rem',
                                paddingTop: '0.55rem',
                                paddingBottom: '0.55rem',
                                borderRadius: '10px',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                border: `2px solid ${config.border}`,
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
                            {config.label}
                        </span>
                    </div>

                    {/* Detail Fields */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '2rem',
                        }}
                    >
                        {/* Name */}
                        <div
                            style={{
                                padding: '1.25rem',
                                background: '#F9FAFB',
                                borderRadius: '14px',
                                border: '1.5px solid #E5E7EB',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                <User size={15} color={THEME.primary} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Name
                                </span>
                            </div>
                            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0e27', margin: 0 }}>
                                {submission.name}
                            </p>
                        </div>

                        {/* Email */}
                        <div
                            style={{
                                padding: '1.25rem',
                                background: '#F9FAFB',
                                borderRadius: '14px',
                                border: '1.5px solid #E5E7EB',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                <Mail size={15} color={THEME.primary} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Email
                                </span>
                            </div>
                            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0e27', margin: 0 }}>
                                {submission.email}
                            </p>
                        </div>

                        {/* Subject */}
                        <div
                            style={{
                                padding: '1.25rem',
                                background: '#F9FAFB',
                                borderRadius: '14px',
                                border: '1.5px solid #E5E7EB',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                <FileText size={15} color={THEME.primary} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Subject
                                </span>
                            </div>
                            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0e27', margin: 0 }}>
                                {submission.subject}
                            </p>
                        </div>

                        {/* Date */}
                        <div
                            style={{
                                padding: '1.25rem',
                                background: '#F9FAFB',
                                borderRadius: '14px',
                                border: '1.5px solid #E5E7EB',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                <Clock size={15} color={THEME.primary} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Submitted
                                </span>
                            </div>
                            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0e27', margin: 0 }}>
                                {submission.created_at}
                            </p>
                        </div>
                    </div>

                    {/* Full Message */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                            <MessageSquare size={16} color={THEME.primary} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Message
                            </span>
                        </div>
                        <div
                            style={{
                                padding: '1.5rem',
                                background: '#F9FAFB',
                                borderRadius: '14px',
                                border: '1.5px solid #E5E7EB',
                                fontSize: '0.98rem',
                                color: '#374151',
                                lineHeight: 1.8,
                                fontWeight: 500,
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {submission.message}
                        </div>
                    </div>
                </div>

                {/* Admin Response (if exists) */}
                {submission.admin_response && (
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '20px',
                            border: `2px solid ${THEME.success}`,
                            padding: '2rem',
                            marginBottom: '2rem',
                            boxShadow: '0 4px 16px rgba(25, 135, 84, 0.08)',
                        }}
                    >
                        <h3
                            style={{
                                fontSize: '1.15rem',
                                fontWeight: 800,
                                color: '#0a0e27',
                                margin: 0,
                                marginBottom: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.85rem',
                                letterSpacing: '-0.3px',
                            }}
                        >
                            <div
                                style={{
                                    padding: '0.6rem',
                                    background: '#e8f5e9',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Send size={22} color={THEME.success} strokeWidth={2.5} />
                            </div>
                            Admin Response
                        </h3>
                        <div
                            style={{
                                padding: '1.5rem',
                                background: '#e8f5e9',
                                borderRadius: '14px',
                                border: `1.5px solid ${THEME.success}`,
                                fontSize: '0.98rem',
                                color: '#374151',
                                lineHeight: 1.8,
                                fontWeight: 500,
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {submission.admin_response}
                        </div>
                    </div>
                )}

                {/* Reply Form */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        border: '2px solid #E5E7EB',
                        padding: '2.5rem',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <h3
                        style={{
                            fontSize: '1.15rem',
                            fontWeight: 800,
                            color: '#0a0e27',
                            margin: 0,
                            marginBottom: '1.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                            letterSpacing: '-0.3px',
                        }}
                    >
                        <div
                            style={{
                                padding: '0.6rem',
                                background: '#E7F1FF',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Send size={22} color={THEME.primary} strokeWidth={2.5} />
                        </div>
                        {submission.admin_response ? 'Send Another Response' : 'Reply'}
                    </h3>

                    <form onSubmit={handleRespond}>
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Type your response here..."
                            required
                            style={{
                                width: '100%',
                                padding: '1rem 1.1rem',
                                border: '2px solid #E5E7EB',
                                borderRadius: '12px',
                                fontSize: '0.96rem',
                                color: '#0a0e27',
                                backgroundColor: '#FFFFFF',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                fontFamily: 'inherit',
                                outline: 'none',
                                boxSizing: 'border-box' as const,
                                minHeight: '160px',
                                resize: 'vertical' as const,
                                marginBottom: '1.5rem',
                            }}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                disabled={isSubmitting || !response.trim()}
                                style={{
                                    paddingLeft: '2rem',
                                    paddingRight: '2rem',
                                    paddingTop: '0.85rem',
                                    paddingBottom: '0.85rem',
                                    background:
                                        isSubmitting || !response.trim()
                                            ? THEME.secondary
                                            : `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    cursor: isSubmitting || !response.trim() ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: `0 4px 12px ${THEME.primary}25`,
                                    fontSize: '0.96rem',
                                    letterSpacing: '0.3px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    opacity: isSubmitting || !response.trim() ? 0.7 : 1,
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSubmitting && response.trim()) {
                                        e.currentTarget.style.boxShadow = `0 12px 28px ${THEME.primary}40`;
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSubmitting && response.trim()) {
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}25`;
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                {isSubmitting ? (
                                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <Send size={18} />
                                )}
                                {isSubmitting ? 'Sending...' : 'Send Response'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
