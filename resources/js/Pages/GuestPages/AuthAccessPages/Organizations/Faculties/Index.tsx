import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { ArrowLeft, ChevronRight, Building, Library } from 'lucide-react';
import '../Organizations.css';

interface Organization {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    short_name: string | null;
    logo_url: string | null;
}

interface Faculty {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    description: string | null;
    departments_count: number;
}

interface Props {
    organization: Organization;
    faculties: Faculty[];
}

export default function FacultiesIndex({ organization, faculties }: Props) {
    const handleFacultyClick = (slug: string) => {
        router.visit(`/organizations/faculty/${slug}/departments`);
    };

    return (
        <AuthAccessLayout>
            <div className="organizations-page">
                {/* Background Orbs */}
                <div className="organizations-background">
                    <div className="org-orb org-orb-1"></div>
                    <div className="org-orb org-orb-2"></div>
                    <div className="org-orb org-orb-3"></div>
                </div>

                <div className="organizations-container">
                    {/* Back Button */}
                    <button
                        className="org-back-button"
                        onClick={() => router.visit(`/organizations/${organization.slug}`)}
                    >
                        <ArrowLeft size={18} />
                        Back to {organization.short_name || organization.name}
                    </button>

                    {/* Breadcrumb */}
                    <div className="org-breadcrumb">
                        <a href="/organizations">Organizations</a>
                        <span className="separator">/</span>
                        <a href={`/organizations/${organization.slug}`}>
                            {organization.short_name || organization.name}
                        </a>
                        <span className="separator">/</span>
                        <span>Faculties</span>
                    </div>

                    {/* Header */}
                    <div className="org-header">
                        <div className="org-header-icon">
                            <Library />
                        </div>
                        <h1>Select Your Faculty</h1>
                        <p>Choose your faculty at {organization.short_name || organization.name} to find your department.</p>
                    </div>

                    {/* Faculties List */}
                    {faculties.length > 0 ? (
                        <div className="list-grid">
                            {faculties.map((faculty) => (
                                <div
                                    key={faculty.id}
                                    className="list-item"
                                    onClick={() => handleFacultyClick(faculty.slug)}
                                >
                                    <div className="list-item-info">
                                        <h4>{faculty.name}</h4>
                                        {faculty.description && (
                                            <p>{faculty.description}</p>
                                        )}
                                    </div>
                                    <span className="list-item-count">
                                        {faculty.departments_count} {faculty.departments_count === 1 ? 'department' : 'departments'}
                                    </span>
                                    <ChevronRight size={20} className="list-item-arrow" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Building size={64} />
                            <h3>No faculties available</h3>
                            <p>Faculties for this organization have not been added yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
