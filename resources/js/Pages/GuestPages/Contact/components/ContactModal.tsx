import { useEffect, useRef, FormEvent } from 'react';
import './ContactModal.css';

interface FormData {
    data: {
        name: string;
        email: string;
        subject: string;
        message: string;
    };
    setData: (key: string, value: string) => void;
    post: (url: string, options?: any) => void;
    processing: boolean;
    errors: Record<string, string>;
    submitted: boolean;
    setSubmitted: (value: boolean) => void;
    reset: () => void;
}

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    type: 'form' | 'info';
    content?: React.ReactNode;
    formData?: FormData;
}

export default function ContactModal({ isOpen, onClose, title, type, content, formData }: ContactModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === modalRef.current) {
            onClose();
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (formData) {
            formData.post('/contact', {
                onSuccess: () => {
                    formData.setSubmitted(true);
                    formData.reset();
                    setTimeout(() => {
                        formData.setSubmitted(false);
                        onClose();
                    }, 3000);
                },
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="contact-modal-overlay"
            ref={modalRef}
            onClick={handleBackdropClick}
        >
            <div className="contact-modal">
                <div className="contact-modal-header">
                    <h2>{title}</h2>
                    <button
                        className="contact-modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <i className="bi-x-lg"></i>
                    </button>
                </div>
                <div className="contact-modal-content">
                    {type === 'form' && formData ? (
                        <div className="contact-form-container">
                            {formData.submitted && (
                                <div className="success-message">
                                    <i className="bi-check-circle-fill"></i>
                                    <span>Thank you! Your message has been sent successfully. We'll get back to you soon.</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-group">
                                    <label htmlFor="name">
                                        <i className="bi-person-fill"></i>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.data.name}
                                        onChange={(e) => formData.setData('name', e.target.value)}
                                        placeholder="Your full name"
                                        className={formData.errors.name ? 'error' : ''}
                                    />
                                    {formData.errors.name && <span className="error-msg">{formData.errors.name}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">
                                        <i className="bi-envelope-fill"></i>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.data.email}
                                        onChange={(e) => formData.setData('email', e.target.value)}
                                        placeholder="your@email.com"
                                        className={formData.errors.email ? 'error' : ''}
                                    />
                                    {formData.errors.email && <span className="error-msg">{formData.errors.email}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">
                                        <i className="bi-tag-fill"></i>
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.data.subject}
                                        onChange={(e) => formData.setData('subject', e.target.value)}
                                        placeholder="How can we help?"
                                        className={formData.errors.subject ? 'error' : ''}
                                    />
                                    {formData.errors.subject && <span className="error-msg">{formData.errors.subject}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">
                                        <i className="bi-chat-left-text-fill"></i>
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={6}
                                        value={formData.data.message}
                                        onChange={(e) => formData.setData('message', e.target.value)}
                                        placeholder="Tell us more about your inquiry..."
                                        className={formData.errors.message ? 'error' : ''}
                                    ></textarea>
                                    {formData.errors.message && <span className="error-msg">{formData.errors.message}</span>}
                                </div>

                                <button type="submit" disabled={formData.processing} className="submit-btn">
                                    {formData.processing ? (
                                        <>
                                            <i className="bi-hourglass-split"></i>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi-send-fill"></i>
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        content
                    )}
                </div>
            </div>
        </div>
    );
}
