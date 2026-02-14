import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Save,
    Loader2,
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

    return (
        <AdminLayout>
            <div>
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="ap-flash ap-flash-success">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="ap-flash ap-flash-error">{flash.error}</div>
                )}

                {/* Page Header */}
                <div className="ap-page-header">
                    <div className="ap-flex ap-items-center ap-gap-md">
                        <button onClick={handleCancel} className="ap-back-btn">
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 className="ap-page-title">Create Organization</h1>
                            <p className="ap-page-subtitle">Add a new organization to the platform</p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit}>
                    <div className="ap-card-lg">
                        {/* Basic Information Section */}
                        <div className="ap-section">
                            <h3 className="ap-section-title">Basic Information</h3>
                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Organization Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter organization name"
                                        required
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Short Name</label>
                                    <input
                                        type="text"
                                        name="short_name"
                                        value={formData.short_name}
                                        onChange={handleChange}
                                        placeholder="e.g., MIT, WHO"
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Category</label>
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        className="ap-form-select"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Founded Year</label>
                                    <input
                                        type="number"
                                        name="founded_year"
                                        value={formData.founded_year}
                                        onChange={handleChange}
                                        placeholder="e.g., 2005"
                                        min="1800"
                                        max={new Date().getFullYear()}
                                        className="ap-form-input"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="ap-divider" />

                        {/* Description, Vision & Mission Section */}
                        <div className="ap-section">
                            <h3 className="ap-section-title">Description, Vision & Mission</h3>
                            <div className="ap-flex-col ap-gap-md">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe the organization..."
                                        className="ap-form-textarea"
                                    />
                                </div>
                                <div className="ap-form-row">
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Vision</label>
                                        <textarea
                                            name="vision"
                                            value={formData.vision}
                                            onChange={handleChange}
                                            placeholder="Organization's vision statement..."
                                            className="ap-form-textarea"
                                        />
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-form-label">Mission</label>
                                        <textarea
                                            name="mission"
                                            value={formData.mission}
                                            onChange={handleChange}
                                            placeholder="Organization's mission statement..."
                                            className="ap-form-textarea"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ap-divider" />

                        {/* Contact & Location Section */}
                        <div className="ap-section">
                            <h3 className="ap-section-title">Contact & Location</h3>
                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="org@example.com"
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 000-0000"
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Website</label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Street address"
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="State / Province"
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="Country"
                                        className="ap-form-input"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="ap-divider" />

                        {/* Leadership Section */}
                        <div className="ap-section">
                            <h3 className="ap-section-title">Leadership</h3>
                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Leader Name</label>
                                    <input
                                        type="text"
                                        name="leader_name"
                                        value={formData.leader_name}
                                        onChange={handleChange}
                                        placeholder="Full name of the leader"
                                        className="ap-form-input"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-form-label">Leader Title</label>
                                    <input
                                        type="text"
                                        name="leader_title"
                                        value={formData.leader_title}
                                        onChange={handleChange}
                                        placeholder="e.g., CEO, President, Director"
                                        className="ap-form-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="ap-flex ap-items-center ap-gap-sm" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" onClick={handleCancel} className="ap-btn ap-btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="ap-btn ap-btn-primary">
                            {isSubmitting ? (
                                <Loader2 size={18} className="ap-spin" />
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
