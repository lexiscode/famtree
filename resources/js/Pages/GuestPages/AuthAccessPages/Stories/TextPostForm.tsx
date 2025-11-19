import { useState, useRef } from 'react';
import { Upload, Send, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import { TextPostFormProps } from '@/types';

export default function TextPostForm({ onClose, onPostCreated }: TextPostFormProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        if (!content.trim()) {
            setError('Content is required for text posts');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('type', 'text');
            formData.append('title', title);
            formData.append('content', content);

            // Add images
            images.forEach((image, index) => {
                formData.append(`images[${index}]`, image);
            });

            // Use Inertia's router.post with FormData
            router.post(route('stories.store'), formData as any, {
                onSuccess: () => {
                    onPostCreated();
                    onClose();
                },
                onError: (errors: any) => {
                    const errorMessage = Object.values(errors).flat().join(', ');
                    setError(errorMessage || 'Failed to create post');
                    setIsLoading(false);
                },
            });
        } catch (err) {
            setError('Failed to create post. Please try again.');
            console.error('Error creating post:', err);
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="create-post-form">
            {/* Error Message */}
            {error && <div className="error-alert">{error}</div>}

            {/* Title */}
            <div className="form-group">
                <label htmlFor="text-title" className="form-label">Title</label>
                <input
                    id="text-title"
                    type="text"
                    placeholder="What's on your mind?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input"
                    maxLength={255}
                    disabled={isLoading}
                />
                <small className="char-count">{title.length}/255</small>
            </div>

            {/* Content */}
            <div className="form-group">
                <label htmlFor="text-content" className="form-label">Content</label>
                <textarea
                    id="text-content"
                    placeholder="Share your story..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="form-textarea"
                    rows={6}
                    maxLength={5000}
                    disabled={isLoading}
                />
                <small className="char-count">{content.length}/5000</small>
            </div>

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
                        disabled={images.length >= 10 || isLoading}
                    />
                    <button
                        type="button"
                        className="upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={images.length >= 10 || isLoading}
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
                                    disabled={isLoading}
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
                {isLoading ? 'Publishing...' : 'Publish Text Story'}
            </button>
        </form>
    );
}
