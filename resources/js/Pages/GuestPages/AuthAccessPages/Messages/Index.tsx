import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { MessageCircle, Search, ArrowLeft, Users, GraduationCap, Pencil, Trash2, X, Check, CheckSquare, Square, Shield, Vote, UserMinus, Clock, AlertTriangle, ChevronDown, LogOut, Trophy, Sparkles, Reply, Building2, Pin, PinOff, Paperclip, BarChart3, Plus, Lock, Eye, EyeOff, Download, Image as ImageIcon, File } from 'lucide-react';
import '../../../../../css/predictions.css';

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
    reply_to_id: number | null;
    replied_message: {
        id: number;
        message: string;
        sender: { id: number; first_name: string; last_name: string } | null;
    } | null;
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
    id?: number;
    uuid: string;
    type: 'family_tree' | 'class_set' | 'glam_squad' | 'org_group';
    name: string;
    gender_track?: string;
    organization_name?: string;
    member_count: number;
    unread_count: number;
    is_suspended?: boolean;
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
    message_type?: 'text' | 'image' | 'file';
    attachment_url?: string | null;
    attachment_name?: string | null;
    reply_to_id?: number | null;
    replied_message?: {
        id: number;
        message: string;
        sender: { id: number; first_name: string; last_name: string } | null;
    } | null;
    is_edited?: boolean;
    edited_at?: string | null;
    is_pinned?: boolean;
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

interface OrgPollOption {
    id: number;
    label: string;
    votes_count: number;
    percentage: number;
}

interface OrgPoll {
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
    creator: { id: number; first_name: string; last_name: string; username: string; profile_image: string | null } | null;
    options: OrgPollOption[];
    total_votes: number;
    total_voters: number;
    user_votes: number[];
    has_voted: boolean;
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

    // Reply state
    const [replyingTo, setReplyingTo] = useState<Message | GroupMessage | null>(null);

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

    // Prediction banner state
    const [predictionFixtures, setPredictionFixtures] = useState<any[]>([]);
    const [predictionOrgSlug, setPredictionOrgSlug] = useState<string>('');
    const [predictionOrgName, setPredictionOrgName] = useState<string>('');
    const [predictionOrgLogo, setPredictionOrgLogo] = useState<string | null>(null);
    const [predictionBannerExpanded, setPredictionBannerExpanded] = useState(true);
    const [predictionSubmitting, setPredictionSubmitting] = useState(false);
    const [bannerPredForms, setBannerPredForms] = useState<Record<number, { type: string; value: string; homeScore: string; awayScore: string }>>({});

    const getBannerPredForm = (fixtureId: number) => bannerPredForms[fixtureId] || { type: 'match_result', value: '', homeScore: '', awayScore: '' };
    const updateBannerPredForm = (fixtureId: number, updates: Partial<{ type: string; value: string; homeScore: string; awayScore: string }>) => {
        setBannerPredForms(prev => ({ ...prev, [fixtureId]: { ...getBannerPredForm(fixtureId), ...updates } }));
    };

    // Removal state
    const [removalData, setRemovalData] = useState<RemovalData | null>(null);
    const [isRemovalAction, setIsRemovalAction] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Org group chat state (polls, pins, attachments)
    const [orgPolls, setOrgPolls] = useState<OrgPoll[]>([]);
    const [showOrgPollPanel, setShowOrgPollPanel] = useState(false);
    const [showOrgPinPanel, setShowOrgPinPanel] = useState(false);
    const [orgPinnedMessages, setOrgPinnedMessages] = useState<GroupMessage[]>([]);
    const [orgPollsLoading, setOrgPollsLoading] = useState(false);
    const [showCreateOrgPoll, setShowCreateOrgPoll] = useState(false);
    const [orgPollForm, setOrgPollForm] = useState({ question: '', description: '', poll_type: 'single' as 'single' | 'multiple', is_anonymous: false, show_results_before_vote: true, expires_at: '', options: ['', ''] });
    const [orgPollSubmitting, setOrgPollSubmitting] = useState(false);
    const [orgAttachment, setOrgAttachment] = useState<File | null>(null);
    const orgFileInputRef = useRef<HTMLInputElement>(null);

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

    // League table panel state
    const [showLeaguePanel, setShowLeaguePanel] = useState(false);
    const [leagueStandings, setLeagueStandings] = useState<Array<{
        rank: number; user_id: number; first_name: string; last_name: string;
        username: string; profile_image_url: string | null;
        total_points: number; predictions_made: number; correct_predictions: number;
    }>>([]);
    const [leagueLoading, setLeagueLoading] = useState(false);

    // Glam squad panel state
    const [glamStandings, setGlamStandings] = useState<Array<{
        rank: number; user: { id: number; first_name: string; last_name: string; username: string; profile_image_url: string | null } | null;
        total_points: number; challenges_entered: number; top_1_count: number; top_3_count: number; current_entry_streak: number;
    }>>([]);
    const [glamLeagueLoading, setGlamLeagueLoading] = useState(false);

    // Sidebar resize state
    const [sidebarWidth, setSidebarWidth] = useState(380);
    const isResizingRef = useRef(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);
    const channelRef = useRef<any>(null);
    const groupChannelRef = useRef<any>(null);

    // Scroll to bottom of messages
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Sidebar resize handlers
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingRef.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const onMouseMove = (ev: MouseEvent) => {
            if (!isResizingRef.current) return;
            const containerEl = (ev.target as HTMLElement).closest('.messages-container') || document.querySelector('.messages-container');
            if (!containerEl) return;
            const containerRect = containerEl.getBoundingClientRect();
            const newWidth = Math.min(Math.max(ev.clientX - containerRect.left, 260), 600);
            setSidebarWidth(newWidth);
        };

        const onMouseUp = () => {
            isResizingRef.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
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
            : activeGroupChat.type === 'glam_squad'
            ? `glam-squad.${activeGroupChat.uuid}`
            : activeGroupChat.type === 'org_group'
            ? `org-group.${activeGroupChat.uuid}`
            : `family-tree.${activeGroupChat.uuid}`;

        const eventName = activeGroupChat.type === 'class_set'
            ? '.ClassSetMessageSent'
            : activeGroupChat.type === 'glam_squad'
            ? '.GlamSquadMessageSent'
            : activeGroupChat.type === 'org_group'
            ? '.OrgGroupMessageSent'
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
        setReplyingTo(null);
        router.visit(route('messages.show', conversation.uuid), {
            preserveScroll: true,
        });
    };

