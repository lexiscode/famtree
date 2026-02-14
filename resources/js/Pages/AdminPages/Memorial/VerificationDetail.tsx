import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    ShieldCheck,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    User,
    Calendar,
    MessageSquare,
    Zap,
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

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

function UserAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={name}
                style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', display: 'block', boxShadow: '0 8px 24px rgba(0, 82, 232, 0.3)' }}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div
            style={{
                width: '80px', height: '80px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)', color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '2rem',
                boxShadow: '0 8px 24px rgba(0, 82, 232, 0.3)',
            }}
        >
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function VerificationDetailPage({ verification }: Props) {
    const v = verification;
    const isActive = !v.completed_at && !v.cancelled_at;

    const timelineSteps = [
        {
            label: 'Verification Started',
            date: v.created_at,
            icon: ShieldCheck,
            completed: true,
            color: THEME.primary,
        },
        {
            label: 'Reengagement Sent',
            date: v.reengagement_sent_at,
            icon: MessageSquare,
            completed: !!v.reengagement_sent_at,
            color: THEME.info,
        },
        {
            label: 'Family Check Sent',
            date: v.family_check_sent_at,
            icon: User,
            completed: !!v.family_check_sent_at,
            color: THEME.warning,
        },
        {
            label: 'Status Change Scheduled',
            date: v.status_change_scheduled_at,
            icon: Clock,
            completed: !!v.status_change_scheduled_at,
            color: '#9B59B6',
        },
        {
            label: v.cancelled_at ? 'Cancelled' : 'Completed',
            date: v.completed_at || v.cancelled_at,
            icon: v.cancelled_at ? XCircle : CheckCircle,
            completed: !!(v.completed_at || v.cancelled_at),
            color: v.cancelled_at ? THEME.danger : THEME.success,
        },
    ];

    const responseColor = (response: string) => {
        if (response === 'confirmed_alive') return { bg: '#e8f5e9', border: '#198754', text: '#155724' };
        if (response === 'confirmed_deceased') return { bg: '#ffebee', border: '#dc3545', text: '#842029' };
        return { bg: '#f3f4f6', border: '#6c757d', text: '#6c757d' };
    };

    return (
        <AdminLayout>
            <div>
                {/* Back Button & Header */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <button
                        onClick={() => router.get(route('admin.memorial.verifications'))}
                        style={{
                            background: '#E7F5FF', border: '2px solid #cfe2ff', padding: '0.65rem', borderRadius: '12px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', color: THEME.primary,
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = THEME.primary; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 8px 16px ${THEME.primary}30`; e.currentTarget.style.transform = 'translateX(-3px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#E7F5FF'; e.currentTarget.style.color = THEME.primary; e.currentTarget.style.borderColor = '#cfe2ff'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>Verification Detail</h1>
                        <p style={{ fontSize: '0.98rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>Review verification progress and manage actions</p>
                    </div>
                </div>

                {/* User Info Card */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
                        <UserAvatar imageUrl={v.user.profile_image_url} name={v.user.name} />
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>{v.user.name}</h2>
                            <p style={{ fontSize: '1.05rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>@{v.user.username}</p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.75rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, backgroundColor: '#e7f1ff', color: THEME.primary, border: '1.5px solid #cfe2ff', textTransform: 'capitalize' }}>
                                    Stage: {v.stage.replace(/_/g, ' ')}
                                </span>
                                {v.final_status && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.75rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, backgroundColor: v.final_status === 'deceased' ? '#ffebee' : '#e8f5e9', color: v.final_status === 'deceased' ? '#842029' : '#155724', border: `1.5px solid ${v.final_status === 'deceased' ? '#dc3545' : '#198754'}`, textTransform: 'capitalize' }}>
                                        Final: {v.final_status}
                                    </span>
                                )}
                            </div>
                        </div>
                        {v.cancelled_at && v.cancelled_reason && (
                            <div style={{ padding: '1rem 1.25rem', background: '#FEE2E2', borderRadius: '12px', border: '2px solid #FECACA', maxWidth: '300px' }}>
                                <p style={{ margin: 0, color: '#991B1B', fontWeight: 700, fontSize: '0.88rem' }}>Cancellation Reason</p>
                                <p style={{ margin: 0, marginTop: '0.4rem', color: '#7F1D1D', fontSize: '0.9rem', fontWeight: 500 }}>{v.cancelled_reason}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '2rem', letterSpacing: '-0.3px' }}>Verification Timeline</h3>
                    <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
                        {/* Vertical line */}
                        <div style={{ position: 'absolute', left: '19px', top: '0', bottom: '0', width: '3px', background: '#E5E7EB', borderRadius: '2px' }} />
                        {timelineSteps.map((step, idx) => {
                            const Icon = step.icon;
                            return (
                                <div key={idx} style={{ position: 'relative', marginBottom: idx < timelineSteps.length - 1 ? '2.5rem' : 0, paddingLeft: '2rem' }}>
                                    <div style={{
                                        position: 'absolute', left: '-2.5rem', top: '0', width: '40px', height: '40px', borderRadius: '50%',
                                        background: step.completed ? step.color : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: `3px solid ${step.completed ? step.color : '#E5E7EB'}`, zIndex: 1,
                                        boxShadow: step.completed ? `0 4px 12px ${step.color}30` : 'none',
                                    }}>
                                        <Icon size={18} color={step.completed ? '#FFFFFF' : '#9CA3AF'} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '1rem', fontWeight: 700, color: step.completed ? '#0a0e27' : '#9CA3AF', margin: 0 }}>{step.label}</p>
                                        <p style={{ fontSize: '0.88rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>
                                            {step.date ? new Date(step.date).toLocaleString() : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Family Responses */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '2rem', letterSpacing: '-0.3px' }}>
                        Family Responses ({v.responses.length})
                    </h3>
                    {v.responses.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {v.responses.map((resp) => {
                                const rColor = responseColor(resp.response);
                                return (
                                    <div
                                        key={resp.id}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem',
                                            background: '#F9FAFC', border: '1px solid rgba(0, 0, 0, 0.04)', borderRadius: '12px',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F4F9'; e.currentTarget.style.borderColor = 'rgba(0, 82, 232, 0.15)'; e.currentTarget.style.transform = 'translateX(6px)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFC'; e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.04)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '10px', background: `${rColor.bg}`, border: `1.5px solid ${rColor.border}`, flexShrink: 0 }}>
                                            <User size={20} color={rColor.text} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27' }}>{resp.responder.name}</p>
                                            <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '0.85rem', color: '#6B7280', fontWeight: 500 }}>
                                                {resp.relationship_type.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                        <span style={{
                                            display: 'inline-block', paddingLeft: '0.75rem', paddingRight: '0.75rem', paddingTop: '0.45rem', paddingBottom: '0.45rem',
                                            borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, backgroundColor: rColor.bg, color: rColor.text,
                                            border: `1.5px solid ${rColor.border}`, textTransform: 'capitalize',
                                        }}>
                                            {resp.response.replace(/_/g, ' ')}
                                        </span>
                                        <span style={{ fontSize: '0.82rem', color: '#9CA3AF', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                            {new Date(resp.responded_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                            <p style={{ margin: 0, fontSize: '0.95rem' }}>No family responses yet</p>
                        </div>
                    )}
                </div>

                {/* Admin Actions */}
                {isActive && (
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '2rem', letterSpacing: '-0.3px' }}>Admin Actions</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {[
                                { label: 'Cancel Verification', icon: XCircle, color: THEME.danger, action: () => router.post(route('admin.memorial.verifications.cancel', v.uuid), {}, { preserveScroll: true }) },
                                { label: 'Expedite', icon: FastForward, color: THEME.warning, action: () => router.post(route('admin.memorial.verifications.expedite', v.uuid), {}, { preserveScroll: true }) },
                                { label: 'Override as Deceased', icon: UserX, color: '#9B59B6', action: () => router.post(route('admin.memorial.verifications.override-deceased', v.uuid), {}, { preserveScroll: true }) },
                                { label: 'Override as Alive', icon: UserCheck, color: THEME.success, action: () => router.post(route('admin.memorial.verifications.override-alive', v.uuid), {}, { preserveScroll: true }) },
                            ].map((btn) => {
                                const Icon = btn.icon;
                                return (
                                    <button
                                        key={btn.label}
                                        onClick={btn.action}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                            paddingLeft: '1.1rem', paddingRight: '1.1rem', paddingTop: '0.85rem', paddingBottom: '0.85rem',
                                            background: '#FFFFFF', color: btn.color, border: `2px solid ${btn.color}30`, borderRadius: '12px',
                                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            fontSize: '0.92rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', letterSpacing: '0.3px',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = btn.color + '15'; e.currentTarget.style.borderColor = btn.color + '60'; e.currentTarget.style.boxShadow = `0 8px 16px ${btn.color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = btn.color + '30'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <Icon size={18} />
                                        {btn.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
