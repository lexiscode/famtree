import { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface TreeData {
    id: number;
    name: string;
    description?: string;
    is_public: boolean;
}

interface Props {
    tree: TreeData;
}

export default function EditTree({ tree }: Props) {
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

            router.put(route('family-tree.update', { treeId: tree.id }), formData, {
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
        router.get(route('family-tree.show', { treeId: tree.id }));
    }, [tree.id]);

    return (
        <GuestLayout>
            <div className="family-tree-page">
                <div className="family-tree-container">
                    {/* Back Button */}
                    <button onClick={handleCancel} style={{ marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0052E8', fontSize: '0.95rem', fontWeight: 600 }}>
                        <ArrowLeft size={18} />
                        Back to Tree
                    </button>

                    {/* Form Container */}
                    <div className="tree-form-container">
                        <h1 className="tree-form-title">Edit Family Tree</h1>
                        <p className="tree-form-subtitle">Update your family tree information</p>

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

                            {/* Info Box */}
                            <div className="tree-info-alert" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', borderRadius: '8px' }}>
                                <AlertCircle size={20} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Remember:</div>
                                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                                        <li>Changes will be saved immediately</li>
                                        <li>Members and connections are not affected</li>
                                        <li>You can manage members from the tree view</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="tree-form-actions">
                                <button type="button" onClick={handleCancel} className="tree-form-cancel">
                                    Cancel
                                </button>
                                <button type="submit" className="tree-form-submit" disabled={loading || !formData.tree_name.trim()}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
