/**
 * Stories & Notifications Types
 * Centralized type definitions for Stories and Notifications pages
 */

/* ============================================
   IMAGE TYPES
   ============================================ */

export interface Image {
    id: number;
    url: string;
    order: number;
}

/* ============================================
   USER TYPES
   ============================================ */

export interface UserBase {
    id: number;
    name: string;
    username: string;
    profile_image_url: string;
    is_organization?: boolean;
}

export interface UserProfile extends UserBase {
    email: string;
    phone: string | null;
    address: string | null;
    bio: string | null;
    date_of_birth: string | null;
    status: string;
    job_title: string | null;
    education: string | null;
    created_at: string;
}

/* ============================================
   POST TYPES
   ============================================ */

export interface Comment {
    id: number;
    content: string;
    user: UserBase;
    created_at: string;
    created_at_human: string;
}

export interface Post {
    id: number | string;
    type: 'text' | 'voice';
    title: string;
    content: string | null;
    voice_url: string | null;
    voice_duration: number | null;
    views_count: number;
    comments_count: number;
    reactions_count: number;
    user_reaction: string | null;
    images: Image[];
    comments: Comment[];
    user: UserBase;
    is_organization?: boolean;
    created_at: string;
    created_at_human: string;
}

export interface EngagementStats {
    total_posts: number;
    total_reactions: number;
    total_comments: number;
    total_views: number;
    text_posts: number;
    voice_posts: number;
}

/* ============================================
   NOTIFICATION TYPES
   ============================================ */

export interface NotificationData {
    user_id?: number;
    user_name?: string;
    action?: string;
    target?: string;
}

export interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    data?: NotificationData;
}

/* ============================================
   COMPONENT PROPS TYPES
   ============================================ */

export interface PostCardProps {
    post: Post;
    onPostDeleted: (postId: number) => void;
    isOwnPost?: boolean;
}

export interface ProfileSidebarProps {
    user: UserProfile;
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
}

export interface EngagedPostsSidebarProps {
    stats: EngagementStats;
    topPosts: Post[];
}

export interface MyStoriesProps {
    user: UserProfile;
    posts: Post[];
    postCount: number;
    stats: EngagementStats;
    topPosts: Post[];
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
}

export interface NotificationsIndexProps {
    notifications: Notification[];
    unreadCount: number;
}

export interface CreatePostModalProps {
    onClose: () => void;
    onPostCreated: (post: Post) => void;
}

export interface TextPostFormProps {
    onClose: () => void;
    onPostCreated: () => void;
}

export interface VoicePostFormProps {
    onClose: () => void;
    onPostCreated: () => void;
}

/* ============================================
   CONNECTION TYPES
   ============================================ */

export interface ConnectionUser {
    id: number;
    name: string;
    username: string;
    profile_image_url: string;
}

export interface Connection {
    id: number;
    user: ConnectionUser;
    relationship_type: string;
    relationship_label: string;
    status: string;
    accepted_at: string;
    can_undo: boolean;
    undo_expires_at: string;
    is_divorced: boolean;
    divorced_at: string | null;
}

export interface SentRequest {
    id: number;
    recipient: ConnectionUser;
    relationship_type: string;
    relationship_label: string;
    requested_at: string;
}

export interface PendingRequest {
    id: number;
    requester: ConnectionUser;
    relationship_type: string;
    relationship_label: string;
    requested_at: string;
    other_parent?: { id: number; name: string; username: string; profile_image_url?: string } | null;
    needs_other_parent?: boolean;
}

export interface ConnectionPageBaseProps {
    user: UserProfile;
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
    unreadNotificationCount: number;
}

export interface MyConnectionsProps extends ConnectionPageBaseProps {
    connections: Connection[];
    total_count: number;
    relationship_filter: string | null;
}

export interface PendingRequestsProps extends ConnectionPageBaseProps {
    requests: PendingRequest[];
    count: number;
    spouses: Array<{ id: number; name: string; profile_image_url?: string }>;
}

export interface RequestSentProps extends ConnectionPageBaseProps {
    requests: SentRequest[];
    count: number;
}

export interface SendRequestProps extends ConnectionPageBaseProps {
    current_user_id: number;
    spouses: Array<{ id: number; name: string; profile_image_url?: string }>;
}
