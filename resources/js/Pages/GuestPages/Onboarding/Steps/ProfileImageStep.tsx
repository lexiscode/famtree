import { useState, FormEvent, useRef } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, Upload, User } from 'lucide-react';

interface ProfileImageStepProps {
    onComplete: (progress: any) => void;
    data: Record<string, any> | null | undefined;
}

export default function ProfileImageStep({ onComplete, data }: ProfileImageStepProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(data?.profile_image || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setErrors({
                profile_image: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)',
            });
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setErrors({
                profile_image: 'Image size should not exceed 5MB',
            });
            return;
        }

        setSelectedFile(file);
        setErrors({});

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const formData = new FormData();
        if (selectedFile) {
            formData.append('profile_image', selectedFile);
        }

        router.post(route('onboarding.save.profile-image'), formData, {
            onSuccess: (page) => {
                setIsSubmitting(false);
                // @ts-ignore
                onComplete(page.props.progress);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setErrors(errors as Record<string, string>);
            },
        });
    };

    return (
        <div className="profile-image-step">
            <h3>Add a profile picture</h3>
            <p>Upload a profile photo to help others recognize you. This is optional and can be skipped.</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">
                        Profile Picture
                    </label>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                    }}>
                        {/* Image Preview */}
                        <div style={{
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            backgroundColor: '#f3f4f6',
                            border: '2px dashed #d1d5db',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                        }}>
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Profile preview"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <User size={80} color="#d1d5db" />
                            )}
                        </div>

                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            disabled={isSubmitting}
                        />

                        {/* Upload Button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-outline"
                            disabled={isSubmitting}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <Upload size={18} />
                            {selectedFile ? 'Change Image' : 'Upload Image'}
                        </button>

                        {selectedFile && (
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                textAlign: 'center',
                            }}>
                                {selectedFile.name}
                            </p>
                        )}
                    </div>

                    {errors.profile_image && (
                        <div className="error-message" style={{ marginTop: '16px' }}>
                            <AlertCircle size={16} />
                            {errors.profile_image}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="btn-group">
                    <button
                        type="submit"
                        className="btn btn-primary btn-full-width"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                Uploading...
                            </>
                        ) : (
                            'Continue to Next Step'
                        )}
                    </button>
                </div>

                {/* Skip Button */}
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => {
                            const formData = new FormData();
                            router.post(route('onboarding.save.profile-image'), formData, {
                                onSuccess: (page) => {
                                    // @ts-ignore
                                    onComplete(page.props.progress);
                                },
                            });
                        }}
                        className="btn btn-link"
                        disabled={isSubmitting}
                        style={{
                            color: '#6b7280',
                            textDecoration: 'underline',
                        }}
                    >
                        Skip for now
                    </button>
                </div>
            </form>
        </div>
    );
}
