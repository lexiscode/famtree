import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    FileText,
    Eye,
    MessageSquare,
    Heart,
    Trash2,
    Flag,
    Mic,
    Image,
    Clock,
    Globe,
    Lock,
    Users,
} from 'lucide-react';

interface PostUser {
    id: number;
    name: string;
    username: string;
    profile_image_url: string | null;
}

interface PostImage {
    id: number;
    url: string;
    caption?: string;
}

interface PostComment {
    id: number;
    user: {
        name: string;
        username: string;
        profile_image_url: string | null;
    };
    content: string;
    created_at: string;
}

interface PostReaction {
    type: string;
    count: number;
}

interface PostDetail {
    id: number;
    user: PostUser;
    type: string;
    privacy: string;
    content: string;
    voice_url: string | null;
    voice_duration: number | null;
    views_count: number;
    images: PostImage[];
    comments: PostComment[];
    reactions: PostReaction[];
    created_at: string;
}

interface Props {
    post: PostDetail;
}

function UserAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <div className="ap-avatar ap-avatar-lg">
                <img src={imageUrl} alt={name} onError={() => setImageError(true)} />
            </div>
        );
    }

    return (
        <div className="ap-avatar ap-avatar-lg ap-avatar-indigo">
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

function SmallAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <div className="ap-avatar ap-avatar-md">
                <img src={imageUrl} alt={name} onError={() => setImageError(true)} />
            </div>
        );
    }

    return (
        <div className="ap-avatar ap-avatar-md ap-avatar-indigo">
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function PostDetailPage({ post }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            router.delete(route('admin.content.posts.delete', post.id));
        }
    };

    const handleFlag = () => {
        router.post(route('admin.content.posts.flag', post.id), {}, { preserveScroll: true });
    };

    const handleDeleteComment = (commentId: number) => {
        if (confirm('Are you sure you want to delete this comment?')) {
            router.delete(route('admin.content.comments.delete', commentId), { preserveScroll: true });
        }
    };

    const getPrivacyIcon = () => {
        switch (post.privacy) {
            case 'public': return Globe;
            case 'friends': return Users;
            default: return Lock;
        }
    };

    const PrivacyIcon = getPrivacyIcon();

    const totalReactions = post.reactions.reduce((sum, r) => sum + r.count, 0);

    return (
        <AdminLayout>
            <div>
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="ap-flash ap-flash-success">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="ap-flash ap-flash-error">{flash.error}</div>
                )}

                {/* Header */}
                <button className="ap-back-btn" onClick={() => router.get(route('admin.content.posts'))}>
                    <ArrowLeft size={16} /> Back to Posts
                </button>

                <div className="ap-page-header-row">
                    <div className="ap-page-header">
                        <h1 className="ap-page-title">Post Details</h1>
                        <p className="ap-page-subtitle">Review and moderate post content</p>
                    </div>
                    <div className="ap-flex ap-gap-sm">
                        <button className="ap-btn ap-btn-warning" onClick={handleFlag}>
                            <Flag size={16} /> Flag/Unflag
                        </button>
                        <button className="ap-btn ap-btn-danger" onClick={handleDelete}>
                            <Trash2 size={16} /> Delete Post
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Views', value: post.views_count, icon: Eye, colorClass: 'indigo' },
                        { label: 'Comments', value: post.comments.length, icon: MessageSquare, colorClass: 'blue' },
                        { label: 'Reactions', value: totalReactions, icon: Heart, colorClass: 'red' },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="ap-stat-card">
                                <div className="ap-stat-card-header">
                                    <p className="ap-stat-label">{stat.label}</p>
                                    <div className={`ap-stat-icon ${stat.colorClass}`}>
                                        <Icon size={20} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <p className="ap-stat-value">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Post Content Card */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-flex ap-items-center ap-gap-md ap-mb-lg">
                        <UserAvatar imageUrl={post.user.profile_image_url} name={post.user.name} />
                        <div className="ap-flex-1">
                            <p className="ap-user-cell-name">{post.user.name}</p>
                            <p className="ap-user-cell-sub">@{post.user.username}</p>
                        </div>
                        <div className="ap-flex ap-gap-sm ap-items-center">
                            <span className={`ap-badge ${post.type === 'voice' ? 'ap-badge-info' : 'ap-badge-primary'} ap-capitalize`}>
                                {post.type === 'voice' ? <Mic size={12} /> : <FileText size={12} />}
                                {post.type}
                            </span>
                            <span className="ap-badge ap-badge-neutral ap-capitalize">
                                <PrivacyIcon size={12} /> {post.privacy}
                            </span>
                            <span className="ap-meta-item">
                                <Clock size={14} /> {new Date(post.created_at).toLocaleDateString()} {new Date(post.created_at).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    {post.content && (
                        <div className="ap-card ap-mb-lg ap-content-block">
                            <p className="ap-content-text">{post.content}</p>
                        </div>
                    )}

                    {/* Voice */}
                    {post.voice_url && (
                        <div className="ap-card ap-mb-lg ap-voice-block">
                            <div className="ap-flex ap-items-center ap-gap-md">
                                <Mic size={24} color="var(--ap-info)" />
                                <div className="ap-flex-1">
                                    <audio controls className="ap-audio-player">
                                        <source src={post.voice_url} />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                                {post.voice_duration && (
                                    <span className="ap-text-sm ap-font-semibold ap-text-info">
                                        {Math.floor(post.voice_duration / 60)}:{String(post.voice_duration % 60).padStart(2, '0')}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Images Gallery */}
                    {post.images.length > 0 && (
                        <div>
                            <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                                <Image size={16} /> Images ({post.images.length})
                            </h3>
                            <div className="ap-form-row">
                                {post.images.map((img) => (
                                    <div
                                        key={img.id}
                                        className="ap-card ap-card-flush ap-cursor-pointer"
                                        onClick={() => setSelectedImage(img.url)}
                                    >
                                        <img src={img.url} alt={img.caption || 'Post image'} className="ap-img-thumb" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Reactions Summary */}
                {post.reactions.length > 0 && (
                    <div className="ap-card ap-card-lg ap-mb-xl">
                        <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm ap-mb-lg">
                            <Heart size={18} color="var(--ap-danger)" /> Reactions Summary
                        </h3>
                        <div className="ap-flex ap-gap-md ap-flex-wrap">
                            {post.reactions.map((reaction, idx) => (
                                <div key={idx} className="ap-badge ap-badge-neutral">
                                    <span>{reaction.type}</span>
                                    <span className="ap-font-semibold">{reaction.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comments */}
                <div className="ap-card ap-card-lg">
                    <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm ap-mb-lg">
                        <MessageSquare size={18} color="var(--ap-info)" /> Comments ({post.comments.length})
                    </h3>
                    {post.comments.length > 0 ? (
                        <div className="ap-flex-col ap-gap-md">
                            {post.comments.map((comment) => (
                                <div key={comment.id} className="ap-card ap-content-block">
                                    <div className="ap-flex ap-items-start ap-gap-md">
                                        <SmallAvatar imageUrl={comment.user.profile_image_url} name={comment.user.name} />
                                        <div className="ap-flex-1">
                                            <div className="ap-flex ap-items-center ap-justify-between ap-mb-sm">
                                                <div>
                                                    <span className="ap-font-semibold">{comment.user.name}</span>
                                                    <span className="ap-text-sm ap-text-secondary ap-ml-sm">@{comment.user.username}</span>
                                                </div>
                                                <div className="ap-flex ap-items-center ap-gap-md">
                                                    <span className="ap-text-sm ap-text-secondary">{comment.created_at}</span>
                                                    <button
                                                        className="ap-btn ap-btn-sm ap-btn-danger"
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="ap-comment-text">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <MessageSquare size={28} />
                            </div>
                            <p className="ap-empty-text">No comments on this post</p>
                        </div>
                    )}
                </div>

                {/* Image Lightbox */}
                {selectedImage && (
                    <div className="ap-modal-overlay" onClick={() => setSelectedImage(null)}>
                        <img src={selectedImage} alt="Full size" className="ap-lightbox-img" />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
