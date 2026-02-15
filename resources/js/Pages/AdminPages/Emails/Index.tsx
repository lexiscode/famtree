import { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Mail,
    Send,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    AlertTriangle,
} from 'lucide-react';

interface EmailLog {
    id: number;
    recipient: string;
    type: string;
    status: string;
    error: string | null;
    sent_at: string;
    sent_at_formatted: string;
}

interface PaginatedData {
    data: EmailLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Statistics {
    total_sent: number;
    failed: number;
    success_rate: number;
}

interface Props {
    emails: PaginatedData;
    statistics: Statistics;
    perPage: number;
}

export default function Index({ emails, statistics, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    const handleSendTest = useCallback(() => {
        if (!testEmail.trim()) return;
        setSendingTest(true);
        router.post(route('admin.emails.test'), {
            email: testEmail.trim(),
        }, {
            preserveScroll: true,
            onFinish: () => {
                setSendingTest(false);
                setTestEmail('');
            },
        });
    }, [testEmail]);

    const handlePageChange = useCallback((page: number) => {
        router.get(route('admin.emails.index'), { page, per_page: perPage }, { preserveScroll: true });
    }, [perPage]);

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = emails.current_page;
        const last = emails.last_page;

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

    const getStatusBadge = (status: string) => {
        const isSent = status === 'sent';
        const Icon = isSent ? CheckCircle : XCircle;
        const badgeClass = isSent ? 'ap-badge ap-badge-success' : 'ap-badge ap-badge-danger';

        return (
            <span className={`${badgeClass} ap-capitalize`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    const statCards = [
        { label: 'Total Sent', value: statistics.total_sent, icon: Mail, iconClass: 'indigo' },
        { label: 'Failed', value: statistics.failed, icon: XCircle, iconClass: 'red' },
        { label: 'Success Rate', value: `${statistics.success_rate}%`, icon: BarChart3, iconClass: 'green' },
    ];

    return (
        <AdminLayout>
            <div>
{/* Page Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Email Management</h1>
                    <p className="ap-page-subtitle">
                        Monitor email delivery, track failures, and send test emails
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {statCards.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div className="ap-stat-card" key={idx}>
                                <div className="ap-stat-card-header">
                                    <p className="ap-stat-label">{stat.label}</p>
                                    <div className={`ap-stat-icon ${stat.iconClass}`}>
                                        <Icon size={20} />
                                    </div>
                                </div>
                                <p className="ap-stat-value">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Test Email Section */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-flex ap-items-center ap-gap-sm ap-mb-lg">
                        <Send size={18} className="ap-text-secondary" />
                        <h2 className="ap-card-title">Send Test Email</h2>
                    </div>

                    <div className="ap-flex ap-gap-md ap-flex-wrap ap-items-end">
                        <div className="ap-form-input-flex">
                            <label className="ap-form-label">Email Address</label>
                            <input
                                className="ap-form-input"
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="Enter recipient email address..."
                                onKeyPress={(e) => e.key === 'Enter' && handleSendTest()}
                            />
                        </div>

                        <button
                            className="ap-btn ap-btn-primary ap-btn-lg"
                            onClick={handleSendTest}
                            disabled={sendingTest || !testEmail.trim()}
                        >
                            <Send size={16} />
                            {sendingTest ? 'Sending...' : 'Send Test'}
                        </button>
                    </div>
                </div>

                {/* View Failed Emails Link */}
                <div className="ap-flex ap-mb-xl ap-justify-end">
                    <button
                        className="ap-btn ap-btn-danger"
                        onClick={() => router.get(route('admin.emails.failed'))}
                    >
                        <AlertTriangle size={16} />
                        View Failed Emails
                    </button>
                </div>

                {/* Email Logs Table */}
                <div className="ap-table-wrap">
                    {emails.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Recipient</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Error</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {emails.data.map((email) => (
                                        <tr key={email.id}>
                                            <td>
                                                <span className="ap-font-semibold">{email.recipient}</span>
                                            </td>
                                            <td>
                                                <span className="ap-badge ap-badge-primary ap-capitalize">
                                                    {email.type.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(email.status)}</td>
                                            <td className="ap-max-w-200">
                                                {email.error ? (
                                                    <p className="ap-truncate ap-text-sm ap-mb-0 ap-text-danger">
                                                        {email.error}
                                                    </p>
                                                ) : (
                                                    <span className="ap-text-tertiary">--</span>
                                                )}
                                            </td>
                                            <td className="secondary">{email.sent_at_formatted}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Mail size={28} />
                            </div>
                            <p className="ap-empty-title">No email logs found</p>
                            <p className="ap-empty-text">Email logs will appear here once emails are sent</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {emails.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{emails.from}</strong> to <strong>{emails.to}</strong> of <strong>{emails.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(emails.current_page - 1)}
                                disabled={emails.current_page === 1}
                            >
                                <ChevronLeft size={14} />
                                Prev
                            </button>

                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    className={`ap-page-btn ${page === emails.current_page ? 'active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(emails.current_page + 1)}
                                disabled={emails.current_page === emails.last_page}
                            >
                                Next
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
