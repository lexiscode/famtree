import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { ArrowLeft, Users, LogIn, LogOut, MessageCircle, Loader2, Globe, Trophy, Church, CheckCircle } from 'lucide-react';
import '../Organizations.css';

interface Organization {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    short_name: string | null;
    logo_url: string | null;
    cover_image_url: string | null;
    category: {
        id: number;
        name: string;
        slug: string;
    };
}

interface Channel {
    id: number;
    uuid: string;
    name: string;
    year: number;
    members_count: number;
    is_member: boolean;
}

interface Props {
    organization: Organization;
    channels: Channel[];
}

export default function ChannelsIndex({ organization, channels }: Props) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const isReligiousOrg = organization.category.slug === 'religious-organizations';
    const isFootballClub = organization.category.slug === 'football-fans';

    const handleJoin = (channelUuid: string) => {
        setLoadingId(channelUuid);
        router.post(`/class-sets/${channelUuid}/join`, {}, {
            preserveScroll: true,
            onFinish: () => setLoadingId(null),
        });
    };

    const handleLeave = (channelUuid: string) => {
        if (confirm('Are you sure you want to leave this channel?')) {
            setLoadingId(channelUuid);
            router.post(`/class-sets/${channelUuid}/leave`, {}, {
                preserveScroll: true,
                onFinish: () => setLoadingId(null),
            });
        }
    };

    const handleOpenChat = (channelUuid: string) => {
        router.visit(`/messages?class_set=${channelUuid}`);
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
                        <span>Channels</span>
                    </div>

                    {/* Header */}
                    <div className="org-header">
                        <div className="org-header-icon">
                            {isReligiousOrg ? <Church /> : <Trophy />}
                        </div>
                        <h1>{isReligiousOrg ? 'Fellowship Channels' : 'Fan Channels'}</h1>
                        <p>
                            {isReligiousOrg
                                ? `Join a fellowship channel for ${organization.short_name || organization.name} and connect with brethren from around the world.`
                                : `Join a fan community for ${organization.short_name || organization.name} and connect with supporters from around the world.`
                            }
                        </p>
                    </div>

                    {/* Channels Grid */}
                    {channels.length > 0 ? (
                        <div className="class-sets-grid">
                            {channels.map((channel) => (
                                <div key={channel.id} className={`class-set-card ${channel.is_member ? 'is-joined' : ''}`}>
                                    {channel.is_member && (
                                        <div className="joined-badge">
                                            <CheckCircle size={12} />
                                            Joined
                                        </div>
                                    )}
                                    <h4>{channel.name}</h4>
                                    <div className="class-set-year">
                                        <Globe size={16} />
                                        {isReligiousOrg ? 'Fellowship Community' : 'Fan Community'}
                                    </div>
                                    <div className="class-set-members">
                                        <Users size={16} />
                                        {channel.members_count} {channel.members_count === 1 ? 'member' : 'members'}
                                    </div>
                                    <div className="class-set-actions">
                                        {channel.is_member ? (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn-join joined"
                                                    style={{ flex: 1 }}
                                                    onClick={() => handleOpenChat(channel.uuid)}
                                                >
                                                    <MessageCircle size={18} />
                                                    Open Chat
                                                </button>
                                                <button
                                                    className="btn-join leave"
                                                    style={{ flex: 0, padding: '0.75rem' }}
                                                    onClick={() => handleLeave(channel.uuid)}
                                                    disabled={loadingId === channel.uuid}
                                                    title="Leave channel"
                                                >
                                                    {loadingId === channel.uuid ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <LogOut size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn-join join"
                                                onClick={() => handleJoin(channel.uuid)}
                                                disabled={loadingId === channel.uuid}
                                            >
                                                {loadingId === channel.uuid ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" />
                                                        Joining...
                                                    </>
                                                ) : (
                                                    <>
                                                        <LogIn size={18} />
                                                        Join Channel
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
                            <h3>No channels available</h3>
                            <p>
                                {isReligiousOrg
                                    ? 'Fellowship channels for this organization have not been added yet.'
                                    : 'Fan channels for this club have not been added yet.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
