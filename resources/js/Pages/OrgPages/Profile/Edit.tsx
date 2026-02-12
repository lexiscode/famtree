import OrgLayout from '@/Layouts/OrgLayout';
import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Save, Building2, Pencil, User } from 'lucide-react';

interface Organization {
    id: number;
    name: string;
    short_name: string | null;
    description: string | null;
    vision: string | null;
    mission: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    leader_name: string | null;
    leader_title: string | null;
    leader_qualifications: string | null;
    logo_url: string | null;
    cover_image_url: string | null;
    leader_image_url: string | null;
}

interface Props {
    organization: Organization;
}

export default function ProfileEdit({ organization }: Props) {
    const [form, setForm] = useState({
        name: organization.name || '',
        short_name: organization.short_name || '',
        description: organization.description || '',
        vision: organization.vision || '',
        mission: organization.mission || '',
        address: organization.address || '',
        city: organization.city || '',
        state: organization.state || '',
        country: organization.country || '',
        website: organization.website || '',
        email: organization.email || '',
        phone: organization.phone || '',
        leader_name: organization.leader_name || '',
        leader_title: organization.leader_title || '',
        leader_qualifications: organization.leader_qualifications || '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploadingType, setUploadingType] = useState<string | null>(null);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const leaderInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (type: 'logo' | 'cover_image' | 'leader_image', file: File) => {
        setUploadingType(type);
        const formData = new FormData();
        formData.append('type', type);
        formData.append('image', file);

        router.post(route('org.profile.uploadImage'), formData, {
            forceFormData: true,
            onSuccess: () => setUploadingType(null),
            onError: () => setUploadingType(null),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.put(route('org.profile.update'), form, {
            onSuccess: () => setSubmitting(false),
            onError: () => setSubmitting(false),
        });
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: '#1e1e35',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '8px',
        padding: '0.875rem',
        color: '#ffffff',
        fontSize: '0.95rem',
        outline: 'none',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#e0e0e0',
        marginBottom: '0.5rem',
    };

    const fieldGroupStyle: React.CSSProperties = {
        marginBottom: '1.25rem',
    };

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '1rem',
        fontWeight: 600,
        color: '#8B5CF6',
        marginBottom: '1.25rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
    };

    const penButtonStyle: React.CSSProperties = {
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(139, 92, 246, 0.9)',
        border: '2px solid #141425',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        zIndex: 5,
    };

    return (
        <OrgLayout>
            <div>
                {/* Hidden file inputs */}
                <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('logo', file);
                        e.target.value = '';
                    }}
                />
                <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('cover_image', file);
                        e.target.value = '';
                    }}
                />
                <input
                    ref={leaderInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('leader_image', file);
                        e.target.value = '';
                    }}
                />

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                            Edit Profile
                        </h1>
                        <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                            Update your organization's information
                        </p>
                    </div>
                </div>

                {/* Cover & Logo Preview */}
                <div style={{
                    background: '#141425',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '1.5rem',
                }}>
                    {/* Cover Image */}
                    <div style={{
                        height: '180px',
                        background: organization.cover_image_url
                            ? `url(${organization.cover_image_url}) center/cover`
                            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        position: 'relative',
                    }}>
                        {/* Cover pen button */}
                        <div
                            style={{
                                ...penButtonStyle,
                                bottom: '12px',
                                right: '12px',
                                opacity: uploadingType === 'cover_image' ? 0.5 : 1,
                            }}
                            onClick={() => !uploadingType && coverInputRef.current?.click()}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.9)'; }}
                            title="Change cover image"
                        >
                            <Pencil size={14} color="#fff" />
                        </div>

                        {/* Logo */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-36px',
                            left: '2rem',
                            width: '80px',
                            height: '80px',
                            borderRadius: '16px',
                            border: '3px solid #141425',
                            overflow: 'visible',
                            background: '#141425',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '13px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#1e1e35',
                            }}>
                                {organization.logo_url ? (
                                    <img
                                        src={organization.logo_url}
                                        alt={organization.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Building2 size={28} color="#8B5CF6" />
                                )}
                            </div>
                            {/* Logo pen button */}
                            <div
                                style={{
                                    ...penButtonStyle,
                                    bottom: '-4px',
                                    right: '-4px',
                                    width: '26px',
                                    height: '26px',
                                    opacity: uploadingType === 'logo' ? 0.5 : 1,
                                }}
                                onClick={() => !uploadingType && logoInputRef.current?.click()}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.9)'; }}
                                title="Change logo"
                            >
                                <Pencil size={11} color="#fff" />
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '2.75rem 2rem 1.25rem' }}>
                        <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
                            {organization.name}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Basic Info */}
                    <div style={{
                        background: '#141425',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '2rem',
                        marginBottom: '1.5rem',
                    }}>
                        <h3 style={sectionTitleStyle}>Basic Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={fieldGroupStyle}>
                                <label style={labelStyle}>Organization Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={fieldGroupStyle}>
                                <label style={labelStyle}>Short Name</label>
                                <input
                                    type="text"
                                    value={form.short_name}
                                    onChange={(e) => handleChange('short_name', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                        <div style={fieldGroupStyle}>
                            <label style={labelStyle}>Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={3}
                                style={{ ...inputStyle, resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={fieldGroupStyle}>
                                <label style={labelStyle}>Vision</label>
                                <textarea
                                    value={form.vision}
                                    onChange={(e) => handleChange('vision', e.target.value)}
                                    rows={3}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                />
                            </div>
                            <div style={fieldGroupStyle}>
                                <label style={labelStyle}>Mission</label>
                                <textarea
                                    value={form.mission}
                                    onChange={(e) => handleChange('mission', e.target.value)}
                                    rows={3}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact & Location */}
                    <div style={{
                        background: '#141425',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '2rem',
                        marginBottom: '1.5rem',
                    }}>
                        <h3 style={sectionTitleStyle}>Contact & Location</h3>
                        <div style={fieldGroupStyle}>
                            <label style={labelStyle}>Address</label>
                            <input
                                type="text"
                                value={form.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div style={fieldGroupStyle}>
                                <label style={labelStyle}>City</label>
                                <input
                                    type="text"
                                    value={form.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={fieldGroupStyle}>
                                <label style={labelStyle}>State</label>
                                <input
                                    type="text"
                                    value={form.state}
                                    onChange={(e) => handleChange('state', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={fieldGroupStyle}>
                                <label style={labelStyle}>Country</label>
                                <input
                                    type="text"
                                    value={form.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div style={fieldGroupStyle}>
                                <label style={labelStyle}>Website</label>
                                <input
                                    type="url"
                                    value={form.website}
                                    onChange={(e) => handleChange('website', e.target.value)}
                                    placeholder="https://..."
                                    style={inputStyle}
                                />
                            </div>
                            <div style={fieldGroupStyle}>
                                <label style={labelStyle}>Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={fieldGroupStyle}>
                                <label style={labelStyle}>Phone</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Leadership */}
                    <div style={{
                        background: '#141425',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '2rem',
                        marginBottom: '1.5rem',
                    }}>
                        <h3 style={sectionTitleStyle}>Leadership</h3>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                            {/* Leader Image */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{
                                    width: '90px',
                                    height: '90px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    background: '#1e1e35',
                                    border: '2px solid rgba(139, 92, 246, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {organization.leader_image_url ? (
                                        <img
                                            src={organization.leader_image_url}
                                            alt={organization.leader_name || 'Leader'}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <User size={32} color="#555" />
                                    )}
                                </div>
                                {/* Leader image pen button */}
                                <div
                                    style={{
                                        ...penButtonStyle,
                                        bottom: '0px',
                                        right: '0px',
                                        width: '26px',
                                        height: '26px',
                                        opacity: uploadingType === 'leader_image' ? 0.5 : 1,
                                    }}
                                    onClick={() => !uploadingType && leaderInputRef.current?.click()}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.9)'; }}
                                    title="Change leader image"
                                >
                                    <Pencil size={11} color="#fff" />
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 0.75rem' }}>
                                    {organization.leader_name ? `${organization.leader_name}` : 'Leader photo'}
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Leader Name</label>
                                        <input
                                            type="text"
                                            value={form.leader_name}
                                            onChange={(e) => handleChange('leader_name', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Leader Title</label>
                                        <input
                                            type="text"
                                            value={form.leader_title}
                                            onChange={(e) => handleChange('leader_title', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={fieldGroupStyle}>
                            <label style={labelStyle}>Leader Qualifications</label>
                            <textarea
                                value={form.leader_qualifications}
                                onChange={(e) => handleChange('leader_qualifications', e.target.value)}
                                rows={3}
                                style={{ ...inputStyle, resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 2rem',
                                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                opacity: submitting ? 0.6 : 1,
                                transition: 'opacity 0.2s ease',
                            }}
                        >
                            <Save size={16} />
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </OrgLayout>
    );
}
