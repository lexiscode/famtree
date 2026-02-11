import { useState, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Heart, MessageCircle, Link2, Trash2, ChevronDown, Send, Check, Building2 } from 'lucide-react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Comment, Post } from '@/types';
import axios from 'axios';

interface ThreadData {
    type: 'post' | 'org';
    comment: Comment;
    post?: Post;
    org_post?: Post;
    other_comments: Comment[];
}

interface Props {
    thread: ThreadData;
}

function ThreadCommentItem({
    comment,
    isHighlighted,
    currentUserId,
    isOrgComment,
    onLike,
    onDelete,
    onShare,
    onReply,
    replyingTo,
    replyText,
    onReplyTextChange,
    onReplySubmit,
    onCancelReply,
    replyLoading,
    expandedReplies,
    onToggleExpand,
    isTopLevel = true,
}: {
    comment: Comment;
    isHighlighted?: boolean;
    currentUserId: number | null;
    isOrgComment: boolean;
    onLike: (id: number, isOrg: boolean) => void;
    onDelete: (id: number, isOrg: boolean) => void;
    onShare: (uuid: string) => void;
    onReply: (id: number) => void;
    replyingTo: number | null;
    replyText: Record<number, string>;
    onReplyTextChange: (id: number, text: string) => void;
    onReplySubmit: (id: number) => void;
    onCancelReply: () => void;
    replyLoading: boolean;
    expandedReplies: Set<number>;
    onToggleExpand: (id: number) => void;
    isTopLevel?: boolean;
}) {
    const replies = comment.replies || [];
    const isExpanded = expandedReplies.has(comment.id);
    const visibleReplies = isExpanded ? replies : replies.slice(0, 2);
    const hiddenCount = replies.length - 2;
    const avatarSize = isTopLevel ? 40 : 32;

    return (
        <div className={`comment-thread ${isTopLevel ? '' : 'comment-reply'}`}>
            <div className={`comment-item-threaded ${isHighlighted ? 'highlighted' : ''} ${!isTopLevel ? 'is-reply' : ''}`}>
                <img
                    src={comment.user.profile_image_url || '/images/default-avatar.png'}
                    alt={comment.user.name}
                    className="comment-avatar-threaded"
                    style={{ width: avatarSize, height: avatarSize }}
                />
                <div className="comment-body">
                    <div className="comment-meta">
                        <span className="comment-author-name">{comment.user.name}</span>
                        <span className="comment-username">@{comment.user.username}</span>
                        <span className="comment-dot">·</span>
                        <span className="comment-timestamp">{comment.created_at_human}</span>
                    </div>
                    <p className="comment-text-content">{comment.content}</p>
                    <div className="comment-actions-row">
                        <button
                            className={`comment-action-btn ${comment.user_has_liked ? 'liked' : ''}`}
                            onClick={() => onLike(comment.id, isOrgComment)}
                        >
                            <Heart size={14} fill={comment.user_has_liked ? 'currentColor' : 'none'} />
                            {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                        </button>
                        {isTopLevel && (
                            <button className="comment-action-btn" onClick={() => onReply(comment.id)}>
                                <MessageCircle size={14} />
                                {comment.replies_count > 0 && <span>{comment.replies_count}</span>}
                            </button>
                        )}
                        <button className="comment-action-btn" onClick={() => onShare(comment.uuid)}>
                            <Link2 size={14} />
                        </button>
                        {currentUserId === comment.user.id && (
                            <button className="comment-action-btn delete" onClick={() => onDelete(comment.id, isOrgComment)}>
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>

                    {replyingTo === comment.id && (
                        <div className="reply-form-container">
                            <textarea
                                value={replyText[comment.id] || ''}
                                onChange={(e) => onReplyTextChange(comment.id, e.target.value)}
                                placeholder={`Reply to @${comment.user.username}...`}
                                className="reply-textarea"
                                rows={2}
                                maxLength={1000}
                                autoFocus
                            />
                            <div className="reply-form-footer">
                                <span className="reply-char-count">{(replyText[comment.id] || '').length}/1000</span>
                                <div className="reply-form-actions">
                                    <button className="reply-cancel-btn" onClick={onCancelReply}>Cancel</button>
                                    <button
                                        className="reply-submit-btn"
                                        onClick={() => onReplySubmit(comment.id)}
                                        disabled={!(replyText[comment.id] || '').trim() || replyLoading}
                                    >
                                        {replyLoading ? 'Sending...' : 'Reply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isTopLevel && replies.length > 0 && (
                <div className="comment-replies-container">
                    {visibleReplies.map((reply) => (
                        <ThreadCommentItem
                            key={reply.id}
                            comment={reply}
                            currentUserId={currentUserId}
                            isOrgComment={isOrgComment}
                            onLike={onLike}
                            onDelete={onDelete}
                            onShare={onShare}
                            onReply={onReply}
                            replyingTo={replyingTo}
                            replyText={replyText}
                            onReplyTextChange={onReplyTextChange}
                            onReplySubmit={onReplySubmit}
                            onCancelReply={onCancelReply}
                            replyLoading={replyLoading}
                            expandedReplies={expandedReplies}
                            onToggleExpand={onToggleExpand}
                            isTopLevel={false}
                        />
                    ))}
                    {!isExpanded && hiddenCount > 0 && (
                        <button className="view-more-replies-btn" onClick={() => onToggleExpand(comment.id)}>
                            <ChevronDown size={14} />
                            View {hiddenCount} more {hiddenCount === 1 ? 'reply' : 'replies'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ShowCommentThread({ thread }: Props) {
    const { props } = usePage();
    const currentUserId = (props as any).auth?.user?.id ?? null;
    const post = thread.post || thread.org_post;
    const isOrg = thread.type === 'org';
    const highlightedComment = thread.comment;

    const [comments, setComments] = useState<Comment[]>(thread.other_comments || []);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState<Record<number, string>>({});
    const [replyLoading, setReplyLoading] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
    const [linkCopied, setLinkCopied] = useState(false);

    const handleLike = useCallback(async (commentId: number, isOrgComment: boolean) => {
        try {
            const likeRoute = isOrgComment
                ? route('stories.org.comments.like', commentId)
                : route('stories.comments.like', commentId);
            const response = await axios.post(likeRoute);

            const updateLike = (list: Comment[]): Comment[] =>
                list.map(c => {
                    if (c.id === commentId) return { ...c, user_has_liked: response.data.liked, likes_count: response.data.likes_count };
                    if (c.replies?.length) return { ...c, replies: updateLike(c.replies) };
                    return c;
                });
            setComments(prev => updateLike(prev));
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    }, []);

    const handleDelete = useCallback(async (commentId: number, isOrgComment: boolean) => {
        if (!confirm('Delete this comment?')) return;
        try {
            const deleteRoute = isOrgComment
                ? route('stories.org.comments.destroy', commentId)
                : route('stories.comments.destroy', commentId);
            await axios.delete(deleteRoute);

            const removeComment = (list: Comment[]): Comment[] =>
                list.filter(c => c.id !== commentId).map(c => ({
                    ...c,
                    replies: c.replies ? removeComment(c.replies) : [],
                    replies_count: c.replies ? removeComment(c.replies).length : 0,
                }));
            setComments(prev => removeComment(prev));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    }, []);

    const handleShare = useCallback((uuid: string) => {
        const link = `${window.location.origin}/stories/comments/${uuid}`;
        navigator.clipboard.writeText(link).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }).catch(() => {});
    }, []);

    const handleReplySubmit = useCallback(async (parentCommentId: number) => {
        const text = replyText[parentCommentId];
        if (!text?.trim()) return;

        setReplyLoading(true);
        try {
            const postId = isOrg ? (post as any)?.org_post_id : post?.id;
            const commentRoute = isOrg
                ? route('stories.org.comments.store', postId)
                : route('stories.comments.store', postId);
            const response = await axios.post(commentRoute, {
                content: text,
                parent_comment_id: parentCommentId,
            });

            if (response.data?.comment) {
                setComments(prev => prev.map(c => {
                    if (c.id === parentCommentId) {
                        return {
                            ...c,
                            replies: [...(c.replies || []), response.data.comment],
                            replies_count: (c.replies_count || 0) + 1,
                        };
                    }
                    return c;
                }));
            }

            setReplyText(prev => ({ ...prev, [parentCommentId]: '' }));
            setReplyingTo(null);
        } catch (error) {
            console.error('Error posting reply:', error);
        } finally {
            setReplyLoading(false);
        }
    }, [replyText, isOrg, post]);

    return (
        <AuthAccessLayout>
            <Head title="Comment Thread" />
            <div className="stories-page">
                <div className="stories-container" style={{ maxWidth: '700px' }}>
                    {/* Back Button */}
                    <button className="back-button" onClick={() => router.visit('/')}>
                        <ArrowLeft size={18} /> Back to Feed
                    </button>

                    {/* Original Post Preview */}
                    {post && (
                        <div className="comment-thread-post-preview">
                            <div className="thread-post-header">
                                {post.user?.is_organization ? (
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        {post.user.profile_image_url ? (
                                            <img src={post.user.profile_image_url} alt={post.user.name}
                                                style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                                        ) : (
                                            <Building2 size={18} color="#fff" />
                                        )}
                                    </div>
                                ) : (
                                    <img src={post.user?.profile_image_url || '/images/default-avatar.png'}
                                        alt={post.user?.name || ''} className="thread-post-avatar" />
                                )}
                                <div>
                                    <span className="thread-post-name">{post.user?.name}</span>
                                    <span className="thread-post-time">{post.created_at_human}</span>
                                </div>
                            </div>
                            {post.content && (
                                <p className="thread-post-content">
                                    {typeof post.content === 'string' && post.content.length > 200
                                        ? post.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
                                        : post.content?.replace?.(/<[^>]*>/g, '') || ''}
                                </p>
                            )}
                            {post.title && <p className="thread-post-title">{post.title}</p>}
                        </div>
                    )}

                    {/* Highlighted Comment */}
                    <div className="highlighted-comment-section">
                        <h3 className="thread-section-title">Highlighted Comment</h3>
                        <ThreadCommentItem
                            comment={highlightedComment}
                            isHighlighted
                            currentUserId={currentUserId}
                            isOrgComment={isOrg}
                            onLike={handleLike}
                            onDelete={handleDelete}
                            onShare={handleShare}
                            onReply={(id) => setReplyingTo(replyingTo === id ? null : id)}
                            replyingTo={replyingTo}
                            replyText={replyText}
                            onReplyTextChange={(id, text) => setReplyText(prev => ({ ...prev, [id]: text }))}
                            onReplySubmit={handleReplySubmit}
                            onCancelReply={() => setReplyingTo(null)}
                            replyLoading={replyLoading}
                            expandedReplies={expandedReplies}
                            onToggleExpand={(id) => setExpandedReplies(prev => {
                                const next = new Set(prev);
                                if (next.has(id)) next.delete(id); else next.add(id);
                                return next;
                            })}
                        />
                    </div>

                    {/* Other Comments */}
                    {comments.length > 0 && (
                        <div className="other-comments-section">
                            <h3 className="thread-section-title">Other Comments</h3>
                            <div className="comments-list-threaded">
                                {comments.filter(c => c.id !== highlightedComment.id).map((comment) => (
                                    <ThreadCommentItem
                                        key={comment.id}
                                        comment={comment}
                                        currentUserId={currentUserId}
                                        isOrgComment={isOrg}
                                        onLike={handleLike}
                                        onDelete={handleDelete}
                                        onShare={handleShare}
                                        onReply={(id) => setReplyingTo(replyingTo === id ? null : id)}
                                        replyingTo={replyingTo}
                                        replyText={replyText}
                                        onReplyTextChange={(id, text) => setReplyText(prev => ({ ...prev, [id]: text }))}
                                        onReplySubmit={handleReplySubmit}
                                        onCancelReply={() => setReplyingTo(null)}
                                        replyLoading={replyLoading}
                                        expandedReplies={expandedReplies}
                                        onToggleExpand={(id) => setExpandedReplies(prev => {
                                            const next = new Set(prev);
                                            if (next.has(id)) next.delete(id); else next.add(id);
                                            return next;
                                        })}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Link Copied Toast */}
                    {linkCopied && (
                        <div className="link-copied-toast" style={{ position: 'fixed', bottom: '2rem', right: '2rem' }}>
                            <Check size={14} /> Link copied!
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
