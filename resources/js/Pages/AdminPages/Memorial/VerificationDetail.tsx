import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    ShieldCheck,
    Clock,
    CheckCircle,
    XCircle,
    User,
    MessageSquare,
    FastForward,
    UserCheck,
    UserX,
} from 'lucide-react';

interface Responder {
    name: string;
}

interface FamilyResponse {
    id: number;
    responder: Responder;
    relationship_type: string;
    response: string;
    responded_at: string;
}

interface VerificationUser {
    name: string;
    username: string;
    profile_image_url: string | null;
}

interface VerificationDetail {
    id: number;
    uuid: string;
    user: VerificationUser;
    stage: string;
    final_status: string | null;
    reengagement_sent_at: string | null;
    family_check_sent_at: string | null;
    status_change_scheduled_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    cancelled_reason: string | null;
    responses: FamilyResponse[];
    created_at: string;
}

interface Props {
    verification: VerificationDetail;
}

function UserAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <div className="ap-avatar ap-avatar-xl ap-avatar-indigo">
                <img src={imageUrl} alt={name} onError={() => setImageError(true)} />
            </div>
        );
    }

    return (
        <div className="ap-avatar ap-avatar-xl ap-avatar-indigo">
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

const responseBadgeMap: Record<string, string> = {
    confirmed_alive: 'ap-badge ap-badge-success',
    confirmed_deceased: 'ap-badge ap-badge-danger',
};

export default function VerificationDetailPage({ verification }: Props) {
    const v = verification;
    const isActive = !v.completed_at && !v.cancelled_at;

    const timelineSteps = [
        { label: 'Verification Started', date: v.created_at, icon: ShieldCheck, completed: true },
        { label: 'Reengagement Sent', date: v.reengagement_sent_at, icon: MessageSquare, completed: !!v.reengagement_sent_at },
        { label: 'Family Check Sent', date: v.family_check_sent_at, icon: User, completed: !!v.family_check_sent_at },
        { label: 'Status Change Scheduled', date: v.status_change_scheduled_at, icon: Clock, completed: !!v.status_change_scheduled_at },
        { label: v.cancelled_at ? 'Cancelled' : 'Completed', date: v.completed_at || v.cancelled_at, icon: v.cancelled_at ? XCircle : CheckCircle, completed: !!(v.completed_at || v.cancelled_at) },
    ];

    return (
        <AdminLayout>
            <div>
                {/* Back Button & Header */}
                <button className="ap-back-btn" onClick={() => router.get(route('admin.memorial.verifications'))}>
                    <ArrowLeft size={16} /> Back to Verifications
                </button>
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Verification Detail</h1>
                    <p className="ap-page-subtitle">Review verification progress and manage actions</p>
                </div>

                {/* User Info Card */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-flex ap-items-center ap-gap-lg ap-flex-wrap">
                        <UserAvatar imageUrl={v.user.profile_image_url} name={v.user.name} />
                        <div className="ap-flex-1">
                            <h2 className="ap-page-title">{v.user.name}</h2>
                            <p className="ap-page-subtitle">@{v.user.username}</p>
                            <div className="ap-flex ap-gap-sm ap-mt-sm ap-flex-wrap">
                                <span className="ap-badge ap-badge-primary ap-capitalize">
                                    Stage: {v.stage.replace(/_/g, ' ')}
                                </span>
                                {v.final_status && (
                                    <span className={`ap-badge ${v.final_status === 'deceased' ? 'ap-badge-danger' : 'ap-badge-success'} ap-capitalize`}>
                                        Final: {v.final_status}
                                    </span>
                                )}
                            </div>
                        </div>
                        {v.cancelled_at && v.cancelled_reason && (
                            <div className="ap-alert ap-alert-danger">
                                <div>
                                    <p className="ap-alert-title">Cancellation Reason</p>
                                    <p className="ap-alert-text">{v.cancelled_reason}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <h3 className="ap-card-title ap-mb-lg">Verification Timeline</h3>
                    <div className="ap-scroll-list">
                        {timelineSteps.map((step, idx) => {
                            const Icon = step.icon;
                            return (
                                <div key={idx} className="ap-activity-item">
                                    <div className={`ap-activity-icon ${step.completed ? '' : 'ap-timeline-pending'}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="ap-activity-content">
                                        <p className={`ap-activity-title ${step.completed ? '' : 'ap-timeline-pending-text'}`}>{step.label}</p>
                                        <p className="ap-activity-sub">
                                            {step.date ? new Date(step.date).toLocaleString() : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Family Responses */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <h3 className="ap-card-title ap-mb-lg">
                        Family Responses ({v.responses.length})
                    </h3>
                    {v.responses.length > 0 ? (
                        <div className="ap-scroll-list">
                            {v.responses.map((resp) => (
                                <div key={resp.id} className="ap-list-item">
                                    <div className="ap-activity-icon">
                                        <User size={18} />
                                    </div>
                                    <div className="ap-flex-1">
                                        <p className="ap-activity-title">{resp.responder.name}</p>
                                        <p className="ap-activity-sub ap-capitalize">
                                            {resp.relationship_type.replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                    <span className={responseBadgeMap[resp.response] || 'ap-badge ap-badge-neutral'}>
                                        <span className="ap-capitalize">{resp.response.replace(/_/g, ' ')}</span>
                                    </span>
                                    <span className="ap-activity-time">
                                        {new Date(resp.responded_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="ap-text-secondary ap-text-sm">No family responses yet</p>
                    )}
                </div>

                {/* Admin Actions */}
                {isActive && (
                    <div className="ap-card ap-card-lg">
                        <h3 className="ap-card-title ap-mb-lg">Admin Actions</h3>
                        <div className="ap-flex ap-gap-md ap-flex-wrap">
                            <button
                                className="ap-btn ap-btn-danger"
                                onClick={() => router.post(route('admin.memorial.verifications.cancel', v.uuid), {}, { preserveScroll: true })}
                            >
                                <XCircle size={16} />
                                Cancel Verification
                            </button>
                            <button
                                className="ap-btn ap-btn-warning"
                                onClick={() => router.post(route('admin.memorial.verifications.expedite', v.uuid), {}, { preserveScroll: true })}
                            >
                                <FastForward size={16} />
                                Expedite
                            </button>
                            <button
                                className="ap-btn ap-btn-secondary"
                                onClick={() => router.post(route('admin.memorial.verifications.override-deceased', v.uuid), {}, { preserveScroll: true })}
                            >
                                <UserX size={16} />
                                Override as Deceased
                            </button>
                            <button
                                className="ap-btn ap-btn-success"
                                onClick={() => router.post(route('admin.memorial.verifications.override-alive', v.uuid), {}, { preserveScroll: true })}
                            >
                                <UserCheck size={16} />
                                Override as Alive
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
