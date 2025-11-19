import { useState } from 'react';
import { X, Type, Mic } from 'lucide-react';
import { CreatePostModalProps } from '@/types';
import TextPostForm from './TextPostForm';
import VoicePostForm from './VoicePostForm';

export default function CreatePostModal({ onClose, onPostCreated }: CreatePostModalProps) {
    const [postType, setPostType] = useState<'text' | 'voice'>('text');

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

                {/* Forms - Separate for each post type */}
                {postType === 'text' && (
                    <TextPostForm onClose={onClose} onPostCreated={onPostCreated} />
                )}

                {postType === 'voice' && (
                    <VoicePostForm onClose={onClose} onPostCreated={onPostCreated} />
                )}
            </div>
        </div>
    );
}
