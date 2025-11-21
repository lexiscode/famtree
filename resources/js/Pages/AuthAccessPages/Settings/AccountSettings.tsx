import { useState, useEffect } from 'react';
import { Lock, Mail, Shield, Trash2, Eye, EyeOff, Check, AlertTriangle, Users, Plus, User } from 'lucide-react';
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
    phone?: string | null;
    address?: string | null;
    bio?: string | null;
    profile_image_url?: string | null;
    job_title?: string | null;
    education_level?: string | null;
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

    // Initialize profile form state
    const initializeProfileForm = () => {
        if (user) {
            // Format date_of_birth for date input (YYYY-MM-DD format)
            let formattedDate = '';
            if (user.date_of_birth) {
                const date = new Date(user.date_of_birth);
                formattedDate = date.toISOString().split('T')[0];
            }

            setProfileForm({
                phone: user.phone || '',
                address: user.address || '',
                bio: user.bio || '',
                date_of_birth: formattedDate,
                job_title: user.job_title || '',
                education_level: user.education_level || '',
            });
            setProfileImagePreview(user.profile_image_url || '');
        }
    };

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

    // Profile information state - initialize with empty values, populate in useEffect
    const [profileForm, setProfileForm] = useState({
        phone: '',
        address: '',
        bio: '',
        date_of_birth: '',
        job_title: '',
        education_level: '',
    });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string>('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Initialize profile form with user data on component mount
    useEffect(() => {
        initializeProfileForm();
    }, [user?.id]);

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

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfileForm({
            ...profileForm,
            [name]: value,
        });
    };

    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage(null);

        // Create FormData to handle file upload
        const formData = new FormData();
        formData.append('phone', profileForm.phone);
        formData.append('address', profileForm.address);
        formData.append('bio', profileForm.bio);
        formData.append('date_of_birth', profileForm.date_of_birth);
        formData.append('job_title', profileForm.job_title);
        formData.append('education_level', profileForm.education_level);

        if (profileImage) {
            formData.append('profile_image', profileImage);
        }

        router.post(route('settings.update-profile'), formData, {
            onSuccess: () => {
                setProfileLoading(false);
                setProfileImage(null);
                setProfileMessage({ type: 'success', text: 'Profile information updated successfully.' });
            },
            onError: (errors: Record<string, string>) => {
                setProfileLoading(false);
                const errorMessage = Object.values(errors)[0] || 'Failed to update profile';
                setProfileMessage({ type: 'error', text: errorMessage });
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

                    {/* Change Profile Information Section */}
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon">
                                <User size={24} />
                            </div>
                            <div className="settings-section-title-wrapper">
                                <h2 className="settings-section-title">Profile Information</h2>
                                <p className="settings-section-subtitle">Update your personal details and profile picture</p>
                            </div>
                        </div>

                        <div className="settings-section-body">
                            {profileMessage && (
                                <div className={`settings-alert settings-alert-${profileMessage.type}`}>
                                    <div className="settings-alert-icon">
                                        {profileMessage.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
                                    </div>
                                    <div className="settings-alert-content">
                                        <p className="settings-alert-message">{profileMessage.text}</p>
                                    </div>
                                </div>
                            )}

                            {/* Profile Picture */}
                            <div className="settings-form-group" style={{ marginBottom: '2rem' }}>
                                <label className="settings-label">Profile Picture</label>
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                                    <div>
                                        {profileImagePreview && (
                                            <img
                                                src={profileImagePreview}
                                                alt="Profile Preview"
                                                style={{
                                                    width: '120px',
                                                    height: '120px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '3px solid #0052E8',
                                                    marginBottom: '1rem',
                                                    display: 'block',
                                                }}
                                            />
                                        )}
                                        <div style={{
                                            position: 'relative',
                                            display: 'inline-block',
                                        }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfileImageChange}
                                                style={{
                                                    position: 'absolute',
                                                    opacity: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    cursor: 'pointer',
                                                }}
                                            />
                                            <button
                                                type="button"
                                                style={{
                                                    padding: '0.625rem 1.25rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid #DEE2E6',
                                                    background: '#0052E8',
                                                    color: 'white',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#0042C2';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 82, 232, 0.3)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = '#0052E8';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                                onClick={(e) => {
                                                    e.currentTarget.previousElementSibling?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                                                }}
                                            >
                                                Choose Image
                                            </button>
                                        </div>
                                        <p className="settings-form-hint" style={{ marginTop: '0.75rem' }}>
                                            {profileImage ? `Selected: ${profileImage.name}` : 'Click to upload a new profile picture (JPG, PNG, GIF)'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="settings-form-group-row">
                                {/* Phone */}
                                <div className="settings-form-group">
                                    <label className="settings-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="settings-input"
                                        placeholder="Enter your phone number"
                                        value={profileForm.phone}
                                        onChange={handleProfileChange}
                                    />
                                </div>

                                {/* Address */}
                                <div className="settings-form-group">
                                    <label className="settings-label">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        className="settings-input"
                                        placeholder="Enter your address"
                                        value={profileForm.address}
                                        onChange={handleProfileChange}
                                    />
                                </div>

                                {/* Date of Birth */}
                                <div className="settings-form-group">
                                    <label className="settings-label">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        className="settings-input"
                                        value={profileForm.date_of_birth}
                                        onChange={handleProfileChange}
                                    />
                                </div>

                                {/* Job Title */}
                                <div className="settings-form-group">
                                    <label className="settings-label">Job Title</label>
                                    <input
                                        type="text"
                                        name="job_title"
                                        className="settings-input"
                                        placeholder="Enter your job title"
                                        value={profileForm.job_title}
                                        onChange={handleProfileChange}
                                    />
                                </div>

                                {/* Education Level */}
                                <div className="settings-form-group">
                                    <label className="settings-label">Education Level</label>
                                    <select
                                        name="education_level"
                                        className="settings-select"
                                        value={profileForm.education_level}
                                        onChange={handleProfileChange}
                                    >
                                        <option value="">Select education level...</option>
                                        <option value="highschool">High School</option>
                                        <option value="associate">Associate Degree</option>
                                        <option value="bachelors">Bachelor's Degree</option>
                                        <option value="masters">Master's Degree</option>
                                        <option value="doctorate">Doctorate</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Bio */}
                                <div className="settings-form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Bio</label>
                                    <textarea
                                        name="bio"
                                        className="settings-textarea"
                                        placeholder="Tell us about yourself"
                                        value={profileForm.bio}
                                        onChange={handleProfileChange}
                                        rows={4}
                                    />
                                    <p className="settings-form-hint">Maximum 500 characters</p>
                                </div>
                            </form>

                            <div className="settings-button-group">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={profileLoading}
                                    className="settings-btn settings-btn-primary"
                                >
                                    {profileLoading ? 'Updating...' : 'Save Profile Information'}
                                </button>
                            </div>
                        </div>
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
                                <p className="settings-section-subtitle">Schedule your account for permanent deletion with a 30-day grace period</p>
                            </div>
                        </div>

                        <div className="settings-section-body">
                            {/* How it Works Section */}
                            <div style={{
                                background: '#FFF5F5',
                                border: '1px solid #FFE0E0',
                                borderRadius: '8px',
                                padding: '1.25rem',
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{ color: '#FF4757', marginTop: 0, marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 600 }}>
                                    How Account Deletion Works
                                </h4>
                                <ul style={{ color: '#495057', marginBottom: 0, paddingLeft: '1.25rem', lineHeight: 1.7, fontSize: '0.9rem' }}>
                                    <li>
                                        <strong>Step 1 - Temporary Deletion</strong>: When you delete your account, it is not immediately removed. Instead, it is scheduled for permanent deletion after 30 days.
                                    </li>
                                    <li>
                                        <strong>Step 2 - 30-Day Grace Period</strong>: Your account will remain inaccessible for 30 days. During this time, all your data (connections, family trees, photos, settings) is protected and will not be visible to others.
                                    </li>
                                    <li>
                                        <strong>Step 3 - Account Recovery</strong>: If you change your mind within 30 days, simply log back in with your email/username and password. Your account will be automatically restored with all your data intact.
                                    </li>
                                    <li>
                                        <strong>Step 4 - Permanent Deletion</strong>: If you do not log back in within 30 days, your account and all associated data will be permanently deleted and cannot be recovered.
                                    </li>
                                </ul>
                            </div>

                            <div className="settings-alert settings-alert-danger">
                                <div className="settings-alert-icon">
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="settings-alert-content">
                                    <p className="settings-alert-title">Warning: This action starts the deletion process</p>
                                    <p className="settings-alert-message">By clicking "Delete My Account", you will schedule your account for permanent deletion. You have 30 days to recover it by logging back in.</p>
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
                                Schedule Account Deletion?
                            </h3>
                            <p style={{ color: '#495057', marginBottom: '1rem', lineHeight: 1.6 }}>
                                Your account will be scheduled for permanent deletion in 30 days. You can recover it anytime within this period by logging back in.
                            </p>
                            <div style={{
                                background: '#FFF5F5',
                                border: '1px solid #FFE0E0',
                                borderRadius: '6px',
                                padding: '0.75rem',
                                marginBottom: '1.5rem',
                                fontSize: '0.85rem',
                                color: '#FF4757',
                                fontWeight: 500
                            }}>
                                ⏱️ 30-day grace period: Log back in anytime to restore your account and all data.
                            </div>

                            <div className="settings-form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="settings-label">
                                    Enter your password to confirm deletion
                                    <span className="settings-label-required">*</span>
                                </label>
                                <input
                                    type="password"
                                    className="settings-input"
                                    placeholder="Enter your password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.75rem',
                                        borderRadius: '6px',
                                        border: '1px solid #DEE2E6',
                                        background: 'white',
                                        color: '#212529',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit',
                                        transition: 'border-color 0.2s ease',
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#0052E8';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 82, 232, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#DEE2E6';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        borderRadius: '6px',
                                        border: '1px solid #DEE2E6',
                                        background: '#F8F9FA',
                                        color: '#495057',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                    disabled={deleteLoading}
                                    onMouseEnter={(e) => {
                                        if (!deleteLoading) {
                                            e.currentTarget.style.background = '#E9ECEF';
                                            e.currentTarget.style.borderColor = '#ADB5BD';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#F8F9FA';
                                        e.currentTarget.style.borderColor = '#DEE2E6';
                                    }}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={!deletePassword || deleteLoading}
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: deleteLoading || !deletePassword ? '#FFB3B3' : '#FF4757',
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        cursor: deleteLoading || !deletePassword ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: deleteLoading || !deletePassword ? 0.7 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!deleteLoading && deletePassword) {
                                            e.currentTarget.style.background = '#E63946';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!deleteLoading && deletePassword) {
                                            e.currentTarget.style.background = '#FF4757';
                                        }
                                    }}
                                >
                                    {deleteLoading ? 'Scheduling Deletion...' : 'Schedule Deletion'}
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
