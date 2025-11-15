import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Upload, Trash2, Image as ImageIcon, Play, X, ArrowLeft } from 'lucide-react';
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
    per_page: number;
    current_page: number;
    last_page: number;
    count: number;
}

export default function GalleriesIndex({ galleries, total, count }: Props) {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [galleryToDelete, setGalleryToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const validateAndAddFiles = (files: File[]) => {
        // Validate files
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        const allValidTypes = [...validImageTypes, ...validVideoTypes];

        const validFiles = files.filter(file => {
            if (!allValidTypes.includes(file.type)) {
                alert(`${file.name} has an unsupported format`);
                return false;
            }
            if (file.size > 50 * 1024 * 1024) {
                alert(`${file.name} exceeds 50MB limit`);
                return false;
            }
            return true;
        });

        setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);

        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrls(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        validateAndAddFiles(files);
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files || []);
        validateAndAddFiles(files);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            alert('Please select at least one file');
            return;
        }

        setIsUploading(true);

        for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append('file', file);

            router.post(route('galleries.store'), formData, {
                onSuccess: () => {
                    // File uploaded successfully
                },
                onError: (errors) => {
                    console.error('Upload error:', errors);
                    setIsUploading(false);
                },
            });
        }

        // Close modal and refresh page after uploading
        setTimeout(() => {
            setSelectedFiles([]);
            setPreviewUrls([]);
            setIsUploading(false);
            setShowUploadModal(false);
            router.reload();
        }, 1500);
    };

    const handleDeleteClick = (galleryId: number) => {
        setGalleryToDelete(galleryId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (galleryToDelete === null) return;

        setIsDeleting(true);

        router.post(`/galleries/${galleryToDelete}`,
            { _method: 'DELETE' },
            {
                onSuccess: () => {
                    // Item deleted successfully - page will refresh automatically
                    setShowDeleteConfirm(false);
                    setGalleryToDelete(null);
                    setIsDeleting(false);
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    setIsDeleting(false);
                    setShowDeleteConfirm(false);
                    setGalleryToDelete(null);
                },
            }
        );
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setGalleryToDelete(null);
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
        setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
    };

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
                        onClick={() => router.visit(route('profile.me'))}
                        title="Back to profile"
                    >
                        <ArrowLeft size={20} />
                        Back to Profile
                    </button>

                    {/* Header */}
                    <div className="galleries-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div>
                                <h1>My Galleries</h1>
                                <p>Upload and manage your personal photos and videos</p>
                                <span className="gallery-count">{count} items in gallery</span>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowUploadModal(true)}
                                style={{ height: 'fit-content' }}
                            >
                                <Upload size={18} style={{ marginRight: '0.5rem' }} />
                                Upload Files
                            </button>
                        </div>
                    </div>

                    {/* Upload Modal */}
                    {showUploadModal && (
                        <div className="modal-overlay" onClick={() => !isUploading && setShowUploadModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Upload Files</h2>
                                    <button
                                        className="modal-close"
                                        onClick={() => !isUploading && setShowUploadModal(false)}
                                        disabled={isUploading}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="modal-body">
                                    {selectedFiles.length === 0 ? (
                                        <div
                                            className={`upload-card ${dragActive ? 'drag-active' : ''}`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            <div className="upload-icon">
                                                <Upload size={48} />
                                            </div>
                                            <h3>Select or Drag Files</h3>
                                            <p>Drag and drop your images or videos here, or click to select</p>
                                            <input
                                                type="file"
                                                id="file-input"
                                                multiple
                                                accept="image/*,video/*"
                                                onChange={handleFileSelect}
                                                style={{ display: 'none' }}
                                            />
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => document.getElementById('file-input')?.click()}
                                                disabled={isUploading}
                                            >
                                                Select Files
                                            </button>
                                            <p className="upload-note">
                                                Supported: JPG, PNG, GIF, WebP, MP4, WebM, MOV • Max 50MB per file
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="selected-files-preview">
                                            <h3>Selected Files ({selectedFiles.length})</h3>
                                            <div className="modal-files-grid">
                                                {selectedFiles.map((file, index) => (
                                                    <div key={index} className="modal-file-item">
                                                        <div className="modal-file-preview">
                                                            {file.type.startsWith('image/') ? (
                                                                <img
                                                                    src={previewUrls[index]}
                                                                    alt={file.name}
                                                                />
                                                            ) : (
                                                                <div className="video-placeholder">
                                                                    <Play size={32} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="modal-file-info">
                                                            <p className="file-name">{file.name}</p>
                                                            <p className="file-size">{formatFileSize(file.size)}</p>
                                                        </div>
                                                        <button
                                                            className="btn-remove"
                                                            onClick={() => removeSelectedFile(index)}
                                                            title="Remove this file"
                                                            disabled={isUploading}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    {selectedFiles.length > 0 && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleUpload}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => {
                                            if (!isUploading) {
                                                setSelectedFiles([]);
                                                setPreviewUrls([]);
                                                setShowUploadModal(false);
                                            }
                                        }}
                                        disabled={isUploading}
                                    >
                                        {selectedFiles.length > 0 ? 'Cancel' : 'Close'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Galleries Grid */}
                    {galleries.length > 0 ? (
                        <div className="galleries-section">
                            <h3>Your Galleries ({count})</h3>
                            <div className="galleries-grid">
                                {galleries.map((gallery) => (
                                    <div key={gallery.id} className="gallery-item">
                                        <div className="gallery-item-image">
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
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteClick(gallery.id)}
                                            title="Delete this item"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <ImageIcon size={64} />
                            <h3>No galleries yet</h3>
                            <p>Upload your first image or video to get started</p>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {showDeleteConfirm && (
                        <div className="modal-overlay" onClick={cancelDelete}>
                            <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Delete Item</h2>
                                    <button
                                        className="modal-close"
                                        onClick={cancelDelete}
                                        disabled={isDeleting}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <Trash2 size={48} style={{ color: '#ff3b30', opacity: 0.8 }} />
                                    </div>
                                    <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Delete This Item?</h3>
                                    <p style={{ color: '#b0c4de', margin: 0 }}>
                                        This action cannot be undone. The file will be permanently deleted.
                                    </p>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        className="btn btn-outline"
                                        onClick={cancelDelete}
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn"
                                        onClick={confirmDelete}
                                        disabled={isDeleting}
                                        style={{
                                            background: '#ff3b30',
                                            color: 'white',
                                        }}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
