import { useMemo, useState, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Mail, Phone, MapPin, Cake, FileText, Users, Edit, Settings, Briefcase, BookOpen, ArrowRight, LogOut, X, Bell, BookMarked, User as UserIcon, Lightbulb, Plus, Network, TrendingUp, TreePine, Pencil, Check, Loader2, Camera } from 'lucide-react';
import CreatePostModal from '../Stories/CreatePostModal';
import ProfileCompletionModal from '@/Components/Profile/ProfileCompletionModal';
import { ProfileCompletion } from '@/types/inertia';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    username: string;
    email: string;
    phone: string | null;
    address: string | null;
    bio: string | null;
    date_of_birth: string | null;
    gender: string | null;
    profile_image_url: string | null;
    status: string;
    job_title: string | null;
    education: string | null;
    created_at: string;
}

interface Props {
    user: User;
    connections: any[];
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
    suggestedConnectionsCount: number;
    profileCompletion: ProfileCompletion;
}

interface EditingField {
    key: string;
    label: string;
    value: string | null;
    type: 'text' | 'textarea' | 'date' | 'select';
    options?: { value: string; label: string }[];
    maxLength?: number;
}

export default function MyProfile({ user, connections, connectionCount, pendingRequestCount, sentRequestCount, unreadNotificationCount, suggestedConnectionsCount, profileCompletion }: Props) {
    const [showImagePopup, setShowImagePopup] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [editingField, setEditingField] = useState<EditingField | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageUploadError, setImageUploadError] = useState<string | null>(null);

    // Ref for hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local state for updated user data (to reflect changes without page reload)
    const [localUser, setLocalUser] = useState(user);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Handle post creation
    const handlePostCreated = useCallback(() => {
        setShowCreateModal(false);
        // Redirect to stories page after post is created
        router.visit(route('stories.index'));
    }, []);

    // Field configurations for editing
    const fieldConfigs: Record<string, { type: 'text' | 'textarea' | 'date' | 'select'; options?: { value: string; label: string }[]; maxLength?: number; editable: boolean }> = {
        email: { type: 'text', editable: false }, // Email requires verification, edit in settings
        phone: { type: 'text', maxLength: 20, editable: true },
        address: { type: 'text', maxLength: 255, editable: true },
        date_of_birth: { type: 'date', editable: true },
        gender: { type: 'select', options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
        ], editable: true },
        bio: { type: 'textarea', maxLength: 500, editable: true },
        job_title: { type: 'text', maxLength: 100, editable: true },
        education: { type: 'text', maxLength: 100, editable: true },
    };

    const fields = useMemo(() => [
        { key: 'email', label: 'Email', icon: Mail, value: localUser.email, rawValue: localUser.email },
        { key: 'phone', label: 'Phone', icon: Phone, value: localUser.phone, rawValue: localUser.phone },
        { key: 'address', label: 'Address', icon: MapPin, value: localUser.address, rawValue: localUser.address },
        { key: 'date_of_birth', label: 'Date of Birth', icon: Cake, value: formatDate(localUser.date_of_birth), rawValue: localUser.date_of_birth },
        { key: 'gender', label: 'Gender', icon: UserIcon, value: localUser.gender ? (localUser.gender.charAt(0).toUpperCase() + localUser.gender.slice(1)) : null, rawValue: localUser.gender },
        { key: 'bio', label: 'Bio', icon: FileText, value: localUser.bio, rawValue: localUser.bio },
        { key: 'job_title', label: 'Job Title', icon: Briefcase, value: localUser.job_title, rawValue: localUser.job_title },
        { key: 'education', label: 'Education', icon: BookOpen, value: localUser.education, rawValue: localUser.education },
    ], [localUser]);

    // Handle opening the edit modal
    const handleEditField = useCallback((field: typeof fields[0]) => {
        const config = fieldConfigs[field.key];
        if (!config.editable) return;

        setEditingField({
            key: field.key,
            label: field.label,
            value: field.rawValue,
            type: config.type,
            options: config.options,
            maxLength: config.maxLength,
        });
        setEditValue(field.key === 'date_of_birth' ? formatDateForInput(field.rawValue) : (field.rawValue || ''));
        setSaveError(null);
    }, []);

    // Handle saving the field
    const handleSaveField = useCallback(async () => {
        if (!editingField) return;

        setIsSaving(true);
        setSaveError(null);

        try {
            const response = await fetch('/settings/account/update-field', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    field: editingField.key,
                    value: editValue || null,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setSaveError(data.error || 'Failed to update field');
                setIsSaving(false);
                return;
            }

            // Update local state
            setLocalUser(prev => ({
                ...prev,
                [editingField.key]: editValue || null,
            }));

            setEditingField(null);
            setEditValue('');
        } catch (error) {
            console.error('Error saving field:', error);
            setSaveError('An error occurred. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [editingField, editValue]);

    // Handle closing the edit modal
    const handleCloseEdit = useCallback(() => {
        setEditingField(null);
        setEditValue('');
        setSaveError(null);
    }, []);

    // Handle profile image upload
    const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setImageUploadError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setImageUploadError('Image size must be less than 5MB');
            return;
        }

        setIsUploadingImage(true);
        setImageUploadError(null);

        try {
            const formData = new FormData();
            formData.append('profile_image', file);

            const response = await fetch('/settings/account/update-profile-image', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setImageUploadError(data.error || data.message || 'Failed to upload image');
                setIsUploadingImage(false);
                return;
            }

            // Update local state with new image URL
            setLocalUser(prev => ({
                ...prev,
                profile_image_url: data.profile_image_url,
            }));

        } catch (error) {
            console.error('Error uploading image:', error);
            setImageUploadError('An error occurred. Please try again.');
        } finally {
            setIsUploadingImage(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, []);

    // Trigger file input click
    const handleEditImageClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <AuthAccessLayout>
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-grid">
                        {/* Left Sidebar - Profile Header */}
                        <div className="profile-header">
                            <div className="profile-avatar-section">
                                {/* Hidden file input for image upload */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                    style={{ display: 'none' }}
                                />
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img
                                        src={localUser.profile_image_url || 'https://via.placeholder.com/140'}
                                        alt={localUser.name}
                                        className="profile-avatar"
                                        onClick={() => setShowImagePopup(true)}
                                        style={{ cursor: 'pointer', opacity: isUploadingImage ? 0.5 : 1, transition: 'opacity 0.2s' }}
                                        title="Click to view full size"
                                    />
                                    {/* Loading overlay */}
                                    {isUploadingImage && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                        }}>
                                            <Loader2 size={32} style={{ color: '#667eea', animation: 'spin 1s linear infinite' }} />
                                        </div>
                                    )}
                                    {/* Camera edit icon overlay */}
                                    <button
                                        onClick={handleEditImageClick}
                                        disabled={isUploadingImage}
                                        title="Change profile picture"
                                        style={{
                                            position: 'absolute',
                                            bottom: '8px',
                                            right: '8px',
                                            background: 'transparent',
                                            border: 'none',
                                            padding: '0.4rem',
                                            cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                                            color: '#667eea',
                                            opacity: isUploadingImage ? 0.3 : 0.8,
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isUploadingImage) {
                                                e.currentTarget.style.opacity = '1';
                                                e.currentTarget.style.transform = 'scale(1.15)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isUploadingImage) {
                                                e.currentTarget.style.opacity = '0.8';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }
                                        }}
                                    >
                                        <Camera size={22} />
                                    </button>
                                </div>
                                {/* Image upload error message */}
                                {imageUploadError && (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '8px',
                                        color: '#F87171',
                                        fontSize: '0.85rem',
                                        textAlign: 'center',
                                    }}>
                                        {imageUploadError}
                                    </div>
                                )}
                                <div className="profile-name-section">
                                    <h1 className="profile-name">
                                        {user.first_name} <span className="profile-last-name">{user.last_name}</span>
                                    </h1>
                                </div>
                                <p className="profile-username">@{user.username}</p>

                                <span className={`profile-status-badge ${user.status === 'alive' ? 'alive' : 'deceased'}`}>
                                    {user.status === 'alive' ? '✓ Alive' : '🕊️ Deceased'}
                                </span>

                                {user.bio && <p className="profile-bio">{user.bio}</p>}

                                {/* Stats */}
                                <div className="profile-stats">
                                    <div className="profile-stat">
                                        <span className="profile-stat-number">{connectionCount}</span>
                                        <span className="profile-stat-label">Connections</span>
                                    </div>
                                    <div className="profile-stat">
                                        <span className="profile-stat-number">{pendingRequestCount + sentRequestCount}</span>
                                        <span className="profile-stat-label">Pending</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="profile-actions">
                                    <button
                                        className="profile-btn profile-btn-primary"
                                        onClick={() => router.visit(route('settings.account'))}
                                        title="Edit your account settings"
                                    >
                                        <Edit size={18} />
                                        Account Settings
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-secondary"
                                        onClick={() => router.visit(route('notifications.index'))}
                                        title="View your notifications"
                                        style={{ position: 'relative' }}
                                    >
                                        <Bell size={18} />
                                        Notifications
                                        {unreadNotificationCount > 0 && (
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    top: '-6px',
                                                    right: '-6px',
                                                    backgroundColor: '#FF6B9D',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: '20px',
                                                    height: '20px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    border: '2px solid #1a1a1a',
                                                }}
                                            >
                                                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-secondary"
                                        onClick={() => router.visit(route('galleries.index'))}
                                        title="View and manage your galleries"
                                    >
                                        <Settings size={18} />
                                        My Galleries
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-secondary"
                                        onClick={() => router.visit(route('connections.index'))}
                                        title="View all your connections"
                                    >
                                        <Users size={18} />
                                        View Connections
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-secondary"
                                        onClick={() => router.visit(route('family-tree.index'))}
                                        title="View and manage your family trees"
                                    >
                                        <TreePine size={18} />
                                        Family Tree
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-logout"
                                        onClick={() => router.post(route('auth.logout'))}
                                        title="Sign out of your account"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Profile Details */}
                        <div className="profile-content">
                            {/* Profile Details Card */}
                            <div className="profile-card">
                                <div className="profile-card-header">
                                    <h2 className="profile-card-title">
                                        <FileText size={24} />
                                        Profile Information
                                    </h2>
                                </div>

                                <div className="profile-fields">
                                    {fields.map((field) => {
                                        const IconComponent = field.icon;
                                        const config = fieldConfigs[field.key];
                                        const isEditable = config?.editable ?? false;
                                        return (
                                            <div key={field.key} className="profile-field" style={{ position: 'relative' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <label className="profile-field-label" style={{ marginBottom: 0 }}>
                                                        <IconComponent size={16} />
                                                        {field.label}
                                                    </label>
                                                    {isEditable && (
                                                        <button
                                                            onClick={() => handleEditField(field)}
                                                            title={`Edit ${field.label}`}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                padding: '0.25rem',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.2s ease',
                                                                color: '#667eea',
                                                                flexShrink: 0,
                                                                opacity: 0.7,
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.opacity = '1';
                                                                e.currentTarget.style.transform = 'scale(1.1)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.opacity = '0.7';
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                            }}
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className={`profile-field-value ${!field.value ? 'empty' : ''}`}>
                                                    {field.value || 'Not provided'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick Actions Card */}
                            <div className="profile-card">
                                <div className="profile-card-header">
                                    <h2 className="profile-card-title">
                                        <Users size={24} />
                                        Connection Overview
                                    </h2>
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => router.visit(route('connections.index'))}
                                            style={{ padding: '0.85rem 1.25rem' }}
                                        >
                                            <span>
                                                <strong>{connectionCount}</strong> Connected
                                            </span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-warning w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => router.visit(route('connections.pending'))}
                                            style={{ padding: '0.85rem 1.25rem' }}
                                        >
                                            <span>
                                                <strong>{pendingRequestCount}</strong> Pending
                                            </span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-info w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => router.visit(route('connections.sent'))}
                                            style={{ padding: '0.85rem 1.25rem' }}
                                        >
                                            <span>
                                                <strong>{sentRequestCount}</strong> Sent
                                            </span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-success w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => router.visit(route('connections.create'))}
                                            style={{ padding: '0.85rem 1.25rem' }}
                                        >
                                            <span>Add Connection</span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => router.visit(route('suggested-connections.index'))}
                                            style={{ padding: '0.85rem 1.25rem' }}
                                            title="Discover suggested family members based on your connections"
                                        >
                                            <span>
                                                <strong>{suggestedConnectionsCount}</strong> Suggestions
                                            </span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => router.visit(route('your-tree.index'))}
                                            style={{
                                                padding: '0.85rem 1.25rem',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none',
                                                color: 'white',
                                                fontWeight: '600'
                                            }}
                                            title="View your connection tree visualization"
                                        >
                                            <span className="d-flex align-items-center gap-2">
                                                <Network size={18} />
                                                Your Tree
                                            </span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tips & Info Box */}
                            <div className="profile-info-box" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <span style={{ fontWeight: 700 }}>💡 Pro Tip:</span> Your profile is completely visible to you. Use <span style={{ fontWeight: 700 }}>Privacy Settings</span> to control who sees each field across the platform.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Popup Modal */}
                {showImagePopup && (
                    <div
                        className="profile-image-popup-overlay"
                        onClick={() => setShowImagePopup(false)}
                    >
                        <div className="profile-image-popup-container">
                            <button
                                className="profile-image-popup-close"
                                onClick={() => setShowImagePopup(false)}
                                title="Close"
                                aria-label="Close image"
                            >
                                <X size={32} />
                            </button>
                            <img
                                src={localUser.profile_image_url || 'https://via.placeholder.com/140'}
                                alt={localUser.name}
                                className="profile-image-popup-img"
                                onClick={(e) => e.stopPropagation()}
                            />

                        </div>
                    </div>
                )}

                {/* Floating Action Button - Create Post */}
                <button
                    className="fab-btn"
                    onClick={() => setShowCreateModal(true)}
                    title="Create new post"
                >
                    <Plus size={24} />
                </button>

                {/* Floating Profile Completion Button - Show only if incomplete */}
                {profileCompletion.percentage < 100 && (
                    <button
                        onClick={() => setShowCompletionModal(true)}
                        title="View profile completion status"
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            right: '30px',
                            width: '65px',
                            height: '65px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            color: 'white',
                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                            transition: 'all 0.3s ease',
                            zIndex: 1000,
                            fontWeight: '700',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                        }}
                    >
                        <TrendingUp size={22} />
                        <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>
                            {profileCompletion.percentage}%
                        </span>
                    </button>
                )}

                {/* Create Post Modal */}
                {showCreateModal && (
                    <CreatePostModal
                        onClose={() => setShowCreateModal(false)}
                        onPostCreated={handlePostCreated}
                    />
                )}

                {/* Profile Completion Modal */}
                {showCompletionModal && (
                    <ProfileCompletionModal
                        data={profileCompletion}
                        onClose={() => setShowCompletionModal(false)}
                    />
                )}

                {/* Inline Edit Field Modal */}
                {editingField && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2000,
                            backdropFilter: 'blur(4px)',
                            padding: '1rem',
                        }}
                        onClick={handleCloseEdit}
                    >
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                width: '100%',
                                maxWidth: '450px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                border: '1px solid rgba(102, 126, 234, 0.2)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1.25rem',
                            }}>
                                <h3 style={{
                                    margin: 0,
                                    color: '#FFFFFF',
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}>
                                    <Pencil size={20} style={{ color: '#667eea' }} />
                                    Edit {editingField.label}
                                </h3>
                                <button
                                    onClick={handleCloseEdit}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        color: '#94A3B8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                        e.currentTarget.style.color = '#FFFFFF';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.color = '#94A3B8';
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Input Field */}
                            <div style={{ marginBottom: '1rem' }}>
                                {editingField.type === 'textarea' ? (
                                    <textarea
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        maxLength={editingField.maxLength}
                                        placeholder={`Enter your ${editingField.label.toLowerCase()}`}
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem 1rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(102, 126, 234, 0.3)',
                                            borderRadius: '10px',
                                            color: '#FFFFFF',
                                            fontSize: '1rem',
                                            resize: 'vertical',
                                            minHeight: '120px',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)'}
                                    />
                                ) : editingField.type === 'select' ? (
                                    <select
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem 1rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(102, 126, 234, 0.3)',
                                            borderRadius: '10px',
                                            color: '#FFFFFF',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <option value="" style={{ background: '#1a1a2e' }}>Select {editingField.label}</option>
                                        {editingField.options?.map(opt => (
                                            <option key={opt.value} value={opt.value} style={{ background: '#1a1a2e' }}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={editingField.type}
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        maxLength={editingField.maxLength}
                                        placeholder={`Enter your ${editingField.label.toLowerCase()}`}
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem 1rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(102, 126, 234, 0.3)',
                                            borderRadius: '10px',
                                            color: '#FFFFFF',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)'}
                                    />
                                )}
                                {editingField.maxLength && editingField.type !== 'select' && (
                                    <div style={{
                                        textAlign: 'right',
                                        fontSize: '0.8rem',
                                        color: '#64748B',
                                        marginTop: '0.5rem',
                                    }}>
                                        {editValue.length} / {editingField.maxLength}
                                    </div>
                                )}
                            </div>

                            {/* Error Message */}
                            {saveError && (
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '8px',
                                    padding: '0.75rem 1rem',
                                    marginBottom: '1rem',
                                    color: '#F87171',
                                    fontSize: '0.9rem',
                                }}>
                                    {saveError}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '0.75rem',
                                justifyContent: 'flex-end',
                            }}>
                                <button
                                    onClick={handleCloseEdit}
                                    disabled={isSaving}
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '10px',
                                        color: '#E2E8F0',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        opacity: isSaving ? 0.5 : 1,
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveField}
                                    disabled={isSaving}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: '#FFFFFF',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.2s',
                                        opacity: isSaving ? 0.7 : 1,
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                    }}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add keyframes for spinner */}
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </AuthAccessLayout>
    );
}
