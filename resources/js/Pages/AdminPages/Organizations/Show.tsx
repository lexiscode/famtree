import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Building2,
    MapPin,
    Globe,
    Mail,
    Phone,
    Calendar,
    Users,
    Heart,
    FileText,
    GraduationCap,
    Shield,
    Ban,
    RefreshCw,
    Key,
    Trash2,
    Eye,
    EyeOff,
} from 'lucide-react';

interface Faculty {
    id: number;
    name: string;
    is_active: boolean;
    departments: {
        id: number;
        name: string;
        is_active: boolean;
        class_sets_count: number;
    }[];
}

interface StaffMember {
    id: number;
    username: string;
    email: string;
    display_name: string;
    is_active: boolean;
    role_name: string;
    last_login_at: string | null;
    created_at: string;
}

interface OrgDetail {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    short_name: string;
    description: string;
    vision: string;
    mission: string;
    logo_url: string | null;
    cover_image_url: string | null;
    address: string;
    city: string;
    state: string;
    country: string;
    website: string;
    email: string;
    phone: string;
    founded_year: number;
    leader_name: string;
    leader_title: string;
    leader_qualifications: string;
    leader_image_url: string | null;
    is_active: boolean;
    category: { id: number; name: string; slug: string } | null;
    org_accounts_count: number;
    followers_count: number;
    org_posts_count: number;
    faculties_count: number;
    faculties: Faculty[];
    staff: StaffMember[];
    created_at: string;
    updated_at: string;
}

interface Props {
    organization: OrgDetail;
}

