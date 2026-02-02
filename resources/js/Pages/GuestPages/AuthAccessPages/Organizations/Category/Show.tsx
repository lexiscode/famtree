import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { ArrowLeft, MapPin, Search, Building2, GraduationCap, School, Trophy, Church } from 'lucide-react';
import '../Organizations.css';

const categoryIcons: Record<string, React.ReactNode> = {
    'higher-institutions': <GraduationCap />,
    'high-schools': <School />,
    'football-fans': <Trophy />,
    'religious-organizations': <Church />,
    'default': <Building2 />,
};

interface Category {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    description: string | null;
}

interface Organization {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    short_name: string | null;
    description: string | null;
    logo_url: string | null;
    cover_image_url: string | null;
    city: string | null;
    state: string | null;
}

interface Props {
    category: Category;
    organizations: Organization[];
}

export default function CategoryShow({ category, organizations }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrganizations = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (org.short_name && org.short_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOrganizationClick = (slug: string) => {
        router.visit(`/organizations/${slug}`);
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
                        onClick={() => router.visit('/organizations')}
                    >
                        <ArrowLeft size={18} />
                        Back to Categories
                    </button>

                    {/* Breadcrumb */}
                    <div className="org-breadcrumb">
                        <a href="/organizations">Organizations</a>
                        <span className="separator">/</span>
                        <span>{category.name}</span>
                    </div>

                    {/* Header */}
                    <div className="org-header">
                        <div className="org-header-icon">
                            {categoryIcons[category.slug] || categoryIcons['default']}
                        </div>
                        <h1>{category.name}</h1>
                        {category.description && <p>{category.description}</p>}
                    </div>

                    {/* Search */}
                    <div className="org-search">
                        <div className="search-input-wrapper">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search organizations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Organizations Grid */}
                    {filteredOrganizations.length > 0 ? (
                        <div className="organizations-grid">
                            {filteredOrganizations.map((org) => (
                                <div
                                    key={org.id}
                                    className="organization-card"
                                    onClick={() => handleOrganizationClick(org.slug)}
                                >
                                    <div className="organization-card-image">
                                        {org.cover_image_url ? (
                                            <img src={org.cover_image_url} alt={org.name} />
                                        ) : (
                                            <Building2 size={48} style={{ color: '#475569' }} />
                                        )}
                                        {org.logo_url && (
                                            <div className="organization-logo">
                                                <img src={org.logo_url} alt={`${org.name} logo`} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="organization-card-content">
                                        <h3>{org.name}</h3>
                                        {org.short_name && (
                                            <div className="organization-short-name">{org.short_name}</div>
                                        )}
                                        {(org.city || org.state) && (
                                            <div className="organization-location">
                                                <MapPin size={14} />
                                                {[org.city, org.state].filter(Boolean).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Building2 size={64} />
                            <h3>No organizations found</h3>
                            <p>
                                {searchTerm
                                    ? 'Try adjusting your search terms.'
                                    : 'No organizations have been added to this category yet.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
