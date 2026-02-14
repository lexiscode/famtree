import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Trophy } from 'lucide-react';

interface Organization {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
}

interface Props {
    organizations: Organization[];
}

export default function Create({ organizations }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const errors = (props as any).errors || {};

    const [form, setForm] = useState({
        organization_id: '',
        name: '',
        start_date: '',
        end_date: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(route('admin.predictions.storeSeason'), form, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <AdminLayout>
            <div>
                {flash?.error && <div className="ap-flash ap-flash-error">{flash.error}</div>}

                <button className="ap-back-btn ap-mb-md" onClick={() => router.visit(route('admin.predictions.index'))}>
                    <ArrowLeft size={16} /> Back to Predictions
                </button>

                <div className="ap-page-header">
                    <h1 className="ap-page-title">Create Prediction Season</h1>
                    <p className="ap-page-subtitle">Set up a new prediction league season for a football organization</p>
                </div>

                <div className="ap-card ap-card-lg" style={{ maxWidth: '600px' }}>
                    <div className="ap-card-header">
                        <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                            <Trophy size={18} /> Season Details
                        </h3>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="ap-form-group">
                            <label className="ap-form-label">Organization</label>
                            <select
                                className="ap-form-select"
                                value={form.organization_id}
                                onChange={(e) => setForm({ ...form, organization_id: e.target.value })}
                                required
                            >
                                <option value="">Select a football organization...</option>
                                {organizations.map((org) => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                            {errors.organization_id && <p className="ap-form-error">{errors.organization_id}</p>}
                        </div>

                        <div className="ap-form-group">
                            <label className="ap-form-label">Season Name</label>
                            <input
                                type="text"
                                className="ap-form-input"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. 2025/26 Premier League Season"
                                required
                            />
                            {errors.name && <p className="ap-form-error">{errors.name}</p>}
                        </div>

                        <div className="ap-form-row">
                            <div className="ap-form-group">
                                <label className="ap-form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="ap-form-input"
                                    value={form.start_date}
                                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                    required
                                />
                                {errors.start_date && <p className="ap-form-error">{errors.start_date}</p>}
                            </div>
                            <div className="ap-form-group">
                                <label className="ap-form-label">End Date</label>
                                <input
                                    type="date"
                                    className="ap-form-input"
                                    value={form.end_date}
                                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                    required
                                />
                                {errors.end_date && <p className="ap-form-error">{errors.end_date}</p>}
                            </div>
                        </div>

                        <div className="ap-flex ap-justify-end ap-gap-sm ap-mt-lg">
                            <button type="button" className="ap-btn ap-btn-secondary" onClick={() => router.visit(route('admin.predictions.index'))}>
                                Cancel
                            </button>
                            <button type="submit" className="ap-btn ap-btn-primary" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Season'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
