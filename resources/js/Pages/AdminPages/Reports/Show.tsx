import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    User,
    Mail,
    Calendar,
    Shield,
    FileText,
    MessageSquare,
} from 'lucide-react';

interface Report {
    id: number;
    reason: string;
    description: string;
    status: string;
    admin_notes: string | null;
    reviewed_at: string | null;
    reporter: { id: number; full_name: string; username: string; email: string; profile_image_url: string | null } | null;
    reported_user: { id: number; full_name: string; username: string; email: string; profile_image_url: string | null; account_status: string } | null;
    created_at: string;
}

interface Props {
    report: Report;
}

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

const statusBadgeConfig: Record<string, { bg: string; border: string; text: string; icon: any; label: string }> = {
    pending: { bg: '#fff8e1', border: '#ffc107', text: '#856404', icon: Clock, label: 'Pending' },
    reviewing: { bg: '#e0f7fa', border: '#0dcaf0', text: '#0c5460', icon: Eye, label: 'Reviewing' },
    resolved: { bg: '#e8f5e9', border: '#198754', text: '#155724', icon: CheckCircle, label: 'Resolved' },
    dismissed: { bg: '#f3f4f6', border: '#6c757d', text: '#6c757d', icon: XCircle, label: 'Dismissed' },
};

const accountStatusConfig: Record<string, { bg: string; border: string; text: string }> = {
    active: { bg: '#e8f5e9', border: '#198754', text: '#155724' },
    inactive: { bg: '#f3f4f6', border: '#6c757d', text: '#6c757d' },
    suspended: { bg: '#ffebee', border: '#dc3545', text: '#842029' },
};

