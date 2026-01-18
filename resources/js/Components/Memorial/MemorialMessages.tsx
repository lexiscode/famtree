import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import './Memorial.css';

interface MemorialMessage {
    id: number;
    message: string;
    relationship_type: string;
    created_at: string;
    author: {
        id: number;
        uuid: string;
        first_name: string;
        last_name: string;
        profile_image_url: string | null;
    };
    can_edit: boolean;
}

interface Props {
    userUuid: string;
    canAddMessage: boolean;
    currentUserId?: number;
}

export default function MemorialMessages({ userUuid, canAddMessage, currentUserId }: Props) {
    const [messages, setMessages] = useState<MemorialMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMessages();
    }, [userUuid]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`/memorial/${userUuid}/messages`);
            setMessages(response.data.messages);
        } catch (err) {
            console.error('Failed to fetch memorial messages:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.post(`/memorial/${userUuid}/messages`, {
                message: newMessage.trim(),
            });
            setMessages([response.data.message, ...messages]);
            setNewMessage('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add message');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (messageId: number) => {
        if (!editContent.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.put(`/memorial/messages/${messageId}`, {
                message: editContent.trim(),
            });
            setMessages(messages.map(msg =>
                msg.id === messageId
                    ? { ...msg, message: response.data.message.message }
                    : msg
            ));
            setEditingId(null);
            setEditContent('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update message');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (messageId: number) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            await axios.delete(`/memorial/messages/${messageId}`);
            setMessages(messages.filter(msg => msg.id !== messageId));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete message');
        }
    };

    const startEditing = (message: MemorialMessage) => {
        setEditingId(message.id);
        setEditContent(message.message);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditContent('');
    };

    const formatRelationship = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
    };

    if (isLoading) {
        return (
            <div className="memorial-messages-section">
                <h3 className="section-title">Tributes & Memories</h3>
                <div className="loading">Loading messages...</div>
            </div>
        );
    }

    return (
        <div className="memorial-messages-section">
            <h3 className="section-title">Tributes & Memories</h3>

            {error && (
                <div className="error-message">{error}</div>
            )}

            {canAddMessage && (
                <form onSubmit={handleSubmit} className="add-message-form">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Share a memory or tribute..."
                        rows={3}
                        maxLength={2000}
                    />
                    <div className="form-actions">
                        <span className="char-count">{newMessage.length}/2000</span>
                        <button
                            type="submit"
                            disabled={isSubmitting || !newMessage.trim()}
                            className="submit-btn"
                        >
                            {isSubmitting ? 'Posting...' : 'Share Tribute'}
                        </button>
                    </div>
                </form>
            )}

            <div className="messages-list">
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>No tributes have been shared yet.</p>
                        {canAddMessage && (
                            <p className="hint">Be the first to share a memory.</p>
                        )}
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className="memorial-message-card">
                            <div className="message-header">
                                <div className="author-info">
                                    {message.author.profile_image_url ? (
                                        <img
                                            src={message.author.profile_image_url}
                                            alt={`${message.author.first_name} ${message.author.last_name}`}
                                            className="author-avatar"
                                        />
                                    ) : (
                                        <div className="author-avatar-placeholder">
                                            {message.author.first_name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="author-details">
                                        <span className="author-name">
                                            {message.author.first_name} {message.author.last_name}
                                        </span>
                                        <span className="relationship">
                                            {formatRelationship(message.relationship_type)}
                                        </span>
                                    </div>
                                </div>
                                <span className="message-date">
                                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                </span>
                            </div>

                            {editingId === message.id ? (
                                <div className="edit-form">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={3}
                                        maxLength={2000}
                                    />
                                    <div className="edit-actions">
                                        <button
                                            onClick={cancelEditing}
                                            className="cancel-btn"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleEdit(message.id)}
                                            disabled={isSubmitting}
                                            className="save-btn"
                                        >
                                            {isSubmitting ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="message-content">{message.message}</p>
                                    {message.can_edit && (
                                        <div className="message-actions">
                                            <button
                                                onClick={() => startEditing(message)}
                                                className="edit-btn"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(message.id)}
                                                className="delete-btn"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
