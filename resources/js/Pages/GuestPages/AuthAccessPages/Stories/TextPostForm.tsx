import { useState, useRef } from 'react';
import { Upload, Send, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import { TextPostFormProps } from '@/types';
import RichTextEditor from '@/Components/RichTextEditor';

export default function TextPostForm({ onClose, onPostCreated }: TextPostFormProps) {
    const [content, setContent] = useState('');
    const [privacy, setPrivacy] = useState<'public' | 'connected' | 'private'>('connected');
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
        if (!content.trim()) {
            setError('Content is required for text posts');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('type', 'text');
            formData.append('privacy', privacy);
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

            {/* Content */}
            <div className="form-group">
                <label htmlFor="text-content" className="form-label">Content</label>
                <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Share your story... Use the toolbar to style your text!"
                    maxLength={5000}
                    disabled={isLoading}
                />
            </div>

            {/* Privacy Setting */}
            <div className="form-group">
                <label htmlFor="privacy" className="form-label">Who can see this?</label>
                <select
                    id="privacy"
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as 'public' | 'connected' | 'private')}
                    className="form-select"
                    disabled={isLoading}
                    style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        fontSize: '0.95rem',
                        width: '100%',
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    <option value="public">Public - Anyone can see</option>
                    <option value="connected">Connected Only - Only your connections</option>
                    <option value="private">Private - Only you</option>
                </select>
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                    Choose who can see this specific story
                </small>
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
