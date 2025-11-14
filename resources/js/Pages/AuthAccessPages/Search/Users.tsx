import { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, Users, Zap, MapPin, Mail } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';

interface SearchUser {
    id: number;
    name: string;
    username: string;
    email: string;
    profile_image_url?: string;
    bio: string;
    mutual_connections: number;
    connection_status: 'connected' | 'pending' | 'sent' | 'none';
}

interface FeaturedUser {
    id: number;
    name: string;
    username: string;
    profile_image_url?: string;
    bio: string;
    total_connections: number;
}

interface SuggestedUser {
    id: number;
    name: string;
    username: string;
    profile_image_url?: string;
    bio: string;
    connection_status: 'connected' | 'pending' | 'sent' | 'none';
    reason: string;
}

export default function Users() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [featuredUsers, setFeaturedUsers] = useState<FeaturedUser[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [activeTab, setActiveTab] = useState<'featured' | 'suggested' | 'search'>('featured');

    // Fetch featured users on mount
    useEffect(() => {
        fetchFeaturedUsers();
        fetchSuggestedUsers();
    }, []);

    const fetchFeaturedUsers = useCallback(async () => {
        try {
            const response = await fetch(route('search.featured'), {
                headers: {
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();
            if (data.success) {
                setFeaturedUsers(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch featured users:', error);
        }
    }, []);

    const fetchSuggestedUsers = useCallback(async () => {
        try {
            const response = await fetch(route('search.suggested'), {
                headers: {
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();
            if (data.success) {
                setSuggestedUsers(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch suggested users:', error);
        }
    }, []);

    const performSearch = useCallback(async (query: string) => {
        if (query.trim().length === 0) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        try {
            const response = await fetch(
                route('search.users') + `?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            );

            const data = await response.json();
            if (data.success) {
                setSearchResults(data.data || []);
                setActiveTab('search');
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            performSearch(searchQuery);
        },
        [searchQuery, performSearch]
    );

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
        setActiveTab('featured');
    }, []);

    const getConnectionStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            connected: { label: 'Connected', className: 'search-status-badge connected' },
            pending: { label: 'Pending', className: 'search-status-badge pending' },
            sent: { label: 'Requested', className: 'search-status-badge sent' },
            none: { label: 'Add', className: 'search-status-badge add' },
        };

        const config = statusConfig[status] || statusConfig.none;
        return <span className={config.className}>{config.label}</span>;
    };

    return (
        <AuthAccessLayout>
            <div className="search-container">
                {/* Search Header */}
                <div className="search-header">
                    <div className="search-header-content">
                        <h1 className="search-title">Discover & Connect</h1>
                        <p className="search-subtitle">Find and connect with family members</p>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by name, username, or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoComplete="off"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="search-clear-btn"
                                    onClick={handleClearSearch}
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tabs Navigation */}
                {hasSearched && (
                    <div className="search-tabs">
                        <button
                            className={`search-tab ${activeTab === 'search' ? 'active' : ''}`}
                            onClick={() => setActiveTab('search')}
                        >
                            <Search size={18} />
                            <span>Search Results ({searchResults.length})</span>
                        </button>
                        <button
                            className={`search-tab ${activeTab === 'featured' ? 'active' : ''}`}
                            onClick={() => setActiveTab('featured')}
                        >
                            <Zap size={18} />
                            <span>Featured</span>
                        </button>
                        <button
                            className={`search-tab ${activeTab === 'suggested' ? 'active' : ''}`}
                            onClick={() => setActiveTab('suggested')}
                        >
                            <Users size={18} />
                            <span>Suggested</span>
                        </button>
                    </div>
                )}

                {/* Content Area */}
                <div className="search-content">
                    {/* Search Results */}
                    {activeTab === 'search' && hasSearched && (
                        <div className="search-results">
                            {isSearching ? (
                                <div className="search-loading">
                                    <div className="search-spinner"></div>
                                    <p>Searching...</p>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="search-empty">
                                    <Search size={48} />
                                    <h3>No results found</h3>
                                    <p>Try searching with different keywords</p>
                                </div>
                            ) : (
                                <div className="search-results-grid">
                                    {searchResults.map((user) => (
                                        <UserCard key={user.id} user={user} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Featured Users */}
                    {activeTab === 'featured' && (
                        <div className="featured-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    <Zap size={24} />
                                    Featured Members
                                </h2>
                                <p className="section-subtitle">Most connected family members</p>
                            </div>

                            {featuredUsers.length === 0 ? (
                                <div className="section-empty">
                                    <Users size={48} />
                                    <p>No featured users yet</p>
                                </div>
                            ) : (
                                <div className="users-grid">
                                    {featuredUsers.map((user) => (
                                        <FeaturedUserCard key={user.id} user={user} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Suggested Users */}
                    {activeTab === 'suggested' && (
                        <div className="suggested-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    <Users size={24} />
                                    Suggested for You
                                </h2>
                                <p className="section-subtitle">People you might know</p>
                            </div>

                            {suggestedUsers.length === 0 ? (
                                <div className="section-empty">
                                    <Users size={48} />
                                    <p>No suggestions yet. Connect with more people!</p>
                                </div>
                            ) : (
                                <div className="suggested-list">
                                    {suggestedUsers.map((user) => (
                                        <SuggestedUserCard key={user.id} user={user} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}

// User Card Component for Search Results
function UserCard({ user }: { user: SearchUser }) {
    const handleConnect = () => {
        // Navigate to connection request page
        window.location.href = route('connections.create');
    };

    return (
        <div className="user-card search-user-card">
            <div className="user-card-image">
                {user.profile_image_url ? (
                    <img src={user.profile_image_url} alt={user.name} />
                ) : (
                    <div className="user-card-avatar">{user.name.charAt(0)}</div>
                )}
            </div>

            <div className="user-card-content">
                <h3 className="user-card-name">{user.name}</h3>
                <p className="user-card-username">@{user.username}</p>

                {user.bio && <p className="user-card-bio">{user.bio}</p>}

                <div className="user-card-meta">
                    {user.mutual_connections > 0 && (
                        <span className="user-meta-item">
                            <Users size={14} />
                            {user.mutual_connections} mutual
                        </span>
                    )}
                </div>
            </div>

            <div className="user-card-actions">
                {getConnectionStatusBadge(user.connection_status)}
                {user.connection_status === 'none' && (
                    <button className="user-card-btn primary" onClick={handleConnect}>
                        Connect
                    </button>
                )}
                {user.connection_status === 'pending' && (
                    <button className="user-card-btn" disabled>
                        Pending
                    </button>
                )}
                {user.connection_status === 'sent' && (
                    <button className="user-card-btn" disabled>
                        Requested
                    </button>
                )}
                {user.connection_status === 'connected' && (
                    <button className="user-card-btn success">View Profile</button>
                )}
            </div>
        </div>
    );
}

// Featured User Card Component
function FeaturedUserCard({ user }: { user: FeaturedUser }) {
    return (
        <div className="featured-card">
            <div className="featured-card-image">
                {user.profile_image_url ? (
                    <img src={user.profile_image_url} alt={user.name} />
                ) : (
                    <div className="featured-card-avatar">{user.name.charAt(0)}</div>
                )}
                <div className="featured-badge">
                    <Zap size={16} />
                </div>
            </div>

            <div className="featured-card-content">
                <h4 className="featured-card-name">{user.name}</h4>
                <p className="featured-card-username">@{user.username}</p>

                {user.bio && <p className="featured-card-bio">{user.bio}</p>}

                <div className="featured-card-stats">
                    <span className="stat">
                        <Users size={16} />
                        {user.total_connections} connections
                    </span>
                </div>

                <button className="featured-card-btn">
                    Connect
                </button>
            </div>
        </div>
    );
}

// Suggested User Card Component
function SuggestedUserCard({ user }: { user: SuggestedUser }) {
    return (
        <div className="suggested-card">
            <div className="suggested-card-header">
                <div className="suggested-card-image">
                    {user.profile_image_url ? (
                        <img src={user.profile_image_url} alt={user.name} />
                    ) : (
                        <div className="suggested-card-avatar">{user.name.charAt(0)}</div>
                    )}
                </div>

                <div className="suggested-card-info">
                    <h4 className="suggested-card-name">{user.name}</h4>
                    <p className="suggested-card-username">@{user.username}</p>
                </div>
            </div>

            {user.bio && <p className="suggested-card-bio">{user.bio}</p>}

            <p className="suggested-card-reason">{user.reason}</p>

            <div className="suggested-card-actions">
                {getConnectionStatusBadge(user.connection_status)}
                {user.connection_status === 'none' && (
                    <button className="suggested-card-btn primary">
                        Add Connection
                    </button>
                )}
                {user.connection_status === 'connected' && (
                    <button className="suggested-card-btn success">Connected</button>
                )}
            </div>
        </div>
    );
}
