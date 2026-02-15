import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Send,
    Loader2,
    Trash2,
    Eye,
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

const statusBadgeClass: Record<string, string> = {
    new: 'ap-badge ap-badge-warning',
    unread: 'ap-badge ap-badge-warning',
    read: 'ap-badge ap-badge-info',
    responded: 'ap-badge ap-badge-success',
};

const statusLabel: Record<string, string> = {
    new: 'New',
    unread: 'Unread',
    read: 'Read',
    responded: 'Responded',
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

    return (
        <AdminLayout>
            <div>
{/* Page Header */}
                <div className="ap-page-header-row">
                    <div className="ap-flex ap-items-center ap-gap-md">
                        <button onClick={handleBack} className="ap-back-btn">
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 className="ap-page-title">Contact Submission</h1>
                            <p className="ap-page-subtitle">View details and respond to this submission</p>
                        </div>
                    </div>
                    <div className="ap-page-header-actions">
                        {submission.status !== 'read' && submission.status !== 'responded' && (
                            <button onClick={handleMarkRead} className="ap-btn ap-btn-ghost ap-btn-sm">
                                <Eye size={16} />
                                Mark as Read
                            </button>
                        )}
                        <button onClick={handleDelete} className="ap-btn ap-btn-danger ap-btn-sm">
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Submission Details Card */}
                <div className="ap-card-lg">
                    <div className="ap-flex ap-items-center ap-justify-between ap-mb-xl ap-flex-wrap ap-gap-md">
                        <h3 className="ap-card-title">Submission Details</h3>
                        <span className={statusBadgeClass[submission.status] || 'ap-badge ap-badge-warning'}>
                            {statusLabel[submission.status] || 'New'}
                        </span>
                    </div>

                    <div className="ap-grid-2 ap-mb-xl">
                        <div className="ap-detail-row">
                            <span className="ap-detail-label">Name</span>
                            <span className="ap-detail-value">{submission.name}</span>
                        </div>
                        <div className="ap-detail-row">
                            <span className="ap-detail-label">Email</span>
                            <span className="ap-detail-value">{submission.email}</span>
                        </div>
                        <div className="ap-detail-row">
                            <span className="ap-detail-label">Subject</span>
                            <span className="ap-detail-value">{submission.subject}</span>
                        </div>
                        <div className="ap-detail-row">
                            <span className="ap-detail-label">Submitted</span>
                            <span className="ap-detail-value">{submission.created_at}</span>
                        </div>
                    </div>

                    <div className="ap-detail-row">
                        <span className="ap-detail-label">Message</span>
                        <span className="ap-detail-value ap-whitespace-pre">
                            {submission.message}
                        </span>
                    </div>
                </div>

                {/* Admin Response (if exists) */}
                {submission.admin_response && (
                    <div className="ap-card-lg">
                        <div className="ap-alert ap-alert-success">
                            <p className="ap-alert-title">Admin Response</p>
                            <p className="ap-alert-text ap-whitespace-pre">
                                {submission.admin_response}
                            </p>
                        </div>
                    </div>
                )}

                {/* Reply Form */}
                <div className="ap-card-lg">
                    <h3 className="ap-card-title ap-mb-lg">
                        {submission.admin_response ? 'Send Another Response' : 'Reply'}
                    </h3>

                    <form onSubmit={handleRespond}>
                        <div className="ap-form-group">
                            <textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Type your response here..."
                                required
                                className="ap-form-textarea"
                                style={{ minHeight: '160px' }}
                            />
                        </div>

                        <div className="ap-flex ap-justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting || !response.trim()}
                                className="ap-btn ap-btn-primary"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={18} className="ap-spin" />
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
