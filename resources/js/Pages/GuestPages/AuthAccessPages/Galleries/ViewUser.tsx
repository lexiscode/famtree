import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Image as ImageIcon, Play, X, ArrowLeft } from 'lucide-react';
import './Galleries.css';

interface Gallery {
    id: number;
    title: string | null;
    description: string | null;
    file_url: string;
    thumbnail_url: string | null;
    file_type: 'image' | 'video';
    file_size: number;
    uploaded_at: string;
}

interface Props {
    galleries: Gallery[];
    total: number;
    count: number;
    userName: string;
    userId: number;
}

export default function ViewUserGalleries({ galleries, count, userName, userId }: Props) {
    const [selectedGalleryItem, setSelectedGalleryItem] = useState<Gallery | null>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <AuthAccessLayout>
            <div className="galleries-page">
                {/* Background Orbs */}
                <div className="galleries-background">
                    <div className="gallery-orb gallery-orb-1"></div>
                    <div className="gallery-orb gallery-orb-2"></div>
                    <div className="gallery-orb gallery-orb-3"></div>
                </div>

                <div className="galleries-container">
                    {/* Back Button */}
                    <button
                        className="back-button"
                        onClick={() => router.visit(route('profile.view', userId))}
                        title="Back to profile"
                    >
                        <ArrowLeft size={20} />
                        Back to Profile
                    </button>

                    {/* Header */}
                    <div className="galleries-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div>
                                <h1>{userName}'s Gallery</h1>
                                <p>View photos and videos shared by {userName}</p>
                                <span className="gallery-count">{count} items in gallery</span>
                            </div>
                        </div>
                    </div>

                    {/* Galleries Grid */}
                    {galleries.length > 0 ? (
                        <div className="galleries-section">
                            <h3>{userName}'s Gallery ({count})</h3>
                            <div className="galleries-grid">
                                {galleries.map((gallery) => (
                                    <div key={gallery.id} className="gallery-item">
                                        <div
                                            className="gallery-item-image"
                                            onClick={() => setSelectedGalleryItem(gallery)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {gallery.file_type === 'image' ? (
                                                <img
                                                    src={gallery.file_url}
                                                    alt={gallery.title || 'Gallery item'}
                                                />
                                            ) : (
                                                <div className="video-item">
                                                    <img
                                                        src={gallery.thumbnail_url || 'https://via.placeholder.com/300x300?text=Video'}
                                                        alt={gallery.title || 'Video'}
                                                    />
                                                    <div className="play-overlay">
                                                        <Play size={48} fill="white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="gallery-item-info">
                                            {gallery.title && (
                                                <h4>{gallery.title}</h4>
                                            )}
                                            {gallery.description && (
                                                <p>{gallery.description}</p>
                                            )}
                                            <div className="gallery-item-meta">
                                                <span className="file-type">
                                                    {gallery.file_type === 'image' ? (
                                                        <ImageIcon size={14} />
                                                    ) : (
                                                        <Play size={14} />
                                                    )}
                                                    {gallery.file_type}
                                                </span>
                                                <span className="file-size">{formatFileSize(gallery.file_size)}</span>
                                            </div>
                                            <div className="gallery-item-date">
                                                {new Date(gallery.uploaded_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <ImageIcon size={64} />
                            <h3>No galleries yet</h3>
                            <p>{userName} hasn't uploaded any images or videos yet</p>
                        </div>
                    )}

                    {/* Media Popup Modal */}
                    {selectedGalleryItem && (
                        <div
                            className="gallery-image-popup-overlay"
                            onClick={() => setSelectedGalleryItem(null)}
                        >
                            <div className="gallery-image-popup-container">
                                <button
                                    className="gallery-image-popup-close"
                                    onClick={() => setSelectedGalleryItem(null)}
                                    title="Close"
                                    aria-label="Close media"
                                >
                                    <X size={32} />
                                </button>
                                {selectedGalleryItem.file_type === 'image' ? (
                                    <img
                                        src={selectedGalleryItem.file_url}
                                        alt={selectedGalleryItem.title || 'Gallery item'}
                                        className="gallery-image-popup-img"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <video
                                        src={selectedGalleryItem.file_url}
                                        className="gallery-video-popup-video"
                                        controls
                                        autoPlay
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
