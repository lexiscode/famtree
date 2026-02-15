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

const statusBadgeMap: Record<string, { className: string; icon: any; label: string }> = {
    pending: { className: 'ap-badge ap-badge-warning', icon: Clock, label: 'Pending' },
    reviewing: { className: 'ap-badge ap-badge-info', icon: Eye, label: 'Reviewing' },
    resolved: { className: 'ap-badge ap-badge-success', icon: CheckCircle, label: 'Resolved' },
    dismissed: { className: 'ap-badge ap-badge-neutral', icon: XCircle, label: 'Dismissed' },
};

const accountStatusBadgeMap: Record<string, string> = {
    active: 'ap-badge ap-badge-success',
    inactive: 'ap-badge ap-badge-neutral',
    suspended: 'ap-badge ap-badge-danger',
};

function UserAvatar({ imageUrl, name, size = 'md' }: { imageUrl: string | null; name: string; size?: 'md' | 'xl' }) {
    const [imageError, setImageError] = useState(false);
    const sizeClass = size === 'xl' ? 'ap-avatar-xl' : 'ap-avatar-md';

    if (imageUrl && !imageError) {
        return (
            <div className={`ap-avatar ${sizeClass} ap-avatar-indigo`}>
                <img src={imageUrl} alt={name} onError={() => setImageError(true)} />
            </div>
        );
    }

    return (
        <div className={`ap-avatar ${sizeClass} ap-avatar-indigo`}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function Show({ report }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [adminNotes, setAdminNotes] = useState(report.admin_notes || '');
    const [processing, setProcessing] = useState(false);

    const statusConfig = statusBadgeMap[report.status] || statusBadgeMap.pending;
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
{/* Back Button & Header */}
                <button className="ap-back-btn" onClick={() => router.get(route('admin.reports.index'))}>
                    <ArrowLeft size={16} /> Back to Reports
                </button>
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Report Details</h1>
                    <p className="ap-page-subtitle">Review and take action on report #{report.id}</p>
                </div>

                {/* Report Details Card */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-card-header">
                        <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                            <AlertTriangle size={18} />
                            Report Information
                        </h3>
                    </div>

                    <div className="ap-form-row ap-mb-lg">
                        <div>
                            <div className="ap-detail-row">
                                <span className="ap-detail-label">Report ID</span>
                                <span className="ap-detail-value">#{report.id}</span>
                            </div>
                        </div>
                        <div>
                            <div className="ap-detail-row">
                                <span className="ap-detail-label">Reason</span>
                                <span className="ap-detail-value ap-capitalize">{report.reason.replace(/_/g, ' ')}</span>
                            </div>
                        </div>
                        <div>
                            <div className="ap-detail-row">
                                <span className="ap-detail-label">Status</span>
                                <span className="ap-detail-value">
                                    <span className={statusConfig.className}>
                                        <StatusIcon size={12} />
                                        {statusConfig.label}
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="ap-detail-row">
                                <span className="ap-detail-label">Date Filed</span>
                                <span className="ap-detail-value">{new Date(report.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="ap-detail-row">
                        <span className="ap-detail-label">Description</span>
                        <span className="ap-detail-value">{report.description}</span>
                    </div>

                    {/* Existing Admin Notes & Reviewed At */}
                    {(report.admin_notes || report.reviewed_at) && (
                        <>
                            <hr className="ap-divider" />
                            <h4 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                                <MessageSquare size={16} />
                                Admin Review
                            </h4>
                            {report.reviewed_at && (
                                <div className="ap-detail-row">
                                    <span className="ap-detail-label">Reviewed At</span>
                                    <span className="ap-detail-value">{new Date(report.reviewed_at).toLocaleString()}</span>
                                </div>
                            )}
                            {report.admin_notes && (
                                <div className="ap-detail-row">
                                    <span className="ap-detail-label">Admin Notes</span>
                                    <span className="ap-detail-value">{report.admin_notes}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Reporter & Reported User Cards */}
                <div className="ap-grid-2 ap-mb-xl">
                    {/* Reporter Card */}
                    <div className="ap-card ap-card-lg">
                        <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm ap-mb-lg">
                            <User size={18} />
                            Reporter
                        </h3>
                        {report.reporter ? (
                            <div>
                                <div className="ap-flex ap-items-center ap-gap-md ap-mb-lg">
                                    <UserAvatar imageUrl={report.reporter.profile_image_url} name={report.reporter.full_name} size="xl" />
                                    <div>
                                        <p className="ap-user-cell-name">{report.reporter.full_name}</p>
                                        <p className="ap-user-cell-sub">@{report.reporter.username}</p>
                                    </div>
                                </div>
                                <div className="ap-detail-row">
                                    <span className="ap-detail-label">Email</span>
                                    <span className="ap-detail-value">{report.reporter.email}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="ap-text-secondary ap-text-sm">Reporter account has been deleted</p>
                        )}
                    </div>

                    {/* Reported User Card */}
                    <div className="ap-card ap-card-lg">
                        <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm ap-mb-lg">
                            <Shield size={18} />
                            Reported User
                        </h3>
                        {report.reported_user ? (
                            <div>
                                <div className="ap-flex ap-items-center ap-gap-md ap-mb-lg">
                                    <UserAvatar imageUrl={report.reported_user.profile_image_url} name={report.reported_user.full_name} size="xl" />
                                    <div>
                                        <p className="ap-user-cell-name">{report.reported_user.full_name}</p>
                                        <p className="ap-user-cell-sub">@{report.reported_user.username}</p>
                                    </div>
                                </div>
                                <div className="ap-detail-row">
                                    <span className="ap-detail-label">Email</span>
                                    <span className="ap-detail-value">{report.reported_user.email}</span>
                                </div>
                                <div className="ap-detail-row">
                                    <span className="ap-detail-label">Account Status</span>
                                    <span className="ap-detail-value">
                                        <span className={accountStatusBadgeMap[report.reported_user.account_status] || 'ap-badge ap-badge-neutral'}>
                                            <span className="ap-capitalize">{report.reported_user.account_status}</span>
                                        </span>
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="ap-text-secondary ap-text-sm">Reported user account has been deleted</p>
                        )}
                    </div>
                </div>

                {/* Admin Action Panel */}
                {(report.status === 'pending' || report.status === 'reviewing') && (
                    <div className="ap-card ap-card-lg">
                        <h3 className="ap-card-title ap-mb-lg">Admin Actions</h3>

                        {/* Admin Notes Textarea */}
                        <div className="ap-form-group">
                            <label className="ap-form-label">Admin Notes</label>
                            <textarea
                                className="ap-form-textarea"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add notes about this report (required for resolve/dismiss)..."
                                rows={4}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="ap-flex ap-gap-md" style={{ flexWrap: 'wrap' }}>
                            {report.status === 'pending' && (
                                <button
                                    className="ap-btn ap-btn-secondary"
                                    onClick={handleReview}
                                    disabled={processing}
                                >
                                    <Eye size={16} />
                                    Mark as Reviewing
                                </button>
                            )}
                            <button
                                className="ap-btn ap-btn-success"
                                onClick={handleResolve}
                                disabled={processing}
                            >
                                <CheckCircle size={16} />
                                Resolve Report
                            </button>
                            <button
                                className="ap-btn ap-btn-ghost"
                                onClick={handleDismiss}
                                disabled={processing}
                            >
                                <XCircle size={16} />
                                Dismiss Report
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
