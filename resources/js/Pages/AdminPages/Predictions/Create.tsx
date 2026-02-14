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

                <div className="ap-page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button className="ap-btn ap-btn-ghost" onClick={() => router.visit(route('admin.predictions.index'))}>
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="ap-page-title">Create Prediction Season</h1>
                            <p className="ap-page-subtitle">Set up a new prediction league season for a football organization</p>
                        </div>
                    </div>
                </div>

                <div className="ap-card" style={{ maxWidth: '600px' }}>
                    <div className="ap-card-header">
                        <Trophy size={18} />
                        <h3>Season Details</h3>
                    </div>
                    <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="ap-form-group">
                            <label className="ap-label">Organization</label>
                            <select
                                className="ap-input"
                                value={form.organization_id}
                                onChange={(e) => setForm({ ...form, organization_id: e.target.value })}
                                required
                            >
                                <option value="">Select a football organization...</option>
                                {organizations.map((org) => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                            {errors.organization_id && <span className="ap-error">{errors.organization_id}</span>}
                        </div>

                        <div className="ap-form-group">
                            <label className="ap-label">Season Name</label>
                            <input
                                type="text"
                                className="ap-input"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. 2025/26 Premier League Season"
                                required
                            />
                            {errors.name && <span className="ap-error">{errors.name}</span>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="ap-form-group">
                                <label className="ap-label">Start Date</label>
                                <input
                                    type="date"
                                    className="ap-input"
                                    value={form.start_date}
                                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                    required
                                />
                                {errors.start_date && <span className="ap-error">{errors.start_date}</span>}
                            </div>
                            <div className="ap-form-group">
                                <label className="ap-label">End Date</label>
                                <input
                                    type="date"
                                    className="ap-input"
                                    value={form.end_date}
                                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                    required
                                />
                                {errors.end_date && <span className="ap-error">{errors.end_date}</span>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button type="button" className="ap-btn ap-btn-ghost" onClick={() => router.visit(route('admin.predictions.index'))}>
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
