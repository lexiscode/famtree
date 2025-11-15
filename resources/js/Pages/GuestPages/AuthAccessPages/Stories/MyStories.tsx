import { useState, useCallback, useMemo } from 'react';
import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Plus, Search, Filter, MessageCircle, Heart, Share2, Trash2, Mic, Type, Clock } from 'lucide-react';
import CreatePostModal from './CreatePostModal';
import PostCard from './PostCard';

interface Image {
    id: number;
    url: string;
    order: number;
}

interface User {
    id: number;
    name: string;
    username: string;
    profile_image_url: string;
}

interface Post {
    id: number;
    type: 'text' | 'voice';
    title: string;
    content: string | null;
    voice_url: string | null;
    voice_duration: number | null;
    views_count: number;
    comments_count: number;
    reactions_count: number;
    images: Image[];
    user: User;
    created_at: string;
    created_at_human: string;
}

interface Props {
    posts: Post[];
    postCount: number;
}

export default function MyStories({ posts: initialPosts, postCount }: Props) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'text' | 'voice'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Filter and search posts
    const filteredPosts = useMemo(() => {
        let filtered = posts;

        // Apply type filter
        if (filter !== 'all') {
            filtered = filtered.filter(post => post.type === filter);
        }

        // Apply search
        if (searchQuery.trim()) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
            );
        }

        return filtered;
    }, [posts, filter, searchQuery]);

    // Handle post creation
    const handlePostCreated = useCallback(async () => {
        setShowCreateModal(false);
        setIsLoading(true);
        try {
            // Refresh posts
            const response = await fetch(route('stories.index'));
            const data = await response.json();
            setPosts(data.posts);
        } catch (error) {
            console.error('Error refreshing posts:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle post deletion
    const handlePostDeleted = useCallback((postId: number) => {
        setPosts(posts.filter(post => post.id !== postId));
    }, [posts]);

    // Handle search
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        if (query.trim().length < 2) return;

        try {
            const response = await fetch(`${route('stories.search')}?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setPosts(data.posts);
        } catch (error) {
            console.error('Error searching posts:', error);
        }
    }, []);

    // Handle filter change
    const handleFilterChange = useCallback((newFilter: 'all' | 'text' | 'voice') => {
        setFilter(newFilter);
        setSearchQuery('');

        if (newFilter === 'all') {
            setPosts(initialPosts);
        } else {
            fetch(`${route('stories.filter')}?type=${newFilter}`)
                .then(res => res.json())
                .then(data => setPosts(data.posts))
                .catch(error => console.error('Error filtering posts:', error));
        }
    }, [initialPosts]);

    return (
        <AuthAccessLayout>
            <div className="stories-page">
                <div className="stories-container">
                    {/* Header */}
                    <div className="stories-header">
                        <div className="stories-title-section">
                            <Type size={32} className="stories-title-icon" />
                            <div>
                                <h1 className="stories-title">My Stories</h1>
                                <p className="stories-subtitle">Share your thoughts and moments with your family</p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="stories-controls">
                        {/* Search */}
                        <div className="stories-search">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search your posts..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        {/* Filters */}
                        <div className="stories-filters">
                            <button
                                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => handleFilterChange('all')}
                            >
                                <Filter size={16} />
                                All ({posts.length})
                            </button>
                            <button
                                className={`filter-btn ${filter === 'text' ? 'active' : ''}`}
                                onClick={() => handleFilterChange('text')}
                            >
                                <Type size={16} />
                                Text Posts
                            </button>
                            <button
                                className={`filter-btn ${filter === 'voice' ? 'active' : ''}`}
                                onClick={() => handleFilterChange('voice')}
                            >
                                <Mic size={16} />
                                Voice Posts
                            </button>
                        </div>
                    </div>

                    {/* Posts List */}
                    <div className="stories-list">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onPostDeleted={handlePostDeleted}
                                />
                            ))
                        ) : (
                            <div className="stories-empty">
                                <div className="empty-icon">
                                    {filter === 'voice' ? <Mic size={48} /> : <Type size={48} />}
                                </div>
                                <h3 className="empty-title">
                                    {searchQuery.trim()
                                        ? 'No posts found'
                                        : filter === 'voice'
                                            ? 'No voice posts yet'
                                            : filter === 'text'
                                                ? 'No text posts yet'
                                                : 'Start sharing your stories'}
                                </h3>
                                <p className="empty-message">
                                    {searchQuery.trim()
                                        ? 'Try adjusting your search query'
                                        : filter === 'voice'
                                            ? 'Create your first voice post to get started'
                                            : filter === 'text'
                                                ? 'Create your first text post to get started'
                                                : 'Click the + button below to create your first story'}
                                </p>
                                {searchQuery && (
                                    <button
                                        className="clear-search-btn"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setPosts(initialPosts);
                                        }}
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Action Button */}
                <button
                    className="fab-btn"
                    onClick={() => setShowCreateModal(true)}
                    title="Create new post"
                >
                    <Plus size={24} />
                </button>

                {/* Create Post Modal */}
                {showCreateModal && (
                    <CreatePostModal
                        onClose={() => setShowCreateModal(false)}
                        onPostCreated={handlePostCreated}
                    />
                )}
            </div>
        </AuthAccessLayout>
    );
}
