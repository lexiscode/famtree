import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Users, UserPlus, Search, Filter, ArrowLeft, Loader } from 'lucide-react';
import SuggestedMemberCard from '@/Components/Connections/SuggestedMemberCard';
import ProfileSidebar from '../Stories/ProfileSidebar';

interface Profile {
    id: number;
    name: string;
    username: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    bio: string | null;
    date_of_birth: string | null;
    profile_image_url: string | null;
    status: string;
    job_title: string | null;
    education: string | null;
    created_at: string;
}

interface InferredRelationship {
    type: string;
    label: string;
    text: string;
    confidence: number;
    path_length: number;
}

interface SuggestedMember {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_image_url: string | null;
    email: string | null;
    phone: string | null;
    bio: string | null;
    gender: string | null;
    inferred_relationship: InferredRelationship;
}

interface RelationshipType {
    type: string;
    label: string;
}

interface Spouse {
    id: number;
    name: string;
    profile_image_url: string | null;
}

interface Props {
    user: Profile;
    initial_suggestions: SuggestedMember[];
    total_suggestions: number;
    available_relationship_types: RelationshipType[];
    spouses: Spouse[];
    initial_page: number;
    per_page: number;
    connectionCount: number;
    pendingRequestCount: number;
    sentRequestCount: number;
}

export default function SuggestedMembers({
    user,
    initial_suggestions,
    total_suggestions,
    available_relationship_types,
    spouses,
    initial_page,
    per_page,
    connectionCount,
    pendingRequestCount,
    sentRequestCount,
}: Props) {
    const [suggestions, setSuggestions] = useState<SuggestedMember[]>(initial_suggestions);
    const [allSuggestions, setAllSuggestions] = useState<SuggestedMember[]>(initial_suggestions);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [currentPage, setCurrentPage] = useState(initial_page);
    const [totalSuggestions, setTotalSuggestions] = useState(total_suggestions);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(Math.ceil(total_suggestions / per_page));
    const [relationshipTypes, setRelationshipTypes] = useState(available_relationship_types);

    // Load more suggestions
    const loadMore = async (page: number = currentPage + 1) => {
        setLoading(true);
        try {
            const response = await fetch(route('suggested-connections.list'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    page,
                    per_page,
                    relationship_type: filterType || null,
                    search: searchQuery || null,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAllSuggestions((prev) => [...prev, ...data.data]);
                    setSuggestions((prev) => [...prev, ...data.data]);
                    setCurrentPage(page);
                    setTotalPages(data.pagination.last_page);
                }
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle search
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
        setLoading(true);

        try {
            const response = await fetch(route('suggested-connections.list'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    page: 1,
                    per_page,
                    relationship_type: filterType || null,
                    search: query || null,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSuggestions(data.data);
                    setAllSuggestions(data.data);
                    setTotalPages(data.pagination.last_page);
                    setTotalSuggestions(data.pagination.total);
                }
            }
        } catch (error) {
            console.error('Error searching suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle filter
    const handleFilter = async (type: string) => {
        setFilterType(type);
        setCurrentPage(1);
        setLoading(true);

        try {
            const response = await fetch(route('suggested-connections.list'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    page: 1,
                    per_page,
                    relationship_type: type || null,
                    search: searchQuery || null,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSuggestions(data.data);
                    setAllSuggestions(data.data);
                    setTotalPages(data.pagination.last_page);
                    setTotalSuggestions(data.pagination.total);
                }
            }
        } catch (error) {
            console.error('Error filtering suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle connection request from card
    const handleConnectionRequested = (userId: number) => {
        // Remove the suggestion from the list
        setSuggestions((prev) => prev.filter((s) => s.id !== userId));
        setAllSuggestions((prev) => prev.filter((s) => s.id !== userId));
        setTotalSuggestions((prev) => Math.max(0, prev - 1));
    };

    const filteredSuggestions = suggestions.filter((suggestion) => {
        const matchesSearch =
            suggestion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            suggestion.username.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = !filterType || suggestion.inferred_relationship.type === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <AuthAccessLayout>
            <div className="suggested-members-page">
                <div className="suggested-members-grid-layout">
                    {/* Left Sidebar - Profile */}
                    {user && (
                        <div className="suggested-members-left-sidebar">
                            <ProfileSidebar
                                user={user}
                                connectionCount={connectionCount}
                                pendingRequestCount={pendingRequestCount}
                                sentRequestCount={sentRequestCount}
                                unreadNotificationCount={0}
                            />
                        </div>
                    )}

                    {/* Center Content */}
                    <div className="suggested-members-center-content">
                        <div className="suggested-members-container">
                            {/* Header Section */}
                            <div className="suggested-members-header">
                                <div className="suggested-members-header-top">
                                    <div>
                                        <h1 className="suggested-members-title">Suggested Family Members</h1>
                                        <p className="suggested-members-subtitle">
                                            Found <strong>{totalSuggestions}</strong> suggested connection
                                            {totalSuggestions !== 1 ? 's' : ''} based on your connections
                                        </p>
                                    </div>
                                </div>

                                {/* Search and Filter */}
                                <div className="suggested-members-filters">
                                    <div className="suggested-members-search-wrapper">
                                        <Search size={18} className="suggested-members-input-icon" />
                                        <input
                                            type="text"
                                            className="suggested-members-search-input"
                                            placeholder="Search by name or username..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="suggested-members-filter-wrapper">
                                        <Filter size={18} className="suggested-members-input-icon" />
                                        <select
                                            className="suggested-members-filter-select"
                                            value={filterType}
                                            onChange={(e) => handleFilter(e.target.value)}
                                        >
                                            <option value="">All Relationship Types</option>
                                            {relationshipTypes.map((type) => (
                                                <option key={type.type} value={type.type}>
                                                    {type.label}s
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Suggestions Grid */}
                            {filteredSuggestions.length === 0 ? (
                                <div className="suggested-members-empty-state">
                                    <Users size={56} className="suggested-members-empty-icon" />
                                    <h3 className="suggested-members-empty-title">
                                        {totalSuggestions === 0
                                            ? 'No Suggested Members'
                                            : 'No Results Found'}
                                    </h3>
                                    <p className="suggested-members-empty-text">
                                        {totalSuggestions === 0
                                            ? "You don't have any suggested family members yet. Connect with more people to see suggestions."
                                            : 'Try adjusting your search or filter criteria.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="suggested-members-grid">
                                        {filteredSuggestions.map((suggestion) => (
                                            <SuggestedMemberCard
                                                key={suggestion.id}
                                                suggestion={suggestion}
                                                spouses={spouses}
                                                onConnectionRequested={handleConnectionRequested}
                                            />
                                        ))}
                                    </div>

                                    {/* Load More Button */}
                                    {currentPage < totalPages && (
                                        <div className="suggested-members-load-more">
                                            <button
                                                className="suggested-members-btn-load-more"
                                                onClick={() => loadMore()}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader
                                                            size={18}
                                                            className="spinner"
                                                            style={{ display: 'inline' }}
                                                        />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus size={18} style={{ display: 'inline' }} />
                                                        Load More Suggestions
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Back to Profile Button */}
                            <button
                                className="suggested-members-btn-back"
                                onClick={() => router.visit(route('profile'))}
                                title="Back to profile"
                            >
                                <ArrowLeft size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Back to Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthAccessLayout>
    );
}
