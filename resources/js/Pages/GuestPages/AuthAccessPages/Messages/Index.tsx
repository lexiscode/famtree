import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { MessageCircle, Search, ArrowLeft, Users, GraduationCap, Pencil, Trash2, X, Check, CheckSquare, Square, Shield, Vote, UserMinus, Clock, AlertTriangle, ChevronDown, LogOut } from 'lucide-react';

// Custom Leaf Indicator Components for message status
const LeafOutline = ({ size = 14, className = '' }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
);

const LeafFilled = ({ size = 14, className = '' }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="none" strokeWidth="2" />
    </svg>
);

const DoubleLeafFilled = ({ size = 14, className = '' }: { size?: number; className?: string }) => (
    <svg
        width={size + 6}
        height={size}
        viewBox="0 0 30 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {/* First leaf */}
        <g transform="translate(0, 0) scale(0.85)">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="none" strokeWidth="2" />
        </g>
        {/* Second leaf - slightly offset */}
        <g transform="translate(10, 0) scale(0.85)">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="none" strokeWidth="2" />
        </g>
    </svg>
);
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
    is_delivered: boolean;
    is_read: boolean;
    is_edited: boolean;
    edited_at: string | null;
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

interface GroupChat {
    uuid: string;
    type: 'family_tree' | 'class_set';
    name: string;
    member_count: number;
    unread_count: number;
    lastMessage: {
        message: string;
        sender_id: number;
        sender_name: string;
        created_at: string;
    } | null;
    last_message_at: string | null;
}

interface GroupMessage {
    id: number;
    user_id: number;
    message: string;
    is_edited?: boolean;
    edited_at?: string | null;
    is_org_broadcast?: boolean;
    organization?: {
        id: number;
        name: string;
        short_name: string;
        logo_url: string | null;
    } | null;
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

interface ElectionCandidate {
    user_id: number;
    first_name: string;
    last_name: string;
    username: string;
    profile_image: string | null;
    votes_count: number;
}

interface ElectionData {
    id: number;
    type: 'initial' | 'replacement' | 'tiebreaker';
    status: string;
    positions_to_fill: number;
    ends_at: string;
    started_at: string;
    has_voted: boolean;
    candidates: ElectionCandidate[];
    total_votes: number;
}

interface RemovalVote {
    admin_user_id: number;
    admin_name: string;
    vote: 'confirm' | 'reject';
}

interface RemovalData {
    id: number;
    status: string;
    expires_at: string;
    is_admin: boolean;
    is_target: boolean;
    is_initiator: boolean;
    target_user: {
        id: number;
        uuid: string;
        first_name: string;
        last_name: string;
        username: string;
        profile_image: string | null;
    };
    initiator: {
        id: number;
        uuid: string;
        first_name: string;
        last_name: string;
        username: string;
    };
    votes: RemovalVote[];
    has_voted: boolean;
    admins: { id: number; uuid: string; first_name: string; last_name: string; username: string }[];
}

interface Props {
    conversations: Conversation[];
    groupChats: GroupChat[];
    activeConversation: ActiveConversation | null;
    totalUnread: number;
    currentUserId: number;
}

function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
}

