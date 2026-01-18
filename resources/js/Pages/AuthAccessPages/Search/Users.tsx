import { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, Users, Zap, MapPin, Mail, UserPlus, CheckCircle, Clock } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
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
        const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
            connected: { label: 'Connected', icon: CheckCircle, className: 'search-status-badge connected' },
            pending: { label: 'Pending', icon: Clock, className: 'search-status-badge pending' },
            sent: { label: 'Requested', icon: Clock, className: 'search-status-badge sent' },
            none: { label: 'Add', icon: UserPlus, className: 'search-status-badge add' },
        };

        const config = statusConfig[status] || statusConfig.none;
        const IconComponent = config.icon;
        return (
            <span className={config.className}>
                <IconComponent size={14} />
                {config.label}
            </span>
        );
    };

    return (
        <AuthAccessLayout>
            <div className="search-container">
                {/* Premium Search Hero Header */}
                <div className="search-hero">
                    <div className="search-hero-content">
                        <div className="search-hero-badge">
                            <Zap size={16} className="badge-icon" />
                            <span>Discover your family network</span>
                        </div>
                        <h1 className="search-hero-title">Find & Connect</h1>
                        <p className="search-hero-subtitle">
                            Search for family members and grow your family tree connections
                        </p>
                    </div>

                    {/* Premium Search Bar */}
                    <form onSubmit={handleSearch} className="search-form-premium">
                        <div className="search-input-container">
                            <Search className="search-input-icon" size={20} />
                            <input
                                type="text"
                                className="search-input-premium"
                                placeholder="Search by name, username, or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoComplete="off"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="search-clear-btn-premium"
                                    onClick={handleClearSearch}
                                    title="Clear search"
                                    aria-label="Clear search"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Premium Tabs Navigation */}
                {!hasSearched ? (
                    <div className="search-tabs-default">
                        <button
                            className="search-tab-btn active"
                            onClick={() => setActiveTab('featured')}
                        >
                            <Zap size={18} className="tab-icon" />
                            <span>Featured Members</span>
                            <span className="tab-count">{featuredUsers.length}</span>
                        </button>
                        <button
                            className="search-tab-btn"
                            onClick={() => setActiveTab('suggested')}
                        >
                            <Users size={18} className="tab-icon" />
                            <span>Suggested for You</span>
                            <span className="tab-count">{suggestedUsers.length}</span>
                        </button>
                    </div>
                ) : (
                    <div className="search-tabs-active">
                        <button
                            className={`search-tab-active ${activeTab === 'search' ? 'active' : ''}`}
                            onClick={() => setActiveTab('search')}
                        >
                            <Search size={18} />
                            Results
                            <span className="result-count">{searchResults.length}</span>
                        </button>
                        <button
                            className={`search-tab-active ${activeTab === 'featured' ? 'active' : ''}`}
                            onClick={() => setActiveTab('featured')}
                        >
                            <Zap size={18} />
                            Featured
                        </button>
                        <button
                            className={`search-tab-active ${activeTab === 'suggested' ? 'active' : ''}`}
                            onClick={() => setActiveTab('suggested')}
                        >
                            <Users size={18} />
                            Suggested
                        </button>
                    </div>
                )}

                {/* Content Area */}
                <div className="search-content-premium">
                    {/* Search Results */}
                    {activeTab === 'search' && hasSearched && (
                        <div className="search-results-premium">
                            {isSearching ? (
                                <div className="search-loading-premium">
                                    <div className="premium-spinner"></div>
                                    <p className="loading-text">Searching...</p>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="search-empty-premium">
                                    <div className="empty-icon-wrapper">
                                        <Search size={64} />
                                    </div>
                                    <h3 className="empty-title">No results found</h3>
                                    <p className="empty-subtitle">Try searching with different keywords</p>
                                </div>
                            ) : (
                                <div className="search-results-grid-premium">
                                    {searchResults.map((user, index) => (
                                        <UserCard key={user.id} user={user} index={index} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Featured Users */}
                    {activeTab === 'featured' && (
                        <div className="featured-section-premium">
                            {featuredUsers.length === 0 ? (
                                <div className="section-empty-premium">
                                    <Users size={64} />
                                    <p className="empty-text">No featured users yet</p>
                                </div>
                            ) : (
                                <div className="featured-grid-premium">
                                    {featuredUsers.map((user, index) => (
                                        <FeaturedUserCard key={user.id} user={user} index={index} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Suggested Users */}
                    {activeTab === 'suggested' && (
                        <div className="suggested-section-premium">
                            {suggestedUsers.length === 0 ? (
                                <div className="section-empty-premium">
                                    <Users size={64} />
                                    <p className="empty-text">No suggestions yet</p>
                                    <p className="empty-subtext">Connect with more people to get personalized suggestions</p>
                                </div>
                            ) : (
                                <div className="suggested-list-premium">
                                    {suggestedUsers.map((user, index) => (
                                        <SuggestedUserCard key={user.id} user={user} index={index} />
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
function UserCard({ user, index }: { user: SearchUser; index: number }) {
    const handleConnect = () => {
        // Navigate to connection request page
        window.location.href = route('connections.create');
    };

    const handleViewProfile = () => {
        window.location.href = route('profile.view', { username: user.username });
    };

    return (
        <div className="user-card-premium" style={{ animationDelay: `${index * 0.05}s` }}>
            {/* Card Background Gradient */}
            <div className="user-card-premium-bg"></div>

            {/* Status Badge */}
            {user.mutual_connections > 0 && (
                <div className="user-card-premium-badge">
                    <Users size={14} className="badge-icon" />
                    <span>{user.mutual_connections}</span>
                </div>
            )}

            {/* Profile Image */}
            <div className="user-card-premium-image">
                {user.profile_image_url ? (
                    <img src={user.profile_image_url} alt={user.name} className="user-image" />
                ) : (
                    <div className="user-avatar-premium">{user.name.charAt(0).toUpperCase()}</div>
                )}
            </div>

            {/* Content */}
            <div className="user-card-premium-content">
                <h3 className="user-card-premium-name">{user.name}</h3>
                <p className="user-card-premium-username">@{user.username}</p>

                {user.bio && (
                    <p className="user-card-premium-bio">{user.bio}</p>
                )}

                {user.mutual_connections > 0 && (
                    <div className="user-card-premium-meta">
                        <i className="bi bi-people-fill"></i>
                        <span>{user.mutual_connections} mutual connection{user.mutual_connections > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="user-card-premium-actions">
                {user.connection_status === 'none' && (
                    <button
                        className="btn-premium btn-primary-premium"
                        onClick={handleConnect}
                        title="Send connection request"
                    >
                        <UserPlus size={16} />
                        <span>Connect</span>
                    </button>
                )}
                {user.connection_status === 'pending' && (
                    <button className="btn-premium btn-pending-premium" disabled title="Pending your response">
                        <Clock size={16} />
                        <span>Pending</span>
                    </button>
                )}
                {user.connection_status === 'sent' && (
                    <button className="btn-premium btn-sent-premium" disabled title="Request sent">
                        <Clock size={16} />
                        <span>Requested</span>
                    </button>
                )}
                {user.connection_status === 'connected' && (
                    <button
                        className="btn-premium btn-success-premium"
                        onClick={handleViewProfile}
                        title="View profile"
                    >
                        <CheckCircle size={16} />
                        <span>View Profile</span>
                    </button>
                )}
            </div>
        </div>
    );
}

// Featured User Card Component
function FeaturedUserCard({ user, index }: { user: FeaturedUser; index: number }) {
    const handleConnect = () => {
        window.location.href = route('connections.create');
    };

    return (
        <div className="featured-card-premium" style={{ animationDelay: `${index * 0.1}s` }}>
            {/* Featured Badge */}
            <div className="featured-card-premium-badge">
                <Zap size={16} className="badge-zap" />
            </div>

            {/* Image Container */}
            <div className="featured-card-premium-image-wrapper">
                {user.profile_image_url ? (
                    <img src={user.profile_image_url} alt={user.name} className="featured-image" />
                ) : (
                    <div className="featured-avatar-premium">{user.name.charAt(0).toUpperCase()}</div>
                )}
            </div>

            {/* Content */}
            <div className="featured-card-premium-body">
                <h4 className="featured-card-premium-name">{user.name}</h4>
                <p className="featured-card-premium-username">@{user.username}</p>

                {user.bio && (
                    <p className="featured-card-premium-bio">{user.bio}</p>
                )}

                {/* Stats */}
                <div className="featured-card-premium-stats">
                    <div className="stat-item">
                        <i className="bi bi-diagram-3"></i>
                        <span className="stat-value">{user.total_connections}</span>
                        <span className="stat-label">connections</span>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    className="btn-premium btn-primary-premium btn-featured"
                    onClick={handleConnect}
                    title="Send connection request"
                >
                    <UserPlus size={16} />
                    <span>Connect</span>
                </button>
            </div>
        </div>
    );
}

// Suggested User Card Component
function SuggestedUserCard({ user, index }: { user: SuggestedUser; index: number }) {
    const handleConnect = () => {
        window.location.href = route('connections.create');
    };

    const handleViewProfile = () => {
        window.location.href = route('profile.view', { username: user.username });
    };

    return (
        <div className="suggested-card-premium" style={{ animationDelay: `${index * 0.08}s` }}>
            {/* Left Side - Image and Basic Info */}
            <div className="suggested-card-premium-left">
                <div className="suggested-card-premium-image">
                    {user.profile_image_url ? (
                        <img src={user.profile_image_url} alt={user.name} className="suggested-image" />
                    ) : (
                        <div className="suggested-avatar-premium">{user.name.charAt(0).toUpperCase()}</div>
                    )}
                </div>

                <div className="suggested-card-premium-info">
                    <h4 className="suggested-card-premium-name">{user.name}</h4>
                    <p className="suggested-card-premium-username">@{user.username}</p>
                </div>
            </div>

            {/* Middle - Bio and Reason */}
            <div className="suggested-card-premium-middle">
                {user.bio && (
                    <p className="suggested-card-premium-bio">{user.bio}</p>
                )}

                <div className="suggested-card-premium-reason">
                    <i className="bi bi-info-circle"></i>
                    <span>{user.reason}</span>
                </div>
            </div>

            {/* Right Side - Actions */}
            <div className="suggested-card-premium-actions">
                {user.connection_status === 'none' && (
                    <button
                        className="btn-premium btn-primary-premium btn-compact"
                        onClick={handleConnect}
                        title="Send connection request"
                    >
                        <UserPlus size={16} />
                        <span>Add</span>
                    </button>
                )}
                {user.connection_status === 'pending' && (
                    <button className="btn-premium btn-pending-premium btn-compact" disabled>
                        <Clock size={16} />
                        <span>Pending</span>
                    </button>
                )}
                {user.connection_status === 'sent' && (
                    <button className="btn-premium btn-sent-premium btn-compact" disabled>
                        <Clock size={16} />
                        <span>Sent</span>
                    </button>
                )}
                {user.connection_status === 'connected' && (
                    <button
                        className="btn-premium btn-success-premium btn-compact"
                        onClick={handleViewProfile}
                        title="View profile"
                    >
                        <CheckCircle size={16} />
                        <span>View</span>
                    </button>
                )}
            </div>
        </div>
    );
}
