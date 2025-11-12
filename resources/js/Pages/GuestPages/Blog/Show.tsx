import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string;
    category: string;
    author: string;
    published_at: string;
    view_count: number;
}

interface Props {
    post: BlogPost;
    relatedPosts: BlogPost[];
    categories: string[];
}

export default function BlogShow({ post, relatedPosts, categories }: Props) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const readingTime = Math.ceil(post.content.split(' ').length / 200);

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': post.title,
        'description': post.excerpt,
        'image': post.featured_image,
        'datePublished': post.published_at,
        'author': {
            '@type': 'Person',
            'name': post.author,
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'FamTree',
            'logo': {
                '@type': 'ImageObject',
                'url': 'https://famtree.com/logo.png',
            },
        },
    };

    return (
        <GuestLayout>
            <Head
                title={`${post.title} - FamTree Blog`}
                meta={[
                    {
                        name: 'description',
                        content: post.excerpt,
                    },
                    {
                        property: 'og:title',
                        content: post.title,
                    },
                    {
                        property: 'og:description',
                        content: post.excerpt,
                    },
                    {
                        property: 'og:image',
                        content: post.featured_image,
                    },
                    {
                        property: 'og:type',
                        content: 'article',
                    },
                    {
                        name: 'canonical',
                        content: `https://famtree.com/blog/${post.slug}`,
                    },
                ]}
            >
                <script type="application/ld+json">
                    {JSON.stringify(articleSchema)}
                </script>
            </Head>

            {/* Article Header */}
            <article className="blog-article">
                <div className="article-hero">
                    {post.featured_image && (
                        <img src={post.featured_image} alt={post.title} className="article-image" />
                    )}
                    <div className="article-hero-overlay"></div>
                    <div className="article-header-content">
                        <span className="article-category">{post.category}</span>
                        <h1 className="article-title">{post.title}</h1>
                        <div className="article-meta">
                            <span className="meta-author">By {post.author}</span>
                            <span className="meta-date">{formatDate(post.published_at)}</span>
                            <span className="meta-reading-time">{readingTime} min read</span>
                            <span className="meta-views">👁️ {post.view_count} views</span>
                        </div>
                    </div>
                </div>

                {/* Article Content */}
                <div className="article-content-wrapper">
                    <div className="article-body">
                        <div
                            className="article-content"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        ></div>

                        {/* Share Buttons */}
                        <div className="article-share">
                            <p className="share-label">Share this article:</p>
                            <div className="share-buttons">
                                <button className="share-btn twitter" title="Share on Twitter">
                                    𝕏
                                </button>
                                <button className="share-btn facebook" title="Share on Facebook">
                                    f
                                </button>
                                <button className="share-btn whatsapp" title="Share on WhatsApp">
                                    WhatsApp
                                </button>
                                <button className="share-btn copy" title="Copy link">
                                    Copy Link
                                </button>
                            </div>
                        </div>

                        {/* Author Card */}
                        <div className="author-card">
                            <div className="author-avatar">👤</div>
                            <div className="author-info">
                                <h3>{post.author}</h3>
                                <p>FamTree contributor passionate about family heritage and genealogy.</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="article-sidebar">
                        <div className="sidebar-box">
                            <h3>Related Articles</h3>
                            <div className="related-posts">
                                {relatedPosts.map((related) => (
                                    <Link
                                        key={related.id}
                                        href={`/blog/${related.slug}`}
                                        className="related-post"
                                    >
                                        <span className="related-title">{related.title}</span>
                                        <span className="related-category">{related.category}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="sidebar-box">
                            <h3>Categories</h3>
                            <div className="category-links">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat}
                                        href={`/blog?category=${cat}`}
                                        className="category-link"
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </article>

            {/* CTA Section */}
            <section className="article-cta">
                <div className="cta-content">
                    <h2>Discover Your Family's Story</h2>
                    <p>Start building your family tree today on FamTree.</p>
                    <button className="cta-button">Create Your Family Space →</button>
                </div>
            </section>

            <style>{`
                .blog-article {
                    background: white;
                }

                .article-hero {
                    position: relative;
                    height: 400px;
                    background: #f5f5f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .article-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .article-hero-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 31, 53, 0.3);
                }

                .article-header-content {
                    position: relative;
                    z-index: 2;
                    color: white;
                    text-align: center;
                    padding: 40px;
                    max-width: 800px;
                }

                .article-category {
                    display: inline-block;
                    background: #D4A574;
                    color: white;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 16px;
                }

                .article-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin: 0 0 20px 0;
                    line-height: 1.3;
                }

                .article-meta {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                    font-size: 0.95rem;
                    flex-wrap: wrap;
                }

                .article-content-wrapper {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 40px;
                    padding: 60px 40px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .article-body {
                    min-width: 0;
                }

                .article-content {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: #333;
                }

                .article-content h2 {
                    font-size: 1.8rem;
                    margin: 40px 0 20px;
                    color: #0F1F35;
                }

                .article-content h3 {
                    font-size: 1.4rem;
                    margin: 30px 0 15px;
                    color: #0F1F35;
                }

                .article-content p {
                    margin: 0 0 20px 0;
                }

                .article-content ul,
                .article-content ol {
                    margin: 20px 0;
                    padding-left: 30px;
                }

                .article-content li {
                    margin: 10px 0;
                }

                .article-share {
                    margin: 60px 0;
                    padding: 30px;
                    background: #f5f5f5;
                    border-radius: 12px;
                }

                .share-label {
                    margin: 0 0 15px;
                    font-weight: 600;
                    color: #333;
                }

                .share-buttons {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .share-btn {
                    padding: 10px 16px;
                    border: 1px solid #e0e0e0;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }

                .share-btn:hover {
                    background: #D4A574;
                    color: white;
                    border-color: #D4A574;
                }

                .author-card {
                    display: flex;
                    gap: 20px;
                    padding: 30px;
                    background: #f5f5f5;
                    border-radius: 12px;
                    margin: 60px 0;
                }

                .author-avatar {
                    font-size: 3rem;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 8px;
                }

                .author-info h3 {
                    margin: 0 0 8px;
                    font-size: 1.1rem;
                }

                .author-info p {
                    margin: 0;
                    color: #666;
                    font-size: 0.95rem;
                }

                .article-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .sidebar-box {
                    background: #f5f5f5;
                    padding: 24px;
                    border-radius: 12px;
                }

                .sidebar-box h3 {
                    margin: 0 0 16px;
                    font-size: 1.1rem;
                    color: #0F1F35;
                    border-bottom: 2px solid #D4A574;
                    padding-bottom: 12px;
                }

                .related-posts {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .related-post {
                    display: flex;
                    flex-direction: column;
                    padding: 12px;
                    background: white;
                    border-radius: 6px;
                    text-decoration: none;
                    color: #333;
                    transition: all 0.3s ease;
                }

                .related-post:hover {
                    background: #D4A574;
                    color: white;
                }

                .related-title {
                    font-weight: 600;
                    font-size: 0.95rem;
                    line-height: 1.3;
                }

                .related-category {
                    font-size: 0.8rem;
                    opacity: 0.7;
                    margin-top: 6px;
                }

                .category-links {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .category-link {
                    padding: 8px 12px;
                    background: white;
                    border-radius: 6px;
                    text-decoration: none;
                    color: #333;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    display: block;
                    text-align: center;
                    font-weight: 600;
                }

                .category-link:hover {
                    background: #D4A574;
                    color: white;
                }

                .article-cta {
                    padding: 60px 40px;
                    background: linear-gradient(135deg, #0F1F35 0%, #1a2f47 100%);
                    color: white;
                    text-align: center;
                }

                .cta-content {
                    max-width: 600px;
                    margin: 0 auto;
                }

                .cta-content h2 {
                    font-size: 2rem;
                    margin: 0 0 16px;
                }

                .cta-content p {
                    font-size: 1.1rem;
                    margin: 0 0 32px;
                    opacity: 0.9;
                }

                .cta-button {
                    padding: 16px 32px;
                    background: #D4A574;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .cta-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(212, 165, 116, 0.3);
                }

                @media (max-width: 768px) {
                    .article-title {
                        font-size: 1.8rem;
                    }

                    .article-content-wrapper {
                        grid-template-columns: 1fr;
                        padding: 30px 20px;
                    }

                    .article-meta {
                        gap: 12px;
                    }

                    .article-hero {
                        height: 250px;
                    }

                    .cta-content h2 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </GuestLayout>
    );
}
