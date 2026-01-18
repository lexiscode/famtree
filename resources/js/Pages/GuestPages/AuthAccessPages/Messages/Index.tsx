import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { MessageCircle, Search, Send, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';
import './Messages.css';

interface MessageUser {
    id: number;
    uuid: string;
    name: string;
    username: string;
    profile_image_url: string | null;
}

interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    message: string;
    is_read: boolean;
    created_at: string;
    sender: {
        id: number;
        first_name: string;
        last_name: string;
        profile_image_url: string | null;
    } | null;
}

interface LastMessage {
    message: string;
    sender_id: number;
    created_at: string;
    is_read: boolean;
}

interface Conversation {
    uuid: string;
    otherUser: MessageUser;
    lastMessage: LastMessage | null;
    last_message_at: string | null;
    unread_count: number;
}

interface ActiveConversation {
    uuid: string;
    otherUser: MessageUser;
    messages: Message[];
}

interface Props {
    conversations: Conversation[];
    activeConversation: ActiveConversation | null;
    totalUnread: number;
    currentUserId: number;
}

export default function MessagesIndex({
    conversations: initialConversations = [],
    activeConversation: initialActiveConversation = null,
    totalUnread: initialTotalUnread = 0,
    currentUserId,
}: Props) {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations || []);
    const [activeConversation, setActiveConversation] = useState<ActiveConversation | null>(initialActiveConversation || null);
    const [messages, setMessages] = useState<Message[]>(initialActiveConversation?.messages || []);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState<{ [key: string]: boolean }>({});
    const [totalUnread, setTotalUnread] = useState(initialTotalUnread || 0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);
    const channelRef = useRef<any>(null);

    // Scroll to bottom of messages
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Update messages when activeConversation changes
    useEffect(() => {
        if (initialActiveConversation) {
            setActiveConversation(initialActiveConversation);
            setMessages(initialActiveConversation.messages);
            setTimeout(scrollToBottom, 100);
        }
    }, [initialActiveConversation, scrollToBottom]);

    // Subscribe to private messages channel
    useEffect(() => {
        if (!window.Echo || !currentUserId) {
            return;
        }

        const channel = window.Echo.private(`private-messages.${currentUserId}`)
            .listen('.PrivateMessageSent', (e: { conversation_uuid: string; message: Message }) => {
                // Add message if it's for the active conversation
                if (activeConversation && e.conversation_uuid === activeConversation.uuid) {
                    setMessages(prev => [...prev, e.message]);
                    setTimeout(scrollToBottom, 100);

                    // Mark as read immediately if viewing this conversation
                    axios.post(route('messages.mark-read', e.conversation_uuid));
                }

                // Update conversations list
                setConversations(prev => {
                    const updated = prev.map(conv => {
                        if (conv.uuid === e.conversation_uuid) {
                            return {
                                ...conv,
                                lastMessage: {
                                    message: e.message.message,
                                    sender_id: e.message.sender_id,
                                    created_at: e.message.created_at,
                                    is_read: activeConversation?.uuid === e.conversation_uuid,
                                },
                                last_message_at: e.message.created_at,
                                unread_count: activeConversation?.uuid === e.conversation_uuid
                                    ? 0
                                    : conv.unread_count + 1,
                            };
                        }
                        return conv;
                    });

                    // Sort by most recent
                    return updated.sort((a, b) => {
                        const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                        const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                        return bTime - aTime;
                    });
                });

                // Update total unread count
                if (!activeConversation || e.conversation_uuid !== activeConversation.uuid) {
                    setTotalUnread(prev => prev + 1);
                }
            })
            .listen('.PrivateUserTyping', (e: { conversation_uuid: string; user?: MessageUser; is_typing: boolean }) => {
                if (activeConversation && e.conversation_uuid === activeConversation.uuid && e.user?.id) {
                    setTypingUsers(prev => ({
                        ...prev,
                        [e.user!.id]: e.is_typing,
                    }));
                }
            })
            .listen('.MessageRead', (e: { conversation_uuid: string; reader_id: number }) => {
                // Update message read status
                if (activeConversation && e.conversation_uuid === activeConversation.uuid) {
                    setMessages(prev => prev.map(msg => ({
                        ...msg,
                        is_read: msg.sender_id === currentUserId ? true : msg.is_read,
                    })));
                }
            });

        channelRef.current = channel;

        return () => {
            if (currentUserId) {
                window.Echo.leave(`private-messages.${currentUserId}`);
            }
        };
    }, [currentUserId, activeConversation, scrollToBottom]);

    // Select a conversation
    const handleSelectConversation = (conversation: Conversation) => {
        router.visit(route('messages.show', conversation.uuid), {
            preserveScroll: true,
        });
    };

    // Send message
    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || isSending || !activeConversation) return;

        setIsSending(true);

        try {
            const response = await axios.post(route('messages.send', activeConversation.uuid), {
                message: newMessage.trim(),
            });

            // Add message to local state
            setMessages(prev => [...prev, response.data.message]);
            setNewMessage('');
            setTimeout(scrollToBottom, 100);

            // Update conversation in list
            setConversations(prev => prev.map(conv => {
                if (conv.uuid === activeConversation.uuid) {
                    return {
                        ...conv,
                        lastMessage: {
                            message: response.data.message.message,
                            sender_id: response.data.message.sender_id,
                            created_at: response.data.message.created_at,
                            is_read: false,
                        },
                        last_message_at: response.data.message.created_at,
                    };
                }
                return conv;
            }));
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    }, [newMessage, isSending, activeConversation, scrollToBottom]);

    // Handle typing indicator
    const handleTyping = useCallback(() => {
        if (!activeConversation) return;

        if (!isTypingRef.current) {
            isTypingRef.current = true;
            axios.post(route('messages.typing', activeConversation.uuid), { is_typing: true });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            axios.post(route('messages.typing', activeConversation.uuid), { is_typing: false });
        }, 2000);
    }, [activeConversation]);

    // Format timestamp
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        }

        if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit',
            });
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Filter conversations by search
    const filteredConversations = conversations.filter(conv =>
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get typing users for active conversation
    const typingUsersList = Object.entries(typingUsers)
        .filter(([_, isTyping]) => isTyping)
        .map(([userId]) => userId);

    return (
        <AuthAccessLayout>
            <div className="messages-page">
                <div className="messages-container">
                    {/* Conversations Sidebar */}
                    <div className={`messages-sidebar ${activeConversation ? 'mobile-hidden' : ''}`}>
                        <div className="messages-sidebar-header">
                            <h2 className="messages-sidebar-title">
                                <MessageCircle size={24} />
                                Messages
                                {totalUnread > 0 && (
                                    <span className="messages-unread-badge">{totalUnread}</span>
                                )}
                            </h2>
                        </div>

                        <div className="messages-search">
                            <Search size={18} className="messages-search-icon" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="messages-search-input"
                            />
                        </div>

                        <div className="messages-conversation-list">
                            {filteredConversations.length === 0 ? (
                                <div className="messages-empty-conversations">
                                    <MessageCircle size={40} strokeWidth={1.5} />
                                    <p>No conversations yet</p>
                                    <span>Start messaging your connections!</span>
                                </div>
                            ) : (
                                filteredConversations.map(conv => (
                                    <div
                                        key={conv.uuid}
                                        className={`messages-conversation-item ${activeConversation?.uuid === conv.uuid ? 'active' : ''} ${conv.unread_count > 0 ? 'unread' : ''}`}
                                        onClick={() => handleSelectConversation(conv)}
                                    >
                                        <div className="conversation-avatar">
                                            {conv.otherUser.profile_image_url ? (
                                                <img
                                                    src={conv.otherUser.profile_image_url}
                                                    alt={conv.otherUser.name}
                                                />
                                            ) : (
                                                <div className="avatar-fallback">
                                                    {conv.otherUser.name.charAt(0)}
                                                </div>
                                            )}
                                            {conv.unread_count > 0 && (
                                                <span className="conversation-unread-dot"></span>
                                            )}
                                        </div>
                                        <div className="conversation-info">
                                            <div className="conversation-header">
                                                <span className="conversation-name">{conv.otherUser.name}</span>
                                                {conv.lastMessage && (
                                                    <span className="conversation-time">
                                                        {formatTime(conv.lastMessage.created_at)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="conversation-preview">
                                                {conv.lastMessage ? (
                                                    <>
                                                        {conv.lastMessage.sender_id === currentUserId && (
                                                            <span className="conversation-you">You: </span>
                                                        )}
                                                        <span className={conv.unread_count > 0 ? 'unread-text' : ''}>
                                                            {conv.lastMessage.message.length > 40
                                                                ? conv.lastMessage.message.substring(0, 40) + '...'
                                                                : conv.lastMessage.message}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="no-messages">No messages yet</span>
                                                )}
                                            </div>
                                        </div>
                                        {conv.unread_count > 0 && (
                                            <span className="conversation-unread-count">{conv.unread_count}</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`messages-chat-area ${!activeConversation ? 'mobile-hidden' : ''}`}>
                        {activeConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="messages-chat-header">
                                    <button
                                        className="messages-back-btn mobile-only"
                                        onClick={() => router.visit(route('messages.index'))}
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div
                                        className="chat-user-info"
                                        onClick={() => router.visit(route('profile.view', { username: activeConversation.otherUser.username }))}
                                    >
                                        <div className="chat-user-avatar">
                                            {activeConversation.otherUser.profile_image_url ? (
                                                <img
                                                    src={activeConversation.otherUser.profile_image_url}
                                                    alt={activeConversation.otherUser.name}
                                                />
                                            ) : (
                                                <div className="avatar-fallback">
                                                    {activeConversation.otherUser.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="chat-user-details">
                                            <h3 className="chat-user-name">{activeConversation.otherUser.name}</h3>
                                            <span className="chat-user-username">@{activeConversation.otherUser.username}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Container */}
                                <div className="messages-chat-messages">
                                    {isLoading ? (
                                        <div className="messages-loading">
                                            <div className="spinner"></div>
                                            <p>Loading messages...</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="messages-empty-chat">
                                            <MessageCircle size={48} strokeWidth={1.5} />
                                            <h4>Start a conversation</h4>
                                            <p>Send a message to {activeConversation.otherUser.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            {messages.map((message, index) => {
                                                const isOwnMessage = message.sender_id === currentUserId;
                                                const showAvatar = !isOwnMessage &&
                                                    (index === 0 || messages[index - 1].sender_id !== message.sender_id);

                                                return (
                                                    <div
                                                        key={message.id}
                                                        className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}
                                                    >
                                                        {!isOwnMessage && (
                                                            <div className={`message-avatar ${showAvatar ? '' : 'invisible'}`}>
                                                                {message.sender?.profile_image_url ? (
                                                                    <img
                                                                        src={message.sender.profile_image_url}
                                                                        alt={`${message.sender.first_name} ${message.sender.last_name}`}
                                                                    />
                                                                ) : (
                                                                    <div className="avatar-fallback">
                                                                        {message.sender?.first_name?.charAt(0) || '?'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="message-content">
                                                            <div className="message-bubble">
                                                                <p className="message-text">{message.message}</p>
                                                            </div>
                                                            <div className="message-meta">
                                                                <span className="message-time">{formatTime(message.created_at)}</span>
                                                                {isOwnMessage && (
                                                                    <span className="message-status">
                                                                        {message.is_read ? (
                                                                            <CheckCheck size={14} className="read-icon" />
                                                                        ) : (
                                                                            <Check size={14} />
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}

                                    {/* Typing Indicator */}
                                    {typingUsersList.length > 0 && (
                                        <div className="typing-indicator">
                                            <div className="typing-dots">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                            <span className="typing-text">
                                                {activeConversation.otherUser.name.split(' ')[0]} is typing...
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Message Input */}
                                <form onSubmit={handleSendMessage} className="messages-input-form">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTyping();
                                        }}
                                        placeholder="Type a message..."
                                        className="messages-input"
                                        disabled={isSending}
                                        maxLength={5000}
                                    />
                                    <button
                                        type="submit"
                                        className="messages-send-btn"
                                        disabled={!newMessage.trim() || isSending}
                                    >
                                        {isSending ? (
                                            <div className="spinner-small"></div>
                                        ) : (
                                            <Send size={20} />
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="messages-no-selection">
                                <MessageCircle size={64} strokeWidth={1} />
                                <h3>Select a conversation</h3>
                                <p>Choose a conversation from the sidebar to start messaging</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
