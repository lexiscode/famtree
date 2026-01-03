import { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { ArrowLeft, Lightbulb, Globe, Lock, Sparkles, TreePine } from 'lucide-react';
import ProfileSidebar from '../Stories/ProfileSidebar';
import { UserProfile } from '@/types';
import './EditTree.css';
import '../../../../css/connections.css';

interface TreeData {
    id: number;
    name: string;
    description?: string;
    is_public: boolean;
}

interface Props {
    user: UserProfile;
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
    tree: TreeData;
}

export default function EditTree({
    user,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
    tree
}: Props) {
    const [formData, setFormData] = useState({
        tree_name: tree.name,
        description: tree.description || '',
        is_public: tree.is_public,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, type, value } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setLoading(true);
            setErrors({});

            router.put(route('family-tree.update', tree.id), formData, {
                onSuccess: () => {
                    setLoading(false);
                },
                onError: (errors) => {
                    setLoading(false);
                    setErrors(errors as Record<string, string>);
                },
            });
        },
        [tree.id, formData]
    );

    const handleCancel = useCallback(() => {
        router.get(route('family-tree.show', tree.id));
    }, [tree.id]);

    return (
        <AuthAccessLayout>
            <div className="connections-grid-layout">
                {/* Left Sidebar - Profile */}
                {user && (
                    <div className="connections-left-sidebar">
                        <ProfileSidebar
                            user={user}
                            connectionCount={connectionCount}
                            pendingRequestCount={pendingRequestCount}
                            sentRequestCount={sentRequestCount}
                            unreadNotificationCount={unreadNotificationCount}
                        />
                    </div>
                )}

                {/* Center Content */}
                <div className="connections-center-content">
                    <div className="premium-edit-tree-page">
                <div className="edit-background">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                </div>

                <div className="edit-container">
                    {/* Header */}
                    <div className="edit-header">
                        <button onClick={handleCancel} className="edit-back-button">
                            <ArrowLeft size={20} />
                            <span>Back to Tree</span>
                        </button>

                        <div className="edit-header-content">
                            <div className="edit-header-icon">
                                <TreePine size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1>Edit Family Tree</h1>
                                <p>Update your family tree information and settings</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="premium-edit-form">
                        <div className="edit-form-grid">
                            {/* Tree Name */}
                            <div className="edit-form-group">
                                <label htmlFor="tree_name" className="edit-form-label">
                                    Family Tree Name <span className="edit-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="tree_name"
                                    name="tree_name"
                                    className={`edit-form-input ${errors.tree_name ? 'error' : ''}`}
                                    placeholder="e.g., Smith Family Tree"
                                    value={formData.tree_name}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.tree_name && (
                                    <span className="edit-error-message">{errors.tree_name}</span>
                                )}
                                <span className="edit-form-hint">Update the name that represents your family</span>
                            </div>

                            {/* Description */}
                            <div className="edit-form-group">
                                <label htmlFor="description" className="edit-form-label">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className={`edit-form-textarea ${errors.description ? 'error' : ''}`}
                                    placeholder="Update details about your family tree, time period, location..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                />
                                {errors.description && (
                                    <span className="edit-error-message">{errors.description}</span>
                                )}
                                <span className="edit-form-hint">Help other family members understand the context</span>
                            </div>

                            {/* Visibility */}
                            <div className="edit-form-group">
                                <label className="edit-form-label">Visibility</label>
                                <div className="edit-visibility-options">
                                    <label className={`edit-visibility-option ${!formData.is_public ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="visibility"
                                            checked={!formData.is_public}
                                            onChange={() => setFormData(prev => ({ ...prev, is_public: false }))}
                                        />
                                        <div className="edit-option-content">
                                            <Lock size={20} />
                                            <div>
                                                <span className="edit-option-title">Private</span>
                                                <span className="edit-option-desc">Visible only to members</span>
                                            </div>
                                        </div>
                                    </label>
                                    <label className={`edit-visibility-option ${formData.is_public ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="visibility"
                                            checked={formData.is_public}
                                            onChange={() => setFormData(prev => ({ ...prev, is_public: true }))}
                                        />
                                        <div className="edit-option-content">
                                            <Globe size={20} />
                                            <div>
                                                <span className="edit-option-title">Public</span>
                                                <span className="edit-option-desc">Anyone can view with link</span>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="edit-info-box">
                            <div className="edit-info-icon">
                                <Lightbulb size={22} />
                            </div>
                            <div className="edit-info-content">
                                <h5>What will be updated</h5>
                                <ul>
                                    <li>Tree name and description</li>
                                    <li>Visibility settings (public/private)</li>
                                </ul>
                                <div className="edit-info-note">
                                    Members and relationships will not be affected by these changes.
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="edit-form-actions">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="edit-btn edit-btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="edit-btn edit-btn-primary"
                                disabled={loading || !formData.tree_name.trim()}
                            >
                                {loading ? (
                                    <>
                                        <span className="edit-spinner"></span>
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Save Changes
                                    </>
                                )}
                                <div className="button-glow"></div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
