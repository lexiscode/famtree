import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

interface CommentModalPost {
    id: number | string;
    org_post_id?: number;
    content: string | null;
    type: string;
    user: {
        id: number;
        name: string;
        username: string;
        profile_image_url: string | null;
        is_organization?: boolean;
    };
    is_organization?: boolean;
    created_at_human: string;
}

interface CommentModalProps {
    post: CommentModalPost;
    isOpen: boolean;
    onClose: () => void;
    onCommentSubmitted: (comment: any) => void;
}

export default function CommentModal({ post, isOpen, onClose, onCommentSubmitted }: CommentModalProps) {
    const { props } = usePage();
    const currentUser = (props as any).auth?.user;
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isOrgPost = post.is_organization || post.user?.is_organization;

    useEffect(() => {
        if (isOpen && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isOpen]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!replyText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const commentRoute = isOrgPost
                ? `/stories/org/${post.org_post_id}/comments`
                : `/stories/${post.id}/comments`;
            const response = await axios.post(commentRoute, { content: replyText });
            setReplyText('');
            onCommentSubmitted(response.data?.comment);
            onClose();
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    };

    if (!isOpen) return null;

    // Strip HTML tags for preview
    const plainContent = post.content
        ? post.content.replace(/<[^>]*>/g, '')
        : '';

    return (
        <div className="comment-modal-overlay" onClick={onClose}>
            <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="comment-modal-header">
                    <h3>Reply</h3>
                    <button className="comment-modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Original Post Preview */}
                <div className="comment-modal-original-post">
                    <div className="comment-modal-post-row">
                        <img
                            src={post.user.profile_image_url || '/images/default-avatar.png'}
                            alt={post.user.name}
                            className="comment-modal-avatar"
                        />
                        <div className="comment-modal-post-info">
                            <div className="comment-modal-post-meta">
                                <span className="comment-modal-name">{post.user.name}</span>
                                <span className="comment-modal-username">@{post.user.username}</span>
                                <span className="comment-modal-dot">·</span>
                                <span className="comment-modal-time">{post.created_at_human}</span>
                            </div>
                            {plainContent && (
                                <p className="comment-modal-post-content">
                                    {plainContent.length > 280 ? plainContent.substring(0, 280) + '...' : plainContent}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="comment-modal-thread-line" />
                    <p className="comment-modal-replying-to">
                        Replying to <span>@{post.user.username}</span>
                    </p>
                </div>

                {/* Reply Area */}
                <div className="comment-modal-reply-area">
                    <img
                        src={currentUser?.profile_image_url || '/images/default-avatar.png'}
                        alt="You"
                        className="comment-modal-avatar"
                    />
                    <textarea
                        ref={textareaRef}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Post your reply"
                        className="comment-modal-textarea"
                        maxLength={1000}
                        rows={4}
                    />
                </div>

                {/* Bottom Bar */}
                <div className="comment-modal-footer">
                    <span className="comment-modal-char-count">
                        {replyText.length}/1000
                    </span>
                    <button
                        className="comment-modal-submit-btn"
                        onClick={handleSubmit}
                        disabled={!replyText.trim() || isSubmitting}
                    >
                        {isSubmitting ? 'Replying...' : 'Reply'}
                    </button>
                </div>
            </div>
        </div>
    );
}
