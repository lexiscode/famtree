import { useState } from 'react';
import { Bell, Mail, Clock, Check, AlertTriangle } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import SettingsSidebar from '@/Components/Settings/SettingsSidebar';

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
}

interface PageProps {
    auth: {
        user: User;
    };
}

export default function NotificationSettings() {
    const { props } = usePage<PageProps>();

    // Notification Preferences
    const [notificationPreferences, setNotificationPreferences] = useState({
        connection_request: { inApp: true, email: true },
        connection_accepted: { inApp: true, email: false },
        family_tree_invite: { inApp: true, email: true },
        status_changed: { inApp: true, email: false },
        message_received: { inApp: true, email: true },
        profile_viewed: { inApp: false, email: false },
    });

    // Notification Frequency
    const [notificationFrequency, setNotificationFrequency] = useState<'immediate' | 'daily' | 'weekly'>('immediate');

    // Email Digest
    const [emailDigestEnabled, setEmailDigestEnabled] = useState(false);

    // Quiet Hours
    const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
    const [quietHoursStart, setQuietHoursStart] = useState('22:00');
    const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);

    const notificationTypes = [
        {
            key: 'connection_request',
            label: 'Connection Requests',
            description: 'When someone sends you a connection request',
        },
        {
            key: 'connection_accepted',
            label: 'Connection Accepted',
            description: 'When someone accepts your connection request',
        },
        {
            key: 'family_tree_invite',
            label: 'Family Tree Invitations',
            description: 'When you are invited to join a family tree',
        },
        {
            key: 'status_changed',
            label: 'Family Member Status Changes',
            description: 'When a family member updates their status',
        },
        {
            key: 'message_received',
            label: 'Messages',
            description: 'When you receive a message from a connection',
        },
        {
            key: 'profile_viewed',
            label: 'Profile Views',
            description: 'When someone views your profile',
        },
    ];

    const handleToggleNotification = (key: string, channel: 'inApp' | 'email') => {
        setNotificationPreferences({
            ...notificationPreferences,
            [key]: {
                ...notificationPreferences[key as keyof typeof notificationPreferences],
                [channel]: !notificationPreferences[key as keyof typeof notificationPreferences][channel],
            },
        });
    };

    const handleSaveSettings = async () => {
        setSaveLoading(true);
        setSaveMessage(null);

        try {
            setTimeout(() => {
                setSaveMessage({ type: 'success', text: 'Notification settings saved successfully' });
                setSaveLoading(false);
            }, 1000);
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'Failed to save notification settings' });
            setSaveLoading(false);
        }
    };

    return (
        <AuthAccessLayout>
            <div className="settings-wrapper">
                <SettingsSidebar active="notifications" />

                <div className="settings-content">
                    {/* Page Header */}
                    <div className="settings-page-header">
                        <h1 className="settings-page-title">
                            <i className="bi bi-bell"></i>
                            Notification Settings
                        </h1>
                        <p className="settings-page-subtitle">Manage how and when you receive notifications</p>
                    </div>

                    {/* Notification Preferences Section */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon">
                                <Bell size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title">Notification Types</h2>
                                <p className="settings-section-subtitle">Choose which notifications you want to receive</p>
                            </div>
                        </div>

                        <div className="settings-section-body">
                            {saveMessage && (
                                <div className={`settings-alert settings-alert-${saveMessage.type}`}>
                                    <div className="settings-alert-icon">
                                        {saveMessage.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
                                    </div>
                                    <div className="settings-alert-content">
                                        <p className="settings-alert-message">{saveMessage.text}</p>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                                {/* Header Row */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 120px 120px',
                                    gap: '1rem',
                                    paddingBottom: '1rem',
                                    borderBottom: '2px solid #F0F2F5',
                                    fontWeight: 700,
                                    color: '#6C757D',
                                    fontSize: '0.85rem',
                                }}>
                                    <div>Notification Type</div>
                                    <div style={{ textAlign: 'center' }}>
                                        <i className="bi bi-app"></i> In-App
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <Mail size={16} /> Email
                                    </div>
                                </div>

                                {/* Notification Type Rows */}
                                {notificationTypes.map((notification) => (
                                    <div key={notification.key} style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 120px 120px',
                                        gap: '1rem',
                                        alignItems: 'center',
                                        paddingBottom: '1.5rem',
                                        borderBottom: '1px solid #F0F2F5',
                                    }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, color: '#1a1a1a', fontSize: '0.95rem' }}>
                                                {notification.label}
                                            </p>
                                            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#6C757D' }}>
                                                {notification.description}
                                            </p>
                                        </div>

                                        <div style={{ textAlign: 'center' }}>
                                            <label className="settings-switch" style={{ margin: 0, justifyContent: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={notificationPreferences[notification.key as keyof typeof notificationPreferences].inApp}
                                                    onChange={() => handleToggleNotification(notification.key, 'inApp')}
                                                />
                                                <span className="settings-switch-slider"></span>
                                            </label>
                                        </div>

                                        <div style={{ textAlign: 'center' }}>
                                            <label className="settings-switch" style={{ margin: 0, justifyContent: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={notificationPreferences[notification.key as keyof typeof notificationPreferences].email}
                                                    onChange={() => handleToggleNotification(notification.key, 'email')}
                                                />
                                                <span className="settings-switch-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notification Frequency Section */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon">
                                <Clock size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title">Notification Frequency</h2>
                                <p className="settings-section-subtitle">Choose how often you want email notifications</p>
                            </div>
                        </div>

                        <div className="settings-section-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="settings-toggle-group">
                                    <div className="settings-toggle-info">
                                        <h3 className="settings-toggle-title">Immediate</h3>
                                        <p className="settings-toggle-description">Receive notifications as they happen</p>
                                    </div>
                                    <input
                                        type="radio"
                                        name="frequency"
                                        value="immediate"
                                        checked={notificationFrequency === 'immediate'}
                                        onChange={(e) => setNotificationFrequency(e.target.value as any)}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer',
                                            accentColor: '#0052E8',
                                        }}
                                    />
                                </div>

                                <div className="settings-toggle-group">
                                    <div className="settings-toggle-info">
                                        <h3 className="settings-toggle-title">Daily Digest</h3>
                                        <p className="settings-toggle-description">Receive a daily summary at 9:00 AM</p>
                                    </div>
                                    <input
                                        type="radio"
                                        name="frequency"
                                        value="daily"
                                        checked={notificationFrequency === 'daily'}
                                        onChange={(e) => setNotificationFrequency(e.target.value as any)}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer',
                                            accentColor: '#0052E8',
                                        }}
                                    />
                                </div>

                                <div className="settings-toggle-group">
                                    <div className="settings-toggle-info">
                                        <h3 className="settings-toggle-title">Weekly Digest</h3>
                                        <p className="settings-toggle-description">Receive a weekly summary on Mondays at 9:00 AM</p>
                                    </div>
                                    <input
                                        type="radio"
                                        name="frequency"
                                        value="weekly"
                                        checked={notificationFrequency === 'weekly'}
                                        onChange={(e) => setNotificationFrequency(e.target.value as any)}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer',
                                            accentColor: '#0052E8',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quiet Hours Section */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon">
                                <Clock size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title">Quiet Hours</h2>
                                <p className="settings-section-subtitle">Disable notifications during specific hours</p>
                            </div>
                        </div>

                        <div className="settings-section-body">
                            <div className="settings-toggle-group" style={{ marginBottom: '2rem' }}>
                                <div className="settings-toggle-info">
                                    <h3 className="settings-toggle-title">Enable Quiet Hours</h3>
                                    <p className="settings-toggle-description">No notifications will be sent during these hours</p>
                                </div>
                                <label className="settings-switch">
                                    <input
                                        type="checkbox"
                                        checked={quietHoursEnabled}
                                        onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                                    />
                                    <span className="settings-switch-slider"></span>
                                </label>
                            </div>

                            {quietHoursEnabled && (
                                <form className="settings-form-group-row">
                                    <div className="settings-form-group">
                                        <label className="settings-label">Start Time</label>
                                        <input
                                            type="time"
                                            className="settings-input"
                                            value={quietHoursStart}
                                            onChange={(e) => setQuietHoursStart(e.target.value)}
                                        />
                                    </div>

                                    <div className="settings-form-group">
                                        <label className="settings-label">End Time</label>
                                        <input
                                            type="time"
                                            className="settings-input"
                                            value={quietHoursEnd}
                                            onChange={(e) => setQuietHoursEnd(e.target.value)}
                                        />
                                    </div>
                                </form>
                            )}

                            {quietHoursEnabled && (
                                <div className="settings-alert settings-alert-info">
                                    <div className="settings-alert-icon">
                                        <Clock size={20} />
                                    </div>
                                    <div className="settings-alert-content">
                                        <p className="settings-alert-title">Quiet hours active</p>
                                        <p className="settings-alert-message">Notifications will not be sent from {quietHoursStart} to {quietHoursEnd}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Email Digest Section */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon">
                                <Mail size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title">Email Digest</h2>
                                <p className="settings-section-subtitle">Combine multiple notifications into one email</p>
                            </div>
                        </div>

                        <div className="settings-section-body">
                            <div className="settings-toggle-group">
                                <div className="settings-toggle-info">
                                    <h3 className="settings-toggle-title">Enable Email Digest</h3>
                                    <p className="settings-toggle-description">Receive all email notifications in a single digest email</p>
                                </div>
                                <label className="settings-switch">
                                    <input
                                        type="checkbox"
                                        checked={emailDigestEnabled}
                                        onChange={(e) => setEmailDigestEnabled(e.target.checked)}
                                    />
                                    <span className="settings-switch-slider"></span>
                                </label>
                            </div>

                            {emailDigestEnabled && (
                                <div className="settings-alert settings-alert-success">
                                    <div className="settings-alert-icon">
                                        <Check size={20} />
                                    </div>
                                    <div className="settings-alert-content">
                                        <p className="settings-alert-title">Email digest enabled</p>
                                        <p className="settings-alert-message">You'll receive a single email combining all notifications based on your frequency settings</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            onClick={handleSaveSettings}
                            disabled={saveLoading}
                            className="settings-btn settings-btn-primary"
                        >
                            {saveLoading ? 'Saving...' : 'Save All Settings'}
                        </button>
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
