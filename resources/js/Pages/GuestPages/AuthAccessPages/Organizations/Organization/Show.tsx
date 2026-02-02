import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import {
    ArrowLeft, MapPin, Globe, Mail, Phone, Calendar, Target, Eye,
    Users, User, ChevronRight, Building2, Trophy, Award
} from 'lucide-react';
import '../Organizations.css';
import '../OrganizationProfile.css';

interface Organization {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    short_name: string | null;
    description: string | null;
    vision: string | null;
    mission: string | null;
    logo_url: string | null;
    cover_image_url: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    founded_year: number | null;
    leader_name: string | null;
    leader_title: string | null;
    leader_qualifications: string | null;
    leader_image_url: string | null;
    category: {
        id: number;
        name: string;
        slug: string;
    };
}

interface Gallery {
    id: number;
    image_url: string;
    caption: string | null;
}

interface BreadcrumbItem {
    label: string;
    url: string | null;
}

interface Props {
    organization: Organization;
    facultiesCount: number;
    galleries: Gallery[];
    breadcrumb: BreadcrumbItem[];
}

export default function OrganizationShow({ organization, facultiesCount, galleries, breadcrumb }: Props) {
    const isFootballClub = organization.category.slug === 'football-fans';
    const isReligiousOrg = organization.category.slug === 'religious-organizations';
    const usesChannels = isFootballClub || isReligiousOrg;

    const handleFindGroup = () => {
        if (usesChannels) {
            router.visit(`/organizations/${organization.slug}/channels`);
        } else {
            router.visit(`/organizations/${organization.slug}/faculties`);
        }
    };

    // Parse honours from mission field for football clubs
    const parseHonours = (honoursText: string) => {
        if (!honoursText.includes('|')) return null;

        const honours = honoursText.replace('HONOURS: ', '').split(' | ').map(honour => {
            const parts = honour.split(': ');
            return {
                title: parts[0],
                years: parts[1] || ''
            };
        });
        return honours;
    };

    const honours = isFootballClub && organization.mission ? parseHonours(organization.mission) : null;

    return (
        <AuthAccessLayout>
            <div className="org-profile-page">
                {/* Background Orbs */}
                <div className="organizations-background">
                    <div className="org-orb org-orb-1"></div>
                    <div className="org-orb org-orb-2"></div>
                </div>

                {/* Hero Section */}
                <div className="org-hero">
                    {organization.cover_image_url ? (
                        <img
                            src={organization.cover_image_url}
                            alt={organization.name}
                            className="org-hero-image"
                        />
                    ) : (
                        <div className="org-hero-image" style={{
                            background: 'linear-gradient(135deg, #1e293b, #334155)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Building2 size={100} style={{ color: '#475569' }} />
                        </div>
                    )}
                    <div className="org-hero-overlay"></div>
                    <div className="org-hero-content">
                        {organization.logo_url && (
                            <div className="org-logo-large">
                                <img src={organization.logo_url} alt={`${organization.name} logo`} />
                            </div>
                        )}
                        <div className="org-hero-info">
                            <h1>{organization.name}</h1>
                            {organization.short_name && (
                                <div className="short-name">{organization.short_name}</div>
                            )}
                            {(organization.city || organization.state) && (
                                <div className="location">
                                    <MapPin size={16} />
                                    {[organization.address, organization.city, organization.state, organization.country]
                                        .filter(Boolean)
                                        .join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="org-profile-content">
                    {/* Back Button */}
                    <button
                        className="org-back-button"
                        onClick={() => router.visit(`/organizations/category/${organization.category.slug}`)}
                    >
                        <ArrowLeft size={18} />
                        Back to {organization.category.name}
                    </button>

                    {/* Breadcrumb */}
                    <div className="org-breadcrumb">
                        {breadcrumb.map((item, index) => (
                            <span key={index}>
                                {item.url ? (
                                    <a href={item.url}>{item.label}</a>
                                ) : (
                                    <span>{item.label}</span>
                                )}
                                {index < breadcrumb.length - 1 && (
                                    <span className="separator"> / </span>
                                )}
                            </span>
                        ))}
                    </div>

                    <div className="org-info-grid">
                        {/* Main Info Column */}
                        <div>
                            {/* About */}
                            {organization.description && (
                                <div className="org-info-card">
                                    <h2><Building2 size={20} /> About</h2>
                                    <p>{organization.description}</p>
                                </div>
                            )}

                            {/* Vision / Motto */}
                            {organization.vision && (
                                <div className="org-info-card">
                                    <h2><Eye size={20} /> {isFootballClub ? 'Motto' : 'Vision'}</h2>
                                    <p style={isFootballClub ? { fontStyle: 'italic', fontSize: '1.1rem' } : {}}>
                                        {organization.vision}
                                    </p>
                                </div>
                            )}

                            {/* Mission / Honours */}
                            {isFootballClub && honours ? (
                                <div className="org-info-card honours-card">
                                    <h2><Trophy size={20} /> Honours & Achievements</h2>
                                    <div className="honours-grid">
                                        {honours.map((honour, index) => (
                                            <div key={index} className="honour-item">
                                                <div className="honour-icon">
                                                    <Award size={18} />
                                                </div>
                                                <div className="honour-details">
                                                    <span className="honour-title">{honour.title}</span>
                                                    <span className="honour-years">{honour.years}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : organization.mission && !isFootballClub ? (
                                <div className="org-info-card">
                                    <h2><Target size={20} /> Mission</h2>
                                    <p>{organization.mission}</p>
                                </div>
                            ) : null}
                        </div>

                        {/* Sidebar */}
                        <div>
                            {/* Quick Info */}
                            <div className="org-info-card">
                                <h2>Quick Info</h2>
                                <div className="org-quick-info">
                                    {organization.founded_year && (
                                        <div className="quick-info-item">
                                            <div className="quick-info-icon">
                                                <Calendar size={18} />
                                            </div>
                                            <div className="quick-info-content">
                                                <label>{isFootballClub ? 'Established' : isReligiousOrg ? 'Established' : 'Founded'}</label>
                                                <span>{organization.founded_year}</span>
                                            </div>
                                        </div>
                                    )}
                                    {organization.website && (
                                        <div className="quick-info-item">
                                            <div className="quick-info-icon">
                                                <Globe size={18} />
                                            </div>
                                            <div className="quick-info-content">
                                                <label>Website</label>
                                                <a href={organization.website} target="_blank" rel="noopener noreferrer">
                                                    {organization.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {organization.email && (
                                        <div className="quick-info-item">
                                            <div className="quick-info-icon">
                                                <Mail size={18} />
                                            </div>
                                            <div className="quick-info-content">
                                                <label>Email</label>
                                                <a href={`mailto:${organization.email}`}>{organization.email}</a>
                                            </div>
                                        </div>
                                    )}
                                    {organization.phone && (
                                        <div className="quick-info-item">
                                            <div className="quick-info-icon">
                                                <Phone size={18} />
                                            </div>
                                            <div className="quick-info-content">
                                                <label>Phone</label>
                                                <span>{organization.phone}</span>
                                            </div>
                                        </div>
                                    )}
                                    {!usesChannels && (
                                        <div className="quick-info-item">
                                            <div className="quick-info-icon">
                                                <Users size={18} />
                                            </div>
                                            <div className="quick-info-content">
                                                <label>Faculties</label>
                                                <span>{facultiesCount}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Leader Card */}
                            {organization.leader_name && (
                                <div className="org-leader-card">
                                    <div className="leader-image">
                                        {organization.leader_image_url ? (
                                            <img src={organization.leader_image_url} alt={organization.leader_name} />
                                        ) : (
                                            <div className="leader-placeholder">
                                                <User size={48} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="leader-info">
                                        <h3>{organization.leader_name}</h3>
                                        {organization.leader_title && (
                                            <div className="title">{organization.leader_title}</div>
                                        )}
                                        {organization.leader_qualifications && (
                                            <div className="qualifications">
                                                {organization.leader_qualifications}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gallery */}
                    {galleries.length > 0 && (
                        <div className="org-gallery">
                            <h2>Gallery</h2>
                            <div className="gallery-grid">
                                {galleries.map((item) => (
                                    <div key={item.id} className="gallery-item">
                                        <img src={item.image_url} alt={item.caption || 'Gallery image'} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Find Your Group CTA */}
                    <div className="find-group-section">
                        <h3>Ready to Connect?</h3>
                        <p>
                            {isFootballClub
                                ? `Join fan channels and connect with ${organization.short_name || organization.name} supporters worldwide.`
                                : isReligiousOrg
                                    ? `Join fellowship channels and connect with ${organization.short_name || organization.name} brethren worldwide.`
                                    : 'Find your faculty, department, and join your class set group chat.'
                            }
                        </p>
                        <button className="btn-find-group" onClick={handleFindGroup}>
                            {isFootballClub ? 'Join Fan Channels' : isReligiousOrg ? 'Join Fellowship Channels' : 'Find Your Group'}
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
