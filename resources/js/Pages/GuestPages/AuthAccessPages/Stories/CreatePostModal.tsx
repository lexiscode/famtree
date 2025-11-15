import { useState, useRef } from 'react';
import { X, Type, Mic, Upload, Send } from 'lucide-react';
import VoiceRecorder from '@/Components/VoiceRecorder';

interface Props {
    onClose: () => void;
    onPostCreated: () => void;
}

export default function CreatePostModal({ onClose, onPostCreated }: Props) {
    const [postType, setPostType] = useState<'text' | 'voice'>('text');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (images.length + files.length > 10) {
            setError('Maximum 10 images allowed');
            return;
        }

        const newFiles = [...images, ...files];
        setImages(newFiles);

        // Create previews
        const newPreviews: string[] = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    newPreviews.push(e.target.result as string);
                    if (newPreviews.length === files.length) {
                        setImagePreviews([...imagePreviews, ...newPreviews]);
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // Remove image
    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    // Handle recording complete
    const handleRecordingComplete = (blob: Blob, duration: number) => {
        setRecordingBlob(blob);
        setRecordingDuration(duration);
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        if (postType === 'text' && !content.trim()) {
            setError('Content is required for text posts');
            return;
        }

        if (postType === 'voice' && !recordingBlob) {
            setError('Recording is required for voice posts');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('type', postType);
            formData.append('title', title);

            if (postType === 'text') {
                formData.append('content', content);
            } else if (postType === 'voice' && recordingBlob) {
                formData.append('voice_file', recordingBlob, 'recording.webm');
                formData.append('voice_duration', recordingDuration.toString());
            }

            // Add images
            images.forEach((image, index) => {
                formData.append(`images[${index}]`, image);
            });

            const response = await fetch(route('stories.store'), {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: formData,
            });

            if (response.ok) {
                onPostCreated();
                onClose();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to create post');
            }
        } catch (err) {
            setError('Failed to create post. Please try again.');
            console.error('Error creating post:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">Create New Story</h2>
                    <button
                        className="modal-close-btn"
                        onClick={onClose}
                        title="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="post-type-tabs">
                    <button
                        className={`tab-btn ${postType === 'text' ? 'active' : ''}`}
                        onClick={() => setPostType('text')}
                    >
                        <Type size={18} />
                        Text Post
                    </button>
                    <button
                        className={`tab-btn ${postType === 'voice' ? 'active' : ''}`}
                        onClick={() => setPostType('voice')}
                    >
                        <Mic size={18} />
                        Voice Post
                    </button>
                </div>

                {/* Error Message */}
                {error && <div className="error-alert">{error}</div>}

                {/* Form */}
                <form onSubmit={handleSubmit} className="create-post-form">
                    {/* Title */}
                    <div className="form-group">
                        <label htmlFor="title" className="form-label">Title</label>
                        <input
                            id="title"
                            type="text"
                            placeholder="What's on your mind?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="form-input"
                            maxLength={255}
                        />
                        <small className="char-count">{title.length}/255</small>
                    </div>

                    {/* Text Content */}
                    {postType === 'text' && (
                        <div className="form-group">
                            <label htmlFor="content" className="form-label">Content</label>
                            <textarea
                                id="content"
                                placeholder="Share your story..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="form-textarea"
                                rows={6}
                                maxLength={5000}
                            />
                            <small className="char-count">{content.length}/5000</small>
                        </div>
                    )}

                    {/* Voice Recording */}
                    {postType === 'voice' && (
                        <div className="form-group">
                            <label className="form-label">Voice Recording</label>
                            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="form-group">
                        <label className="form-label">Add Images (Optional)</label>
                        <div className="image-upload-area">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="file-input"
                                disabled={images.length >= 10}
                            />
                            <button
                                type="button"
                                className="upload-btn"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={images.length >= 10}
                            >
                                <Upload size={20} />
                                Click to upload or drag and drop
                            </button>
                            <small>PNG, JPG, GIF up to 5MB each (Max 10 images)</small>
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="image-previews">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="image-preview-item">
                                        <img src={preview} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={() => removeImage(index)}
                                            title="Remove image"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isLoading}
                    >
                        <Send size={18} />
                        {isLoading ? 'Publishing...' : 'Publish Story'}
                    </button>
                </form>
            </div>
        </div>
    );
}
