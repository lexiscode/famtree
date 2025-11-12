import { useState } from 'react';

interface ShareButtonProps {
    isOpen: boolean;
    onClose: () => void;
    familyName: string;
    familyUrl: string;
}

export default function ShareButton({
    isOpen,
    onClose,
    familyName,
    familyUrl,
}: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(familyUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareWhatsApp = () => {
        const text = `Check out the ${familyName} family on FamTree! ${familyUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleShareFacebook = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(familyUrl)}`,
            '_blank'
        );
    };

    const handleShareTwitter = () => {
        const text = `Discover the ${familyName} family on FamTree!`;
        window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(familyUrl)}&text=${encodeURIComponent(text)}`,
            '_blank'
        );
    };

    const handleShareEmail = () => {
        const subject = `Check out ${familyName} family on FamTree`;
        const body = `I found the ${familyName} family on FamTree. Check it out: ${familyUrl}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    if (!isOpen) return null;

    return (
        <div className="share-modal-backdrop" onClick={onClose}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                <div className="share-modal-header">
                    <h3>Share {familyName}</h3>
                    <button className="share-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="share-modal-content">
                    <div className="share-link-section">
                        <label>Family Link</label>
                        <div className="share-link-input">
                            <input type="text" value={familyUrl} readOnly />
                            <button
                                className={`share-copy-btn ${copied ? 'copied' : ''}`}
                                onClick={handleCopyLink}
                            >
                                {copied ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    <div className="share-options">
                        <h4>Share on Social Media</h4>
                        <div className="share-buttons">
                            <button
                                className="share-option whatsapp"
                                onClick={handleShareWhatsApp}
                                title="Share on WhatsApp"
                            >
                                <span>💬</span>
                                <span>WhatsApp</span>
                            </button>

                            <button
                                className="share-option facebook"
                                onClick={handleShareFacebook}
                                title="Share on Facebook"
                            >
                                <span>f</span>
                                <span>Facebook</span>
                            </button>

                            <button
                                className="share-option twitter"
                                onClick={handleShareTwitter}
                                title="Share on Twitter"
                            >
                                <span>𝕏</span>
                                <span>Twitter</span>
                            </button>

                            <button
                                className="share-option email"
                                onClick={handleShareEmail}
                                title="Share via Email"
                            >
                                <span>✉️</span>
                                <span>Email</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
