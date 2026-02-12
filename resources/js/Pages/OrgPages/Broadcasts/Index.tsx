import OrgLayout from '@/Layouts/OrgLayout';
import { router } from '@inertiajs/react';
import { Plus, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';

interface BroadcastCreator {
    display_name: string | null;
    username: string;
}

interface Broadcast {
    id: number;
    uuid: string;
    title: string | null;
    message: string;
    target_type: string;
    schedule_type: string;
    status: string;
    sent_to_count: number;
    created_at: string;
    creator: BroadcastCreator;
}

interface PaginatedBroadcasts {
    data: Broadcast[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    broadcasts: PaginatedBroadcasts;
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    draft: { color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.15)', label: 'Draft' },
    pending: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', label: 'Pending' },
    sent: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)', label: 'Sent' },
    cancelled: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Cancelled' },
};

function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
}

export default function BroadcastsIndex({ broadcasts }: Props) {
    const handlePageChange = (page: number) => {
        router.visit(route('org.broadcasts.index', { page }));
    };

    return (
        <OrgLayout>
            <div>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                            Broadcasts
                        </h1>
                        <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                            {broadcasts.total} total broadcast{broadcasts.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => router.visit(route('org.broadcasts.create'))}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                    >
                        <Plus size={18} />
                        Create Broadcast
                    </button>
                </div>

                {/* Broadcasts List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {broadcasts.data.length > 0 ? broadcasts.data.map((broadcast) => {
                        const status = statusConfig[broadcast.status] || statusConfig.draft;
                        return (
                            <div
                                key={broadcast.id}
                                style={{
                                    background: '#141425',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onClick={() => router.visit(route('org.broadcasts.show', { broadcast: broadcast.uuid }))}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '0.75rem',
                                }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{
                                            fontSize: '1.05rem',
                                            fontWeight: 600,
                                            color: '#ffffff',
                                            margin: '0 0 0.5rem',
                                        }}>
                                            {broadcast.title || 'Untitled Broadcast'}
                                        </h3>
                                        <div
                                            dangerouslySetInnerHTML={{ __html: broadcast.message }}
                                            style={{
                                                color: '#888',
                                                fontSize: '0.875rem',
                                                margin: 0,
                                                lineHeight: 1.6,
                                                wordBreak: 'break-word',
                                            }}
                                        />
                                    </div>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: status.color,
                                        background: status.bg,
                                        flexShrink: 0,
                                        marginLeft: '1rem',
                                    }}>
                                        {status.label}
                                    </span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '1.5rem',
                                    alignItems: 'center',
                                    color: '#666',
                                    fontSize: '0.8rem',
                                }}>
                                    <span>Target: {broadcast.target_type === 'all_groups' ? 'All Groups' : 'Selected Groups'}</span>
                                    <span>Schedule: {broadcast.schedule_type}</span>
                                    <span>Sent to: {broadcast.sent_to_count}</span>
                                    <span style={{ marginLeft: 'auto' }}>
                                        By {broadcast.creator.display_name || broadcast.creator.username} · {new Date(broadcast.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            background: '#141425',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}>
                            <Megaphone size={32} color="#555" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>
                                No broadcasts yet. Create your first broadcast to reach your followers.
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {broadcasts.last_page > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginTop: '2rem',
                    }}>
                        <button
                            onClick={() => handlePageChange(broadcasts.current_page - 1)}
                            disabled={broadcasts.current_page === 1}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 1rem',
                                background: broadcasts.current_page === 1 ? 'rgba(255,255,255,0.03)' : 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '8px',
                                color: broadcasts.current_page === 1 ? '#555' : '#8B5CF6',
                                fontSize: '0.85rem',
                                cursor: broadcasts.current_page === 1 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>
                        <span style={{ color: '#888', fontSize: '0.85rem' }}>
                            Page {broadcasts.current_page} of {broadcasts.last_page}
                        </span>
                        <button
                            onClick={() => handlePageChange(broadcasts.current_page + 1)}
                            disabled={broadcasts.current_page === broadcasts.last_page}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 1rem',
                                background: broadcasts.current_page === broadcasts.last_page ? 'rgba(255,255,255,0.03)' : 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '8px',
                                color: broadcasts.current_page === broadcasts.last_page ? '#555' : '#8B5CF6',
                                fontSize: '0.85rem',
                                cursor: broadcasts.current_page === broadcasts.last_page ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </OrgLayout>
    );
}
