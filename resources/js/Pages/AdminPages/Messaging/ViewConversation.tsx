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
            <div>
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="ap-flash ap-flash-success">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="ap-flash ap-flash-error">{flash.error}</div>
                )}

                {/* Header with Back Button */}
                <button className="ap-back-btn" onClick={() => router.get(route('admin.messaging.conversations'))}>
                    <ArrowLeft size={16} /> Back to Conversations
                </button>
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Conversation Details</h1>
                    <p className="ap-page-subtitle">Read-only view of private messages</p>
                </div>

                {/* Participants Card */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm ap-mb-lg">
                        <User size={18} /> Participants
                    </h3>
                    <div className="ap-flex ap-items-center ap-gap-lg ap-flex-wrap">
                        <div className="ap-flex ap-items-center ap-gap-md">
                            <div className="ap-avatar ap-avatar-md ap-avatar-indigo">
                                {conversation.user_one.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="ap-user-cell-name">{conversation.user_one.full_name}</p>
                                <p className="ap-user-cell-sub">@{conversation.user_one.username}</p>
                            </div>
                        </div>

                        <div className="ap-flex ap-items-center ap-gap-xs ap-text-secondary">
                            <MessageSquare size={16} />
                            <span className="ap-text-sm ap-font-semibold">{messages.total} messages</span>
                        </div>

                        <div className="ap-flex ap-items-center ap-gap-md">
                            <div className="ap-avatar ap-avatar-md ap-avatar-indigo">
                                {conversation.user_two.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="ap-user-cell-name">{conversation.user_two.full_name}</p>
                                <p className="ap-user-cell-sub">@{conversation.user_two.username}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="ap-card ap-card-lg">
                    <h3 className="ap-card-title ap-flex ap-items-center ap-gap-sm ap-mb-lg">
                        <MessageSquare size={18} /> Messages
                    </h3>

                    {messages.data.length > 0 ? (
                        <div className="ap-flex-col ap-gap-md">
                            {messages.data.map((message) => {
                                const isSenderOne = isUserOne(message.sender);
                                const senderName = message.sender ? message.sender.full_name : 'System';
                                const senderUsername = message.sender ? message.sender.username : '';

                                return (
                                    <div
                                        key={message.id}
                                        className={`ap-message ${isSenderOne ? 'ap-message-received' : 'ap-message-sent'}`}
                                    >
                                        <div className="ap-flex ap-items-center ap-justify-between ap-mb-sm">
                                            <div className="ap-flex ap-items-center ap-gap-sm">
                                                <span className="ap-font-semibold ap-text-sm">{senderName}</span>
                                                {senderUsername && (
                                                    <span className="ap-text-tertiary ap-text-xs">@{senderUsername}</span>
                                                )}
                                                {!message.is_read && (
                                                    <span className="ap-badge ap-badge-warning">Unread</span>
                                                )}
                                            </div>
                                            <button
                                                className="ap-btn ap-btn-danger ap-btn-sm"
                                                onClick={() => handleDeleteMessage(message.id)}
                                            >
                                                <Trash2 size={12} />
                                                Delete
                                            </button>
                                        </div>

                                        <p style={{ margin: 0, lineHeight: 1.7 }}>
                                            {message.content}
                                        </p>

                                        <div className="ap-message-meta ap-flex ap-items-center ap-gap-xs">
                                            <Clock size={12} />
                                            {message.created_at_formatted}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <MessageSquare size={24} />
                            </div>
                            <p className="ap-empty-title">No messages in this conversation</p>
                            <p className="ap-empty-text">This conversation does not contain any messages yet</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {messages.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{messages.from}</strong> to{' '}
                            <strong>{messages.to}</strong> of{' '}
                            <strong>{messages.total}</strong> messages
                        </p>
                        <div className="ap-pagination-btns">
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(messages.current_page - 1)}
                                disabled={messages.current_page === 1}
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            {generatePageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`ap-page-btn ${page === messages.current_page ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                className="ap-page-btn"
                                onClick={() => handlePageChange(messages.current_page + 1)}
                                disabled={messages.current_page === messages.last_page}
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
