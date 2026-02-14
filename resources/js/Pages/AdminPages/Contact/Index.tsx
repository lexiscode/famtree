import { useCallback } from 'react';
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

const statusBadgeClass: Record<string, string> = {
    new: 'ap-badge ap-badge-warning',
    unread: 'ap-badge ap-badge-warning',
    read: 'ap-badge ap-badge-info',
    responded: 'ap-badge ap-badge-success',
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
            <div>
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="ap-flash ap-flash-success">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="ap-flash ap-flash-error">{flash.error}</div>
                )}

                {/* Page Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Contact Submissions</h1>
                    <p className="ap-page-subtitle">Review and respond to contact form submissions from visitors</p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total', value: statistics.total, icon: Inbox, color: 'indigo' },
                        { label: 'Unread', value: statistics.unread, icon: Mail, color: 'amber' },
                        { label: 'Read', value: statistics.read, icon: Eye, color: 'blue' },
                        { label: 'Responded', value: statistics.responded, icon: CheckCircle, color: 'green' },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="ap-stat-card">
                                <div className="ap-stat-card-header">
                                    <span className="ap-stat-label">{stat.label}</span>
                                    <span className={`ap-stat-icon ${stat.color}`}>
                                        <Icon size={20} />
                                    </span>
                                </div>
                                <span className="ap-stat-value">{stat.value}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Contact Submissions Table */}
                <div className="ap-table-wrap">
                    {submissions.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Subject</th>
                                        <th className="center">Status</th>
                                        <th>Date</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.data.map((submission) => (
                                        <tr key={submission.id}>
                                            <td>
                                                <span className="ap-font-semibold">{submission.name}</span>
                                            </td>
                                            <td className="secondary">{submission.email}</td>
                                            <td className="secondary">{submission.subject}</td>
                                            <td className="center">
                                                <span className={statusBadgeClass[submission.status] || 'ap-badge ap-badge-warning'}>
                                                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="secondary">{submission.created_at_formatted}</td>
                                            <td className="center">
                                                <button
                                                    onClick={() => router.get(route('admin.contact.show', submission.id))}
                                                    className="ap-btn ap-btn-primary ap-btn-sm"
                                                >
                                                    <MessageSquare size={15} />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Mail size={40} />
                            </div>
                            <p className="ap-empty-title">No contact submissions found</p>
                            <p className="ap-empty-text">Submissions will appear here when visitors use the contact form</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {submissions.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{submissions.from}</strong> to{' '}
                            <strong>{submissions.to}</strong> of{' '}
                            <strong>{submissions.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            <button
                                onClick={() => handlePageChange(submissions.current_page - 1)}
                                disabled={submissions.current_page === 1}
                                className="ap-page-btn"
                            >
                                <ChevronLeft size={16} />
                                Prev
                            </button>

                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`ap-page-btn ${page === submissions.current_page ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(submissions.current_page + 1)}
                                disabled={submissions.current_page === submissions.last_page}
                                className="ap-page-btn"
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