function UserAvatar({ imageUrl, name, size = 'small' }: { imageUrl: string | null; name: string; size?: 'small' | 'large' }) {
    const [imageError, setImageError] = useState(false);

    const sizeConfig = size === 'large'
        ? { width: '64px', height: '64px', fontSize: '1.5rem', shadow: '0 8px 24px rgba(0, 82, 232, 0.3)' }
        : { width: '40px', height: '40px', fontSize: '0.9rem', shadow: 'none' };

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={name}
                style={{
                    width: sizeConfig.width,
                    height: sizeConfig.height,
                    borderRadius: size === 'large' ? '16px' : '10px',
                    objectFit: 'cover',
                    display: 'block',
                    boxShadow: size === 'large' ? sizeConfig.shadow : 'none',
                }}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div
            style={{
                width: sizeConfig.width,
                height: sizeConfig.height,
                borderRadius: size === 'large' ? '16px' : '10px',
                background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: sizeConfig.fontSize,
                boxShadow: sizeConfig.shadow,
            }}
        >
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function Show({ report }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [adminNotes, setAdminNotes] = useState(report.admin_notes || '');
    const [processing, setProcessing] = useState(false);

    const statusConfig = statusBadgeConfig[report.status] || statusBadgeConfig.pending;
    const StatusIcon = statusConfig.icon;

    const handleReview = () => {
        setProcessing(true);
        router.post(route('admin.reports.review', report.id), {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const handleResolve = () => {
        setProcessing(true);
        router.post(route('admin.reports.resolve', report.id), { admin_notes: adminNotes }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const handleDismiss = () => {
        setProcessing(true);
        router.post(route('admin.reports.dismiss', report.id), { admin_notes: adminNotes }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AdminLayout>
            <div>
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

                {/* Back Button & Header */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <button
                        onClick={() => router.get(route('admin.reports.index'))}
                        style={{
                            background: '#E7F5FF', border: '2px solid #cfe2ff', padding: '0.65rem', borderRadius: '12px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', color: THEME.primary,
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = THEME.primary; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.primary}30`; e.currentTarget.style.transform = 'translateX(-3px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#E7F5FF'; e.currentTarget.style.color = THEME.primary; e.currentTarget.style.borderColor = '#cfe2ff'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>Report Details</h1>
                        <p style={{ fontSize: '0.98rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>Review and take action on report #{report.id}</p>
                    </div>
                </div>

                {/* Report Details Card */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '0.6rem', background: '#fff3e0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={22} color="#E65100" strokeWidth={2.5} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.3px' }}>Report Information</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Report ID</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                <FileText size={20} color={THEME.primary} strokeWidth={2} />
                                <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 700 }}>#{report.id}</p>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                <AlertTriangle size={20} color="#E65100" strokeWidth={2} />
                                <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500, textTransform: 'capitalize' }}>{report.reason.replace(/_/g, ' ')}</p>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                <StatusIcon size={20} color={statusConfig.text} strokeWidth={2} />
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    paddingLeft: '0.75rem', paddingRight: '0.75rem', paddingTop: '0.4rem', paddingBottom: '0.4rem',
                                    borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700,
                                    backgroundColor: statusConfig.bg, color: statusConfig.text, border: `1.5px solid ${statusConfig.border}`,
                                    textTransform: 'capitalize' as const,
                                }}>
                                    {statusConfig.label}
                                </div>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Filed</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                <Calendar size={20} color={THEME.primary} strokeWidth={2} />
                                <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500 }}>{new Date(report.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</p>
                            <div style={{ padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
                            >
                                <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500, lineHeight: 1.6 }}>{report.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Existing Admin Notes & Reviewed At */}
                    {(report.admin_notes || report.reviewed_at) && (
                        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #E5E7EB' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                                <div style={{ padding: '0.6rem', background: '#E7F1FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MessageSquare size={20} color={THEME.primary} strokeWidth={2.5} />
                                </div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.3px' }}>Admin Review</h4>
                            </div>
                            {report.reviewed_at && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reviewed At</p>
                                    <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500 }}>{new Date(report.reviewed_at).toLocaleString()}</p>
                                </div>
                            )}
                            {report.admin_notes && (
                                <div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', margin: 0, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Notes</p>
                                    <div style={{ padding: '0.9rem 1.1rem', background: '#F0F4FF', borderRadius: '12px', border: '1.5px solid #cfe2ff' }}>
                                        <p style={{ margin: 0, color: '#0a0e27', fontSize: '0.96rem', fontWeight: 500, lineHeight: 1.6 }}>{report.admin_notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Reporter & Reported User Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                    {/* Reporter Card */}
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.6rem', background: '#E7F1FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={20} color={THEME.primary} strokeWidth={2.5} />
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.3px' }}>Reporter</h3>
                        </div>
                        {report.reporter ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                    <UserAvatar imageUrl={report.reporter.profile_image_url} name={report.reporter.full_name} size="large" />
                                    <div>
                                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.3px' }}>{report.reporter.full_name}</h4>
                                        <p style={{ fontSize: '0.95rem', color: '#6B7280', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>@{report.reporter.username}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                    <Mail size={18} color={THEME.primary} strokeWidth={2} />
                                    <p style={{ margin: 0, color: '#4B5563', fontSize: '0.92rem', fontWeight: 500 }}>{report.reporter.email}</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                                <p style={{ margin: 0, fontSize: '0.95rem', fontStyle: 'italic' }}>Reporter account has been deleted</p>
                            </div>
                        )}
                    </div>

                    {/* Reported User Card */}
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.6rem', background: '#ffebee', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield size={20} color={THEME.danger} strokeWidth={2.5} />
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.3px' }}>Reported User</h3>
                        </div>
                        {report.reported_user ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                    <UserAvatar imageUrl={report.reported_user.profile_image_url} name={report.reported_user.full_name} size="large" />
                                    <div>
                                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.3px' }}>{report.reported_user.full_name}</h4>
                                        <p style={{ fontSize: '0.95rem', color: '#6B7280', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>@{report.reported_user.username}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                        <Mail size={18} color={THEME.primary} strokeWidth={2} />
                                        <p style={{ margin: 0, color: '#4B5563', fontSize: '0.92rem', fontWeight: 500 }}>{report.reported_user.email}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                                        <Shield size={18} color={THEME.primary} strokeWidth={2} />
                                        <p style={{ margin: 0, color: '#4B5563', fontSize: '0.92rem', fontWeight: 500 }}>Account Status: </p>
                                        {(() => {
                                            const accConfig = accountStatusConfig[report.reported_user.account_status] || accountStatusConfig.inactive;
                                            return (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                    paddingLeft: '0.6rem', paddingRight: '0.6rem', paddingTop: '0.35rem', paddingBottom: '0.35rem',
                                                    borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700,
                                                    backgroundColor: accConfig.bg, color: accConfig.text, border: `1.5px solid ${accConfig.border}`,
                                                    textTransform: 'capitalize' as const,
                                                }}>
                                                    {report.reported_user.account_status}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                                <p style={{ margin: 0, fontSize: '0.95rem', fontStyle: 'italic' }}>Reported user account has been deleted</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Admin Action Panel */}
                {(report.status === 'pending' || report.status === 'reviewing') && (
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '2rem', letterSpacing: '-0.3px' }}>Admin Actions</h3>

                        {/* Admin Notes Textarea */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a0e27', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Admin Notes
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add notes about this report (required for resolve/dismiss)..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '12px',
                                    fontSize: '0.96rem',
                                    color: '#0a0e27',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: '#FFFFFF',
                                    fontWeight: 500,
                                    outline: 'none',
                                    boxSizing: 'border-box' as const,
                                }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {report.status === 'pending' && (
                                <button
                                    onClick={handleReview}
                                    disabled={processing}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                        paddingLeft: '1.1rem', paddingRight: '1.1rem', paddingTop: '0.85rem', paddingBottom: '0.85rem',
                                        background: '#FFFFFF', color: THEME.info, border: `2px solid ${THEME.info}30`, borderRadius: '12px',
                                        fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        fontSize: '0.92rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', letterSpacing: '0.3px',
                                        opacity: processing ? 0.6 : 1,
                                    }}
                                    onMouseEnter={(e) => { if (!processing) { e.currentTarget.style.background = THEME.info + '15'; e.currentTarget.style.borderColor = THEME.info + '60'; e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.info}25`; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                                    onMouseLeave={(e) => { if (!processing) { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.info + '30'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                                >
                                    <Eye size={18} />
                                    Mark as Reviewing
                                </button>
                            )}
                            <button
                                onClick={handleResolve}
                                disabled={processing}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                    paddingLeft: '1.1rem', paddingRight: '1.1rem', paddingTop: '0.85rem', paddingBottom: '0.85rem',
                                    background: '#FFFFFF', color: THEME.success, border: `2px solid ${THEME.success}30`, borderRadius: '12px',
                                    fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontSize: '0.92rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', letterSpacing: '0.3px',
                                    opacity: processing ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => { if (!processing) { e.currentTarget.style.background = THEME.success + '15'; e.currentTarget.style.borderColor = THEME.success + '60'; e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.success}25`; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                                onMouseLeave={(e) => { if (!processing) { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.success + '30'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                            >
                                <CheckCircle size={18} />
                                Resolve Report
                            </button>
                            <button
                                onClick={handleDismiss}
                                disabled={processing}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                    paddingLeft: '1.1rem', paddingRight: '1.1rem', paddingTop: '0.85rem', paddingBottom: '0.85rem',
                                    background: '#FFFFFF', color: THEME.secondary, border: `2px solid ${THEME.secondary}30`, borderRadius: '12px',
                                    fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontSize: '0.92rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', letterSpacing: '0.3px',
                                    opacity: processing ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => { if (!processing) { e.currentTarget.style.background = THEME.secondary + '15'; e.currentTarget.style.borderColor = THEME.secondary + '60'; e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.secondary}25`; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                                onMouseLeave={(e) => { if (!processing) { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.secondary + '30'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                            >
                                <XCircle size={18} />
                                Dismiss Report
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
