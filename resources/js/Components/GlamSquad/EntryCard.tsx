import { useState } from 'react';
import { Star, ThumbsUp, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GlamEntry } from '@/types/glam';

interface Props {
    entry: GlamEntry;
}

function getRankBadge(rank: number | null) {
    if (!rank) return null;
    const cls = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'other';
    return <span className={`rank-badge ${cls}`}>{rank}</span>;
}

export default function EntryCard({ entry }: Props) {
    const photos = [entry.photo_1, entry.photo_2].filter(Boolean) as string[];
    const hasTwo = photos.length > 1;

    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxImage(photos[index]);
    };
    const closeLightbox = () => { setLightboxImage(null); };
    const lightboxPrev = () => { const i = (lightboxIndex - 1 + photos.length) % photos.length; setLightboxIndex(i); setLightboxImage(photos[i]); };
    const lightboxNext = () => { const i = (lightboxIndex + 1) % photos.length; setLightboxIndex(i); setLightboxImage(photos[i]); };

    return (
        <>
            <div className="entry-card">
                <div className={`entry-card-photos ${hasTwo ? 'dual' : ''}`}>
                    {photos.map((photo, i) => (
                        <img
                            key={i}
                            src={photo}
                            alt={`Entry photo ${i + 1}`}
                            onClick={() => openLightbox(i)}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </div>
                <div className="entry-card-body">
                    <div className="entry-card-user">
                        {entry.rank !== null && getRankBadge(entry.rank)}
                        <div className="entry-card-avatar">
                            {entry.user?.profile_image_url ? (
                                <img src={entry.user.profile_image_url} alt="" />
                            ) : (
                                entry.user?.first_name?.charAt(0) || '?'
                            )}
                        </div>
                        <span style={{ color: '#ffffff', fontWeight: 500, fontSize: 14 }}>
                            {entry.user?.first_name} {entry.user?.last_name}
                        </span>
                    </div>
                    {entry.caption && (
                        <p className="entry-card-caption">{entry.caption}</p>
                    )}
                    <div className="entry-card-stats">
                        <span><Star size={14} /> {Number(entry.avg_rating).toFixed(1)}</span>
                        <span><ThumbsUp size={14} /> {entry.vote_count} votes</span>
                        {entry.weighted_score > 0 && (
                            <span style={{ color: '#667eea', fontWeight: 600 }}>
                                Score: {Number(entry.weighted_score).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImage && (
                <div
                    onClick={closeLightbox}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
                        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'fadeIn 0.2s ease',
                    }}
                >
                    <button
                        onClick={closeLightbox}
                        style={{
                            position: 'absolute', top: 16, right: 16,
                            width: 40, height: 40, borderRadius: 10,
                            background: 'rgba(255,255,255,0.1)', border: 'none',
                            color: '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <X size={20} color="#fff" />
                    </button>

                    {photos.length > 1 && (
                        <div style={{
                            position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
                            color: '#94a3b8', fontSize: 14, fontWeight: 500,
                        }}>
                            {lightboxIndex + 1} / {photos.length}
                        </div>
                    )}

                    {photos.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                            style={{
                                position: 'absolute', left: 16,
                                width: 44, height: 44, borderRadius: 12,
                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                color: '#fff', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <ChevronLeft size={24} color="#fff" />
                        </button>
                    )}

                    <img
                        src={lightboxImage}
                        alt={`Photo ${lightboxIndex + 1}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '90vw', maxHeight: '85vh',
                            objectFit: 'contain', borderRadius: 12,
                            animation: 'slideUp 0.25s ease',
                        }}
                    />

                    {photos.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                            style={{
                                position: 'absolute', right: 16,
                                width: 44, height: 44, borderRadius: 12,
                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                color: '#fff', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <ChevronRight size={24} color="#fff" />
                        </button>
                    )}
                </div>
            )}
        </>
    );
}
