import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface Season {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
}

interface Props {
    season: Season;
}

export default function Edit({ season }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const errors = (props as any).errors || {};

    const [form, setForm] = useState({
        name: season.name,
        start_date: season.start_date,
        end_date: season.end_date,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.put(route('admin.glam.updateSeason', season.id), form, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <AdminLayout>
            <div>

<button className="ap-back-btn ap-mb-md" onClick={() => router.visit(route('admin.glam.index'))}>
                    <ArrowLeft size={16} /> Back to Glam Squad
                </button>

                <div className="ap-page-header">
                    <h1 className="ap-page-title">Edit Glam Season</h1>
                    <p className="ap-page-subtitle">Update season details</p>
                </div>

                <div className="ap-card ap-card-lg" style={{ maxWidth: '600px' }}>
                    <div className="ap-card-header">
                        <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                            <Sparkles size={18} /> Season Details
                        </h3>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="ap-form-group">
                            <label className="ap-form-label">Season Name</label>
                            <input
                                type="text"
                                className="ap-form-input"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                            <button type="button" className="ap-btn ap-btn-secondary" onClick={() => router.visit(route('admin.glam.show', season.id))}>
                                Cancel
                            </button>
                            <button type="submit" className="ap-btn ap-btn-primary" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
