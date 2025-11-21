import { useState, useEffect } from 'react';
import { Eye, EyeOff, UserX, Flag, Lock, Check, AlertTriangle, Search, Loader, Unlock } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
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

export default function PrivacySettings() {
    const { props } = usePage<PageProps>();

    // Profile Visibility
    const [profileVisibility, setProfileVisibility] = useState<'public' | 'connected' | 'private'>('connected');

    // Blocked Users
    const [blockedUsers, setBlockedUsers] = useState<Array<{ id: number; first_name: string; last_name: string; full_name: string; username: string; profile_image_url?: string }>>([]);
    const [blockUsername, setBlockUsername] = useState('');
    const [blockLoading, setBlockLoading] = useState(false);
    const [blockSearchResults, setBlockSearchResults] = useState<Array<{ id: number; name: string; username: string; profile_image_url: string }>>([]);
    const [blockSearching, setBlockSearching] = useState(false);

    // Privacy Field Controls
    const [fieldVisibility, setFieldVisibility] = useState({
        phone: 'connected',
        bio: 'public',
        date_of_birth: 'private',
        location: 'connected',
        education: 'connected',
        job_title: 'connected',
    });

    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);

    // Report User Form
    const [reportForm, setReportForm] = useState({
        username: '',
        reason: '',
        description: '',
    });
    const [reportErrors, setReportErrors] = useState<Record<string, string>>({});
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportSearchResults, setReportSearchResults] = useState<Array<{ id: number; name: string; username: string; profile_image_url: string }>>([]);
    const [reportSearching, setReportSearching] = useState(false);

    const handleBlockUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setBlockLoading(true);

        if (!blockUsername.trim()) {
            setBlockLoading(false);
            return;
        }

        try {
            const response = await fetch(route('blocks.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ username: blockUsername }),
            });

            const data = await response.json();

            if (!response.ok) {
                setSaveMessage({ type: 'error', text: data.error || 'Failed to block user.' });
            } else {
                setSaveMessage({ type: 'success', text: data.message });
                setBlockUsername('');
                // Refresh the blocked users list
                await fetchBlockedUsers();
            }
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'An error occurred while blocking the user.' });
        } finally {
            setBlockLoading(false);
        }
    };

    const handleUnblockUser = async (userId: number) => {
        try {
            const response = await fetch(route('blocks.destroy', { blockedUserId: userId }), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                setSaveMessage({ type: 'error', text: data.error || 'Failed to unblock user.' });
            } else {
                setSaveMessage({ type: 'success', text: data.message });
                setBlockedUsers(blockedUsers.filter(u => u.id !== userId));
            }
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'An error occurred while unblocking the user.' });
        }
    };

    const fetchBlockedUsers = async () => {
        try {
            const response = await fetch(route('blocks.index'));
            const data = await response.json();
            if (data.success) {
                setBlockedUsers(data.blocked_users);
            }
        } catch (error) {
            console.error('Error fetching blocked users:', error);
        }
    };

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    // Block User Search
    const searchBlockUsers = async (query: string) => {
        if (query.length < 2) {
            setBlockSearchResults([]);
            return;
        }

        setBlockSearching(true);
        try {
            const response = await fetch(`${route('connections.search-users')}?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            setBlockSearchResults(data.users);
        } catch (err) {
            console.error('Error searching users:', err);
        } finally {
            setBlockSearching(false);
        }
    };

    // Block User Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (blockUsername.length >= 2) {
                searchBlockUsers(blockUsername);
            } else {
                setBlockSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [blockUsername]);

    // Report User Search
    const searchReportUsers = async (query: string) => {
        if (query.length < 2) {
            setReportSearchResults([]);
            return;
        }

        setReportSearching(true);
        try {
            const response = await fetch(`${route('connections.search-users')}?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            setReportSearchResults(data.users);
        } catch (err) {
            console.error('Error searching users:', err);
        } finally {
            setReportSearching(false);
        }
    };

    // Report User Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (reportForm.username.length >= 2) {
                searchReportUsers(reportForm.username);
            } else {
                setReportSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [reportForm.username]);

    const handleSavePrivacySettings = async () => {
        setSaveLoading(true);
        setSaveMessage(null);

        try {
            setTimeout(() => {
                setSaveMessage({ type: 'success', text: 'Privacy settings saved successfully' });
                setSaveLoading(false);
            }, 1000);
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'Failed to save privacy settings' });
            setSaveLoading(false);
        }
    };

    const handleReportInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setReportForm({
            ...reportForm,
            [name]: value,
        });
        // Clear error for this field
        if (reportErrors[name]) {
            setReportErrors({
                ...reportErrors,
                [name]: '',
            });
        }
    };

    const handleSubmitReport = async (e: React.FormEvent) => {
        e.preventDefault();
        setReportSubmitting(true);
        setReportErrors({});

        try {
            const response = await fetch(route('reports.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(reportForm),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setReportErrors(data.errors);
                    setSaveMessage({ type: 'error', text: 'Please fix the errors below.' });
                } else {
                    setSaveMessage({ type: 'error', text: data.error || 'Failed to submit report.' });
                }
            } else {
                setSaveMessage({ type: 'success', text: data.message || 'Report submitted successfully!' });
                setReportForm({ username: '', reason: '', description: '' });
            }
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'An error occurred while submitting the report.' });
        } finally {
            setReportSubmitting(false);
        }
    };

    const visibilityOptions = [
        { value: 'public', label: 'Public', description: 'Anyone can see' },
        { value: 'connected', label: 'Connected Only', description: 'Only your connections' },
        { value: 'private', label: 'Private', description: 'Only you' },
    ];

    return (
        <AuthAccessLayout>
            <div className="settings-wrapper">
                <SettingsSidebar active="privacy" />

                <div className="settings-content">
                    {/* Page Header */}
                    <div className="settings-page-header">
                        <h1 className="settings-page-title">
                            <i className="bi bi-eye-slash"></i>
                            Privacy Settings
                        </h1>
                        <p className="settings-page-subtitle">Control who can see your information and activity</p>
                    </div>

                    {/* Profile Visibility Section */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon">
                                <Eye size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title">Profile Visibility</h2>
                                <p className="settings-section-subtitle">Control who can see your full profile</p>
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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {visibilityOptions.map((option) => (
                                    <div key={option.value} className="settings-toggle-group">
                                        <div className="settings-toggle-info">
                                            <h3 className="settings-toggle-title">{option.label}</h3>
                                            <p className="settings-toggle-description">{option.description}</p>
                                        </div>
                                        <input
                                            type="radio"
                                            name="profile-visibility"
                                            value={option.value}
                                            checked={profileVisibility === option.value}
                                            onChange={(e) => setProfileVisibility(e.target.value as any)}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer',
                                                accentColor: '#0052E8',
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Privacy Field Controls */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon">
                                <Lock size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title">Field-Level Privacy</h2>
                                <p className="settings-section-subtitle">Control visibility of individual profile fields</p>
                            </div>
                        </div>

                        <div className="settings-section-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {Object.entries(fieldVisibility).map(([field, visibility]) => (
                                    <div key={field} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #F0F2F5' }}>
                                        <label className="settings-label" style={{ marginBottom: '0.75rem', textTransform: 'capitalize' }}>
                                            {field.replace(/_/g, ' ')}
                                        </label>
                                        <select
                                            value={visibility}
                                            onChange={(e) => setFieldVisibility({ ...fieldVisibility, [field]: e.target.value })}
                                            className="settings-select"
                                        >
                                            <option value="public">Public</option>
                                            <option value="connected">Connected Only</option>
                                            <option value="private">Private</option>
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <div className="settings-button-group">
                                <button
                                    onClick={handleSavePrivacySettings}
                                    disabled={saveLoading}
                                    className="settings-btn settings-btn-primary"
                                >
                                    {saveLoading ? 'Saving...' : 'Save Privacy Settings'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Blocked Users Section */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon">
                                <UserX size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title">Blocked Users</h2>
                                <p className="settings-section-subtitle">Manage users you&apos;ve blocked</p>
                            </div>
                        </div>

                        <div className="settings-section-body">
                            <form onSubmit={handleBlockUser} className="settings-form-group" style={{ marginBottom: '2rem' }}>
                                <label className="settings-label">Block a User</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 1, position: 'relative' }}>
                                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                <Search size={18} style={{ position: 'absolute', left: '12px', color: '#999', pointerEvents: 'none' }} />
                                                <input
                                                    type="text"
                                                    className="settings-input"
                                                    placeholder="Search username..."
                                                    value={blockUsername}
                                                    onChange={(e) => setBlockUsername(e.target.value)}
                                                    style={{ paddingLeft: '40px', width: '100%' }}
                                                />
                                            </div>

                                            {/* Search Results Dropdown */}
                                            {blockSearchResults.length > 0 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    background: 'white',
                                                    border: '1px solid #E0E0E0',
                                                    borderTop: 'none',
                                                    borderRadius: '0 0 8px 8px',
                                                    maxHeight: '300px',
                                                    overflowY: 'auto',
                                                    zIndex: 10,
                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                }}>
                                                    {blockSearchResults.map((user) => (
                                                        <div
                                                            key={user.id}
                                                            onClick={() => {
                                                                setBlockUsername(user.username);
                                                                setBlockSearchResults([]);
                                                            }}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                                padding: '12px 16px',
                                                                cursor: 'pointer',
                                                                borderBottom: '1px solid #F0F0F0',
                                                                transition: 'background-color 0.2s',
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                        >
                                                            {user.profile_image_url && (
                                                                <img
                                                                    src={user.profile_image_url}
                                                                    alt={user.name}
                                                                    style={{
                                                                        width: '36px',
                                                                        height: '36px',
                                                                        borderRadius: '50%',
                                                                        objectFit: 'cover',
                                                                    }}
                                                                />
                                                            )}
                                                            <div style={{ flex: 1 }}>
                                                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</p>
                                                                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#999' }}>@{user.username}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {blockSearching && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    background: 'white',
                                                    border: '1px solid #E0E0E0',
                                                    borderTop: 'none',
                                                    borderRadius: '0 0 8px 8px',
                                                    padding: '12px 16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    zIndex: 10,
                                                }}>
                                                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>Searching...</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={blockLoading || !blockUsername.trim()}
                                            className="settings-btn settings-btn-danger"
                                        >
                                            {blockLoading ? 'Blocking...' : 'Block'}
                                        </button>
                                    </div>
                                </div>
                                <p className="settings-form-hint">Users you block will not be able to send you connection requests or see your profile.</p>
                            </form>

                            <div style={{ marginBottom: '1rem' }}>
                                <label className="settings-label" style={{ marginBottom: '1rem', display: 'block' }}>Blocked Users ({blockedUsers.length})</label>

                                {blockedUsers.length === 0 ? (
                                    <div style={{
                                        padding: '2rem',
                                        textAlign: 'center',
                                        background: '#F9FAFB',
                                        borderRadius: '10px',
                                        color: '#6C757D',
                                    }}>
                                        <p style={{ margin: 0, fontWeight: 600 }}>No blocked users yet</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {blockedUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '1rem 1.25rem',
                                                    background: '#FFF5F7',
                                                    border: '2px solid #FF4757',
                                                    borderRadius: '10px',
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#FFE9EB';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 71, 87, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = '#FFF5F7';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                                    {user.profile_image_url && (
                                                        <img
                                                            src={user.profile_image_url}
                                                            alt={user.full_name}
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '50%',
                                                                objectFit: 'cover',
                                                                border: '2px solid #FF4757',
                                                            }}
                                                        />
                                                    )}
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 700, color: '#1a1a1a' }}>{user.full_name}</p>
                                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#6C757D' }}>@{user.username}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUnblockUser(user.id)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.65rem 1.2rem',
                                                        background: '#FF4757',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        whiteSpace: 'nowrap',
                                                        marginLeft: '1rem',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#FF3740';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 71, 87, 0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#FF4757';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <Unlock size={18} />
                                                    Unblock
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Report User Section */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon">
                                <Flag size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title">Report a User</h2>
                                <p className="settings-section-subtitle">Report inappropriate behavior or content</p>
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

                            <form onSubmit={handleSubmitReport} className="settings-form-group-row">
                                <div className="settings-form-group">
                                    <label className="settings-label">
                                        Username to Report
                                        <span className="settings-label-required">*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <Search size={18} style={{ position: 'absolute', left: '12px', color: '#999', pointerEvents: 'none' }} />
                                            <input
                                                type="text"
                                                name="username"
                                                className={`settings-input ${reportErrors.username ? 'error' : ''}`}
                                                placeholder="Search username..."
                                                value={reportForm.username}
                                                onChange={handleReportInputChange}
                                                style={{ paddingLeft: '40px', width: '100%' }}
                                                required
                                            />
                                        </div>

                                        {/* Search Results Dropdown */}
                                        {reportSearchResults.length > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                background: 'white',
                                                border: '1px solid #E0E0E0',
                                                borderTop: 'none',
                                                borderRadius: '0 0 8px 8px',
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                                zIndex: 10,
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                            }}>
                                                {reportSearchResults.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        onClick={() => {
                                                            setReportForm({ ...reportForm, username: user.username });
                                                            setReportSearchResults([]);
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            padding: '12px 16px',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid #F0F0F0',
                                                            transition: 'background-color 0.2s',
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                    >
                                                        {user.profile_image_url && (
                                                            <img
                                                                src={user.profile_image_url}
                                                                alt={user.name}
                                                                style={{
                                                                    width: '36px',
                                                                    height: '36px',
                                                                    borderRadius: '50%',
                                                                    objectFit: 'cover',
                                                                }}
                                                            />
                                                        )}
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</p>
                                                            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#999' }}>@{user.username}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {reportSearching && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                background: 'white',
                                                border: '1px solid #E0E0E0',
                                                borderTop: 'none',
                                                borderRadius: '0 0 8px 8px',
                                                padding: '12px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                zIndex: 10,
                                            }}>
                                                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                <span style={{ fontSize: '0.9rem', color: '#666' }}>Searching...</span>
                                            </div>
                                        )}
                                    </div>
                                    {reportErrors.username && (
                                        <p style={{ color: '#FF4757', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                            {reportErrors.username}
                                        </p>
                                    )}
                                </div>

                                <div className="settings-form-group">
                                    <label className="settings-label">
                                        Reason
                                        <span className="settings-label-required">*</span>
                                    </label>
                                    <select
                                        name="reason"
                                        className={`settings-select ${reportErrors.reason ? 'error' : ''}`}
                                        value={reportForm.reason}
                                        onChange={handleReportInputChange}
                                        required
                                    >
                                        <option value="">Select a reason...</option>
                                        <option value="harassment">Harassment or bullying</option>
                                        <option value="spam">Spam</option>
                                        <option value="inappropriate">Inappropriate content</option>
                                        <option value="impersonation">Impersonation</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {reportErrors.reason && (
                                        <p style={{ color: '#FF4757', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                            {reportErrors.reason}
                                        </p>
                                    )}
                                </div>
                            </form>

                            <div className="settings-form-group">
                                <label className="settings-label">Additional Details</label>
                                <textarea
                                    name="description"
                                    className={`settings-textarea ${reportErrors.description ? 'error' : ''}`}
                                    placeholder="Provide additional context about your report..."
                                    value={reportForm.description}
                                    onChange={handleReportInputChange}
                                />
                                {reportErrors.description && (
                                    <p style={{ color: '#FF4757', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                        {reportErrors.description}
                                    </p>
                                )}
                                <p className="settings-form-hint">Please provide as much detail as possible to help us review your report.</p>
                            </div>

                            <div className="settings-button-group">
                                <button
                                    onClick={handleSubmitReport}
                                    disabled={reportSubmitting || !reportForm.username || !reportForm.reason}
                                    className="settings-btn settings-btn-danger"
                                >
                                    <Flag size={18} />
                                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
