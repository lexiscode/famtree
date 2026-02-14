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
    CheckCircle,
    AlertCircle,
    Building2,
    Hash,
    FileText,
    ArrowUpDown,
    Tag,
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

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

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

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '2px solid #E5E7EB',
        borderRadius: '10px',
        fontSize: '0.94rem',
        color: '#0a0e27',
        backgroundColor: '#FFFFFF',
        fontWeight: 500,
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
        outline: 'none',
        boxSizing: 'border-box' as const,
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.8rem',
        fontWeight: 700,
        color: '#0a0e27',
        marginBottom: '0.5rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.currentTarget.style.borderColor = THEME.primary;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`;
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.boxShadow = 'none';
    };

    return (
        <AdminLayout>
            <div>
                {/* Flash Messages */}
                {(flash?.success || flash?.error) && (
                    <div
                        style={{
                            marginBottom: '2rem',
                            padding: '1.25rem 1.5rem',
                            borderRadius: '12px',
                            background: flash?.error
                                ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(25, 135, 84, 0.1) 0%, rgba(25, 135, 84, 0.05) 100%)',
                            border: `1px solid ${flash?.error ? 'rgba(220, 38, 38, 0.3)' : 'rgba(25, 135, 84, 0.3)'}`,
                            color: flash?.error ? THEME.danger : THEME.success,
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: flash?.error
                                ? '0 4px 12px rgba(220, 38, 38, 0.1)'
                                : '0 4px 12px rgba(25, 135, 84, 0.1)',
                        }}
                    >
                        <span style={{ fontSize: '1.25rem' }}>
                            {flash?.error ? '\u26A0\uFE0F' : '\u2713'}
                        </span>
                        {flash?.success || flash?.error}
                    </div>
                )}

                {/* Page Header */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FolderOpen size={32} color={THEME.primary} strokeWidth={2} />
                            Organization Categories
                        </h1>
                        <p style={{ fontSize: '0.98rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>
                            Manage categories used to classify organizations
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            setEditingId(null);
                            setAddForm({ ...emptyForm });
                        }}
                        style={{
                            paddingLeft: '1.5rem',
                            paddingRight: '1.5rem',
                            paddingTop: '0.85rem',
                            paddingBottom: '0.85rem',
                            background: showAddForm
                                ? '#FFFFFF'
                                : `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                            color: showAddForm ? THEME.secondary : '#FFFFFF',
                            border: showAddForm ? '2px solid #E5E7EB' : 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontSize: '0.96rem',
                            letterSpacing: '0.3px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            boxShadow: showAddForm ? '0 2px 8px rgba(0, 0, 0, 0.04)' : `0 4px 12px ${THEME.primary}25`,
                        }}
                        onMouseEnter={(e) => {
                            if (!showAddForm) {
                                e.currentTarget.style.boxShadow = `0 12px 28px ${THEME.primary}40`;
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            } else {
                                e.currentTarget.style.background = '#F3F4F6';
                                e.currentTarget.style.borderColor = '#D1D5DB';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!showAddForm) {
                                e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}25`;
                                e.currentTarget.style.transform = 'translateY(0)';
                            } else {
                                e.currentTarget.style.background = '#FFFFFF';
                                e.currentTarget.style.borderColor = '#E5E7EB';
                            }
                        }}
                    >
                        {showAddForm ? <X size={18} /> : <Plus size={18} />}
                        {showAddForm ? 'Cancel' : 'Add Category'}
                    </button>
                </div>

                {/* Add Category Form */}
                {showAddForm && (
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            border: `2px solid ${THEME.primary}30`,
                            padding: '2rem',
                            marginBottom: '2rem',
                            boxShadow: `0 8px 28px ${THEME.primary}10`,
                        }}
                    >
                        <h3
                            style={{
                                fontSize: '1.1rem',
                                fontWeight: 800,
                                color: '#0a0e27',
                                margin: 0,
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                letterSpacing: '-0.3px',
                            }}
                        >
                            <div
                                style={{
                                    padding: '0.5rem',
                                    background: '#E7F1FF',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Plus size={20} color={THEME.primary} strokeWidth={2.5} />
                            </div>
                            New Category
                        </h3>

                        <form onSubmit={handleCreate}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: '1.25rem',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Tag size={12} color={THEME.primary} />
                                            Name <span style={{ color: THEME.danger }}>*</span>
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={addForm.name}
                                        onChange={handleAddChange}
                                        placeholder="Category name"
                                        required
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <FileText size={12} color={THEME.primary} />
                                            Description
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={addForm.description}
                                        onChange={handleAddChange}
                                        placeholder="Brief description"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Hash size={12} color={THEME.primary} />
                                            Icon
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="icon"
                                        value={addForm.icon}
                                        onChange={handleAddChange}
                                        placeholder="e.g., church, school"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <ArrowUpDown size={12} color={THEME.primary} />
                                            Display Order
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        name="display_order"
                                        value={addForm.display_order}
                                        onChange={handleAddChange}
                                        placeholder="0"
                                        min="0"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setAddForm({ ...emptyForm });
                                    }}
                                    style={{
                                        paddingLeft: '1.25rem',
                                        paddingRight: '1.25rem',
                                        paddingTop: '0.7rem',
                                        paddingBottom: '0.7rem',
                                        background: '#FFFFFF',
                                        color: THEME.secondary,
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '10px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        fontSize: '0.92rem',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#F3F4F6';
                                        e.currentTarget.style.borderColor = '#D1D5DB';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#FFFFFF';
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        paddingLeft: '1.5rem',
                                        paddingRight: '1.5rem',
                                        paddingTop: '0.7rem',
                                        paddingBottom: '0.7rem',
                                        background: isSubmitting
                                            ? THEME.secondary
                                            : `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 700,
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: `0 4px 12px ${THEME.primary}25`,
                                        fontSize: '0.92rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        opacity: isSubmitting ? 0.7 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSubmitting) {
                                            e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.primary}40`;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSubmitting) {
                                            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}25`;
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
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
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    {categories.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderBottom: '2px solid #E5E7EB' }}>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Category
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Icon
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Organizations
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Order
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Status
                                        </th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat) => (
                                        <tr key={cat.id}>
                                            {editingId === cat.id ? (
                                                /* Edit Mode Row */
                                                <td colSpan={6} style={{ padding: '0' }}>
                                                    <form onSubmit={(e) => handleUpdate(e, cat.id)}>
                                                        <div
                                                            style={{
                                                                padding: '1.5rem',
                                                                background: `linear-gradient(135deg, ${THEME.primary}05, ${THEME.primary}02)`,
                                                                borderBottom: `2px solid ${THEME.primary}20`,
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'grid',
                                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                                    gap: '1rem',
                                                                    marginBottom: '1.25rem',
                                                                }}
                                                            >
                                                                <div>
                                                                    <label style={labelStyle}>
                                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                            <Tag size={12} color={THEME.primary} />
                                                                            Name <span style={{ color: THEME.danger }}>*</span>
                                                                        </span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        name="name"
                                                                        value={editForm.name}
                                                                        onChange={handleEditChange}
                                                                        required
                                                                        style={inputStyle}
                                                                        onFocus={handleInputFocus}
                                                                        onBlur={handleInputBlur}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label style={labelStyle}>
                                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                            <FileText size={12} color={THEME.primary} />
                                                                            Description
                                                                        </span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        name="description"
                                                                        value={editForm.description}
                                                                        onChange={handleEditChange}
                                                                        style={inputStyle}
                                                                        onFocus={handleInputFocus}
                                                                        onBlur={handleInputBlur}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label style={labelStyle}>
                                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                            <Hash size={12} color={THEME.primary} />
                                                                            Icon
                                                                        </span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        name="icon"
                                                                        value={editForm.icon}
                                                                        onChange={handleEditChange}
                                                                        style={inputStyle}
                                                                        onFocus={handleInputFocus}
                                                                        onBlur={handleInputBlur}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label style={labelStyle}>
                                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                            <ArrowUpDown size={12} color={THEME.primary} />
                                                                            Display Order
                                                                        </span>
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        name="display_order"
                                                                        value={editForm.display_order}
                                                                        onChange={handleEditChange}
                                                                        min="0"
                                                                        style={inputStyle}
                                                                        onFocus={handleInputFocus}
                                                                        onBlur={handleInputBlur}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={cancelEditing}
                                                                    style={{
                                                                        paddingLeft: '1.25rem',
                                                                        paddingRight: '1.25rem',
                                                                        paddingTop: '0.6rem',
                                                                        paddingBottom: '0.6rem',
                                                                        background: '#FFFFFF',
                                                                        color: THEME.secondary,
                                                                        border: '2px solid #E5E7EB',
                                                                        borderRadius: '10px',
                                                                        fontWeight: 700,
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.3s ease',
                                                                        fontSize: '0.9rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.4rem',
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.background = '#F3F4F6';
                                                                        e.currentTarget.style.borderColor = '#D1D5DB';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.background = '#FFFFFF';
                                                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                                                    }}
                                                                >
                                                                    <X size={16} />
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    disabled={isSubmitting}
                                                                    style={{
                                                                        paddingLeft: '1.25rem',
                                                                        paddingRight: '1.25rem',
                                                                        paddingTop: '0.6rem',
                                                                        paddingBottom: '0.6rem',
                                                                        background: isSubmitting
                                                                            ? THEME.secondary
                                                                            : `linear-gradient(135deg, ${THEME.success} 0%, #146c43 100%)`,
                                                                        color: '#FFFFFF',
                                                                        border: 'none',
                                                                        borderRadius: '10px',
                                                                        fontWeight: 700,
                                                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                        boxShadow: `0 4px 12px ${THEME.success}25`,
                                                                        fontSize: '0.9rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.4rem',
                                                                        opacity: isSubmitting ? 0.7 : 1,
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (!isSubmitting) {
                                                                            e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.success}40`;
                                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                                        }
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        if (!isSubmitting) {
                                                                            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.success}25`;
                                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                                        }
                                                                    }}
                                                                >
                                                                    {isSubmitting ? (
                                                                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
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
                                                    <td style={{ padding: '1.2rem 1.25rem' }}>
                                                        <div>
                                                            <p
                                                                style={{
                                                                    fontSize: '0.96rem',
                                                                    fontWeight: 700,
                                                                    color: '#0a0e27',
                                                                    margin: 0,
                                                                }}
                                                            >
                                                                {cat.name}
                                                            </p>
                                                            {cat.description && (
                                                                <p
                                                                    style={{
                                                                        fontSize: '0.85rem',
                                                                        color: '#9CA3AF',
                                                                        margin: 0,
                                                                        marginTop: '0.3rem',
                                                                        fontWeight: 500,
                                                                        maxWidth: '300px',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                >
                                                                    {cat.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1.25rem' }}>
                                                        {cat.icon ? (
                                                            <span
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    padding: '0.5rem 0.85rem',
                                                                    background: '#F3F4F6',
                                                                    borderRadius: '8px',
                                                                    fontSize: '0.88rem',
                                                                    fontWeight: 600,
                                                                    color: '#4B5563',
                                                                    border: '1.5px solid #E5E7EB',
                                                                }}
                                                            >
                                                                {cat.icon}
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.85rem', color: '#9CA3AF', fontWeight: 500 }}>--</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1.25rem', textAlign: 'center' }}>
                                                        <span
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.4rem',
                                                                paddingLeft: '0.75rem',
                                                                paddingRight: '0.75rem',
                                                                paddingTop: '0.45rem',
                                                                paddingBottom: '0.45rem',
                                                                borderRadius: '8px',
                                                                fontSize: '0.88rem',
                                                                fontWeight: 700,
                                                                backgroundColor: '#E7F1FF',
                                                                color: THEME.primary,
                                                                border: '1.5px solid #cfe2ff',
                                                            }}
                                                        >
                                                            <Building2 size={14} />
                                                            {cat.organizations_count}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1.25rem', textAlign: 'center' }}>
                                                        <span
                                                            style={{
                                                                fontSize: '0.92rem',
                                                                fontWeight: 700,
                                                                color: '#4B5563',
                                                            }}
                                                        >
                                                            {cat.display_order}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1.25rem', textAlign: 'center' }}>
                                                        <span
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.4rem',
                                                                paddingLeft: '0.75rem',
                                                                paddingRight: '0.75rem',
                                                                paddingTop: '0.45rem',
                                                                paddingBottom: '0.45rem',
                                                                borderRadius: '8px',
                                                                fontSize: '0.82rem',
                                                                fontWeight: 700,
                                                                backgroundColor: cat.is_active ? '#e8f5e9' : '#f3f4f6',
                                                                color: cat.is_active ? THEME.success : THEME.secondary,
                                                                border: `1.5px solid ${cat.is_active ? '#c3e6cb' : '#e5e7eb'}`,
                                                            }}
                                                        >
                                                            {cat.is_active ? (
                                                                <CheckCircle size={14} />
                                                            ) : (
                                                                <AlertCircle size={14} />
                                                            )}
                                                            {cat.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1.25rem', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                                                            {/* Edit Button */}
                                                            <button
                                                                onClick={() => startEditing(cat)}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    padding: '0.55rem',
                                                                    background: '#E7F1FF',
                                                                    color: THEME.primary,
                                                                    border: '2px solid #cfe2ff',
                                                                    borderRadius: '10px',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = THEME.primary;
                                                                    e.currentTarget.style.color = '#FFFFFF';
                                                                    e.currentTarget.style.borderColor = THEME.primary;
                                                                    e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.primary}30`;
                                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = '#E7F1FF';
                                                                    e.currentTarget.style.color = THEME.primary;
                                                                    e.currentTarget.style.borderColor = '#cfe2ff';
                                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                }}
                                                                title="Edit category"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>

                                                            {/* Delete Button */}
                                                            {deleteConfirmId === cat.id ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                    <button
                                                                        onClick={() => handleDelete(cat.id)}
                                                                        disabled={isSubmitting}
                                                                        style={{
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            padding: '0.45rem 0.75rem',
                                                                            background: `linear-gradient(135deg, ${THEME.danger} 0%, #b02a37 100%)`,
                                                                            color: '#FFFFFF',
                                                                            border: 'none',
                                                                            borderRadius: '8px',
                                                                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                                            transition: 'all 0.3s ease',
                                                                            fontSize: '0.82rem',
                                                                            fontWeight: 700,
                                                                            opacity: isSubmitting ? 0.7 : 1,
                                                                            boxShadow: `0 2px 8px ${THEME.danger}30`,
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (!isSubmitting) {
                                                                                e.currentTarget.style.boxShadow = `0 6px 16px ${THEME.danger}40`;
                                                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                                            }
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            if (!isSubmitting) {
                                                                                e.currentTarget.style.boxShadow = `0 2px 8px ${THEME.danger}30`;
                                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                                            }
                                                                        }}
                                                                    >
                                                                        {isSubmitting ? (
                                                                            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                                                        ) : (
                                                                            'Confirm'
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeleteConfirmId(null)}
                                                                        style={{
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            padding: '0.45rem 0.75rem',
                                                                            background: '#FFFFFF',
                                                                            color: THEME.secondary,
                                                                            border: '1.5px solid #E5E7EB',
                                                                            borderRadius: '8px',
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.3s ease',
                                                                            fontSize: '0.82rem',
                                                                            fontWeight: 700,
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.background = '#F3F4F6';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.background = '#FFFFFF';
                                                                        }}
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
                                                                    style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        padding: '0.55rem',
                                                                        background: cat.organizations_count > 0 ? '#F9FAFB' : '#ffebee',
                                                                        color: cat.organizations_count > 0 ? '#D1D5DB' : THEME.danger,
                                                                        border: `2px solid ${cat.organizations_count > 0 ? '#E5E7EB' : '#f5c6cb'}`,
                                                                        borderRadius: '10px',
                                                                        cursor: cat.organizations_count > 0 ? 'not-allowed' : 'pointer',
                                                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                                        opacity: cat.organizations_count > 0 ? 0.5 : 1,
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (cat.organizations_count === 0) {
                                                                            e.currentTarget.style.background = THEME.danger;
                                                                            e.currentTarget.style.color = '#FFFFFF';
                                                                            e.currentTarget.style.borderColor = THEME.danger;
                                                                            e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.danger}30`;
                                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                                        }
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        if (cat.organizations_count === 0) {
                                                                            e.currentTarget.style.background = '#ffebee';
                                                                            e.currentTarget.style.color = THEME.danger;
                                                                            e.currentTarget.style.borderColor = '#f5c6cb';
                                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                                        }
                                                                    }}
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
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: '#F3F4F6',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                }}
                            >
                                <FolderOpen size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No categories found
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0, marginBottom: '1.5rem' }}>
                                Create your first organization category to get started
                            </p>
                            <button
                                onClick={() => {
                                    setShowAddForm(true);
                                    setAddForm({ ...emptyForm });
                                }}
                                style={{
                                    paddingLeft: '1.5rem',
                                    paddingRight: '1.5rem',
                                    paddingTop: '0.75rem',
                                    paddingBottom: '0.75rem',
                                    background: `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontSize: '0.96rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: `0 4px 12px ${THEME.primary}25`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = `0 12px 28px ${THEME.primary}40`;
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}25`;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
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