function OrgAvatar({ imageUrl, name, size = 'small' }: { imageUrl: string | null; name: string; size?: 'small' | 'large' }) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className={`ap-avatar ${size === 'large' ? 'ap-avatar-lg' : ''}`}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div className={`ap-avatar ap-avatar-indigo ${size === 'large' ? 'ap-avatar-lg' : ''}`}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function Show({ organization: org }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash || {};

    const [activeTab, setActiveTab] = useState<'overview' | 'structure' | 'staff'>('overview');
    const [expandedFaculty, setExpandedFaculty] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSuspend = () => {
        if (processing) return;
        setProcessing(true);
        router.post(route('admin.organizations.suspend', org.id), {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleUnsuspend = () => {
        if (processing) return;
        setProcessing(true);
        router.post(route('admin.organizations.unsuspend', org.id), {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleDelete = () => {
        if (processing) return;
        if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) return;
        setProcessing(true);
        router.delete(route('admin.organizations.destroy', org.id), {
            onFinish: () => setProcessing(false),
        });
    };

    const handleEdit = () => {
        router.get(route('admin.organizations.edit', org.id));
    };

    const handleDisableStaff = (staffId: number) => {
        if (processing) return;
        setProcessing(true);
        router.post(route('admin.organizations.disableStaff', staffId), {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleResetStaffPassword = (staffId: number) => {
        if (processing) return;
        setProcessing(true);
        router.post(route('admin.organizations.resetStaffPassword', staffId), {}, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AdminLayout>
            <div>
                {/* Flash Messages */}
                {flash.success && (
                    <div className="ap-flash ap-flash-success">{flash.success}</div>
                )}
                {flash.error && (
                    <div className="ap-flash ap-flash-error">{flash.error}</div>
                )}

                {/* Header Section */}
                <div className="ap-page-header-row">
                    <div className="ap-flex ap-items-center ap-gap-md">
                        <button
                            onClick={() => router.get(route('admin.organizations.index'))}
                            className="ap-back-btn"
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 className="ap-page-title">Organization Details</h1>
                            <p className="ap-page-subtitle">View and manage organization information</p>
                        </div>
                    </div>
                    <div className="ap-page-header-actions">
                        <button onClick={handleEdit} className="ap-btn ap-btn-primary ap-btn-sm">
                            <FileText size={16} />
                            Edit
                        </button>
                        {org.is_active ? (
                            <button
                                onClick={handleSuspend}
                                disabled={processing}
                                className="ap-btn ap-btn-warning ap-btn-sm"
                            >
                                <Ban size={16} />
                                Suspend
                            </button>
                        ) : (
                            <button
                                onClick={handleUnsuspend}
                                disabled={processing}
                                className="ap-btn ap-btn-success ap-btn-sm"
                            >
                                <RefreshCw size={16} />
                                Unsuspend
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={processing}
                            className="ap-btn ap-btn-danger ap-btn-sm"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Organization Header Card */}
                <div className="ap-card-lg">
                    <div className="ap-flex ap-items-center ap-gap-lg ap-flex-wrap">
                        <OrgAvatar imageUrl={org.logo_url} name={org.name} size="large" />
                        <div className="ap-flex-1">
                            <h2 className="ap-card-title">{org.name}</h2>
                            {org.short_name && (
                                <p className="ap-text-secondary">({org.short_name})</p>
                            )}
                            <div className="ap-flex ap-items-center ap-gap-sm ap-flex-wrap ap-mt-lg">
                                {org.category && (
                                    <span className="ap-badge ap-badge-info">
                                        <GraduationCap size={14} />
                                        {org.category.name}
                                    </span>
                                )}
                                <span className={org.is_active ? 'ap-badge ap-badge-success' : 'ap-badge ap-badge-danger'}>
                                    {org.is_active ? (
                                        <><Eye size={14} /> Active</>
                                    ) : (
                                        <><EyeOff size={14} /> Suspended</>
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="ap-detail-row">
                            <span className="ap-detail-label">Created</span>
                            <span className="ap-detail-value">{new Date(org.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Staff', value: org.org_accounts_count, icon: Users, color: 'indigo' },
                        { label: 'Followers', value: org.followers_count, icon: Heart, color: 'red' },
                        { label: 'Posts', value: org.org_posts_count, icon: FileText, color: 'blue' },
                        { label: 'Faculties', value: org.faculties_count, icon: GraduationCap, color: 'green' },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="ap-stat-card">
                                <div className="ap-stat-card-header">
                                    <span className="ap-stat-label">{stat.label}</span>
                                    <span className={`ap-stat-icon ${stat.color}`}>
                                        <Icon size={20} />
                                    </span>
                                </div>
                                <span className="ap-stat-value">{stat.value}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div className="ap-tabs">
                    {(['overview', 'structure', 'staff'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`ap-tab ${activeTab === tab ? 'active' : ''}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="ap-card-lg">
                        {/* Description */}
                        {org.description && (
                            <div className="ap-section">
                                <h3 className="ap-section-title">
                                    <Building2 size={18} />
                                    Description
                                </h3>
                                <div className="ap-detail-row">
                                    <span className="ap-detail-value ap-whitespace-pre">{org.description}</span>
                                </div>
                            </div>
                        )}

                        {/* Vision */}
                        {org.vision && (
                            <div className="ap-section">
                                <h3 className="ap-section-title">
                                    <Eye size={18} />
                                    Vision
                                </h3>
                                <div className="ap-detail-row">
                                    <span className="ap-detail-value ap-whitespace-pre">{org.vision}</span>
                                </div>
                            </div>
                        )}

                        {/* Mission */}
                        {org.mission && (
                            <div className="ap-section">
                                <h3 className="ap-section-title">
                                    <Shield size={18} />
                                    Mission
                                </h3>
                                <div className="ap-detail-row">
                                    <span className="ap-detail-value ap-whitespace-pre">{org.mission}</span>
                                </div>
                            </div>
                        )}

                        <div className="ap-divider" />

                        {/* Contact Information */}
                        <div className="ap-section">
                            <h3 className="ap-section-title">Contact Information</h3>
                            <div className="ap-grid-2">
                                <div className="ap-detail-row">
                                    <span className="ap-detail-label">
                                        <MapPin size={14} /> Address
                                    </span>
                                    <span className="ap-detail-value">
                                        {[org.address, org.city, org.state, org.country].filter(Boolean).join(', ') || 'Not provided'}
                                    </span>
                                </div>
                                <div className="ap-detail-row">
                                    <span className="ap-detail-label">
                                        <Mail size={14} /> Email
                                    </span>
                                    <span className="ap-detail-value">{org.email || 'Not provided'}</span>
                                </div>
                                <div className="ap-detail-row">
                                    <span className="ap-detail-label">
                                        <Phone size={14} /> Phone
                                    </span>
                                    <span className="ap-detail-value">{org.phone || 'Not provided'}</span>
                                </div>
                                <div className="ap-detail-row">
                                    <span className="ap-detail-label">
                                        <Globe size={14} /> Website
                                    </span>
                                    <span className="ap-detail-value">
                                        {org.website ? (
                                            <a
                                                href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {org.website}
                                            </a>
                                        ) : (
                                            'Not provided'
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Leader Information */}
                        {org.leader_name && (
                            <>
                                <div className="ap-divider" />
                                <div className="ap-section">
                                    <h3 className="ap-section-title">Leader Information</h3>
                                    <div className="ap-flex ap-items-center ap-gap-lg">
                                        <OrgAvatar imageUrl={org.leader_image_url} name={org.leader_name} size="large" />
                                        <div>
                                            <span className="ap-font-semibold">{org.leader_name}</span>
                                            {org.leader_title && (
                                                <p className="ap-text-secondary">{org.leader_title}</p>
                                            )}
                                            {org.leader_qualifications && (
                                                <p className="ap-text-sm ap-text-secondary">{org.leader_qualifications}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Founded Year */}
                        {org.founded_year > 0 && (
                            <>
                                <div className="ap-divider" />
                                <div className="ap-section">
                                    <div className="ap-detail-row">
                                        <span className="ap-detail-label">
                                            <Calendar size={14} /> Founded Year
                                        </span>
                                        <span className="ap-detail-value">{org.founded_year}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Structure Tab */}
                {activeTab === 'structure' && (
                    <div className="ap-card-lg">
                        <h3 className="ap-section-title">
                            <GraduationCap size={18} />
                            Faculties & Departments
                        </h3>

                        {org.faculties.length === 0 ? (
                            <div className="ap-empty">
                                <div className="ap-empty-icon">
                                    <GraduationCap size={40} />
                                </div>
                                <p className="ap-empty-title">No faculties found</p>
                                <p className="ap-empty-text">This organization has not created any faculties yet.</p>
                            </div>
                        ) : (
                            <div className="ap-flex-col ap-gap-md">
                                {org.faculties.map((faculty) => (
                                    <div key={faculty.id} className="ap-card">
                                        {/* Faculty Header (Accordion Toggle) */}
                                        <button
                                            onClick={() => setExpandedFaculty(expandedFaculty === faculty.id ? null : faculty.id)}
                                            className="ap-accordion-btn"
                                        >
                                            <div className="ap-flex ap-items-center ap-gap-md">
                                                <GraduationCap size={20} />
                                                <div className="ap-text-left">
                                                    <span className="ap-font-semibold">{faculty.name}</span>
                                                    <span className="ap-text-sm ap-text-secondary ap-d-block">
                                                        {faculty.departments.length} department{faculty.departments.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ap-flex ap-items-center ap-gap-sm">
                                                <span className={faculty.is_active ? 'ap-badge ap-badge-success' : 'ap-badge ap-badge-neutral'}>
                                                    {faculty.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                    style={{
                                                        transform: expandedFaculty === faculty.id ? 'rotate(90deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.3s ease',
                                                    }}
                                                >
                                                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </button>

                                        {/* Departments List (Expanded) */}
                                        {expandedFaculty === faculty.id && (
                                            <div className="ap-accordion-panel">
                                                {faculty.departments.length === 0 ? (
                                                    <p className="ap-text-secondary ap-text-center ap-p-lg">
                                                        No departments in this faculty.
                                                    </p>
                                                ) : (
                                                    <div className="ap-flex-col ap-gap-sm">
                                                        {faculty.departments.map((dept) => (
                                                            <div key={dept.id} className="ap-flex ap-items-center ap-justify-between ap-dept-item">
                                                                <div className="ap-flex ap-items-center ap-gap-sm">
                                                                    <span className="ap-font-semibold">{dept.name}</span>
                                                                </div>
                                                                <div className="ap-flex ap-items-center ap-gap-sm">
                                                                    <span className="ap-badge ap-badge-neutral">
                                                                        {dept.class_sets_count} class set{dept.class_sets_count !== 1 ? 's' : ''}
                                                                    </span>
                                                                    <span className={dept.is_active ? 'ap-badge ap-badge-success' : 'ap-badge ap-badge-neutral'}>
                                                                        {dept.is_active ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Staff Tab */}
                {activeTab === 'staff' && (
                    <div className="ap-card-lg">
                        <h3 className="ap-section-title">
                            <Users size={18} />
                            Staff Members
                        </h3>

                        {org.staff.length === 0 ? (
                            <div className="ap-empty">
                                <div className="ap-empty-icon">
                                    <Users size={40} />
                                </div>
                                <p className="ap-empty-title">No staff members</p>
                                <p className="ap-empty-text">This organization has no staff accounts yet.</p>
                            </div>
                        ) : (
                            <div className="ap-table-scroll">
                                <table className="ap-table">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th className="center">Status</th>
                                            <th>Last Login</th>
                                            <th className="center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {org.staff.map((member) => (
                                            <tr key={member.id}>
                                                <td>
                                                    <div className="ap-user-cell">
                                                        <div className="ap-avatar ap-avatar-indigo">
                                                            {member.display_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <span className="ap-user-cell-name">{member.display_name}</span>
                                                            <span className="ap-user-cell-sub">@{member.username}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="secondary">{member.email}</td>
                                                <td>
                                                    <span className="ap-badge ap-badge-primary">{member.role_name}</span>
                                                </td>
                                                <td className="center">
                                                    <span className={member.is_active ? 'ap-badge ap-badge-success' : 'ap-badge ap-badge-neutral'}>
                                                        {member.is_active ? 'Active' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td className="secondary">
                                                    {member.last_login_at
                                                        ? new Date(member.last_login_at).toLocaleDateString() + ' ' + new Date(member.last_login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : 'Never'
                                                    }
                                                </td>
                                                <td className="center">
                                                    <div className="ap-flex ap-items-center ap-gap-sm ap-justify-center">
                                                        <button
                                                            onClick={() => handleDisableStaff(member.id)}
                                                            disabled={processing}
                                                            title={member.is_active ? 'Disable staff' : 'Toggle staff status'}
                                                            className="ap-btn ap-btn-danger ap-btn-sm"
                                                        >
                                                            <Ban size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleResetStaffPassword(member.id)}
                                                            disabled={processing}
                                                            title="Reset password"
                                                            className="ap-btn ap-btn-primary ap-btn-sm"
                                                        >
                                                            <Key size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
