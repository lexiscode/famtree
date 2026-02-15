import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FolderOpen,
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
    Building2,
} from 'lucide-react';

interface CategoryItem {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    is_active: boolean;
    display_order: number;
    organizations_count: number;
}

interface Props {
    categories: CategoryItem[];
}

interface SharedProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

interface FormState {
    name: string;
    description: string;
    icon: string;
    display_order: string;
}

const emptyForm: FormState = {
    name: '',
    description: '',
    icon: '',
    display_order: '0',
};

export default function Categories({ categories }: Props) {
    const { flash } = usePage<SharedProps>().props;
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addForm, setAddForm] = useState<FormState>({ ...emptyForm });
    const [editForm, setEditForm] = useState<FormState>({ ...emptyForm });

    const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAddForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post(route('admin.orgCategories.store'), addForm, {
            onFinish: () => {
                setIsSubmitting(false);
                setAddForm({ ...emptyForm });
                setShowAddForm(false);
            },
        });
    };

    const handleUpdate = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.put(route('admin.orgCategories.update', id), editForm, {
            onFinish: () => {
                setIsSubmitting(false);
                setEditingId(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        setIsSubmitting(true);
        router.delete(route('admin.orgCategories.destroy', id), {
            onFinish: () => {
                setIsSubmitting(false);
                setDeleteConfirmId(null);
            },
        });
    };

    const startEditing = (cat: CategoryItem) => {
        setEditingId(cat.id);
        setEditForm({
            name: cat.name,
            description: cat.description || '',
            icon: cat.icon || '',
            display_order: String(cat.display_order),
        });
        setShowAddForm(false);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({ ...emptyForm });
    };

    return (
        <AdminLayout>
            <div>
{/* Page Header */}
                <div className="ap-page-header-row">
                    <div>
                        <h1 className="ap-page-title">Organization Categories</h1>
                        <p className="ap-page-subtitle">Manage categories used to classify organizations</p>
                    </div>
                    <div className="ap-page-header-actions">
                        <button
                            onClick={() => {
                                setShowAddForm(!showAddForm);
                                setEditingId(null);
                                setAddForm({ ...emptyForm });
                            }}
                            className={`ap-btn ${showAddForm ? 'ap-btn-secondary' : 'ap-btn-primary'} ap-btn-sm`}
                        >
                            {showAddForm ? <X size={18} /> : <Plus size={18} />}
                            {showAddForm ? 'Cancel' : 'Add Category'}
                        </button>
                    </div>
                </div>

                {/* Add Category Form */}
                {showAddForm && (
                    <div className="ap-card-lg">
                        <h3 className="ap-card-title ap-mb-lg">New Category</h3>

                        <form onSubmit={handleCreate}>
                            <div className="ap-form-row ap-mb-lg">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={addForm.name}
                                        onChange={handleAddChange}
                                        placeholder="Category name"
                                        required
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Description</label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={addForm.description}
                                        onChange={handleAddChange}
                                        placeholder="Brief description"
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Icon</label>
                                    <input
                                        type="text"
                                        name="icon"
                                        value={addForm.icon}
                                        onChange={handleAddChange}
                                        placeholder="e.g., church, school"
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Display Order</label>
                                    <input
                                        type="number"
                                        name="display_order"
                                        value={addForm.display_order}
                                        onChange={handleAddChange}
                                        placeholder="0"
                                        min="0"
                                        className="ap-form-input"
                                    />
                                </div>
                            </div>

                            <div className="ap-flex ap-gap-sm ap-justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setAddForm({ ...emptyForm });
                                    }}
                                    className="ap-btn ap-btn-secondary ap-btn-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="ap-btn ap-btn-primary ap-btn-sm"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={16} className="ap-spin" />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    {isSubmitting ? 'Creating...' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Categories Table */}
                <div className="ap-table-wrap">
                    {categories.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Icon</th>
                                        <th className="center">Organizations</th>
                                        <th className="center">Order</th>
                                        <th className="center">Status</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat) => (
                                        <tr key={cat.id}>
                                            {editingId === cat.id ? (
                                                /* Edit Mode Row */
                                                <td colSpan={6} className="ap-p-0">
                                                    <form onSubmit={(e) => handleUpdate(e, cat.id)}>
                                                        <div className="ap-p-lg">
                                                            <div className="ap-form-row ap-mb-lg">
                                                                <div className="ap-form-group">
                                                                    <label className="ap-form-label">Name *</label>
                                                                    <input
                                                                        type="text"
                                                                        name="name"
                                                                        value={editForm.name}
                                                                        onChange={handleEditChange}
                                                                        required
                                                                        className="ap-form-input"
                                                                    />
                                                                </div>
                                                                <div className="ap-form-group">
                                                                    <label className="ap-form-label">Description</label>
                                                                    <input
                                                                        type="text"
                                                                        name="description"
                                                                        value={editForm.description}
                                                                        onChange={handleEditChange}
                                                                        className="ap-form-input"
                                                                    />
                                                                </div>
                                                                <div className="ap-form-group">
                                                                    <label className="ap-form-label">Icon</label>
                                                                    <input
                                                                        type="text"
                                                                        name="icon"
                                                                        value={editForm.icon}
                                                                        onChange={handleEditChange}
                                                                        className="ap-form-input"
                                                                    />
                                                                </div>
                                                                <div className="ap-form-group">
                                                                    <label className="ap-form-label">Display Order</label>
                                                                    <input
                                                                        type="number"
                                                                        name="display_order"
                                                                        value={editForm.display_order}
                                                                        onChange={handleEditChange}
                                                                        min="0"
                                                                        className="ap-form-input"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="ap-flex ap-gap-sm ap-justify-end">
                                                                <button
                                                                    type="button"
                                                                    onClick={cancelEditing}
                                                                    className="ap-btn ap-btn-secondary ap-btn-sm"
                                                                >
                                                                    <X size={16} />
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    disabled={isSubmitting}
                                                                    className="ap-btn ap-btn-success ap-btn-sm"
                                                                >
                                                                    {isSubmitting ? (
                                                                        <Loader2 size={16} className="ap-spin" />
                                                                    ) : (
                                                                        <Save size={16} />
                                                                    )}
                                                                    {isSubmitting ? 'Saving...' : 'Save'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </td>
                                            ) : (
                                                /* Display Mode Row */
                                                <>
                                                    <td>
                                                        <div>
                                                            <span className="ap-font-semibold">{cat.name}</span>
                                                            {cat.description && (
                                                                <span className="ap-text-sm ap-text-secondary ap-truncate ap-d-block ap-max-w-300">
                                                                    {cat.description}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {cat.icon ? (
                                                            <span className="ap-badge ap-badge-neutral">{cat.icon}</span>
                                                        ) : (
                                                            <span className="ap-text-secondary">--</span>
                                                        )}
                                                    </td>
                                                    <td className="center">
                                                        <span className="ap-badge ap-badge-primary">
                                                            <Building2 size={14} />
                                                            {cat.organizations_count}
                                                        </span>
                                                    </td>
                                                    <td className="center">
                                                        <span className="ap-font-semibold">{cat.display_order}</span>
                                                    </td>
                                                    <td className="center">
                                                        <span className={cat.is_active ? 'ap-badge ap-badge-success' : 'ap-badge ap-badge-neutral'}>
                                                            {cat.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="center">
                                                        <div className="ap-flex ap-items-center ap-gap-sm ap-justify-center">
                                                            {/* Edit Button */}
                                                            <button
                                                                onClick={() => startEditing(cat)}
                                                                className="ap-btn ap-btn-primary ap-btn-sm"
                                                                title="Edit category"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>

                                                            {/* Delete Button */}
                                                            {deleteConfirmId === cat.id ? (
                                                                <div className="ap-flex ap-items-center ap-gap-sm">
                                                                    <button
                                                                        onClick={() => handleDelete(cat.id)}
                                                                        disabled={isSubmitting}
                                                                        className="ap-btn ap-btn-danger ap-btn-sm"
                                                                    >
                                                                        {isSubmitting ? (
                                                                            <Loader2 size={14} className="ap-spin" />
                                                                        ) : (
                                                                            'Confirm'
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeleteConfirmId(null)}
                                                                        className="ap-btn ap-btn-secondary ap-btn-sm"
                                                                    >
                                                                        No
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        if (cat.organizations_count === 0) {
                                                                            setDeleteConfirmId(cat.id);
                                                                        }
                                                                    }}
                                                                    disabled={cat.organizations_count > 0}
                                                                    title={
                                                                        cat.organizations_count > 0
                                                                            ? 'Cannot delete: category has organizations'
                                                                            : 'Delete category'
                                                                    }
                                                                    className="ap-btn ap-btn-danger ap-btn-sm"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <FolderOpen size={40} />
                            </div>
                            <p className="ap-empty-title">No categories found</p>
                            <p className="ap-empty-text">Create your first organization category to get started</p>
                            <button
                                onClick={() => {
                                    setShowAddForm(true);
                                    setAddForm({ ...emptyForm });
                                }}
                                className="ap-btn ap-btn-primary"
                            >
                                <Plus size={18} />
                                Add First Category
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
