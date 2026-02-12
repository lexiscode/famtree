import { useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, Trash2, Play, Pause, X, AlertTriangle, Send, Copy, Check, Building2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Post, PostCardProps } from '@/types';
import axios from 'axios';

export default function PostCard({ post, onPostDeleted, isOwnPost = false }: PostCardProps) {
    const isOrgPost = post.is_organization || post.user?.is_organization;
    const [isLiked, setIsLiked] = useState(post.user_reaction === 'like');
    const [likeCount, setLikeCount] = useState(post.reactions_count);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Format duration in minutes:seconds
    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '0:00';
        const totalSeconds = Math.floor(seconds);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle like button
    const handleLike = async () => {
        try {
            if (isLiked) {
                await axios.delete(route('stories.reactions.destroy', post.id));
                setIsLiked(false);
                setLikeCount(likeCount - 1);
            } else {
                await axios.post(route('stories.reactions.store', post.id), {
                    reaction_type: 'like'
                });
                setIsLiked(true);
                setLikeCount(likeCount + 1);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Handle comment submission
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setCommentLoading(true);
        try {
            await axios.post(route('stories.comments.store', post.id), {
                content: commentText
            });
            setCommentText('');
            // Optionally refresh the page to show new comment
            router.reload({ only: ['posts'] });
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setCommentLoading(false);
        }
    };

    // Handle share button
    const handleShare = () => {
        const link = `${window.location.origin}/stories/${post.id}`;
        setShareLink(link);
        setShowShareModal(true);
        setLinkCopied(false);
    };

    // Copy link to clipboard
    const copyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (error) {
            console.error('Error copying link:', error);
        }
    };

    // Handle delete confirmation
    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    // Confirm delete
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

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteModal(false);
    };

    // Handle voice play/pause
    const handlePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Handle audio time update
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    // Handle audio loaded metadata
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    // Handle progress bar seek
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

    return (
        <div className="post-card">
            {/* Post Header */}
            <div className="post-header">
                <div className="post-user-info">
                    {isOrgPost ? (
                        <div className="post-user-avatar org-avatar" style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            {post.user.profile_image_url ? (
                                <img
                                    src={post.user.profile_image_url}
                                    alt={post.user.name}
                                    style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
                                />
                            ) : (
                                <Building2 size={20} color="#fff" />
                            )}
                        </div>
                    ) : (
                        <img
                            src={post.user.profile_image_url || 'https://via.placeholder.com/40'}
                            alt={post.user.name}
                            className="post-user-avatar"
                        />
                    )}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <h3 className="post-user-name">{post.user.name}</h3>
                            {isOrgPost && (
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                    color: '#fff',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    letterSpacing: '0.3px',
                                    textTransform: 'uppercase',
                                }}>
                                    <Building2 size={10} />
                                    Org
                                </span>
                            )}
                        </div>
                        <p className="post-timestamp">{post.created_at_human}</p>
                    </div>
                </div>
                <div className="post-actions-menu">
                    {isOwnPost && !isOrgPost && (
                        <button
                            className="post-action-btn delete-btn"
                            onClick={handleDeleteClick}
                            disabled={deleteLoading}
                            title="Delete post"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Post Type Badge */}
            <div className="post-type-badge">
                {post.type === 'voice' ? (
                    <>
                        <span className="badge-icon">🎙️</span>
                        <span className="badge-text">Voice Post</span>
                    </>
                ) : (
                    <>
                        <span className="badge-icon">📝</span>
                        <span className="badge-text">Text Post</span>
                    </>
                )}
            </div>

            {/* Post Content */}
            <div className="post-content">
                {/* Title */}
                {post.title && <h2 className="post-title">{post.title}</h2>}

                {/* Text Content */}
                {post.type === 'text' && post.content && (
                    <div
                        className="post-text-content"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                )}

                {/* Voice Player */}
                {post.type === 'voice' && post.voice_url && (
                    <div className="post-voice-player">
                        <button
                            className="voice-play-btn"
                            onClick={handlePlayPause}
                        >
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <div className="voice-player-content">
                            <div className="voice-time-info">
                                <span className="current-time">{formatDuration(currentTime)}</span>
                                <span className="total-time">{formatDuration(duration || post.voice_duration)}</span>
                            </div>
                            <div className="voice-progress-container" onClick={handleSeek}>
                                <div className="voice-progress-bar">
                                    <div
                                        className="voice-progress-fill"
                                        style={{
                                            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
                                        }}
                                    >
                                        <div className="voice-progress-thumb" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <audio
                            ref={audioRef}
                            src={post.voice_url}
                            onEnded={() => setIsPlaying(false)}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                        />
                    </div>
                )}

                {/* Images Gallery */}
                {post.images.length > 0 && (
                    <div className="post-images">
                        <div className="images-container">
                            <img
                                src={post.images[currentImageIndex].url}
                                alt={`Post image ${currentImageIndex + 1}`}
                                className="gallery-image"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                                }}
                            />
                            {post.images.length > 1 && (
                                <>
                                    <button
                                        className="gallery-nav prev"
                                        onClick={() =>
                                            setCurrentImageIndex(
                                                (currentImageIndex - 1 + post.images.length) %
                                                    post.images.length
                                            )
                                        }
                                    >
                                        ‹
                                    </button>
                                    <button
                                        className="gallery-nav next"
                                        onClick={() =>
                                            setCurrentImageIndex(
                                                (currentImageIndex + 1) % post.images.length
                                            )
                                        }
                                    >
                                        ›
                                    </button>
                                    <div className="image-counter">
                                        {currentImageIndex + 1} / {post.images.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Post Actions */}
            {!isOrgPost ? (
                <div className="post-actions">
                    <button
                        className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                    >
                        <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                         {isLiked ? 'Liked' : 'Like'} ({likeCount})
                    </button>
                    <button
                        className="action-btn comment-btn"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageCircle size={20} />
                        Comment ({post.comments_count})
                    </button>
                    <button
                        className="action-btn share-btn"
                        onClick={handleShare}
                    >
                        <Share2 size={20} />
                        Share
                    </button>
                </div>
            ) : (
                <div className="post-actions" style={{ justifyContent: 'flex-start', gap: '1rem', opacity: 0.7 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#888' }}>
                        <Heart size={16} /> {likeCount}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#888' }}>
                        <MessageCircle size={16} /> {post.comments_count}
                    </span>
                </div>
            )}

            {/* Comments Section */}
            {showComments && (
                <div className="comments-section">
                    <div className="comments-header">
                        <h4 className="comments-title">Comments ({post.comments_count})</h4>
                    </div>

                    {/* Comment Form */}
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
                            <button
                                type="submit"
                                disabled={!commentText.trim() || commentLoading}
                                className="comment-submit-btn"
                            >
                                {commentLoading ? (
                                    <>
                                        <div className="spinner-small" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} strokeWidth={2.5} />
                                        <span>Send</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="comment-char-count">
                            {commentText.length}/1000
                        </div>
                    </form>

                    {/* Comments List */}
                    {post.comments && post.comments.length > 0 ? (
                        <div className="comments-list">
                            {post.comments.map((comment) => (
                                <div key={comment.id} className="comment-item">
                                    <img
                                        src={comment.user.profile_image_url || '/images/default-avatar.png'}
                                        alt={comment.user.name}
                                        className="comment-avatar"
                                    />
                                    <div className="comment-content-wrapper">
                                        <div className="comment-bubble">
                                            <div className="comment-header">
                                                <span className="comment-author">{comment.user.name}</span>
                                                <span className="comment-time">{comment.created_at_human}</span>
                                            </div>
                                            <p className="comment-text">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
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
                            <button
                                className="share-modal-close"
                                onClick={() => setShowShareModal(false)}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="share-modal-content">
                            <p className="share-modal-description">
                                Share this post with your connections
                            </p>
                            <div className="share-link-wrapper">
                                <input
                                    type="text"
                                    value={shareLink}
                                    readOnly
                                    className="share-link-input"
                                />
                                <button
                                    onClick={copyShareLink}
                                    className="copy-link-btn"
                                >
                                    {linkCopied ? (
                                        <>
                                            <Check size={18} />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            Copy
                                        </>
                                    )}
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
                            <div className="delete-modal-icon">
                                <AlertTriangle size={28} />
                            </div>
                            <h2 className="delete-modal-title">Delete Post</h2>
                            <button
                                className="delete-modal-close"
                                onClick={cancelDelete}
                                disabled={deleteLoading}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="delete-modal-content">
                            <p className="delete-modal-message">
                                Are you sure you want to delete this post? This action cannot be undone.
                            </p>
                            <div className="delete-modal-post-preview">
                                <p className="preview-title">
                                    <strong>{post.title}</strong>
                                </p>
                                {post.content && (
                                    <p className="preview-content">
                                        {post.content.substring(0, 100)}
                                        {post.content.length > 100 ? '...' : ''}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="delete-modal-actions">
                            <button
                                className="delete-modal-btn cancel-btn"
                                onClick={cancelDelete}
                                disabled={deleteLoading}
                            >
                                Keep Post
                            </button>
                            <button
                                className="delete-modal-btn delete-btn"
                                onClick={confirmDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
