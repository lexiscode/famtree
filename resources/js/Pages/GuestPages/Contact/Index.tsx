import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import HomeHeader from '@/Components/Navigation/HomeHeader';
import FloatingNavDock from '@/Components/Navigation/FloatingNavDock';
import FloatingSocialDock from '@/Components/Navigation/FloatingSocialDock';
import ContactModal from './components/ContactModal';
import './ContactNew.css';

export default function Contact() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [submitted, setSubmitted] = useState(false);

    const contactCards = [
        {
            id: 'send-message',
            icon: 'bi-send-fill',
            title: 'Send Message',
            subtitle: 'Reach out to us',
            color: '#FFD700',
        },
        {
            id: 'contact-info',
            icon: 'bi-info-circle-fill',
            title: 'Contact Info',
            subtitle: 'Get in touch',
            color: '#FF6B00',
        },
        {
            id: 'faqs',
            icon: 'bi-question-circle-fill',
            title: 'FAQs',
            subtitle: 'Quick answers',
            color: '#FFD700',
        },
        {
            id: 'support',
            icon: 'bi-headset',
            title: 'Support Center',
            subtitle: 'Help resources',
            color: '#FF6B00',
        },
    ];

    const modalContent = {
        'contact-info': {
            title: 'Contact Information',
            type: 'info' as const,
            content: (
                <div className="contact-info-content">
                    <div className="info-item">
                        <div className="info-icon-wrapper">
                            <i className="bi-envelope-fill"></i>
                        </div>
                        <div className="info-text">
                            <h3>Email</h3>
                            <p>
                                <a href="mailto:support@famtree.com">support@famtree.com</a>
                            </p>
                            <span className="info-note">We typically respond within 24 hours</span>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-icon-wrapper">
                            <i className="bi-geo-alt-fill"></i>
                        </div>
                        <div className="info-text">
                            <h3>Location</h3>
                            <p>Lagos, Nigeria</p>
                            <span className="info-note">Serving families worldwide</span>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-icon-wrapper">
                            <i className="bi-clock-fill"></i>
                        </div>
                        <div className="info-text">
                            <h3>Office Hours</h3>
                            <p>Monday - Friday: 9AM - 5PM WAT</p>
                            <span className="info-note">Weekend support available for urgent matters</span>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-icon-wrapper">
                            <i className="bi-chat-dots-fill"></i>
                        </div>
                        <div className="info-text">
                            <h3>Live Chat</h3>
                            <p>Available during business hours</p>
                            <span className="info-note">Get instant answers to your questions</span>
                        </div>
                    </div>

                    <div className="social-section">
                        <h3>Connect With Us</h3>
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Facebook">
                                <i className="bi-facebook"></i>
                                <span>Facebook</span>
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <i className="bi-instagram"></i>
                                <span>Instagram</span>
                            </a>
                            <a href="#" className="social-link" aria-label="Twitter">
                                <i className="bi-twitter"></i>
                                <span>Twitter</span>
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <i className="bi-linkedin"></i>
                                <span>LinkedIn</span>
                            </a>
                        </div>
                    </div>
                </div>
            ),
        },
        faqs: {
            title: 'Frequently Asked Questions',
            type: 'info' as const,
            content: (
                <div className="faq-content">
                    <div className="faq-item">
                        <h3>
                            <i className="bi-patch-question-fill"></i>
                            How do I get started with FamTree?
                        </h3>
                        <p>
                            Simply click the "Sign Up" button, create your account, and start building your family tree.
                            Our intuitive interface guides you through every step of the process.
                        </p>
                    </div>

                    <div className="faq-item">
                        <h3>
                            <i className="bi-patch-question-fill"></i>
                            Is my family data secure?
                        </h3>
                        <p>
                            Absolutely! We use enterprise-grade encryption and security measures to protect your family's
                            information. Your data is backed up regularly and stored securely in the cloud.
                        </p>
                    </div>

                    <div className="faq-item">
                        <h3>
                            <i className="bi-patch-question-fill"></i>
                            Can I invite family members?
                        </h3>
                        <p>
                            Yes! You can invite unlimited family members to view and contribute to your family tree.
                            Each member can have different access levels based on your privacy settings.
                        </p>
                    </div>

                    <div className="faq-item">
                        <h3>
                            <i className="bi-patch-question-fill"></i>
                            What file formats can I upload?
                        </h3>
                        <p>
                            We support various formats including images (JPG, PNG, GIF), videos (MP4, MOV), and documents
                            (PDF, DOC, DOCX). Maximum file size is 50MB per upload.
                        </p>
                    </div>

                    <div className="faq-item">
                        <h3>
                            <i className="bi-patch-question-fill"></i>
                            Is there a mobile app?
                        </h3>
                        <p>
                            Our platform is fully responsive and works great on all devices. A dedicated mobile app
                            is currently in development and will be available soon on iOS and Android.
                        </p>
                    </div>

                    <div className="faq-item">
                        <h3>
                            <i className="bi-patch-question-fill"></i>
                            How do I export my family tree?
                        </h3>
                        <p>
                            You can export your family tree as a PDF, GEDCOM file, or generate a beautiful family book.
                            Go to Settings → Export to access these options.
                        </p>
                    </div>
                </div>
            ),
        },
        support: {
            title: 'Support Center',
            type: 'info' as const,
            content: (
                <div className="support-content">
                    <div className="support-item">
                        <div className="support-icon">
                            <i className="bi-book-fill"></i>
                        </div>
                        <h3>Documentation</h3>
                        <p>Comprehensive guides and tutorials to help you make the most of FamTree.</p>
                        <a href="#" className="support-link">
                            View Documentation <i className="bi-arrow-right"></i>
                        </a>
                    </div>

                    <div className="support-item">
                        <div className="support-icon">
                            <i className="bi-play-circle-fill"></i>
                        </div>
                        <h3>Video Tutorials</h3>
                        <p>Watch step-by-step video guides on using FamTree features.</p>
                        <a href="#" className="support-link">
                            Watch Tutorials <i className="bi-arrow-right"></i>
                        </a>
                    </div>

                    <div className="support-item">
                        <div className="support-icon">
                            <i className="bi-people-fill"></i>
                        </div>
                        <h3>Community Forum</h3>
                        <p>Connect with other users, share tips, and get advice from the community.</p>
                        <a href="#" className="support-link">
                            Join Community <i className="bi-arrow-right"></i>
                        </a>
                    </div>

                    <div className="support-item">
                        <div className="support-icon">
                            <i className="bi-lightbulb-fill"></i>
                        </div>
                        <h3>Feature Requests</h3>
                        <p>Have an idea? Submit feature requests and vote on upcoming features.</p>
                        <a href="#" className="support-link">
                            Submit Request <i className="bi-arrow-right"></i>
                        </a>
                    </div>

                    <div className="support-item">
                        <div className="support-icon">
                            <i className="bi-bug-fill"></i>
                        </div>
                        <h3>Report an Issue</h3>
                        <p>Found a bug? Let us know so we can fix it quickly.</p>
                        <a href="#" className="support-link">
                            Report Issue <i className="bi-arrow-right"></i>
                        </a>
                    </div>

                    <div className="support-item">
                        <div className="support-icon">
                            <i className="bi-telephone-fill"></i>
                        </div>
                        <h3>Priority Support</h3>
                        <p>Premium users get access to priority email and phone support.</p>
                        <a href="#" className="support-link">
                            Learn More <i className="bi-arrow-right"></i>
                        </a>
                    </div>
                </div>
            ),
        },
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
        <GuestLayout hideFooter hideNavigation>
            <Head
                title="Contact FamTree - Get In Touch With Our Team"
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

            <HomeHeader />
            <FloatingNavDock />
            <FloatingSocialDock />

            <section className="contact-hero">
                <div className="contact-hero-content">
                    <div className="hero-badge">
                        <i className="bi-envelope-fill"></i>
                        <span>Contact Us</span>
                    </div>

                    <h1 className="contact-title">
                        We're Here to
                        <span className="gradient-text"> Help You</span>
                    </h1>

                    <p className="contact-description">
                        Have questions or need assistance? Choose how you'd like to reach out.
                        Our team is ready to support you in preserving your family's legacy.
                    </p>

                    <div className="contact-cards">
                        {contactCards.map((card, index) => (
                            <div
                                key={card.id}
                                className="contact-card"
                                onClick={() => setOpenModal(card.id)}
                                style={{
                                    '--card-color': card.color,
                                    animationDelay: `${index * 0.1}s`,
                                } as React.CSSProperties}
                            >
                                <div className="card-icon">
                                    <i className={card.icon}></i>
                                </div>
                                <h3>{card.title}</h3>
                                <p>{card.subtitle}</p>
                                <div className="card-arrow">
                                    <i className="bi-arrow-right"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Background decoration */}
                <div className="contact-background">
                    <div className="bg-shape shape-1"></div>
                    <div className="bg-shape shape-2"></div>
                    <div className="bg-shape shape-3"></div>
                </div>
            </section>

            {/* Contact Modals */}
            {openModal && (
                <ContactModal
                    isOpen={true}
                    onClose={() => {
                        setOpenModal(null);
                        setSubmitted(false);
                    }}
                    title={openModal === 'send-message' ? 'Send us a Message' : modalContent[openModal as keyof typeof modalContent]?.title}
                    type={openModal === 'send-message' ? 'form' : modalContent[openModal as keyof typeof modalContent]?.type}
                    content={openModal === 'send-message' ? undefined : modalContent[openModal as keyof typeof modalContent]?.content}
                    formData={openModal === 'send-message' ? { data, setData, post, processing, errors, submitted, setSubmitted, reset } : undefined}
                />
            )}
        </GuestLayout>
    );
}
