import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Users, LogOut, UserPlus, AlertTriangle, X, MessageSquare } from 'lucide-react';
import type { GlamSquad } from '@/types/glam';

interface Props {
    squad: GlamSquad | null;
    type: 'gendered' | 'mixed';
    userGender?: string | null;
}

export default function SquadInfoCard({ squad, type, userGender }: Props) {
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const handleJoin = () => {
        if (type === 'mixed') {
            router.post(route('glam-squad.joinMixed'), {}, { preserveScroll: true });
        } else if (userGender) {
            router.post(route('glam-squad.joinSquad'), { gender_track: userGender }, { preserveScroll: true });
        }
    };

    const handleLeave = () => {
        if (squad) {
            router.post(route('glam-squad.leaveSquad', squad.id), {}, {
                preserveScroll: true,
                onFinish: () => setShowLeaveConfirm(false),
            });
        }
    };

    if (!squad) {
        return (
            <div className="squad-info">
                <div>
                    <div className="squad-info-name" style={{ marginBottom: 2 }}>
                        {type === 'mixed' ? 'Join a Mixed Squad' : 'Join a Squad'}
                    </div>
                    <div className="squad-info-count">
                        {type === 'mixed' ? 'Chat with everyone' : 'Submit entries & compete'}
                    </div>
                </div>
                <button className="glam-btn glam-btn-pink glam-btn-sm" onClick={handleJoin}>
                    <UserPlus size={14} /> Join
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="squad-info">
                <div>
                    <div className="squad-info-name">{squad.name}</div>
                    <div className="squad-info-count">
                        <Users size={12} style={{ marginRight: 4 }} />
                        {squad.member_count} members
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <a
                        href="/messages"
                        className="glam-btn glam-btn-primary glam-btn-sm"
                        title="Open squad chat in Messages"
                    >
                        <MessageSquare size={14} /> Chat
                    </a>
                    <button className="glam-btn glam-btn-outline glam-btn-sm" onClick={() => setShowLeaveConfirm(true)}>
                        <LogOut size={14} /> Leave
                    </button>
                </div>
            </div>

            {/* Leave Confirmation Dialog */}
            {showLeaveConfirm && (
                <div
                    onClick={() => setShowLeaveConfirm(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'fadeIn 0.2s ease',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 16, padding: 28, maxWidth: 400, width: '90%',
                            animation: 'slideUp 0.25s ease',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12,
                                background: 'rgba(239, 68, 68, 0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <AlertTriangle size={20} color="#f87171" />
                            </div>
                            <h3 style={{ color: '#ffffff', fontSize: 16, fontWeight: 600, margin: 0 }}>
                                Leave {squad.name}?
                            </h3>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
                            You will lose access to the squad chat and will need to rejoin if you change your mind.
                            {type === 'gendered' && ' Your challenge entries will not be affected.'}
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowLeaveConfirm(false)}
                                style={{
                                    padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(148,163,184,0.2)',
                                    background: 'transparent', color: '#94a3b8', fontSize: 13, fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLeave}
                                style={{
                                    padding: '8px 18px', borderRadius: 10, border: 'none',
                                    background: 'rgba(239, 68, 68, 0.8)', color: '#ffffff',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                Leave Squad
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
