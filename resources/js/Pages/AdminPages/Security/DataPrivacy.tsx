import { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Lock,
    Users,
    Download,
    UserX,
    AlertTriangle,
    Shield,
    ArrowLeft,
    FileDown,
} from 'lucide-react';

interface Props {
    stats: {
        total_users: number;
        data_export_requests: number;
        anonymized_accounts: number;
    };
}

export default function DataPrivacy({ stats }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const [exportUserId, setExportUserId] = useState('');
    const [anonymizeUserId, setAnonymizeUserId] = useState('');
    const [exporting, setExporting] = useState(false);
    const [anonymizing, setAnonymizing] = useState(false);
    const [showAnonymizeConfirm, setShowAnonymizeConfirm] = useState(false);

    const handleExport = useCallback(() => {
        if (!exportUserId.trim()) return;
        setExporting(true);
        router.post(route('admin.security.dataExport', exportUserId), {}, {
            preserveScroll: true,
            onFinish: () => setExporting(false),
            onSuccess: () => setExportUserId(''),
        });
    }, [exportUserId]);

    const handleAnonymize = useCallback(() => {
        if (!anonymizeUserId.trim()) return;
        setAnonymizing(true);
        router.post(route('admin.security.anonymize', anonymizeUserId), {}, {
            preserveScroll: true,
            onFinish: () => {
                setAnonymizing(false);
                setShowAnonymizeConfirm(false);
            },
            onSuccess: () => setAnonymizeUserId(''),
        });
    }, [anonymizeUserId]);

    const statCards = [
        { label: 'Total Users', value: stats.total_users, icon: Users, iconClass: 'indigo' },
        { label: 'Data Export Requests', value: stats.data_export_requests, icon: Download, iconClass: 'blue' },
        { label: 'Anonymized Accounts', value: stats.anonymized_accounts, icon: UserX, iconClass: 'amber' },
    ];

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
                    <h1 className="ap-page-title">Data Privacy & GDPR</h1>
                    <p className="ap-page-subtitle">
                        Manage user data exports, anonymization requests, and GDPR compliance
                    </p>
                </div>

                {/* Back to Security Dashboard */}
                <button
                    className="ap-back-btn"
                    onClick={() => router.get(route('admin.security.dashboard'))}
                >
                    <ArrowLeft size={14} />
                    Back to Security
                </button>

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

                {/* Main Content Grid */}
                <div className="ap-grid-2 ap-mb-xl">
                    {/* User Data Export Section */}
                    <div className="ap-card ap-card-lg">
                        <div className="ap-flex ap-items-center ap-gap-md ap-mb-lg">
                            <div className="ap-stat-icon blue">
                                <FileDown size={20} />
                            </div>
                            <div>
                                <h3 className="ap-card-title">User Data Export</h3>
                                <p className="ap-card-subtitle">Export all data associated with a user (GDPR Art. 20)</p>
                            </div>
                        </div>

                        <div className="ap-form-group">
                            <label className="ap-form-label">User ID</label>
                            <input
                                className="ap-form-input"
                                type="text"
                                value={exportUserId}
                                onChange={(e) => setExportUserId(e.target.value)}
                                placeholder="Enter user ID to export data"
                                onKeyPress={(e) => e.key === 'Enter' && handleExport()}
                            />
                        </div>

                        <button
                            className="ap-btn ap-btn-primary ap-btn-block"
                            onClick={handleExport}
                            disabled={exporting || !exportUserId.trim()}
                        >
                            <Download size={16} />
                            {exporting ? 'Exporting...' : 'Export User Data'}
                        </button>
                    </div>

                    {/* User Data Anonymization Section */}
                    <div className="ap-card ap-card-lg">
                        <div className="ap-flex ap-items-center ap-gap-md ap-mb-lg">
                            <div className="ap-stat-icon red">
                                <UserX size={20} />
                            </div>
                            <div>
                                <h3 className="ap-card-title">User Data Anonymization</h3>
                                <p className="ap-card-subtitle">Permanently anonymize all user data (GDPR Art. 17)</p>
                            </div>
                        </div>

                        {/* Warning Notice */}
                        <div className="ap-alert ap-alert-warning">
                            <AlertTriangle size={16} />
                            <div>
                                <p className="ap-alert-title">Irreversible Action</p>
                                <p className="ap-alert-text">
                                    This will permanently replace all personally identifiable information with anonymized data. This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="ap-form-group">
                            <label className="ap-form-label">User ID</label>
                            <input
                                className="ap-form-input"
                                type="text"
                                value={anonymizeUserId}
                                onChange={(e) => setAnonymizeUserId(e.target.value)}
                                placeholder="Enter user ID to anonymize"
                            />
                        </div>

                        {!showAnonymizeConfirm ? (
                            <button
                                className="ap-btn ap-btn-danger ap-btn-block"
                                onClick={() => {
                                    if (anonymizeUserId.trim()) {
                                        setShowAnonymizeConfirm(true);
                                    }
                                }}
                                disabled={!anonymizeUserId.trim()}
                            >
                                <UserX size={16} />
                                Anonymize User Data
                            </button>
                        ) : (
                            <div className="ap-alert ap-alert-danger">
                                <div>
                                    <p className="ap-alert-title">
                                        Are you absolutely sure you want to anonymize all data for User ID: {anonymizeUserId}?
                                    </p>
                                    <p className="ap-alert-text ap-mb-lg">
                                        This will permanently remove all personal information including name, email, profile data, and any other PII. This action is irreversible.
                                    </p>
                                    <div className="ap-flex ap-gap-sm">
                                        <button
                                            className="ap-btn ap-btn-danger"
                                            onClick={handleAnonymize}
                                            disabled={anonymizing}
                                        >
                                            <Shield size={14} />
                                            {anonymizing ? 'Anonymizing...' : 'Yes, Anonymize'}
                                        </button>
                                        <button
                                            className="ap-btn ap-btn-secondary"
                                            onClick={() => setShowAnonymizeConfirm(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* GDPR Compliance Info */}
                <div className="ap-card ap-card-lg">
                    <div className="ap-flex ap-items-center ap-gap-sm ap-mb-lg">
                        <Shield size={18} className="ap-text-secondary" />
                        <h3 className="ap-card-title">GDPR Compliance Information</h3>
                    </div>
                    <div className="ap-grid-3">
                        {[
                            { title: 'Right to Access (Art. 15)', description: 'Users have the right to obtain confirmation on whether their personal data is being processed and access to that data.' },
                            { title: 'Right to Portability (Art. 20)', description: 'Users have the right to receive their personal data in a structured, commonly used format.' },
                            { title: 'Right to Erasure (Art. 17)', description: 'Users have the right to have their personal data erased under certain conditions.' },
                        ].map((item, idx) => (
                            <div className="ap-card" key={idx}>
                                <h4 className="ap-section-title" style={{ color: 'var(--ap-primary)' }}>
                                    {item.title}
                                </h4>
                                <p className="ap-text-secondary ap-text-sm ap-mb-0">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
