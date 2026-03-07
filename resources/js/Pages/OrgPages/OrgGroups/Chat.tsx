import OrgLayout from '@/Layouts/OrgLayout';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    ArrowLeft, Send, Pin, PinOff, Trash2, Reply, X, Paperclip,
    Image as ImageIcon, File, Download, Users, ChevronDown,
    BarChart3, Plus, Clock, Lock, Eye, EyeOff, CheckCircle2, XCircle, PauseCircle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────
interface ChatUser {
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_image: string | null;
}

interface ReplyInfo {
    id: number;
    message: string | null;
    user: { first_name: string; last_name: string } | null;
    is_deleted: boolean;
}

interface ChatMessage {
    id: number;
    user: ChatUser | null;
    message: string | null;
    message_type: 'text' | 'image' | 'file';
    attachment_url: string | null;
    attachment_name: string | null;
    reply_to: ReplyInfo | null;
    is_pinned: boolean;
    created_at: string;
    is_deleted: boolean;
}

interface GroupMember {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    username: string;
    profile_image: string | null;
    role: string;
    is_leader: boolean;
}

interface GroupInfo {
    id: number;
    name: string;
    type: string;
    active_members_count: number;
    members: GroupMember[];
}

interface PollOption {
    id: number;
    label: string;
    votes_count: number;
    percentage: number;
}

interface Poll {
    id: number;
    question: string;
    description: string | null;
    poll_type: 'single' | 'multiple';
    is_anonymous: boolean;
    show_results_before_vote: boolean;
    is_active: boolean;
    is_closed: boolean;
    is_expired: boolean;
    expires_at: string | null;
    closed_at: string | null;
    created_at: string;
    creator: ChatUser | null;
    options: PollOption[];
    total_votes: number;
    total_voters: number;
    user_votes: number[];
    has_voted: boolean;
}

interface Props {
    group: GroupInfo;
    initialMessages: ChatMessage[];
    pinnedMessages: ChatMessage[];
    isLimitedAccess?: boolean;
    isSuspended?: boolean;
    suspensionReason?: string | null;
}

// ─── Styles ──────────────────────────────────────────────────────
const bg = '#0c0c1d';
const cardBg = '#141425';
const inputBg = '#1e1e35';
const accent = '#8B5CF6';

