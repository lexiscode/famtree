import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Trash2, Play, Pause, Volume2 } from 'lucide-react';

interface Image {
    id: number;
    url: string;
    order: number;
}

interface User {
    id: number;
    name: string;
    username: string;
    profile_image_url: string;
}

interface Post {
    id: number;
    type: 'text' | 'voice';
    title: string;
    content: string | null;
    voice_url: string | null;
    voice_duration: number | null;
    views_count: number;
    comments_count: number;
    reactions_count: number;
    images: Image[];
    user: User;
    created_at: string;
    created_at_human: string;
}

interface Props {
    post: Post;
    onPostDeleted: (postId: number) => void;
}

export default function PostCard({ post, onPostDeleted }: Props) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.reactions_count);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Format duration in minutes:seconds
    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle like button
    const handleLike = async () => {
        try {
            if (isLiked) {
                await fetch(route('stories.reactions.destroy', post.id), {
                    method: 'DELETE',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                setIsLiked(false);
                setLikeCount(likeCount - 1);
            } else {
                await fetch(route('stories.reactions.store', post.id), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ reaction_type: 'like' }),
                });
                setIsLiked(true);
                setLikeCount(likeCount + 1);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        setDeleteLoading(true);
        try {
            const response = await fetch(route('stories.destroy', post.id), {
                method: 'DELETE',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (response.ok) {
                onPostDeleted(post.id);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        } finally {
            setDeleteLoading(false);
        }
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

    return (
        <div className="post-card">
            {/* Post Header */}
            <div className="post-header">
                <div className="post-user-info">
                    <img
                        src={post.user.profile_image_url || 'https://via.placeholder.com/40'}
                        alt={post.user.name}
                        className="post-user-avatar"
                    />
                    <div>
                        <h3 className="post-user-name">{post.user.name}</h3>
                        <p className="post-timestamp">{post.created_at_human}</p>
                    </div>
                </div>
                <div className="post-actions-menu">
                    <button
                        className="post-action-btn delete-btn"
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        title="Delete post"
                    >
                        <Trash2 size={18} />
                    </button>
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
                    <p className="post-text-content">{post.content}</p>
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
                        <div className="voice-info">
                            <div className="voice-waveform">
                                {[...Array(20)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="waveform-bar"
                                        style={{
                                            height: `${Math.random() * 100}%`,
                                            animation: isPlaying ? 'wave 0.6s infinite' : 'none',
                                            animationDelay: `${i * 0.05}s`,
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="voice-duration">
                                {formatDuration(post.voice_duration)}
                            </span>
                        </div>
                        <audio
                            ref={audioRef}
                            src={post.voice_url}
                            onEnded={() => setIsPlaying(false)}
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

            {/* Post Stats */}
            <div className="post-stats">
                <span className="stat">
                    <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                    {likeCount} Likes
                </span>
                <span className="stat">
                    <MessageCircle size={14} />
                    {post.comments_count} Comments
                </span>
                <span className="stat">
                    <span role="img" aria-label="views">👁️</span>
                    {post.views_count} Views
                </span>
            </div>

            {/* Post Actions */}
            <div className="post-actions">
                <button
                    className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                    {isLiked ? 'Liked' : 'Like'}
                </button>
                <button className="action-btn comment-btn">
                    <MessageCircle size={20} />
                    Comment
                </button>
                <button className="action-btn share-btn">
                    <Share2 size={20} />
                    Share
                </button>
            </div>
        </div>
    );
}
