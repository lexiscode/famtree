import { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { ArrowLeft, AlertCircle, Info, Lightbulb, Users, CheckCircle } from 'lucide-react';
import './CreateTree.css';

interface NuclearFamilyMember {
    user_id: number;
    name: string;
    role: 'spouse' | 'child';
}

interface Props {
    canCreate: boolean;
    validationErrors: string[];
    nuclearFamilyMembers: NuclearFamilyMember[];
}

export default function CreateTree({ canCreate, validationErrors, nuclearFamilyMembers }: Props) {
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
            <div className="family-tree-page">
                <div className="family-tree-container">
                    {/* Back Button */}
                    <button
                        onClick={handleCancel}
                        style={{
                            marginBottom: '2rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            color: '#0052E8',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            transition: 'all 0.3s ease',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 82, 232, 0.08)';
                            e.currentTarget.style.transform = 'translateX(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.transform = 'none';
                        }}
                    >
                        <ArrowLeft size={18} />
                        Back to Family Trees
                    </button>

                    {/* Form Container */}
                    <div className="tree-form-container">
                        <h1 className="tree-form-title">Create Your Nuclear Family Tree</h1>
                        <p className="tree-form-subtitle">Create a family tree for you and your immediate family</p>

                        {/* Validation Errors */}
                        {!canCreate && validationErrors.length > 0 && (
                            <div className="tree-error-alert" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
                                <AlertCircle size={22} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Unable to Create Family Tree</div>
                                    <ul style={{ margin: 0, paddingLeft: '1.4rem' }}>
                                        {validationErrors.map((error, index) => (
                                            <li key={index} style={{ marginBottom: '0.4rem', fontSize: '0.9rem' }}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Nuclear Family Preview */}
                        {canCreate && nuclearFamilyMembers.length > 0 && (
                            <div className="tree-info-alert" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
                                <Users size={22} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Nuclear Family Members</div>
                                    <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.9rem', color: '#555' }}>
                                        The following family members will be automatically added to your tree:
                                    </p>
                                    <ul style={{ margin: 0, paddingLeft: '1.4rem' }}>
                                        {nuclearFamilyMembers.map((member) => (
                                            <li key={member.user_id} style={{ marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                                                <strong>{member.name}</strong> ({member.role})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Tree Name Field */}
                            <div className="tree-form-group">
                                <label className="tree-form-label">Family Tree Name *</label>
                                <input
                                    type="text"
                                    name="tree_name"
                                    className="tree-form-input"
                                    placeholder="e.g., Smith Family Tree, Johnson Generations"
                                    value={formData.tree_name}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.tree_name && <div className="tree-error-alert" style={{ marginTop: '0.65rem', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{errors.tree_name}</div>}
                                <div className="tree-form-help">Choose a name that represents your family</div>
                            </div>

                            {/* Description Field */}
                            <div className="tree-form-group">
                                <label className="tree-form-label">Description</label>
                                <textarea
                                    name="description"
                                    className="tree-form-textarea"
                                    placeholder="Add any details about this family tree, time period, location, or other important notes..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                                {errors.description && <div className="tree-error-alert" style={{ marginTop: '0.65rem', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{errors.description}</div>}
                                <div className="tree-form-help">Help other family members understand the context of this tree</div>
                            </div>

                            {/* Visibility Setting */}
                            <div className="tree-form-group">
                                <label className="tree-form-label">Visibility</label>
                                <label className="tree-form-checkbox">
                                    <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleInputChange} />
                                    <span>Make this tree public</span>
                                </label>
                                <div className="tree-form-help" style={{ marginTop: '0.6rem' }}>
                                    Public trees can be viewed by anyone with the link. Private trees are visible only to members.
                                </div>
                            </div>

                            {/* Tips Box */}
                            <div className="tree-info-alert" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '1.5rem', borderRadius: '10px' }}>
                                <Lightbulb size={22} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                                <div style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
                                    <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>About Nuclear Family Trees:</div>
                                    <ul style={{ margin: 0, paddingLeft: '1.4rem' }}>
                                        <li style={{ marginBottom: '0.4rem' }}>Your nuclear family members (spouse and children) will be automatically added</li>
                                        <li style={{ marginBottom: '0.4rem' }}>Nuclear family members can add their own spouse and children to the tree</li>
                                        <li style={{ marginBottom: '0.4rem' }}>You can send connection requests to other family trees to merge families</li>
                                        <li>Once merged, both tree creators become co-admins with equal permissions</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="tree-form-actions">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="tree-form-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="tree-form-submit"
                                    disabled={!canCreate || loading || !formData.tree_name.trim()}
                                >
                                    {loading ? 'Creating Nuclear Family Tree...' : 'Create Nuclear Family Tree'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
