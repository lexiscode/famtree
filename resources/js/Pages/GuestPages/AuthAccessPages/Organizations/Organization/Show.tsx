import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import {
    ArrowLeft, MapPin, Globe, Mail, Phone, Calendar, Target, Eye,
    Users, User, ChevronRight, Building2, Trophy, Award, MessageCircle,
    Clock, CheckCircle, XCircle, Loader2
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

interface OrgGroup {
    id: number;
    uuid: string;
    name: string;
    description: string | null;
    type: string;
    member_count: number;
    allow_join_requests: boolean;
    is_member: boolean;
    has_pending_request: boolean;
    pending_request_id: number | null;
    is_banned: boolean;
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
    orgGroups?: OrgGroup[];
}

export default function OrganizationShow({ organization, facultiesCount, galleries, breadcrumb, orgGroups = [] }: Props) {
    const isFootballClub = organization.category.slug === 'football-fans';
    const isReligiousOrg = organization.category.slug === 'religious-organizations';
    const usesChannels = isFootballClub || isReligiousOrg;

    const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
    const [cancellingRequestId, setCancellingRequestId] = useState<number | null>(null);
    const [joinMessage, setJoinMessage] = useState('');
    const [showJoinModal, setShowJoinModal] = useState<number | null>(null);

    const handleFindGroup = () => {
        if (usesChannels) {
            router.visit(`/organizations/${organization.slug}/channels`);
        } else {
            router.visit(`/organizations/${organization.slug}/faculties`);
        }
    };

    const handleJoinRequest = (groupId: number) => {
        setJoiningGroupId(groupId);
        router.post(`/organizations/groups/${groupId}/join-request`, { message: joinMessage }, {
            preserveScroll: true,
            onFinish: () => {
                setJoiningGroupId(null);
                setShowJoinModal(null);
                setJoinMessage('');
            },
        });
    };

    const handleCancelRequest = (requestId: number) => {
        setCancellingRequestId(requestId);
        router.delete(`/organizations/groups/join-request/${requestId}`, {
            preserveScroll: true,
            onFinish: () => setCancellingRequestId(null),
        });
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
                        onClick={() => router.visit('/organizations')}
                    >
                        <ArrowLeft size={18} />
                        Back to Organizations
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

                    {/* Prediction League CTA (Football Clubs Only) */}
                    {isFootballClub && (
                        <div className="find-group-section" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.06))', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Trophy size={20} color="#FFD700" /> Prediction League
                            </h3>
                            <p>Predict match outcomes, earn points, and compete with fellow fans on the leaderboard.</p>
                            <button
                                className="btn-find-group"
                                onClick={() => router.visit(`/organizations/${organization.slug}/predictions`)}
                                style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
                            >
                                Enter Prediction League
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* Org Groups - Join Section */}
                    {orgGroups.length > 0 && (
                        <div className="org-info-card" style={{ marginTop: '1.5rem' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageCircle size={20} /> Community Groups
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                Join groups to chat with other members of {organization.short_name || organization.name}.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {orgGroups.map(group => (
                                    <div key={group.id} style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '12px',
                                        padding: '1rem 1.25rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '1rem',
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: 600, color: '#e0e0e0', fontSize: '0.9rem' }}>
                                                    {group.name}
                                                </span>
                                                {group.type && (
                                                    <span style={{
                                                        fontSize: '0.6rem', fontWeight: 600, color: '#8B5CF6',
                                                        background: 'rgba(139,92,246,0.1)', padding: '1px 6px',
                                                        borderRadius: '4px', textTransform: 'capitalize',
                                                    }}>
                                                        {group.type.replace(/_/g, ' ')}
                                                    </span>
                                                )}
                                            </div>
                                            {group.description && (
                                                <p style={{ margin: '0 0 0.3rem', fontSize: '0.78rem', color: '#888', lineHeight: 1.4 }}>
                                                    {group.description}
                                                </p>
                                            )}
                                            <span style={{ fontSize: '0.72rem', color: '#666' }}>
                                                <Users size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                {group.member_count} member{group.member_count !== 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        <div style={{ flexShrink: 0 }}>
                                            {group.is_member ? (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '6px 14px', borderRadius: '8px',
                                                    background: 'rgba(34,197,94,0.1)', color: '#22C55E',
                                                    fontSize: '0.78rem', fontWeight: 600,
                                                }}>
                                                    <CheckCircle size={14} /> Joined
                                                </span>
                                            ) : group.is_banned ? (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '6px 14px', borderRadius: '8px',
                                                    background: 'rgba(239,68,68,0.1)', color: '#EF4444',
                                                    fontSize: '0.78rem', fontWeight: 600,
                                                }}>
                                                    <XCircle size={14} /> Banned
                                                </span>
                                            ) : group.has_pending_request ? (
                                                <button
                                                    onClick={() => handleCancelRequest(group.pending_request_id!)}
                                                    disabled={cancellingRequestId === group.pending_request_id}
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                        padding: '6px 14px', borderRadius: '8px',
                                                        background: 'rgba(245,158,11,0.1)',
                                                        border: '1px solid rgba(245,158,11,0.2)',
                                                        color: '#F59E0B', fontSize: '0.78rem', fontWeight: 600,
                                                        cursor: 'pointer', transition: 'all 0.2s',
                                                    }}
                                                >
                                                    {cancellingRequestId === group.pending_request_id ? (
                                                        <><Loader2 size={14} className="spin" /> Cancelling...</>
                                                    ) : (
                                                        <><Clock size={14} /> Pending &middot; Cancel</>
                                                    )}
                                                </button>
                                            ) : showJoinModal === group.id ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '200px' }}>
                                                    <textarea
                                                        value={joinMessage}
                                                        onChange={e => setJoinMessage(e.target.value)}
                                                        placeholder="Why do you want to join? (optional)"
                                                        rows={2}
                                                        style={{
                                                            background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff',
                                                            fontSize: '0.75rem', outline: 'none', resize: 'none' as const,
                                                        }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                        <button
                                                            onClick={() => { setShowJoinModal(null); setJoinMessage(''); }}
                                                            style={{
                                                                flex: 1, padding: '5px 10px', borderRadius: '6px',
                                                                background: 'rgba(255,255,255,0.05)', border: 'none',
                                                                color: '#888', fontSize: '0.72rem', cursor: 'pointer',
                                                            }}
                                                        >Cancel</button>
                                                        <button
                                                            onClick={() => handleJoinRequest(group.id)}
                                                            disabled={joiningGroupId === group.id}
                                                            style={{
                                                                flex: 1, padding: '5px 10px', borderRadius: '6px',
                                                                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                                                border: 'none', color: '#fff', fontSize: '0.72rem',
                                                                fontWeight: 600, cursor: 'pointer',
                                                                opacity: joiningGroupId === group.id ? 0.5 : 1,
                                                            }}
                                                        >
                                                            {joiningGroupId === group.id ? 'Sending...' : 'Send Request'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setShowJoinModal(group.id)}
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                        padding: '6px 14px', borderRadius: '8px',
                                                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                                        border: 'none', color: '#fff', fontSize: '0.78rem',
                                                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                                    }}
                                                >
                                                    Request to Join
                                                </button>
                                            )}
                                        </div>
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
