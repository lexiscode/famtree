import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Minimize2, Maximize2, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';
import './FloatingChatWindow.css';

interface MessageUser {
    id: number;
    uuid?: string;
    name: string;
    username: string;
    first_name?: string;
    last_name?: string;
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

interface Props {
    conversationUuid: string;
    otherUser: MessageUser;
    currentUserId: number;
    onClose: () => void;
    isMinimized: boolean;
    onToggleMinimize: () => void;
}

export default function FloatingChatWindow({
    conversationUuid,
    otherUser,
    currentUserId,
    onClose,
    isMinimized,
    onToggleMinimize,
}: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Fetch messages on mount
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(route('messages.get-messages', conversationUuid));
                setMessages(response.data.messages);
                setIsLoading(false);
                setTimeout(scrollToBottom, 100);

                // Mark as read
                await axios.post(route('messages.mark-read', conversationUuid));
            } catch (error) {
                console.error('Error fetching messages:', error);
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [conversationUuid, scrollToBottom]);

    // Subscribe to Echo for real-time updates
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.private(`private-messages.${currentUserId}`)
            .listen('.PrivateMessageSent', (e: { conversation_uuid: string; message: Message }) => {
                if (e.conversation_uuid === conversationUuid) {
                    setMessages(prev => [...prev, e.message]);
                    setTimeout(scrollToBottom, 100);

                    // Mark as read
                    axios.post(route('messages.mark-read', conversationUuid));
                }
            })
            .listen('.PrivateUserTyping', (e: { conversation_uuid: string; user: MessageUser; is_typing: boolean }) => {
                if (e.conversation_uuid === conversationUuid && e.user.id !== currentUserId) {
                    setIsTyping(e.is_typing);
                }
            })
            .listen('.MessageRead', (e: { conversation_uuid: string; reader_id: number }) => {
                if (e.conversation_uuid === conversationUuid) {
                    setMessages(prev => prev.map(msg => ({
                        ...msg,
                        is_read: msg.sender_id === currentUserId ? true : msg.is_read,
                    })));
                }
            });

        return () => {
            window.Echo.leave(`private-messages.${currentUserId}`);
        };
    }, [currentUserId, conversationUuid, scrollToBottom]);

    // Handle typing indicator
    const handleTyping = useCallback(() => {
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            axios.post(route('messages.typing', conversationUuid), { is_typing: true });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            axios.post(route('messages.typing', conversationUuid), { is_typing: false });
        }, 2000);
    }, [conversationUuid]);

    // Send message
    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || isSending) return;

        setIsSending(true);

        try {
            const response = await axios.post(route('messages.send', conversationUuid), {
                message: newMessage.trim(),
            });

            setMessages(prev => [...prev, response.data.message]);
            setNewMessage('');
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    }, [newMessage, isSending, conversationUuid, scrollToBottom]);

    // Format timestamp
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const displayName = otherUser.name || `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim();

    return (
        <div className={`floating-chat-window ${isMinimized ? 'minimized' : ''}`}>
            {/* Header */}
            <div className="floating-chat-header" onClick={isMinimized ? onToggleMinimize : undefined}>
                <div className="floating-chat-user">
                    <div className="floating-chat-avatar">
                        {otherUser.profile_image_url ? (
                            <img src={otherUser.profile_image_url} alt={displayName} />
                        ) : (
                            <div className="avatar-fallback">
                                {displayName.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="floating-chat-user-info">
                        <span className="floating-chat-name">{displayName}</span>
                        {isTyping && <span className="floating-chat-typing">typing...</span>}
                    </div>
                </div>
                <div className="floating-chat-actions">
                    <button onClick={onToggleMinimize} className="floating-chat-btn" title={isMinimized ? "Expand" : "Minimize"}>
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={onClose} className="floating-chat-btn close-btn" title="Close">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="floating-chat-messages">
                        {isLoading ? (
                            <div className="floating-chat-loading">
                                <div className="spinner"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="floating-chat-empty">
                                <p>Start a conversation with {displayName}</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((message) => {
                                    const isOwnMessage = message.sender_id === currentUserId;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`floating-message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                                        >
                                            <div className="floating-message-bubble">
                                                <p className="floating-message-text">{message.message}</p>
                                            </div>
                                            <div className="floating-message-meta">
                                                <span className="floating-message-time">{formatTime(message.created_at)}</span>
                                                {isOwnMessage && (
                                                    <span className="floating-message-status">
                                                        {message.is_read ? (
                                                            <CheckCheck size={12} className="read-icon" />
                                                        ) : (
                                                            <Check size={12} />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </>
                        )}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="floating-typing-indicator">
                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="floating-chat-input-form">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            placeholder="Type a message..."
                            className="floating-chat-input"
                            disabled={isSending}
                            maxLength={5000}
                        />
                        <button
                            type="submit"
                            className="floating-chat-send-btn"
                            disabled={!newMessage.trim() || isSending}
                        >
                            {isSending ? (
                                <div className="spinner-small"></div>
                            ) : (
                                <Send size={18} />
                            )}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
