import { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { ArrowLeft, AlertCircle, Info } from 'lucide-react';

interface Props {
    connectionCount: number;
}

export default function CreateTree({ connectionCount }: Props) {
    const [formData, setFormData] = useState({
        tree_name: '',
        description: '',
        is_public: false,
        auto_populate: false,
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

        // Clear error for this field
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
        <GuestLayout>
            <div className="family-tree-page">
                <div className="family-tree-container">
                    {/* Back Button */}
                    <button onClick={handleCancel} style={{ marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0052E8', fontSize: '0.95rem', fontWeight: 600 }}>
                        <ArrowLeft size={18} />
                        Back to Trees
                    </button>

                    {/* Form Container */}
                    <div className="tree-form-container">
                        <h1 className="tree-form-title">Create Family Tree</h1>
                        <p className="tree-form-subtitle">Build your family tree and connect with relatives</p>

                        <form onSubmit={handleSubmit}>
                            {/* Tree Name Field */}
                            <div className="tree-form-group">
                                <label className="tree-form-label">Tree Name</label>
                                <input
                                    type="text"
                                    name="tree_name"
                                    className="tree-form-input"
                                    placeholder="e.g., Smith Family Tree, Johnson Generations"
                                    value={formData.tree_name}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.tree_name && <div className="tree-error-alert" style={{ marginTop: '0.35rem', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}>{errors.tree_name}</div>}
                                <div className="tree-form-help">Give your family tree a meaningful name</div>
                            </div>

                            {/* Description Field */}
                            <div className="tree-form-group">
                                <label className="tree-form-label">Description</label>
                                <textarea
                                    name="description"
                                    className="tree-form-textarea"
                                    placeholder="Add any details about this family tree, time period, location, etc."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                                {errors.description && <div className="tree-error-alert" style={{ marginTop: '0.35rem', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}>{errors.description}</div>}
                                <div className="tree-form-help">Optional - helps others understand this tree's context</div>
                            </div>

                            {/* Visibility Setting */}
                            <div className="tree-form-group">
                                <label className="tree-form-label">Visibility</label>
                                <label className="tree-form-checkbox">
                                    <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleInputChange} />
                                    <span>Make this tree public</span>
                                </label>
                                <div className="tree-form-help">Public trees can be viewed by anyone with the link</div>
                            </div>

                            {/* Auto-Populate Setting */}
                            <div className="tree-form-group">
                                <label className="tree-form-label">Add Members</label>
                                {connectionCount > 0 ? (
                                    <>
                                        <label className="tree-form-checkbox">
                                            <input type="checkbox" name="auto_populate" checked={formData.auto_populate} onChange={handleInputChange} />
                                            <span>
                                                Automatically add my {connectionCount} connection{connectionCount !== 1 ? 's' : ''}
                                            </span>
                                        </label>
                                        <div className="tree-form-help">You can add or remove members after creating the tree</div>
                                    </>
                                ) : (
                                    <div className="tree-info-alert" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', marginBottom: '0' }}>
                                        <Info size={18} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                                        <span>You don't have any connections yet. Add connections to auto-populate members.</span>
                                    </div>
                                )}
                            </div>

                            {/* Info Box */}
                            <div className="tree-info-alert" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', borderRadius: '8px' }}>
                                <AlertCircle size={20} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Tips for building your family tree:</div>
                                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                                        <li>Start with immediate family members</li>
                                        <li>You can add or invite members anytime</li>
                                        <li>Share your tree with family to grow it together</li>
                                        <li>Set relationships between members for better visualization</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="tree-form-actions">
                                <button type="button" onClick={handleCancel} className="tree-form-cancel">
                                    Cancel
                                </button>
                                <button type="submit" className="tree-form-submit" disabled={loading || !formData.tree_name.trim()}>
                                    {loading ? 'Creating...' : 'Create Family Tree'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
