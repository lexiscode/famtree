import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import FamilyCard from './components/FamilyCard';
import './FamilyExplorer.css';

interface Family {
    id: number;
    name: string;
    state: string;
    lga: string;
    founder: string;
    member_count: number;
    cover_image: string;
    slug: string;
}

interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
}

interface PaginatedFamilies {
    data: Family[];
    meta: PaginationMeta;
    links: any;
}

interface Props {
    families: PaginatedFamilies;
    states: string[];
    filters: {
        search: string | null;
        state: string | null;
        sort: string;
    };
}

export default function FamilyExplorer({ families: paginatedFamilies, states, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedState, setSelectedState] = useState(filters.state || '');
    const [sortBy, setSortBy] = useState(filters.sort || 'name');

    const families = paginatedFamilies?.data || [];
    const pagination = paginatedFamilies?.meta || {
        current_page: 1,
        per_page: 12,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        router.get('/families', {
            search: query,
            state: selectedState,
            sort: sortBy,
            page: 1,
        });
    };

    const handleFilter = (state: string, tribe: string, sort: string) => {
        setSelectedState(state);
        setSortBy(sort);
        router.get('/families', {
            search: searchQuery,
            state: state,
            sort: sort,
            page: 1,
        });
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedState('');
        setSortBy('name');
        router.get('/families');
    };

    const handlePageChange = (page: number) => {
        router.get('/families', {
            search: searchQuery,
            state: selectedState,
            sort: sortBy,
            page: page,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const hasFilters = searchQuery || selectedState || sortBy !== 'name';

    return (
        <GuestLayout>
            <Head
                title="Explore Nigerian Families - FamTree Family Directory"
                meta={[
                    {
                        name: 'description',
                        content: 'Explore thousands of Nigerian families preserving their heritage on FamTree. Search by state, tribe, and discover public family trees. Connect with families celebrating their roots.',
                    },
                    {
                        name: 'keywords',
                        content: 'Nigerian families, family directory, family tree explorer, heritage, genealogy, family connections',
                    },
                    {
                        property: 'og:title',
                        content: 'Explore Nigerian Families - FamTree',
                    },
                    {
                        property: 'og:description',
                        content: 'Connect with thousands of families preserving their heritage and celebrating their roots on FamTree.',
                    },
                    {
                        property: 'og:type',
                        content: 'website',
                    },
                    {
                        property: 'og:url',
                        content: 'https://famtree.com/families',
                    },
                    {
                        property: 'twitter:card',
                        content: 'summary_large_image',
                    },
                    {
                        property: 'twitter:title',
                        content: 'Explore Nigerian Families - FamTree',
                    },
                    {
                        property: 'twitter:description',
                        content: 'Connect with families preserving their heritage.',
                    },
                ]}
            />

            {/* Premium Hero Section */}
            <section className="explorer-premium-hero">
                <div className="hero-gradient-bg"></div>
                <div className="hero-content">
                    <div className="hero-badge">Family Directory</div>
                    <h1 className="hero-title">Discover Nigerian Families</h1>
                    <p className="hero-description">
                        Connect with thousands of families preserving their heritage and celebrating their roots.
                        Find your family, share stories, and build lasting connections.
                    </p>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="stat-num">{pagination.total}+</div>
                            <div className="stat-txt">Families</div>
                        </div>
                        <div className="hero-stat">
                            <div className="stat-num">{states.length}</div>
                            <div className="stat-txt">States Covered</div>
                        </div>
                        <div className="hero-stat">
                            <div className="stat-num">🌍</div>
                            <div className="stat-txt">Nationwide</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search & Filter Section */}
            <section className="explorer-search-section">
                <div className="search-container">
                    <div className="search-header">
                        <h2>Find Your Family</h2>
                        <p>Use search and filters to discover families near you</p>
                    </div>
                    <SearchBar onSearch={handleSearch} value={searchQuery} />
                    <FilterPanel
                        states={states}
                        tribes={[]}
                        selectedState={selectedState}
                        selectedTribe=""
                        sortBy={sortBy}
                        onFilter={handleFilter}
                        onClear={handleClearFilters}
                        hasFilters={hasFilters}
                    />
                </div>
            </section>

            {/* Results Section */}
            <section className="explorer-results-section">
                <div className="results-container">
                    {/* Results Header */}
                    <div className="results-header">
                        <div>
                            <p className="results-count">
                                {families.length === 0
                                    ? '❌ No families found'
                                    : `✓ Showing ${families.length} of ${pagination.total} families`}
                            </p>
                            {hasFilters && (
                                <button className="clear-btn" onClick={handleClearFilters}>
                                    ✕ Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {families.length > 0 ? (
                        <>
                            {/* Family Grid */}
                            <div className="premium-family-grid">
                                {families.map((family) => (
                                    <FamilyCard key={family.id} family={family} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <div className="premium-pagination">
                                    <button
                                        className="pag-btn prev"
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                        disabled={pagination.current_page === 1}
                                    >
                                        ← Previous
                                    </button>

                                    <div className="pag-pages">
                                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(
                                            (page) => (
                                                <button
                                                    key={page}
                                                    className={`pag-page ${page === pagination.current_page ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(page)}
                                                    title={`Go to page ${page}`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        )}
                                    </div>

                                    <button
                                        className="pag-btn next"
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                        disabled={pagination.current_page === pagination.last_page}
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state-premium">
                            <div className="empty-icon">🔍</div>
                            <h3>No Families Found</h3>
                            <p>We couldn't find families matching your search criteria. Try adjusting your filters.</p>
                            {hasFilters && (
                                <button className="empty-cta-btn" onClick={handleClearFilters}>
                                    Clear Filters & Browse All
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Premium CTA Section */}
            <section className="explorer-premium-cta">
                <div className="cta-content">
                    <div className="cta-text">
                        <h2>Don't See Your Family?</h2>
                        <p>
                            Join FamTree and create your family space. Build your digital family tree, preserve your
                            heritage, and connect with family members worldwide.
                        </p>
                    </div>
                    <button className="cta-button-large">
                        <span>Create Your Family Space</span>
                        <span className="arrow">→</span>
                    </button>
                </div>
            </section>
        </GuestLayout>
    );
}
