import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Heart, MessageCircle, Share2, Trash2, Play, Pause, X, AlertTriangle, Send, Copy, Check, Building2, ChevronDown, ChevronLeft, ChevronRight, Link2, Repeat2, Bookmark, ImageIcon } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { Post, PostCardProps, Comment } from '@/types';
import axios from 'axios';

function CommentItem({
    comment,
    currentUserId,
    isOrgComment,
    onReply,
    replyingTo,
    replyText,
    onReplyTextChange,
    onReplySubmit,
    onCancelReply,
    replyLoading,
    expandedReplies,
    onToggleExpand,
    onLike,
    onDelete,
    onShare,
    isTopLevel = true,
}: {
    comment: Comment;
    currentUserId: number | null;
    isOrgComment: boolean;
    onReply: (commentId: number) => void;
    replyingTo: number | null;
    replyText: Record<number, string>;
    onReplyTextChange: (commentId: number, text: string) => void;
    onReplySubmit: (commentId: number) => void;
    onCancelReply: () => void;
    replyLoading: boolean;
    expandedReplies: Set<number>;
    onToggleExpand: (commentId: number) => void;
    onLike: (commentId: number, isOrg: boolean) => void;
    onDelete: (commentId: number, isOrg: boolean) => void;
    onShare: (uuid: string) => void;
    isTopLevel?: boolean;
}) {
    const replies = comment.replies || [];
    const isExpanded = expandedReplies.has(comment.id);
    const visibleReplies = isExpanded ? replies : replies.slice(0, 2);
    const hiddenCount = replies.length - 2;
    const avatarSize = isTopLevel ? 40 : 32;

    return (
        <div className={`comment-thread ${isTopLevel ? '' : 'comment-reply'}`}>
            <div className={`comment-item-threaded ${!isTopLevel ? 'is-reply' : ''}`}>
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
                            onClick={() => onLike(comment.id, isOrgComment || !!comment.is_org_comment)}
                        >
                            <Heart size={14} fill={comment.user_has_liked ? 'currentColor' : 'none'} />
                            {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                        </button>
                        {isTopLevel && (
                            <button
                                className="comment-action-btn"
                                onClick={() => onReply(comment.id)}
                            >
                                <MessageCircle size={14} />
                                {comment.replies_count > 0 && <span>{comment.replies_count}</span>}
                            </button>
                        )}
                        <button
                            className="comment-action-btn"
                            onClick={() => onShare(comment.uuid)}
                        >
                            <Link2 size={14} />
                        </button>
                        {currentUserId === comment.user.id && (
                            <button
                                className="comment-action-btn delete"
                                onClick={() => onDelete(comment.id, isOrgComment || !!comment.is_org_comment)}
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>

                    {/* Inline Reply Form */}
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
                                <span className="reply-char-count">
                                    {(replyText[comment.id] || '').length}/1000
                                </span>
                                <div className="reply-form-actions">
                                    <button className="reply-cancel-btn" onClick={onCancelReply}>
                                        Cancel
                                    </button>
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

            {/* Nested Replies */}
            {isTopLevel && replies.length > 0 && (
                <div className="comment-replies-container">
                    {visibleReplies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            currentUserId={currentUserId}
                            isOrgComment={isOrgComment}
                            onReply={onReply}
                            replyingTo={replyingTo}
                            replyText={replyText}
                            onReplyTextChange={onReplyTextChange}
                            onReplySubmit={onReplySubmit}
                            onCancelReply={onCancelReply}
                            replyLoading={replyLoading}
                            expandedReplies={expandedReplies}
                            onToggleExpand={onToggleExpand}
                            onLike={onLike}
                            onDelete={onDelete}
                            onShare={onShare}
                            isTopLevel={false}
                        />
                    ))}
                    {!isExpanded && hiddenCount > 0 && (
                        <button
                            className="view-more-replies-btn"
                            onClick={() => onToggleExpand(comment.id)}
                        >
                            <ChevronDown size={14} />
                            View {hiddenCount} more {hiddenCount === 1 ? 'reply' : 'replies'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function PostCard({ post, onPostDeleted, isOwnPost = false, defaultShowComments = false, onPostClick, onCommentClick }: PostCardProps) {
    const { props } = usePage();
    const currentUserId = (props as any).auth?.user?.id ?? null;
    const isOrgPost = post.is_organization || post.user?.is_organization;
    const [isLiked, setIsLiked] = useState(post.user_reaction === 'like');
    const [likeCount, setLikeCount] = useState(post.reactions_count);
    const [isRefammed, setIsRefammed] = useState(!!post.user_has_refammed);
    const [refamCount, setRefamCount] = useState(post.refams_count || 0);
    const [isSaved, setIsSaved] = useState(!!post.user_has_saved);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showComments, setShowComments] = useState(defaultShowComments);
    const [commentText, setCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Threaded comment state
    const [comments, setComments] = useState<Comment[]>(post.comments || []);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState<Record<number, string>>({});
    const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
    const [replyLoading, setReplyLoading] = useState(false);

    const postUrl = isOrgPost ? `/stories/org/${post.org_post_id}` : `/stories/${post.id}`;

    const navigateToPost = () => {
        if (onPostClick) {
            onPostClick(post);
        } else {
            router.visit(postUrl);
        }
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '0:00';
        const totalSeconds = Math.floor(seconds);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLike = async () => {
        try {
            if (isOrgPost) {
                const orgPostId = post.org_post_id;
                if (isLiked) {
                    await axios.delete(route('stories.org.reactions.destroy', orgPostId));
                    setIsLiked(false);
                    setLikeCount(likeCount - 1);
                } else {
                    await axios.post(route('stories.org.reactions.store', orgPostId), { reaction_type: 'like' });
                    setIsLiked(true);
                    setLikeCount(likeCount + 1);
                }
            } else {
                if (isLiked) {
                    await axios.delete(route('stories.reactions.destroy', post.id));
                    setIsLiked(false);
                    setLikeCount(likeCount - 1);
                } else {
                    await axios.post(route('stories.reactions.store', post.id), { reaction_type: 'like' });
                    setIsLiked(true);
                    setLikeCount(likeCount + 1);
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleRefam = async () => {
        try {
            const refamRoute = isOrgPost
                ? route('stories.org.refam.toggle', post.org_post_id)
                : route('stories.refam.toggle', post.id);
            // Optimistic update
            setIsRefammed(!isRefammed);
            setRefamCount(isRefammed ? refamCount - 1 : refamCount + 1);
            const response = await axios.post(refamRoute);
            setIsRefammed(response.data.refammed);
            setRefamCount(response.data.refams_count);
        } catch (error) {
            // Revert optimistic update
            setIsRefammed(isRefammed);
            setRefamCount(refamCount);
            console.error('Error toggling refam:', error);
        }
    };

    const handleSave = async () => {
        try {
            const saveRoute = isOrgPost
                ? route('stories.org.save.toggle', post.org_post_id)
                : route('stories.save.toggle', post.id);
            // Optimistic update
            setIsSaved(!isSaved);
            const response = await axios.post(saveRoute);
            setIsSaved(response.data.saved);
        } catch (error) {
            // Revert optimistic update
            setIsSaved(isSaved);
            console.error('Error toggling save:', error);
        }
    };

    // Handle top-level comment submission
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setCommentLoading(true);
        try {
            const commentRoute = isOrgPost
                ? route('stories.org.comments.store', post.org_post_id)
                : route('stories.comments.store', post.id);
            const response = await axios.post(commentRoute, { content: commentText });
            setCommentText('');
            // Optimistically add the new comment to the top of the list
            if (response.data?.comment) {
                setComments(prev => [response.data.comment, ...prev]);
            } else {
                router.reload({ only: ['posts', 'followingPosts', 'allPosts'] });
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setCommentLoading(false);
        }
    };

    // Handle reply submission
    const handleReplySubmit = useCallback(async (parentCommentId: number) => {
        const text = replyText[parentCommentId];
        if (!text?.trim()) return;

        setReplyLoading(true);
        try {
            const commentRoute = isOrgPost
                ? route('stories.org.comments.store', post.org_post_id)
                : route('stories.comments.store', post.id);
            const response = await axios.post(commentRoute, {
                content: text,
                parent_comment_id: parentCommentId,
            });

            // Optimistically add the reply under the parent
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
    }, [replyText, isOrgPost, post.org_post_id, post.id]);

    // Handle comment like toggle
    const handleCommentLike = useCallback(async (commentId: number, isOrg: boolean) => {
        try {
            const likeRoute = isOrg
                ? route('stories.org.comments.like', commentId)
                : route('stories.comments.like', commentId);
            const response = await axios.post(likeRoute);

            // Optimistic update
            const updateCommentLike = (commentList: Comment[]): Comment[] => {
                return commentList.map(c => {
                    if (c.id === commentId) {
                        return {
                            ...c,
                            user_has_liked: response.data.liked,
                            likes_count: response.data.likes_count,
                        };
                    }
                    if (c.replies?.length) {
                        return { ...c, replies: updateCommentLike(c.replies) };
                    }
                    return c;
                });
            };
            setComments(prev => updateCommentLike(prev));
        } catch (error) {
            console.error('Error toggling comment like:', error);
        }
    }, []);

    // Handle comment delete
    const handleCommentDelete = useCallback(async (commentId: number, isOrg: boolean) => {
        if (!confirm('Delete this comment?')) return;
        try {
            const deleteRoute = isOrg
                ? route('stories.org.comments.destroy', commentId)
                : route('stories.comments.destroy', commentId);
            await axios.delete(deleteRoute);

            // Remove from state
            const removeComment = (commentList: Comment[]): Comment[] => {
                return commentList
                    .filter(c => c.id !== commentId)
                    .map(c => ({
                        ...c,
                        replies: c.replies ? removeComment(c.replies) : [],
                        replies_count: c.replies ? removeComment(c.replies).length : 0,
                    }));
            };
            setComments(prev => removeComment(prev));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    }, []);

    // Share a comment link
    const handleCommentShare = useCallback((uuid: string) => {
        const link = `${window.location.origin}/stories/comments/${uuid}`;
        navigator.clipboard.writeText(link).then(() => {
            setShareLink(link);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }).catch(() => {
            // Fallback: show share modal
            setShareLink(link);
            setShowShareModal(true);
        });
    }, []);

    const handleShare = () => {
        const postIdentifier = isOrgPost && post.uuid ? post.uuid : post.id;
        const link = `${window.location.origin}/stories/${postIdentifier}`;
        setShareLink(link);
        setShowShareModal(true);
        setLinkCopied(false);
    };

    const copyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (error) {
            console.error('Error copying link:', error);
        }
    };

    const handleDeleteClick = () => setShowDeleteModal(true);

    const confirmDelete = () => {
        setDeleteLoading(true);
        router.delete(route('stories.destroy', post.id), {
            onSuccess: () => {
                onPostDeleted(post.id);
                setShowDeleteModal(false);
            },
            onError: (error) => {
                console.error('Error deleting post:', error);
                setDeleteLoading(false);
            },
        });
    };

    const cancelDelete = () => setShowDeleteModal(false);

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current) return;
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleCommentAction = () => {
        if (onCommentClick) {
            onCommentClick();
        } else {
            setShowComments(!showComments);
        }
    };

    return (
        <div className="post-card">
            {/* Refammed By Header */}
            {post.refammed_by && (
                <div className="refammed-by-header">
                    <Repeat2 size={14} />
                    <span>Refammed by @{post.refammed_by.username}</span>
                </div>
            )}

            {/* Post Header */}
            <div className="post-header">
                <div className="post-user-info" onClick={navigateToPost} style={{ cursor: 'pointer' }}>
                    {isOrgPost ? (
                        <div className="post-user-avatar org-avatar" style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            {post.user.profile_image_url ? (
                                <img src={post.user.profile_image_url} alt={post.user.name}
                                    style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                            ) : (
                                <Building2 size={20} color="#fff" />
                            )}
                        </div>
                    ) : (
                        <img src={post.user.profile_image_url || 'https://via.placeholder.com/40'}
                            alt={post.user.name} className="post-user-avatar" />
                    )}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <h3 className="post-user-name">{post.user.name}</h3>
                            {isOrgPost && (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff',
                                    fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                                    borderRadius: '12px', letterSpacing: '0.3px', textTransform: 'uppercase',
                                }}>
                                    <Building2 size={10} /> Org
                                </span>
                            )}
                        </div>
                        <p className="post-timestamp">{post.created_at_human}</p>
                    </div>
                </div>
                <div className="post-actions-menu">
                    {isOwnPost && !isOrgPost && (
                        <button className="post-action-btn delete-btn" onClick={handleDeleteClick}
                            disabled={deleteLoading} title="Delete post">
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Post Content */}
            <div className="post-content">
                <div onClick={navigateToPost} style={{ cursor: 'pointer' }}>
                    {post.title && <h2 className="post-title">{post.title}</h2>}
                    {post.type === 'text' && post.content && (
                        <div className="post-text-content" dangerouslySetInnerHTML={{ __html: post.content }} />
                    )}
                </div>
                {post.type === 'voice' && post.voice_url && (
                    <div className="post-voice-player">
                        <button className="voice-play-btn" onClick={handlePlayPause}>
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <div className="voice-player-content">
                            <div className="voice-time-info">
                                <span className="current-time">{formatDuration(currentTime)}</span>
                                <span className="total-time">{formatDuration(duration || post.voice_duration)}</span>
                            </div>
                            <div className="voice-progress-container" onClick={handleSeek}>
                                <div className="voice-progress-bar">
                                    <div className="voice-progress-fill"
                                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}>
                                        <div className="voice-progress-thumb" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <audio ref={audioRef} src={post.voice_url}
                            onEnded={() => setIsPlaying(false)}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata} />
                    </div>
                )}
                {post.images.length > 0 && (
                    <div className="post-images">
                        <div
                            className="post-single-image"
                            onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
                        >
                            <img
                                src={post.images[0].url}
                                alt="Post image"
                                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'; }}
                            />
                            {post.images.length > 1 && (
                                <div className="image-count-badge">
                                    <ImageIcon size={14} />
                                    <span>1 / {post.images.length}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Post Actions */}
            <div className="post-actions">
                <button className="action-btn comment-btn" onClick={handleCommentAction}>
                    <MessageCircle size={20} />
                    <span>{post.comments_count || 0}</span>
                </button>
                <button className={`action-btn refam-btn ${isRefammed ? 'refammed' : ''}`} onClick={handleRefam}>
                    <Repeat2 size={20} />
                    <span>{refamCount || ''}</span>
                </button>
                <button className={`action-btn like-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                    <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{likeCount || ''}</span>
                </button>
                <button className={`action-btn save-btn ${isSaved ? 'saved' : ''}`} onClick={handleSave}>
                    <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
                <button className="action-btn share-btn" onClick={handleShare}>
                    <Share2 size={20} />
                </button>
            </div>

            {/* Link Copied Toast */}
            {linkCopied && !showShareModal && (
                <div className="link-copied-toast">
                    <Check size={14} /> Link copied!
                </div>
            )}

            {/* Threaded Comments Section */}
            {showComments && (
                <div className="comments-section">
                    <div className="comments-header">
                        <h4 className="comments-title">Comments ({post.comments_count})</h4>
                    </div>

                    {/* Top-level Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <div className="comment-input-wrapper">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="comment-input"
                                rows={2}
                                maxLength={1000}
                            />
                            <button type="submit" disabled={!commentText.trim() || commentLoading}
                                className="comment-submit-btn">
                                {commentLoading ? (
                                    <><div className="spinner-small" /><span>Sending...</span></>
                                ) : (
                                    <><Send size={18} strokeWidth={2.5} /><span>Send</span></>
                                )}
                            </button>
                        </div>
                        <div className="comment-char-count">{commentText.length}/1000</div>
                    </form>

                    {/* Threaded Comments List */}
                    {comments && comments.length > 0 ? (
                        <div className="comments-list-threaded">
                            {comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    currentUserId={currentUserId}
                                    isOrgComment={!!isOrgPost}
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
                                    onLike={handleCommentLike}
                                    onDelete={handleCommentDelete}
                                    onShare={handleCommentShare}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="no-comments">
                            <MessageCircle size={32} />
                            <p>No comments yet. Be the first to comment!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="share-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="share-modal-header">
                            <h3>Share Post</h3>
                            <button className="share-modal-close" onClick={() => setShowShareModal(false)}
                                aria-label="Close">✕</button>
                        </div>
                        <div className="share-modal-content">
                            <p className="share-modal-description">Share this post with your connections</p>
                            <div className="share-link-wrapper">
                                <input type="text" value={shareLink} readOnly className="share-link-input" />
                                <button onClick={copyShareLink} className="copy-link-btn">
                                    {linkCopied ? (<><Check size={18} /> Copied!</>) : (<><Copy size={18} /> Copy</>)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-container">
                        <div className="delete-modal-header">
                            <div className="delete-modal-icon"><AlertTriangle size={28} /></div>
                            <h2 className="delete-modal-title">Delete Post</h2>
                            <button className="delete-modal-close" onClick={cancelDelete} disabled={deleteLoading}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="delete-modal-content">
                            <p className="delete-modal-message">
                                Are you sure you want to delete this post? This action cannot be undone.
                            </p>
                            <div className="delete-modal-post-preview">
                                <p className="preview-title"><strong>{post.title}</strong></p>
                                {post.content && (
                                    <p className="preview-content">
                                        {post.content.substring(0, 100)}{post.content.length > 100 ? '...' : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="delete-modal-actions">
                            <button className="delete-modal-btn cancel-btn" onClick={cancelDelete} disabled={deleteLoading}>
                                Keep Post
                            </button>
                            <button className="delete-modal-btn delete-btn" onClick={confirmDelete} disabled={deleteLoading}>
                                {deleteLoading ? 'Deleting...' : 'Delete Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Lightbox - rendered via portal to escape post-card container */}
            {lightboxOpen && post.images.length > 0 && createPortal(
                <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
                    <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
                        <span style={{ color: '#fff', fontSize: '28px', fontWeight: 300, lineHeight: 1 }}>&times;</span>
                    </button>
                    <div className="lightbox-counter">{lightboxIndex + 1} / {post.images.length}</div>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        {post.images.length > 1 && (
                            <button
                                className="lightbox-nav lightbox-prev"
                                onClick={() => setLightboxIndex((lightboxIndex - 1 + post.images.length) % post.images.length)}
                            >
                                <span style={{ color: '#fff', fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>&lsaquo;</span>
                            </button>
                        )}
                        <img
                            src={post.images[lightboxIndex].url}
                            alt={`Post image ${lightboxIndex + 1}`}
                            className="lightbox-image"
                            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'; }}
                        />
                        {post.images.length > 1 && (
                            <button
                                className="lightbox-nav lightbox-next"
                                onClick={() => setLightboxIndex((lightboxIndex + 1) % post.images.length)}
                            >
                                <span style={{ color: '#fff', fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>&rsaquo;</span>
                            </button>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
