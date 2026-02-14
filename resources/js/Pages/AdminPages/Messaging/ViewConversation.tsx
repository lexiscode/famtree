import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    MessageSquare,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
} from 'lucide-react';

interface MessageSender {
    id: number;
    full_name: string;
    username: string;
}

interface Message {
    id: number;
    content: string;
    sender: MessageSender | null;
    is_read: boolean;
    created_at: string;
    created_at_formatted: string;
}

interface ConversationUser {
    id: number;
    full_name: string;
    username: string;
}

interface ConversationData {
    id: number;
    user_one: ConversationUser;
    user_two: ConversationUser;
}

interface PaginatedMessages {
    data: Message[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    conversation: ConversationData;
    messages: PaginatedMessages;
}

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

export default function ViewConversation({ conversation, messages }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const handleDeleteMessage = (messageId: number) => {
        if (confirm('Are you sure you want to delete this message?')) {
            router.delete(route('admin.messaging.deleteMessage', messageId), { preserveScroll: true });
        }
    };

    const handlePageChange = (page: number) => {
        router.get(route('admin.messaging.viewConversation', conversation.id), { page }, { preserveScroll: true });
    };

    const generatePageNumbers = () => {
        const pages: number[] = [];
        const current = messages.current_page;
        const last = messages.last_page;

        let start = Math.max(1, current - 2);
        let end = Math.min(last, current + 2);

        if (current <= 3) {
            end = Math.min(last, 5);
        }
        if (current >= last - 2) {
            start = Math.max(1, last - 4);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const isUserOne = (sender: MessageSender | null) => {
        return sender && sender.id === conversation.user_one.id;
    };

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Flash Messages */}
                {flash?.success && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            background: '#e8f5e9',
                            border: `2px solid ${THEME.success}`,
                            color: THEME.success,
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            background: '#ffebee',
                            border: `2px solid ${THEME.danger}`,
                            color: THEME.danger,
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Header with Back Button */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <button
                            onClick={() => router.get(route('admin.messaging.conversations'))}
                            style={{
                                background: '#E7F5FF',
                                border: '2px solid #cfe2ff',
                                padding: '0.65rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                color: THEME.primary,
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = THEME.primary;
                                e.currentTarget.style.color = '#FFFFFF';
                                e.currentTarget.style.borderColor = THEME.primary;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#E7F5FF';
                                e.currentTarget.style.color = THEME.primary;
                                e.currentTarget.style.borderColor = '#cfe2ff';
                            }}
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>
                                Conversation Details
                            </h1>
                            <p style={{ fontSize: '0.98rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>
                                Read-only view of private messages
                            </p>
                        </div>
                    </div>
                </div>

                {/* Participants Card */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        padding: '2rem',
                        marginBottom: '2.5rem',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={20} color={THEME.primary} /> Participants
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.85rem',
                                padding: '1rem 1.5rem',
                                background: '#e7f1ff',
                                borderRadius: '14px',
                                border: '2px solid #cfe2ff',
                            }}
                        >
                            <div
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
                                    color: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                }}
                            >
                                {conversation.user_one.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                    {conversation.user_one.full_name}
                                </p>
                                <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: 0, marginTop: '0.2rem', fontWeight: 500 }}>
                                    @{conversation.user_one.username}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={20} color={THEME.secondary} />
                            <span style={{ fontSize: '0.92rem', color: THEME.secondary, fontWeight: 600 }}>
                                {messages.total} messages
                            </span>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.85rem',
                                padding: '1rem 1.5rem',
                                background: '#e8f5e9',
                                borderRadius: '14px',
                                border: '2px solid #c8e6c9',
                            }}
                        >
                            <div
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #198754 0%, #157347 100%)',
                                    color: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                }}
                            >
                                {conversation.user_two.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>
                                    {conversation.user_two.full_name}
                                </p>
                                <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: 0, marginTop: '0.2rem', fontWeight: 500 }}>
                                    @{conversation.user_two.username}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        padding: '2rem',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <MessageSquare size={20} color={THEME.info} /> Messages
                    </h3>

                    {messages.data.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.data.map((message) => {
                                const isSenderOne = isUserOne(message.sender);
                                const senderName = message.sender ? message.sender.full_name : 'System';
                                const senderUsername = message.sender ? message.sender.username : '';

                                return (
                                    <div
                                        key={message.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: isSenderOne ? 'flex-start' : 'flex-end',
                                        }}
                                    >
                                        <div
                                            style={{
                                                maxWidth: '70%',
                                                minWidth: '280px',
                                                padding: '1.25rem',
                                                borderRadius: isSenderOne ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                                                background: isSenderOne ? '#F3F4F6' : '#e7f1ff',
                                                border: `1.5px solid ${isSenderOne ? '#E5E7EB' : '#cfe2ff'}`,
                                                transition: 'all 0.3s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = isSenderOne ? '#D1D5DB' : THEME.primary;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = isSenderOne ? '#E5E7EB' : '#cfe2ff';
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0a0e27' }}>
                                                        {senderName}
                                                    </span>
                                                    {senderUsername && (
                                                        <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 500 }}>
                                                            @{senderUsername}
                                                        </span>
                                                    )}
                                                    {!message.is_read && (
                                                        <span
                                                            style={{
                                                                display: 'inline-block',
                                                                padding: '0.2rem 0.5rem',
                                                                borderRadius: '6px',
                                                                fontSize: '0.72rem',
                                                                fontWeight: 700,
                                                                backgroundColor: '#fff3e0',
                                                                color: '#FF9800',
                                                                border: '1px solid #ffe0b2',
                                                            }}
                                                        >
                                                            Unread
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteMessage(message.id)}
                                                    style={{
                                                        padding: '0.35rem 0.65rem',
                                                        background: '#ffebee',
                                                        color: THEME.danger,
                                                        border: '1.5px solid #ffcdd2',
                                                        borderRadius: '6px',
                                                        fontSize: '0.78rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.3rem',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = THEME.danger;
                                                        e.currentTarget.style.color = '#FFFFFF';
                                                        e.currentTarget.style.borderColor = THEME.danger;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#ffebee';
                                                        e.currentTarget.style.color = THEME.danger;
                                                        e.currentTarget.style.borderColor = '#ffcdd2';
                                                    }}
                                                >
                                                    <Trash2 size={12} />
                                                    Delete
                                                </button>
                                            </div>

                                            <p style={{ margin: 0, fontSize: '0.94rem', color: '#374151', lineHeight: 1.7, fontWeight: 500 }}>
                                                {message.content}
                                            </p>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem' }}>
                                                <Clock size={12} color="#9CA3AF" />
                                                <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 500 }}>
                                                    {message.created_at_formatted}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: '#F3F4F6',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                }}
                            >
                                <MessageSquare size={40} color="#D1D5DB" strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '0.5rem' }}>
                                No messages in this conversation
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>
                                This conversation does not contain any messages yet
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {messages.last_page > 1 && (
                    <div
                        style={{
                            marginTop: '2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#FFFFFF',
                            padding: '1.75rem 2rem',
                            borderRadius: '16px',
                            border: '2px solid #E5E7EB',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                            flexWrap: 'wrap',
                            gap: '1rem',
                        }}
                    >
                        <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#4B5563', margin: 0 }}>
                            Showing <span style={{ fontWeight: 800, color: '#0a0e27' }}>{messages.from}</span> to{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{messages.to}</span> of{' '}
                            <span style={{ fontWeight: 800, color: '#0a0e27' }}>{messages.total}</span> messages
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <button
                                onClick={() => handlePageChange(messages.current_page - 1)}
                                disabled={messages.current_page === 1}
                                style={{
                                    paddingLeft: '0.85rem',
                                    paddingRight: '0.85rem',
                                    paddingTop: '0.6rem',
                                    paddingBottom: '0.6rem',
                                    borderRadius: '10px',
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2.5px solid #e9ecef',
                                    cursor: messages.current_page === 1 ? 'not-allowed' : 'pointer',
                                    background: messages.current_page === 1 ? '#f9fafb' : '#f8f9fa',
                                    color: messages.current_page === 1 ? '#adb5bd' : '#0a0e27',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (messages.current_page !== 1) {
                                        e.currentTarget.style.background = '#e9ecef';
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (messages.current_page !== 1) {
                                        e.currentTarget.style.background = '#f8f9fa';
                                        e.currentTarget.style.borderColor = '#e9ecef';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                <ChevronLeft size={16} />
                                Prev
                            </button>

                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    style={{
                                        paddingLeft: '0.85rem',
                                        paddingRight: '0.85rem',
                                        paddingTop: '0.6rem',
                                        paddingBottom: '0.6rem',
                                        borderRadius: '10px',
                                        fontSize: '0.92rem',
                                        fontWeight: 700,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: `2.5px solid ${page === messages.current_page ? THEME.primary : '#e9ecef'}`,
                                        cursor: 'pointer',
                                        background: page === messages.current_page ? `linear-gradient(135deg, ${THEME.primary} 0%, #0a58ca 100%)` : '#f8f9fa',
                                        color: page === messages.current_page ? '#FFFFFF' : '#0a0e27',
                                        boxShadow: page === messages.current_page ? `0 4px 12px ${THEME.primary}25` : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                        minWidth: '44px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (page !== messages.current_page) {
                                            e.currentTarget.style.background = '#e9ecef';
                                            e.currentTarget.style.borderColor = THEME.primary;
                                            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (page !== messages.current_page) {
                                            e.currentTarget.style.background = '#f8f9fa';
                                            e.currentTarget.style.borderColor = '#e9ecef';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(messages.current_page + 1)}
                                disabled={messages.current_page === messages.last_page}
                                style={{
                                    paddingLeft: '0.85rem',
                                    paddingRight: '0.85rem',
                                    paddingTop: '0.6rem',
                                    paddingBottom: '0.6rem',
                                    borderRadius: '10px',
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2.5px solid #e9ecef',
                                    cursor: messages.current_page === messages.last_page ? 'not-allowed' : 'pointer',
                                    background: messages.current_page === messages.last_page ? '#f9fafb' : '#f8f9fa',
                                    color: messages.current_page === messages.last_page ? '#adb5bd' : '#0a0e27',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (messages.current_page !== messages.last_page) {
                                        e.currentTarget.style.background = '#e9ecef';
                                        e.currentTarget.style.borderColor = THEME.primary;
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}15`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (messages.current_page !== messages.last_page) {
                                        e.currentTarget.style.background = '#f8f9fa';
                                        e.currentTarget.style.borderColor = '#e9ecef';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