export default function MessagesIndex({
    conversations: initialConversations = [],
    groupChats: initialGroupChats = [],
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

    // Group chat state
    const [activeGroupChat, setActiveGroupChat] = useState<GroupChat | null>(null);
    const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [isGroupLoading, setIsGroupLoading] = useState(false);

    // Edit/Delete state
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');
    const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);
    const [isEditSaving, setIsEditSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Bulk selection state
    const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    // Election state
    const [electionData, setElectionData] = useState<ElectionData | null>(null);
    const [isVoting, setIsVoting] = useState(false);
    const [electionExpanded, setElectionExpanded] = useState(true);
    const [removalExpanded, setRemovalExpanded] = useState(true);

    // Removal state
    const [removalData, setRemovalData] = useState<RemovalData | null>(null);
    const [isRemovalAction, setIsRemovalAction] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Members panel state
    const [showMembersPanel, setShowMembersPanel] = useState(false);
    const [membersList, setMembersList] = useState<Array<{
        id: number; uuid: string; first_name: string; last_name: string;
        username: string; profile_image: string | null; is_admin: boolean; joined_at: string;
    }>>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [removalConfirmTarget, setRemovalConfirmTarget] = useState<{ id: number; first_name: string; last_name: string } | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);
    const channelRef = useRef<any>(null);
    const groupChannelRef = useRef<any>(null);

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
                } else {
                    // User is online but not viewing this conversation - mark as delivered
                    axios.post(route('messages.mark-delivered', e.conversation_uuid));
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
            .listen('.MessageRead', (e: { conversation_uuid: string; read_by_user_id: number }) => {
                // Update message read status
                if (activeConversation && e.conversation_uuid === activeConversation.uuid) {
                    setMessages(prev => prev.map(msg => ({
                        ...msg,
                        is_read: msg.sender_id === currentUserId ? true : msg.is_read,
                        is_delivered: msg.sender_id === currentUserId ? true : msg.is_delivered,
                    })));
                }
            })
            .listen('.MessageDelivered', (e: { conversation_uuid: string; delivered_to_user_id: number }) => {
                // Update message delivered status
                if (activeConversation && e.conversation_uuid === activeConversation.uuid) {
                    setMessages(prev => prev.map(msg => ({
                        ...msg,
                        is_delivered: msg.sender_id === currentUserId ? true : msg.is_delivered,
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

    // Subscribe to group chat channel when a group is selected
    useEffect(() => {
        if (!activeGroupChat || !window.Echo) return;

        // Determine channel name based on group type
        const channelName = activeGroupChat.type === 'class_set'
            ? `class-set.${activeGroupChat.uuid}`
            : `family-tree.${activeGroupChat.uuid}`;

        const eventName = activeGroupChat.type === 'class_set'
            ? '.ClassSetMessageSent'
            : '.TreeMessageSent';

        const channel = window.Echo.join(channelName)
            .here((users: OnlineUser[]) => {
                setOnlineUsers(users);
            })
            .joining((user: OnlineUser) => {
                setOnlineUsers(prev => [...prev, user]);
            })
            .leaving((user: OnlineUser) => {
                setOnlineUsers(prev => prev.filter(u => u.id !== user.id));
            })
            .listen(eventName, (e: { message: any }) => {
                const msg: GroupMessage = {
                    id: e.message.id,
                    user_id: e.message.sender?.id || e.message.sender_id,
                    message: e.message.message,
                    is_org_broadcast: e.message.is_org_broadcast || false,
                    organization: e.message.organization || null,
                    created_at: e.message.created_at,
                    user: e.message.sender ? {
                        id: e.message.sender.id,
                        first_name: e.message.sender.first_name,
                        last_name: e.message.sender.last_name,
                        profile_image_url: e.message.sender.profile_image,
                    } : { id: 0, first_name: 'Organization', last_name: '', profile_image_url: null },
                };
                setGroupMessages(prev => [...prev, msg]);
                setTimeout(scrollToBottom, 100);
            });

        groupChannelRef.current = channel;

        return () => {
            if (activeGroupChat) {
                window.Echo.leave(channelName);
            }
            groupChannelRef.current = null;
        };
    }, [activeGroupChat, scrollToBottom]);

    // Select a conversation (DM)
    const handleSelectConversation = (conversation: Conversation) => {
        setActiveGroupChat(null); // Clear group chat
        router.visit(route('messages.show', conversation.uuid), {
            preserveScroll: true,
        });
    };

    // Select a group chat
    const handleSelectGroupChat = useCallback(async (group: GroupChat) => {
        setActiveConversation(null); // Clear DM conversation
        setActiveGroupChat(group);
        setIsGroupLoading(true);
        setGroupMessages([]);

        try {
            // Use different route based on group type
            const routeName = group.type === 'class_set'
                ? 'class-sets.messages'
                : 'family-tree.chat.messages';
            const response = await axios.get(route(routeName, group.uuid));

            // Handle different response formats
            const messages = group.type === 'class_set'
                ? response.data.messages.map((m: any) => ({
                    id: m.id,
                    user_id: m.sender?.id || m.sender_id,
                    message: m.message,
                    is_org_broadcast: m.is_org_broadcast || false,
                    organization: m.organization || null,
                    created_at: m.created_at,
                    user: m.sender ? {
                        id: m.sender.id,
                        first_name: m.sender.first_name,
                        last_name: m.sender.last_name,
                        profile_image_url: m.sender.profile_image,
                    } : null,
                }))
                : response.data.messages;

            setGroupMessages(messages);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error fetching group messages:', error);
        } finally {
            setIsGroupLoading(false);
        }
    }, [scrollToBottom]);

    // Fetch election and removal data for class_set groups
    const fetchGroupAdminData = useCallback(async (groupUuid: string) => {
        try {
            const [electionRes, removalRes] = await Promise.all([
                axios.get(route('class-sets.election.show', groupUuid)),
                axios.get(route('class-sets.removal.show', groupUuid)),
            ]);
            setElectionData(electionRes.data.election || null);
            setRemovalData(removalRes.data.removal || null);
            setIsMuted(removalRes.data.removal?.is_target || false);
        } catch {
            setElectionData(null);
            setRemovalData(null);
            setIsMuted(false);
        }
    }, []);

    // Load group admin data when class_set group is selected
    useEffect(() => {
        if (activeGroupChat?.type === 'class_set') {
            fetchGroupAdminData(activeGroupChat.uuid);
        } else {
            setElectionData(null);
            setRemovalData(null);
            setIsMuted(false);
        }
    }, [activeGroupChat, fetchGroupAdminData]);

    // Fetch members list for the panel
    const fetchMembers = useCallback(async () => {
        if (!activeGroupChat || activeGroupChat.type !== 'class_set') return;
        setMembersLoading(true);
        try {
            const response = await axios.get(route('class-sets.members', activeGroupChat.uuid));
            setMembersList(response.data.members || []);
        } catch {
            setMembersList([]);
        } finally {
            setMembersLoading(false);
        }
    }, [activeGroupChat]);

    const toggleMembersPanel = useCallback(() => {
        setShowMembersPanel(prev => {
            if (!prev) fetchMembers();
            return !prev;
        });
    }, [fetchMembers]);

    const handleLeaveGroup = useCallback(() => {
        if (!activeGroupChat || isLeaving) return;
        setIsLeaving(true);
        router.post(route('class-sets.leave', activeGroupChat.uuid), {}, {
            onSuccess: () => {
                setShowLeaveConfirm(false);
                setActiveGroupChat(null);
                setIsLeaving(false);
            },
            onError: () => {
                setIsLeaving(false);
            },
        });
    }, [activeGroupChat, isLeaving]);

    // Close members panel and leave confirm when switching chats
    useEffect(() => {
        setShowMembersPanel(false);
        setMembersList([]);
        setShowLeaveConfirm(false);
    }, [activeGroupChat]);

    // Vote in an election
    const handleElectionVote = useCallback(async (candidateId: number) => {
        if (!activeGroupChat || isVoting) return;
        setIsVoting(true);
        try {
            const response = await axios.post(route('class-sets.election.vote', activeGroupChat.uuid), {
                candidate_id: candidateId,
            });
            if (response.data.success) {
                setElectionData(prev => prev ? {
                    ...prev,
                    has_voted: true,
                    candidates: response.data.candidates,
                    total_votes: prev.total_votes + 1,
                } : null);
            }
        } catch (error: any) {
            console.error('Error voting:', error);
        } finally {
            setIsVoting(false);
        }
    }, [activeGroupChat, isVoting]);

    // Initiate removal
    const handleInitiateRemoval = useCallback(async (targetUserId: number) => {
        if (!activeGroupChat || isRemovalAction) return;
        setIsRemovalAction(true);
        try {
            const response = await axios.post(route('class-sets.removal.initiate', activeGroupChat.uuid), {
                target_user_id: targetUserId,
            });
            if (response.data.success) {
                // Refresh removal data
                fetchGroupAdminData(activeGroupChat.uuid);
            }
        } catch (error: any) {
            console.error('Error initiating removal:', error);
        } finally {
            setIsRemovalAction(false);
        }
    }, [activeGroupChat, isRemovalAction, fetchGroupAdminData]);

    // Vote on removal
    const handleRemovalVote = useCallback(async (vote: 'confirm' | 'reject') => {
        if (!activeGroupChat || isRemovalAction) return;
        setIsRemovalAction(true);
        try {
            const response = await axios.post(route('class-sets.removal.vote', activeGroupChat.uuid), {
                vote,
            });
            if (response.data.success) {
                fetchGroupAdminData(activeGroupChat.uuid);
            }
        } catch (error: any) {
            console.error('Error voting on removal:', error);
        } finally {
            setIsRemovalAction(false);
        }
    }, [activeGroupChat, isRemovalAction, fetchGroupAdminData]);

    // Send group message
    const handleSendGroupMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || isSending || !activeGroupChat) return;

        setIsSending(true);

        try {
            // Use different route based on group type
            const routeName = activeGroupChat.type === 'class_set'
                ? 'class-sets.send-message'
                : 'family-tree.chat.send';
            const response = await axios.post(route(routeName, activeGroupChat.uuid), {
                message: newMessage.trim(),
            });

            // Handle different response formats
            const newMsg = activeGroupChat.type === 'class_set'
                ? {
                    id: response.data.message.id,
                    user_id: response.data.message.sender?.id || response.data.message.sender_id,
                    message: response.data.message.message,
                    is_org_broadcast: response.data.message.is_org_broadcast || false,
                    organization: response.data.message.organization || null,
                    created_at: response.data.message.created_at,
                    user: response.data.message.sender ? {
                        id: response.data.message.sender.id,
                        first_name: response.data.message.sender.first_name,
                        last_name: response.data.message.sender.last_name,
                        profile_image_url: response.data.message.sender.profile_image,
                    } : null,
                }
                : response.data.message;

            setGroupMessages(prev => [...prev, newMsg]);
            setNewMessage('');
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error sending group message:', error);
        } finally {
            setIsSending(false);
        }
    }, [newMessage, isSending, activeGroupChat, scrollToBottom]);

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

    // Start editing a message
    const handleStartEdit = useCallback((message: Message) => {
        setEditingMessageId(message.id);
        setEditingText(message.message);
    }, []);

    // Cancel editing
    const handleCancelEdit = useCallback(() => {
        setEditingMessageId(null);
        setEditingText('');
    }, []);

    // Save edited message
    const handleSaveEdit = useCallback(async () => {
        if (!editingMessageId || !editingText.trim()) return;

        setIsEditSaving(true);
        try {
            const response = await axios.put(route('messages.edit', editingMessageId), {
                message: editingText.trim(),
            });

            if (response.data.success) {
                setMessages(prev => prev.map(msg =>
                    msg.id === editingMessageId ? response.data.message : msg
                ));
                setEditingMessageId(null);
                setEditingText('');
            }
        } catch (error) {
            console.error('Error editing message:', error);
        } finally {
            setIsEditSaving(false);
        }
    }, [editingMessageId, editingText]);

    // Show delete confirmation
    const handleShowDeleteConfirm = useCallback((messageId: number) => {
        setDeletingMessageId(messageId);
    }, []);

    // Cancel delete
    const handleCancelDelete = useCallback(() => {
        setDeletingMessageId(null);
    }, []);

    // Confirm delete
    const handleConfirmDelete = useCallback(async () => {
        if (!deletingMessageId) return;

        setIsDeleting(true);
        try {
            const response = await axios.delete(route('messages.delete', deletingMessageId));

            if (response.data.success) {
                setMessages(prev => prev.filter(msg => msg.id !== deletingMessageId));
                setDeletingMessageId(null);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        } finally {
            setIsDeleting(false);
        }
    }, [deletingMessageId]);

    // Toggle bulk select mode
    const handleToggleBulkSelect = useCallback(() => {
        setIsBulkSelectMode(prev => !prev);
        setSelectedMessageIds([]);
        setShowBulkDeleteConfirm(false);
    }, []);

    // Toggle message selection
    const handleToggleMessageSelect = useCallback((messageId: number) => {
        setSelectedMessageIds(prev =>
            prev.includes(messageId)
                ? prev.filter(id => id !== messageId)
                : [...prev, messageId]
        );
    }, []);

    // Show bulk delete confirmation
    const handleShowBulkDeleteConfirm = useCallback(() => {
        if (selectedMessageIds.length === 0) return;
        setShowBulkDeleteConfirm(true);
    }, [selectedMessageIds]);

    // Cancel bulk delete
    const handleCancelBulkDelete = useCallback(() => {
        setShowBulkDeleteConfirm(false);
    }, []);

    // Bulk delete selected messages
    const handleBulkDelete = useCallback(async () => {
        if (selectedMessageIds.length === 0) return;

        setIsBulkDeleting(true);
        try {
            // Use different route based on whether it's DM or group chat
            const routeName = activeGroupChat
                ? (activeGroupChat.type === 'class_set' ? 'class-sets.bulk-delete' : 'family-tree.chat.bulk-delete')
                : 'messages.bulk-delete';
            const response = await axios.post(route(routeName), {
                message_ids: selectedMessageIds,
            });

            if (response.data.success) {
                if (activeGroupChat) {
                    setGroupMessages(prev => prev.filter(msg => !selectedMessageIds.includes(msg.id)));
                } else {
                    setMessages(prev => prev.filter(msg => !selectedMessageIds.includes(msg.id)));
                }
                setSelectedMessageIds([]);
                setIsBulkSelectMode(false);
                setShowBulkDeleteConfirm(false);
            }
        } catch (error) {
            console.error('Error bulk deleting messages:', error);
        } finally {
            setIsBulkDeleting(false);
        }
    }, [selectedMessageIds, activeGroupChat]);

    // Start editing a group message
    const handleStartGroupEdit = useCallback((message: GroupMessage) => {
        setEditingMessageId(message.id);
        setEditingText(message.message);
    }, []);

    // Save edited group message
    const handleSaveGroupEdit = useCallback(async () => {
        if (!editingMessageId || !editingText.trim() || !activeGroupChat) return;

        setIsEditSaving(true);
        try {
            const routeName = activeGroupChat.type === 'class_set'
                ? 'class-sets.edit-message'
                : 'family-tree.chat.edit';
            const response = await axios.put(route(routeName, editingMessageId), {
                message: editingText.trim(),
            });

            if (response.data.success) {
                setGroupMessages(prev => prev.map(msg =>
                    msg.id === editingMessageId
                        ? { ...msg, message: editingText.trim(), is_edited: true, edited_at: new Date().toISOString() }
                        : msg
                ));
                setEditingMessageId(null);
                setEditingText('');
            }
        } catch (error) {
            console.error('Error editing group message:', error);
        } finally {
            setIsEditSaving(false);
        }
    }, [editingMessageId, editingText, activeGroupChat]);

    // Confirm delete group message
    const handleConfirmGroupDelete = useCallback(async () => {
        if (!deletingMessageId || !activeGroupChat) return;

        setIsDeleting(true);
        try {
            const routeName = activeGroupChat.type === 'class_set'
                ? 'class-sets.delete-message'
                : 'family-tree.chat.delete';
            const response = await axios.delete(route(routeName, deletingMessageId));

            if (response.data.success) {
                setGroupMessages(prev => prev.filter(msg => msg.id !== deletingMessageId));
                setDeletingMessageId(null);
            }
        } catch (error) {
            console.error('Error deleting group message:', error);
        } finally {
            setIsDeleting(false);
        }
    }, [deletingMessageId, activeGroupChat]);

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

    // Filter group chats by search
    const filteredGroupChats = (initialGroupChats || []).filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <div className={`messages-sidebar ${activeConversation || activeGroupChat ? 'mobile-hidden' : ''}`}>
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
                            {/* Group Chats Section */}
                            {filteredGroupChats.length > 0 && (
                                <>
                                    <div className="messages-section-header">
                                        <Users size={16} />
                                        <span>Group Chats</span>
                                    </div>
                                    {filteredGroupChats.map(group => (
                                        <div
                                            key={group.uuid}
                                            onClick={() => handleSelectGroupChat(group)}
                                            className={`messages-conversation-item group-chat ${activeGroupChat?.uuid === group.uuid ? 'active' : ''} ${group.unread_count > 0 ? 'unread' : ''}`}
                                        >
                                            <div className="conversation-avatar group-avatar">
                                                <div className={`avatar-fallback group-fallback ${group.type === 'class_set' ? 'class-set-fallback' : ''}`}>
                                                    {group.type === 'class_set' ? (
                                                        <GraduationCap size={20} />
                                                    ) : (
                                                        <Users size={20} />
                                                    )}
                                                </div>
                                                {group.unread_count > 0 && (
                                                    <span className="conversation-unread-dot"></span>
                                                )}
                                            </div>
                                            <div className="conversation-info">
                                                <div className="conversation-header">
                                                    <span className="conversation-name">{group.name}</span>
                                                    {group.lastMessage && (
                                                        <span className="conversation-time">
                                                            {formatTime(group.lastMessage.created_at)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="conversation-preview">
                                                    {group.lastMessage ? (
                                                        <>
                                                            <span className="conversation-you">{group.lastMessage.sender_name.split(' ')[0]}: </span>
                                                            <span className={group.unread_count > 0 ? 'unread-text' : ''}>
                                                                {(() => { const t = stripHtml(group.lastMessage.message); return t.length > 30 ? t.substring(0, 30) + '...' : t; })()}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="no-messages">{group.member_count} members</span>
                                                    )}
                                                </div>
                                            </div>
                                            {group.unread_count > 0 && (
                                                <span className="conversation-unread-count">{group.unread_count}</span>
                                            )}
                                        </div>
                                    ))}

                                    {/* Divider between group chats and DMs */}
                                    {filteredConversations.length > 0 && (
                                        <div className="messages-section-header">
                                            <MessageCircle size={16} />
                                            <span>Direct Messages</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Private Conversations */}
                            {filteredConversations.length === 0 && filteredGroupChats.length === 0 ? (
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
                                                            {(() => { const t = stripHtml(conv.lastMessage.message); return t.length > 40 ? t.substring(0, 40) + '...' : t; })()}
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
                    <div className={`messages-chat-area ${!activeConversation && !activeGroupChat ? 'mobile-hidden' : ''}`}>
                        {activeGroupChat ? (
                            <>
                                {/* Group Chat Header */}
                                <div className="messages-chat-header group-chat-header">
                                    <button
                                        className="messages-back-btn mobile-only"
                                        onClick={() => setActiveGroupChat(null)}
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div
                                        className="chat-user-info"
                                        onClick={activeGroupChat.type === 'class_set' ? toggleMembersPanel : undefined}
                                        style={{ cursor: activeGroupChat.type === 'class_set' ? 'pointer' : 'default' }}
                                    >
                                        <div className="chat-user-avatar group-avatar">
                                            <div className={`avatar-fallback group-fallback ${activeGroupChat.type === 'class_set' ? 'class-set-fallback' : ''}`}>
                                                {activeGroupChat.type === 'class_set' ? (
                                                    <GraduationCap size={20} />
                                                ) : (
                                                    <Users size={20} />
                                                )}
                                            </div>
                                        </div>
                                        <div className="chat-user-details">
                                            <h3 className="chat-user-name">{activeGroupChat.name}</h3>
                                            <span className="chat-user-username">
                                                {activeGroupChat.type === 'class_set' ? (
                                                    <GraduationCap size={12} style={{ marginRight: '4px', display: 'inline' }} />
                                                ) : (
                                                    <Users size={12} style={{ marginRight: '4px', display: 'inline' }} />
                                                )}
                                                {onlineUsers.length} online · {activeGroupChat.member_count} members
                                            </span>
                                        </div>
                                    </div>
                                    <div className="chat-header-actions">
                                        {isBulkSelectMode && selectedMessageIds.length > 0 && (
                                            <div className="bulk-delete-wrapper">
                                                {showBulkDeleteConfirm && (
                                                    <div className="delete-confirm-popup bulk-delete-confirm">
                                                        <span className="delete-confirm-text">Delete {selectedMessageIds.length}?</span>
                                                        <button
                                                            className="delete-confirm-yes"
                                                            onClick={handleBulkDelete}
                                                            disabled={isBulkDeleting}
                                                        >
                                                            {isBulkDeleting ? '...' : 'Yes'}
                                                        </button>
                                                        <button
                                                            className="delete-confirm-no"
                                                            onClick={handleCancelBulkDelete}
                                                            disabled={isBulkDeleting}
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    className="bulk-delete-btn"
                                                    onClick={handleShowBulkDeleteConfirm}
                                                    disabled={isBulkDeleting || showBulkDeleteConfirm}
                                                >
                                                    {isBulkDeleting ? (
                                                        <div className="spinner-small"></div>
                                                    ) : (
                                                        <>
                                                            <Trash2 size={10} />
                                                            <span>Delete ({selectedMessageIds.length})</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            className={`bulk-select-toggle ${isBulkSelectMode ? 'active' : ''}`}
                                            onClick={handleToggleBulkSelect}
                                            title={isBulkSelectMode ? 'Cancel selection' : 'Select messages'}
                                        >
                                            {isBulkSelectMode ? <X size={12} /> : <CheckSquare size={12} />}
                                        </button>
                                        {activeGroupChat.type === 'class_set' && (
                                            <button
                                                onClick={() => setShowLeaveConfirm(true)}
                                                title="Leave group"
                                                style={{
                                                    width: '20px', height: '20px', minWidth: '20px', minHeight: '20px',
                                                    maxWidth: '20px', maxHeight: '20px',
                                                    borderRadius: '4px',
                                                    background: 'rgba(239, 68, 68, 0.08)',
                                                    border: '1px solid rgba(239, 68, 68, 0.15)',
                                                    color: '#EF4444',
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', padding: 0, transition: 'all 0.2s ease',
                                                    boxSizing: 'border-box', lineHeight: 1,
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                                            >
                                                <LogOut size={11} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Leave Group Confirmation Dialog */}
                                {showLeaveConfirm && activeGroupChat.type === 'class_set' && (
                                    <div
                                        onClick={() => setShowLeaveConfirm(false)}
                                        style={{
                                            position: 'fixed', inset: 0, zIndex: 9999,
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            backdropFilter: 'blur(4px)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: '1rem',
                                            animation: 'fadeIn 0.15s ease-out',
                                        }}
                                    >
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                background: '#1a1a2e',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                borderRadius: '16px',
                                                padding: '1.75rem',
                                                width: '100%',
                                                maxWidth: '400px',
                                                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
                                                animation: 'slideUp 0.2s ease-out',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <div style={{
                                                    width: '44px', height: '44px', borderRadius: '12px',
                                                    background: 'rgba(239, 68, 68, 0.15)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <LogOut size={22} color="#EF4444" />
                                                </div>
                                                <button
                                                    onClick={() => setShowLeaveConfirm(false)}
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.05)', border: 'none',
                                                        borderRadius: '8px', padding: '6px', cursor: 'pointer',
                                                        color: '#888', display: 'flex', transition: 'all 0.15s ease',
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#ccc'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#888'; }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                                                Leave Group
                                            </h3>
                                            <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#999', lineHeight: 1.5 }}>
                                                Are you sure you want to leave <strong style={{ color: '#e0e0e0' }}>{activeGroupChat.name}</strong>? You will no longer receive messages from this group and will need to rejoin to access the chat again.
                                            </p>

                                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => setShowLeaveConfirm(false)}
                                                    style={{
                                                        padding: '0.6rem 1.25rem', borderRadius: '10px',
                                                        background: 'rgba(255, 255, 255, 0.06)',
                                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                                        color: '#ccc', fontSize: '0.85rem', fontWeight: 500,
                                                        cursor: 'pointer', transition: 'all 0.15s ease',
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleLeaveGroup}
                                                    disabled={isLeaving}
                                                    style={{
                                                        padding: '0.6rem 1.25rem', borderRadius: '10px',
                                                        background: 'rgba(239, 68, 68, 0.15)',
                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                        color: '#EF4444', fontSize: '0.85rem', fontWeight: 600,
                                                        cursor: isLeaving ? 'not-allowed' : 'pointer',
                                                        opacity: isLeaving ? 0.6 : 1,
                                                        transition: 'all 0.15s ease',
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                    }}
                                                    onMouseEnter={(e) => { if (!isLeaving) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
                                                >
                                                    <LogOut size={14} />
                                                    {isLeaving ? 'Leaving...' : 'Leave Group'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Removal Confirmation Dialog */}
                                {removalConfirmTarget && (
                                    <div
                                        onClick={() => setRemovalConfirmTarget(null)}
                                        style={{
                                            position: 'fixed', inset: 0, zIndex: 9999,
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            backdropFilter: 'blur(4px)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: '1rem',
                                            animation: 'fadeIn 0.15s ease-out',
                                        }}
                                    >
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                background: '#1a1a2e',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                borderRadius: '16px',
                                                padding: '1.75rem',
                                                width: '100%',
                                                maxWidth: '420px',
                                                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
                                                animation: 'slideUp 0.2s ease-out',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <div style={{
                                                    width: '44px', height: '44px', borderRadius: '12px',
                                                    background: 'rgba(239, 68, 68, 0.15)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <UserMinus size={22} color="#EF4444" />
                                                </div>
                                                <button
                                                    onClick={() => setRemovalConfirmTarget(null)}
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.05)', border: 'none',
                                                        borderRadius: '8px', padding: '6px', cursor: 'pointer',
                                                        color: '#888', display: 'flex', transition: 'all 0.15s ease',
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#ccc'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#888'; }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                                                Initiate Member Removal
                                            </h3>
                                            <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#999', lineHeight: 1.5 }}>
                                                Are you sure you want to initiate the removal of <strong style={{ color: '#e0e0e0' }}>{removalConfirmTarget.first_name} {removalConfirmTarget.last_name}</strong> from this group? This will require confirmation from another admin within 3 days to complete.
                                            </p>

                                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => setRemovalConfirmTarget(null)}
                                                    style={{
                                                        padding: '0.6rem 1.25rem', borderRadius: '10px',
                                                        background: 'rgba(255, 255, 255, 0.06)',
                                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                                        color: '#ccc', fontSize: '0.85rem', fontWeight: 500,
                                                        cursor: 'pointer', transition: 'all 0.15s ease',
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleInitiateRemoval(removalConfirmTarget.id);
                                                        setRemovalConfirmTarget(null);
                                                        setShowMembersPanel(false);
                                                    }}
                                                    disabled={isRemovalAction}
                                                    style={{
                                                        padding: '0.6rem 1.25rem', borderRadius: '10px',
                                                        background: 'rgba(239, 68, 68, 0.15)',
                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                        color: '#EF4444', fontSize: '0.85rem', fontWeight: 600,
                                                        cursor: isRemovalAction ? 'not-allowed' : 'pointer',
                                                        opacity: isRemovalAction ? 0.6 : 1,
                                                        transition: 'all 0.15s ease',
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                    }}
                                                    onMouseEnter={(e) => { if (!isRemovalAction) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
                                                >
                                                    <UserMinus size={14} />
                                                    {isRemovalAction ? 'Processing...' : 'Remove Member'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Election Banner (Collapsible) */}
                                {electionData && activeGroupChat?.type === 'class_set' && (
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.08))',
                                        borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                                    }}>
                                        {/* Clickable Header */}
                                        <div
                                            onClick={() => setElectionExpanded(!electionExpanded)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '10px 16px',
                                                cursor: 'pointer',
                                                transition: 'background 0.15s ease',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <Vote size={16} color="#3B82F6" />
                                            <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>
                                                {electionData.type === 'initial' ? 'Group Admin Election' :
                                                    electionData.type === 'replacement' ? 'Replacement Admin Election' : 'Tiebreaker Election'}
                                            </span>
                                            {electionData.has_voted && (
                                                <span style={{
                                                    fontSize: '0.65rem', fontWeight: 600, color: '#10B981',
                                                    background: 'rgba(16, 185, 129, 0.12)',
                                                    padding: '2px 6px', borderRadius: '4px',
                                                }}>
                                                    Voted
                                                </span>
                                            )}
                                            <span style={{
                                                marginLeft: 'auto', fontSize: '0.72rem', color: '#888',
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                            }}>
                                                <Clock size={11} />
                                                {(() => {
                                                    const end = new Date(electionData.ends_at);
                                                    const now = new Date();
                                                    const diff = end.getTime() - now.getTime();
                                                    if (diff <= 0) return 'Ended';
                                                    const hours = Math.floor(diff / (1000 * 60 * 60));
                                                    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                                    return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
                                                })()}
                                            </span>
                                            <ChevronDown size={16} color="#888" style={{
                                                transition: 'transform 0.2s ease',
                                                transform: electionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                flexShrink: 0,
                                            }} />
                                        </div>

                                        {/* Collapsible Body */}
                                        {electionExpanded && (
                                            <div style={{ padding: '0 16px 12px' }}>
                                                <p style={{ color: '#aaa', fontSize: '0.78rem', margin: '0 0 8px' }}>
                                                    Vote for {electionData.positions_to_fill} admin{electionData.positions_to_fill > 1 ? 's' : ''} · {electionData.total_votes} vote{electionData.total_votes !== 1 ? 's' : ''} cast
                                                </p>
                                                <div className="election-candidates-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                                                    {electionData.candidates.slice(0, 10).map(candidate => (
                                                        <div key={candidate.user_id} style={{
                                                            display: 'flex', alignItems: 'center', gap: '8px',
                                                            padding: '6px 10px', borderRadius: '8px',
                                                            background: 'rgba(255, 255, 255, 0.03)',
                                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                                        }}>
                                                            <div style={{
                                                                width: '28px', height: '28px', borderRadius: '50%',
                                                                background: 'rgba(139, 92, 246, 0.2)', display: 'flex',
                                                                alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '0.7rem', fontWeight: 600, color: '#8B5CF6', overflow: 'hidden',
                                                            }}>
                                                                {candidate.profile_image
                                                                    ? <img src={candidate.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                    : candidate.first_name.charAt(0)}
                                                            </div>
                                                            <span style={{ flex: 1, fontSize: '0.85rem', color: '#e0e0e0' }}>
                                                                {candidate.first_name} {candidate.last_name}
                                                            </span>
                                                            <span style={{ fontSize: '0.75rem', color: '#888', minWidth: '40px', textAlign: 'right' }}>
                                                                {candidate.votes_count} vote{candidate.votes_count !== 1 ? 's' : ''}
                                                            </span>
                                                            {!electionData.has_voted ? (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleElectionVote(candidate.user_id); }}
                                                                    disabled={isVoting}
                                                                    style={{
                                                                        padding: '3px 10px', borderRadius: '6px', border: 'none',
                                                                        background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                                                        color: '#fff', fontSize: '0.75rem', fontWeight: 600,
                                                                        cursor: isVoting ? 'not-allowed' : 'pointer',
                                                                        opacity: isVoting ? 0.6 : 1,
                                                                    }}
                                                                >
                                                                    Vote
                                                                </button>
                                                            ) : (
                                                                <span style={{ fontSize: '0.7rem', color: '#10B981' }}>
                                                                    <Check size={12} />
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                {electionData.has_voted && (
                                                    <p style={{ color: '#10B981', fontSize: '0.78rem', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Check size={14} /> You have voted
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Removal Alert (Collapsible) */}
                                {removalData && activeGroupChat?.type === 'class_set' && (
                                    <div style={{
                                        background: removalData.is_target
                                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(220, 38, 38, 0.08))'
                                            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.06))',
                                        borderBottom: `1px solid ${removalData.is_target ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`,
                                    }}>
                                        {/* Clickable Header */}
                                        <div
                                            onClick={() => setRemovalExpanded(!removalExpanded)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '10px 16px',
                                                cursor: 'pointer',
                                                transition: 'background 0.15s ease',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <AlertTriangle size={16} color={removalData.is_target ? '#EF4444' : '#F59E0B'} />
                                            <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>
                                                {removalData.is_target
                                                    ? 'Removal Initiated Against You'
                                                    : removalData.is_admin
                                                        ? 'Member Removal Vote'
                                                        : 'Moderation in Progress'}
                                            </span>
                                            {/* Status badge when collapsed */}
                                            {!removalExpanded && removalData.is_admin && !removalData.has_voted && !removalData.is_initiator && (
                                                <span style={{
                                                    fontSize: '0.65rem', fontWeight: 600, padding: '2px 6px',
                                                    borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)',
                                                    color: '#F87171',
                                                }}>
                                                    Action Needed
                                                </span>
                                            )}
                                            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#888' }}>
                                                Expires {new Date(removalData.expires_at).toLocaleDateString()}
                                            </span>
                                            <ChevronDown
                                                size={16}
                                                color="#888"
                                                style={{
                                                    transition: 'transform 0.2s ease',
                                                    transform: removalExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    flexShrink: 0,
                                                }}
                                            />
                                        </div>

                                        {/* Collapsible Body */}
                                        {removalExpanded && (
                                            <div style={{ padding: '0 16px 12px' }}>
                                                {removalData.is_target ? (
                                                    <>
                                                        <p style={{ color: '#F87171', fontSize: '0.82rem', margin: '0 0 6px' }}>
                                                            {removalData.initiator.first_name} {removalData.initiator.last_name} has initiated your removal from this group.
                                                        </p>
                                                        <p style={{ color: '#aaa', fontSize: '0.78rem', margin: '0 0 4px' }}>
                                                            Contact the admins to discuss:
                                                        </p>
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                            {removalData.admins.map(admin => (
                                                                <button
                                                                    key={admin.id}
                                                                    onClick={() => router.post(route('messages.start'), { user_id: admin.id }, { preserveState: false })}
                                                                    style={{
                                                                        padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                        background: 'rgba(59, 130, 246, 0.1)', color: '#60A5FA',
                                                                        fontSize: '0.75rem', cursor: 'pointer',
                                                                    }}
                                                                >
                                                                    DM {admin.first_name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : removalData.is_admin ? (
                                                    <>
                                                        <p style={{ color: '#e0e0e0', fontSize: '0.82rem', margin: '0 0 8px' }}>
                                                            {removalData.initiator.first_name} wants to remove <strong>{removalData.target_user.first_name} {removalData.target_user.last_name}</strong> from this group.
                                                        </p>
                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                            {removalData.votes.map(v => (
                                                                <span key={v.admin_user_id} style={{
                                                                    fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px',
                                                                    background: v.vote === 'confirm' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                                                                    color: v.vote === 'confirm' ? '#F87171' : '#4ADE80',
                                                                }}>
                                                                    {v.admin_name}: {v.vote}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        {!removalData.has_voted && !removalData.is_initiator && (
                                                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                                <button
                                                                    onClick={() => handleRemovalVote('confirm')}
                                                                    disabled={isRemovalAction}
                                                                    style={{
                                                                        padding: '5px 16px', borderRadius: '6px', border: 'none',
                                                                        background: '#EF4444', color: '#fff', fontSize: '0.8rem',
                                                                        fontWeight: 600, cursor: 'pointer', opacity: isRemovalAction ? 0.6 : 1,
                                                                    }}
                                                                >
                                                                    Confirm Remove
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemovalVote('reject')}
                                                                    disabled={isRemovalAction}
                                                                    style={{
                                                                        padding: '5px 16px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.3)',
                                                                        background: 'rgba(34, 197, 94, 0.1)', color: '#4ADE80',
                                                                        fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', opacity: isRemovalAction ? 0.6 : 1,
                                                                    }}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p style={{ color: '#aaa', fontSize: '0.8rem', margin: 0 }}>
                                                        A moderation action is in progress.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Group Messages Container */}
                                <div className="messages-chat-messages">
                                    {isGroupLoading ? (
                                        <div className="messages-loading">
                                            <div className="spinner"></div>
                                            <p>Loading messages...</p>
                                        </div>
                                    ) : groupMessages.length === 0 ? (
                                        <div className="messages-empty-chat">
                                            <Users size={48} strokeWidth={1.5} />
                                            <h4>No messages yet</h4>
                                            <p>Start the conversation in {activeGroupChat.name}!</p>
                                        </div>
                                    ) : (
                                        <>
                                            {groupMessages.map((message, index) => {
                                                const isBroadcast = message.is_org_broadcast;
                                                const isOwnMessage = !isBroadcast && message.user_id === currentUserId;
                                                const showAvatar = !isOwnMessage &&
                                                    (index === 0 || groupMessages[index - 1].user_id !== message.user_id || isBroadcast);
                                                const showName = !isOwnMessage &&
                                                    (index === 0 || groupMessages[index - 1].user_id !== message.user_id || isBroadcast);
                                                const isEditing = editingMessageId === message.id;
                                                const isShowingDeleteConfirm = deletingMessageId === message.id;
                                                const isSelected = selectedMessageIds.includes(message.id);

                                                // Render system messages (null sender)
                                                const isSystemMessage = !isBroadcast && !message.user_id && !message.user;
                                                if (isSystemMessage) {
                                                    return (
                                                        <div key={message.id} style={{
                                                            textAlign: 'center', padding: '8px 16px', margin: '6px 0',
                                                        }}>
                                                            <span style={{
                                                                display: 'inline-block', padding: '6px 14px',
                                                                background: 'rgba(255, 255, 255, 0.05)',
                                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                                borderRadius: '20px', fontSize: '0.78rem',
                                                                color: '#aaa', lineHeight: 1.4,
                                                            }}>
                                                                {message.message}
                                                            </span>
                                                            <div style={{ fontSize: '0.65rem', color: '#666', marginTop: '2px' }}>
                                                                {formatTime(message.created_at)}
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // Render broadcast messages with distinctive styling
                                                if (isBroadcast) {
                                                    const orgName = message.organization?.short_name || message.organization?.name || message.user?.first_name || 'Organization';
                                                    return (
                                                        <div key={message.id} style={{
                                                            padding: '10px 16px',
                                                            margin: '8px 0',
                                                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(109, 40, 217, 0.05))',
                                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                                            borderRadius: '12px',
                                                            borderLeft: '3px solid #8B5CF6',
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                                {message.organization?.logo_url ? (
                                                                    <img src={message.organization.logo_url} alt={orgName}
                                                                        style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <div style={{
                                                                        width: '24px', height: '24px', borderRadius: '6px',
                                                                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                                                                    }}>
                                                                        {orgName.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#8B5CF6' }}>
                                                                    {orgName}
                                                                </span>
                                                                <span style={{
                                                                    fontSize: '0.6rem', fontWeight: 700, color: '#fff',
                                                                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                                                    padding: '1px 6px', borderRadius: '8px', textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px',
                                                                }}>
                                                                    Broadcast
                                                                </span>
                                                            </div>
                                                            <div
                                                                className="broadcast-message-content"
                                                                dangerouslySetInnerHTML={{ __html: message.message }}
                                                                style={{ margin: '0 0 4px', fontSize: '0.875rem', color: '#e0e0e0', lineHeight: 1.5, wordBreak: 'break-word' }}
                                                            />
                                                            <span style={{ fontSize: '0.7rem', color: '#888' }}>
                                                                {formatTime(message.created_at)}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div
                                                        key={message.id}
                                                        className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'} ${isSelected ? 'selected' : ''}`}
                                                    >
                                                        {/* Bulk select checkbox */}
                                                        {isBulkSelectMode && isOwnMessage && (
                                                            <button
                                                                className="message-select-checkbox"
                                                                onClick={() => handleToggleMessageSelect(message.id)}
                                                            >
                                                                {isSelected ? (
                                                                    <CheckSquare size={20} className="checkbox-checked" />
                                                                ) : (
                                                                    <Square size={20} className="checkbox-unchecked" />
                                                                )}
                                                            </button>
                                                        )}

                                                        {!isOwnMessage && (
                                                            <div className={`message-avatar ${showAvatar ? '' : 'invisible'}`}>
                                                                {message.user?.profile_image_url ? (
                                                                    <img
                                                                        src={message.user.profile_image_url}
                                                                        alt={`${message.user.first_name} ${message.user.last_name}`}
                                                                    />
                                                                ) : (
                                                                    <div className="avatar-fallback">
                                                                        {message.user?.first_name?.charAt(0) || '?'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="message-content">
                                                            {showName && !isOwnMessage && (
                                                                <span className="message-sender-name">
                                                                    {message.user?.first_name} {message.user?.last_name}
                                                                </span>
                                                            )}

                                                            {/* Delete confirmation popup */}
                                                            {isShowingDeleteConfirm && (
                                                                <div className="delete-confirm-popup">
                                                                    <span className="delete-confirm-text">Delete?</span>
                                                                    <button
                                                                        className="delete-confirm-yes"
                                                                        onClick={handleConfirmGroupDelete}
                                                                        disabled={isDeleting}
                                                                    >
                                                                        {isDeleting ? '...' : 'Yes'}
                                                                    </button>
                                                                    <button
                                                                        className="delete-confirm-no"
                                                                        onClick={handleCancelDelete}
                                                                        disabled={isDeleting}
                                                                    >
                                                                        No
                                                                    </button>
                                                                </div>
                                                            )}

                                                            <div className={`message-bubble ${isEditing ? 'editing' : ''}`}>
                                                                {isEditing ? (
                                                                    <>
                                                                        <textarea
                                                                            className="message-edit-input"
                                                                            value={editingText}
                                                                            onChange={(e) => setEditingText(e.target.value)}
                                                                            autoFocus
                                                                            maxLength={5000}
                                                                        />
                                                                        <div className="message-edit-actions">
                                                                            <button
                                                                                className="edit-cancel-btn"
                                                                                onClick={handleCancelEdit}
                                                                                disabled={isEditSaving}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                className="edit-save-btn"
                                                                                onClick={handleSaveGroupEdit}
                                                                                disabled={isEditSaving || !editingText.trim()}
                                                                            >
                                                                                {isEditSaving ? '...' : 'Save'}
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <p className="message-text">{message.message}</p>
                                                                )}

                                                                {/* Edit/Delete action icons */}
                                                                {isOwnMessage && !isEditing && !isBulkSelectMode && (
                                                                    <div className="message-actions">
                                                                        <button
                                                                            className="message-action-btn edit-btn"
                                                                            onClick={() => handleStartGroupEdit(message)}
                                                                            title="Edit message"
                                                                        >
                                                                            <Pencil size={11} />
                                                                        </button>
                                                                        <button
                                                                            className="message-action-btn delete-btn"
                                                                            onClick={() => handleShowDeleteConfirm(message.id)}
                                                                            title="Delete message"
                                                                        >
                                                                            <Trash2 size={11} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="message-meta">
                                                                {message.is_edited && (
                                                                    <span className="message-edited">edited</span>
                                                                )}
                                                                <span className="message-time">{formatTime(message.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* Group Message Input */}
                                {isMuted ? (
                                    <div className="messages-input-form" style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        padding: '12px 16px', color: '#F87171', fontSize: '0.85rem',
                                        gap: '6px',
                                    }}>
                                        <AlertTriangle size={16} />
                                        <span>You cannot send messages while a removal is pending.</span>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendGroupMessage} className="messages-input-form">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
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
                                                <span style={{ fontSize: '20px', color: '#ffffff' }}>➤</span>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </>
                        ) : activeConversation ? (
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
                                    <div className="chat-header-actions">
                                        {isBulkSelectMode && selectedMessageIds.length > 0 && (
                                            <div className="bulk-delete-wrapper">
                                                {showBulkDeleteConfirm && (
                                                    <div className="delete-confirm-popup bulk-delete-confirm">
                                                        <span className="delete-confirm-text">Delete {selectedMessageIds.length}?</span>
                                                        <button
                                                            className="delete-confirm-yes"
                                                            onClick={handleBulkDelete}
                                                            disabled={isBulkDeleting}
                                                        >
                                                            {isBulkDeleting ? '...' : 'Yes'}
                                                        </button>
                                                        <button
                                                            className="delete-confirm-no"
                                                            onClick={handleCancelBulkDelete}
                                                            disabled={isBulkDeleting}
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    className="bulk-delete-btn"
                                                    onClick={handleShowBulkDeleteConfirm}
                                                    disabled={isBulkDeleting || showBulkDeleteConfirm}
                                                >
                                                    {isBulkDeleting ? (
                                                        <div className="spinner-small"></div>
                                                    ) : (
                                                        <>
                                                            <Trash2 size={10} />
                                                            <span>Delete ({selectedMessageIds.length})</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            className={`bulk-select-toggle ${isBulkSelectMode ? 'active' : ''}`}
                                            onClick={handleToggleBulkSelect}
                                            title={isBulkSelectMode ? 'Cancel selection' : 'Select messages'}
                                        >
                                            {isBulkSelectMode ? <X size={12} /> : <CheckSquare size={12} />}
                                        </button>
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
                                                const isEditing = editingMessageId === message.id;
                                                const isShowingDeleteConfirm = deletingMessageId === message.id;
                                                const isSelected = selectedMessageIds.includes(message.id);

                                                return (
                                                    <div
                                                        key={message.id}
                                                        className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'} ${isSelected ? 'selected' : ''}`}
                                                    >
                                                        {/* Bulk select checkbox */}
                                                        {isBulkSelectMode && isOwnMessage && (
                                                            <button
                                                                className="message-select-checkbox"
                                                                onClick={() => handleToggleMessageSelect(message.id)}
                                                            >
                                                                {isSelected ? (
                                                                    <CheckSquare size={20} className="checkbox-checked" />
                                                                ) : (
                                                                    <Square size={20} className="checkbox-unchecked" />
                                                                )}
                                                            </button>
                                                        )}

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
                                                            {/* Delete confirmation popup */}
                                                            {isShowingDeleteConfirm && (
                                                                <div className="delete-confirm-popup">
                                                                    <span className="delete-confirm-text">Delete?</span>
                                                                    <button
                                                                        className="delete-confirm-yes"
                                                                        onClick={handleConfirmDelete}
                                                                        disabled={isDeleting}
                                                                    >
                                                                        {isDeleting ? '...' : 'Yes'}
                                                                    </button>
                                                                    <button
                                                                        className="delete-confirm-no"
                                                                        onClick={handleCancelDelete}
                                                                        disabled={isDeleting}
                                                                    >
                                                                        No
                                                                    </button>
                                                                </div>
                                                            )}

                                                            <div className={`message-bubble ${isEditing ? 'editing' : ''}`}>
                                                                {isEditing ? (
                                                                    <>
                                                                        <textarea
                                                                            className="message-edit-input"
                                                                            value={editingText}
                                                                            onChange={(e) => setEditingText(e.target.value)}
                                                                            autoFocus
                                                                            maxLength={5000}
                                                                        />
                                                                        <div className="message-edit-actions">
                                                                            <button
                                                                                className="edit-cancel-btn"
                                                                                onClick={handleCancelEdit}
                                                                                disabled={isEditSaving}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                className="edit-save-btn"
                                                                                onClick={handleSaveEdit}
                                                                                disabled={isEditSaving || !editingText.trim()}
                                                                            >
                                                                                {isEditSaving ? '...' : 'Save'}
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <p className="message-text">{message.message}</p>
                                                                )}

                                                                {/* Edit/Delete action icons */}
                                                                {isOwnMessage && !isEditing && !isBulkSelectMode && (
                                                                    <div className="message-actions">
                                                                        <button
                                                                            className="message-action-btn edit-btn"
                                                                            onClick={() => handleStartEdit(message)}
                                                                            title="Edit message"
                                                                        >
                                                                            <Pencil size={11} />
                                                                        </button>
                                                                        <button
                                                                            className="message-action-btn delete-btn"
                                                                            onClick={() => handleShowDeleteConfirm(message.id)}
                                                                            title="Delete message"
                                                                        >
                                                                            <Trash2 size={11} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="message-meta">
                                                                {message.is_edited && (
                                                                    <span className="message-edited">edited</span>
                                                                )}
                                                                <span className="message-time">{formatTime(message.created_at)}</span>
                                                                {isOwnMessage && (
                                                                    <span className="message-status">
                                                                        {message.is_read ? (
                                                                            <DoubleLeafFilled size={14} className="read-icon" />
                                                                        ) : message.is_delivered ? (
                                                                            <LeafFilled size={14} className="delivered-icon" />
                                                                        ) : (
                                                                            <LeafOutline size={14} className="sent-icon" />
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
                                            <span style={{ fontSize: '20px', color: '#ffffff' }}>➤</span>
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

                    {/* Members Panel */}
                    {showMembersPanel && activeGroupChat?.type === 'class_set' && (
                        <div style={{
                            width: '280px', minWidth: '280px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex', flexDirection: 'column',
                            animation: 'slideInRight 0.2s ease-out',
                        }}>
                            {/* Panel Header */}
                            <div style={{
                                padding: '1rem 1.25rem',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Users size={16} color="#8B5CF6" />
                                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
                                        Members
                                    </span>
                                    <span style={{
                                        fontSize: '0.7rem', color: '#888',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        padding: '2px 6px', borderRadius: '4px',
                                    }}>
                                        {activeGroupChat.member_count}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowMembersPanel(false)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)', border: 'none',
                                        borderRadius: '6px', padding: '4px', cursor: 'pointer',
                                        color: '#888', display: 'flex', transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#ccc'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#888'; }}
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Members List */}
                            <div className="election-candidates-list" style={{
                                flex: 1, overflowY: 'auto', padding: '0.5rem',
                            }}>
                                {membersLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                        <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }}></div>
                                    </div>
                                ) : membersList.length > 0 ? (
                                    <>
                                        {/* Admins first */}
                                        {membersList.filter(m => m.is_admin).length > 0 && (
                                            <div style={{
                                                padding: '0.5rem 0.75rem 0.35rem',
                                                fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                                                letterSpacing: '0.05em', color: '#F59E0B',
                                            }}>
                                                Admins
                                            </div>
                                        )}
                                        {membersList.filter(m => m.is_admin).map(member => (
                                            <div key={member.id} style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '6px 10px', borderRadius: '8px',
                                                transition: 'background 0.15s',
                                                cursor: member.id !== currentUserId ? 'pointer' : 'default',
                                            }}
                                                onClick={() => { if (member.id !== currentUserId) router.post(route('messages.start'), { user_id: member.id }, { preserveState: false }); }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '10px',
                                                    background: 'rgba(139, 92, 246, 0.2)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.75rem', fontWeight: 600, color: '#8B5CF6',
                                                    overflow: 'hidden', flexShrink: 0,
                                                }}>
                                                    {member.profile_image
                                                        ? <img src={member.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        : member.first_name.charAt(0)}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '0.82rem', color: '#e0e0e0', fontWeight: 500 }}>
                                                        {member.first_name} {member.last_name}
                                                        {member.id === currentUserId && <span style={{ fontSize: '0.7rem', color: '#888', marginLeft: '4px' }}>(You)</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                                        @{member.username}
                                                    </div>
                                                </div>
                                                <span style={{
                                                    fontSize: '0.6rem', fontWeight: 700, color: '#F59E0B',
                                                    background: 'rgba(245, 158, 11, 0.12)',
                                                    padding: '2px 6px', borderRadius: '4px', flexShrink: 0,
                                                }}>
                                                    ADMIN
                                                </span>
                                            </div>
                                        ))}

                                        {/* Regular members */}
                                        {membersList.filter(m => !m.is_admin).length > 0 && (
                                            <div style={{
                                                padding: '0.65rem 0.75rem 0.35rem',
                                                fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                                                letterSpacing: '0.05em', color: '#666',
                                            }}>
                                                Members
                                            </div>
                                        )}
                                        {membersList.filter(m => !m.is_admin).map(member => (
                                            <div key={member.id} style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '6px 10px', borderRadius: '8px',
                                                transition: 'background 0.15s',
                                                cursor: member.id !== currentUserId ? 'pointer' : 'default',
                                            }}
                                                onClick={() => { if (member.id !== currentUserId) router.post(route('messages.start'), { user_id: member.id }, { preserveState: false }); }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '10px',
                                                    background: 'rgba(139, 92, 246, 0.2)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.75rem', fontWeight: 600, color: '#8B5CF6',
                                                    overflow: 'hidden', flexShrink: 0,
                                                }}>
                                                    {member.profile_image
                                                        ? <img src={member.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        : member.first_name.charAt(0)}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '0.82rem', color: '#e0e0e0', fontWeight: 500 }}>
                                                        {member.first_name} {member.last_name}
                                                        {member.id === currentUserId && <span style={{ fontSize: '0.7rem', color: '#888', marginLeft: '4px' }}>(You)</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                                        @{member.username}
                                                    </div>
                                                </div>
                                                {/* Remove button - visible to admins only, not for self, not when a removal is already pending */}
                                                {membersList.some(m => m.id === currentUserId && m.is_admin) && member.id !== currentUserId && !removalData && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setRemovalConfirmTarget({ id: member.id, first_name: member.first_name, last_name: member.last_name });
                                                        }}
                                                        title={`Remove ${member.first_name}`}
                                                        style={{
                                                            background: 'rgba(239, 68, 68, 0.08)', border: 'none',
                                                            borderRadius: '6px', padding: '4px', cursor: 'pointer',
                                                            color: '#EF4444', display: 'flex', flexShrink: 0,
                                                            transition: 'all 0.15s ease', opacity: 0.6,
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'; e.currentTarget.style.opacity = '1'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.opacity = '0.6'; }}
                                                    >
                                                        <UserMinus size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#555', fontSize: '0.85rem' }}>
                                        No members found.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
