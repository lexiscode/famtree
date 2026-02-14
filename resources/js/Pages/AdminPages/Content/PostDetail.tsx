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

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

function UserAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={name}
                style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', display: 'block' }}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)',
            color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '1.1rem',
        }}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

function SmallAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={name}
                style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover', display: 'block' }}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8rem',
        }}>
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
                {(flash?.success || flash?.error) && (
                    <div style={{
                        marginBottom: '2rem', padding: '1.25rem 1.5rem', borderRadius: '12px',
                        background: flash?.error ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)' : 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                        border: `1px solid ${flash?.error ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)'}`,
                        color: flash?.error ? '#DC2626' : '#16A34A', fontSize: '0.95rem', fontWeight: 500,
                    }}>
                        {flash?.success || flash?.error}
                    </div>
                )}

                {/* Header */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <button
                            onClick={() => router.get(route('admin.content.posts'))}
                            style={{
                                background: '#E7F5FF', border: '2px solid #cfe2ff', padding: '0.65rem', borderRadius: '12px',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', color: THEME.primary,
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = THEME.primary; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.primary; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#E7F5FF'; e.currentTarget.style.color = THEME.primary; e.currentTarget.style.borderColor = '#cfe2ff'; }}
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0a0e27', margin: 0, letterSpacing: '-0.5px' }}>Post Details</h1>
                            <p style={{ fontSize: '0.98rem', color: '#6B7280', margin: 0, marginTop: '0.35rem', fontWeight: 500 }}>Review and moderate post content</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={handleFlag}
                            style={{
                                padding: '0.75rem 1.5rem', background: '#fff3e0', color: '#FF9800',
                                border: '2px solid #ffe0b2', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.3s', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#FF9800'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = '#FF9800'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff3e0'; e.currentTarget.style.color = '#FF9800'; e.currentTarget.style.borderColor = '#ffe0b2'; }}
                        >
                            <Flag size={16} /> Flag/Unflag
                        </button>
                        <button
                            onClick={handleDelete}
                            style={{
                                padding: '0.75rem 1.5rem', background: '#ffebee', color: THEME.danger,
                                border: `2px solid #ffcdd2`, borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.3s', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = THEME.danger; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = THEME.danger; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffebee'; e.currentTarget.style.color = THEME.danger; e.currentTarget.style.borderColor = '#ffcdd2'; }}
                        >
                            <Trash2 size={16} /> Delete Post
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                    {[
                        { label: 'Views', value: post.views_count, icon: Eye, color: THEME.primary },
                        { label: 'Comments', value: post.comments.length, icon: MessageSquare, color: THEME.info },
                        { label: 'Reactions', value: totalReactions, icon: Heart, color: THEME.danger },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} style={{
                                background: '#FFFFFF', border: `2.5px solid ${stat.color}20`, borderRadius: '16px', padding: '1.5rem',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = stat.color; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${stat.color}20`; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                                        <p style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${stat.color}15` }}>
                                        <Icon size={24} color={stat.color} strokeWidth={1.5} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Post Content Card */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
                        <UserAvatar imageUrl={post.user.profile_image_url} name={post.user.name} />
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>{post.user.name}</p>
                            <p style={{ fontSize: '0.88rem', color: '#9CA3AF', margin: 0, marginTop: '0.2rem', fontWeight: 500 }}>@{post.user.username}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                                backgroundColor: post.type === 'voice' ? '#e0f7fa' : '#e7f1ff',
                                color: post.type === 'voice' ? THEME.info : THEME.primary,
                                border: `1.5px solid ${post.type === 'voice' ? '#b3e5fc' : '#cfe2ff'}`,
                                textTransform: 'capitalize',
                            }}>
                                {post.type === 'voice' ? <Mic size={14} /> : <FileText size={14} />}
                                {post.type}
                            </span>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                                backgroundColor: '#f3f4f6', color: THEME.secondary, textTransform: 'capitalize',
                            }}>
                                <PrivacyIcon size={14} /> {post.privacy}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#9CA3AF', fontWeight: 500 }}>
                                <Clock size={14} /> {new Date(post.created_at).toLocaleDateString()} {new Date(post.created_at).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    {post.content && (
                        <div style={{ padding: '1.5rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB', marginBottom: post.voice_url || post.images.length > 0 ? '1.75rem' : 0 }}>
                            <p style={{ margin: 0, fontSize: '1rem', color: '#0a0e27', lineHeight: 1.7, fontWeight: 500 }}>{post.content}</p>
                        </div>
                    )}

                    {/* Voice */}
                    {post.voice_url && (
                        <div style={{ padding: '1.5rem', background: '#e0f7fa', borderRadius: '14px', border: '1.5px solid #b3e5fc', marginBottom: post.images.length > 0 ? '1.75rem' : 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Mic size={24} color={THEME.info} />
                                <div style={{ flex: 1 }}>
                                    <audio controls style={{ width: '100%' }}>
                                        <source src={post.voice_url} />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                                {post.voice_duration && (
                                    <span style={{ fontSize: '0.85rem', color: THEME.info, fontWeight: 700 }}>
                                        {Math.floor(post.voice_duration / 60)}:{String(post.voice_duration % 60).padStart(2, '0')}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Images Gallery */}
                    {post.images.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0e27', margin: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Image size={18} color={THEME.primary} /> Images ({post.images.length})
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                                {post.images.map((img) => (
                                    <div
                                        key={img.id}
                                        style={{
                                            borderRadius: '12px', overflow: 'hidden', border: '2px solid #E5E7EB',
                                            cursor: 'pointer', transition: 'all 0.3s', position: 'relative',
                                        }}
                                        onClick={() => setSelectedImage(img.url)}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.transform = 'scale(1.02)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = 'scale(1)'; }}
                                    >
                                        <img src={img.url} alt={img.caption || 'Post image'} style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Reactions Summary */}
                {post.reactions.length > 0 && (
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Heart size={20} color={THEME.danger} /> Reactions Summary
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {post.reactions.map((reaction, idx) => (
                                <div key={idx} style={{
                                    padding: '0.75rem 1.25rem', background: '#F9FAFB', borderRadius: '12px',
                                    border: '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                }}>
                                    <span style={{ fontSize: '1.1rem' }}>{reaction.type}</span>
                                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0a0e27' }}>{reaction.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comments */}
                <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid #E5E7EB', padding: '2rem', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a0e27', margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <MessageSquare size={20} color={THEME.info} /> Comments ({post.comments.length})
                    </h3>
                    {post.comments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {post.comments.map((comment) => (
                                <div key={comment.id} style={{
                                    padding: '1.25rem', background: '#F9FAFB', borderRadius: '14px', border: '1.5px solid #E5E7EB',
                                    display: 'flex', alignItems: 'flex-start', gap: '1rem', transition: 'all 0.3s',
                                }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
                                >
                                    <SmallAvatar imageUrl={comment.user.profile_image_url} name={comment.user.name} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <div>
                                                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0a0e27' }}>{comment.user.name}</span>
                                                <span style={{ fontSize: '0.82rem', color: '#9CA3AF', marginLeft: '0.5rem', fontWeight: 500 }}>@{comment.user.username}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontSize: '0.82rem', color: '#9CA3AF', fontWeight: 500 }}>{comment.created_at}</span>
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    style={{
                                                        padding: '0.35rem 0.65rem', background: '#ffebee', color: THEME.danger,
                                                        border: '1.5px solid #ffcdd2', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                                                        cursor: 'pointer', transition: 'all 0.3s',
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = THEME.danger; e.currentTarget.style.color = '#FFFFFF'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#ffebee'; e.currentTarget.style.color = THEME.danger; }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.92rem', color: '#4B5563', lineHeight: 1.6, fontWeight: 500 }}>{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <MessageSquare size={40} color="#D1D5DB" strokeWidth={1.5} style={{ margin: '0 auto 1rem' }} />
                            <p style={{ fontSize: '0.95rem', color: '#888', margin: 0 }}>No comments on this post</p>
                        </div>
                    )}
                </div>

                {/* Image Lightbox */}
                {selectedImage && (
                    <div
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1000, cursor: 'pointer',
                        }}
                    >
                        <img src={selectedImage} alt="Full size" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '12px', objectFit: 'contain' }} />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
