import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Building2,
    Save,
    Loader2,
    Type,
    Hash,
    FolderOpen,
    FileText,
    Eye,
    Target,
    MapPin,
    Globe,
    Mail,
    Phone,
    Calendar,
    User,
    Briefcase,
} from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Props {
    categories: Category[];
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

export default function Create({ categories }: Props) {
    const { flash } = usePage<SharedProps>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        short_name: '',
        category_id: '',
        description: '',
        vision: '',
        mission: '',
        address: '',
        city: '',
        state: '',
        country: '',
        website: '',
        email: '',
        phone: '',
        founded_year: '',
        leader_name: '',
        leader_title: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post(route('admin.organizations.store'), formData, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleCancel = () => {
        router.get(route('admin.organizations.index'));
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.85rem 1.1rem',
        border: '2px solid #E5E7EB',
        borderRadius: '12px',
        fontSize: '0.96rem',
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
        fontSize: '0.85rem',
        fontWeight: 700,
        color: '#0a0e27',
        marginBottom: '0.6rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    };

    const textareaStyle: React.CSSProperties = {
        ...inputStyle,
        minHeight: '120px',
        resize: 'vertical' as const,
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = THEME.primary;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${THEME.primary}15`;
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <button
                        onClick={handleCancel}
                        style={{
                            background: '#E7F5FF',
                            border: '2px solid #cfe2ff',
                            padding: '0.65rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: THEME.primary,
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = THEME.primary;
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.borderColor = THEME.primary;
                            e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.primary}30`;
                            e.currentTarget.style.transform = 'translateX(-3px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#E7F5FF';
                            e.currentTarget.style.color = THEME.primary;
                            e.currentTarget.style.borderColor = '#cfe2ff';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>
                            Create Organization
                        </h1>
                        <p style={{ fontSize: '0.98rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>
                            Add a new organization to the platform
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit}>
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '20px',
                            border: '2px solid #E5E7EB',
                            padding: '2.5rem',
                            marginBottom: '2rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        {/* Basic Information Section */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3
                                style={{
                                    fontSize: '1.15rem',
                                    fontWeight: 800,
                                    color: '#0a0e27',
                                    margin: 0,
                                    marginBottom: '1.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.85rem',
                                    letterSpacing: '-0.3px',
                                }}
                            >
                                <div
                                    style={{
                                        padding: '0.6rem',
                                        background: '#E7F1FF',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Building2 size={22} color={THEME.primary} strokeWidth={2.5} />
                                </div>
                                Basic Information
                            </h3>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: '1.5rem',
                                }}
                            >
                                {/* Name */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Type size={14} color={THEME.primary} />
                                            Organization Name <span style={{ color: THEME.danger }}>*</span>
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter organization name"
                                        required
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* Short Name */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Hash size={14} color={THEME.primary} />
                                            Short Name
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="short_name"
                                        value={formData.short_name}
                                        onChange={handleChange}
                                        placeholder="e.g., MIT, WHO"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <FolderOpen size={14} color={THEME.primary} />
                                            Category
                                        </span>
                                    </label>
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        style={{ ...inputStyle, cursor: 'pointer' }}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Founded Year */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Calendar size={14} color={THEME.primary} />
                                            Founded Year
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        name="founded_year"
                                        value={formData.founded_year}
                                        onChange={handleChange}
                                        placeholder="e.g., 2005"
                                        min="1800"
                                        max={new Date().getFullYear()}
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description, Vision & Mission Section */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3
                                style={{
                                    fontSize: '1.15rem',
                                    fontWeight: 800,
                                    color: '#0a0e27',
                                    margin: 0,
                                    marginBottom: '1.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.85rem',
                                    letterSpacing: '-0.3px',
                                }}
                            >
                                <div
                                    style={{
                                        padding: '0.6rem',
                                        background: '#e8f5e9',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <FileText size={22} color={THEME.success} strokeWidth={2.5} />
                                </div>
                                Description, Vision & Mission
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Description */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <FileText size={14} color={THEME.primary} />
                                            Description
                                        </span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe the organization..."
                                        style={textareaStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* Vision & Mission side by side */}
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                        gap: '1.5rem',
                                    }}
                                >
                                    <div>
                                        <label style={labelStyle}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Eye size={14} color={THEME.primary} />
                                                Vision
                                            </span>
                                        </label>
                                        <textarea
                                            name="vision"
                                            value={formData.vision}
                                            onChange={handleChange}
                                            placeholder="Organization's vision statement..."
                                            style={textareaStyle}
                                            onFocus={handleInputFocus}
                                            onBlur={handleInputBlur}
                                        />
                                    </div>

                                    <div>
                                        <label style={labelStyle}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Target size={14} color={THEME.primary} />
                                                Mission
                                            </span>
                                        </label>
                                        <textarea
                                            name="mission"
                                            value={formData.mission}
                                            onChange={handleChange}
                                            placeholder="Organization's mission statement..."
                                            style={textareaStyle}
                                            onFocus={handleInputFocus}
                                            onBlur={handleInputBlur}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3
                                style={{
                                    fontSize: '1.15rem',
                                    fontWeight: 800,
                                    color: '#0a0e27',
                                    margin: 0,
                                    marginBottom: '1.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.85rem',
                                    letterSpacing: '-0.3px',
                                }}
                            >
                                <div
                                    style={{
                                        padding: '0.6rem',
                                        background: '#e0f7fa',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <MapPin size={22} color={THEME.info} strokeWidth={2.5} />
                                </div>
                                Contact & Location
                            </h3>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: '1.5rem',
                                }}
                            >
                                {/* Email */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Mail size={14} color={THEME.primary} />
                                            Email
                                        </span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="org@example.com"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Phone size={14} color={THEME.primary} />
                                            Phone
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 000-0000"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* Website */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Globe size={14} color={THEME.primary} />
                                            Website
                                        </span>
                                    </label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <MapPin size={14} color={THEME.primary} />
                                            Address
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Street address"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <MapPin size={14} color={THEME.primary} />
                                            City
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* State */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <MapPin size={14} color={THEME.primary} />
                                            State
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="State / Province"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* Country */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Globe size={14} color={THEME.primary} />
                                            Country
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="Country"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Leadership Section */}
                        <div style={{ marginBottom: '0' }}>
                            <h3
                                style={{
                                    fontSize: '1.15rem',
                                    fontWeight: 800,
                                    color: '#0a0e27',
                                    margin: 0,
                                    marginBottom: '1.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.85rem',
                                    letterSpacing: '-0.3px',
                                }}
                            >
                                <div
                                    style={{
                                        padding: '0.6rem',
                                        background: '#fff3e0',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <User size={22} color={THEME.warning} strokeWidth={2.5} />
                                </div>
                                Leadership
                            </h3>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: '1.5rem',
                                }}
                            >
                                {/* Leader Name */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <User size={14} color={THEME.primary} />
                                            Leader Name
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="leader_name"
                                        value={formData.leader_name}
                                        onChange={handleChange}
                                        placeholder="Full name of the leader"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>

                                {/* Leader Title */}
                                <div>
                                    <label style={labelStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Briefcase size={14} color={THEME.primary} />
                                            Leader Title
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="leader_title"
                                        value={formData.leader_title}
                                        onChange={handleChange}
                                        placeholder="e.g., CEO, President, Director"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '1rem',
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={{
                                paddingLeft: '1.75rem',
                                paddingRight: '1.75rem',
                                paddingTop: '0.85rem',
                                paddingBottom: '0.85rem',
                                background: '#FFFFFF',
                                color: THEME.secondary,
                                border: '2px solid #E5E7EB',
                                borderRadius: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: '0.96rem',
                                letterSpacing: '0.3px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#F3F4F6';
                                e.currentTarget.style.borderColor = '#D1D5DB';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#FFFFFF';
                                e.currentTarget.style.borderColor = '#E5E7EB';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                paddingLeft: '2rem',
                                paddingRight: '2rem',
                                paddingTop: '0.85rem',
                                paddingBottom: '0.85rem',
                                background: isSubmitting
                                    ? THEME.secondary
                                    : `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 700,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: `0 4px 12px ${THEME.primary}25`,
                                fontSize: '0.96rem',
                                letterSpacing: '0.3px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                opacity: isSubmitting ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.boxShadow = `0 12px 28px ${THEME.primary}40`;
                                    e.currentTarget.style.transform = 'translateY(-3px)';
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
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                                <Save size={18} />
                            )}
                            {isSubmitting ? 'Creating...' : 'Create Organization'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
