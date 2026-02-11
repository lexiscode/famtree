import OrgLayout from '@/Layouts/OrgLayout';
import { useState, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import {
    Plus, Pin, Trash2, Send, ImagePlus, X,
    ChevronLeft, ChevronRight, ChevronDown,
    Heart, MessageCircle, Link2,
} from 'lucide-react';
import RichTextEditor from '@/Components/RichTextEditor';
import axios from 'axios';

interface OrgPostImage {
    id: number;
    image_url: string;
    full_image_url: string;
}

interface OrgCommentUser {
    id: number | string;
    name: string;
    username: string;
    profile_image_url: string | null;
    is_org?: boolean;
}

interface OrgComment {
    id: number;
    uuid: string;
    content: string;
    parent_comment_id: number | null;
    created_at_human: string;
    likes_count: number;
    replies_count: number;
    replies: OrgComment[];
    org_has_liked: boolean;
    is_org_comment: boolean;
    user: OrgCommentUser;
}

interface OrgPost {
    id: number;
    uuid: string;
    type: 'text' | 'voice';
    content: string | null;
    is_pinned: boolean;
    views_count: number;
    comments_count: number;
    reactions_count: number;
    images: OrgPostImage[];
    formatted_comments: OrgComment[];
    org_has_reacted: boolean;
    creator: { display_name: string | null; username: string } | null;
    created_at: string;
}

interface PaginatedPosts {
    data: OrgPost[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    posts: PaginatedPosts;
}

/* ─── Comment Item ─── */
function CommentItem({
    comment,
    postId,
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
    isTopLevel = true,
}: {
    comment: OrgComment;
    postId: number;
    onReply: (id: number) => void;
    replyingTo: number | null;
    replyText: Record<number, string>;
    onReplyTextChange: (id: number, text: string) => void;
    onReplySubmit: (id: number) => void;
    onCancelReply: () => void;
    replyLoading: boolean;
    expandedReplies: Set<number>;
    onToggleExpand: (id: number) => void;
    onLike: (id: number) => void;
    onDelete: (id: number) => void;
    isTopLevel?: boolean;
}) {
    const replies = comment.replies || [];
    const isExpanded = expandedReplies.has(comment.id);
    const visibleReplies = isExpanded ? replies : replies.slice(0, 2);
    const hiddenCount = replies.length - 2;
    const avatarSize = isTopLevel ? 36 : 28;

    return (
        <div style={{ marginLeft: isTopLevel ? 0 : 20, marginTop: isTopLevel ? 12 : 8 }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                {comment.user.profile_image_url ? (
                    <img
                        src={comment.user.profile_image_url}
                        alt={comment.user.name}
                        style={{
                            width: avatarSize, height: avatarSize,
                            borderRadius: comment.user.is_org ? '8px' : '50%',
                            objectFit: 'cover', flexShrink: 0,
                        }}
                    />
                ) : (
                    <div style={{
                        width: avatarSize, height: avatarSize,
                        borderRadius: comment.user.is_org ? '8px' : '50%',
                        background: comment.user.is_org
                            ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                            : 'rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', color: '#fff', fontWeight: 700, flexShrink: 0,
                    }}>
                        {comment.user.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: '0.82rem' }}>
                            {comment.user.name}
                        </span>
                        {comment.user.is_org && (
                            <span style={{
                                fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px',
                                borderRadius: '8px', background: 'rgba(139,92,246,0.2)',
                                color: '#8B5CF6', textTransform: 'uppercase',
                            }}>
                                Org
                            </span>
                        )}
                        <span style={{ color: '#555', fontSize: '0.75rem' }}>
                            @{comment.user.username}
                        </span>
                        <span style={{ color: '#444', fontSize: '0.7rem' }}>·</span>
                        <span style={{ color: '#555', fontSize: '0.72rem' }}>
                            {comment.created_at_human}
                        </span>
                    </div>
                    <p style={{ color: '#ccc', fontSize: '0.85rem', margin: '4px 0 6px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {comment.content}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                            onClick={() => onLike(comment.id)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px',
                                color: comment.org_has_liked ? '#EF4444' : '#666',
                                fontSize: '0.75rem', padding: '2px 4px',
                            }}
                        >
                            <Heart size={13} fill={comment.org_has_liked ? 'currentColor' : 'none'} />
                            {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                        </button>
                        {isTopLevel && (
                            <button
                                onClick={() => onReply(comment.id)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    color: '#666', fontSize: '0.75rem', padding: '2px 4px',
                                }}
                            >
                                <MessageCircle size={13} />
                                {comment.replies_count > 0 && <span>{comment.replies_count}</span>}
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(comment.id)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px',
                                color: '#555', fontSize: '0.75rem', padding: '2px 4px',
                            }}
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                        <div style={{ marginTop: 8 }}>
                            <textarea
                                value={replyText[comment.id] || ''}
                                onChange={(e) => onReplyTextChange(comment.id, e.target.value)}
                                placeholder={`Reply to @${comment.user.username}...`}
                                rows={2}
                                maxLength={1000}
                                autoFocus
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px',
                                    color: '#e0e0e0', padding: '8px 10px', fontSize: '0.82rem',
                                    resize: 'vertical', outline: 'none',
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                                <button onClick={onCancelReply} style={{
                                    background: 'none', border: 'none', color: '#888',
                                    fontSize: '0.78rem', cursor: 'pointer',
                                }}>Cancel</button>
                                <button
                                    onClick={() => onReplySubmit(comment.id)}
                                    disabled={!(replyText[comment.id] || '').trim() || replyLoading}
                                    style={{
                                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                        border: 'none', borderRadius: '6px', color: '#fff',
                                        fontSize: '0.78rem', fontWeight: 600, padding: '5px 14px',
                                        cursor: !(replyText[comment.id] || '').trim() || replyLoading ? 'not-allowed' : 'pointer',
                                        opacity: !(replyText[comment.id] || '').trim() || replyLoading ? 0.5 : 1,
                                    }}
                                >
                                    {replyLoading ? 'Sending...' : 'Reply'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {isTopLevel && replies.length > 0 && (
                <div style={{ borderLeft: '2px solid rgba(139,92,246,0.15)', marginLeft: 18, paddingLeft: 0 }}>
                    {visibleReplies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            postId={postId}
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
                            isTopLevel={false}
                        />
                    ))}
                    {!isExpanded && hiddenCount > 0 && (
                        <button
                            onClick={() => onToggleExpand(comment.id)}
                            style={{
                                background: 'none', border: 'none', color: '#8B5CF6',
                                fontSize: '0.75rem', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', gap: '4px', marginLeft: 20, marginTop: 6,
                            }}
                        >
                            <ChevronDown size={13} />
                            View {hiddenCount} more {hiddenCount === 1 ? 'reply' : 'replies'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Post Comments Section ─── */
function PostComments({ post }: { post: OrgPost }) {
    const [comments, setComments] = useState<OrgComment[]>(post.formatted_comments || []);
    const [commentText, setCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState<Record<number, string>>({});
    const [replyLoading, setReplyLoading] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setCommentLoading(true);
        try {
            const response = await axios.post(route('org.posts.comments.store', post.id), {
                content: commentText,
            });
            if (response.data?.comment) {
                setComments(prev => [response.data.comment, ...prev]);
            }
            setCommentText('');
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleReplySubmit = useCallback(async (parentCommentId: number) => {
        const text = replyText[parentCommentId];
        if (!text?.trim()) return;
        setReplyLoading(true);
        try {
            const response = await axios.post(route('org.posts.comments.store', post.id), {
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
    }, [replyText, post.id]);

    const handleLike = useCallback(async (commentId: number) => {
        try {
            const response = await axios.post(route('org.posts.comments.like', commentId));
            const updateLike = (list: OrgComment[]): OrgComment[] =>
                list.map(c => {
                    if (c.id === commentId) {
                        return { ...c, org_has_liked: response.data.liked, likes_count: response.data.likes_count };
                    }
                    if (c.replies?.length) {
                        return { ...c, replies: updateLike(c.replies) };
                    }
                    return c;
                });
            setComments(prev => updateLike(prev));
        } catch (error) {
            console.error('Error toggling comment like:', error);
        }
    }, []);

    const handleDelete = useCallback(async (commentId: number) => {
        if (!confirm('Delete this comment?')) return;
        try {
            await axios.delete(route('org.posts.comments.destroy', commentId));
            const removeComment = (list: OrgComment[]): OrgComment[] =>
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

    return (
        <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            marginTop: '1rem',
            paddingTop: '1rem',
        }}>
            <h4 style={{ color: '#aaa', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Comments ({post.comments_count})
            </h4>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment as your organization..."
                        rows={2}
                        maxLength={1000}
                        style={{
                            flex: 1, background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(139,92,246,0.15)', borderRadius: '8px',
                            color: '#e0e0e0', padding: '8px 12px', fontSize: '0.85rem',
                            resize: 'vertical', outline: 'none',
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!commentText.trim() || commentLoading}
                        style={{
                            alignSelf: 'flex-end',
                            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            border: 'none', borderRadius: '8px', color: '#fff',
                            padding: '8px 14px', cursor: !commentText.trim() || commentLoading ? 'not-allowed' : 'pointer',
                            opacity: !commentText.trim() || commentLoading ? 0.5 : 1,
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontWeight: 600, fontSize: '0.82rem',
                        }}
                    >
                        <Send size={14} />
                        {commentLoading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            {comments.length > 0 ? (
                <div>
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            postId={post.id}
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
                            onLike={handleLike}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <p style={{ color: '#555', fontSize: '0.82rem', textAlign: 'center', padding: '0.5rem 0' }}>
                    No comments yet.
                </p>
            )}
        </div>
    );
}

/* ─── Main Posts Index ─── */
export default function PostsIndex({ posts }: Props) {
    const [content, setContent] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
    const [postReactions, setPostReactions] = useState<Record<number, { reacted: boolean; count: number }>>(() => {
        const initial: Record<number, { reacted: boolean; count: number }> = {};
        posts.data.forEach(p => {
            initial[p.id] = { reacted: !!p.org_has_reacted, count: p.reactions_count };
        });
        return initial;
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 10) {
            setError('Maximum 10 images allowed');
            return;
        }
        setError(null);

        const newFiles = [...images, ...files];
        setImages(newFiles);

        const newPreviews: string[] = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    newPreviews.push(ev.target.result as string);
                    if (newPreviews.length === files.length) {
                        setImagePreviews(prev => [...prev, ...newPreviews]);
                    }
                }
            };
            reader.readAsDataURL(file);
        });

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const getTextContent = (html: string) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return (tmp.textContent || tmp.innerText || '').trim();
    };

    const hasContent = getTextContent(content).length > 0;

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasContent) return;
        setSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('type', 'text');
        formData.append('content', content);
        images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
        });

        router.post(route('org.posts.store'), formData as any, {
            forceFormData: true,
            onSuccess: () => {
                setContent('');
                setImages([]);
                setImagePreviews([]);
                setSubmitting(false);
            },
            onError: (errors) => {
                setError(Object.values(errors)[0] as string || 'Failed to create post');
                setSubmitting(false);
            },
        });
    };

    const handleTogglePin = (id: number) => {
        router.post(route('org.posts.togglePin', { id }));
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(route('org.posts.destroy', { id }));
        }
    };

    const handleToggleReaction = async (postId: number) => {
        const current = postReactions[postId] || { reacted: false, count: 0 };
        // Optimistic update
        setPostReactions(prev => ({
            ...prev,
            [postId]: {
                reacted: !current.reacted,
                count: current.reacted ? current.count - 1 : current.count + 1,
            },
        }));
        try {
            const response = await axios.post(route('org.posts.reaction.toggle', postId));
            setPostReactions(prev => ({
                ...prev,
                [postId]: { reacted: response.data.reacted, count: response.data.reactions_count },
            }));
        } catch (error) {
            // Revert
            setPostReactions(prev => ({ ...prev, [postId]: current }));
            console.error('Error toggling reaction:', error);
        }
    };

    const toggleComments = (postId: number) => {
        setExpandedComments(prev => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId); else next.add(postId);
            return next;
        });
    };

    return (
        <OrgLayout>
            <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '2rem' }}>
                    Posts
                </h1>

                {/* Create Post Form */}
                <form onSubmit={handleCreatePost} style={{
                    background: '#111118',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Write a post for your followers..."
                            maxLength={5000}
                            disabled={submitting}
                        />
                    </div>

                    {imagePreviews.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                        }}>
                            {imagePreviews.map((preview, index) => (
                                <div key={index} style={{
                                    position: 'relative',
                                    aspectRatio: '1',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                }}>
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        style={{
                                            position: 'absolute', top: '4px', right: '4px',
                                            width: '22px', height: '22px', borderRadius: '50%',
                                            background: 'rgba(0,0,0,0.7)', border: 'none',
                                            color: '#fff', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: 0,
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <p style={{ color: '#EF4444', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{error}</p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/gif"
                                multiple
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={submitting || images.length >= 10}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    padding: '0.6rem 1rem',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                    borderRadius: '8px', color: '#8B5CF6',
                                    fontSize: '0.85rem', fontWeight: 500,
                                    cursor: submitting || images.length >= 10 ? 'not-allowed' : 'pointer',
                                    opacity: submitting || images.length >= 10 ? 0.5 : 1,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <ImagePlus size={16} />
                                {images.length > 0 ? `${images.length}/10 images` : 'Add Images'}
                            </button>
                        </div>
                        <button type="submit" disabled={submitting || !hasContent} style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            color: '#fff', border: 'none', borderRadius: '8px',
                            fontWeight: 600,
                            cursor: submitting || !hasContent ? 'not-allowed' : 'pointer',
                            opacity: submitting || !hasContent ? 0.6 : 1,
                        }}>
                            <Send size={16} />
                            {submitting ? 'Posting...' : 'Publish Post'}
                        </button>
                    </div>
                </form>

                {/* Posts List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {posts.data.length > 0 ? posts.data.map((post) => {
                        const reaction = postReactions[post.id] || { reacted: false, count: post.reactions_count };
                        const isCommentsOpen = expandedComments.has(post.id);

                        return (
                            <div key={post.id} style={{
                                background: '#111118',
                                border: `1px solid ${post.is_pinned ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: '12px',
                                padding: '1.5rem',
                            }}>
                                {post.is_pinned && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#8B5CF6', fontSize: '0.8rem', fontWeight: 600 }}>
                                        <Pin size={14} /> Pinned Post
                                    </div>
                                )}

                                {/* Rich text content */}
                                {post.content && (
                                    <div
                                        className="post-text-content"
                                        dangerouslySetInnerHTML={{ __html: post.content }}
                                        style={{
                                            color: '#e0e0e0', fontSize: '0.95rem',
                                            lineHeight: 1.6, margin: '0 0 1rem', wordBreak: 'break-word',
                                        }}
                                    />
                                )}

                                {/* Post Images */}
                                {post.images && post.images.length > 0 && (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: post.images.length === 1
                                            ? '1fr'
                                            : post.images.length === 2
                                                ? '1fr 1fr'
                                                : 'repeat(3, 1fr)',
                                        gap: '0.5rem', marginBottom: '1rem',
                                        borderRadius: '8px', overflow: 'hidden',
                                    }}>
                                        {post.images.map((img, imgIdx) => (
                                            <div key={img.id} style={{
                                                aspectRatio: post.images.length === 1 ? '16/9' : '1',
                                                overflow: 'hidden', borderRadius: '8px',
                                                ...(post.images.length > 3 && imgIdx >= 3 ? { display: 'none' } : {}),
                                            }}>
                                                <img
                                                    src={img.full_image_url || img.image_url}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                        ))}
                                        {post.images.length > 3 && (
                                            <div style={{
                                                aspectRatio: '1', borderRadius: '8px',
                                                background: 'rgba(139, 92, 246, 0.15)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#8B5CF6', fontWeight: 700, fontSize: '1.25rem',
                                            }}>
                                                +{post.images.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Bar */}
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)',
                                }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {/* Like/React */}
                                        <button
                                            onClick={() => handleToggleReaction(post.id)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                color: reaction.reacted ? '#EF4444' : '#888',
                                                fontSize: '0.82rem', fontWeight: 500, padding: '4px 8px',
                                                borderRadius: '6px', transition: 'all 0.2s',
                                            }}
                                        >
                                            <Heart size={16} fill={reaction.reacted ? 'currentColor' : 'none'} />
                                            <span>{reaction.count}</span>
                                        </button>

                                        {/* Comment Toggle */}
                                        <button
                                            onClick={() => toggleComments(post.id)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                color: isCommentsOpen ? '#8B5CF6' : '#888',
                                                fontSize: '0.82rem', fontWeight: 500, padding: '4px 8px',
                                                borderRadius: '6px', transition: 'all 0.2s',
                                            }}
                                        >
                                            <MessageCircle size={16} fill={isCommentsOpen ? 'currentColor' : 'none'} />
                                            <span>{post.comments_count}</span>
                                        </button>

                                        <span style={{ color: '#555', fontSize: '0.78rem', display: 'flex', alignItems: 'center' }}>
                                            {post.views_count} views
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleTogglePin(post.id)} style={{
                                            background: 'rgba(139, 92, 246, 0.1)', border: 'none',
                                            borderRadius: '6px', padding: '0.5rem', cursor: 'pointer',
                                            color: post.is_pinned ? '#8B5CF6' : '#888',
                                        }}>
                                            <Pin size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(post.id)} style={{
                                            background: 'rgba(239, 68, 68, 0.1)', border: 'none',
                                            borderRadius: '6px', padding: '0.5rem', cursor: 'pointer',
                                            color: '#EF4444',
                                        }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <p style={{ margin: '0.75rem 0 0', color: '#555', fontSize: '0.75rem' }}>
                                    By {post.creator?.display_name || post.creator?.username || 'Unknown'} · {new Date(post.created_at).toLocaleDateString()}
                                </p>

                                {/* Expandable Comments Section */}
                                {isCommentsOpen && <PostComments post={post} />}
                            </div>
                        );
                    }) : (
                        <div style={{
                            textAlign: 'center', padding: '3rem',
                            background: '#111118', borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <Plus size={32} color="#555" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#888', fontSize: '0.95rem' }}>No posts yet. Create your first post above.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {posts.last_page > 1 && (
                    <div style={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        gap: '0.75rem', marginTop: '1.5rem',
                    }}>
                        <button
                            disabled={posts.current_page <= 1}
                            onClick={() => router.get(route('org.posts.index'), { page: posts.current_page - 1 }, { preserveState: true })}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.6rem 1rem',
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '8px', color: '#8B5CF6',
                                fontSize: '0.85rem', fontWeight: 500,
                                cursor: posts.current_page <= 1 ? 'not-allowed' : 'pointer',
                                opacity: posts.current_page <= 1 ? 0.5 : 1,
                            }}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <span style={{ color: '#888', fontSize: '0.85rem' }}>
                            Page {posts.current_page} of {posts.last_page}
                        </span>
                        <button
                            disabled={posts.current_page >= posts.last_page}
                            onClick={() => router.get(route('org.posts.index'), { page: posts.current_page + 1 }, { preserveState: true })}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.6rem 1rem',
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '8px', color: '#8B5CF6',
                                fontSize: '0.85rem', fontWeight: 500,
                                cursor: posts.current_page >= posts.last_page ? 'not-allowed' : 'pointer',
                                opacity: posts.current_page >= posts.last_page ? 0.5 : 1,
                            }}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </OrgLayout>
    );
}
