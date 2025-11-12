import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import './Blog.css';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string;
    category: string;
    author: string;
    published_at: string;
    view_count: number;
}

interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
}

interface PaginatedPosts {
    data: BlogPost[];
    meta: PaginationMeta;
    links: any;
}

interface Props {
    posts: PaginatedPosts;
    categories: string[];
    recentPosts: BlogPost[];
    popularPosts: BlogPost[];
    filters: {
        search: string | null;
        category: string | null;
        sort: string;
    };
}

export default function BlogIndex({ posts: paginatedPosts, categories, recentPosts, popularPosts, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'All');
    const [sortBy, setSortBy] = useState(filters.sort || 'latest');

    const posts = paginatedPosts?.data || [];
    const pagination = paginatedPosts?.meta || {
        current_page: 1,
        per_page: 12,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        router.get('/blog', {
            search: query,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            sort: sortBy,
            page: 1,
        });
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        router.get('/blog', {
            search: searchQuery,
            category: category !== 'All' ? category : undefined,
            sort: sortBy,
            page: 1,
        });
    };

    const handleSortChange = (sort: string) => {
        setSortBy(sort);
        router.get('/blog', {
            search: searchQuery,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            sort: sort,
            page: 1,
        });
    };

    const handlePageChange = (page: number) => {
        router.get('/blog', {
            search: searchQuery,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            sort: sortBy,
            page: page,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const hasFilters = searchQuery || selectedCategory !== 'All' || sortBy !== 'latest';

    return (
        <GuestLayout>
            <Head
                title="FamTree Blog - Family Heritage Stories & Tips"
                meta={[
                    {
                        name: 'description',
                        content: 'Read inspiring family heritage stories and genealogy tips on FamTree Blog.',
                    },
                ]}
            />

            {/* Premium Hero Section */}
            <section className="blog-premium-hero">
                <div className="hero-gradient-bg"></div>
                <div className="hero-content">
                    <div className="hero-badge">Family Heritage Blog</div>
                    <h1 className="hero-title">Stories, Tips & Cultural Insights</h1>
                    <p className="hero-description">
                        Explore inspiring family stories and practical genealogy tips on FamTree.
                    </p>
                </div>
            </section>

            {/* Search & Filter Section */}
            <section className="blog-search-section">
                <div className="search-container">
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button onClick={() => handleSearch('')} className="search-clear">
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="filters-wrapper">
                        <div className="filter-group">
                            <label>Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="filter-select"
                            >
                                <option value="All">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="filter-select"
                            >
                                <option value="latest">Latest</option>
                                <option value="popular">Most Popular</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </div>

                        {hasFilters && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('All');
                                    setSortBy('latest');
                                    router.get('/blog');
                                }}
                                className="clear-filters-btn"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="blog-results-section">
                <div className="results-container">
                    <div className="results-header">
                        <p className="results-count">
                            {posts.length === 0 ? '❌ No articles found' : `✓ Showing ${posts.length} of ${pagination.total} articles`}
                        </p>
                    </div>

                    {posts.length > 0 ? (
                        <>
                            <div className="premium-blog-grid">
                                {posts.map((post) => (
                                    <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card-link">
                                        <div className="blog-card">
                                            <div className="blog-image">
                                                {post.featured_image ? (
                                                    <img src={post.featured_image} alt={post.title} />
                                                ) : (
                                                    <div className="image-placeholder"></div>
                                                )}
                                            </div>
                                            <div className="blog-content">
                                                <span className="blog-category">{post.category}</span>
                                                <h3 className="blog-title">{post.title}</h3>
                                                <p className="blog-excerpt">{post.excerpt}</p>
                                                <div className="blog-meta">
                                                    <span className="meta-author">{post.author}</span>
                                                    <span className="meta-views">👁️ {post.view_count}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

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
                                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                className={`pag-page ${page === pagination.current_page ? 'active' : ''}`}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        ))}
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
                            <div className="empty-icon">📝</div>
                            <h3>No Articles Found</h3>
                            <p>Try adjusting your filters.</p>
                        </div>
                    )}
                </div>

                <aside className="blog-sidebar">
                    <div className="sidebar-widget">
                        <h3 className="widget-title">Recent Articles</h3>
                        <div className="sidebar-links">
                            {recentPosts.map((post) => (
                                <Link key={post.id} href={`/blog/${post.slug}`} className="sidebar-link">
                                    {post.title}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-widget">
                        <h3 className="widget-title">Popular</h3>
                        <div className="sidebar-links">
                            {popularPosts.map((post) => (
                                <Link key={post.id} href={`/blog/${post.slug}`} className="sidebar-link">
                                    {post.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
            </section>

            <section className="blog-premium-cta">
                <div className="cta-content">
                    <h2>Have a Family Story to Share?</h2>
                    <p>Join FamTree and document your family's unique heritage.</p>
                    <button className="cta-button-large">
                        <span>Create Your Family Space →</span>
                    </button>
                </div>
            </section>
        </GuestLayout>
    );
}
