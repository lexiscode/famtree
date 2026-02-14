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
    Zap,
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

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

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
        { label: 'Total Users', value: stats.total_users, icon: Users, color: THEME.primary, lightColor: '#e7f1ff' },
        { label: 'Data Export Requests', value: stats.data_export_requests, icon: Download, color: THEME.info, lightColor: '#e0f7fa' },
        { label: 'Anonymized Accounts', value: stats.anonymized_accounts, icon: UserX, color: THEME.secondary, lightColor: '#f3f4f6' },
    ];

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.currentTarget.style.borderColor = THEME.primary;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`;
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.boxShadow = 'none';
    };

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Flash Messages */}
                {flash?.success && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        background: '#e8f5e9',
                        border: `2px solid ${THEME.success}`,
                        color: THEME.success,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                    }}>
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        background: '#ffebee',
                        border: `2px solid ${THEME.danger}`,
                        color: THEME.danger,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                    }}>
                        {flash.error}
                    </div>
                )}

                {/* Gradient Header */}
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
                            <Lock size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                Data Privacy & GDPR
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            Manage user data exports, anonymization requests, and GDPR compliance
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                GDPR compliant data management tools
                            </span>
                        </div>
                    </div>
                </div>

                {/* Back to Security Dashboard */}
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => router.get(route('admin.security.dashboard'))}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.7rem 1.25rem',
                            background: '#FFFFFF',
                            color: THEME.primary,
                            border: '2px solid #E5E7EB',
                            borderRadius: '12px',
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = THEME.primary;
                            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <ArrowLeft size={16} strokeWidth={2.5} />
                        Back to Security
                    </button>
                </div>

                {/* Stats Grid */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem' }}>
                        {statCards.map((stat, idx) => {
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

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem', marginBottom: '3rem' }}>
                    {/* User Data Export Section */}
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                background: '#e0f7fa',
                            }}>
                                <FileDown size={24} color={THEME.info} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27' }}>
                                    User Data Export
                                </h3>
                                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#6c757d', fontWeight: 500 }}>
                                    Export all data associated with a user (GDPR Art. 20)
                                </p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: '#0a0e27',
                                marginBottom: '0.65rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}>
                                User ID
                            </label>
                            <input
                                type="text"
                                value={exportUserId}
                                onChange={(e) => setExportUserId(e.target.value)}
                                placeholder="Enter user ID to export data"
                                style={{
                                    width: '100%',
                                    padding: '0.85rem 1.15rem',
                                    border: '2.5px solid #E5E7EB',
                                    borderRadius: '12px',
                                    fontSize: '0.96rem',
                                    color: '#0a0e27',
                                    fontWeight: 500,
                                    background: '#FFFFFF',
                                    transition: 'all 0.3s ease',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                onKeyPress={(e) => e.key === 'Enter' && handleExport()}
                            />
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={exporting || !exportUserId.trim()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.85rem 1.75rem',
                                background: `linear-gradient(135deg, ${THEME.info} 0%, #0bb5d6 100%)`,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: 700,
                                fontSize: '0.96rem',
                                cursor: exporting || !exportUserId.trim() ? 'not-allowed' : 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: exporting || !exportUserId.trim() ? 0.6 : 1,
                                boxShadow: `0 4px 12px ${THEME.info}25`,
                                letterSpacing: '0.3px',
                                width: '100%',
                                justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => {
                                if (!exporting && exportUserId.trim()) {
                                    e.currentTarget.style.boxShadow = `0 16px 32px ${THEME.info}40`;
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!exporting && exportUserId.trim()) {
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.info}25`;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            <Download size={18} strokeWidth={2.5} />
                            {exporting ? 'Exporting...' : 'Export User Data'}
                        </button>
                    </div>

                    {/* User Data Anonymization Section */}
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                background: '#ffebee',
                            }}>
                                <UserX size={24} color={THEME.danger} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27' }}>
                                    User Data Anonymization
                                </h3>
                                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#6c757d', fontWeight: 500 }}>
                                    Permanently anonymize all user data (GDPR Art. 17)
                                </p>
                            </div>
                        </div>

                        {/* Warning Notice */}
                        <div style={{
                            padding: '1rem 1.25rem',
                            background: '#fff8e1',
                            border: `2px solid ${THEME.warning}`,
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'flex-start',
                        }}>
                            <AlertTriangle size={20} color="#856404" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#856404' }}>
                                    Irreversible Action
                                </p>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#856404', lineHeight: 1.5 }}>
                                    This will permanently replace all personally identifiable information with anonymized data. This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: '#0a0e27',
                                marginBottom: '0.65rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}>
                                User ID
                            </label>
                            <input
                                type="text"
                                value={anonymizeUserId}
                                onChange={(e) => setAnonymizeUserId(e.target.value)}
                                placeholder="Enter user ID to anonymize"
                                style={{
                                    width: '100%',
                                    padding: '0.85rem 1.15rem',
                                    border: '2.5px solid #E5E7EB',
                                    borderRadius: '12px',
                                    fontSize: '0.96rem',
                                    color: '#0a0e27',
                                    fontWeight: 500,
                                    background: '#FFFFFF',
                                    transition: 'all 0.3s ease',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        </div>

                        {!showAnonymizeConfirm ? (
                            <button
                                onClick={() => {
                                    if (anonymizeUserId.trim()) {
                                        setShowAnonymizeConfirm(true);
                                    }
                                }}
                                disabled={!anonymizeUserId.trim()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    padding: '0.85rem 1.75rem',
                                    background: '#FFFFFF',
                                    color: THEME.danger,
                                    border: `2.5px solid ${THEME.danger}`,
                                    borderRadius: '14px',
                                    fontWeight: 700,
                                    fontSize: '0.96rem',
                                    cursor: !anonymizeUserId.trim() ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    opacity: !anonymizeUserId.trim() ? 0.6 : 1,
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                    letterSpacing: '0.3px',
                                    width: '100%',
                                    justifyContent: 'center',
                                }}
                                onMouseEnter={(e) => {
                                    if (anonymizeUserId.trim()) {
                                        e.currentTarget.style.background = THEME.danger;
                                        e.currentTarget.style.color = '#FFFFFF';
                                        e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.danger}35`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (anonymizeUserId.trim()) {
                                        e.currentTarget.style.background = '#FFFFFF';
                                        e.currentTarget.style.color = THEME.danger;
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                <UserX size={18} strokeWidth={2.5} />
                                Anonymize User Data
                            </button>
                        ) : (
                            <div style={{
                                padding: '1.5rem',
                                background: '#ffebee',
                                border: `2px solid ${THEME.danger}`,
                                borderRadius: '14px',
                            }}>
                                <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#842029' }}>
                                    Are you absolutely sure you want to anonymize all data for User ID: {anonymizeUserId}?
                                </p>
                                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.88rem', color: '#842029', lineHeight: 1.5 }}>
                                    This will permanently remove all personal information including name, email, profile data, and any other PII. This action is irreversible.
                                </p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={handleAnonymize}
                                        disabled={anonymizing}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1.5rem',
                                            background: `linear-gradient(135deg, ${THEME.danger} 0%, #b02a37 100%)`,
                                            color: '#FFFFFF',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            fontSize: '0.92rem',
                                            cursor: anonymizing ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease',
                                            opacity: anonymizing ? 0.6 : 1,
                                            boxShadow: `0 4px 12px ${THEME.danger}30`,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!anonymizing) {
                                                e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.danger}45`;
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!anonymizing) {
                                                e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.danger}30`;
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }
                                        }}
                                    >
                                        <Shield size={16} />
                                        {anonymizing ? 'Anonymizing...' : 'Yes, Anonymize'}
                                    </button>

                                    <button
                                        onClick={() => setShowAnonymizeConfirm(false)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: '#FFFFFF',
                                            color: '#6c757d',
                                            border: '2px solid #E5E7EB',
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            fontSize: '0.92rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#6c757d';
                                            e.currentTarget.style.color = '#0a0e27';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                            e.currentTarget.style.color = '#6c757d';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* GDPR Compliance Info */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        padding: '2rem',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Shield size={22} color={THEME.primary} strokeWidth={2} />
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27' }}>
                            GDPR Compliance Information
                        </h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        {[
                            { title: 'Right to Access (Art. 15)', description: 'Users have the right to obtain confirmation on whether their personal data is being processed and access to that data.' },
                            { title: 'Right to Portability (Art. 20)', description: 'Users have the right to receive their personal data in a structured, commonly used format.' },
                            { title: 'Right to Erasure (Art. 17)', description: 'Users have the right to have their personal data erased under certain conditions.' },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '1.25rem',
                                    background: '#f8f9fa',
                                    borderRadius: '14px',
                                    border: '1.5px solid #E5E7EB',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = THEME.primary + '40';
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}10`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 700, color: THEME.primary }}>
                                    {item.title}
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.88rem', color: '#6c757d', lineHeight: 1.6 }}>
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
