import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Contact() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => {
                setSubmitted(true);
                reset();
                setTimeout(() => setSubmitted(false), 5000);
            },
        });
    };

    const localBusinessSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': 'FamTree',
        'description': 'Digital family tree and heritage preservation platform',
        'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Lagos',
            'addressCountry': 'NG',
        },
        'email': 'support@famtree.com',
        'url': 'https://famtree.com',
        'contactPoint': {
            '@type': 'ContactPoint',
            'contactType': 'Customer Service',
            'email': 'support@famtree.com',
            'availableLanguage': ['en'],
        },
    };

    return (
        <GuestLayout>
            <Head
                title="Contact FamTree - Get In Touch"
                meta={[
                    {
                        name: 'description',
                        content: 'Have questions about FamTree? Contact our team. We\'re here to help you preserve your family legacy.',
                    },
                    {
                        name: 'canonical',
                        content: 'https://famtree.com/contact',
                    },
                ]}
            >
                <script type="application/ld+json">
                    {JSON.stringify(localBusinessSchema)}
                </script>
            </Head>

            {/* Hero Section */}
            <section className="contact-hero">
                <div className="hero-bg"></div>
                <div className="hero-content">
                    <h1>Get In Touch</h1>
                    <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="contact-section">
                <div className="contact-wrapper">
                    {/* Contact Form */}
                    <div className="contact-form-wrapper">
                        <h2>Send us a Message</h2>

                        {submitted && (
                            <div className="success-message">
                                ✓ Thank you! Your message has been sent successfully. We'll get back to you soon.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Your full name"
                                    className={errors.name ? 'error' : ''}
                                />
                                {errors.name && <span className="error-msg">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="your@email.com"
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-msg">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder="How can we help?"
                                    className={errors.subject ? 'error' : ''}
                                />
                                {errors.subject && <span className="error-msg">{errors.subject}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={6}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Tell us more..."
                                    className={errors.message ? 'error' : ''}
                                ></textarea>
                                {errors.message && <span className="error-msg">{errors.message}</span>}
                            </div>

                            <button type="submit" disabled={processing} className="submit-btn">
                                {processing ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="contact-info-wrapper">
                        <h2>Contact Information</h2>

                        <div className="info-box">
                            <div className="info-icon">✉️</div>
                            <div className="info-content">
                                <h3>Email</h3>
                                <p>
                                    <a href="mailto:support@famtree.com">support@famtree.com</a>
                                </p>
                            </div>
                        </div>

                        <div className="info-box">
                            <div className="info-icon">📍</div>
                            <div className="info-content">
                                <h3>Location</h3>
                                <p>Lagos, Nigeria</p>
                            </div>
                        </div>

                        <div className="info-box">
                            <div className="info-icon">🕐</div>
                            <div className="info-content">
                                <h3>Office Hours</h3>
                                <p>Monday - Friday: 9AM - 5PM WAT</p>
                            </div>
                        </div>

                        <div className="social-links">
                            <h3>Follow Us</h3>
                            <div className="social-icons">
                                <a href="#" className="social-icon">𝕏</a>
                                <a href="#" className="social-icon">f</a>
                                <a href="#" className="social-icon">in</a>
                                <a href="#" className="social-icon">📷</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .contact-hero {
                    position: relative;
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0F1F35;
                    overflow: hidden;
                }

                .hero-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, #0F1F35 0%, #1a2f47 100%);
                    opacity: 0.5;
                }

                .hero-content {
                    position: relative;
                    z-index: 2;
                    color: white;
                    text-align: center;
                }

                .hero-content h1 {
                    font-size: 2.5rem;
                    margin: 0 0 16px;
                    font-weight: 700;
                }

                .hero-content p {
                    font-size: 1.1rem;
                    margin: 0;
                    opacity: 0.9;
                }

                .contact-section {
                    padding: 60px 20px;
                    background: #f5f5f5;
                }

                .contact-wrapper {
                    max-width: 1100px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                }

                .contact-form-wrapper h2,
                .contact-info-wrapper h2 {
                    font-size: 1.8rem;
                    margin: 0 0 32px;
                    color: #0F1F35;
                }

                .contact-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-weight: 600;
                    color: #0F1F35;
                    font-size: 0.95rem;
                }

                .form-group input,
                .form-group textarea {
                    padding: 12px 16px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-family: inherit;
                    transition: all 0.3s ease;
                    background: white;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #D4A574;
                    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
                }

                .form-group input.error,
                .form-group textarea.error {
                    border-color: #e74c3c;
                }

                .error-msg {
                    color: #e74c3c;
                    font-size: 0.85rem;
                }

                .success-message {
                    background: #d4edda;
                    color: #155724;
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                    font-weight: 600;
                }

                .submit-btn {
                    padding: 14px 32px;
                    background: #D4A574;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 12px;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(212, 165, 116, 0.3);
                }

                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .contact-info-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .info-box {
                    background: white;
                    padding: 24px;
                    border-radius: 12px;
                    display: flex;
                    gap: 16px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    transition: all 0.3s ease;
                }

                .info-box:hover {
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
                    transform: translateY(-2px);
                }

                .info-icon {
                    font-size: 2rem;
                    display: flex;
                    align-items: center;
                }

                .info-content h3 {
                    margin: 0 0 8px;
                    color: #0F1F35;
                    font-size: 1.1rem;
                }

                .info-content p {
                    margin: 0;
                    color: #666;
                    font-size: 0.95rem;
                }

                .info-content a {
                    color: #D4A574;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.3s ease;
                }

                .info-content a:hover {
                    color: #0F1F35;
                }

                .social-links {
                    background: white;
                    padding: 24px;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }

                .social-links h3 {
                    margin: 0 0 16px;
                    color: #0F1F35;
                    font-size: 1.1rem;
                }

                .social-icons {
                    display: flex;
                    gap: 12px;
                }

                .social-icon {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f5f5f5;
                    border-radius: 8px;
                    color: #0F1F35;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .social-icon:hover {
                    background: #D4A574;
                    color: white;
                    transform: translateY(-2px);
                }

                @media (max-width: 768px) {
                    .hero-content h1 {
                        font-size: 1.8rem;
                    }

                    .contact-wrapper {
                        grid-template-columns: 1fr;
                        gap: 32px;
                    }

                    .contact-form-wrapper h2,
                    .contact-info-wrapper h2 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </GuestLayout>
    );
}