    // Select a group chat
    const handleSelectGroupChat = useCallback(async (group: GroupChat) => {
        setActiveConversation(null); // Clear DM conversation
        setReplyingTo(null);
        setActiveGroupChat(group);
        setIsGroupLoading(true);
        setGroupMessages([]);
        setShowOrgPollPanel(false);
        setShowOrgPinPanel(false);
        setOrgPolls([]);
        setOrgPinnedMessages([]);
        setOrgAttachment(null);

        try {
            // Use different route based on group type
            const routeName = group.type === 'class_set'
                ? 'class-sets.messages'
                : group.type === 'glam_squad'
                ? 'glam-squad.messages'
                : group.type === 'org_group'
                ? 'org-groups.user.messages'
                : 'family-tree.chat.messages';
            const response = await axios.get(route(routeName, group.uuid));

            // Handle different response formats
            const messages = (group.type === 'class_set' || group.type === 'glam_squad' || group.type === 'org_group')
                ? response.data.messages.map((m: any) => ({
                    id: m.id,
                    user_id: m.sender?.id || m.sender_id || m.user_id,
                    message: m.message,
                    message_type: m.message_type || 'text',
                    attachment_url: m.attachment_url || null,
                    attachment_name: m.attachment_name || null,
                    reply_to_id: m.reply_to_id || null,
                    replied_message: m.replied_message || null,
                    is_pinned: m.is_pinned || false,
                    is_org_broadcast: m.is_org_broadcast || false,
                    organization: m.organization || null,
                    created_at: m.created_at,
                    user: (m.sender || m.user) ? {
                        id: (m.sender || m.user).id,
                        first_name: (m.sender || m.user).first_name,
                        last_name: (m.sender || m.user).last_name,
                        profile_image_url: (m.sender || m.user).profile_image_url || (m.sender || m.user).profile_image,
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

        // Fetch prediction fixtures for football org groups
        try {
            const predRes = await axios.get(route('class-sets.predictions.open', groupUuid));
            setPredictionOrgSlug(predRes.data.organizationSlug || '');
            setPredictionOrgName(predRes.data.organizationName || '');
            setPredictionOrgLogo(predRes.data.organizationLogo || null);
            if (predRes.data.fixtures && predRes.data.fixtures.length > 0) {
                setPredictionFixtures(predRes.data.fixtures);
            } else {
                setPredictionFixtures([]);
            }
        } catch {
            setPredictionFixtures([]);
            setPredictionOrgSlug('');
            setPredictionOrgName('');
            setPredictionOrgLogo(null);
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
            setPredictionFixtures([]);
            setPredictionOrgSlug('');
            setPredictionOrgName('');
            setPredictionOrgLogo(null);
        }
    }, [activeGroupChat, fetchGroupAdminData]);

    // Fetch members list for the panel
    const fetchMembers = useCallback(async () => {
        if (!activeGroupChat) return;
        if (activeGroupChat.type !== 'class_set' && activeGroupChat.type !== 'glam_squad' && activeGroupChat.type !== 'org_group') return;
        setMembersLoading(true);
        try {
            const routeName = activeGroupChat.type === 'glam_squad'
                ? 'glam-squad.members'
                : activeGroupChat.type === 'org_group'
                ? 'org-groups.user.members'
                : 'class-sets.members';
            const response = await axios.get(route(routeName, activeGroupChat.uuid));
            setMembersList(response.data.members || []);
        } catch {
            setMembersList([]);
        } finally {
            setMembersLoading(false);
        }
    }, [activeGroupChat]);

    const toggleMembersPanel = useCallback(() => {
        setShowMembersPanel(prev => {
            if (!prev) {
                setShowLeaguePanel(false);
                fetchMembers();
            }
            return !prev;
        });
    }, [fetchMembers]);

    const fetchLeagueStandings = useCallback(async () => {
        if (!activeGroupChat) return;
        if (activeGroupChat.type === 'glam_squad') {
            setGlamLeagueLoading(true);
            try {
                const response = await axios.get(route('glam-squad.squad-standings', activeGroupChat.uuid));
                setGlamStandings(response.data || []);
            } catch {
                setGlamStandings([]);
            } finally {
                setGlamLeagueLoading(false);
            }
        } else {
            setLeagueLoading(true);
            try {
                const response = await axios.get(route('class-sets.predictions.standings', activeGroupChat.uuid));
                setLeagueStandings(response.data || []);
            } catch {
                setLeagueStandings([]);
            } finally {
                setLeagueLoading(false);
            }
        }
    }, [activeGroupChat]);

    const toggleLeaguePanel = useCallback(() => {
        setShowLeaguePanel(prev => {
            if (!prev) {
                setShowMembersPanel(false);
                fetchLeagueStandings();
            }
            return !prev;
        });
    }, [fetchLeagueStandings]);

    const handleLeaveGroup = useCallback(() => {
        if (!activeGroupChat || isLeaving) return;
        setIsLeaving(true);
        const leaveRoute = activeGroupChat.type === 'glam_squad'
            ? route('glam-squad.leaveSquad', activeGroupChat.uuid)
            : route('class-sets.leave', activeGroupChat.uuid);
        router.post(leaveRoute, {}, {
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

    // Close members panel, league panel and leave confirm when switching chats
    useEffect(() => {
        setShowMembersPanel(false);
        setMembersList([]);
        setShowLeaveConfirm(false);
        setShowLeaguePanel(false);
        setLeagueStandings([]);
        setGlamStandings([]);
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

    // Reply handlers
    const handleReply = useCallback((message: Message | GroupMessage) => {
        setReplyingTo(message);
        // Focus the input
        const input = document.querySelector('.messages-input') as HTMLInputElement;
        if (input) input.focus();
    }, []);

    const handleCancelReply = useCallback(() => {
        setReplyingTo(null);
    }, []);

    const scrollToMessage = useCallback((messageId: number | null) => {
        if (!messageId) return;
        const el = document.getElementById(`msg-${messageId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('message-highlight');
            setTimeout(() => el.classList.remove('message-highlight'), 2000);
        }
    }, []);

    // Send group message
    const handleSendGroupMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if ((!newMessage.trim() && !orgAttachment) || isSending || !activeGroupChat) return;

        setIsSending(true);

        try {
            // Use different route based on group type
            const routeName = activeGroupChat.type === 'class_set'
                ? 'class-sets.send-message'
                : activeGroupChat.type === 'glam_squad'
                ? 'glam-squad.send-message'
                : activeGroupChat.type === 'org_group'
                ? 'org-groups.user.send-message'
                : 'family-tree.chat.send';

            let response;
            if (activeGroupChat.type === 'org_group' && orgAttachment) {
                const formData = new FormData();
                if (newMessage.trim()) formData.append('message', newMessage.trim());
                if (replyingTo) formData.append('reply_to_id', replyingTo.id.toString());
                formData.append('attachment', orgAttachment);
                response = await axios.post(route(routeName, activeGroupChat.uuid), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                response = await axios.post(route(routeName, activeGroupChat.uuid), {
                    message: newMessage.trim(),
                    reply_to_id: replyingTo?.id || null,
                });
            }

            const m = response.data.message;
            // Handle different response formats
            const newMsg = (activeGroupChat.type === 'class_set' || activeGroupChat.type === 'glam_squad' || activeGroupChat.type === 'org_group')
                ? {
                    id: m.id,
                    user_id: (m.sender || m.user)?.id || m.sender_id || m.user_id,
                    message: m.message,
                    message_type: m.message_type || 'text',
                    attachment_url: m.attachment_url || null,
                    attachment_name: m.attachment_name || null,
                    reply_to_id: m.reply_to_id || null,
                    replied_message: m.replied_message || null,
                    is_pinned: m.is_pinned || false,
                    is_org_broadcast: m.is_org_broadcast || false,
                    organization: m.organization || null,
                    created_at: m.created_at,
                    user: (m.sender || m.user) ? {
                        id: (m.sender || m.user).id,
                        first_name: (m.sender || m.user).first_name,
                        last_name: (m.sender || m.user).last_name,
                        profile_image_url: (m.sender || m.user).profile_image_url || (m.sender || m.user).profile_image,
                    } : null,
                }
                : m;

            setGroupMessages(prev => [...prev, newMsg]);
            setNewMessage('');
            setReplyingTo(null);
            setOrgAttachment(null);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error sending group message:', error);
        } finally {
            setIsSending(false);
        }
    }, [newMessage, isSending, activeGroupChat, scrollToBottom, replyingTo, orgAttachment]);

    // Send message
    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || isSending || !activeConversation) return;

        setIsSending(true);

        try {
            const response = await axios.post(route('messages.send', activeConversation.uuid), {
                message: newMessage.trim(),
                reply_to_id: replyingTo?.id || null,
            });

            // Add message to local state
            setMessages(prev => [...prev, response.data.message]);
            setNewMessage('');
            setReplyingTo(null);
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
    }, [newMessage, isSending, activeConversation, scrollToBottom, replyingTo]);

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
                ? (activeGroupChat.type === 'class_set' ? 'class-sets.bulk-delete'
                    : activeGroupChat.type === 'glam_squad' ? 'glam-squad.bulk-delete'
                    : activeGroupChat.type === 'org_group' ? 'org-groups.user.bulk-delete'
                    : 'family-tree.chat.bulk-delete')
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
                : activeGroupChat.type === 'glam_squad'
                ? 'glam-squad.edit-message'
                : activeGroupChat.type === 'org_group'
                ? 'org-groups.user.edit-message'
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
                : activeGroupChat.type === 'glam_squad'
                ? 'glam-squad.delete-message'
                : activeGroupChat.type === 'org_group'
                ? 'org-groups.user.delete-message'
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

    // Org group: toggle pin
    const handleOrgTogglePin = useCallback(async (messageId: number) => {
        if (!activeGroupChat || activeGroupChat.type !== 'org_group') return;
        try {
            const res = await axios.post(route('org-groups.user.toggle-pin', { groupUuid: activeGroupChat.uuid, messageId }));
            const action = res.data.action;
            setGroupMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_pinned: action === 'pinned' } : m));
            if (action === 'pinned') {
                const msg = groupMessages.find(m => m.id === messageId);
                if (msg) setOrgPinnedMessages(prev => [{ ...msg, is_pinned: true }, ...prev]);
            } else {
                setOrgPinnedMessages(prev => prev.filter(m => m.id !== messageId));
            }
        } catch {}
    }, [activeGroupChat, groupMessages]);

    // Org group: load pinned messages
    const loadOrgPinnedMessages = useCallback(async () => {
        if (!activeGroupChat || activeGroupChat.type !== 'org_group') return;
        try {
            const res = await axios.get(route('org-groups.user.pinned', activeGroupChat.uuid));
            setOrgPinnedMessages(res.data.messages || []);
        } catch {}
    }, [activeGroupChat]);

    // Org group: load polls
    const loadOrgPolls = useCallback(async () => {
        if (!activeGroupChat || activeGroupChat.type !== 'org_group') return;
        setOrgPollsLoading(true);
        try {
            const res = await axios.get(route('org-groups.user.polls', activeGroupChat.uuid));
            setOrgPolls(res.data || []);
        } catch {} finally { setOrgPollsLoading(false); }
    }, [activeGroupChat]);

    // Org group: create poll
    const handleCreateOrgPoll = useCallback(async () => {
        if (!activeGroupChat || activeGroupChat.type !== 'org_group') return;
        const validOpts = orgPollForm.options.filter(o => o.trim());
        if (!orgPollForm.question.trim() || validOpts.length < 2) return;
        setOrgPollSubmitting(true);
        try {
            const res = await axios.post(route('org-groups.user.polls.store', activeGroupChat.uuid), {
                question: orgPollForm.question, description: orgPollForm.description || null,
                poll_type: orgPollForm.poll_type, is_anonymous: orgPollForm.is_anonymous,
                show_results_before_vote: orgPollForm.show_results_before_vote,
                options: validOpts, expires_at: orgPollForm.expires_at || null,
            });
            setOrgPolls(prev => [res.data, ...prev]);
            setShowCreateOrgPoll(false);
            setOrgPollForm({ question: '', description: '', poll_type: 'single', is_anonymous: false, show_results_before_vote: true, expires_at: '', options: ['', ''] });
        } catch {} finally { setOrgPollSubmitting(false); }
    }, [activeGroupChat, orgPollForm]);

    // Org group: vote on poll
    const handleOrgPollVote = useCallback(async (pollId: number, optionIds: number[]) => {
        if (!activeGroupChat || activeGroupChat.type !== 'org_group') return;
        try {
            const res = await axios.post(route('org-groups.user.polls.vote', { groupUuid: activeGroupChat.uuid, pollId }), { option_ids: optionIds });
            setOrgPolls(prev => prev.map(p => p.id === pollId ? res.data : p));
        } catch {}
    }, [activeGroupChat]);

    // Org group: close poll
    const handleCloseOrgPoll = useCallback(async (pollId: number) => {
        if (!activeGroupChat || activeGroupChat.type !== 'org_group') return;
        try {
            const res = await axios.post(route('org-groups.user.polls.close', { groupUuid: activeGroupChat.uuid, pollId }));
            setOrgPolls(prev => prev.map(p => p.id === pollId ? res.data : p));
        } catch {}
    }, [activeGroupChat]);

    // Org group: delete poll
    const handleDeleteOrgPoll = useCallback(async (pollId: number) => {
        if (!activeGroupChat || activeGroupChat.type !== 'org_group' || !confirm('Delete this poll?')) return;
        try {
            await axios.delete(route('org-groups.user.polls.destroy', { groupUuid: activeGroupChat.uuid, pollId }));
            setOrgPolls(prev => prev.filter(p => p.id !== pollId));
        } catch {}
    }, [activeGroupChat]);

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
                    <div
                        className={`messages-sidebar ${activeConversation || activeGroupChat ? 'mobile-hidden' : ''}`}
                        style={{ width: sidebarWidth, minWidth: sidebarWidth }}
                    >
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
                                                <div className={`avatar-fallback group-fallback ${group.type === 'class_set' ? 'class-set-fallback' : group.type === 'glam_squad' ? 'glam-squad-fallback' : group.type === 'org_group' ? 'org-group-fallback' : ''}`}>
                                                    {group.type === 'class_set' ? (
                                                        <GraduationCap size={20} />
                                                    ) : group.type === 'glam_squad' ? (
                                                        <Sparkles size={20} />
                                                    ) : group.type === 'org_group' ? (
                                                        <Building2 size={20} />
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

                    {/* Resize Handle */}
                    <div className="sidebar-resize-handle" onMouseDown={handleResizeStart} />

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
                                        onClick={(activeGroupChat.type === 'class_set' || activeGroupChat.type === 'glam_squad') ? toggleMembersPanel : undefined}
                                        style={{ cursor: (activeGroupChat.type === 'class_set' || activeGroupChat.type === 'glam_squad') ? 'pointer' : 'default' }}
                                    >
                                        <div className="chat-user-avatar group-avatar">
                                            <div className={`avatar-fallback group-fallback ${activeGroupChat.type === 'class_set' ? 'class-set-fallback' : activeGroupChat.type === 'glam_squad' ? 'glam-squad-fallback' : ''}`}>
                                                {activeGroupChat.type === 'class_set' ? (
                                                    <GraduationCap size={20} />
                                                ) : activeGroupChat.type === 'glam_squad' ? (
                                                    <Sparkles size={20} />
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
                                                ) : activeGroupChat.type === 'glam_squad' ? (
                                                    <Sparkles size={12} style={{ marginRight: '4px', display: 'inline' }} />
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
                                        {activeGroupChat.type === 'class_set' && predictionOrgSlug && (
                                            <button
                                                onClick={toggleLeaguePanel}
                                                title="League Table"
                                                style={{
                                                    width: '24px', height: '24px', minWidth: '24px', minHeight: '24px',
                                                    maxWidth: '24px', maxHeight: '24px',
                                                    borderRadius: '4px',
                                                    background: showLeaguePanel ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.08)',
                                                    border: `1px solid ${showLeaguePanel ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.15)'}`,
                                                    color: '#8B5CF6',
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', padding: 0, transition: 'all 0.2s ease',
                                                    boxSizing: 'border-box', lineHeight: 1,
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = showLeaguePanel ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.08)'; }}
                                            >
                                                <Trophy size={14} />
                                            </button>
                                        )}
                                        {activeGroupChat.type === 'glam_squad' && (
                                            <button
                                                onClick={toggleLeaguePanel}
                                                title="Leaderboard"
                                                style={{
                                                    width: '24px', height: '24px', minWidth: '24px', minHeight: '24px',
                                                    maxWidth: '24px', maxHeight: '24px',
                                                    borderRadius: '4px',
                                                    background: showLeaguePanel ? 'rgba(236, 72, 153, 0.25)' : 'rgba(236, 72, 153, 0.08)',
                                                    border: `1px solid ${showLeaguePanel ? 'rgba(236, 72, 153, 0.4)' : 'rgba(236, 72, 153, 0.15)'}`,
                                                    color: '#ec4899',
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', padding: 0, transition: 'all 0.2s ease',
                                                    boxSizing: 'border-box', lineHeight: 1,
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.25)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = showLeaguePanel ? 'rgba(236, 72, 153, 0.25)' : 'rgba(236, 72, 153, 0.08)'; }}
                                            >
                                                <Trophy size={14} />
                                            </button>
                                        )}
                                        {activeGroupChat.type === 'org_group' && (
                                            <>
                                                <button
                                                    onClick={() => { setShowOrgPinPanel(!showOrgPinPanel); setShowOrgPollPanel(false); setShowMembersPanel(false); if (!showOrgPinPanel) loadOrgPinnedMessages(); }}
                                                    title="Pinned messages"
                                                    style={{
                                                        width: '24px', height: '24px', minWidth: '24px', minHeight: '24px',
                                                        maxWidth: '24px', maxHeight: '24px',
                                                        borderRadius: '4px',
                                                        background: showOrgPinPanel ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.08)',
                                                        border: `1px solid ${showOrgPinPanel ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.15)'}`,
                                                        color: '#8B5CF6',
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', padding: 0, transition: 'all 0.2s ease',
                                                        boxSizing: 'border-box', lineHeight: 1,
                                                    }}
                                                >
                                                    <Pin size={14} />
                                                </button>
                                                <button
                                                    onClick={() => { setShowOrgPollPanel(!showOrgPollPanel); setShowOrgPinPanel(false); setShowMembersPanel(false); if (!showOrgPollPanel) loadOrgPolls(); }}
                                                    title="Polls"
                                                    style={{
                                                        width: '24px', height: '24px', minWidth: '24px', minHeight: '24px',
                                                        maxWidth: '24px', maxHeight: '24px',
                                                        borderRadius: '4px',
                                                        background: showOrgPollPanel ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.08)',
                                                        border: `1px solid ${showOrgPollPanel ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.15)'}`,
                                                        color: '#F59E0B',
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', padding: 0, transition: 'all 0.2s ease',
                                                        boxSizing: 'border-box', lineHeight: 1,
                                                    }}
                                                >
                                                    <BarChart3 size={14} />
                                                </button>
                                            </>
                                        )}
                                        {(activeGroupChat.type === 'class_set' || activeGroupChat.type === 'glam_squad' || activeGroupChat.type === 'org_group') && (
                                            <button
                                                onClick={toggleMembersPanel}
                                                title="Members"
                                                style={{
                                                    width: '24px', height: '24px', minWidth: '24px', minHeight: '24px',
                                                    maxWidth: '24px', maxHeight: '24px',
                                                    borderRadius: '4px',
                                                    background: showMembersPanel ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.08)',
                                                    border: `1px solid ${showMembersPanel ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.15)'}`,
                                                    color: '#22C55E',
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', padding: 0, transition: 'all 0.2s ease',
                                                    boxSizing: 'border-box', lineHeight: 1,
                                                }}
                                            >
                                                <Users size={14} />
                                            </button>
                                        )}
                                        {(activeGroupChat.type === 'class_set' || activeGroupChat.type === 'glam_squad') && (
                                            <button
                                                onClick={() => setShowLeaveConfirm(true)}
                                                title="Leave group"
                                                style={{
                                                    width: '24px', height: '24px', minWidth: '24px', minHeight: '24px',
                                                    maxWidth: '24px', maxHeight: '24px',
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
                                                <LogOut size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Leave Group Confirmation Dialog */}
                                {showLeaveConfirm && (activeGroupChat.type === 'class_set' || activeGroupChat.type === 'glam_squad') && (
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

                                {/* Prediction Banner (Collapsible) */}
                                {predictionFixtures.length > 0 && activeGroupChat?.type === 'class_set' && (
                                    <div className="pred-banner">
                                        {/* Clickable Header */}
                                        <div className="pred-banner-header" onClick={() => setPredictionBannerExpanded(!predictionBannerExpanded)}>
                                            <Trophy size={14} color="#a78bfa" />
                                            <span className="pred-banner-title">Predictions Open</span>
                                            <span className="pred-banner-count">{predictionFixtures.length}</span>
                                            {predictionOrgSlug && (
                                                <span className="pred-banner-link" onClick={(e) => { e.stopPropagation(); router.visit(`/organizations/${predictionOrgSlug}/predictions`); }}>
                                                    Full League
                                                </span>
                                            )}
                                            <ChevronDown size={16} className="pred-banner-chevron" style={{ transform: predictionBannerExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                        </div>

                                        {/* Collapsible Body — Scrollable fixture cards */}
                                        {predictionBannerExpanded && (
                                            <div className="pred-banner-body">
                                                <div className="pred-banner-scroll">
                                                    {predictionFixtures.map((fixture: any) => {
                                                        const homeName = fixture.venue === 'home' ? predictionOrgName : fixture.opponent_name;
                                                        const awayName = fixture.venue === 'home' ? fixture.opponent_name : predictionOrgName;
                                                        const homeLogo = fixture.venue === 'home' ? predictionOrgLogo : fixture.opponent_logo;
                                                        const awayLogo = fixture.venue === 'home' ? fixture.opponent_logo : predictionOrgLogo;
                                                        const form = getBannerPredForm(fixture.id);

                                                        const submitBannerPrediction = (type: string, value: string, homeScore?: string, awayScore?: string) => {
                                                            if (!predictionOrgSlug || predictionSubmitting) return;
                                                            setPredictionSubmitting(true);
                                                            const data: any = { fixture_id: fixture.id, prediction_type: type, prediction_value: value };
                                                            if (type === 'correct_score') {
                                                                data.predicted_home_score = parseInt(homeScore || '0');
                                                                data.predicted_away_score = parseInt(awayScore || '0');
                                                            }
                                                            axios.post(route('organizations.predictions.predict', predictionOrgSlug), data).then(() => {
                                                                setPredictionFixtures(prev => prev.map(f =>
                                                                    f.id === fixture.id
                                                                        ? { ...f, user_prediction: { prediction_type: type, prediction_value: value, predicted_home_score: data.predicted_home_score ?? null, predicted_away_score: data.predicted_away_score ?? null, is_correct: null, points_earned: 0, is_locked: false } }
                                                                        : f
                                                                ));
                                                            }).catch(() => {}).finally(() => setPredictionSubmitting(false));
                                                        };

                                                        return (
                                                        <div key={fixture.id} className="pred-banner-card">
                                                            {/* Matchup */}
                                                            <div className="pred-banner-matchup">
                                                                <div className="pred-banner-team">
                                                                    <div className="pred-banner-team-logo">
                                                                        {homeLogo
                                                                            ? <img src={homeLogo} alt="" />
                                                                            : <span className="pred-banner-team-logo-fallback">{homeName?.charAt(0)}</span>}
                                                                    </div>
                                                                    <span className="pred-banner-team-name">{homeName}</span>
                                                                </div>
                                                                <span className="pred-banner-vs">vs</span>
                                                                <div className="pred-banner-team away">
                                                                    <div className="pred-banner-team-logo">
                                                                        {awayLogo
                                                                            ? <img src={awayLogo} alt="" />
                                                                            : <span className="pred-banner-team-logo-fallback">{awayName?.charAt(0)}</span>}
                                                                    </div>
                                                                    <span className="pred-banner-team-name">{awayName}</span>
                                                                </div>
                                                            </div>

                                                            {/* Meta */}
                                                            <div className="pred-banner-meta">
                                                                {new Date(fixture.match_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                                {fixture.competition && <> · {fixture.competition}</>}
                                                            </div>

                                                            {/* Already predicted */}
                                                            {fixture.user_prediction ? (
                                                                <div className="pred-banner-confirmed">
                                                                    <Check size={12} />
                                                                    <span>
                                                                        {fixture.user_prediction.prediction_type === 'correct_score'
                                                                            ? `${homeName} ${fixture.user_prediction.predicted_home_score} - ${fixture.user_prediction.predicted_away_score} ${awayName}`
                                                                            : fixture.user_prediction.prediction_value === 'home_win' ? `${homeName} Win`
                                                                            : fixture.user_prediction.prediction_value === 'away_win' ? `${awayName} Win`
                                                                            : fixture.user_prediction.prediction_value === 'draw' ? 'Draw'
                                                                            : fixture.user_prediction.prediction_value === 'home_draw' ? `${homeName}/Draw`
                                                                            : fixture.user_prediction.prediction_value === 'away_draw' ? `${awayName}/Draw`
                                                                            : fixture.user_prediction.prediction_value === 'home_away' ? `${homeName}/${awayName}`
                                                                            : fixture.user_prediction.prediction_value}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {/* Bet Type Selector */}
                                                                    <div className="pred-bet-types">
                                                                        <button className={`pred-bet-type ${form.type === 'match_result' ? 'active' : ''}`}
                                                                            onClick={() => updateBannerPredForm(fixture.id, { type: 'match_result', value: '' })}>
                                                                            Result · 5pts
                                                                        </button>
                                                                        <button className={`pred-bet-type ${form.type === 'double_chance' ? 'active' : ''}`}
                                                                            onClick={() => updateBannerPredForm(fixture.id, { type: 'double_chance', value: '' })}>
                                                                            Double · 2pts
                                                                        </button>
                                                                        <button className={`pred-bet-type ${form.type === 'correct_score' ? 'active' : ''}`}
                                                                            onClick={() => updateBannerPredForm(fixture.id, { type: 'correct_score', value: '' })}>
                                                                            Score · 15pts
                                                                        </button>
                                                                    </div>

                                                                    <p className="pred-pick-label">Pick your prediction</p>

                                                                    {/* Match Result Options */}
                                                                    {form.type === 'match_result' && (
                                                                        <div className="pred-options">
                                                                            {[
                                                                                { value: 'home_win', label: `${homeName} Win` },
                                                                                { value: 'draw', label: 'Draw' },
                                                                                { value: 'away_win', label: `${awayName} Win` },
                                                                            ].map(opt => (
                                                                                <button key={opt.value}
                                                                                    className={`pred-option-btn ${form.value === opt.value ? 'selected' : ''}`}
                                                                                    onClick={() => {
                                                                                        updateBannerPredForm(fixture.id, { value: opt.value });
                                                                                        submitBannerPrediction('match_result', opt.value);
                                                                                    }}
                                                                                    disabled={predictionSubmitting}>
                                                                                    {opt.label}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Double Chance Options */}
                                                                    {form.type === 'double_chance' && (
                                                                        <div className="pred-options">
                                                                            {[
                                                                                { value: 'home_draw', label: `${homeName}/Draw` },
                                                                                { value: 'away_draw', label: `${awayName}/Draw` },
                                                                                { value: 'home_away', label: `${homeName}/${awayName}` },
                                                                            ].map(opt => (
                                                                                <button key={opt.value}
                                                                                    className={`pred-option-btn ${form.value === opt.value ? 'selected' : ''}`}
                                                                                    onClick={() => {
                                                                                        updateBannerPredForm(fixture.id, { value: opt.value });
                                                                                        submitBannerPrediction('double_chance', opt.value);
                                                                                    }}
                                                                                    disabled={predictionSubmitting}>
                                                                                    {opt.label}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Correct Score Inputs */}
                                                                    {form.type === 'correct_score' && (
                                                                        <div className="pred-score-inputs">
                                                                            <span className="pred-score-team-label">{homeName}</span>
                                                                            <input type="number" min="0" max="99" className="pred-score-input" placeholder="0"
                                                                                value={form.homeScore}
                                                                                onChange={(e) => updateBannerPredForm(fixture.id, { homeScore: e.target.value })} />
                                                                            <span className="pred-score-separator">—</span>
                                                                            <input type="number" min="0" max="99" className="pred-score-input" placeholder="0"
                                                                                value={form.awayScore}
                                                                                onChange={(e) => updateBannerPredForm(fixture.id, { awayScore: e.target.value })} />
                                                                            <span className="pred-score-team-label">{awayName}</span>
                                                                            <button className="pred-score-submit"
                                                                                onClick={() => submitBannerPrediction('correct_score', `${form.homeScore}-${form.awayScore}`, form.homeScore, form.awayScore)}
                                                                                disabled={predictionSubmitting || form.homeScore === '' || form.awayScore === ''}>
                                                                                {predictionSubmitting ? '...' : 'Submit'}
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}

                                                            {/* Completed result */}
                                                            {fixture.status === 'completed' && (
                                                                <div className="pred-banner-result">
                                                                    Final: <strong>{homeName} {fixture.home_score} - {fixture.away_score} {awayName}</strong>
                                                                    {fixture.user_prediction?.is_correct !== null && (
                                                                        <span className={`pred-banner-pts ${fixture.user_prediction.is_correct ? 'correct' : 'wrong'}`}>
                                                                            {fixture.user_prediction.is_correct ? `+${fixture.user_prediction.points_earned}` : '0'} pts
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        );
                                                    })}
                                                </div>
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
                                                        id={`msg-${message.id}`}
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
                                                                {/* Quoted replied message */}
                                                                {message.replied_message && !isEditing && (
                                                                    <div className="message-quote" onClick={() => scrollToMessage(message.reply_to_id ?? null)}>
                                                                        <div className="message-quote-bar" />
                                                                        <div className="message-quote-content">
                                                                            <span className="message-quote-name">
                                                                                {message.replied_message.sender
                                                                                    ? `${message.replied_message.sender.first_name} ${message.replied_message.sender.last_name}`
                                                                                    : 'Unknown'}
                                                                            </span>
                                                                            <span className="message-quote-text">
                                                                                {message.replied_message.message.length > 120
                                                                                    ? message.replied_message.message.substring(0, 120) + '...'
                                                                                    : message.replied_message.message}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
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
                                                                    <>
                                                                        {/* Attachment rendering for org_group */}
                                                                        {message.message_type === 'image' && message.attachment_url && (
                                                                            <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: message.message ? '0.4rem' : 0 }}>
                                                                                <img src={message.attachment_url} alt={message.attachment_name || 'Image'}
                                                                                    style={{ maxWidth: '260px', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} />
                                                                            </a>
                                                                        )}
                                                                        {message.message_type === 'file' && message.attachment_url && (
                                                                            <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" download
                                                                                style={{
                                                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                                                    padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)',
                                                                                    borderRadius: '8px', marginBottom: message.message ? '0.4rem' : 0,
                                                                                    textDecoration: 'none', color: '#aaa', fontSize: '0.78rem',
                                                                                }}>
                                                                                <File size={16} />
                                                                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{message.attachment_name || 'Download'}</span>
                                                                                <Download size={14} />
                                                                            </a>
                                                                        )}
                                                                        {message.message && <p className="message-text">{message.message}</p>}
                                                                        {/* Pin indicator */}
                                                                        {message.is_pinned && (
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontSize: '0.65rem', color: '#8B5CF6' }}>
                                                                                <Pin size={10} /> Pinned
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {/* Edit/Delete/Reply action icons */}
                                                                {!isEditing && !isBulkSelectMode && (
                                                                    <div className="message-actions">
                                                                        <button
                                                                            className="message-action-btn reply-btn"
                                                                            onClick={() => handleReply(message)}
                                                                            title="Reply"
                                                                        >
                                                                            <Reply size={11} />
                                                                        </button>
                                                                        {activeGroupChat?.type === 'org_group' && (
                                                                            <button
                                                                                className="message-action-btn"
                                                                                onClick={() => handleOrgTogglePin(message.id)}
                                                                                title={message.is_pinned ? 'Unpin' : 'Pin'}
                                                                                style={{ color: message.is_pinned ? '#8B5CF6' : undefined }}
                                                                            >
                                                                                {message.is_pinned ? <PinOff size={11} /> : <Pin size={11} />}
                                                                            </button>
                                                                        )}
                                                                        {isOwnMessage && (
                                                                            <>
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
                                                                            </>
                                                                        )}
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
                                    <div>
                                        {replyingTo && (
                                            <div className="reply-preview">
                                                <div className="reply-preview-bar" />
                                                <div className="reply-preview-content">
                                                    <span className="reply-preview-name">
                                                        {'user' in replyingTo && replyingTo.user
                                                            ? `${replyingTo.user.first_name} ${replyingTo.user.last_name}`
                                                            : 'sender' in replyingTo && replyingTo.sender
                                                            ? `${(replyingTo as Message).sender!.first_name} ${(replyingTo as Message).sender!.last_name}`
                                                            : 'Unknown'}
                                                    </span>
                                                    <span className="reply-preview-text">
                                                        {replyingTo.message.length > 100
                                                            ? replyingTo.message.substring(0, 100) + '...'
                                                            : replyingTo.message}
                                                    </span>
                                                </div>
                                                <button className="reply-preview-close" onClick={handleCancelReply}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {/* Attachment preview for org_group */}
                                        {activeGroupChat?.type === 'org_group' && orgAttachment && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: 'rgba(139,92,246,0.06)', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.78rem', color: '#aaa' }}>
                                                <Paperclip size={12} />
                                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orgAttachment.name}</span>
                                                <button onClick={() => setOrgAttachment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><X size={14} /></button>
                                            </div>
                                        )}
                                        <form onSubmit={handleSendGroupMessage} className="messages-input-form">
                                            {activeGroupChat?.type === 'org_group' && !activeGroupChat.is_suspended && (
                                                <>
                                                    <input type="file" ref={orgFileInputRef} style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) setOrgAttachment(e.target.files[0]); }} />
                                                    <button type="button" onClick={() => orgFileInputRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '0 0.25rem', display: 'flex', alignItems: 'center' }} title="Attach file">
                                                        <Paperclip size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder={activeGroupChat?.type === 'org_group' && activeGroupChat.is_suspended ? 'Group is suspended...' : 'Type a message...'}
                                                className="messages-input"
                                                disabled={isSending || (activeGroupChat?.type === 'org_group' && activeGroupChat.is_suspended)}
                                                maxLength={5000}
                                            />
                                            <button
                                                type="submit"
                                                className="messages-send-btn"
                                                disabled={(!newMessage.trim() && !orgAttachment) || isSending || (activeGroupChat?.type === 'org_group' && activeGroupChat.is_suspended)}
                                            >
                                                {isSending ? (
                                                    <div className="spinner-small"></div>
                                                ) : (
                                                    <span style={{ fontSize: '20px', color: '#ffffff' }}>➤</span>
                                                )}
                                            </button>
                                        </form>
                                    </div>
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
                                                        id={`msg-${message.id}`}
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
                                                                {/* Quoted replied message */}
                                                                {message.replied_message && !isEditing && (
                                                                    <div className="message-quote" onClick={() => scrollToMessage(message.reply_to_id)}>
                                                                        <div className="message-quote-bar" />
                                                                        <div className="message-quote-content">
                                                                            <span className="message-quote-name">
                                                                                {message.replied_message.sender
                                                                                    ? `${message.replied_message.sender.first_name} ${message.replied_message.sender.last_name}`
                                                                                    : 'Unknown'}
                                                                            </span>
                                                                            <span className="message-quote-text">
                                                                                {message.replied_message.message.length > 120
                                                                                    ? message.replied_message.message.substring(0, 120) + '...'
                                                                                    : message.replied_message.message}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
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

                                                                {/* Edit/Delete/Reply action icons */}
                                                                {!isEditing && !isBulkSelectMode && (
                                                                    <div className="message-actions">
                                                                        <button
                                                                            className="message-action-btn reply-btn"
                                                                            onClick={() => handleReply(message)}
                                                                            title="Reply"
                                                                        >
                                                                            <Reply size={11} />
                                                                        </button>
                                                                        {isOwnMessage && (
                                                                            <>
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
                                                                            </>
                                                                        )}
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
                                <div>
                                    {replyingTo && (
                                        <div className="reply-preview">
                                            <div className="reply-preview-bar" />
                                            <div className="reply-preview-content">
                                                <span className="reply-preview-name">
                                                    {'sender' in replyingTo && replyingTo.sender
                                                        ? `${(replyingTo as Message).sender!.first_name} ${(replyingTo as Message).sender!.last_name}`
                                                        : 'user' in replyingTo && replyingTo.user
                                                        ? `${replyingTo.user.first_name} ${replyingTo.user.last_name}`
                                                        : 'Unknown'}
                                                </span>
                                                <span className="reply-preview-text">
                                                    {replyingTo.message.length > 100
                                                        ? replyingTo.message.substring(0, 100) + '...'
                                                        : replyingTo.message}
                                                </span>
                                            </div>
                                            <button className="reply-preview-close" onClick={handleCancelReply}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
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
                                </div>
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
                    {showMembersPanel && (activeGroupChat?.type === 'class_set' || activeGroupChat?.type === 'glam_squad' || activeGroupChat?.type === 'org_group') && (
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

                    {/* League Table Panel */}
                    {showLeaguePanel && activeGroupChat?.type === 'class_set' && predictionOrgSlug && (
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
                                    <Trophy size={16} color="#8B5CF6" />
                                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
                                        League Table
                                    </span>
                                    <span style={{
                                        fontSize: '0.7rem', color: '#888',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        padding: '2px 6px', borderRadius: '4px',
                                    }}>
                                        {leagueStandings.length}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowLeaguePanel(false)}
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

                            {/* Standings List */}
                            <div className="election-candidates-list" style={{
                                flex: 1, overflowY: 'auto', padding: '0.5rem',
                            }}>
                                {leagueLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                        <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }}></div>
                                    </div>
                                ) : leagueStandings.length > 0 ? (
                                    <>
                                        {/* Column Headers */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '6px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                            marginBottom: '4px',
                                        }}>
                                            <span style={{ width: '20px', fontSize: '0.65rem', fontWeight: 600, color: '#666', textAlign: 'center' }}>#</span>
                                            <span style={{ flex: 1, fontSize: '0.65rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Player</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pts</span>
                                        </div>

                                        {/* Standing Rows */}
                                        {leagueStandings.map((standing) => {
                                            const isCurrentUser = standing.user_id === currentUserId;
                                            const rankColor = standing.rank === 1 ? '#FFD700' : standing.rank === 2 ? '#C0C0C0' : standing.rank === 3 ? '#CD7F32' : '#666';
                                            return (
                                                <div
                                                    key={standing.user_id}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '8px',
                                                        padding: '6px 10px', borderRadius: '8px',
                                                        transition: 'background 0.15s',
                                                        cursor: !isCurrentUser ? 'pointer' : 'default',
                                                        background: isCurrentUser ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                                                        borderLeft: isCurrentUser ? '2px solid #8B5CF6' : '2px solid transparent',
                                                    }}
                                                    onClick={() => { if (!isCurrentUser) router.post(route('messages.start'), { user_id: standing.user_id }, { preserveState: false }); }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = isCurrentUser ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.04)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = isCurrentUser ? 'rgba(139, 92, 246, 0.08)' : 'transparent'; }}
                                                >
                                                    {/* Rank */}
                                                    <span style={{
                                                        width: '20px', textAlign: 'center',
                                                        fontSize: '0.75rem', fontWeight: 700, color: rankColor,
                                                    }}>
                                                        {standing.rank}
                                                    </span>

                                                    {/* Avatar */}
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '10px',
                                                        background: 'rgba(139, 92, 246, 0.2)', display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.75rem', fontWeight: 600, color: '#8B5CF6',
                                                        overflow: 'hidden', flexShrink: 0,
                                                    }}>
                                                        {standing.profile_image_url
                                                            ? <img src={standing.profile_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            : standing.first_name?.charAt(0)}
                                                    </div>

                                                    {/* Name & Stats */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '0.82rem', color: '#e0e0e0', fontWeight: 500 }}>
                                                            {standing.first_name} {standing.last_name}
                                                            {isCurrentUser && <span style={{ fontSize: '0.7rem', color: '#8B5CF6', marginLeft: '4px' }}>(You)</span>}
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                                            {standing.predictions_made} preds &middot; {standing.correct_predictions} correct
                                                        </div>
                                                    </div>

                                                    {/* Points Badge */}
                                                    <span style={{
                                                        fontSize: '0.75rem', fontWeight: 700,
                                                        color: standing.rank <= 3 ? rankColor : '#a78bfa',
                                                        background: standing.rank <= 3
                                                            ? `${rankColor}18`
                                                            : 'rgba(139, 92, 246, 0.12)',
                                                        padding: '2px 8px', borderRadius: '6px', flexShrink: 0,
                                                    }}>
                                                        {standing.total_points}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#555' }}>
                                        <Trophy size={32} color="#444" style={{ marginBottom: '8px' }} />
                                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#777', marginBottom: '4px' }}>
                                            No standings yet
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#555' }}>
                                            Make predictions to climb the league!
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            }}>
                                <button
                                    onClick={() => router.visit(`/organizations/${predictionOrgSlug}/predictions`)}
                                    style={{
                                        width: '100%', padding: '8px 12px',
                                        background: 'rgba(139, 92, 246, 0.15)',
                                        border: '1px solid rgba(139, 92, 246, 0.25)',
                                        borderRadius: '8px', color: '#a78bfa',
                                        fontSize: '0.8rem', fontWeight: 600,
                                        cursor: 'pointer', transition: 'all 0.2s ease',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'; }}
                                >
                                    <Trophy size={14} />
                                    View Full League
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Glam Squad Leaderboard Panel */}
                    {showLeaguePanel && activeGroupChat?.type === 'glam_squad' && (
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
                                    <Trophy size={16} color="#ec4899" />
                                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
                                        Leaderboard
                                    </span>
                                    <span style={{
                                        fontSize: '0.7rem', color: '#888',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        padding: '2px 6px', borderRadius: '4px',
                                    }}>
                                        {glamStandings.length}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowLeaguePanel(false)}
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

                            {/* Standings List */}
                            <div className="election-candidates-list" style={{
                                flex: 1, overflowY: 'auto', padding: '0.5rem',
                            }}>
                                {glamLeagueLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                        <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }}></div>
                                    </div>
                                ) : glamStandings.length > 0 ? (
                                    <>
                                        {/* Column Headers */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '6px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                            marginBottom: '4px',
                                        }}>
                                            <span style={{ width: '20px', fontSize: '0.65rem', fontWeight: 600, color: '#666', textAlign: 'center' }}>#</span>
                                            <span style={{ flex: 1, fontSize: '0.65rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pts</span>
                                        </div>

                                        {/* Standing Rows */}
                                        {glamStandings.map((standing) => {
                                            const isCurrentUser = standing.user?.id === currentUserId;
                                            const rankColor = standing.rank === 1 ? '#FFD700' : standing.rank === 2 ? '#C0C0C0' : standing.rank === 3 ? '#CD7F32' : '#666';
                                            return (
                                                <div
                                                    key={standing.user?.id || standing.rank}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '8px',
                                                        padding: '6px 10px', borderRadius: '8px',
                                                        transition: 'background 0.15s',
                                                        cursor: !isCurrentUser && standing.user ? 'pointer' : 'default',
                                                        background: isCurrentUser ? 'rgba(236, 72, 153, 0.08)' : 'transparent',
                                                        borderLeft: isCurrentUser ? '2px solid #ec4899' : '2px solid transparent',
                                                    }}
                                                    onClick={() => { if (!isCurrentUser && standing.user) router.post(route('messages.start'), { user_id: standing.user.id }, { preserveState: false }); }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = isCurrentUser ? 'rgba(236, 72, 153, 0.12)' : 'rgba(255, 255, 255, 0.04)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = isCurrentUser ? 'rgba(236, 72, 153, 0.08)' : 'transparent'; }}
                                                >
                                                    {/* Rank */}
                                                    <span style={{
                                                        width: '20px', textAlign: 'center',
                                                        fontSize: '0.75rem', fontWeight: 700, color: rankColor,
                                                    }}>
                                                        {standing.rank}
                                                    </span>

                                                    {/* Avatar */}
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '10px',
                                                        background: 'rgba(236, 72, 153, 0.2)', display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.75rem', fontWeight: 600, color: '#ec4899',
                                                        overflow: 'hidden', flexShrink: 0,
                                                    }}>
                                                        {standing.user?.profile_image_url
                                                            ? <img src={standing.user.profile_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            : standing.user?.first_name?.charAt(0)}
                                                    </div>

                                                    {/* Name & Stats */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '0.82rem', color: '#e0e0e0', fontWeight: 500 }}>
                                                            {standing.user?.first_name} {standing.user?.last_name}
                                                            {isCurrentUser && <span style={{ fontSize: '0.7rem', color: '#ec4899', marginLeft: '4px' }}>(You)</span>}
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                                            {standing.challenges_entered} entries &middot; {standing.top_1_count} wins
                                                        </div>
                                                    </div>

                                                    {/* Points Badge */}
                                                    <span style={{
                                                        fontSize: '0.75rem', fontWeight: 700,
                                                        color: standing.rank <= 3 ? rankColor : '#f472b6',
                                                        background: standing.rank <= 3
                                                            ? `${rankColor}18`
                                                            : 'rgba(236, 72, 153, 0.12)',
                                                        padding: '2px 8px', borderRadius: '6px', flexShrink: 0,
                                                    }}>
                                                        {standing.total_points}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#555' }}>
                                        <Trophy size={32} color="#444" style={{ marginBottom: '8px' }} />
                                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#777', marginBottom: '4px' }}>
                                            No standings yet
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#555' }}>
                                            Compete in challenges to climb the leaderboard!
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            }}>
                                <button
                                    onClick={() => router.visit('/glam-squad#leaderboard')}
                                    style={{
                                        width: '100%', padding: '8px 12px',
                                        background: 'rgba(236, 72, 153, 0.15)',
                                        border: '1px solid rgba(236, 72, 153, 0.25)',
                                        borderRadius: '8px', color: '#f472b6',
                                        fontSize: '0.8rem', fontWeight: 600,
                                        cursor: 'pointer', transition: 'all 0.2s ease',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.25)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.15)'; }}
                                >
                                    <Trophy size={14} />
                                    View Full Leaderboard
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Org Group Pinned Messages Panel */}
                    {showOrgPinPanel && activeGroupChat?.type === 'org_group' && (
                        <div style={{
                            width: '280px', background: '#1a1a2e',
                            borderLeft: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', flexDirection: 'column',
                            flexShrink: 0, overflow: 'hidden',
                        }}>
                            <div style={{
                                padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#e0e0e0' }}>
                                    Pinned Messages
                                </p>
                                <button onClick={() => setShowOrgPinPanel(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '2px', display: 'flex' }}>
                                    <X size={16} />
                                </button>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                                {orgPinnedMessages.length > 0 ? orgPinnedMessages.map(msg => (
                                    <div key={msg.id} style={{
                                        padding: '0.6rem 0.75rem', marginBottom: '0.4rem',
                                        background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#8B5CF6', fontWeight: 600 }}>
                                            {msg.user?.first_name} {msg.user?.last_name}
                                        </p>
                                        <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#ccc', lineHeight: 1.4 }}>
                                            {msg.message || '[Attachment]'}
                                        </p>
                                        <p style={{ margin: '3px 0 0', fontSize: '0.65rem', color: '#555' }}>
                                            {formatTime(msg.created_at)}
                                        </p>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                                        <Pin size={28} color="#333" style={{ marginBottom: '0.5rem' }} />
                                        <p style={{ color: '#555', fontSize: '0.8rem', margin: 0 }}>No pinned messages</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Org Group Polls Panel */}
                    {showOrgPollPanel && activeGroupChat?.type === 'org_group' && (
                        <div style={{
                            width: '360px', background: '#1a1a2e',
                            borderLeft: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', flexDirection: 'column',
                            flexShrink: 0, overflow: 'hidden',
                        }}>
                            <div style={{
                                padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#e0e0e0' }}>
                                    Polls
                                </p>
                                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    <button onClick={() => setShowCreateOrgPoll(true)} style={{
                                        background: 'rgba(139,92,246,0.15)', border: 'none', borderRadius: '6px',
                                        padding: '4px 8px', cursor: 'pointer', color: '#8B5CF6',
                                        fontSize: '0.7rem', fontWeight: 600, display: 'flex',
                                        alignItems: 'center', gap: '3px',
                                    }}>
                                        <Plus size={12} /> New
                                    </button>
                                    <button onClick={() => setShowOrgPollPanel(false)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '2px', display: 'flex' }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                                {/* Create Poll Form */}
                                {showCreateOrgPoll && (
                                    <div style={{
                                        background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)',
                                        borderRadius: '10px', padding: '0.85rem', marginBottom: '0.75rem',
                                    }}>
                                        <input type="text" value={orgPollForm.question}
                                            onChange={e => setOrgPollForm(f => ({ ...f, question: e.target.value }))}
                                            placeholder="Ask a question..."
                                            style={{
                                                width: '100%', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff',
                                                fontSize: '0.78rem', fontWeight: 600, outline: 'none', marginBottom: '0.5rem',
                                            }} />
                                        <textarea value={orgPollForm.description}
                                            onChange={e => setOrgPollForm(f => ({ ...f, description: e.target.value }))}
                                            placeholder="Description (optional)" rows={2}
                                            style={{
                                                width: '100%', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff',
                                                fontSize: '0.78rem', outline: 'none', resize: 'none' as const, marginBottom: '0.5rem',
                                            }} />

                                        <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#888', margin: '0 0 0.3rem', textTransform: 'uppercase' }}>
                                            Options
                                        </p>
                                        {orgPollForm.options.map((opt, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.3rem' }}>
                                                <input type="text" value={opt}
                                                    onChange={e => {
                                                        const next = [...orgPollForm.options];
                                                        next[i] = e.target.value;
                                                        setOrgPollForm(f => ({ ...f, options: next }));
                                                    }}
                                                    placeholder={`Option ${i + 1}`}
                                                    style={{
                                                        flex: 1, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)',
                                                        borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff',
                                                        fontSize: '0.78rem', outline: 'none',
                                                    }} />
                                                {orgPollForm.options.length > 2 && (
                                                    <button onClick={() => setOrgPollForm(f => ({ ...f, options: f.options.filter((_, j) => j !== i) }))}
                                                        style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {orgPollForm.options.length < 10 && (
                                            <button onClick={() => setOrgPollForm(f => ({ ...f, options: [...f.options, ''] }))}
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
                                                    <button key={t} onClick={() => setOrgPollForm(f => ({ ...f, poll_type: t }))} style={{
                                                        flex: 1, padding: '0.35rem', borderRadius: '6px', fontSize: '0.7rem',
                                                        fontWeight: 500, cursor: 'pointer', border: 'none',
                                                        background: orgPollForm.poll_type === t ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.03)',
                                                        color: orgPollForm.poll_type === t ? '#8B5CF6' : '#666',
                                                    }}>
                                                        {t === 'single' ? 'Single choice' : 'Multiple choice'}
                                                    </button>
                                                ))}
                                            </div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.72rem', color: '#888' }}>
                                                <input type="checkbox" checked={orgPollForm.is_anonymous}
                                                    onChange={e => setOrgPollForm(f => ({ ...f, is_anonymous: e.target.checked }))}
                                                    style={{ accentColor: '#8B5CF6', width: '13px', height: '13px' }} />
                                                Anonymous voting
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.72rem', color: '#888' }}>
                                                <input type="checkbox" checked={orgPollForm.show_results_before_vote}
                                                    onChange={e => setOrgPollForm(f => ({ ...f, show_results_before_vote: e.target.checked }))}
                                                    style={{ accentColor: '#8B5CF6', width: '13px', height: '13px' }} />
                                                Show results before voting
                                            </label>
                                            <div>
                                                <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>Expires</label>
                                                <input type="datetime-local" value={orgPollForm.expires_at}
                                                    onChange={e => setOrgPollForm(f => ({ ...f, expires_at: e.target.value }))}
                                                    style={{
                                                        width: '100%', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)',
                                                        borderRadius: '6px', padding: '0.35rem 0.5rem', color: '#fff',
                                                        fontSize: '0.72rem', outline: 'none',
                                                    }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end', marginTop: '0.6rem' }}>
                                            <button onClick={() => setShowCreateOrgPoll(false)} style={{
                                                padding: '0.35rem 0.75rem', borderRadius: '6px',
                                                background: 'rgba(255,255,255,0.05)', border: 'none',
                                                color: '#888', fontSize: '0.72rem', cursor: 'pointer',
                                            }}>Cancel</button>
                                            <button onClick={handleCreateOrgPoll}
                                                disabled={orgPollSubmitting || !orgPollForm.question.trim() || orgPollForm.options.filter(o => o.trim()).length < 2}
                                                style={{
                                                    padding: '0.35rem 0.75rem', borderRadius: '6px',
                                                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                                    border: 'none', color: '#fff', fontSize: '0.72rem',
                                                    fontWeight: 600, cursor: 'pointer',
                                                    opacity: orgPollSubmitting || !orgPollForm.question.trim() || orgPollForm.options.filter(o => o.trim()).length < 2 ? 0.5 : 1,
                                                }}>
                                                {orgPollSubmitting ? 'Creating...' : 'Create Poll'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Polls list */}
                                {orgPollsLoading ? (
                                    <p style={{ color: '#666', textAlign: 'center', padding: '1.5rem', fontSize: '0.82rem' }}>Loading...</p>
                                ) : orgPolls.length > 0 ? orgPolls.map(poll => {
                                    const selectedOptions = poll.user_votes || [];
                                    const canSeeResults = poll.has_voted || poll.show_results_before_vote || poll.is_closed;

                                    return (
                                        <div key={poll.id} style={{
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
                                                        <button onClick={() => handleCloseOrgPoll(poll.id)} title="Close poll" style={{
                                                            background: 'none', border: 'none', cursor: 'pointer',
                                                            color: '#F59E0B', padding: '2px', display: 'flex',
                                                        }}>
                                                            <Lock size={12} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteOrgPoll(poll.id)} title="Delete poll" style={{
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
                                                <span style={{
                                                    fontSize: '0.6rem', fontWeight: 600, color: '#888',
                                                    background: 'rgba(255,255,255,0.05)', padding: '1px 5px',
                                                    borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px',
                                                }}>
                                                    {poll.poll_type === 'single' ? 'Single choice' : 'Multiple choice'}
                                                </span>
                                                {poll.is_anonymous && (
                                                    <span style={{
                                                        fontSize: '0.6rem', fontWeight: 600, color: '#888',
                                                        background: 'rgba(255,255,255,0.05)', padding: '1px 5px',
                                                        borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px',
                                                    }}>
                                                        <EyeOff size={9} /> Anonymous
                                                    </span>
                                                )}
                                                {poll.is_closed && (
                                                    <span style={{
                                                        fontSize: '0.6rem', fontWeight: 600, color: '#EF4444',
                                                        background: 'rgba(239,68,68,0.1)', padding: '1px 5px',
                                                        borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px',
                                                    }}>
                                                        {poll.is_expired ? 'Expired' : 'Closed'}
                                                    </span>
                                                )}
                                                {poll.expires_at && !poll.is_expired && (
                                                    <span style={{
                                                        fontSize: '0.6rem', fontWeight: 600, color: '#888',
                                                        background: 'rgba(255,255,255,0.05)', padding: '1px 5px',
                                                        borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px',
                                                    }}>
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
                                                        <button key={opt.id}
                                                            onClick={() => {
                                                                if (poll.is_closed) return;
                                                                handleOrgPollVote(poll.id, [opt.id]);
                                                            }}
                                                            disabled={poll.is_closed}
                                                            style={{
                                                                position: 'relative', display: 'flex', alignItems: 'center',
                                                                gap: '0.4rem', padding: '0.45rem 0.6rem', borderRadius: '8px',
                                                                background: isSelected ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.02)',
                                                                border: `1px solid ${isSelected ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.06)'}`,
                                                                cursor: poll.is_closed ? 'default' : 'pointer',
                                                                textAlign: 'left' as const, overflow: 'hidden',
                                                                transition: 'all 0.15s',
                                                            }}
                                                        >
                                                            {showBar && (
                                                                <div style={{
                                                                    position: 'absolute', left: 0, top: 0, bottom: 0,
                                                                    width: `${opt.percentage}%`,
                                                                    background: isSelected ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                                                                    borderRadius: '8px', transition: 'width 0.3s ease',
                                                                }} />
                                                            )}
                                                            <div style={{
                                                                width: '14px', height: '14px',
                                                                borderRadius: poll.poll_type === 'single' ? '50%' : '3px',
                                                                border: `2px solid ${isSelected ? '#8B5CF6' : '#555'}`,
                                                                background: isSelected ? '#8B5CF6' : 'transparent',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                flexShrink: 0, position: 'relative', zIndex: 1,
                                                            }}>
                                                                {isSelected && <Check size={10} color="#fff" />}
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
                                                                    color: isSelected ? '#8B5CF6' : '#666',
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
                                }) : !showCreateOrgPoll && (
                                    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                                        <BarChart3 size={28} color="#333" style={{ marginBottom: '0.5rem' }} />
                                        <p style={{ color: '#555', fontSize: '0.8rem', margin: 0 }}>No polls yet</p>
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
