import { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Settings,
    Save,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Zap,
    Sliders,
    Gauge,
} from 'lucide-react';

interface Props {
    settings: Record<string, any>;
}

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

type TabKey = 'general' | 'features' | 'limits';

export default function General({ settings }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const [activeTab, setActiveTab] = useState<TabKey>('general');
    const [formData, setFormData] = useState<Record<string, any>>({ ...settings });
    const [saving, setSaving] = useState(false);
    const [clearingCache, setClearingCache] = useState(false);

    const tabs: { key: TabKey; label: string; icon: any }[] = [
        { key: 'general', label: 'General', icon: Settings },
        { key: 'features', label: 'Features', icon: ToggleRight },
        { key: 'limits', label: 'Limits', icon: Gauge },
    ];

    const handleChange = useCallback((key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleSave = useCallback(() => {
        setSaving(true);
        router.put(route('admin.settings.update'), { settings: formData }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    }, [formData]);

    const handleClearCache = useCallback(() => {
        setClearingCache(true);
        router.post(route('admin.settings.clearCache'), {}, {
            preserveScroll: true,
            onFinish: () => setClearingCache(false),
        });
    }, []);

    const handleFeatureToggle = useCallback((key: string) => {
        const newValue = !formData[key];
        const updated = { ...formData, [key]: newValue };
        setFormData(updated);
        router.put(route('admin.settings.update'), { settings: { [key]: newValue } }, {
            preserveScroll: true,
        });
    }, [formData]);

    const renderToggle = (key: string, label: string, description?: string) => {
        const isOn = !!formData[key];
        return (
            <div
                key={key}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    background: '#FFFFFF',
                    border: '2px solid #E5E7EB',
                    borderRadius: '14px',
                    transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = THEME.primary + '40';
                    e.currentTarget.style.boxShadow = `0 4px 16px ${THEME.primary}10`;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27' }}>
                        {label}
                    </p>
                    {description && (
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6c757d' }}>
                            {description}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => handleFeatureToggle(key)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                    {isOn ? (
                        <ToggleRight size={36} color={THEME.success} strokeWidth={2} />
                    ) : (
                        <ToggleLeft size={36} color={THEME.secondary} strokeWidth={2} />
                    )}
                </button>
            </div>
        );
    };

    const inputStyle: React.CSSProperties = {
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
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 700,
        color: '#0a0e27',
        marginBottom: '0.65rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    };

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
                            <Settings size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                System Settings
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            Configure platform settings, toggle features, and manage system limits
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Changes take effect immediately across the platform
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '2.5rem',
                    flexWrap: 'wrap',
                }}>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    padding: '0.85rem 1.75rem',
                                    borderRadius: '12px',
                                    border: `2.5px solid ${isActive ? THEME.primary : '#E5E7EB'}`,
                                    background: isActive ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)` : '#FFFFFF',
                                    color: isActive ? '#FFFFFF' : '#6c757d',
                                    fontWeight: 700,
                                    fontSize: '0.96rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: isActive ? `0 8px 24px ${THEME.primary}30` : '0 2px 8px rgba(0, 0, 0, 0.04)',
                                    letterSpacing: '0.3px',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.color = THEME.primary;
                                        e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.primary}15`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                        e.currentTarget.style.color = '#6c757d';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                <Icon size={18} strokeWidth={2.5} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* General Tab */}
                {activeTab === 'general' && (
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2.5rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <Sliders size={22} color={THEME.primary} strokeWidth={2} />
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27' }}>
                                General Configuration
                            </h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={labelStyle}>App Name</label>
                                <input
                                    type="text"
                                    value={formData.app_name || ''}
                                    onChange={(e) => handleChange('app_name', e.target.value)}
                                    style={inputStyle}
                                    placeholder="Enter application name"
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Contact Email</label>
                                <input
                                    type="email"
                                    value={formData.contact_email || ''}
                                    onChange={(e) => handleChange('contact_email', e.target.value)}
                                    style={inputStyle}
                                    placeholder="contact@example.com"
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Support Email</label>
                                <input
                                    type="email"
                                    value={formData.support_email || ''}
                                    onChange={(e) => handleChange('support_email', e.target.value)}
                                    style={inputStyle}
                                    placeholder="support@example.com"
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                            </div>
                        </div>

                        {/* Maintenance Mode Toggle */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.25rem 1.5rem',
                                background: formData.maintenance_mode ? '#fff8e1' : '#f8f9fa',
                                border: `2px solid ${formData.maintenance_mode ? THEME.warning : '#E5E7EB'}`,
                                borderRadius: '14px',
                                marginBottom: '2rem',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <div>
                                <p style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27' }}>
                                    Maintenance Mode
                                </p>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6c757d' }}>
                                    When enabled, the platform will show a maintenance page to all users
                                </p>
                            </div>
                            <button
                                onClick={() => handleChange('maintenance_mode', !formData.maintenance_mode)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'transform 0.2s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                {formData.maintenance_mode ? (
                                    <ToggleRight size={36} color={THEME.warning} strokeWidth={2} />
                                ) : (
                                    <ToggleLeft size={36} color={THEME.secondary} strokeWidth={2} />
                                )}
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleClearCache}
                                disabled={clearingCache}
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
                                    cursor: clearingCache ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    opacity: clearingCache ? 0.6 : 1,
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                }}
                                onMouseEnter={(e) => {
                                    if (!clearingCache) {
                                        e.currentTarget.style.background = THEME.danger;
                                        e.currentTarget.style.color = '#FFFFFF';
                                        e.currentTarget.style.boxShadow = `0 12px 24px ${THEME.danger}35`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!clearingCache) {
                                        e.currentTarget.style.background = '#FFFFFF';
                                        e.currentTarget.style.color = THEME.danger;
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                <Trash2 size={18} strokeWidth={2.5} />
                                {clearingCache ? 'Clearing...' : 'Clear Cache'}
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    padding: '0.85rem 2rem',
                                    background: `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontWeight: 700,
                                    fontSize: '0.96rem',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    opacity: saving ? 0.6 : 1,
                                    boxShadow: `0 4px 12px ${THEME.primary}25`,
                                    letterSpacing: '0.3px',
                                }}
                                onMouseEnter={(e) => {
                                    if (!saving) {
                                        e.currentTarget.style.boxShadow = `0 16px 32px ${THEME.primary}40`;
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!saving) {
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}25`;
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                <Save size={18} strokeWidth={2.5} />
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2.5rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <ToggleRight size={22} color={THEME.primary} strokeWidth={2} />
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27' }}>
                                Platform Features
                            </h2>
                        </div>
                        <p style={{ margin: '0 0 2rem 0', fontSize: '0.92rem', color: '#6c757d', fontWeight: 500 }}>
                            Enable or disable platform features. Changes apply immediately.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {renderToggle('feature_user_registration', 'User Registration', 'Allow new users to register on the platform')}
                            {renderToggle('feature_oauth_login', 'OAuth Login', 'Enable social login via third-party providers')}
                            {renderToggle('feature_voice_posts', 'Voice Posts', 'Allow users to create voice-based posts')}
                            {renderToggle('feature_family_tree_creation', 'Family Tree Creation', 'Allow users to create and manage family trees')}
                            {renderToggle('feature_organization', 'Organization Features', 'Enable organization creation and management')}
                            {renderToggle('feature_blog', 'Blog', 'Enable the public blog section')}
                            {renderToggle('feature_contact_form', 'Contact Form', 'Enable the contact form for visitors')}
                            {renderToggle('feature_deceased_verification', 'Deceased Verification', 'Enable the deceased member verification system')}
                            {renderToggle('feature_follow_system', 'Follow System', 'Allow users to follow other users')}
                            {renderToggle('feature_refam', 'Refam', 'Enable the Refam feature for reconnecting family members')}
                        </div>
                    </div>
                )}

                {/* Limits Tab */}
                {activeTab === 'limits' && (
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2.5rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <Gauge size={22} color={THEME.primary} strokeWidth={2} />
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27' }}>
                                System Limits
                            </h2>
                        </div>
                        <p style={{ margin: '0 0 2rem 0', fontSize: '0.92rem', color: '#6c757d', fontWeight: 500 }}>
                            Configure maximum limits for various platform features.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem', marginBottom: '2.5rem' }}>
                            {[
                                { key: 'limit_max_post_content_length', label: 'Max Post Content Length', placeholder: 'e.g., 5000' },
                                { key: 'limit_max_images_per_post', label: 'Max Images Per Post', placeholder: 'e.g., 10' },
                                { key: 'limit_max_voice_duration', label: 'Max Voice Duration (seconds)', placeholder: 'e.g., 120' },
                                { key: 'limit_max_gallery_images', label: 'Max Gallery Images', placeholder: 'e.g., 100' },
                                { key: 'limit_max_child_accounts', label: 'Max Child Accounts Per User', placeholder: 'e.g., 5' },
                                { key: 'limit_max_family_tree_members', label: 'Max Family Tree Members', placeholder: 'e.g., 200' },
                            ].map((field) => (
                                <div key={field.key}>
                                    <label style={labelStyle}>{field.label}</label>
                                    <input
                                        type="number"
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleChange(field.key, parseInt(e.target.value) || '')}
                                        style={inputStyle}
                                        placeholder={field.placeholder}
                                        min={0}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    padding: '0.85rem 2rem',
                                    background: `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontWeight: 700,
                                    fontSize: '0.96rem',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    opacity: saving ? 0.6 : 1,
                                    boxShadow: `0 4px 12px ${THEME.primary}25`,
                                    letterSpacing: '0.3px',
                                }}
                                onMouseEnter={(e) => {
                                    if (!saving) {
                                        e.currentTarget.style.boxShadow = `0 16px 32px ${THEME.primary}40`;
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!saving) {
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}25`;
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                <Save size={18} strokeWidth={2.5} />
                                {saving ? 'Saving...' : 'Save Limits'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
