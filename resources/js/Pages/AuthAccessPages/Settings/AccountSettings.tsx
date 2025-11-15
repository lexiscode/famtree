import { useState } from 'react';
import { Lock, Mail, Shield, Trash2, Eye, EyeOff, Check, AlertTriangle, Users, Plus } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import SettingsSidebar from '@/Components/Settings/SettingsSidebar';

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    date_of_birth?: string | null;
}

interface SharedProps {
    auth: {
        user: User;
    };
}

export default function AccountSettings() {
    const { auth } = usePage<SharedProps>().props;
    const user = auth?.user;

    // Calculate user age
    const getAge = (dateOfBirth?: string | null) => {
        if (!dateOfBirth) return null;
        const date = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
            age--;
        }
        return age;
    };

    const userAge = getAge(user?.date_of_birth);
    const canManageChildAccounts = userAge !== null && userAge >= 18;

    // Password state
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Email state
    const [newEmail, setNewEmail] = useState('');
    const [emailPassword, setEmailPassword] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // 2FA state
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [twoFALoading, setTwoFALoading] = useState(false);

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordMessage(null);

        router.post(route('settings.change-password'), {
            current: passwords.current,
            new: passwords.new,
            confirm: passwords.confirm,
        }, {
            onSuccess: () => {
                setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
                setPasswords({ current: '', new: '', confirm: '' });
                setPasswordLoading(false);
            },
            onError: (errors: Record<string, string>) => {
                setPasswordLoading(false);
                const errorMessage = Object.values(errors)[0] || 'Failed to change password';
                setPasswordMessage({ type: 'error', text: errorMessage });
            },
        });
    };

    const handleEmailChange = (e: React.FormEvent) => {
        e.preventDefault();
        setEmailLoading(true);
        setEmailMessage(null);

        router.post(route('settings.change-email'), {
            email: newEmail,
            password: emailPassword,
        }, {
            onSuccess: () => {
                setEmailMessage({ type: 'success', text: 'Email changed successfully. Please verify your new email.' });
                setNewEmail('');
                setEmailPassword('');
                setEmailLoading(false);
            },
            onError: (errors: Record<string, string>) => {
                setEmailLoading(false);
                const errorMessage = Object.values(errors)[0] || 'Failed to change email';
                setEmailMessage({ type: 'error', text: errorMessage });
            },
        });
    };

    const handleToggle2FA = async () => {
        setTwoFALoading(true);
        try {
            setTimeout(() => {
                setTwoFAEnabled(!twoFAEnabled);
                setTwoFALoading(false);
            }, 800);
        } catch (error) {
            setTwoFALoading(false);
        }
    };

    const handleDeleteAccount = () => {
        if (!deletePassword) {
            return;
        }

        setDeleteLoading(true);

        router.post(route('settings.delete-account'), {
            password: deletePassword,
        }, {
            onSuccess: () => {
                setDeleteLoading(false);
                setShowDeleteModal(false);
                setDeletePassword('');
            },
            onError: () => {
                setDeleteLoading(false);
            },
        });
    };

    return (
        <AuthAccessLayout>
            <div className="settings-wrapper">
                <SettingsSidebar active="account" />

                <div className="settings-content">
                    {/* Page Header */}
                    <div className="settings-page-header">
                        <h1 className="settings-page-title">
                            <i className="bi bi-shield-check"></i>
                            Account Settings
                        </h1>
                        <p className="settings-page-subtitle">Manage your account security and preferences</p>
                    </div>

                    {/* Change Password Section */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon">
                                <Lock size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title">Change Password</h2>
                                <p className="settings-section-subtitle">Update your password regularly to keep your account secure</p>
                            </div>
                        </div>

                        <div className="settings-section-body">
                            {passwordMessage && (
                                <div className={`settings-alert settings-alert-${passwordMessage.type}`}>
                                    <div className="settings-alert-icon">
                                        {passwordMessage.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
                                    </div>
                                    <div className="settings-alert-content">
                                        <p className="settings-alert-message">{passwordMessage.text}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange} className="settings-form-group-row">
                                <div className="settings-form-group">
                                    <label className="settings-label">
                                        Current Password
                                        <span className="settings-label-required">*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            className="settings-input"
                                            placeholder="Enter current password"
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#6C757D',
                                                padding: '0.5rem',
                                            }}
                                            title={showPasswords.current ? 'Hide password' : 'Show password'}
                                        >
                                            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="settings-form-group">
                                    <label className="settings-label">
                                        New Password
                                        <span className="settings-label-required">*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            className="settings-input"
                                            placeholder="Enter new password"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#6C757D',
                                                padding: '0.5rem',
                                            }}
                                            title={showPasswords.new ? 'Hide password' : 'Show password'}
                                        >
                                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="settings-form-group">
                                    <label className="settings-label">
                                        Confirm New Password
                                        <span className="settings-label-required">*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            className="settings-input"
                                            placeholder="Confirm new password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#6C757D',
                                                padding: '0.5rem',
                                            }}
                                            title={showPasswords.confirm ? 'Hide password' : 'Show password'}
                                        >
                                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <div className="settings-button-group">
                                <button
                                    onClick={handlePasswordChange}
                                    disabled={passwordLoading}
                                    className="settings-btn settings-btn-primary"
                                >
                                    {passwordLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Change Email Section */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon">
                                <Mail size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title">Change Email Address</h2>
                                <p className="settings-section-subtitle">Current email: <strong>{user?.email || 'Not available'}</strong></p>
                            </div>
                        </div>

                        <div className="settings-section-body">
                            {emailMessage && (
                                <div className={`settings-alert settings-alert-${emailMessage.type}`}>
                                    <div className="settings-alert-icon">
                                        {emailMessage.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
                                    </div>
                                    <div className="settings-alert-content">
                                        <p className="settings-alert-message">{emailMessage.text}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleEmailChange} className="settings-form-group-row">
                                <div className="settings-form-group">
                                    <label className="settings-label">
                                        New Email Address
                                        <span className="settings-label-required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="settings-input"
                                        placeholder="Enter new email address"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="settings-form-group">
                                    <label className="settings-label">
                                        Confirm Your Password
                                        <span className="settings-label-required">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="settings-input"
                                        placeholder="Enter your password"
                                        value={emailPassword}
                                        onChange={(e) => setEmailPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </form>

                            <div className="settings-button-group">
                                <button
                                    onClick={handleEmailChange}
                                    disabled={emailLoading}
                                    className="settings-btn settings-btn-primary"
                                >
                                    {emailLoading ? 'Updating...' : 'Change Email'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Child Accounts Section */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon">
                                <Users size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title">Child Accounts</h2>
                                <p className="settings-section-subtitle">Create and manage accounts for family members under 18</p>
                            </div>
                        </div>

                        <div className="settings-section-body">
                            {canManageChildAccounts ? (
                                <>
                                    <p style={{ color: '#6C757D', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                        As a parent or guardian, you can create your child accounts for family members who are under 18. Child accounts allow younger family members to participate in the family tree while maintaining parental control.
                                    </p>
                                    <div className="settings-button-group">
                                        <button
                                            onClick={() => router.visit(route('child-accounts.index'))}
                                            className="settings-btn settings-btn-primary"
                                        >
                                            <Plus size={18} />
                                            Manage Child Accounts
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="settings-alert settings-alert-info">
                                    <div className="settings-alert-icon">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div className="settings-alert-content">
                                        <p className="settings-alert-title">Age Requirement</p>
                                        <p className="settings-alert-message">
                                            You must be at least 18 years old to create and manage your child accounts. {userAge !== null && `You are currently ${userAge} years old.`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Two-Factor Authentication Section */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon">
                                <Shield size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title">Two-Factor Authentication (2FA)</h2>
                                <p className="settings-section-subtitle">Add an extra layer of security to your account</p>
                            </div>
                        </div>

                        <div className="settings-section-body">
                            <div className="settings-toggle-group">
                                <div className="settings-toggle-info">
                                    <h3 className="settings-toggle-title">Enable Two-Factor Authentication</h3>
                                    <p className="settings-toggle-description">
                                        Require a code from your phone when signing in. We'll use an authenticator app like Google Authenticator.
                                    </p>
                                </div>
                                <label className="settings-switch">
                                    <input
                                        type="checkbox"
                                        checked={twoFAEnabled}
                                        onChange={handleToggle2FA}
                                        disabled={twoFALoading}
                                    />
                                    <span className="settings-switch-slider"></span>
                                </label>
                            </div>

                            {twoFAEnabled && (
                                <div className="settings-alert settings-alert-info">
                                    <div className="settings-alert-icon">
                                        <Shield size={20} />
                                    </div>
                                    <div className="settings-alert-content">
                                        <p className="settings-alert-title">2FA is enabled</p>
                                        <p className="settings-alert-message">Your account is protected with two-factor authentication</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delete Account Section */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon" style={{ background: 'linear-gradient(135deg, #FF4757 0%, #FF6B81 100%)' }}>
                                <Trash2 size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title" style={{ color: '#FF4757' }}>Delete Account</h2>
                                <p className="settings-section-subtitle">Permanently delete your account and all associated data</p>
                            </div>
                        </div>

                        <div className="settings-section-body">
                            <div className="settings-alert settings-alert-danger">
                                <div className="settings-alert-icon">
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="settings-alert-content">
                                    <p className="settings-alert-title">Warning: This action cannot be undone</p>
                                    <p className="settings-alert-message">Deleting your account will permanently remove all your data including connections, family trees, and settings.</p>
                                </div>
                            </div>

                            <div className="settings-button-group">
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="settings-btn settings-btn-danger"
                                >
                                    <Trash2 size={18} />
                                    Delete My Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Account Modal */}
                {showDeleteModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        animation: 'fadeIn 0.3s ease-out',
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            maxWidth: '450px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                            animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FF4757', margin: '0 0 1rem' }}>
                                Delete Account?
                            </h3>
                            <p style={{ color: '#495057', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                Are you sure you want to delete your account? This action is permanent and cannot be reversed. All your data will be lost.
                            </p>

                            <div className="settings-form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="settings-label">
                                    Enter your password to confirm
                                    <span className="settings-label-required">*</span>
                                </label>
                                <input
                                    type="password"
                                    className="settings-input"
                                    placeholder="Enter your password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="settings-button-group">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="settings-btn settings-btn-secondary"
                                    disabled={deleteLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={!deletePassword || deleteLoading}
                                    className="settings-btn settings-btn-danger"
                                >
                                    {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </AuthAccessLayout>
    );
}
