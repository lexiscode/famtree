import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { ArrowLeft, ChevronRight, BookOpen } from 'lucide-react';
import '../Organizations.css';

interface Organization {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    short_name: string | null;
}

interface Faculty {
    id: number;
    uuid: string;
    name: string;
    slug: string;
}

interface Department {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    description: string | null;
    class_sets_count: number;
}

interface Props {
    faculty: Faculty;
    organization: Organization;
    departments: Department[];
}

export default function DepartmentsIndex({ faculty, organization, departments }: Props) {
    const handleDepartmentClick = (slug: string) => {
        router.visit(`/organizations/department/${slug}/class-sets`);
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
                        onClick={() => router.visit(`/organizations/${organization.slug}/faculties`)}
                    >
                        <ArrowLeft size={18} />
                        Back to Faculties
                    </button>

                    {/* Breadcrumb */}
                    <div className="org-breadcrumb">
                        <a href="/organizations">Organizations</a>
                        <span className="separator">/</span>
                        <a href={`/organizations/${organization.slug}`}>
                            {organization.short_name || organization.name}
                        </a>
                        <span className="separator">/</span>
                        <a href={`/organizations/${organization.slug}/faculties`}>Faculties</a>
                        <span className="separator">/</span>
                        <span>{faculty.name}</span>
                    </div>

                    {/* Header */}
                    <div className="org-header">
                        <div className="org-header-icon">
                            <BookOpen />
                        </div>
                        <h1>Select Your Department</h1>
                        <p>Choose your department in {faculty.name} to find your class set.</p>
                    </div>

                    {/* Departments List */}
                    {departments.length > 0 ? (
                        <div className="list-grid">
                            {departments.map((department) => (
                                <div
                                    key={department.id}
                                    className="list-item"
                                    onClick={() => handleDepartmentClick(department.slug)}
                                >
                                    <div className="list-item-info">
                                        <h4>{department.name}</h4>
                                        {department.description && (
                                            <p>{department.description}</p>
                                        )}
                                    </div>
                                    <span className="list-item-count">
                                        {department.class_sets_count} {department.class_sets_count === 1 ? 'class set' : 'class sets'}
                                    </span>
                                    <ChevronRight size={20} className="list-item-arrow" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <BookOpen size={64} />
                            <h3>No departments available</h3>
                            <p>Departments for this faculty have not been added yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
