import OrgLayout from '@/Layouts/OrgLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Save, Building2 } from 'lucide-react';

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

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
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
        background: '#1a1a24',
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

    return (
        <OrgLayout>
            <div>
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
                    background: '#111118',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{
                        height: '160px',
                        background: organization.cover_image_url
                            ? `url(${organization.cover_image_url}) center/cover`
                            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        position: 'relative',
                    }}>
                        <div style={{
                            position: 'absolute',
                            bottom: '-30px',
                            left: '2rem',
                            width: '72px',
                            height: '72px',
                            borderRadius: '16px',
                            border: '3px solid #111118',
                            overflow: 'hidden',
                            background: '#111118',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
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
                    </div>
                    <div style={{ padding: '2.5rem 2rem 1rem' }}>
                        <p style={{ color: '#666', fontSize: '0.8rem', margin: 0 }}>
                            Logo and cover image uploads are managed separately.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Basic Info */}
                    <div style={{
                        background: '#111118',
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
                        background: '#111118',
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
                        background: '#111118',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '2rem',
                        marginBottom: '1.5rem',
                    }}>
                        <h3 style={sectionTitleStyle}>Leadership</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={fieldGroupStyle}>
                                <label style={labelStyle}>Leader Name</label>
                                <input
                                    type="text"
                                    value={form.leader_name}
                                    onChange={(e) => handleChange('leader_name', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={fieldGroupStyle}>
                                <label style={labelStyle}>Leader Title</label>
                                <input
                                    type="text"
                                    value={form.leader_title}
                                    onChange={(e) => handleChange('leader_title', e.target.value)}
                                    style={inputStyle}
                                />
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
