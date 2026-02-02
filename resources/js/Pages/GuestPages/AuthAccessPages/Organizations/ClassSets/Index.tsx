import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { ArrowLeft, Users, LogIn, LogOut, CheckCircle, MessageCircle, Loader2, GraduationCap } from 'lucide-react';
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
}

interface ClassSet {
    id: number;
    uuid: string;
    name: string;
    year: number;
    members_count: number;
    is_member: boolean;
}

interface Props {
    department: Department;
    faculty: Faculty;
    organization: Organization;
    classSets: ClassSet[];
}

export default function ClassSetsIndex({ department, faculty, organization, classSets }: Props) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleJoin = (classSetUuid: string) => {
        setLoadingId(classSetUuid);
        router.post(`/class-sets/${classSetUuid}/join`, {}, {
            preserveScroll: true,
            onFinish: () => setLoadingId(null),
        });
    };

    const handleLeave = (classSetUuid: string) => {
        if (confirm('Are you sure you want to leave this class set?')) {
            setLoadingId(classSetUuid);
            router.post(`/class-sets/${classSetUuid}/leave`, {}, {
                preserveScroll: true,
                onFinish: () => setLoadingId(null),
            });
        }
    };

    const handleOpenChat = (classSetUuid: string) => {
        // Navigate to messages page with class set chat selected
        router.visit(`/messages?class_set=${classSetUuid}`);
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
                        onClick={() => router.visit(`/organizations/faculty/${faculty.slug}/departments`)}
                    >
                        <ArrowLeft size={18} />
                        Back to Departments
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
                        <a href={`/organizations/faculty/${faculty.slug}/departments`}>{faculty.name}</a>
                        <span className="separator">/</span>
                        <span>{department.name}</span>
                    </div>

                    {/* Header */}
                    <div className="org-header">
                        <div className="org-header-icon">
                            <GraduationCap />
                        </div>
                        <h1>Class Sets</h1>
                        <p>Join your graduating class set to connect with classmates in {department.name}.</p>
                    </div>

                    {/* Class Sets Grid */}
                    {classSets.length > 0 ? (
                        <div className="class-sets-grid">
                            {classSets.map((classSet) => (
                                <div key={classSet.id} className={`class-set-card ${classSet.is_member ? 'is-joined' : ''}`}>
                                    {classSet.is_member && (
                                        <div className="joined-badge">
                                            <CheckCircle size={12} />
                                            Joined
                                        </div>
                                    )}
                                    <h4>{classSet.name}</h4>
                                    <div className="class-set-year">Class of {classSet.year}</div>
                                    <div className="class-set-members">
                                        <Users size={16} />
                                        {classSet.members_count} {classSet.members_count === 1 ? 'member' : 'members'}
                                    </div>
                                    <div className="class-set-actions">
                                        {classSet.is_member ? (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn-join joined"
                                                    style={{ flex: 1 }}
                                                    onClick={() => handleOpenChat(classSet.uuid)}
                                                >
                                                    <MessageCircle size={18} />
                                                    Open Chat
                                                </button>
                                                <button
                                                    className="btn-join leave"
                                                    style={{ flex: 0, padding: '0.75rem' }}
                                                    onClick={() => handleLeave(classSet.uuid)}
                                                    disabled={loadingId === classSet.uuid}
                                                    title="Leave group"
                                                >
                                                    {loadingId === classSet.uuid ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <LogOut size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn-join join"
                                                onClick={() => handleJoin(classSet.uuid)}
                                                disabled={loadingId === classSet.uuid}
                                            >
                                                {loadingId === classSet.uuid ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" />
                                                        Joining...
                                                    </>
                                                ) : (
                                                    <>
                                                        <LogIn size={18} />
                                                        Join Group
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Users size={64} />
                            <h3>No class sets available</h3>
                            <p>Class sets for this department have not been added yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
