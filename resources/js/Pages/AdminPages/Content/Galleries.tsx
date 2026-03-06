import { useState, useCallback, useRef, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    Image,
    Video,
    Trash2,
    FileText,
    User,
} from 'lucide-react';

interface GalleryUser {
    name: string;
    username: string;
}

interface GalleryItem {
    id: number;
    user: GalleryUser;
    title: string;
    description: string | null;
    file_url: string;
    file_type: string;
    thumbnail_url: string | null;
    file_size: string;
    uploaded_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: GalleryItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface Statistics {
    total: number;
    images: number;
    videos: number;
}

interface Props {
    galleries: PaginatedData;
    statistics: Statistics;
    search: string;
    perPage: number;
}

export default function Galleries({ galleries, statistics, search, perPage }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [searchQuery, setSearchQuery] = useState(search || '');
    const isInitialMount = useRef(true);

    const handleSearch = useCallback(() => {
        router.get(route('admin.content.galleries'), { search: searchQuery, per_page: perPage }, { preserveScroll: true, preserveState: true });
    }, [searchQuery, perPage]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timer = setTimeout(() => {
            handleSearch();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handlePageChange = (page: number) => {
        router.get(route('admin.content.galleries'), { page, search: searchQuery, per_page: perPage }, { preserveScroll: true });
    };

    const handleDelete = (galleryId: number) => {
        if (confirm('Are you sure you want to delete this gallery item?')) {
            router.delete(route('admin.content.galleries.delete', galleryId), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <div>
{/* Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">Gallery Management</h1>
                    <p className="ap-page-subtitle">Manage all user-uploaded images and videos across the platform</p>
                </div>

                {/* Stats Grid */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'Total Files', value: statistics.total, icon: FileText, colorClass: 'indigo' },
                        { label: 'Images', value: statistics.images, icon: Image, colorClass: 'green' },
                        { label: 'Videos', value: statistics.videos, icon: Video, colorClass: 'blue' },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="ap-stat-card">
                                <div className="ap-stat-card-header">
                                    <p className="ap-stat-label">{stat.label}</p>
                                    <div className={`ap-stat-icon ${stat.colorClass}`}>
                                        <Icon size={20} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <p className="ap-stat-value">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="ap-filter-bar">
                    <div className="ap-search-bar">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search by title or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Gallery Grid */}
                {galleries.data.length > 0 ? (
                    <div className="ap-form-row ap-mb-xl">
                        {galleries.data.map((item) => (
                            <div key={item.id} className="ap-card ap-card-flush">
                                {/* Thumbnail */}
                                <div className="ap-gallery-thumb">
                                    {item.thumbnail_url || item.file_url ? (
                                        <img
                                            src={item.thumbnail_url || item.file_url}
                                            alt={item.title}
                                        />
                                    ) : (
                                        <div className="ap-flex ap-items-center ap-justify-center ap-gallery-thumb-placeholder">
                                            <Image size={48} color="var(--ap-text-tertiary)" />
                                        </div>
                                    )}
                                    <span className={`ap-badge ${item.file_type.startsWith('video') ? 'ap-badge-info' : 'ap-badge-success'} ap-gallery-badge`}>
                                        {item.file_type.startsWith('video') ? 'Video' : 'Image'}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="ap-gallery-body">
                                    <p className="ap-font-semibold ap-truncate ap-mb-sm">{item.title}</p>
                                    {item.description && (
                                        <p className="ap-text-sm ap-text-secondary ap-truncate ap-mb-sm">{item.description}</p>
                                    )}
                                    <div className="ap-flex ap-items-center ap-justify-between ap-mb-md">
                                        <div className="ap-flex ap-items-center ap-gap-sm">
                                            <User size={14} color="var(--ap-text-secondary)" />
                                            <span className="ap-text-sm ap-font-medium">{item.user.name}</span>
                                            <span className="ap-text-xs ap-text-tertiary">@{item.user.username}</span>
                                        </div>
                                        <span className="ap-text-xs ap-text-tertiary">{item.file_size}</span>
                                    </div>
                                    <div className="ap-flex ap-items-center ap-justify-between">
                                        <span className="ap-text-sm ap-text-secondary">{item.uploaded_at}</span>
                                        <button
                                            className="ap-btn ap-btn-sm ap-btn-danger"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="ap-table-wrap ap-mb-xl">
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <Image size={28} />
                            </div>
                            <p className="ap-empty-title">No gallery items found</p>
                            <p className="ap-empty-text">Try adjusting your search criteria</p>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {galleries.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{galleries.from}</strong> to <strong>{galleries.to}</strong> of <strong>{galleries.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            {galleries.links.map((link, index) => (
                                <button
                                    key={index}
                                    className={`ap-page-btn ${link.active ? 'active' : ''}`}
                                    onClick={() => {
                                        if (link.url) {
                                            const url = new URL(link.url, window.location.origin);
                                            const page = url.searchParams.get('page') || '1';
                                            handlePageChange(parseInt(page));
                                        }
                                    }}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
