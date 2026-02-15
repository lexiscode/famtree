import { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface Props {
    onPhotos: (photo1: File | null, photo2: File | null) => void;
}

export default function PhotoUploader({ onPhotos }: Props) {
    const [preview1, setPreview1] = useState<string | null>(null);
    const [preview2, setPreview2] = useState<string | null>(null);
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const input1Ref = useRef<HTMLInputElement>(null);
    const input2Ref = useRef<HTMLInputElement>(null);

    const handleFile = (file: File, slot: 1 | 2) => {
        const url = URL.createObjectURL(file);
        if (slot === 1) {
            setFile1(file);
            setPreview1(url);
            onPhotos(file, file2);
        } else {
            setFile2(file);
            setPreview2(url);
            onPhotos(file1, file);
        }
    };

    const removePhoto = (slot: 1 | 2) => {
        if (slot === 1) {
            setFile1(null);
            setPreview1(null);
            onPhotos(null, file2);
        } else {
            setFile2(null);
            setPreview2(null);
            onPhotos(file1, null);
        }
    };

    return (
        <div>
            <div className="photo-uploader-preview" style={{ marginBottom: 12 }}>
                {preview1 && (
                    <div style={{ position: 'relative' }}>
                        <img src={preview1} alt="Photo 1" />
                        <button
                            onClick={() => removePhoto(1)}
                            style={{
                                position: 'absolute', top: 6, right: 6,
                                width: 24, height: 24,
                                background: 'rgba(239, 68, 68, 0.85)', border: 'none',
                                borderRadius: 6, cursor: 'pointer',
                                color: '#fff', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                padding: 0, lineHeight: 1,
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            <X size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                )}
                {preview2 && (
                    <div style={{ position: 'relative' }}>
                        <img src={preview2} alt="Photo 2" />
                        <button
                            onClick={() => removePhoto(2)}
                            style={{
                                position: 'absolute', top: 6, right: 6,
                                width: 24, height: 24,
                                background: 'rgba(239, 68, 68, 0.85)', border: 'none',
                                borderRadius: 6, cursor: 'pointer',
                                color: '#fff', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                padding: 0, lineHeight: 1,
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            <X size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
                <div
                    className="photo-uploader"
                    style={{ flex: 1 }}
                    onClick={() => input1Ref.current?.click()}
                >
                    <Camera size={24} style={{ color: '#94a3b8', marginBottom: 8 }} />
                    <div style={{ color: '#94a3b8', fontSize: 13 }}>
                        {preview1 ? 'Change Photo 1' : 'Photo 1 (required)'}
                    </div>
                    <input
                        ref={input1Ref}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 1)}
                    />
                </div>
                <div
                    className="photo-uploader"
                    style={{ flex: 1 }}
                    onClick={() => input2Ref.current?.click()}
                >
                    <Camera size={24} style={{ color: '#94a3b8', marginBottom: 8 }} />
                    <div style={{ color: '#94a3b8', fontSize: 13 }}>
                        {preview2 ? 'Change Photo 2' : 'Photo 2 (optional)'}
                    </div>
                    <input
                        ref={input2Ref}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 2)}
                    />
                </div>
            </div>
        </div>
    );
}
