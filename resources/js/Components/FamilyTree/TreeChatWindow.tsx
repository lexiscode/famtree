import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Users, MessageCircle, Minimize2 } from 'lucide-react';
import axios from 'axios';
import './TreeChatWindow.css';

interface Message {
    id: number;
    user_id: number;
    message: string;
    created_at: string;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        profile_image_url: string | null;
    };
}

interface OnlineUser {
    id: number;
    first_name: string;
    last_name: string;
    profile_image_url: string | null;
}

interface TypingUser {
    user_id: number;
    first_name: string;
    last_name: string;
}

interface Props {
    treeId: string;
    treeName: string;
    currentUserId: number;
    currentUserName: string;
    onClose: () => void;
    isMinimized: boolean;
    onToggleMinimize: () => void;
}

export default function TreeChatWindow({
    treeId,
    treeName,
    currentUserId,
    currentUserName,
    onClose,
    isMinimized,
    onToggleMinimize,
}: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);
    const channelRef = useRef<any>(null);

    // Scroll to bottom of messages
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Fetch initial messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(route('family-tree.chat.messages', treeId));
                setMessages(response.data.messages);
                setIsLoading(false);
                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.error('Error fetching messages:', error);
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [treeId, scrollToBottom]);

    // Subscribe to chat channel
    useEffect(() => {
        if (!window.Echo) {
            console.error('Echo is not initialized');
            return;
        }

        const channel = window.Echo.join(`family-tree.${treeId}`)
            .here((users: OnlineUser[]) => {
                setOnlineUsers(users);
            })
            .joining((user: OnlineUser) => {
                setOnlineUsers((prev) => [...prev, user]);
            })
            .leaving((user: OnlineUser) => {
                setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id));
            })
            .listen('TreeMessageSent', (e: { message: Message }) => {
                setMessages((prev) => [...prev, e.message]);
                setTimeout(scrollToBottom, 100);
            })
            .listen('TreeUserTyping', (e: { user_id: number; first_name: string; last_name: string; is_typing: boolean }) => {
                if (e.is_typing) {
                    setTypingUsers((prev) => {
                        const exists = prev.find((u) => u.user_id === e.user_id);
                        if (!exists) {
                            return [...prev, {
                                user_id: e.user_id,
                                first_name: e.first_name,
                                last_name: e.last_name,
                            }];
                        }
                        return prev;
                    });

                    // Remove typing indicator after 3 seconds
                    setTimeout(() => {
                        setTypingUsers((prev) => prev.filter((u) => u.user_id !== e.user_id));
                    }, 3000);
                } else {
                    // User stopped typing
                    setTypingUsers((prev) => prev.filter((u) => u.user_id !== e.user_id));
                }
            });

        // Store channel reference for whispers
        channelRef.current = channel;

        return () => {
            channelRef.current = null;
            window.Echo.leave(`family-tree.${treeId}`);
        };
    }, [treeId, scrollToBottom]);

    // Handle typing indicator - use server-side broadcast instead of whispers
    const handleTyping = useCallback(() => {
        if (!isTypingRef.current) {
            isTypingRef.current = true;

            // Send typing=true to server
            axios.post(route('family-tree.chat.typing', treeId), {
                is_typing: true,
            }).catch((error) => {
                console.error('Error sending typing indicator:', error);
            });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;

            // Send typing=false to server
            axios.post(route('family-tree.chat.typing', treeId), {
                is_typing: false,
            }).catch((error) => {
                console.error('Error stopping typing indicator:', error);
            });
        }, 1000);
    }, [treeId]);

    // Send message
    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || isSending) return;

        setIsSending(true);

        try {
            const response = await axios.post(route('family-tree.chat.send', treeId), {
                message: newMessage.trim(),
            });

            // Add message to local state
            setMessages((prev) => [...prev, response.data.message]);
            setNewMessage('');
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    }, [newMessage, isSending, treeId, scrollToBottom]);

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

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <div className={`tree-chat-window ${isMinimized ? 'minimized' : ''}`}>
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-left">
                    <div className="chat-icon">
                        <MessageCircle size={20} />
                    </div>
                    <div className="chat-header-info">
                        <h3 className="chat-title">{treeName} Chat</h3>
                        <div className="chat-online-count">
                            <Users size={14} />
                            <span>{onlineUsers.length} online</span>
                        </div>
                    </div>
                </div>
                <div className="chat-header-actions">
                    <button onClick={onToggleMinimize} className="chat-header-btn" title="Minimize">
                        <Minimize2 size={18} />
                    </button>
                    <button onClick={onClose} className="chat-header-btn close-btn" title="Close">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Container */}
                    <div className="chat-messages">
                        {isLoading ? (
                            <div className="chat-loading">
                                <div className="spinner"></div>
                                <p>Loading messages...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="chat-empty">
                                <MessageCircle size={48} strokeWidth={1.5} />
                                <h4>No messages yet</h4>
                                <p>Start the conversation!</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((message) => {
                                    const isOwnMessage = message.user_id === currentUserId;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`chat-message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                                        >
                                            {!isOwnMessage && (
                                                <div className="message-avatar">
                                                    {message.user.profile_image_url ? (
                                                        <img
                                                            src={message.user.profile_image_url}
                                                            alt={`${message.user.first_name} ${message.user.last_name}`}
                                                        />
                                                    ) : (
                                                        <div className="avatar-fallback">
                                                            {message.user.first_name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="message-content">
                                                {!isOwnMessage && (
                                                    <div className="message-sender">
                                                        {message.user.first_name} {message.user.last_name}
                                                    </div>
                                                )}
                                                <div className="message-bubble">
                                                    <p className="message-text">{message.message}</p>
                                                    <span className="message-time">{formatTime(message.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </>
                        )}

                        {/* Typing Indicators */}
                        {typingUsers.filter((u) => u.user_id !== currentUserId).length > 0 && (
                            <div className="typing-indicator">
                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span className="typing-text">
                                    {typingUsers
                                        .filter((u) => u.user_id !== currentUserId)
                                        .map((u) => u.first_name)
                                        .join(', ')}{' '}
                                    {typingUsers.filter((u) => u.user_id !== currentUserId).length === 1
                                        ? 'is'
                                        : 'are'}{' '}
                                    typing...
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSendMessage} className="chat-input-form">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            placeholder="Type a message..."
                            className="chat-input"
                            disabled={isSending}
                            maxLength={5000}
                        />
                        <button
                            type="submit"
                            className="chat-send-btn"
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
            )}
        </div>
    );
}
