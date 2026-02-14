import { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Settings,
    Save,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Sliders,
    Gauge,
} from 'lucide-react';

interface Props {
    settings: Record<string, any>;
}

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
            <div key={key} className="ap-toggle-row">
                <div className="ap-flex-1">
                    <p className="ap-toggle-label">{label}</p>
                    {description && (
                        <p className="ap-toggle-description">{description}</p>
                    )}
                </div>
                <button
                    onClick={() => handleFeatureToggle(key)}
                    className="ap-toggle-btn"
                >
                    {isOn ? (
                        <ToggleRight size={36} className="ap-icon-success" strokeWidth={2} />
                    ) : (
                        <ToggleLeft size={36} className="ap-text-secondary" strokeWidth={2} />
                    )}
                </button>
            </div>
        );
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
                    <h1 className="ap-page-title">System Settings</h1>
                    <p className="ap-page-subtitle">Configure platform settings, toggle features, and manage system limits</p>
                </div>

                {/* Tab Navigation */}
                <div className="ap-tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`ap-tab ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="ap-card ap-card-lg">
                        <div className="ap-section">
                            <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                                <Sliders size={18} className="ap-icon-primary" />
                                General Configuration
                            </h3>

                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">App Name</label>
                                    <input
                                        type="text"
                                        value={formData.app_name || ''}
                                        onChange={(e) => handleChange('app_name', e.target.value)}
                                        className="ap-form-input"
                                        placeholder="Enter application name"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Contact Email</label>
                                    <input
                                        type="email"
                                        value={formData.contact_email || ''}
                                        onChange={(e) => handleChange('contact_email', e.target.value)}
                                        className="ap-form-input"
                                        placeholder="contact@example.com"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Support Email</label>
                                    <input
                                        type="email"
                                        value={formData.support_email || ''}
                                        onChange={(e) => handleChange('support_email', e.target.value)}
                                        className="ap-form-input"
                                        placeholder="support@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="ap-divider" />

                        {/* Maintenance Mode Toggle */}
                        <div className="ap-toggle-row">
                            <div className="ap-flex-1">
                                <p className="ap-toggle-label">Maintenance Mode</p>
                                <p className="ap-toggle-description">
                                    When enabled, the platform will show a maintenance page to all users
                                </p>
                            </div>
                            <button
                                onClick={() => handleChange('maintenance_mode', !formData.maintenance_mode)}
                                className="ap-toggle-btn"
                            >
                                {formData.maintenance_mode ? (
                                    <ToggleRight size={36} className="ap-icon-warning" strokeWidth={2} />
                                ) : (
                                    <ToggleLeft size={36} className="ap-text-secondary" strokeWidth={2} />
                                )}
                            </button>
                        </div>

                        <hr className="ap-divider" />

                        {/* Action Buttons */}
                        <div className="ap-flex ap-justify-end ap-gap-md">
                            <button
                                onClick={handleClearCache}
                                disabled={clearingCache}
                                className="ap-btn ap-btn-danger-outline"
                            >
                                <Trash2 size={18} />
                                {clearingCache ? 'Clearing...' : 'Clear Cache'}
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="ap-btn ap-btn-primary"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <div className="ap-card ap-card-lg">
                        <div className="ap-section">
                            <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                                <ToggleRight size={18} className="ap-icon-primary" />
                                Platform Features
                            </h3>
                            <p className="ap-text-secondary ap-mb-lg">
                                Enable or disable platform features. Changes apply immediately.
                            </p>

                            <div className="ap-flex ap-flex-col ap-gap-md">
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
                    </div>
                )}

                {/* Limits Tab */}
                {activeTab === 'limits' && (
                    <div className="ap-card ap-card-lg">
                        <div className="ap-section">
                            <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                                <Gauge size={18} className="ap-icon-primary" />
                                System Limits
                            </h3>
                            <p className="ap-text-secondary ap-mb-lg">
                                Configure maximum limits for various platform features.
                            </p>

                            <div className="ap-form-row">
                                {[
                                    { key: 'limit_max_post_content_length', label: 'Max Post Content Length', placeholder: 'e.g., 5000' },
                                    { key: 'limit_max_images_per_post', label: 'Max Images Per Post', placeholder: 'e.g., 10' },
                                    { key: 'limit_max_voice_duration', label: 'Max Voice Duration (seconds)', placeholder: 'e.g., 120' },
                                    { key: 'limit_max_gallery_images', label: 'Max Gallery Images', placeholder: 'e.g., 100' },
                                    { key: 'limit_max_child_accounts', label: 'Max Child Accounts Per User', placeholder: 'e.g., 5' },
                                    { key: 'limit_max_family_tree_members', label: 'Max Family Tree Members', placeholder: 'e.g., 200' },
                                ].map((field) => (
                                    <div key={field.key} className="ap-form-group">
                                        <label className="ap-form-label">{field.label}</label>
                                        <input
                                            type="number"
                                            value={formData[field.key] || ''}
                                            onChange={(e) => handleChange(field.key, parseInt(e.target.value) || '')}
                                            className="ap-form-input"
                                            placeholder={field.placeholder}
                                            min={0}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="ap-divider" />

                        <div className="ap-flex ap-justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="ap-btn ap-btn-primary"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Limits'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
