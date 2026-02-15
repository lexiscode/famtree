import { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Users, UserMinus } from 'lucide-react';

interface Member {
    id: number;
    user_id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        username: string;
        profile_image_url: string | null;
    } | null;
    is_admin: boolean;
    is_muted: boolean;
    joined_at: string | null;
}

interface Squad {
    id: number;
    uuid: string;
    name: string;
    gender_track: string;
    squad_number: number;
    member_cap: number;
    members_count: number;
    is_active: boolean;
    members: Member[];
}

interface Props {
    squad: Squad;
}

function MemberAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [imgError, setImgError] = useState(false);
    if (imageUrl && !imgError) {
        return (
            <div className="ap-avatar ap-avatar-sm">
                <img src={imageUrl} alt={name} onError={() => setImgError(true)} />
            </div>
        );
    }
    return (
        <div className="ap-avatar ap-avatar-sm ap-avatar-purple">
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function SquadDetail({ squad }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const handleRemoveMember = useCallback((userId: number, name: string) => {
        if (window.confirm(`Remove ${name} from this squad?`)) {
            router.post(route('admin.glam.removeSquadMember', squad.id), { user_id: userId }, { preserveScroll: true });
        }
    }, [squad.id]);

    const trackBadgeMap: Record<string, string> = {
        female: 'ap-badge-danger',
        male: 'ap-badge-info',
        mixed: 'ap-badge-warning',
    };

    return (
        <AdminLayout>
            <div>

<button className="ap-back-btn ap-mb-md" onClick={() => router.visit(route('admin.glam.squads'))}>
                    <ArrowLeft size={16} /> Back to Squads
                </button>

                <div className="ap-page-header">
                    <div className="ap-page-header-row">
                        <div>
                            <h1 className="ap-page-title">{squad.name}</h1>
                            <p className="ap-page-subtitle">
                                <span className={`ap-badge ${trackBadgeMap[squad.gender_track] || 'ap-badge-neutral'} ap-capitalize`}>
                                    {squad.gender_track}
                                </span>
                                {' '}&middot; {squad.members_count} / {squad.member_cap} members
                            </p>
                        </div>
                    </div>
                </div>

                <div className="ap-table-wrap">
                    <div className="ap-card-header">
                        <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm">
                            <Users size={18} /> Members ({squad.members.length})
                        </h3>
                    </div>

                    {squad.members.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Username</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {squad.members.map(member => (
                                        <tr key={member.id}>
                                            <td>
                                                <div className="ap-flex ap-items-center ap-gap-sm">
                                                    <MemberAvatar
                                                        imageUrl={member.user?.profile_image_url || null}
                                                        name={member.user?.first_name || '?'}
                                                    />
                                                    <span>{member.user?.first_name} {member.user?.last_name}</span>
                                                </div>
                                            </td>
                                            <td className="ap-text-secondary">@{member.user?.username}</td>
                                            <td>
                                                {member.is_admin && <span className="ap-badge ap-badge-primary">Admin</span>}
                                                {member.is_muted && <span className="ap-badge ap-badge-warning">Muted</span>}
                                                {!member.is_admin && !member.is_muted && <span className="ap-text-secondary">Member</span>}
                                            </td>
                                            <td className="ap-text-secondary ap-text-sm">{member.joined_at || '—'}</td>
                                            <td className="center">
                                                <button
                                                    className="ap-btn ap-btn-sm ap-btn-danger-outline"
                                                    onClick={() => handleRemoveMember(member.user_id, `${member.user?.first_name} ${member.user?.last_name}`)}
                                                >
                                                    <UserMinus size={14} /> Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon"><Users size={28} strokeWidth={1.5} /></div>
                            <p className="ap-empty-title">No members yet</p>
                            <p className="ap-empty-text">Members will appear when users join this squad.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