// ─── Component ──────────────────────────────────────────────────
export default function Chat({ group, initialMessages, pinnedMessages: initialPinned, isLimitedAccess, isSuspended, suspensionReason }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>(initialPinned);
    const [messageText, setMessageText] = useState('');
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [showPinned, setShowPinned] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [sending, setSending] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(initialMessages.length >= 50);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);

    // Polls
    const [showPolls, setShowPolls] = useState(false);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [pollsLoading, setPollsLoading] = useState(false);
    const [showCreatePoll, setShowCreatePoll] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollDescription, setPollDescription] = useState('');
    const [pollType, setPollType] = useState<'single' | 'multiple'>('single');
    const [pollAnonymous, setPollAnonymous] = useState(false);
    const [pollShowResults, setPollShowResults] = useState(true);
    const [pollExpiry, setPollExpiry] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [pollSubmitting, setPollSubmitting] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isAtBottom = useRef(true);

    // Scroll to bottom
    const scrollToBottom = useCallback((smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }, []);

    // Initial scroll
    useEffect(() => {
        scrollToBottom(false);
    }, []);

    // Track scroll position
    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const threshold = 100;
        const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
        isAtBottom.current = atBottom;
        setShowScrollDown(!atBottom);
    }, []);

    // Poll for new messages
    useEffect(() => {
        const interval = setInterval(async () => {
            if (messages.length === 0) return;
            const lastId = messages[messages.length - 1]?.id;
            if (!lastId) return;

            try {
                const res = await fetch(
                    route('org.org-groups.chat.messages', { groupId: group.id }) + `?after_id=${lastId}`
                );
                const newMsgs: ChatMessage[] = await res.json();
                if (newMsgs.length > 0) {
                    setMessages(prev => [...prev, ...newMsgs]);
                    if (isAtBottom.current) {
                        setTimeout(() => scrollToBottom(), 50);
                    }
                }
            } catch {}
        }, 3000);

        return () => clearInterval(interval);
    }, [messages, group.id, scrollToBottom]);

    // Load older messages
    const loadMore = async () => {
        if (loadingMore || !hasMore || messages.length === 0) return;
        setLoadingMore(true);
        const firstId = messages[0]?.id;

        try {
            const container = messagesContainerRef.current;
            const prevHeight = container?.scrollHeight || 0;

            const res = await fetch(
                route('org.org-groups.chat.messages', { groupId: group.id }) + `?before_id=${firstId}`
            );
            const olderMsgs: ChatMessage[] = await res.json();

            if (olderMsgs.length < 50) setHasMore(false);
            if (olderMsgs.length > 0) {
                setMessages(prev => [...olderMsgs, ...prev]);
                // Maintain scroll position
                requestAnimationFrame(() => {
                    if (container) {
                        container.scrollTop = container.scrollHeight - prevHeight;
                    }
                });
            }
        } catch {} finally {
            setLoadingMore(false);
        }
    };

    // Send message
    const handleSend = async () => {
        if ((!messageText.trim() && !attachment) || sending) return;
        setSending(true);

        try {
            const formData = new FormData();
            if (messageText.trim()) formData.append('message', messageText.trim());
            if (replyingTo) formData.append('reply_to_id', replyingTo.id.toString());
            if (attachment) formData.append('attachment', attachment);

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const res = await fetch(route('org.org-groups.chat.send', { groupId: group.id }), {
                method: 'POST',
                body: formData,
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });

            if (res.ok) {
                const newMsg: ChatMessage = await res.json();
                setMessages(prev => [...prev, newMsg]);
                setMessageText('');
                setReplyingTo(null);
                setAttachment(null);
                setTimeout(() => scrollToBottom(), 50);
                inputRef.current?.focus();
            }
        } catch {} finally {
            setSending(false);
        }
    };

    // Delete message
    const handleDelete = async (messageId: number) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        try {
            const res = await fetch(
                route('org.org-groups.chat.delete', { groupId: group.id, messageId }),
                { method: 'DELETE', headers: { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/json' } }
            );
            if (res.ok) {
                setMessages(prev => prev.filter(m => m.id !== messageId));
                setPinnedMessages(prev => prev.filter(m => m.id !== messageId));
            }
        } catch {}
    };

    // Toggle pin
    const handleTogglePin = async (messageId: number) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        try {
            const res = await fetch(
                route('org.org-groups.chat.toggle-pin', { groupId: group.id, messageId }),
                { method: 'POST', headers: { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/json' } }
            );
            if (res.ok) {
                const result = await res.json();
                setMessages(prev => prev.map(m =>
                    m.id === messageId ? { ...m, is_pinned: result.action === 'pinned' } : m
                ));
                if (result.action === 'pinned') {
                    const msg = messages.find(m => m.id === messageId);
                    if (msg) setPinnedMessages(prev => [{ ...msg, is_pinned: true }, ...prev]);
                } else {
                    setPinnedMessages(prev => prev.filter(m => m.id !== messageId));
                }
            }
        } catch {}
    };

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ─── Poll handlers ──────────────────────────
    const loadPolls = async () => {
        setShowPolls(true); setShowPinned(false); setShowMembers(false);
        setPollsLoading(true);
        try {
            const res = await fetch(route('org.org-groups.polls', { groupId: group.id }));
            const data = await res.json();
            setPolls(data);
        } catch {} finally { setPollsLoading(false); }
    };

    const handleCreatePoll = async () => {
        const validOptions = pollOptions.filter(o => o.trim());
        if (!pollQuestion.trim() || validOptions.length < 2) return;
        setPollSubmitting(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        try {
            const res = await fetch(route('org.org-groups.polls.store', { groupId: group.id }), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: pollQuestion, description: pollDescription || null,
                    poll_type: pollType, is_anonymous: pollAnonymous,
                    show_results_before_vote: pollShowResults,
                    options: validOptions, expires_at: pollExpiry || null,
                }),
            });
            if (res.ok) {
                const newPoll = await res.json();
                setPolls(prev => [newPoll, ...prev]);
                setShowCreatePoll(false);
                setPollQuestion(''); setPollDescription(''); setPollType('single');
                setPollAnonymous(false); setPollShowResults(true); setPollExpiry('');
                setPollOptions(['', '']);
            }
        } catch {} finally { setPollSubmitting(false); }
    };

    const handleVote = async (pollId: number, optionIds: number[]) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        try {
            const res = await fetch(route('org.org-groups.polls.vote', { groupId: group.id, pollId }), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/json' },
                body: JSON.stringify({ option_ids: optionIds }),
            });
            if (res.ok) {
                const updated = await res.json();
                setPolls(prev => prev.map(p => p.id === pollId ? updated : p));
            }
        } catch {}
    };

    const handleClosePoll = async (pollId: number) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        try {
            const res = await fetch(route('org.org-groups.polls.close', { groupId: group.id, pollId }), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                const updated = await res.json();
                setPolls(prev => prev.map(p => p.id === pollId ? updated : p));
            }
        } catch {}
    };

    const handleDeletePoll = async (pollId: number) => {
        if (!confirm('Delete this poll? This cannot be undone.')) return;
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        try {
            const res = await fetch(route('org.org-groups.polls.destroy', { groupId: group.id, pollId }), {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                setPolls(prev => prev.filter(p => p.id !== pollId));
            }
        } catch {}
    };

    // Format time
    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = d.toDateString() === yesterday.toDateString();

        const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (isToday) return time;
        if (isYesterday) return `Yesterday ${time}`;
        return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
    };

    // Group messages by date
    const getDateLabel = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) return 'Today';
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    // Build date separators
    let lastDateLabel = '';

    return (
        <OrgLayout>
            <div style={{
                display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)',
                background: bg, borderRadius: '14px', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
            }}>
                {/* ── Chat Header ─────────────────────────────── */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '1rem 1.25rem', background: cardBg,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    flexShrink: 0,
                }}>
                    <a href={route('org.org-groups.index')} style={{
                        background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px',
                        padding: '0.4rem', cursor: 'pointer', color: '#888', display: 'flex',
                        textDecoration: 'none',
                    }}>
                        <ArrowLeft size={18} />
                    </a>
                    <div style={{
                        width: '38px', height: '38px', borderRadius: '10px',
                        background: `linear-gradient(135deg, ${accent}, #6D28D9)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <Users size={18} color="#fff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                            {group.name}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#666' }}>
                            {group.active_members_count} member{group.active_members_count !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {pinnedMessages.length > 0 && (
                            <button onClick={() => { setShowPinned(!showPinned); setShowMembers(false); }}
                                style={{
                                    ...headerBtnStyle, position: 'relative',
                                    color: showPinned ? accent : '#888',
                                    background: showPinned ? `${accent}15` : 'rgba(255,255,255,0.05)',
                                }}>
                                <Pin size={16} />
                                <span style={{
                                    position: 'absolute', top: '-2px', right: '-2px',
                                    background: accent, color: '#fff', borderRadius: '50%',
                                    width: '14px', height: '14px', fontSize: '0.6rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700,
                                }}>
                                    {pinnedMessages.length}
                                </span>
                            </button>
                        )}
                        <button onClick={() => { if (!showPolls) loadPolls(); else setShowPolls(false); setShowPinned(false); setShowMembers(false); }}
                            style={{
                                ...headerBtnStyle,
                                color: showPolls ? '#F59E0B' : '#888',
                                background: showPolls ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.05)',
                            }}>
                            <BarChart3 size={16} />
                        </button>
                        <button onClick={() => { setShowMembers(!showMembers); setShowPinned(false); setShowPolls(false); }}
                            style={{
                                ...headerBtnStyle,
                                color: showMembers ? accent : '#888',
                                background: showMembers ? `${accent}15` : 'rgba(255,255,255,0.05)',
                            }}>
                            <Users size={16} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* ── Messages Area ─────────────────────────── */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            style={{
                                flex: 1, overflowY: 'auto', padding: '1rem 1.25rem',
                                display: 'flex', flexDirection: 'column', gap: '0.15rem',
                                scrollbarWidth: 'thin' as const,
                                scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                            }}
                        >
                            {/* Load more */}
                            {hasMore && (
                                <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
                                    <button onClick={loadMore} disabled={loadingMore} style={{
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '8px', padding: '0.4rem 1rem', color: '#888',
                                        fontSize: '0.78rem', cursor: loadingMore ? 'wait' : 'pointer',
                                    }}>
                                        {loadingMore ? 'Loading...' : 'Load older messages'}
                                    </button>
                                </div>
                            )}

                            {messages.length === 0 && (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Users size={40} color="#333" style={{ marginBottom: '0.75rem' }} />
                                        <p style={{ color: '#555', fontSize: '0.9rem', margin: 0 }}>No messages yet</p>
                                        <p style={{ color: '#444', fontSize: '0.78rem', margin: '0.25rem 0 0' }}>
                                            Start the conversation!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, idx) => {
                                const dateLabel = getDateLabel(msg.created_at);
                                const showDate = dateLabel !== lastDateLabel;
                                lastDateLabel = dateLabel;

                                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                                const isSameUser = prevMsg && prevMsg.user?.id === msg.user?.id
                                    && !showDate
                                    && (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) < 300000;

                                return (
                                    <div key={msg.id}>
                                        {showDate && (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                padding: '0.75rem 0', margin: '0.5rem 0',
                                            }}>
                                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                                <span style={{ fontSize: '0.68rem', color: '#555', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                    {dateLabel}
                                                </span>
                                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                            </div>
                                        )}
                                        <MessageBubble
                                            msg={msg}
                                            compact={!!isSameUser}
                                            formatTime={formatTime}
                                            onReply={() => { setReplyingTo(msg); inputRef.current?.focus(); }}
                                            onDelete={() => handleDelete(msg.id)}
                                            onTogglePin={() => handleTogglePin(msg.id)}
                                        />
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Scroll to bottom button */}
                        {showScrollDown && (
                            <button onClick={() => scrollToBottom()} style={{
                                position: 'absolute', bottom: '1rem', right: '1.5rem',
                                background: accent, border: 'none', borderRadius: '50%',
                                width: '36px', height: '36px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
                                zIndex: 5,
                            }}>
                                <ChevronDown size={18} color="#fff" />
                            </button>
                        )}

                        {/* ── Input Area ─────────────────────────── */}
                        {isSuspended && (
                            <div style={{
                                padding: '0.6rem 1.25rem', background: 'rgba(239,68,68,0.06)',
                                borderTop: '1px solid rgba(239,68,68,0.15)',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                            }}>
                                <PauseCircle size={14} color="#EF4444" />
                                <span style={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: 500 }}>
                                    This group is suspended{suspensionReason ? `: ${suspensionReason}` : ''}
                                </span>
                            </div>
                        )}
                        <div style={{
                            padding: '0.75rem 1.25rem', background: cardBg,
                            borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
                            opacity: isSuspended ? 0.5 : 1, pointerEvents: isSuspended ? 'none' : 'auto',
                        }}>
                            {/* Reply indicator */}
                            {replyingTo && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 0.75rem', marginBottom: '0.5rem',
                                    background: `${accent}08`, borderLeft: `3px solid ${accent}`,
                                    borderRadius: '0 8px 8px 0',
                                }}>
                                    <Reply size={14} color={accent} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <span style={{ fontSize: '0.7rem', color: accent, fontWeight: 600 }}>
                                            {replyingTo.user?.first_name} {replyingTo.user?.last_name}
                                        </span>
                                        <p style={{
                                            margin: '1px 0 0', fontSize: '0.75rem', color: '#888',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {replyingTo.message || '[Attachment]'}
                                        </p>
                                    </div>
                                    <button onClick={() => setReplyingTo(null)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#666', padding: '2px', display: 'flex',
                                    }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            {/* Attachment preview */}
                            {attachment && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.4rem 0.75rem', marginBottom: '0.5rem',
                                    background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                }}>
                                    <Paperclip size={14} color="#888" />
                                    <span style={{ flex: 1, fontSize: '0.78rem', color: '#bbb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {attachment.name}
                                    </span>
                                    <span style={{ fontSize: '0.68rem', color: '#555' }}>
                                        {(attachment.size / 1024).toFixed(0)}KB
                                    </span>
                                    <button onClick={() => setAttachment(null)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#666', padding: '2px', display: 'flex',
                                    }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) setAttachment(file);
                                        e.target.value = '';
                                    }}
                                />
                                <button onClick={() => fileInputRef.current?.click()} style={{
                                    background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px',
                                    padding: '0.6rem', cursor: 'pointer', color: '#888', display: 'flex',
                                    flexShrink: 0, alignSelf: 'flex-end',
                                }}>
                                    <Paperclip size={18} />
                                </button>
                                <textarea
                                    ref={inputRef}
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    rows={1}
                                    style={{
                                        flex: 1, background: inputBg, border: '1px solid rgba(139,92,246,0.15)',
                                        borderRadius: '12px', padding: '0.65rem 1rem', color: '#fff',
                                        fontSize: '0.88rem', outline: 'none', resize: 'none',
                                        maxHeight: '120px', minHeight: '40px',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)'; }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={(!messageText.trim() && !attachment) || sending}
                                    style={{
                                        background: `linear-gradient(135deg, ${accent}, #6D28D9)`,
                                        border: 'none', borderRadius: '10px', padding: '0.6rem',
                                        cursor: (!messageText.trim() && !attachment) || sending ? 'not-allowed' : 'pointer',
                                        opacity: (!messageText.trim() && !attachment) || sending ? 0.5 : 1,
                                        color: '#fff', display: 'flex', flexShrink: 0,
                                        alignSelf: 'flex-end', transition: 'opacity 0.15s',
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar: Pinned / Members / Polls ────── */}
                    {(showPinned || showMembers || showPolls) && (
                        <div style={{
                            width: showPolls ? '360px' : '280px', background: cardBg,
                            borderLeft: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', flexDirection: 'column',
                            flexShrink: 0, overflow: 'hidden', transition: 'width 0.2s',
                        }}>
                            <div style={{
                                padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#e0e0e0' }}>
                                    {showPinned ? 'Pinned Messages' : showPolls ? 'Polls' : 'Members'}
                                </p>
                                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    {showPolls && (
                                        <button onClick={() => setShowCreatePoll(true)} style={{
                                            background: `${accent}15`, border: 'none', borderRadius: '6px',
                                            padding: '4px 8px', cursor: 'pointer', color: accent,
                                            fontSize: '0.7rem', fontWeight: 600, display: 'flex',
                                            alignItems: 'center', gap: '3px',
                                        }}>
                                            <Plus size={12} /> New
                                        </button>
                                    )}
                                    <button onClick={() => { setShowPinned(false); setShowMembers(false); setShowPolls(false); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '2px', display: 'flex' }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                                {showPinned && pinnedMessages.map(msg => (
                                    <div key={msg.id} style={{
                                        padding: '0.6rem 0.75rem', marginBottom: '0.4rem',
                                        background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.72rem', color: accent, fontWeight: 600 }}>
                                            {msg.user?.first_name} {msg.user?.last_name}
                                        </p>
                                        <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#ccc', lineHeight: 1.4 }}>
                                            {msg.message || '[Attachment]'}
                                        </p>
                                        <p style={{ margin: '3px 0 0', fontSize: '0.65rem', color: '#555' }}>
                                            {formatTime(msg.created_at)}
                                        </p>
                                    </div>
                                ))}

                                {showMembers && (
                                    <>
                                        {group.members.filter(m => m.is_leader).length > 0 && (
                                            <p style={{
                                                fontSize: '0.65rem', fontWeight: 700, color: '#F59E0B',
                                                textTransform: 'uppercase', letterSpacing: '0.05em',
                                                margin: '0.5rem 0.5rem 0.4rem', padding: 0,
                                            }}>
                                                Leadership
                                            </p>
                                        )}
                                        {group.members.filter(m => m.is_leader).map(m => (
                                            <MemberItem key={m.id} member={m} />
                                        ))}
                                        {group.members.filter(m => !m.is_leader).length > 0 && (
                                            <p style={{
                                                fontSize: '0.65rem', fontWeight: 700, color: '#888',
                                                textTransform: 'uppercase', letterSpacing: '0.05em',
                                                margin: '0.75rem 0.5rem 0.4rem', padding: 0,
                                            }}>
                                                Members ({group.members.filter(m => !m.is_leader).length})
                                            </p>
                                        )}
                                        {group.members.filter(m => !m.is_leader).map(m => (
                                            <MemberItem key={m.id} member={m} />
                                        ))}
                                    </>
                                )}

                                {showPolls && (
                                    <>
                                        {/* Create Poll Form */}
                                        {showCreatePoll && (
                                            <div style={{
                                                background: 'rgba(139,92,246,0.04)', border: `1px solid ${accent}25`,
                                                borderRadius: '10px', padding: '0.85rem', marginBottom: '0.75rem',
                                            }}>
                                                <input type="text" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)}
                                                    placeholder="Ask a question..."
                                                    style={{ ...sidebarInputStyle, fontWeight: 600, marginBottom: '0.5rem' }} />
                                                <textarea value={pollDescription} onChange={e => setPollDescription(e.target.value)}
                                                    placeholder="Description (optional)" rows={2}
                                                    style={{ ...sidebarInputStyle, resize: 'none' as const, marginBottom: '0.5rem' }} />

                                                {/* Options */}
                                                <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#888', margin: '0 0 0.3rem', textTransform: 'uppercase' }}>
                                                    Options
                                                </p>
                                                {pollOptions.map((opt, i) => (
                                                    <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.3rem' }}>
                                                        <input type="text" value={opt}
                                                            onChange={e => {
                                                                const next = [...pollOptions];
                                                                next[i] = e.target.value;
                                                                setPollOptions(next);
                                                            }}
                                                            placeholder={`Option ${i + 1}`}
                                                            style={{ ...sidebarInputStyle, flex: 1 }} />
                                                        {pollOptions.length > 2 && (
                                                            <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                                                                style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                                                                <X size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {pollOptions.length < 10 && (
                                                    <button onClick={() => setPollOptions([...pollOptions, ''])}
                                                        style={{
                                                            background: 'none', border: '1px dashed rgba(255,255,255,0.1)',
                                                            borderRadius: '6px', padding: '0.3rem', width: '100%',
                                                            color: '#666', fontSize: '0.72rem', cursor: 'pointer',
                                                            marginBottom: '0.5rem',
                                                        }}>
                                                        + Add option
                                                    </button>
                                                )}

                                                {/* Settings */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.4rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                        {(['single', 'multiple'] as const).map(t => (
                                                            <button key={t} onClick={() => setPollType(t)} style={{
                                                                flex: 1, padding: '0.35rem', borderRadius: '6px', fontSize: '0.7rem',
                                                                fontWeight: 500, cursor: 'pointer', border: 'none',
                                                                background: pollType === t ? `${accent}18` : 'rgba(255,255,255,0.03)',
                                                                color: pollType === t ? accent : '#666',
                                                            }}>
                                                                {t === 'single' ? 'Single choice' : 'Multiple choice'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.72rem', color: '#888' }}>
                                                        <input type="checkbox" checked={pollAnonymous} onChange={e => setPollAnonymous(e.target.checked)}
                                                            style={{ accentColor: accent, width: '13px', height: '13px' }} />
                                                        Anonymous voting
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.72rem', color: '#888' }}>
                                                        <input type="checkbox" checked={pollShowResults} onChange={e => setPollShowResults(e.target.checked)}
                                                            style={{ accentColor: accent, width: '13px', height: '13px' }} />
                                                        Show results before voting
                                                    </label>
                                                    <div>
                                                        <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>Expires</label>
                                                        <input type="datetime-local" value={pollExpiry} onChange={e => setPollExpiry(e.target.value)}
                                                            style={{ ...sidebarInputStyle, fontSize: '0.72rem', padding: '0.35rem 0.5rem' }} />
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end', marginTop: '0.6rem' }}>
                                                    <button onClick={() => setShowCreatePoll(false)} style={{
                                                        padding: '0.35rem 0.75rem', borderRadius: '6px',
                                                        background: 'rgba(255,255,255,0.05)', border: 'none',
                                                        color: '#888', fontSize: '0.72rem', cursor: 'pointer',
                                                    }}>Cancel</button>
                                                    <button onClick={handleCreatePoll}
                                                        disabled={pollSubmitting || !pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}
                                                        style={{
                                                            padding: '0.35rem 0.75rem', borderRadius: '6px',
                                                            background: `linear-gradient(135deg, ${accent}, #6D28D9)`,
                                                            border: 'none', color: '#fff', fontSize: '0.72rem',
                                                            fontWeight: 600, cursor: 'pointer',
                                                            opacity: pollSubmitting || !pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2 ? 0.5 : 1,
                                                        }}>
                                                        {pollSubmitting ? 'Creating...' : 'Create Poll'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Polls list */}
                                        {pollsLoading ? (
                                            <p style={{ color: '#666', textAlign: 'center', padding: '1.5rem', fontSize: '0.82rem' }}>Loading...</p>
                                        ) : polls.length > 0 ? polls.map(poll => (
                                            <PollCard key={poll.id} poll={poll}
                                                onVote={(optionIds) => handleVote(poll.id, optionIds)}
                                                onClose={() => handleClosePoll(poll.id)}
                                                onDelete={() => handleDeletePoll(poll.id)}
                                            />
                                        )) : !showCreatePoll && (
                                            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                                                <BarChart3 size={28} color="#333" style={{ marginBottom: '0.5rem' }} />
                                                <p style={{ color: '#555', fontSize: '0.8rem', margin: 0 }}>No polls yet</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </OrgLayout>
    );
}

// ─── Sub-components ──────────────────────────────────────────────

function MessageBubble({ msg, compact, formatTime, onReply, onDelete, onTogglePin }: {
    msg: ChatMessage;
    compact: boolean;
    formatTime: (d: string) => string;
    onReply: () => void;
    onDelete: () => void;
    onTogglePin: () => void;
}) {
    const [showActions, setShowActions] = useState(false);

    return (
        <div
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            style={{
                display: 'flex', gap: '0.6rem', padding: `${compact ? '0.1rem' : '0.45rem'} 0.5rem`,
                borderRadius: '8px', transition: 'background 0.1s', position: 'relative',
                background: msg.is_pinned ? 'rgba(139,92,246,0.04)' : 'transparent',
                borderLeft: msg.is_pinned ? `2px solid ${accent}` : '2px solid transparent',
            }}
        >
            {/* Avatar */}
            {!compact ? (
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: `${accent}18`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 600, color: accent, overflow: 'hidden',
                    marginTop: '2px',
                }}>
                    {msg.user?.profile_image
                        ? <img src={msg.user.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : msg.user?.first_name?.charAt(0).toUpperCase() || '?'
                    }
                </div>
            ) : (
                <div style={{ width: '32px', flexShrink: 0 }} />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Name + time */}
                {!compact && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e0e0e0' }}>
                            {msg.user?.first_name} {msg.user?.last_name}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#555' }}>
                            {formatTime(msg.created_at)}
                        </span>
                        {msg.is_pinned && (
                            <Pin size={10} color={accent} style={{ marginLeft: '2px' }} />
                        )}
                    </div>
                )}

                {/* Reply reference */}
                {msg.reply_to && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.25rem 0.5rem', marginBottom: '3px',
                        borderLeft: '2px solid rgba(255,255,255,0.15)',
                        borderRadius: '0 4px 4px 0',
                    }}>
                        <span style={{ fontSize: '0.68rem', color: '#888' }}>
                            {msg.reply_to.is_deleted ? (
                                <em style={{ color: '#555' }}>Message deleted</em>
                            ) : (
                                <>
                                    <span style={{ fontWeight: 600, color: accent }}>
                                        {msg.reply_to.user?.first_name}
                                    </span>{' '}
                                    {msg.reply_to.message?.substring(0, 80) || '[Attachment]'}
                                    {(msg.reply_to.message?.length || 0) > 80 && '...'}
                                </>
                            )}
                        </span>
                    </div>
                )}

                {/* Message text */}
                {msg.message && (
                    <p style={{
                        margin: 0, fontSize: '0.85rem', color: '#d0d0d0',
                        lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    }}>
                        {msg.message}
                    </p>
                )}

                {/* Attachment */}
                {msg.attachment_url && (
                    <div style={{ marginTop: msg.message ? '0.4rem' : 0 }}>
                        {msg.message_type === 'image' ? (
                            <img src={msg.attachment_url} alt={msg.attachment_name || ''}
                                style={{
                                    maxWidth: '320px', maxHeight: '240px', borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    cursor: 'pointer',
                                }}
                                onClick={() => window.open(msg.attachment_url!, '_blank')}
                            />
                        ) : (
                            <a href={msg.attachment_url} target="_blank" rel="noreferrer"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                    padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                                    textDecoration: 'none', color: '#bbb', fontSize: '0.8rem',
                                    transition: 'background 0.15s',
                                }}
                            >
                                <File size={14} color="#888" />
                                <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {msg.attachment_name || 'Download'}
                                </span>
                                <Download size={12} color="#666" />
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            {showActions && (
                <div style={{
                    position: 'absolute', top: '-8px', right: '0.5rem',
                    display: 'flex', gap: '2px', padding: '3px',
                    background: '#1a1a2e', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}>
                    <ActionBtn icon={<Reply size={13} />} title="Reply" onClick={onReply} />
                    <ActionBtn icon={msg.is_pinned ? <PinOff size={13} /> : <Pin size={13} />}
                        title={msg.is_pinned ? 'Unpin' : 'Pin'} onClick={onTogglePin} />
                    <ActionBtn icon={<Trash2 size={13} />} title="Delete" onClick={onDelete} color="#EF4444" />
                </div>
            )}
        </div>
    );
}

function ActionBtn({ icon, title, onClick, color }: {
    icon: React.ReactNode; title: string; onClick: () => void; color?: string;
}) {
    return (
        <button onClick={onClick} title={title} style={{
            background: 'none', border: 'none', borderRadius: '6px', padding: '4px 6px',
            cursor: 'pointer', color: color || '#888', display: 'flex',
            alignItems: 'center', transition: 'background 0.1s',
        }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
        >
            {icon}
        </button>
    );
}

function MemberItem({ member }: { member: GroupMember }) {
    const roleColors: Record<string, string> = {
        president: '#F59E0B', vice_president: '#8B5CF6', secretary: '#3B82F6',
        treasurer: '#10B981', pro: '#EC4899', social_director: '#F97316', member: '#6B7280',
    };
    const roleLabels: Record<string, string> = {
        president: 'President', vice_president: 'Vice President', secretary: 'Secretary',
        treasurer: 'Treasurer', pro: 'PRO', social_director: 'Social Director', member: 'Member',
    };
    const color = roleColors[member.role] || '#6B7280';

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.45rem 0.5rem', borderRadius: '8px',
            transition: 'background 0.1s',
        }}>
            <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: `${accent}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 600, color: accent, overflow: 'hidden',
            }}>
                {member.profile_image
                    ? <img src={member.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : member.first_name.charAt(0).toUpperCase()
                }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#e0e0e0', fontWeight: 500 }}>
                    {member.first_name} {member.last_name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ fontSize: '0.65rem', color: '#555' }}>@{member.username}</span>
                    {member.role !== 'member' && (
                        <span style={{
                            fontSize: '0.55rem', fontWeight: 700, color,
                            background: `${color}15`, padding: '0.5px 4px', borderRadius: '3px',
                        }}>
                            {roleLabels[member.role] || member.role}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function PollCard({ poll, onVote, onClose, onDelete }: {
    poll: Poll;
    onVote: (optionIds: number[]) => void;
    onClose: () => void;
    onDelete: () => void;
}) {
    const [selectedOptions, setSelectedOptions] = useState<number[]>(poll.user_votes || []);
    const canSeeResults = poll.has_voted || poll.show_results_before_vote || poll.is_closed;

    const toggleOption = (optionId: number) => {
        if (poll.is_closed) return;
        if (poll.poll_type === 'single') {
            setSelectedOptions([optionId]);
            onVote([optionId]);
        } else {
            const next = selectedOptions.includes(optionId)
                ? selectedOptions.filter(id => id !== optionId)
                : [...selectedOptions, optionId];
            setSelectedOptions(next);
            onVote([optionId]); // Toggle individually
        }
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
            d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px', padding: '0.85rem', marginBottom: '0.5rem',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#e0e0e0', flex: 1 }}>
                    {poll.question}
                </p>
                <div style={{ display: 'flex', gap: '2px', flexShrink: 0, marginLeft: '0.3rem' }}>
                    {!poll.is_closed && (
                        <button onClick={onClose} title="Close poll" style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#F59E0B', padding: '2px', display: 'flex',
                        }}>
                            <Lock size={12} />
                        </button>
                    )}
                    <button onClick={onDelete} title="Delete poll" style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#EF4444', padding: '2px', display: 'flex',
                    }}>
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {poll.description && (
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888', lineHeight: 1.4 }}>
                    {poll.description}
                </p>
            )}

            {/* Meta badges */}
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span style={pollBadgeStyle}>
                    {poll.poll_type === 'single' ? 'Single choice' : 'Multiple choice'}
                </span>
                {poll.is_anonymous && <span style={pollBadgeStyle}><EyeOff size={9} /> Anonymous</span>}
                {poll.is_closed && (
                    <span style={{ ...pollBadgeStyle, color: '#EF4444', background: 'rgba(239,68,68,0.1)' }}>
                        {poll.is_expired ? 'Expired' : 'Closed'}
                    </span>
                )}
                {poll.expires_at && !poll.is_expired && (
                    <span style={pollBadgeStyle}>
                        <Clock size={9} /> {formatTime(poll.expires_at)}
                    </span>
                )}
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {poll.options.map(opt => {
                    const isSelected = selectedOptions.includes(opt.id);
                    const showBar = canSeeResults;

                    return (
                        <button key={opt.id} onClick={() => toggleOption(opt.id)}
                            disabled={poll.is_closed}
                            style={{
                                position: 'relative', display: 'flex', alignItems: 'center',
                                gap: '0.4rem', padding: '0.45rem 0.6rem', borderRadius: '8px',
                                background: isSelected ? `${accent}12` : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${isSelected ? `${accent}35` : 'rgba(255,255,255,0.06)'}`,
                                cursor: poll.is_closed ? 'default' : 'pointer',
                                textAlign: 'left' as const, overflow: 'hidden',
                                transition: 'all 0.15s',
                            }}
                        >
                            {/* Progress bar */}
                            {showBar && (
                                <div style={{
                                    position: 'absolute', left: 0, top: 0, bottom: 0,
                                    width: `${opt.percentage}%`,
                                    background: isSelected ? `${accent}15` : 'rgba(255,255,255,0.03)',
                                    borderRadius: '8px', transition: 'width 0.3s ease',
                                }} />
                            )}

                            {/* Radio/check */}
                            <div style={{
                                width: '14px', height: '14px', borderRadius: poll.poll_type === 'single' ? '50%' : '3px',
                                border: `2px solid ${isSelected ? accent : '#555'}`,
                                background: isSelected ? accent : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, position: 'relative', zIndex: 1,
                            }}>
                                {isSelected && <CheckCircle2 size={10} color="#fff" />}
                            </div>

                            <span style={{
                                fontSize: '0.78rem', color: isSelected ? '#e0e0e0' : '#bbb',
                                fontWeight: isSelected ? 600 : 400, flex: 1,
                                position: 'relative', zIndex: 1,
                            }}>
                                {opt.label}
                            </span>

                            {showBar && (
                                <span style={{
                                    fontSize: '0.68rem', fontWeight: 600,
                                    color: isSelected ? accent : '#666',
                                    position: 'relative', zIndex: 1,
                                }}>
                                    {opt.percentage}%
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.68rem', color: '#555' }}>
                    {poll.total_voters} voter{poll.total_voters !== 1 ? 's' : ''} &middot; {poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#444' }}>
                    {poll.creator?.first_name} {poll.creator?.last_name}
                </span>
            </div>
        </div>
    );
}

const pollBadgeStyle: React.CSSProperties = {
    fontSize: '0.6rem', fontWeight: 600, color: '#888',
    background: 'rgba(255,255,255,0.05)', padding: '1px 5px',
    borderRadius: '4px', display: 'inline-flex',
    alignItems: 'center', gap: '3px',
};

const sidebarInputStyle: React.CSSProperties = {
    width: '100%', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff',
    fontSize: '0.78rem', outline: 'none',
};

const headerBtnStyle: React.CSSProperties = {
    border: 'none', borderRadius: '8px', padding: '0.45rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'all 0.15s',
};
