import { useCallback, useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { ArrowLeft, AlertCircle, Users, CheckCircle, Lightbulb, Globe, Lock, Sparkles, TreePine } from 'lucide-react';
import ProfileSidebar from '../Stories/ProfileSidebar';
import { UserProfile } from '@/types';
import './CreateTree.css';
import '../../../../css/connections.css';

interface NuclearFamilyMember {
    user_id: number;
    name: string;
    role: 'spouse' | 'child';
}

interface Props {
    user: UserProfile;
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
    canCreate: boolean;
    validationErrors: string[];
    nuclearFamilyMembers: NuclearFamilyMember[];
}

export default function CreateTree({
    user,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
    unreadNotificationCount,
    canCreate,
    validationErrors,
    nuclearFamilyMembers
}: Props) {
    const [formData, setFormData] = useState({
        tree_name: '',
        description: '',
        is_public: false,
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

            router.post(route('family-tree.store'), formData, {
                onSuccess: () => {
                    setLoading(false);
                },
                onError: (errors) => {
                    setLoading(false);
                    setErrors(errors as Record<string, string>);
                },
            });
        },
        [formData]
    );

    const handleCancel = useCallback(() => {
        router.get(route('family-tree.index'));
    }, []);

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
                    <div className="premium-create-tree-page">
                <div className="create-background">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                </div>

                <div className="create-container">
                    {/* Header */}
                    <div className="create-header">
                        <Link href={route('family-tree.index')} className="back-button">
                            <ArrowLeft size={20} />
                            <span>Back to Trees</span>
                        </Link>

                        <div className="header-content">
                            <div className="header-icon">
                                <TreePine size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1>Create Nuclear Family Tree</h1>
                                <p>Build your family legacy and connect with your loved ones</p>
                            </div>
                        </div>
                    </div>

                    {/* Validation Errors */}
                    {!canCreate && validationErrors.length > 0 && (
                        <div className="alert alert-error">
                            <div className="alert-icon">
                                <AlertCircle size={24} />
                            </div>
                            <div className="alert-content">
                                <h4>Unable to Create Family Tree</h4>
                                <p>Please resolve the following requirements:</p>
                                <ul>
                                    {validationErrors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Nuclear Family Preview */}
                    {canCreate && nuclearFamilyMembers.length > 0 && (
                        <div className="alert alert-info">
                            <div className="alert-icon">
                                <Users size={24} />
                            </div>
                            <div className="alert-content">
                                <h4>Nuclear Family Members</h4>
                                <p>The following family members will be automatically added to your tree:</p>
                                <div className="member-preview-grid">
                                    {nuclearFamilyMembers.map((member) => (
                                        <div key={member.user_id} className="member-preview-card">
                                            <div className="member-avatar">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="member-info">
                                                <span className="member-name">{member.name}</span>
                                                <span className="member-role">{member.role}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="premium-form">
                        <div className="form-grid">
                            {/* Tree Name */}
                            <div className="form-group full-width">
                                <label htmlFor="tree_name" className="form-label">
                                    Family Tree Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="tree_name"
                                    name="tree_name"
                                    className={`form-input ${errors.tree_name ? 'error' : ''}`}
                                    placeholder="e.g., Smith Family Tree"
                                    value={formData.tree_name}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!canCreate}
                                />
                                {errors.tree_name && (
                                    <span className="error-message">{errors.tree_name}</span>
                                )}
                                <span className="form-hint">Choose a name that represents your family</span>
                            </div>

                            {/* Description */}
                            <div className="form-group full-width">
                                <label htmlFor="description" className="form-label">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                                    placeholder="Add details about your family tree, time period, location..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    disabled={!canCreate}
                                />
                                {errors.description && (
                                    <span className="error-message">{errors.description}</span>
                                )}
                                <span className="form-hint">Help other family members understand the context</span>
                            </div>

                            {/* Visibility */}
                            <div className="form-group full-width">
                                <label className="form-label">Visibility</label>
                                <div className="visibility-options">
                                    <label className={`visibility-option ${!formData.is_public ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="visibility"
                                            checked={!formData.is_public}
                                            onChange={() => setFormData(prev => ({ ...prev, is_public: false }))}
                                            disabled={!canCreate}
                                        />
                                        <div className="option-content">
                                            <Lock size={20} />
                                            <div>
                                                <span className="option-title">Private</span>
                                                <span className="option-desc">Visible only to members</span>
                                            </div>
                                        </div>
                                    </label>
                                    <label className={`visibility-option ${formData.is_public ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="visibility"
                                            checked={formData.is_public}
                                            onChange={() => setFormData(prev => ({ ...prev, is_public: true }))}
                                            disabled={!canCreate}
                                        />
                                        <div className="option-content">
                                            <Globe size={20} />
                                            <div>
                                                <span className="option-title">Public</span>
                                                <span className="option-desc">Anyone can view with link</span>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="info-box">
                            <div className="info-icon">
                                <Lightbulb size={22} />
                            </div>
                            <div className="info-content">
                                <h5>About Nuclear Family Trees</h5>
                                <ul>
                                    <li>Your nuclear family members (spouse and children) will be automatically added</li>
                                    <li>Nuclear family members can add their own spouse and children to the tree</li>
                                    <li>You can send connection requests to other family trees to merge families</li>
                                    <li>Once merged, both tree creators become co-admins with equal permissions</li>
                                </ul>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!canCreate || loading || !formData.tree_name.trim()}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Create Nuclear Family Tree
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
